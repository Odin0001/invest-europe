-- Add payment_method column to withdrawals table
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN withdrawals.payment_method IS 'The cryptocurrency payment method chosen by the user (ERC20, TRX, SOL, USDT_BEP20, USDT_TRC20)';
