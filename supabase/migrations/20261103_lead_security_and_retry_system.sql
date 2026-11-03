-- ==============================================================================
-- SUNVILOZ CLEAN CARE — ADVANCED LEAD SECURITY, OWNERSHIP & NOTIFICATION SYSTEM
-- Migration: 20261103_lead_security_and_retry_system.sql
-- Description:
-- 1. Adds cryptographically secure lead_token_hash column to public.leads.
-- 2. Requires matching ownership token for anonymous updates and completions.
-- 3. Prevents public tampering, unauthorized lead modification, and invalid transitions.
-- 4. Persistent abuse protection & rate limiting table for edge notifications.
-- 5. Notification retry tracking (retry_count, max_retries, last_retry_at).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA UPGRADES FOR public.leads
-- ------------------------------------------------------------------------------
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_token_hash ON public.leads (lead_token_hash);

-- ------------------------------------------------------------------------------
-- 2. SCHEMA UPGRADES FOR public.lead_notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('complete_lead', 'abandoned_lead')),
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    resend_message_id TEXT,
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    last_retry_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lead_id, notification_type)
);

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS max_retries INT NOT NULL DEFAULT 3;

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

-- Enable RLS on lead_notifications
ALTER TABLE public.lead_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view notification logs
DROP POLICY IF EXISTS "Only admins can view lead notification logs" ON public.lead_notifications;
CREATE POLICY "Only admins can view lead notification logs"
ON public.lead_notifications FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update notification logs (e.g. for retries)
DROP POLICY IF EXISTS "Only admins can update lead notification logs" ON public.lead_notifications;
CREATE POLICY "Only admins can update lead notification logs"
ON public.lead_notifications FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. PERSISTENT ABUSE PROTECTION & RATE LIMITING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_abuse_protection (
    identifier TEXT PRIMARY KEY,
    request_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_request_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_abuse_protection ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_notification_rate_limit(
    p_identifier TEXT,
    p_max_requests INT DEFAULT 10,
    p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_window_start TIMESTAMPTZ;
    v_count INT;
BEGIN
    IF p_identifier IS NULL OR trim(p_identifier) = '' THEN
        p_identifier := 'unknown_client';
    END IF;

    SELECT window_start, request_count INTO v_window_start, v_count
    FROM public.notification_abuse_protection
    WHERE identifier = p_identifier;

    IF NOT FOUND THEN
        INSERT INTO public.notification_abuse_protection (identifier, request_count, window_start, last_request_at)
        VALUES (p_identifier, 1, v_now, v_now);
        RETURN true; -- Allowed
    END IF;

    -- If the sliding window has expired, reset it
    IF v_now > v_window_start + (p_window_seconds || ' seconds')::interval THEN
        UPDATE public.notification_abuse_protection
        SET request_count = 1, window_start = v_now, last_request_at = v_now
        WHERE identifier = p_identifier;
        RETURN true; -- Allowed
    END IF;

    -- Check if rate limit threshold exceeded
    IF v_count >= p_max_requests THEN
        RETURN false; -- Blocked (429 Rate Limit Exceeded)
    END IF;

    -- Increment request count within active window
    UPDATE public.notification_abuse_protection
    SET request_count = request_count + 1, last_request_at = v_now
    WHERE identifier = p_identifier;
    
    RETURN true; -- Allowed
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_notification_rate_limit(TEXT, INT, INT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.check_notification_rate_limit(TEXT, INT, INT) TO service_role;


-- ------------------------------------------------------------------------------
-- 4. SECURE RPC: CREATE PARTIAL LEAD WITH OWNERSHIP TOKEN
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_partial_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.create_partial_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT);

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
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ownership_token TEXT DEFAULT NULL
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
    v_token TEXT;
    v_token_hash TEXT;
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

    -- Generate unguessable ownership token if not provided by client
    IF p_ownership_token IS NOT NULL AND length(trim(p_ownership_token)) >= 16 THEN
        v_token := trim(p_ownership_token);
    ELSE
        -- Cryptographically unguessable token using standard Postgres functions
        v_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text || random()::text)::bytea), 'hex');
    END IF;

    -- Compute SHA-256 hash for secure database storage
    v_token_hash := encode(sha256(v_token::bytea), 'hex');

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
        lead_token_hash,
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
        v_token_hash,
        'Step 1 Contact Captured (Incomplete Lead)',
        v_now,
        v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'id', v_lead_id,
        'lead_number', v_lead_number,
        'ownership_token', v_token,
        'status', 'Incomplete',
        'created_at', v_now
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_partial_lead FROM public;
GRANT EXECUTE ON FUNCTION public.create_partial_lead TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 5. SECURE RPC: UPDATE PARTIAL LEAD WITH TOKEN VALIDATION
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_partial_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB);
DROP FUNCTION IF EXISTS public.update_partial_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB);

