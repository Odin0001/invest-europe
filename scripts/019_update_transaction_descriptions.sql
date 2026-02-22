-- Update deposit descriptions
UPDATE transactions 
SET description = 'Deposit of $' || TRIM(TRAILING '0' FROM TRIM(TRAILING '.' FROM amount::text)) || ' to your balance'
WHERE type = 'deposit';

-- Update withdrawal descriptions  
UPDATE transactions 
SET description = 'Withdrew $' || TRIM(TRAILING '0' FROM TRIM(TRAILING '.' FROM amount::text)) || ' from your balance'
WHERE type = 'withdrawal';

-- daily_return descriptions are left unchanged
