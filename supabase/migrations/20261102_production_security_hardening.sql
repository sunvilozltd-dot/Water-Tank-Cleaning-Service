-- ==============================================================================
-- SUNVILOZ CLEAN CARE — COMPREHENSIVE PRODUCTION SECURITY HARDENING (RLS)
-- Migration: 20261102_production_security_hardening.sql
-- Description:
-- 1. Eliminates dangerous unrestricted "FOR ALL TO authenticated USING (true)" policies.
-- 2. Uses non-circular SECURITY DEFINER functions (is_admin, is_super_admin) with fixed search_path.
-- 3. Anonymous visitors can ONLY INSERT valid leads. Zero anonymous read/update/delete.
-- 4. Audit logs are strictly admin-only (Zero anonymous INSERT, SELECT, UPDATE, or DELETE).
-- 5. Only verified active administrators in public.admin_users can access leads or modify CMS/Settings/Storage.
-- 6. Safe, idempotent, preserves all existing tables and data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS (Safe RBAC without circular RLS dependencies)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    IF user_id IS NULL AND auth.jwt() IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (
            (user_id IS NOT NULL AND id = user_id)
            OR (auth.uid() IS NOT NULL AND id = auth.uid())
            OR (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
        )
        AND is_active = true
        AND role IN ('super_admin', 'admin', 'manager', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    IF user_id IS NULL AND auth.jwt() IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (
            (user_id IS NOT NULL AND id = user_id)
            OR (auth.uid() IS NOT NULL AND id = auth.uid())
            OR (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
        )
        AND is_active = true
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke unnecessary public/anon execution privileges; grant strictly to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;


-- ------------------------------------------------------------------------------
-- 2. ADMIN USERS TABLE SECURITY & AUTO-SYNC
-- ------------------------------------------------------------------------------
-- Ensure admin_users exists with proper structure
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'editor')),
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Remove foreign key constraint if it exists to allow pre-provisioning
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin role" ON public.admin_users;
DROP POLICY IF EXISTS "Users can read own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON public.admin_users;

-- Users can inspect their own role by UUID or Email; Super Admins can view all admin accounts
CREATE POLICY "Users can read own admin record"
ON public.admin_users FOR SELECT TO authenticated
USING (
    auth.uid() = id 
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.is_super_admin(auth.uid())
);

-- ONLY Super Admins can insert, modify, or deactivate administrators
CREATE POLICY "Super admins can manage admin users"
ON public.admin_users FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Provision verified business owner accounts from auth.users if they exist
DO $$
DECLARE
    owner_rec RECORD;
BEGIN
    FOR owner_rec IN 
        SELECT id, email FROM auth.users WHERE lower(email) IN ('sunvilozltd@gmail.com', 'sunvilozcleancare@gmail.com')
    LOOP
        INSERT INTO public.admin_users (id, email, role, name, is_active)
        VALUES (owner_rec.id, lower(owner_rec.email), 'super_admin', 'Sunviloz Super Admin', true)
        ON CONFLICT (email) DO UPDATE 
        SET id = owner_rec.id, role = 'super_admin', is_active = true, updated_at = now();
    END LOOP;
END $$;

-- Automatic trigger to promote verified business owner emails whenever they sign up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    IF lower(new.email) IN ('sunvilozltd@gmail.com', 'sunvilozcleancare@gmail.com') THEN
        INSERT INTO public.admin_users (id, email, role, name, is_active)
        VALUES (new.id, lower(new.email), 'super_admin', 'Sunviloz Super Admin', true)
        ON CONFLICT (email) DO UPDATE
        SET id = new.id, role = 'super_admin', is_active = true, updated_at = now();
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM public, anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Secure assign_admin_role_by_email to require Super Admin privileges
CREATE OR REPLACE FUNCTION public.assign_admin_role_by_email(target_email TEXT, target_role TEXT DEFAULT 'super_admin', target_name TEXT DEFAULT 'Admin')
RETURNS TEXT AS $$
DECLARE
    found_user_id UUID;
BEGIN
    IF NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access Denied: Only Super Administrators can assign administrator roles.';
    END IF;

    SELECT id INTO found_user_id FROM auth.users WHERE lower(trim(email)) = lower(trim(target_email)) LIMIT 1;
    
    IF found_user_id IS NULL THEN
        RETURN 'Error: No user found with email ' || target_email || '. Please create the user first in Supabase Authentication -> Users.';
    END IF;

    INSERT INTO public.admin_users (id, email, role, name, is_active)
    VALUES (found_user_id, lower(trim(target_email)), target_role, target_name, true)
    ON CONFLICT (email) DO UPDATE 
    SET role = target_role, is_active = true, id = found_user_id, updated_at = now();

    RETURN 'Success: User ' || target_email || ' assigned role ' || target_role || ' (ID: ' || found_user_id || ')';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT, TEXT) TO authenticated;


