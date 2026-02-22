-- Fix the handle_new_user function to use NULL instead of empty string for wallet_address
-- This prevents unique constraint violations when multiple users sign up without wallet addresses

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  ref_user_id UUID;
  wallet_addr TEXT;
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

  -- Handle wallet_address - use NULL if empty or not provided
  wallet_addr := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'wallet_address', '')), '');

  -- Insert user profile
  INSERT INTO public.users (
    id, 
    full_name, 
    phone, 
    wallet_address, 
    referral_code,
    referred_by,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    wallet_addr,
    ref_code,
    ref_user_id,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Also fix existing users with empty wallet_address to be NULL
UPDATE public.users SET wallet_address = NULL WHERE wallet_address = '';
