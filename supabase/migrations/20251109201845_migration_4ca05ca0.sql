-- Add country column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS country TEXT;