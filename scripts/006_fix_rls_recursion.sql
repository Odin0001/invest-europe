-- The root cause: RLS policies on users table that query the users table create infinite recursion
-- Solution: Temporarily disable RLS on users table or use SECURITY DEFINER function

-- Drop ALL existing policies on all tables to start fresh
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update other users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Disable RLS on users table temporarily (we'll use app-level security)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Or alternative: Create simple policies without recursion
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Simple policy: users can update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- For investments table - fix policies
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can update all investments" ON public.investments;

CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id);

-- For daily_returns table
DROP POLICY IF EXISTS "Users can view own returns" ON public.daily_returns;
DROP POLICY IF EXISTS "Admins can view all daily returns" ON public.daily_returns;
DROP POLICY IF EXISTS "Admins can insert daily returns" ON public.daily_returns;
DROP POLICY IF EXISTS "Admins can update daily returns" ON public.daily_returns;

CREATE POLICY "Users can view own returns" ON public.daily_returns
  FOR SELECT USING (auth.uid() = user_id);

-- For withdrawals table
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can update all withdrawals" ON public.withdrawals;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- For transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- For chat_messages - simplified
DROP POLICY IF EXISTS "Users can view their investment chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages for their investments" ON public.chat_messages;

CREATE POLICY "Users can view chats for their investments" ON public.chat_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    investment_id IN (
      SELECT id FROM public.investments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
