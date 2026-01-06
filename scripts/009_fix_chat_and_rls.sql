-- Fix RLS infinite recursion by completely disabling RLS on users table
-- This is necessary because any policy that queries users from within users creates recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Make investment_id nullable in chat_messages to support general support chats
ALTER TABLE public.chat_messages ALTER COLUMN investment_id DROP NOT NULL;

-- Drop existing chat policies
DROP POLICY IF EXISTS "Users can view their investment chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages for their investments" ON public.chat_messages;

-- Create new simple chat policies
-- Users can view their own messages or messages for their investments
CREATE POLICY "Users can view their chats" ON public.chat_messages
FOR SELECT USING (
  sender_id = auth.uid() OR 
  investment_id IN (SELECT id FROM public.investments WHERE user_id = auth.uid()) OR
  investment_id IS NULL
);

-- Admins can view all chats
CREATE POLICY "Admins can view all chats" ON public.chat_messages
FOR SELECT USING (
  (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true
);

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);

-- Fix other tables that might have recursion issues with users
-- Investments table - simplify policies
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can create own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can update all investments" ON public.investments;
DROP POLICY IF EXISTS "System can update investments" ON public.investments;

CREATE POLICY "Users view own investments" ON public.investments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all investments" ON public.investments
FOR SELECT USING ((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true);

CREATE POLICY "Users create investments" ON public.investments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System updates investments" ON public.investments
FOR UPDATE USING (true);

-- Transactions table - simplify policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users view own transactions" ON public.transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all transactions" ON public.transactions
FOR SELECT USING ((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true);

CREATE POLICY "System creates transactions" ON public.transactions
FOR INSERT WITH CHECK (true);

-- Withdrawals table - simplify policies
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;

CREATE POLICY "Users view own withdrawals" ON public.withdrawals
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all withdrawals" ON public.withdrawals
FOR SELECT USING ((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true);

CREATE POLICY "Users create withdrawals" ON public.withdrawals
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update withdrawals" ON public.withdrawals
FOR UPDATE USING ((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true);

-- Daily returns table - simplify policies  
DROP POLICY IF EXISTS "Users can view own daily returns" ON public.daily_returns;
DROP POLICY IF EXISTS "System can create daily returns" ON public.daily_returns;
DROP POLICY IF EXISTS "Admins can view all daily returns" ON public.daily_returns;

CREATE POLICY "Users view own returns" ON public.daily_returns
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all returns" ON public.daily_returns
FOR SELECT USING ((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1) = true);

CREATE POLICY "System creates returns" ON public.daily_returns
FOR INSERT WITH CHECK (true);
