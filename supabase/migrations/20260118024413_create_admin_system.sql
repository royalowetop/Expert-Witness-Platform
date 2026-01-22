/*
  # Create Admin System

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, for pre-authorization before signup)
      - `granted_at` (timestamp)
      - `granted_by` (uuid, nullable, references auth.users)

  2. Security
    - Enable RLS on `admin_roles` table
    - Add policies for admin users to manage admin roles
    - Add function to check if user is admin

  3. Functions
    - `is_admin()` - Returns true if current user is admin
    - `auto_grant_admin()` - Trigger function to auto-grant admin on signup

  4. Updates to Existing Tables
    - Update RLS policies on `legal_documents` to require admin
    - Update RLS policies on `contact_submissions` to require admin
    - Update RLS policies on `expert_applications` to require admin

  5. Initial Admin
    - Pre-authorize email: flesh.clip.full@myclkd.email
*/

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(email)
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_email ON admin_roles(email);

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-grant admin role on signup if email is pre-authorized
CREATE OR REPLACE FUNCTION auto_grant_admin()
RETURNS trigger AS $$
BEGIN
  -- Check if user's email is pre-authorized as admin
  IF EXISTS (
    SELECT 1 FROM admin_roles
    WHERE email = NEW.email AND user_id IS NULL
  ) THEN
    -- Update the admin_roles record with the user_id
    UPDATE admin_roles
    SET user_id = NEW.id
    WHERE email = NEW.email AND user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-grant admin on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin();

-- RLS Policies for admin_roles table
CREATE POLICY "Admins can view all admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert admin roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update admin roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admin roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update legal_documents policies to require admin
DROP POLICY IF EXISTS "Admins can view all legal documents" ON legal_documents;
DROP POLICY IF EXISTS "Admins can insert legal documents" ON legal_documents;
DROP POLICY IF EXISTS "Admins can update legal documents" ON legal_documents;
DROP POLICY IF EXISTS "Admins can delete legal documents" ON legal_documents;
DROP POLICY IF EXISTS "Anyone can view active legal documents" ON legal_documents;

CREATE POLICY "Anyone can view active legal documents"
  ON legal_documents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all legal documents"
  ON legal_documents FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert legal documents"
  ON legal_documents FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update legal documents"
  ON legal_documents FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete legal documents"
  ON legal_documents FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update contact_submissions policies to require admin
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON contact_submissions;

CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update expert_applications policies to require admin for management
DROP POLICY IF EXISTS "Users can view own applications" ON expert_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON expert_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON expert_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON expert_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON expert_applications;

CREATE POLICY "Users can create applications"
  ON expert_applications FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND email IS NOT NULL)
  );

CREATE POLICY "Users can view own applications"
  ON expert_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR is_admin()
  );

CREATE POLICY "Admins can view all applications"
  ON expert_applications FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all applications"
  ON expert_applications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete applications"
  ON expert_applications FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update expert_documents policies
DROP POLICY IF EXISTS "Users can view own documents" ON expert_documents;
DROP POLICY IF EXISTS "Users can upload own documents" ON expert_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON expert_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON expert_documents;

CREATE POLICY "Users can view own documents"
  ON expert_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_applications
      WHERE expert_applications.id = expert_documents.application_id
      AND expert_applications.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Users can upload own documents"
  ON expert_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_applications
      WHERE expert_applications.id = expert_documents.application_id
      AND expert_applications.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Admins can view all documents"
  ON expert_documents FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete documents"
  ON expert_documents FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update expert_cases policies
DROP POLICY IF EXISTS "Users can view own cases" ON expert_cases;
DROP POLICY IF EXISTS "Users can create own cases" ON expert_cases;
DROP POLICY IF EXISTS "Admins can view all cases" ON expert_cases;
DROP POLICY IF EXISTS "Admins can update cases" ON expert_cases;
DROP POLICY IF EXISTS "Admins can delete cases" ON expert_cases;

CREATE POLICY "Users can view own cases"
  ON expert_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_applications
      WHERE expert_applications.id = expert_cases.application_id
      AND expert_applications.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Users can create own cases"
  ON expert_cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_applications
      WHERE expert_applications.id = expert_cases.application_id
      AND expert_applications.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Admins can view all cases"
  ON expert_cases FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update cases"
  ON expert_cases FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete cases"
  ON expert_cases FOR DELETE
  TO authenticated
  USING (is_admin());

-- Pre-authorize the specified email as admin
INSERT INTO admin_roles (email, user_id, granted_by)
VALUES ('flesh.clip.full@myclkd.email', NULL, NULL)
ON CONFLICT (email) DO NOTHING;
