-- ==============================================================================
-- SUNVILOZ CLEAN CARE — PERSISTENT INDEXNOW OUTBOX, TIMESTAMPS & EXPLICIT SEEDING
-- Migration: 20261114_indexnow_outbox_and_seed.sql
-- Idempotent migration (safe to re-run)
-- ==============================================================================

-- 1. Persistent IndexNow Outbox Queue
CREATE TABLE IF NOT EXISTS public.indexnow_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    action TEXT NOT NULL DEFAULT 'publish',
    entity_type TEXT,
    entity_slug TEXT,
    verify_public BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'processing', 'submitted', 'accepted', 'failed', 'dead_letter')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_http_status INTEGER,
    last_error TEXT,
    public_verified BOOLEAN NOT NULL DEFAULT false,
    batch_key TEXT,
    triggered_by TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indexnow_outbox_due
    ON public.indexnow_outbox(status, next_retry_at);

CREATE INDEX IF NOT EXISTS idx_indexnow_outbox_created
    ON public.indexnow_outbox(created_at DESC);

ALTER TABLE public.indexnow_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access indexnow_outbox" ON public.indexnow_outbox;
CREATE POLICY "Admin full access indexnow_outbox"
ON public.indexnow_outbox FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Ensure indexnow_logs also exists cleanly if 20261113 ran partially
CREATE TABLE IF NOT EXISTS public.indexnow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    action TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Accepted', 'Failed')),
    http_status INTEGER,
    attempts INTEGER NOT NULL DEFAULT 1,
    response_detail TEXT,
    triggered_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Ensure content modification / publish timestamps exist cleanly across dynamic tables
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.service_zones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.service_zones ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.zone_areas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.zone_areas ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.touch_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_indexnow_outbox_updated_at ON public.indexnow_outbox;
CREATE TRIGGER trg_indexnow_outbox_updated_at
  BEFORE UPDATE ON public.indexnow_outbox
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_zones_updated_at ON public.service_zones;
CREATE TRIGGER trg_service_zones_updated_at
  BEFORE UPDATE ON public.service_zones
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

DROP TRIGGER IF EXISTS trg_zone_areas_updated_at ON public.zone_areas;
CREATE TRIGGER trg_zone_areas_updated_at
  BEFORE UPDATE ON public.zone_areas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

-- 3. Explicit One-Time Seed Tracking (Prevents resurrecting intentionally deleted items)
CREATE TABLE IF NOT EXISTS public.site_seed_history (
    seed_key TEXT PRIMARY KEY,
    notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_seed_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin access site_seed_history" ON public.site_seed_history;
CREATE POLICY "Admin access site_seed_history"
ON public.site_seed_history FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- One-time seed for core 3 services ONLY if never seeded before AND table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.site_seed_history WHERE seed_key = 'initial_services_v1') THEN
        IF NOT EXISTS (SELECT 1 FROM public.services LIMIT 1) THEN
            INSERT INTO public.services (
                id, slug, title, title_bn, name, short_desc, short_desc_bn,
                category, icon_name, icon, image, featured_image,
                is_active, display_order, show_on_homepage, show_in_navigation, show_in_quote_form,
                starting_price, starting_price_bn, popular, published_at
            )
            VALUES
            (
                'srv-overhead-water-tank',
                'overhead-water-tank-cleaning',
                'Overhead Water Tank Cleaning Service',
                'ওভারহেড ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
                'Overhead Water Tank Cleaning Service',
                'Professional cleaning of overhead water tanks made from plastic, steel, or concrete with high-pressure rotary jet and sanitization.',
                'প্লাস্টিক, স্টিল ও কংক্রিটের ছাদের ওভারহেড পানির ট্যাংক রোটারি হাই-প্রেসার জেট ও ফুড-গ্রেড জীবাণুমুক্তকরণে নির্ভরযোগ্য সেবা।',
                'Overhead Tank', 'Building', 'Building',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
                true, 1, true, true, true, 1200, '৳ ১,২০০', true, now()
            ),
            (
                'srv-underground-water-tank',
                'underground-water-tank-cleaning',
                'Underground Water Tank Cleaning Service',
                'আন্ডারগ্রাউন্ড ওয়াটার রিজার্ভ ট্যাংক ক্লিনিং সার্ভিস',
                'Underground Water Tank Cleaning Service',
                'Deep sludge extraction, rotary pressure washing, and food-grade sanitization for underground concrete water reservoirs.',
                'ভূগর্ভস্থ আরসিসি রিজার্ভ ট্যাংকের গভীর কাদা নিষ্কাশন, রোটারি ওয়াশ ও নিরাপদ জীবাণুমুক্তকরণ সেবা।',
                'Underground Reserve', 'ShieldCheck', 'ShieldCheck',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
                true, 2, true, true, true, 2500, '৳ ২,৫০০', true, now()
            ),
            (
                'srv-water-pipeline',
                'water-pipeline-cleaning',
                'Water Pipeline Cleaning Service',
                'পানির পাইপলাইন ক্লিনিং সার্ভিস',
                'Water Pipeline Cleaning Service',
                'Non-destructive hydro-pulse water pipeline flushing to remove iron deposits, rust scale, and biofilm.',
                'দেয়াল বা টাইলস না ভেঙে হাইড্রো-পালস প্রেসারাইজড ফ্লাশিংয়ে পাইপলাইনের আয়রন, মরিচা ও জমে থাকা ময়লা পরিষ্কার।',
                'Pipeline Cleaning', 'Wrench', 'Wrench',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
                'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
                true, 3, true, true, true, 1500, '৳ ১,৫০০', false, now()
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;

        INSERT INTO public.site_seed_history (seed_key, notes)
        VALUES ('initial_services_v1', 'Initial one-time core services seed completed')
        ON CONFLICT (seed_key) DO NOTHING;
    END IF;
END $$;
