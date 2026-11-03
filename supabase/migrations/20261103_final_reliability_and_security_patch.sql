-- ==============================================================================
-- SUNVILOZ CLEAN CARE — FINAL RELIABILITY, SECURITY & IDEMPOTENCY PATCH
-- Migration: 20261103_final_reliability_and_security_patch.sql
-- Description:
-- 1. Idempotency key support for offline lead synchronization.
-- 2. Legacy lead protection (disallow anonymous updates if lead_token_hash IS NULL).
-- 3. Atomic notification claiming & lock mechanism to prevent concurrent double-sends.
-- 4. Exponential backoff retry queue tracking (retry_count, next_retry_at, locked_until).
-- 5. Enforce strict SECURITY DEFINER search_path and permission revocation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. IDEMPOTENCY KEY ON public.leads
-- ------------------------------------------------------------------------------
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_idempotency_key 
ON public.leads (idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. UPGRADE NOTIFICATION QUEUE SCHEMA (public.lead_notifications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('complete_lead', 'abandoned_lead')),
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    resend_message_id TEXT,
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    locked_until TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    last_retry_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lead_id, notification_type)
);

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.lead_notifications 
ADD COLUMN IF NOT EXISTS max_retries INT NOT NULL DEFAULT 3;

-- Ensure status check constraint allows 'processing'
ALTER TABLE public.lead_notifications DROP CONSTRAINT IF EXISTS lead_notifications_status_check;
ALTER TABLE public.lead_notifications ADD CONSTRAINT lead_notifications_status_check 
CHECK (status IN ('pending', 'processing', 'sent', 'failed'));

