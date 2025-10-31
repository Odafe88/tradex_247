-- Add new columns to profiles table for financial tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS balance_crypto DECIMAL(20, 8) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS balance_forex DECIMAL(20, 8) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_profit DECIMAL(20, 8) DEFAULT 0.00;