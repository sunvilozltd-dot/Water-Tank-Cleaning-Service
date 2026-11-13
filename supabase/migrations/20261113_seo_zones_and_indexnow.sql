-- ==============================================================================
-- SUNVILOZ CLEAN CARE — SERVICE ZONES CMS, REDIRECTS, INDEXNOW LOGS & RLS HARDENING
-- Migration: 20261113_seo_zones_and_indexnow.sql
-- Idempotent migration (safe to re-run)
-- ==============================================================================

-- 1. Service Zones Table (5 core zones editable from Admin)
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

-- 2. Zone Areas Table (Location detail pages under /service-areas/:slug)
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

-- 3. Content Revisions History & Rollback
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

-- 4. URL Redirects (301/302 management for renamed or legacy slugs)
CREATE TABLE IF NOT EXISTS public.url_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_path TEXT UNIQUE NOT NULL,
    to_path TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. IndexNow Submission Logs (Honest submission tracking - never claims 'Indexed')
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

-- 6. Privacy-Safe CTA Click Events (Separates Call & WhatsApp clicks from Leads)
CREATE TABLE IF NOT EXISTS public.cta_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL CHECK (event_name IN ('click_call', 'click_whatsapp')),
    source_page TEXT,
    area TEXT,
    service TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cta_events_name_created ON public.cta_events(event_name, created_at DESC);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ==============================================================================
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indexnow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_events ENABLE ROW LEVEL SECURITY;

-- Public read policies (only published & visible records for zones/areas)
DROP POLICY IF EXISTS "Public read published visible zones" ON public.service_zones;
CREATE POLICY "Public read published visible zones"
ON public.service_zones FOR SELECT TO anon, authenticated
USING (is_visible = true AND status = 'published');

DROP POLICY IF EXISTS "Admin full access service_zones" ON public.service_zones;
CREATE POLICY "Admin full access service_zones"
ON public.service_zones FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read published visible areas" ON public.zone_areas;
CREATE POLICY "Public read published visible areas"
ON public.zone_areas FOR SELECT TO anon, authenticated
USING (is_visible = true AND status = 'published');

DROP POLICY IF EXISTS "Admin full access zone_areas" ON public.zone_areas;
CREATE POLICY "Admin full access zone_areas"
ON public.zone_areas FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin full access content_revisions" ON public.content_revisions;
CREATE POLICY "Admin full access content_revisions"
ON public.content_revisions FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read active redirects" ON public.url_redirects;
CREATE POLICY "Public read active redirects"
ON public.url_redirects FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access url_redirects" ON public.url_redirects;
CREATE POLICY "Admin full access url_redirects"
ON public.url_redirects FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin full access indexnow_logs" ON public.indexnow_logs;
CREATE POLICY "Admin full access indexnow_logs"
ON public.indexnow_logs FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public insert cta_events" ON public.cta_events;
CREATE POLICY "Public insert cta_events"
ON public.cta_events FOR INSERT TO anon, authenticated
WITH CHECK (event_name IN ('click_call', 'click_whatsapp'));

