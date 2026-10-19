-- ==============================================================================
-- SUNVILOZ CLEAN CARE — SUPABASE PRODUCTION DATABASE SCHEMA & RLS SECURITY
-- Migration: 20261017_production_leads_security.sql
-- Purpose: Provision leads table, incomplete lead tracking, and harden Row Level Security (RLS)
-- ==============================================================================

-- 1. Create leads table if not already created
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    area TEXT NOT NULL DEFAULT 'Dhaka',
    house_number TEXT,
    road_number TEXT,
    thana TEXT,
    postcode TEXT,
    landmark TEXT,
    address TEXT,
    service_type TEXT NOT NULL DEFAULT 'Water Tank Cleaning',
    tank_type TEXT,
    tank_capacity TEXT,
    capacity_unknown BOOLEAN DEFAULT FALSE,
    building_floors TEXT,
    flat_count TEXT,
    additional_pipeline_cleaning BOOLEAN DEFAULT FALSE,
    additional_amc BOOLEAN DEFAULT FALSE,
    number_of_tanks INTEGER DEFAULT 1,
    number_of_flats TEXT,
    building_type TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    message TEXT,
    estimated_price NUMERIC,
    source TEXT DEFAULT 'Website',
    status TEXT NOT NULL DEFAULT 'New',
    lead_status TEXT DEFAULT 'New',
    is_abandoned BOOLEAN DEFAULT FALSE,
    completion_step INTEGER DEFAULT 1,
    last_active_step_name TEXT,
    admin_note TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add columns if table already exists (safe non-destructive migration)
DO $$
BEGIN
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS postcode TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS house_number TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS road_number TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS thana TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS landmark TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_abandoned BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS completion_step INTEGER DEFAULT 1;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_active_step_name TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS admin_note TEXT;
END $$;

-- 3. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON public.leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_area ON public.leads(area);

-- 4. Enable Row Level Security (RLS) - Mandatory Database Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Drop old insecure policies if any exist
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous visitors to insert quotation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated staff to view and manage leads" ON public.leads;

-- 6. PUBLIC POLICY: Anonymous visitors can ONLY INSERT new leads (Cannot view other customers' data!)
CREATE POLICY "Allow anonymous visitors to insert quotation leads" 
ON public.leads 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
    -- Input hygiene validation
    length(customer_name) >= 2 AND 
    length(phone) >= 10
);

-- 7. ADMIN POLICY: Authenticated staff / admins have full access to view, update, and manage leads
CREATE POLICY "Allow authenticated staff to view and manage leads" 
ON public.leads 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. Grant minimal required privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT ALL PRIVILEGES ON public.leads TO authenticated;
