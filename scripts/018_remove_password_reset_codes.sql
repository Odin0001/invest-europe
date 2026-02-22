-- Remove the password reset codes table since we're switching to temporary password method
DROP TABLE IF EXISTS password_reset_codes;
