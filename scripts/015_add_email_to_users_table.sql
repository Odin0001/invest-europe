-- Add email column to public.users table so we don't need to join with auth.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email searches
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Populate existing users with their emails from auth.users
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND u.email IS NULL;

-- Update the handle_new_user trigger to also save email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  ref_user_id UUID;
BEGIN
  -- Generate unique referral code
  LOOP
    ref_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = ref_code);
  END LOOP;

  -- Get referred_by user if referral code was provided
  ref_user_id := NULL;
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO ref_user_id 
    FROM public.users 
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;

  -- Insert user profile with email
  INSERT INTO public.users (
    id, 
    full_name, 
    email,
    phone, 
    wallet_address, 
    referral_code,
    referred_by,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'wallet_address', ''),
    ref_code,
    ref_user_id,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
