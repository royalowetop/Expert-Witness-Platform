/*
  # Add Contact Status to Experts

  1. Changes
    - Add `contact_status` column to experts table (green/yellow/red)
    - Add `contact_email` column for official contact email
    - Add `contact_phone` column for official contact phone
    - Add `linkedin_url` column for LinkedIn profile
    - Add `profile_url` column for other professional profiles
    - Add `last_contact_check` timestamp for tracking when contact info was last verified

  2. Notes
    - Green: Official contact info found (email or phone available)
    - Yellow: LinkedIn/Profile found (needs manual outreach)
    - Red: Profile found but no direct contact path
    - Default to 'red' for existing experts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'contact_status'
  ) THEN
    ALTER TABLE experts ADD COLUMN contact_status text DEFAULT 'red' CHECK (contact_status IN ('green', 'yellow', 'red'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE experts ADD COLUMN contact_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE experts ADD COLUMN contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE experts ADD COLUMN linkedin_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'profile_url'
  ) THEN
    ALTER TABLE experts ADD COLUMN profile_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experts' AND column_name = 'last_contact_check'
  ) THEN
    ALTER TABLE experts ADD COLUMN last_contact_check timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_experts_contact_status ON experts(contact_status);