CREATE OR REPLACE FUNCTION public.update_partial_lead(
    p_lead_id UUID,
    p_tank_type TEXT DEFAULT NULL,
    p_tank_capacity TEXT DEFAULT NULL,
    p_area TEXT DEFAULT NULL,
    p_service_type TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_step INT DEFAULT 2,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ownership_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lead RECORD;
    v_now TIMESTAMPTZ := now();
    v_is_admin BOOLEAN := false;
BEGIN
    IF p_lead_id IS NULL THEN
        RAISE EXCEPTION 'lead_id is required.';
    END IF;

    -- Fetch existing lead
    SELECT * INTO v_lead
    FROM public.leads
    WHERE id = p_lead_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead record not found.');
    END IF;

    -- Check if admin caller
    IF auth.uid() IS NOT NULL THEN
        SELECT public.is_admin(auth.uid()) INTO v_is_admin;
    END IF;

    -- CRITICAL OWNERSHIP VERIFICATION FOR ANONYMOUS CALLS:
    IF NOT v_is_admin THEN
        -- If lead has a token hash, require the exact matching ownership token
        IF v_lead.lead_token_hash IS NOT NULL THEN
            IF p_ownership_token IS NULL OR length(trim(p_ownership_token)) < 16 THEN
                RAISE EXCEPTION 'Ownership token is required to modify this lead.';
            END IF;

            IF v_lead.lead_token_hash != encode(sha256(trim(p_ownership_token)::bytea), 'hex') THEN
                RAISE EXCEPTION 'Unauthorized: Invalid lead ownership token.';
            END IF;
        END IF;

        -- Status transition guard: Anonymous callers cannot tamper with finalized or cancelled leads
        IF v_lead.status IN ('Completed', 'Confirmed', 'Booked', 'Cancelled', 'Lost') THEN
            RAISE EXCEPTION 'Cannot modify an already finalized or closed lead.';
        END IF;
    END IF;

    -- Perform authenticated/verified partial update
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
        'step', p_step,
        'updated_at', v_now
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_partial_lead FROM public;
GRANT EXECUTE ON FUNCTION public.update_partial_lead TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 6. SECURE RPC: COMPLETE CUSTOMER LEAD WITH TOKEN VALIDATION
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.complete_customer_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.complete_customer_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

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
    p_utm_campaign TEXT DEFAULT NULL,
    p_ownership_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lead RECORD;
    v_clean_phone TEXT;
    v_clean_name TEXT;
    v_final_id UUID := p_lead_id;
    v_final_lead_number TEXT;
    v_token TEXT;
    v_token_hash TEXT;
    v_is_update BOOLEAN := false;
    v_is_admin BOOLEAN := false;
    v_now TIMESTAMPTZ := now();
BEGIN
    v_clean_name := trim(p_customer_name);
    v_clean_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

    IF auth.uid() IS NOT NULL THEN
        SELECT public.is_admin(auth.uid()) INTO v_is_admin;
    END IF;

    -- 1. If lead_id provided, verify existence and ownership
    IF p_lead_id IS NOT NULL THEN
        SELECT * INTO v_lead
        FROM public.leads
        WHERE id = p_lead_id;

        IF FOUND THEN
            v_is_update := true;
            v_final_lead_number := v_lead.lead_number;

            -- OWNERSHIP VERIFICATION FOR ANONYMOUS CALLS:
            IF NOT v_is_admin THEN
                IF v_lead.lead_token_hash IS NOT NULL THEN
                    IF p_ownership_token IS NULL OR length(trim(p_ownership_token)) < 16 THEN
                        RAISE EXCEPTION 'Ownership token is required to complete this lead.';
                    END IF;

                    IF v_lead.lead_token_hash != encode(sha256(trim(p_ownership_token)::bytea), 'hex') THEN
                        RAISE EXCEPTION 'Unauthorized: Invalid lead ownership token.';
                    END IF;
                END IF;

                -- Prevent resetting an already completed booking back to incomplete
                IF v_lead.status IN ('Confirmed', 'Booked', 'Completed') THEN
                    RETURN jsonb_build_object(
                        'success', true,
                        'id', v_lead.id,
                        'lead_number', v_lead.lead_number,
                        'message', 'Lead already finalized.',
                        'is_updated', false
                    );
                END IF;
            END IF;

            -- Update existing lead record to 'New' confirmed lead
            UPDATE public.leads
            SET
                customer_name = coalesce(v_clean_name, customer_name),
                phone = coalesce(p_phone, phone),
                whatsapp = coalesce(p_whatsapp, coalesce(p_phone, whatsapp)),
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
                updated_at = v_now
            WHERE id = v_final_id;
        END IF;
    END IF;

    -- 2. If not an existing record, perform fresh insert
    IF NOT v_is_update THEN
        IF length(v_clean_name) < 2 THEN
            RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
        END IF;
        IF length(v_clean_phone) < 10 THEN
            RAISE EXCEPTION 'A valid phone number is required (min 10 digits).';
        END IF;

        IF p_ownership_token IS NOT NULL AND length(trim(p_ownership_token)) >= 16 THEN
            v_token := trim(p_ownership_token);
        ELSE
            v_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text || random()::text)::bytea), 'hex');
        END IF;
        v_token_hash := encode(sha256(v_token::bytea), 'hex');

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
            lead_token_hash,
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
            v_token_hash,
            v_now,
            v_now
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_final_id,
        'lead_number', v_final_lead_number,
        'ownership_token', v_token,
        'is_updated', v_is_update,
        'status', 'New'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_customer_lead FROM public;
GRANT EXECUTE ON FUNCTION public.complete_customer_lead TO anon, authenticated;
