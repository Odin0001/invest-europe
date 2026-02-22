-- Delete all data for non-admin users (cascade delete)

-- Delete chat messages from regular users
DELETE FROM chat_messages WHERE sender_id IN (
  SELECT id FROM users WHERE is_admin = false
);

-- Delete daily returns for regular users
DELETE FROM daily_returns WHERE user_id IN (
  SELECT id FROM users WHERE is_admin = false
);

-- Delete withdrawals for regular users
DELETE FROM withdrawals WHERE user_id IN (
  SELECT id FROM users WHERE is_admin = false
);

-- Delete transactions for regular users
DELETE FROM transactions WHERE user_id IN (
  SELECT id FROM users WHERE is_admin = false
);

-- Delete investments for regular users
DELETE FROM investments WHERE user_id IN (
  SELECT id FROM users WHERE is_admin = false
);

-- Finally, delete all non-admin users
DELETE FROM users WHERE is_admin = false;

-- Verify deletion
SELECT COUNT(*) as remaining_users, 
       COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count
FROM users;
