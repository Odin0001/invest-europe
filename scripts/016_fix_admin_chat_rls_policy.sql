-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view chats for their investments" ON chat_messages;

-- Create new policy that allows admins to see everything and users to see their own
CREATE POLICY "Chat messages access policy" ON chat_messages
  FOR SELECT
  USING (
    -- Admins can see all messages
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
    OR
    -- Regular users can see their own messages
    sender_id = auth.uid()
    OR
    -- Regular users can see messages for their investments
    investment_id IN (
      SELECT id FROM investments 
      WHERE user_id = auth.uid()
    )
  );
