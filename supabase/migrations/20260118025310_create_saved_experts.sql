/*
  # Create Saved Experts System

  1. New Tables
    - `saved_experts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `expert_id` (text, the ID from search results)
      - `expert_data` (jsonb, stores all expert information)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_experts` table
    - Users can view their own saved experts
    - Users can insert their own saved experts
    - Users can delete their own saved experts

  3. Important Notes
    - This table stores expert witnesses saved by users
    - Expert data is stored as JSON since it comes from external API
    - Users can only manage their own saved experts
    - Duplicate saves are prevented with unique constraint
*/

-- Create saved_experts table
CREATE TABLE IF NOT EXISTS saved_experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expert_id text NOT NULL,
  expert_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_experts ENABLE ROW LEVEL SECURITY;

-- Create unique constraint to prevent duplicate saves
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_experts_user_expert 
  ON saved_experts(user_id, expert_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_experts_user_id ON saved_experts(user_id);

-- RLS Policies for saved_experts table
CREATE POLICY "Users can view own saved experts"
  ON saved_experts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved experts"
  ON saved_experts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved experts"
  ON saved_experts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
