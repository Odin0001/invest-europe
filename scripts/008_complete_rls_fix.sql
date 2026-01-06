-- COMPLETE FIX FOR INFINITE RECURSION IN RLS POLICIES
-- This script completely removes all problematic RLS policies and recreates them properly

-- Step 1: Disable RLS temporarily to avoid conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "System can create user profiles" ON users;
DROP POLICY IF EXISTS "Enable read for own data" ON users;
DROP POLICY IF EXISTS "Enable update for own data" ON users;

DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can create own investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Admins can update investments" ON investments;
DROP POLICY IF EXISTS "Enable read for own investments" ON investments;

DROP POLICY IF EXISTS "Users can view own returns" ON daily_returns;
DROP POLICY IF EXISTS "System can create returns" ON daily_returns;
DROP POLICY IF EXISTS "Enable read for own returns" ON daily_returns;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Enable read for own withdrawals" ON withdrawals;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
DROP POLICY IF EXISTS "Enable read for own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view related chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Enable read for related messages" ON chat_messages;

DROP POLICY IF EXISTS "Anyone can view settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON platform_settings;

-- Step 3: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create NEW simple policies that don't cause recursion

-- USERS table - Simple policies using only auth.uid()
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- INVESTMENTS table
CREATE POLICY "investments_select_own" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "investments_insert_own" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_update_own" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

-- DAILY RETURNS table
CREATE POLICY "daily_returns_select_own" ON daily_returns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investments 
      WHERE investments.id = daily_returns.investment_id 
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "daily_returns_insert" ON daily_returns
  FOR INSERT WITH CHECK (true);

-- WITHDRAWALS table
CREATE POLICY "withdrawals_select_own" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "withdrawals_insert_own" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "withdrawals_update_own" ON withdrawals
  FOR UPDATE USING (auth.uid() = user_id);

-- TRANSACTIONS table
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (true);

-- CHAT MESSAGES table
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM investments 
      WHERE investments.id = chat_messages.investment_id 
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- PLATFORM SETTINGS table
CREATE POLICY "platform_settings_select" ON platform_settings
  FOR SELECT USING (true);

CREATE POLICY "platform_settings_update" ON platform_settings
  FOR UPDATE USING (true);

CREATE POLICY "platform_settings_insert" ON platform_settings
  FOR INSERT WITH CHECK (true);