DROP POLICY IF EXISTS "Admin read cta_events" ON public.cta_events;
CREATE POLICY "Admin read cta_events"
ON public.cta_events FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- ==============================================================================
-- SEED 5 CORE SERVICE ZONES (IDEMPOTENT)
-- ==============================================================================
INSERT INTO public.service_zones (slug, name_en, name_bn, summary_en, summary_bn, featured_slug, places_text, sort_order, is_visible, status, published_at)
VALUES
  (
    'north-dhaka-zone',
    'North Dhaka Zone',
    'উত্তর ঢাকা জোন',
    'Dedicated mobile cleaning crews stationed daily across Uttara, Bashundhara, Nikunja, Khilkhet, and Kuril.',
    'উত্তরা, বসুন্ধরা, নিকুঞ্জ, খিলক্ষেত ও কুড়িল এলাকার বাসাবাড়ি ও ভবনে প্রতিদিন মোবাইল টিম সেবা দিচ্ছে।',
    'uttara',
    'Uttara (Sectors 1–18), Bashundhara R/A, Nikunja 1 & 2, Khilkhet, Kuril',
    1, true, 'published', now()
  ),
  (
    'diplomatic-commercial-zone',
    'Diplomatic & Commercial Zone',
    'ডিপ্লোম্যাটিক ও বাণিজ্যিক জোন',
    'Specialized high-hygiene operations for residential towers, offices, embassies, and commercial buildings in Gulshan, Banani, and Baridhara.',
    'গুলশান, বনানী, বারিধারা ও নিকেতনের আবাসিক টাওয়ার, দূতাবাস ও করপোরেট অফিসের জন্য বিশেষায়িত সেবা।',
    'gulshan',
    'Gulshan 1 & 2, Banani, Banani DOHS, Baridhara Diplomatic Zone, Niketan',
    2, true, 'published', now()
  ),
  (
    'central-west-dhaka-zone',
    'Central & West Dhaka Zone',
    'সেন্ট্রাল ও পশ্চিম ঢাকা জোন',
    'Fast dispatch for underground reservoirs, rooftop PVC/RCC tanks, and pipeline flushing across Dhanmondi, Mirpur, and Mohammadpur.',
    'ধানমন্ডি, মিরপুর, মোহাম্মদপুর, লালমাটিয়া ও তেজগাঁও এলাকার রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইন পরিষ্কার সেবা।',
    'dhanmondi',
    'Dhanmondi, Mirpur (1–14 & DOHS), Mohammadpur, Lalmatia, Tejgaon',
    3, true, 'published', now()
  ),
  (
    'east-south-dhaka-zone',
    'East & South Dhaka Zone',
    'পূর্ব ও দক্ষিণ ঢাকা জোন',
    'High-pressure mud extraction and water storage cleaning across Badda, Rampura, Banasree, Motijheel, and Old Dhaka.',
    'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মতিঝিল ও পুরান ঢাকার বাসাবাড়ি ও বাণিজ্যিক ভবনে নিয়মিত সেবা।',
    'badda',
    'Badda, Rampura, Banasree, Aftabnagar, Khilgaon, Motijheel, Puran Dhaka',
    4, true, 'published', now()
  ),
  (
    'greater-dhaka-corridor',
    'Greater Dhaka Corridor',
    'বৃহত্তর ঢাকা করিডোর',
    'Scheduled mobile team dispatch for residential and commercial buildings in Gazipur, Savar, and Narayanganj.',
    'ঢাকা সংলগ্ন গাজীপুর, সাভার ও নারায়ণগঞ্জ এলাকার আবাসিক ও বাণিজ্যিক ভবনে নির্ধারিত শিডিউলে সেবা।',
    'gazipur',
    'Gazipur (Tongi, Joydebpur, Chowrasta), Savar & Ashulia, Narayanganj (Chashara, Fatullah)',
    5, true, 'published', now()
  )
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- HARDEN RLS POLICIES (DROP PERMISSIVE ANON/AUTHENTICATED POLICIES FROM 20261106)
-- ==============================================================================

-- site_settings
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow manage site settings fallback" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage site settings" ON public.site_settings;
CREATE POLICY "Admin manage site settings"
ON public.site_settings FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- services
DROP POLICY IF EXISTS "Authenticated can manage services" ON public.services;
DROP POLICY IF EXISTS "Allow manage services fallback" ON public.services;
DROP POLICY IF EXISTS "Admin manage services" ON public.services;
CREATE POLICY "Admin manage services"
ON public.services FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- work_videos
DROP POLICY IF EXISTS "Authenticated can manage work videos" ON public.work_videos;
DROP POLICY IF EXISTS "Allow manage work videos fallback" ON public.work_videos;
DROP POLICY IF EXISTS "Admin manage work videos" ON public.work_videos;
CREATE POLICY "Admin manage work videos"
ON public.work_videos FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- special_offers
DROP POLICY IF EXISTS "Authenticated can manage special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Allow manage special offers fallback" ON public.special_offers;
DROP POLICY IF EXISTS "Admin manage special offers" ON public.special_offers;
CREATE POLICY "Admin manage special offers"
ON public.special_offers FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- services_faqs
DROP POLICY IF EXISTS "Authenticated can manage services faqs" ON public.services_faqs;
DROP POLICY IF EXISTS "Allow manage services faqs fallback" ON public.services_faqs;
DROP POLICY IF EXISTS "Admin manage services faqs" ON public.services_faqs;
CREATE POLICY "Admin manage services faqs"
ON public.services_faqs FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- blog_posts
DROP POLICY IF EXISTS "Authenticated can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow manage blog posts fallback" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin manage blog posts" ON public.blog_posts;
CREATE POLICY "Admin manage blog posts"
ON public.blog_posts FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- portfolio_projects
DROP POLICY IF EXISTS "Authenticated can manage portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow manage portfolio projects fallback" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admin manage portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Admin manage portfolio projects"
ON public.portfolio_projects FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- customer_reviews (keep public SELECT approved & public INSERT, restrict UPDATE/DELETE to admin)
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Allow admin delete fallback" ON public.customer_reviews;
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
