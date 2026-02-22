-- Remove referral-related columns and tables
ALTER TABLE public.users DROP COLUMN IF EXISTS referral_code;
ALTER TABLE public.users DROP COLUMN IF EXISTS referred_by;
ALTER TABLE public.users DROP COLUMN IF EXISTS phone;

-- Add crypto payment method to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_crypto_method TEXT DEFAULT 'USDT_TRC20' CHECK (preferred_crypto_method IN ('USDT_TRC20', 'BTC', 'ETH'));

-- Drop referral bonuses table
DROP TABLE IF EXISTS public.referral_bonuses CASCADE;

-- Create chat messages table for user-admin communication
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  screenshot_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment proof to investments table
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('USDT_TRC20', 'BTC', 'ETH'));
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE;

-- Update daily_return column to be variable (store actual percentage, not fixed)
-- This allows admin to set different return rates per day

-- Enable RLS on chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    EXISTS (SELECT 1 FROM public.investments WHERE id = investment_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can create chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- Update handle_new_user function to remove referral logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user profile without referral code
  INSERT INTO public.users (
    id, 
    full_name, 
    wallet_address,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'wallet_address', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create index for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_investment_id ON public.chat_messages(investment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
