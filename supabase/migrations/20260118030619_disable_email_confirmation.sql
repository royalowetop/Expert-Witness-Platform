/*
  # Disable Email Confirmation

  1. Changes
    - Creates a trigger to automatically confirm user emails on signup
    - This effectively disables the email confirmation requirement
  
  2. Security Notes
    - In production, you should enable email confirmation
    - This is for development/testing purposes only
*/

-- Function to auto-confirm user emails
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();