-- Enable RLS
ALTER TABLE public.lead_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view lead notification logs" ON public.lead_notifications;
CREATE POLICY "Only admins can view lead notification logs"
ON public.lead_notifications FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update lead notification logs" ON public.lead_notifications;
CREATE POLICY "Only admins can update lead notification logs"
ON public.lead_notifications FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. ATOMIC NOTIFICATION CLAIMING FUNCTION (Concurreny & Double-Send Prevention)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_lead_notification(
    p_lead_id UUID,
    p_notification_type TEXT,
    p_recipient TEXT,
    p_is_retry BOOLEAN DEFAULT false,
    p_lock_seconds INT DEFAULT 45
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_row RECORD;
    v_now TIMESTAMPTZ := now();
    v_lock_until TIMESTAMPTZ := v_now + (p_lock_seconds || ' seconds')::interval;
BEGIN
    IF p_lead_id IS NULL THEN
        RAISE EXCEPTION 'lead_id is required.';
    END IF;

    -- Atomically lock the notification row for update if it exists
    SELECT * INTO v_row
    FROM public.lead_notifications
    WHERE lead_id = p_lead_id AND notification_type = p_notification_type
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Insert new row in 'processing' state with atomic lock
        INSERT INTO public.lead_notifications (
            lead_id,
            notification_type,
            recipient,
            status,
            retry_count,
            max_retries,
            locked_until,
            created_at,
            updated_at
        ) VALUES (
            p_lead_id,
            p_notification_type,
            p_recipient,
            'processing',
            0,
            3,
            v_lock_until,
            v_now,
            v_now
        )
        RETURNING * INTO v_row;

        RETURN jsonb_build_object(
            'allowed', true,
            'action', 'new',
            'id', v_row.id,
            'retry_count', v_row.retry_count
        );
    END IF;

    -- 1. If already successfully delivered, PREVENT DUPLICATES ALWAYS
    IF v_row.status = 'sent' THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'already_sent',
            'message', 'Notification already delivered. Duplicate prevented.'
        );
    END IF;

    -- 2. If currently being processed by another worker within lock window, BLOCK CONCURRENT REQUEST
    IF v_row.status = 'processing' AND v_row.locked_until IS NOT NULL AND v_row.locked_until > v_now THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'locked',
            'message', 'Notification is currently being processed by another process.'
        );
    END IF;

    -- 3. If retry requested
    IF p_is_retry THEN
        IF v_row.retry_count >= v_row.max_retries THEN
            RETURN jsonb_build_object(
                'allowed', false,
                'reason', 'max_retries_exceeded',
                'message', 'Maximum retry limit reached for this notification.'
            );
        END IF;

        UPDATE public.lead_notifications
        SET
            status = 'processing',
            retry_count = retry_count + 1,
            last_retry_at = v_now,
            locked_until = v_lock_until,
            updated_at = v_now
        WHERE id = v_row.id
        RETURNING * INTO v_row;

        RETURN jsonb_build_object(
            'allowed', true,
            'action', 'retry',
            'id', v_row.id,
            'retry_count', v_row.retry_count
        );
    END IF;

    -- 4. Otherwise, claim the row for processing
    UPDATE public.lead_notifications
    SET
        status = 'processing',
        locked_until = v_lock_until,
        updated_at = v_now
    WHERE id = v_row.id
    RETURNING * INTO v_row;

    RETURN jsonb_build_object(
        'allowed', true,
        'action', 'claim',
        'id', v_row.id,
        'retry_count', v_row.retry_count
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_lead_notification(UUID, TEXT, TEXT, BOOLEAN, INT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_lead_notification(UUID, TEXT, TEXT, BOOLEAN, INT) TO service_role;


-- ------------------------------------------------------------------------------
-- 4. RPC: CREATE PARTIAL LEAD WITH IDEMPOTENCY KEY
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_partial_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.create_partial_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.create_partial_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT);

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
    p_ownership_token TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
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
    v_existing RECORD;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- 1. Idempotency Check: if idempotency_key exists, return existing record immediately
    IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) != '' THEN
        SELECT * INTO v_existing
        FROM public.leads
        WHERE idempotency_key = trim(p_idempotency_key);

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'id', v_existing.id,
                'lead_number', v_existing.lead_number,
                'ownership_token', coalesce(p_ownership_token, 'persisted'),
                'status', v_existing.status,
                'is_duplicate_prevented', true,
                'created_at', v_existing.created_at
            );
        END IF;
    END IF;

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
        v_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text || random()::text)::bytea), 'hex');
    END IF;

    -- Compute SHA-256 hash
    v_token_hash := encode(sha256(v_token::bytea), 'hex');

    -- Generate PostgreSQL UUID and human-readable lead number
    v_lead_id := gen_random_uuid();
    v_lead_number := 'SVC-' || to_char(v_now, 'YYYYMMDD') || '-' || LPAD(floor(random() * 9000 + 1000)::text, 4, '0');

    -- Insert with unique idempotency_key protection
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
        idempotency_key,
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
        nullif(trim(p_idempotency_key), ''),
        'Step 1 Contact Captured (Incomplete Lead)',
        v_now,
        v_now
    )
    ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL
    DO UPDATE SET updated_at = now()
    RETURNING id, lead_number INTO v_lead_id, v_lead_number;

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
-- 5. RPC: UPDATE PARTIAL LEAD (With Legacy Lead Protection & Token Verification)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_partial_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB);
DROP FUNCTION IF EXISTS public.update_partial_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB);
DROP FUNCTION IF EXISTS public.update_partial_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB, TEXT);

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

    -- CRITICAL LEGACY LEAD & OWNERSHIP VERIFICATION:
    IF NOT v_is_admin THEN
        -- Legacy Protection: If lead_token_hash is NULL, anonymous updates are completely forbidden!
        IF v_lead.lead_token_hash IS NULL THEN
            RAISE EXCEPTION 'Anonymous modifications are not permitted on legacy records. Please contact support.';
        END IF;

        -- Require exact matching ownership token
        IF p_ownership_token IS NULL OR length(trim(p_ownership_token)) < 16 THEN
            RAISE EXCEPTION 'Ownership token is required to modify this lead.';
        END IF;

        IF v_lead.lead_token_hash != encode(sha256(trim(p_ownership_token)::bytea), 'hex') THEN
            RAISE EXCEPTION 'Unauthorized: Invalid lead ownership token.';
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
-- 6. RPC: COMPLETE CUSTOMER LEAD (Legacy Protection & Token Verification)
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

            -- CRITICAL LEGACY & OWNERSHIP VERIFICATION:
            IF NOT v_is_admin THEN
                -- Legacy lead protection: reject anonymous completion on unowned records
                IF v_lead.lead_token_hash IS NULL THEN
                    RAISE EXCEPTION 'Anonymous completion is not permitted on legacy records. Please contact support.';
                END IF;

                IF p_ownership_token IS NULL OR length(trim(p_ownership_token)) < 16 THEN
                    RAISE EXCEPTION 'Ownership token is required to complete this lead.';
                END IF;

                IF v_lead.lead_token_hash != encode(sha256(trim(p_ownership_token)::bytea), 'hex') THEN
                    RAISE EXCEPTION 'Unauthorized: Invalid lead ownership token.';
                END IF;

                -- Prevent resetting an already completed booking
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
