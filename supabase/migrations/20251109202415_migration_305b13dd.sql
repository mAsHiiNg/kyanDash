-- Add missing columns to tables
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE public.followups ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE public.customer_services ADD COLUMN IF NOT EXISTS service_name TEXT NOT NULL DEFAULT 'Untitled Service';

-- Alter services column in quotations to be a text array
ALTER TABLE public.quotations DROP COLUMN IF EXISTS services;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS services TEXT[] NOT NULL DEFAULT '{}';