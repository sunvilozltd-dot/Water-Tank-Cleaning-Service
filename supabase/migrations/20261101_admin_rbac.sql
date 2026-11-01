-- ==============================================================================
-- SUNVILOZ CLEAN CARE — ROLE-BASED ACCESS CONTROL (RBAC) FOR ADMIN PORTAL
-- Migration: 20261101_admin_rbac.sql
-- ==============================================================================

-- ১. Create admin_users table linked with Supabase Auth
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'editor')),
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for instant role lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can check admin roles
DROP POLICY IF EXISTS "Users can read own admin role" ON public.admin_users;
CREATE POLICY "Users can read own admin role"
ON public.admin_users FOR SELECT TO authenticated
USING (true);

-- Policy 2: Super Admins can view all admin users
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
CREATE POLICY "Super admins can view all admin users"
ON public.admin_users FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
);

-- Policy 3: Super Admins can update roles or status
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;
CREATE POLICY "Super admins can update admin users"
ON public.admin_users FOR UPDATE TO authenticated
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

-- Policy 4: Super Admins can delete admin access
DROP POLICY IF EXISTS "Super admins can delete admin users" ON public.admin_users;
CREATE POLICY "Super admins can delete admin users"
ON public.admin_users FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
);

-- Policy 5: Super Admins can insert new admin records
DROP POLICY IF EXISTS "Super admins can insert admin users" ON public.admin_users;
CREATE POLICY "Super admins can insert admin users"
ON public.admin_users FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
);

-- ==============================================================================
-- AUTOMATED FUNCTION & TRIGGER:
-- Automatically insert into admin_users whenever a user is designated as admin
-- Or easily promote an existing Supabase Auth user by email:
-- ==============================================================================

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

    RETURN 'Success: User ' || target_email || ' assigned role ' || target_role || ' (ID: ' || found_user_id || ')';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
