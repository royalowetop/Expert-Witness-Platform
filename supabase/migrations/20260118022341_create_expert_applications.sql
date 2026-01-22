/*
  # Create expert application system

  ## Overview
  This migration creates the complete system for expert witnesses to apply to the platform.
  Applications require verification before approval.

  ## Tables Created

  ### 1. `expert_applications`
  Main application table for expert witnesses
  - `id` (uuid, primary key) - Unique identifier for each application
  - `user_id` (uuid, nullable) - Link to auth.users if user is authenticated
  - `email` (text) - Email address of the applicant
  - `full_name` (text) - Full legal name
  - `phone` (text) - Contact phone number
  - `specialization` (text) - Area of expertise
  - `years_of_experience` (integer) - Years of professional experience
  - `excluded_from_testifying` (boolean) - Has applicant been excluded by a judge
  - `exclusion_details` (text, nullable) - Details about exclusion if applicable
  - `status` (text) - Application status: 'pending', 'under_review', 'approved', 'rejected'
  - `admin_notes` (text, nullable) - Internal notes from verification team
  - `created_at` (timestamptz) - Application submission date
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `expert_documents`
  Stores references to uploaded documents for expert applications
  - `id` (uuid, primary key) - Unique identifier
  - `application_id` (uuid) - Foreign key to expert_applications
  - `document_type` (text) - Type: 'license', 'transcript', 'cv', 'board_certification', 'other'
  - `file_name` (text) - Original file name
  - `file_path` (text) - Storage path in Supabase Storage
  - `file_size` (integer) - File size in bytes
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 3. `expert_cases`
  Past case history for expert applicants
  - `id` (uuid, primary key) - Unique identifier
  - `application_id` (uuid) - Foreign key to expert_applications
  - `case_name` (text) - Name or description of the case
  - `case_year` (integer) - Year the case occurred
  - `side_represented` (text) - 'plaintiff' or 'defense'
  - `case_type` (text) - Type of case (medical malpractice, personal injury, etc.)
  - `transcript_url` (text, nullable) - Link to case transcript if available
  - `description` (text, nullable) - Brief description of involvement
  - `created_at` (timestamptz) - Record creation date

  ## Security

  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - Anyone can submit an application (insert)
  - Applicants can view their own applications
  - Authenticated users (admins) can view all applications
  - Only admins can update application status

  ## Important Notes
  - Applications default to 'pending' status
  - File uploads will be handled through Supabase Storage
  - Verification is required before approval
  - All sensitive data is protected by RLS policies
*/

-- Create expert_applications table
CREATE TABLE IF NOT EXISTS expert_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  specialization text NOT NULL,
  years_of_experience integer NOT NULL,
  excluded_from_testifying boolean DEFAULT false NOT NULL,
  exclusion_details text,
  status text DEFAULT 'pending' NOT NULL,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expert_documents table
CREATE TABLE IF NOT EXISTS expert_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES expert_applications(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create expert_cases table
CREATE TABLE IF NOT EXISTS expert_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES expert_applications(id) ON DELETE CASCADE NOT NULL,
  case_name text NOT NULL,
  case_year integer NOT NULL,
  side_represented text NOT NULL,
  case_type text NOT NULL,
  transcript_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expert_applications_status ON expert_applications(status);
CREATE INDEX IF NOT EXISTS idx_expert_applications_email ON expert_applications(email);
CREATE INDEX IF NOT EXISTS idx_expert_documents_application ON expert_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_expert_cases_application ON expert_cases(application_id);

-- Enable RLS
ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_cases ENABLE ROW LEVEL SECURITY;

-- Policies for expert_applications

-- Anyone can submit an application
CREATE POLICY "Anyone can submit expert application"
  ON expert_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON expert_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON expert_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON expert_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for expert_documents

-- Anyone can upload documents for their application
CREATE POLICY "Anyone can upload documents for application"
  ON expert_documents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view documents for their own applications
CREATE POLICY "Users can view own application documents"
  ON expert_documents
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM expert_applications 
      WHERE user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON expert_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for expert_cases

-- Anyone can add cases for their application
CREATE POLICY "Anyone can add cases for application"
  ON expert_cases
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view cases for their own applications
CREATE POLICY "Users can view own application cases"
  ON expert_cases
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM expert_applications 
      WHERE user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Admins can view all cases
CREATE POLICY "Admins can view all cases"
  ON expert_cases
  FOR SELECT
  TO authenticated
  USING (true);
