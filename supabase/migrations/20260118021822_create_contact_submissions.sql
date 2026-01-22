/*
  # Create contact form submissions table

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `name` (text) - Name of the person submitting the form
      - `email` (text) - Email address of the submitter
      - `subject` (text) - Subject of the contact inquiry
      - `message` (text) - Message content
      - `created_at` (timestamptz) - Timestamp of submission
      - `status` (text) - Status of the submission (new, in_progress, resolved)
      - `admin_notes` (text, nullable) - Notes added by admin
  
  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy for anyone to insert (public form submission)
    - Add policy for authenticated admin users to view all submissions
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'new' NOT NULL,
  admin_notes text
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a contact form (no auth required for public contact form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can view all submissions (for admin panel)
CREATE POLICY "Authenticated users can view all submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update submissions (for admin to change status/add notes)
CREATE POLICY "Authenticated users can update submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);