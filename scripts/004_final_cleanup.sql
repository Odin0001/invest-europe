-- Remove all referral-related code from database
DROP TABLE IF EXISTS public.referral_bonuses CASCADE;

-- Update transactions type constraint to remove referral_bonus
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('deposit', 'withdrawal', 'daily_return'));

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

-- Only admins can update wallet addresses
CREATE POLICY "Admins can update platform wallets" ON public.platform_wallets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their investments
CREATE POLICY "Users can view their investment chats" ON public.chat_messages
FOR SELECT USING (
  investment_id IN (
    SELECT id FROM public.investments WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can send messages for their investments
CREATE POLICY "Users can send messages for their investments" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  investment_id IN (
    SELECT id FROM public.investments WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Index for performance
CREATE INDEX idx_chat_messages_investment_id ON public.chat_messages(investment_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
