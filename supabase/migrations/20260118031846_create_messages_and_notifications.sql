/*
  # Create Messages and Notifications System

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references auth.users)
      - `receiver_id` (uuid, references auth.users)
      - `subject` (text)
      - `content` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamptz)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - notification type (e.g., 'message', 'expert_response', etc.)
      - `title` (text)
      - `message` (text)
      - `link` (text, optional) - where to redirect when clicked
      - `read` (boolean, default false)
      - `created_at` (timestamptz)
      - `related_id` (uuid, optional) - reference to related entity (e.g., message_id)

  2. Security
    - Enable RLS on both tables
    - Users can only view their own messages and notifications
    - Users can only send messages (insert into messages table)
    - Users can mark their own notifications as read

  3. Functions
    - Trigger to create notification when message is received
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  related_id uuid
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can mark received messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to create notification when message is received
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
BEGIN
  -- Get sender's name from user_profiles
  SELECT full_name INTO sender_name
  FROM user_profiles
  WHERE user_id = NEW.sender_id;

  -- Create notification for receiver
  INSERT INTO notifications (user_id, type, title, message, link, related_id)
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message from ' || COALESCE(sender_name, 'a user'),
    LEFT(NEW.subject, 100),
    '/dashboard?tab=messages&message_id=' || NEW.id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when new message is inserted
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read, created_at DESC);
