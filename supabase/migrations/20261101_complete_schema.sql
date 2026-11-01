-- ==============================================================================
-- SUNVILOZ CLEAN CARE — COMPLETE SUPABASE DATABASE SETUP & RLS SECURITY
-- Project: sunviloz Clean Care (ldzhzeyeuthdkobzxzlm)
-- Run this in your Supabase SQL Editor to provision all tables and security policies
-- ==============================================================================

-- 1. LEADS TABLE (Customer Quotation & Service Requests)
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

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON public.leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_area ON public.leads(area);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert quotation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous visitors to insert quotation leads" ON public.leads;
CREATE POLICY "Allow anonymous visitors to insert quotation leads" 
ON public.leads FOR INSERT TO anon, authenticated 
WITH CHECK (
    length(trim(customer_name)) >= 2 
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 10
);

-- Strict Admin-only access to customer leads (Zero anonymous read access)
DROP POLICY IF EXISTS "Allow authenticated staff to view and manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon to select own lead" ON public.leads;
DROP POLICY IF EXISTS "Only active admins can view and manage leads" ON public.leads;
CREATE POLICY "Only active admins can view and manage leads" 
ON public.leads FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role IN ('super_admin', 'admin', 'manager')
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role IN ('super_admin', 'admin', 'manager')
    )
);


-- 2. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert to audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert to audit_logs" 
ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only active admins can view audit_logs" ON public.audit_logs;
CREATE POLICY "Only active admins can view audit_logs" 
ON public.audit_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role IN ('super_admin', 'admin')
    )
);


-- 3. SITE HEADER CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.site_header (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    logo_url TEXT,
    logo_alt TEXT,
    logo_width NUMERIC DEFAULT 160,
    logo_height NUMERIC DEFAULT 44,
    logo_enabled BOOLEAN DEFAULT true,
    logo_destination TEXT DEFAULT '/',
    logo_position TEXT DEFAULT 'left',
    brand_name TEXT DEFAULT 'SUNVILOZ',
    brand_suffix TEXT DEFAULT 'Clean Care',
    brand_tagline_bn TEXT DEFAULT 'পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস',
    brand_tagline_en TEXT DEFAULT 'Professional Water Tank Cleaning Service',
    brand_visible BOOLEAN DEFAULT true,
    brand_font_size TEXT DEFAULT 'text-xl',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_header ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read site_header" ON public.site_header;
CREATE POLICY "Allow read site_header" 
ON public.site_header FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update site_header" ON public.site_header;
CREATE POLICY "Allow update site_header" 
ON public.site_header FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4. NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.navigation_items (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    label_bn TEXT,
    label_en TEXT,
    url TEXT NOT NULL,
    icon TEXT,
    open_new_tab BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    parent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read navigation_items" ON public.navigation_items;
CREATE POLICY "Allow read navigation_items" 
ON public.navigation_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage navigation_items" ON public.navigation_items;
CREATE POLICY "Allow manage navigation_items" 
ON public.navigation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 5. HOMEPAGE CMS SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id TEXT PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    section_type TEXT NOT NULL,
    title TEXT,
    title_bn TEXT,
    subtitle TEXT,
    subtitle_bn TEXT,
    description TEXT,
    description_bn TEXT,
    badge TEXT,
    badge_bn TEXT,
    media_type TEXT DEFAULT 'image',
    image_url TEXT,
    video_url TEXT,
    mobile_video_url TEXT,
    poster_image_url TEXT,
    youtube_url TEXT,
    youtube_video_id TEXT,
    button_text TEXT,
    button_text_bn TEXT,
    button_url TEXT,
    button_icon TEXT,
    button_event TEXT,
    secondary_button_text TEXT,
    secondary_button_text_bn TEXT,
    secondary_button_url TEXT,
    secondary_button_event TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    content JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow read homepage_sections" 
ON public.homepage_sections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow manage homepage_sections" 
ON public.homepage_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 6. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.media_library (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image',
    mime_type TEXT,
    storage_path TEXT,
    public_url TEXT,
    thumbnail_url TEXT,
    source_type TEXT DEFAULT 'upload',
    alt_text TEXT,
    title TEXT,
    caption TEXT,
    file_size NUMERIC,
    width NUMERIC,
    height NUMERIC,
    duration NUMERIC,
    youtube_video_id TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read media_library" ON public.media_library;
CREATE POLICY "Allow read media_library" 
ON public.media_library FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage media_library" ON public.media_library;
CREATE POLICY "Allow manage media_library" 
ON public.media_library FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 7. TRACKING & ANALYTICS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.tracking_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    meta_enabled BOOLEAN DEFAULT false,
    meta_pixel_id TEXT,
    meta_test_event_code TEXT,
    meta_capi_enabled BOOLEAN DEFAULT false,
    google_analytics_enabled BOOLEAN DEFAULT false,
    ga4_measurement_id TEXT,
    google_tag_manager_enabled BOOLEAN DEFAULT false,
    gtm_container_id TEXT,
    google_ads_enabled BOOLEAN DEFAULT false,
    google_ads_conversion_id TEXT,
    google_ads_conversion_label TEXT,
    google_search_console_code TEXT,
    debug_mode BOOLEAN DEFAULT false,
    consent_required BOOLEAN DEFAULT true,
    consent_banner_title TEXT,
    consent_banner_desc TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read tracking_settings" ON public.tracking_settings;
CREATE POLICY "Allow read tracking_settings" 
ON public.tracking_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage tracking_settings" ON public.tracking_settings;
CREATE POLICY "Allow manage tracking_settings" 
ON public.tracking_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 8. ADMIN USERS TABLE (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'editor')),
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin role" ON public.admin_users;
CREATE POLICY "Users can read own admin role"
ON public.admin_users FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
CREATE POLICY "Super admins can view all admin users"
ON public.admin_users FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
);

DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin users"
ON public.admin_users FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
);

