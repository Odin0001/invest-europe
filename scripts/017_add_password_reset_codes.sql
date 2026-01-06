-- Add password reset codes table
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);

-- Enable RLS
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for requesting reset codes)
CREATE POLICY "Anyone can request reset codes" ON password_reset_codes
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own codes
CREATE POLICY "Users can read their own codes" ON password_reset_codes
  FOR SELECT USING (user_id = auth.uid());
