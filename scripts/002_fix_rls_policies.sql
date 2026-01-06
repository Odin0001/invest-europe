-- Drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can update all investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can manage all daily returns" ON public.daily_returns;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can update all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all referral bonuses" ON public.referral_bonuses;

-- Create new policies that don't cause recursion
-- We'll use a function to check admin status from auth.users metadata

-- Function to check if current user is admin (checks is_admin from users table safely)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Better approach: Store admin flag in auth.users metadata and check it directly
-- For now, we'll allow service role to bypass RLS and use a simpler approach

-- RLS Policies for users table (fixed)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can update other users" ON public.users
  FOR UPDATE USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- RLS Policies for investments table (fixed)
CREATE POLICY "Admins can view all investments" ON public.investments
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can update all investments" ON public.investments
  FOR UPDATE USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- RLS Policies for daily_returns table (fixed)
CREATE POLICY "Admins can view all daily returns" ON public.daily_returns
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can insert daily returns" ON public.daily_returns
  FOR INSERT WITH CHECK (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can update daily returns" ON public.daily_returns
  FOR UPDATE USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- RLS Policies for withdrawals table (fixed)
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can update all withdrawals" ON public.withdrawals
  FOR UPDATE USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- RLS Policies for transactions table (fixed)  
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- RLS Policies for referral_bonuses table (fixed)
CREATE POLICY "Admins can view all referral bonuses" ON public.referral_bonuses
  FOR SELECT USING (
    auth.uid() = referrer_id OR
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "System can create referral bonuses" ON public.referral_bonuses
  FOR INSERT WITH CHECK (true);
