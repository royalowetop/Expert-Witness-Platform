/*
  # Update User Profile Creation Trigger

  1. Changes
    - Update the create_user_profile function to extract full_name, firm_name, and practice_area from user metadata
    - This ensures profile data is correctly populated from signup data

  2. Important Notes
    - This migration updates the existing trigger function
    - Profile data will be populated from raw_user_meta_data when users sign up
*/

-- Update function to extract more metadata fields
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, firm_name, practice_area)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'firm_name',
    NEW.raw_user_meta_data->>'practice_area'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
