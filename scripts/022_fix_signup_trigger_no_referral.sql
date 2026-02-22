-- Fix the handle_new_user trigger to work without referral codes
-- This removes all referral code logic that was causing signup failures

-- First, make referral_code column nullable and remove unique constraint
ALTER TABLE public.users ALTER COLUMN referral_code DROP NOT NULL;
DROP INDEX IF EXISTS users_referral_code_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;

-- Drop the old generate_referral_code function if it exists
DROP FUNCTION IF EXISTS generate_referral_code();

-- Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create new simplified handle_new_user function without referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    full_name, 
    wallet_address,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULL,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
