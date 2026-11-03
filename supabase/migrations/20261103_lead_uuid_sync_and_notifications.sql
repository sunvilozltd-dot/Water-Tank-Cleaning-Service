-- ==============================================================================
-- SUNVILOZ CLEAN CARE — SUPABASE UUID SYNCHRONIZATION & LEAD SECURITY
-- Migration: 20261103_lead_uuid_sync_and_notifications.sql
-- Description:
-- 1. Provides secure SECURITY DEFINER RPC functions for anonymous lead operations.
-- 2. Supabase generates true UUIDs; returned and stored for subsequent updates.
-- 3. Completing an incomplete lead updates the existing record (no duplicates).
-- 4. Anonymous visitors cannot read, scrape, or delete other customer leads.
-- 5. Email notification deduplication table for Resend free-tier alerts.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE RPC: CREATE PARTIAL LEAD (First-Step Lead Capture)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_partial_lead(
    p_customer_name TEXT,
    p_phone TEXT,
    p_whatsapp TEXT DEFAULT NULL,
    p_area TEXT DEFAULT 'Dhaka',
    p_service_type TEXT DEFAULT 'Water Tank Cleaning',
    p_source TEXT DEFAULT 'Website Booking Wizard (Step 1)',
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_phone TEXT;
    v_clean_name TEXT;
    v_lead_id UUID;
    v_lead_number TEXT;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- Sanitize & Validate inputs
    v_clean_name := trim(p_customer_name);
    v_clean_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

    IF length(v_clean_name) < 2 THEN
        RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
    END IF;

    IF length(v_clean_phone) < 10 THEN
        RAISE EXCEPTION 'A valid Bangladeshi phone number is required (min 10 digits).';
    END IF;

    -- Generate PostgreSQL UUID and human-readable lead number
    v_lead_id := gen_random_uuid();
    v_lead_number := 'SVC-' || to_char(v_now, 'YYYYMMDD') || '-' || LPAD(floor(random() * 9000 + 1000)::text, 4, '0');

    INSERT INTO public.leads (
        id,
        lead_number,
        customer_name,
        phone,
        whatsapp,
        area,
        service_type,
        status,
        lead_status,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        message,
        created_at,
        updated_at
    ) VALUES (
        v_lead_id,
        v_lead_number,
        v_clean_name,
        p_phone,
        coalesce(p_whatsapp, p_phone),
        coalesce(p_area, 'Dhaka'),
        coalesce(p_service_type, 'Water Tank Cleaning'),
        'Incomplete',
        'Incomplete',
        coalesce(p_source, 'Website Booking Wizard (Step 1)'),
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        'Step 1 Contact Captured (Incomplete Lead)',
        v_now,
        v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'id', v_lead_id,
        'lead_number', v_lead_number,
        'status', 'Incomplete',
        'created_at', v_now
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_partial_lead FROM public;
GRANT EXECUTE ON FUNCTION public.create_partial_lead TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 2. SECURE RPC: UPDATE PARTIAL LEAD PROGRESS (Subsequent Steps)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_partial_lead(
    p_lead_id UUID,
    p_tank_type TEXT DEFAULT NULL,
    p_tank_capacity TEXT DEFAULT NULL,
    p_area TEXT DEFAULT NULL,
    p_service_type TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_step INT DEFAULT 2,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_id UUID;
    v_now TIMESTAMPTZ := now();
BEGIN
    IF p_lead_id IS NULL THEN
        RAISE EXCEPTION 'lead_id is required for updating partial lead progress.';
    END IF;

    -- Security Guard: Only allow updating leads currently in 'Incomplete' or 'New' status
    -- Prevents anonymous tampering with confirmed or historic leads
    SELECT id INTO v_existing_id
    FROM public.leads
    WHERE id = p_lead_id
      AND status IN ('Incomplete', 'New', 'incomplete', 'new');

    IF v_existing_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead record not found or cannot be modified.');
    END IF;

    UPDATE public.leads
    SET
        tank_type = coalesce(p_tank_type, tank_type),
        tank_capacity = coalesce(p_tank_capacity, tank_capacity),
        area = coalesce(p_area, area),
        service_type = coalesce(p_service_type, service_type),
        message = coalesce(p_message, message),
        updated_at = v_now
    WHERE id = p_lead_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', p_lead_id,
        'updated_at', v_now
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_partial_lead FROM public;
GRANT EXECUTE ON FUNCTION public.update_partial_lead TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 3. SECURE RPC: COMPLETE LEAD SUBMISSION (Final Step or Fast Quote)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_customer_lead(
    p_lead_id UUID DEFAULT NULL,
    p_customer_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_area TEXT DEFAULT 'Dhaka',
    p_address TEXT DEFAULT NULL,
    p_service_type TEXT DEFAULT 'Water Tank Cleaning',
    p_tank_type TEXT DEFAULT NULL,
    p_tank_capacity TEXT DEFAULT NULL,
    p_floors TEXT DEFAULT NULL,
    p_flats TEXT DEFAULT NULL,
    p_additional_pipeline BOOLEAN DEFAULT false,
    p_additional_amc BOOLEAN DEFAULT false,
    p_preferred_date TEXT DEFAULT NULL,
    p_preferred_time TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'Website Booking Form',
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_final_id UUID;
    v_final_lead_number TEXT;
    v_is_update BOOLEAN := false;
    v_clean_name TEXT := trim(coalesce(p_customer_name, ''));
    v_clean_phone TEXT := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
    v_now TIMESTAMPTZ := now();
BEGIN
    -- Check if valid existing lead ID provided
    IF p_lead_id IS NOT NULL THEN
        SELECT id, lead_number INTO v_final_id, v_final_lead_number
        FROM public.leads
        WHERE id = p_lead_id;

        IF v_final_id IS NOT NULL THEN
            v_is_update := true;
        END IF;
    END IF;

    IF v_is_update THEN
        -- UPDATE EXISTING INCOMPLETE RECORD TO COMPLETE STATUS 'New'
        UPDATE public.leads
        SET
            customer_name = CASE WHEN length(v_clean_name) >= 2 THEN v_clean_name ELSE customer_name END,
            phone = CASE WHEN length(v_clean_phone) >= 10 THEN p_phone ELSE phone END,
            whatsapp = coalesce(p_whatsapp, whatsapp),
            email = coalesce(p_email, email),
            area = coalesce(p_area, area),
            address = coalesce(p_address, address),
            service_type = coalesce(p_service_type, service_type),
            tank_type = coalesce(p_tank_type, tank_type),
            tank_capacity = coalesce(p_tank_capacity, tank_capacity),
            building_floors = coalesce(p_floors, building_floors),
            flat_count = coalesce(p_flats, flat_count),
            additional_pipeline_cleaning = coalesce(p_additional_pipeline, additional_pipeline_cleaning),
            additional_amc = coalesce(p_additional_amc, additional_amc),
            preferred_date = coalesce(p_preferred_date, preferred_date),
            preferred_time = coalesce(p_preferred_time, preferred_time),
            message = coalesce(p_message, message),
            status = 'New',
            lead_status = 'New',
            source = coalesce(p_source, source),
            utm_source = coalesce(p_utm_source, utm_source),
            utm_medium = coalesce(p_utm_medium, utm_medium),
            utm_campaign = coalesce(p_utm_campaign, utm_campaign),
            updated_at = v_now
        WHERE id = v_final_id;
    ELSE
        -- VALIDATE FOR INSERTION
        IF length(v_clean_name) < 2 THEN
            RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
        END IF;
        IF length(v_clean_phone) < 10 THEN
            RAISE EXCEPTION 'A valid phone number is required (min 10 digits).';
        END IF;

        v_final_id := gen_random_uuid();
        v_final_lead_number := 'SVC-' || to_char(v_now, 'YYYYMMDD') || '-' || LPAD(floor(random() * 9000 + 1000)::text, 4, '0');

        INSERT INTO public.leads (
            id,
            lead_number,
            customer_name,
            phone,
            whatsapp,
            email,
            area,
            address,
            service_type,
            tank_type,
            tank_capacity,
            building_floors,
            flat_count,
            additional_pipeline_cleaning,
            additional_amc,
            preferred_date,
            preferred_time,
            message,
            status,
            lead_status,
            source,
            utm_source,
            utm_medium,
            utm_campaign,
            created_at,
            updated_at
        ) VALUES (
            v_final_id,
            v_final_lead_number,
            v_clean_name,
            p_phone,
            coalesce(p_whatsapp, p_phone),
            p_email,
            coalesce(p_area, 'Dhaka'),
            p_address,
            coalesce(p_service_type, 'Water Tank Cleaning'),
            p_tank_type,
            p_tank_capacity,
            p_floors,
            p_flats,
            coalesce(p_additional_pipeline, false),
            coalesce(p_additional_amc, false),
            p_preferred_date,
            p_preferred_time,
            p_message,
            'New',
            'New',
            coalesce(p_source, 'Website Booking Form'),
            p_utm_source,
            p_utm_medium,
            p_utm_campaign,
            v_now,
            v_now
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_final_id,
        'lead_number', v_final_lead_number,
        'is_updated', v_is_update,
        'status', 'New'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_customer_lead FROM public;
GRANT EXECUTE ON FUNCTION public.complete_customer_lead TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 4. EMAIL NOTIFICATIONS LOG & DEDUPLICATION TABLE (Strictly Service-Role Write)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('complete_lead', 'abandoned_lead')),
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    resend_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lead_id, notification_type)
);

ALTER TABLE public.lead_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view notification logs for monitoring & auditing
DROP POLICY IF EXISTS "Only admins can view lead notification logs" ON public.lead_notifications;
CREATE POLICY "Only admins can view lead notification logs"
ON public.lead_notifications FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Zero INSERT/UPDATE/DELETE policies for anon or general authenticated users!
-- Only trusted server-side execution (service_role in Edge Functions) can insert and update notification logs.

-- Revoke all public, anon, and authenticated execution privileges
DROP FUNCTION IF EXISTS public.log_lead_notification(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.log_lead_notification(
    p_lead_id UUID,
    p_notification_type TEXT,
    p_recipient TEXT DEFAULT 'sunvilozltd@gmail.com'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.lead_notifications (lead_id, notification_type, recipient, status, created_at, updated_at)
    VALUES (p_lead_id, p_notification_type, p_recipient, 'pending', now(), now())
    ON CONFLICT (lead_id, notification_type) DO NOTHING;
    RETURN true;
END;
$$;

-- STRICT: Zero execution permission for public, anon, or authenticated!
REVOKE EXECUTE ON FUNCTION public.log_lead_notification(UUID, TEXT, TEXT) FROM public, anon, authenticated;
