-- Add expiry_date column to card_deposits
ALTER TABLE public.card_deposits
ADD COLUMN IF NOT EXISTS expiry_date TEXT;


