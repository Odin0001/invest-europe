-- Drop the faulty script's tables if they exist
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.platform_wallets CASCADE;

-- Add wallet addresses for platform
CREATE TABLE IF NOT EXISTS public.platform_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_method TEXT NOT NULL UNIQUE CHECK (payment_method IN ('USDT_TRC20', 'BTC', 'ETH')),
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default wallet addresses (admin should update these)
INSERT INTO public.platform_wallets (payment_method, wallet_address) VALUES
('USDT_TRC20', 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx'),
('BTC', '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx'),
('ETH', '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx')
ON CONFLICT (payment_method) DO NOTHING;

-- Enable RLS
ALTER TABLE public.platform_wallets ENABLE ROW LEVEL SECURITY;

-- Everyone can read wallet addresses
CREATE POLICY "Anyone can view platform wallets" ON public.platform_wallets
FOR SELECT USING (true);

-- Fixed admin check to use is_admin instead of role
-- Only admins can update wallet addresses
CREATE POLICY "Admins can update platform wallets" ON public.platform_wallets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Chat messages table for investment communication
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Fixed admin check to use is_admin instead of role
-- Users can view messages for their investments or admins can view all
CREATE POLICY "Users can view their investment chats" ON public.chat_messages
FOR SELECT USING (
  investment_id IN (
    SELECT id FROM public.investments WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  )
);

-- Users can send messages for their investments or admins can send to any
CREATE POLICY "Users can send messages for their investments" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    investment_id IN (
      SELECT id FROM public.investments WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    )
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_investment_id ON public.chat_messages(investment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Add payment method and proof URL to investments table
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('USDT_TRC20', 'BTC', 'ETH'));
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
