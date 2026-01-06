-- Make investment_id nullable in chat_messages table
ALTER TABLE chat_messages 
ALTER COLUMN investment_id DROP NOT NULL;
