-- Fix RLS policy to allow admins to see all chat messages
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view chats for their investments" ON chat_messages;

-- Create new policy that allows:
-- 1. Users to see their own messages
-- 2. Users to see messages related to their investments
-- 3. Admins to see ALL messages
CREATE POLICY "Users and admins can view chats"
ON chat_messages
FOR SELECT
USING (
  -- User is the sender
  sender_id = auth.uid()
  OR
  -- Message is related to user's investment
  investment_id IN (
    SELECT id FROM investments WHERE user_id = auth.uid()
  )
  OR
  -- User is an admin (can see all messages)
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  )
);

-- Also update the INSERT policy to allow admins to send messages on behalf of support
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;

CREATE POLICY "Users and admins can send messages"
ON chat_messages
FOR INSERT
WITH CHECK (
  -- User is sending as themselves
  sender_id = auth.uid()
);
