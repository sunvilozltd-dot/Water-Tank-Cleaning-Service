-- ==============================================================================
-- SUNVILOZ CLEAN CARE — COMPLETE IDEMPOTENT CATCH-UP SCHEMA & SYNC MIGRATION
-- Migration: 20261115_complete_schema_and_sync_catchup.sql
-- Purpose:
--   Safely provisions all public tables expected by SSR/API/Admin without
--   weakening RLS or dropping existing data, and reloads PostgREST schema cache.
-- Safe to run multiple times on fresh or partially migrated Supabase projects.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 0. HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin check backed by public.admin_users (created in 20261101_admin_rbac.sql)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'editor')),
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = uid
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'manager', 'editor')
  );
$$;

-- ------------------------------------------------------------------------------
-- 1. SITE SETTINGS (Master config, contacts, hero, public SEO overrides)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage site settings fallback" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage site settings" ON public.site_settings;
CREATE POLICY "Admin manage site settings"
ON public.site_settings FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 2. IMAGE REGISTRY (Centralized media & hero video registry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.image_registry (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    version INTEGER NOT NULL DEFAULT 1,
    service_images JSONB NOT NULL DEFAULT '{}'::jsonb,
    site_images JSONB NOT NULL DEFAULT '{}'::jsonb,
    hero_videos JSONB NOT NULL DEFAULT '{}'::jsonb,
    project_images JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.image_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read image_registry" ON public.image_registry;
CREATE POLICY "Public read image_registry"
ON public.image_registry FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage image_registry" ON public.image_registry;
CREATE POLICY "Admin manage image_registry"
ON public.image_registry FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_bn TEXT,
    name TEXT,
    short_desc TEXT,
    short_desc_bn TEXT,
    full_desc TEXT,
    full_desc_bn TEXT,
    category TEXT,
    icon_name TEXT,
    icon TEXT,
    image TEXT,
    featured_image TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    show_on_homepage BOOLEAN DEFAULT true,
    show_in_navigation BOOLEAN DEFAULT true,
    show_in_quote_form BOOLEAN DEFAULT true,
    starting_price NUMERIC,
    starting_price_bn TEXT,
    popular BOOLEAN DEFAULT false,
    is_custom_added BOOLEAN DEFAULT false,
    seo_title TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_desc TEXT,
    form_config JSONB DEFAULT '{}'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    benefits_bn JSONB DEFAULT '[]'::jsonb,
    process JSONB DEFAULT '[]'::jsonb,
    process_bn JSONB DEFAULT '[]'::jsonb,
    ideal_for JSONB DEFAULT '[]'::jsonb,
    ideal_for_bn JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage services fallback" ON public.services;
DROP POLICY IF EXISTS "Authenticated can manage services" ON public.services;
DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services"
ON public.services FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage services" ON public.services;
CREATE POLICY "Admin manage services"
ON public.services FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 4. WORK VIDEOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_bn TEXT,
    description TEXT,
    description_bn TEXT,
    youtube_url TEXT,
    youtube_id TEXT,
    thumbnail_url TEXT,
    related_service_slug TEXT,
    featured BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_videos_order ON public.work_videos(sort_order);
ALTER TABLE public.work_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage work videos fallback" ON public.work_videos;
DROP POLICY IF EXISTS "Authenticated can manage work videos" ON public.work_videos;
DROP POLICY IF EXISTS "Public can view work videos" ON public.work_videos;
CREATE POLICY "Public can view work videos"
ON public.work_videos FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage work videos" ON public.work_videos;
CREATE POLICY "Admin manage work videos"
ON public.work_videos FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 5. SPECIAL OFFERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.special_offers (
    id TEXT PRIMARY KEY,
    title_bn TEXT NOT NULL,
    title_en TEXT NOT NULL,
    badge_bn TEXT,
    badge_en TEXT,
    link_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage special offers fallback" ON public.special_offers;
DROP POLICY IF EXISTS "Authenticated can manage special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Public can view special offers" ON public.special_offers;
CREATE POLICY "Public can view special offers"
ON public.special_offers FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage special offers" ON public.special_offers;
CREATE POLICY "Admin manage special offers"
ON public.special_offers FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 6. SERVICES FAQS (Single authoritative published FAQ source)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services_faqs (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    category_title_bn TEXT,
    category_title_en TEXT,
    question_bn TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_bn TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_faqs_order ON public.services_faqs(sort_order, is_active);
ALTER TABLE public.services_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage services faqs fallback" ON public.services_faqs;
DROP POLICY IF EXISTS "Authenticated can manage services faqs" ON public.services_faqs;
DROP POLICY IF EXISTS "Public can view services faqs" ON public.services_faqs;
CREATE POLICY "Public can view services faqs"
ON public.services_faqs FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage services faqs" ON public.services_faqs;
CREATE POLICY "Admin manage services faqs"
ON public.services_faqs FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 7. BLOG POSTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    category_bn TEXT,
    title TEXT NOT NULL,
    title_bn TEXT,
    excerpt TEXT,
    excerpt_bn TEXT,
    content TEXT NOT NULL,
    content_bn TEXT,
    image_url TEXT,
    author TEXT,
    published_at TEXT,
    read_time TEXT,
    read_time_bn TEXT,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage blog posts fallback" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts"
ON public.blog_posts FOR SELECT TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "Admin manage blog posts" ON public.blog_posts;
CREATE POLICY "Admin manage blog posts"
ON public.blog_posts FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 8. PORTFOLIO PROJECTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_bn TEXT,
    category TEXT,
    area TEXT,
    location TEXT,
    location_bn TEXT,
    tank_type TEXT,
    capacity TEXT,
    service_date TEXT,
    completed_date TEXT,
    before_img TEXT,
    before_image TEXT,
    after_img TEXT,
    after_image TEXT,
    summary TEXT,
    summary_bn TEXT,
    description TEXT,
    description_bn TEXT,
    featured BOOLEAN DEFAULT false,
    related_service_slug TEXT,
    customer_consent_granted BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage portfolio projects fallback" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated can manage portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can view portfolio projects"
ON public.portfolio_projects FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Admin manage portfolio projects"
ON public.portfolio_projects FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 9. CUSTOMER REVIEWS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    google_user_id TEXT,
    service_type TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    description TEXT NOT NULL,
    photo_url TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'approved', 'pending', 'rejected')),
    rejection_reason TEXT,
    is_verified_google BOOLEAN DEFAULT TRUE,
    is_spam BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON public.customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_service ON public.customer_reviews(service_type);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created ON public.customer_reviews(created_at DESC);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin delete fallback" ON public.customer_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Admins can view all customer reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Admins can update review status" ON public.customer_reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Public can view approved customer reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Public can view published customer reviews" ON public.customer_reviews;
CREATE POLICY "Public can view published customer reviews"
ON public.customer_reviews FOR SELECT TO anon, authenticated
USING (status IN ('published', 'approved') AND is_spam = FALSE);

DROP POLICY IF EXISTS "Customers can submit reviews as pending" ON public.customer_reviews;
DROP POLICY IF EXISTS "Public can submit instant reviews" ON public.customer_reviews;
CREATE POLICY "Public can submit instant reviews"
ON public.customer_reviews FOR INSERT TO anon, authenticated
WITH CHECK (
    status IN ('published', 'approved')
    AND rating >= 1
    AND rating <= 5
    AND length(trim(customer_name)) >= 2
    AND length(trim(description)) >= 10
);

DROP POLICY IF EXISTS "Admin select all customer reviews" ON public.customer_reviews;
CREATE POLICY "Admin select all customer reviews"
ON public.customer_reviews FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update customer reviews" ON public.customer_reviews;
CREATE POLICY "Admin update customer reviews"
ON public.customer_reviews FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete customer reviews" ON public.customer_reviews;
CREATE POLICY "Admin delete customer reviews"
ON public.customer_reviews FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_customer_reviews AS
SELECT
    id,
    customer_name,
    service_type,
    rating,
    description,
    photo_url,
    avatar_url,
    is_verified_google,
    created_at,
    approved_at
FROM public.customer_reviews
WHERE status IN ('published', 'approved') AND is_spam = FALSE;

-- ------------------------------------------------------------------------------
-- 10. SERVICE ZONES & ZONE AREAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    summary_en TEXT NOT NULL DEFAULT '',
    summary_bn TEXT NOT NULL DEFAULT '',
    featured_slug TEXT NOT NULL DEFAULT 'dhaka',
    places_text TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 1,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_zones_sort ON public.service_zones(sort_order, is_visible);
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published visible zones" ON public.service_zones;
CREATE POLICY "Public read published visible zones"
ON public.service_zones FOR SELECT TO anon, authenticated
USING (is_visible = true AND status = 'published');

DROP POLICY IF EXISTS "Admin full access service_zones" ON public.service_zones;
CREATE POLICY "Admin full access service_zones"
ON public.service_zones FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.zone_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.service_zones(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    area_name TEXT NOT NULL,
    area_name_bn TEXT NOT NULL,
    is_core_city BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    sort_order INTEGER NOT NULL DEFAULT 1,
    draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zone_areas_zone ON public.zone_areas(zone_id, sort_order, is_visible);
ALTER TABLE public.zone_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published visible areas" ON public.zone_areas;
CREATE POLICY "Public read published visible areas"
ON public.zone_areas FOR SELECT TO anon, authenticated
USING (is_visible = true AND status = 'published');

DROP POLICY IF EXISTS "Admin full access zone_areas" ON public.zone_areas;
CREATE POLICY "Admin full access zone_areas"
ON public.zone_areas FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. CONTENT REVISIONS, REDIRECTS, INDEXNOW OUTBOX/LOGS & CTA EVENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('service_zone', 'zone_area', 'site_config')),
    entity_id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_entity ON public.content_revisions(entity_type, entity_id, created_at DESC);
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access content_revisions" ON public.content_revisions;
CREATE POLICY "Admin full access content_revisions"
ON public.content_revisions FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.url_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_path TEXT UNIQUE NOT NULL,
    to_path TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active redirects" ON public.url_redirects;
CREATE POLICY "Public read active redirects"
ON public.url_redirects FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access url_redirects" ON public.url_redirects;
CREATE POLICY "Admin full access url_redirects"
ON public.url_redirects FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

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

CREATE INDEX IF NOT EXISTS idx_indexnow_logs_created ON public.indexnow_logs(created_at DESC);
ALTER TABLE public.indexnow_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access indexnow_logs" ON public.indexnow_logs;
CREATE POLICY "Admin full access indexnow_logs"
ON public.indexnow_logs FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

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

CREATE INDEX IF NOT EXISTS idx_indexnow_outbox_due ON public.indexnow_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_indexnow_outbox_created ON public.indexnow_outbox(created_at DESC);
ALTER TABLE public.indexnow_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access indexnow_outbox" ON public.indexnow_outbox;
CREATE POLICY "Admin full access indexnow_outbox"
ON public.indexnow_outbox FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.cta_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL CHECK (event_name IN ('click_call', 'click_whatsapp')),
    source_page TEXT,
    area TEXT,
    service TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cta_events_name_created ON public.cta_events(event_name, created_at DESC);
ALTER TABLE public.cta_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert cta_events" ON public.cta_events;
CREATE POLICY "Public insert cta_events"
ON public.cta_events FOR INSERT TO anon, authenticated
WITH CHECK (event_name IN ('click_call', 'click_whatsapp'));

DROP POLICY IF EXISTS "Admin read cta_events" ON public.cta_events;
CREATE POLICY "Admin read cta_events"
ON public.cta_events FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

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

-- ------------------------------------------------------------------------------
-- 12. UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS trg_services_faqs_updated_at ON public.services_faqs;
CREATE TRIGGER trg_services_faqs_updated_at
  BEFORE UPDATE ON public.services_faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_column();

-- ------------------------------------------------------------------------------
-- 13. ONE-TIME INITIAL SEEDS (GUARDED BY site_seed_history)
-- ------------------------------------------------------------------------------
INSERT INTO public.service_zones (slug, name_en, name_bn, summary_en, summary_bn, featured_slug, places_text, sort_order, is_visible, status, published_at)
VALUES
  ('north-dhaka-zone', 'North Dhaka Zone', 'উত্তর ঢাকা জোন', 'Dedicated mobile cleaning crews stationed daily across Uttara, Bashundhara, Nikunja, Khilkhet, and Kuril.', 'উত্তরা, বসুন্ধরা, নিকুঞ্জ, খিলক্ষেত ও কুড়িল এলাকার বাসাবাড়ি ও ভবনে প্রতিদিন মোবাইল টিম সেবা দিচ্ছে।', 'uttara', 'Uttara (Sectors 1–18), Bashundhara R/A, Nikunja 1 & 2, Khilkhet, Kuril', 1, true, 'published', now()),
  ('diplomatic-commercial-zone', 'Diplomatic & Commercial Zone', 'ডিপ্লোম্যাটিক ও বাণিজ্যিক জোন', 'Specialized high-hygiene operations for residential towers, offices, embassies, and commercial buildings in Gulshan, Banani, and Baridhara.', 'গুলশান, বনানী, বারিধারা ও নিকেতনের আবাসিক টাওয়ার, দূতাবাস ও করপোরেট অফিসের জন্য বিশেষায়িত সেবা।', 'gulshan', 'Gulshan 1 & 2, Banani, Banani DOHS, Baridhara Diplomatic Zone, Niketan', 2, true, 'published', now()),
  ('central-west-dhaka-zone', 'Central & West Dhaka Zone', 'সেন্ট্রাল ও পশ্চিম ঢাকা জোন', 'Fast dispatch for underground reservoirs, rooftop PVC/RCC tanks, and pipeline flushing across Dhanmondi, Mirpur, and Mohammadpur.', 'ধানমন্ডি, মিরপুর, মোহাম্মদপুর, লালমাটিয়া ও তেজগাঁও এলাকার রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইন পরিষ্কার সেবা।', 'dhanmondi', 'Dhanmondi, Mirpur (1–14 & DOHS), Mohammadpur, Lalmatia, Tejgaon', 3, true, 'published', now()),
  ('east-south-dhaka-zone', 'East & South Dhaka Zone', 'পূর্ব ও দক্ষিণ ঢাকা জোন', 'High-pressure mud extraction and water storage cleaning across Badda, Rampura, Banasree, Motijheel, and Old Dhaka.', 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মতিঝিল ও পুরান ঢাকার বাসাবাড়ি ও বাণিজ্যিক ভবনে নিয়মিত সেবা।', 'badda', 'Badda, Rampura, Banasree, Aftabnagar, Khilgaon, Motijheel, Puran Dhaka', 4, true, 'published', now()),
  ('greater-dhaka-corridor', 'Greater Dhaka Corridor', 'বৃহত্তর ঢাকা করিডোর', 'Scheduled mobile team dispatch for residential and commercial buildings in Gazipur, Savar, and Narayanganj.', 'ঢাকা সংলগ্ন গাজীপুর, সাভার ও নারায়ণগঞ্জ এলাকার আবাসিক ও বাণিজ্যিক ভবনে নির্ধারিত শিডিউলে সেবা।', 'gazipur', 'Gazipur (Tongi, Joydebpur, Chowrasta), Savar & Ashulia, Narayanganj (Chashara, Fatullah)', 5, true, 'published', now())
ON CONFLICT (slug) DO NOTHING;

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
                'overhead-tank-cleaning',
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
                'pipeline-cleaning',
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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.site_seed_history WHERE seed_key = 'initial_services_faqs_v1') THEN
        IF NOT EXISTS (SELECT 1 FROM public.services_faqs LIMIT 1) THEN
            INSERT INTO public.services_faqs (
                id, category, category_title_bn, category_title_en,
                question_bn, question_en, answer_bn, answer_en, sort_order, is_active
            )
            VALUES
            ('faq-tank-1', 'water-tank-cleaning', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning',
             'পানির ট্যাংক কত দিন পরপর পরিষ্কার করা উচিত?',
             'How frequently should a water tank be cleaned?',
             'স্বাস্থ্যসম্মত ও নিরাপদ ব্যবহারের জন্য বছরে অন্তত ২ বার (প্রতি ৬ মাস অন্তর) ছাদ ও ভূগর্ভস্থ রিজার্ভার ডিপ ক্লিন ও জীবাণুমুক্ত করা নিয়মিত রক্ষণাবেক্ষণের জন্য সুপারিশকৃত।',
             'Water tanks should ideally be thoroughly cleaned and sanitized at least twice a year (every 6 months) to avoid sludge sediment, slime and bacterial contamination.',
             1, true),
            ('faq-tank-2', 'water-tank-cleaning', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning',
             'পানির ট্যাংক পরিষ্কার করতে কত সময় লাগে?',
             'How long does water tank cleaning take?',
             'ট্যাংকের ধারণক্ষমতা এবং ময়লার পরিমাণের ওপর ভিত্তি করে ১,০০০–৩,০০০ লিটার ওভারহেড ট্যাংকে সাধারণতঃ ২ থেকে ৩ ঘণ্টা এবং বড় ভূগর্ভস্থ রিজার্ভারে ৪ থেকে ৬ ঘণ্টা সময় লাগতে পারে।',
             'Standard 1,000–3,000 liter overhead tanks typically take 2–3 hours. Large underground commercial reservoirs may take 4–6 hours depending on sludge volume.',
             2, true),
            ('faq-tank-3', 'water-tank-cleaning', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning',
             'পানির ট্যাংক পরিষ্কারের খরচ কীভাবে নির্ধারণ করা হয়?',
             'How is the water tank cleaning cost determined?',
             'ট্যাংকের ধরন (ওভারহেড পিভিসি/আরসিসি নাকি আন্ডারগ্রাউন্ড), ধারণক্ষমতা (লিটার বা গ্যালন), প্রবেশগম্যতা এবং ময়লার স্তরের ওপর ভিত্তি করে সাশ্রয়ী ও সঠিক কোটেশন দেওয়া হয়।',
             'Quotation depends on tank capacity, type (underground vs. overhead), construction material (RCC/PVC), accessibility, and silt thickness.',
             3, true),
            ('faq-tank-4', 'water-tank-cleaning', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning',
             'আপনারা কী ধরনের ক্লিনিং প্রযুক্তি ও জীবাণুনাশক ব্যবহার করেন?',
             'What cleaning technology and disinfectants do you use?',
             'আমরা আধুনিক হাই-প্রেসার জেট ওয়াশার, স্বয়ংক্রিয় স্লাজ পাম্পিং, মেকানিক্যাল রোটো-স্ক্রাবিং এবং খাদ্য-নিরাপদ অনুমোদিত ইউভি ও জীবাণুনাশক ট্রিটমেন্ট ব্যবহার করি।',
             'We employ high-pressure jet washers, industrial sludge de-watering pumps, mechanical rotary scrubbers, and certified eco-safe food-grade disinfectants.',
             4, true),
            ('faq-tank-5', 'water-tank-cleaning', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning',
             'ক্লিনিংয়ের পর কি ট্যাংকের পানি তাৎক্ষণিকভাবে ব্যবহার করা যায়?',
             'Can the tank water be used immediately after cleaning?',
             'হ্যাঁ। ওয়াশ ও জীবাণুমুক্তকরণের পর ট্যাংক পুরোপুরি পরিষ্কার বিশুদ্ধ পানি দিয়ে ধুয়ে শুকানো হয়। নতুন পানি ভরার পর তা সরাসরি রান্না ও গৃহস্থালি কাজে ব্যবহারের উপযোগী থাকে।',
             'Yes. After deep scrubbing and chemical-free rinsing, the tank is completely flushed with pure water. Freshly filled water is immediately ready for safe household use.',
             5, true),
            ('faq-pipe-1', 'pipeline-cleaning', 'পাইপলাইন পরিষ্কার', 'Pipeline Cleaning',
             'পানির পাইপলাইন ফ্লাশিংয়ে কি দেয়াল বা টাইলস ভাঙতে হয়?',
             'Do walls or tiles need to be broken for pipeline cleaning?',
             'না, কোনো ভাঙচুর প্রয়োজন নেই। আমাদের আধুনিক হাইড্রো-পালস ও এয়ার-প্রেসারাইজড প্রযুক্তিতে দেয়াল বা টাইলস অক্ষত রেখে বিদ্যমান ট্যাপ ও ভালভের মাধ্যমেই পাইপের ভেতর পরিষ্কার করা হয়।',
             'No walls or tiles need to be broken. Our hydro-pulse pressurized flushing system works entirely through existing taps and valve connections without structural damage.',
             6, true),
            ('faq-pipe-2', 'pipeline-cleaning', 'পাইপলাইন পরিষ্কার', 'Pipeline Cleaning',
             'পাইপে জমে থাকা আয়রন, শ্যাওলা ও লালচে ঘোলা পানি কি পরিষ্কার হবে?',
             'Will iron rust scaling, bio-slime, and brownish muddy water be eliminated?',
             'হ্যাঁ। ওয়াটার পাইপলাইনের অভ্যন্তরীণ দেয়াল থেকে শক্ত আয়রন স্কেল, মরিচা, শ্যাওলা ও ব্যাকটেরিয়াল স্লাইম স্তর পুরোপুরি ধুয়ে বের হয়ে আসে এবং পানির স্বাভাবিক স্বচ্ছতা ও গতি ফিরে আসে।',
             'Yes. Internal iron oxidation, rust scaling, heavy sediment, and bio-slime are thoroughly dislodged and flushed out, restoring sparkling clear water and optimal water pressure.',
             7, true),
            ('faq-pipe-3', 'pipeline-cleaning', 'পাইপলাইন পরিষ্কার', 'Pipeline Cleaning',
             'পাইপলাইন ক্লিনিং করাতে কত সময় লাগে?',
             'How long does water pipeline cleaning take?',
             'সাধারণ একটি স্ট্যান্ডার্ড ফ্ল্যাট বা বাসার জন্য ২ থেকে ৩ ঘণ্টা এবং পুরো বহুতল ভবনের সেন্ট্রাল ওয়াটার লাইনের ক্ষেত্রে ৪ থেকে ৬ ঘণ্টা সময় প্রয়োজন হয়।',
             'A standard residential apartment usually takes 2–3 hours. Multi-story commercial or central building risers typically take 4–6 hours.',
             8, true),
            ('faq-pipe-4', 'pipeline-cleaning', 'পাইপলাইন পরিষ্কার', 'Pipeline Cleaning',
             'পুরোনো বা ভঙ্গুর পাইপে কি কোনো লিকেজ হওয়ার আশঙ্কা থাকে?',
             'Is there any risk of pipe bursting or leakage in older plumbing?',
             'আমরা পরিষ্কার শুরুর আগে সম্পূর্ণ পাইপিং নেটওয়ার্কের প্রাথমিক প্রেসার টেস্ট ও নিরাপত্তা নিরীক্ষা করি। পাইপের সহনশীলতা মেপে নিয়ন্ত্রিত পালস রেঞ্জে কাজ করা হয়, যাতে কোনো ঝুঁকি না থাকে।',
             'Before flushing, our certified technicians conduct safety checks and calibrate the pulse pressure to your pipe material and age to ensure zero damage.',
             9, true),
            ('faq-pipe-5', 'pipeline-cleaning', 'পাইপলাইন পরিষ্কার', 'Pipeline Cleaning',
             'পানির পাইপলাইন কত দিন পর পর পরিষ্কার করা উচিত?',
             'How frequently should water supply pipelines be flushed?',
             'যেসব এলাকায় সরবরাহকৃত পানিতে মাত্রাতিরিক্ত আয়রন, লবণ বা পলি রয়েছে, সেখানে প্রতি ১ থেকে ২ বছর পর পর একবার পাইপলাইন ফ্লাশিং করা সবচেয়ে কার্যকর।',
             'In areas with high iron, heavy calcium hardness, or sediment, flushing pipelines every 1 to 2 years is highly recommended to prevent complete blockages.',
             10, true)
            ON CONFLICT (id) DO NOTHING;
        END IF;

        INSERT INTO public.site_seed_history (seed_key, notes)
        VALUES ('initial_services_faqs_v1', 'Initial one-time services FAQs seed completed')
        ON CONFLICT (seed_key) DO NOTHING;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 14. REFRESH POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
