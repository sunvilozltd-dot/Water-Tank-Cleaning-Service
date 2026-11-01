-- ==============================================================================
-- SUNVILOZ CLEAN CARE — PRODUCTION SECURITY HARDENING & RLS RESTRICTIONS
-- Phase 1 Critical Security Migration
-- ==============================================================================

-- 1. HARDEN LEADS TABLE (Zero Anonymous Read Access, Strict RBAC for Admin Access)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remove dangerous legacy anonymous SELECT policies
DROP POLICY IF EXISTS "Allow anon to select own lead" ON public.leads;
DROP POLICY IF EXISTS "Public can select leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated staff to view and manage leads" ON public.leads;
DROP POLICY IF EXISTS "Only active admins can view and manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous visitors to insert quotation leads" ON public.leads;

-- Policy 1A: Public Anonymous & Authenticated Visitors can ONLY INSERT valid leads
CREATE POLICY "Allow anonymous visitors to insert quotation leads" 
ON public.leads FOR INSERT TO anon, authenticated 
WITH CHECK (
    length(trim(customer_name)) >= 2 
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 10
);

-- Policy 1B: ONLY verified, active administrators in public.admin_users can read, edit or delete leads
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

-- 2. HARDEN AUDIT LOGS TABLE
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert to audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert to audit_logs" 
ON public.audit_logs FOR INSERT TO anon, authenticated 
WITH CHECK (true);

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

-- 3. HARDEN ADMIN_USERS TABLE
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin role" ON public.admin_users;
CREATE POLICY "Users can read own admin role"
ON public.admin_users FOR SELECT TO authenticated
USING (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = email
    OR EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin users"
ON public.admin_users FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role = 'super_admin'
    )
);

-- 4. ENSURE VERIFIED OWNER ACCOUNTS ARE SEEDED & SYNCED WITH AUTH.USERS UUID
INSERT INTO public.admin_users (id, email, role, name, is_active)
SELECT 
    coalesce((SELECT id FROM auth.users WHERE lower(email) = 'sunvilozltd@gmail.com' LIMIT 1), '00000000-0000-0000-0000-000000000001'::uuid),
    'sunvilozltd@gmail.com',
    'super_admin',
    'Sunviloz Super Admin',
    true
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'super_admin',
    is_active = true,
    id = coalesce((SELECT id FROM auth.users WHERE lower(email) = 'sunvilozltd@gmail.com' LIMIT 1), public.admin_users.id);

INSERT INTO public.admin_users (id, email, role, name, is_active)
SELECT 
    coalesce((SELECT id FROM auth.users WHERE lower(email) = 'sunvilozcleancare@gmail.com' LIMIT 1), '00000000-0000-0000-0000-000000000002'::uuid),
    'sunvilozcleancare@gmail.com',
    'super_admin',
    'Sunviloz Super Admin',
    true
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'super_admin',
    is_active = true,
    id = coalesce((SELECT id FROM auth.users WHERE lower(email) = 'sunvilozcleancare@gmail.com' LIMIT 1), public.admin_users.id);