-- ------------------------------------------------------------------------------
-- 3. CUSTOMER LEADS TABLE SECURITY (Zero Public Read, Strict Admin RBAC)
-- ------------------------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert quotation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous visitors to insert quotation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public visitors to insert quotation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon to select own lead" ON public.leads;
DROP POLICY IF EXISTS "Public can select leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated staff to view and manage leads" ON public.leads;
DROP POLICY IF EXISTS "Only active admins can view and manage leads" ON public.leads;

-- Policy A: Public visitors (anon & authenticated) can ONLY insert valid quotation leads
CREATE POLICY "Allow public visitors to insert quotation leads"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
    length(trim(customer_name)) >= 2 
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 10
);

-- Policy B: ONLY active administrators can read, update, or delete customer leads
CREATE POLICY "Only active admins can view and manage leads"
ON public.leads FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 4. AUDIT LOGS SECURITY (Strictly Admin-Only: Zero Anonymous Access)
-- ------------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert to audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only active admins can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow system and admin insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only active admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;

-- Admins can read audit logs
CREATE POLICY "Only active admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- ONLY active administrators can create audit records (Zero anonymous INSERT)
CREATE POLICY "Only active admins can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 5. SITE HEADER TABLE SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_header ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read site_header" ON public.site_header;
DROP POLICY IF EXISTS "Allow update site_header" ON public.site_header;
DROP POLICY IF EXISTS "Public can view site header" ON public.site_header;
DROP POLICY IF EXISTS "Only admins can manage site header" ON public.site_header;

CREATE POLICY "Public can view site header"
ON public.site_header FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can manage site header"
ON public.site_header FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 6. NAVIGATION ITEMS TABLE SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read navigation_items" ON public.navigation_items;
DROP POLICY IF EXISTS "Allow manage navigation_items" ON public.navigation_items;
DROP POLICY IF EXISTS "Public can view navigation items" ON public.navigation_items;
DROP POLICY IF EXISTS "Only admins can manage navigation items" ON public.navigation_items;

CREATE POLICY "Public can view navigation items"
ON public.navigation_items FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can manage navigation items"
ON public.navigation_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 7. HOMEPAGE CMS SECTIONS TABLE SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read homepage_sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Allow manage homepage_sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Public can view homepage sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Only admins can manage homepage sections" ON public.homepage_sections;

CREATE POLICY "Public can view homepage sections"
ON public.homepage_sections FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can manage homepage sections"
ON public.homepage_sections FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 8. MEDIA LIBRARY TABLE SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read media_library" ON public.media_library;
DROP POLICY IF EXISTS "Allow manage media_library" ON public.media_library;
DROP POLICY IF EXISTS "Public can view media library" ON public.media_library;
DROP POLICY IF EXISTS "Only admins can manage media library" ON public.media_library;

CREATE POLICY "Public can view media library"
ON public.media_library FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can manage media library"
ON public.media_library FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 9. TRACKING & ANALYTICS SETTINGS TABLE SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.tracking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read tracking_settings" ON public.tracking_settings;
DROP POLICY IF EXISTS "Allow manage tracking_settings" ON public.tracking_settings;
DROP POLICY IF EXISTS "Public can view tracking settings" ON public.tracking_settings;
DROP POLICY IF EXISTS "Only admins can manage tracking settings" ON public.tracking_settings;

CREATE POLICY "Public can view tracking settings"
ON public.tracking_settings FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can manage tracking settings"
ON public.tracking_settings FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- ------------------------------------------------------------------------------
-- 10. STORAGE BUCKETS & OBJECTS SECURITY
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('site-assets', 'site-assets', true),
    ('site-media', 'site-media', true),
    ('site-videos', 'site-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to site storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload to site storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update site storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete site storage" ON storage.objects;

-- Public read access for images and videos
CREATE POLICY "Public can view site storage"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id IN ('site-assets', 'site-media', 'site-videos'));

-- Restrict upload/update/delete strictly to active administrators
CREATE POLICY "Only admins can upload to site storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id IN ('site-assets', 'site-media', 'site-videos')
    AND public.is_admin(auth.uid())
);

CREATE POLICY "Only admins can update site storage"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id IN ('site-assets', 'site-media', 'site-videos')
    AND public.is_admin(auth.uid())
);

CREATE POLICY "Only admins can delete site storage"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id IN ('site-assets', 'site-media', 'site-videos')
    AND public.is_admin(auth.uid())
);