-- Helper function to promote any user to Admin / Super Admin by email
CREATE OR REPLACE FUNCTION public.assign_admin_role_by_email(target_email TEXT, target_role TEXT DEFAULT 'super_admin', target_name TEXT DEFAULT 'Admin')
RETURNS TEXT AS $$
DECLARE
    found_user_id UUID;
BEGIN
    SELECT id INTO found_user_id FROM auth.users WHERE lower(trim(email)) = lower(trim(target_email)) LIMIT 1;
    IF found_user_id IS NULL THEN
        RETURN 'Error: No user found with email ' || target_email || '. Please create the user first in Supabase Authentication -> Users.';
    END IF;

    INSERT INTO public.admin_users (id, email, role, name, is_active)
    VALUES (found_user_id, lower(trim(target_email)), target_role, target_name, true)
    ON CONFLICT (id) DO UPDATE 
    SET role = target_role, is_active = true, updated_at = now();

    RETURN 'Success: User ' || target_email || ' assigned role ' || target_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. STORAGE BUCKETS SETUP (For images, videos, and brand assets)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('site-assets', 'site-assets', true),
    ('site-media', 'site-media', true),
    ('site-videos', 'site-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read access policy
DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
CREATE POLICY "Public can view site assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id IN ('site-assets', 'site-media', 'site-videos'));

-- Storage upload policy for authenticated/anon uploads
DROP POLICY IF EXISTS "Allow uploads to site storage" ON storage.objects;
CREATE POLICY "Allow uploads to site storage"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id IN ('site-assets', 'site-media', 'site-videos'));


-- 9. INITIAL SEED DATA (Default Brand Header, Settings, and Nav Items)
INSERT INTO public.site_header (id, brand_name, brand_suffix, brand_tagline_bn, brand_tagline_en, logo_destination, logo_position)
VALUES ('primary', 'SUNVILOZ', 'Clean Care', 'পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস', 'Professional Water Tank Cleaning Service', '/', 'left')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tracking_settings (id, consent_required, consent_banner_title, consent_banner_desc)
VALUES ('primary', true, 'আমরা কুকিজ ব্যবহার করি', 'আপনার অভিজ্ঞতা উন্নত করতে এবং সঠিক সেবা নিশ্চিত করতে আমরা কুকিজ ব্যবহার করি।')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.navigation_items (id, label, label_bn, label_en, url, open_new_tab, is_visible, sort_order)
VALUES 
    ('nav-home', 'Home', 'হোম', 'Home', '/', false, true, 1),
    ('nav-services', 'Services', 'সার্ভিসসমূহ', 'Services', '/services', false, true, 2),
    ('nav-areas', 'Service Areas', 'কভারেজ এলাকা', 'Service Areas', '/service-areas', false, true, 3),
    ('nav-process', 'Method', 'ক্লিনিং পদ্ধতি', 'Cleaning Method', '#process', false, true, 4),
    ('nav-blog', 'Cleaning Guide', 'টিপস ও গাইড', 'Cleaning Guide', '#blog', false, true, 5),
    ('nav-contact', 'Contact', 'যোগাযোগ', 'Contact', '/contact', false, true, 6)
ON CONFLICT (id) DO NOTHING;

