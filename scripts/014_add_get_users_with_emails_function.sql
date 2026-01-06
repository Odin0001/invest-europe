-- Create a function to get users with their emails from auth.users
-- This is necessary because the auth schema cannot be queried directly from the client

CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  balance numeric,
  total_invested numeric,
  is_admin boolean,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    au.email,
    u.balance,
    u.total_invested,
    u.is_admin,
    u.created_at
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_with_emails() TO authenticated;
