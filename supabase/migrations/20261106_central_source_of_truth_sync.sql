-- ==============================================================================
-- SUNVILOZ CLEAN CARE — CENTRAL SOURCE OF TRUTH & MULTI-DEVICE DATA SYNC
-- Migration: 20261106_central_source_of_truth_sync.sql
-- Enables persistent multi-device synchronization for all Admin Dynamic Content
-- ==============================================================================

-- 1. SITE SETTINGS TABLE (Master Site Configuration, Business Contacts, Hero Videos, SEO)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" 
ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
CREATE POLICY "Authenticated users can manage site settings" 
ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow service role / anon fallback if authorized via admin token
DROP POLICY IF EXISTS "Allow manage site settings fallback" ON public.site_settings;
CREATE POLICY "Allow manage site settings fallback"
ON public.site_settings FOR ALL TO anon USING (true) WITH CHECK (true);


-- 2. AUTHORITATIVE & CUSTOM SERVICES TABLE
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services" 
ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage services" ON public.services;
CREATE POLICY "Authenticated can manage services" 
ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage services fallback" ON public.services;
CREATE POLICY "Allow manage services fallback"
ON public.services FOR ALL TO anon USING (true) WITH CHECK (true);


-- 3. OUR WORK VIDEOS TABLE
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

DROP POLICY IF EXISTS "Public can view work videos" ON public.work_videos;
CREATE POLICY "Public can view work videos" 
ON public.work_videos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage work videos" ON public.work_videos;
CREATE POLICY "Authenticated can manage work videos" 
ON public.work_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage work videos fallback" ON public.work_videos;
CREATE POLICY "Allow manage work videos fallback"
ON public.work_videos FOR ALL TO anon USING (true) WITH CHECK (true);


-- 4. RUNNING SPECIAL OFFERS TABLE
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

DROP POLICY IF EXISTS "Public can view special offers" ON public.special_offers;
CREATE POLICY "Public can view special offers" 
ON public.special_offers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage special offers" ON public.special_offers;
CREATE POLICY "Authenticated can manage special offers" 
ON public.special_offers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage special offers fallback" ON public.special_offers;
CREATE POLICY "Allow manage special offers fallback"
ON public.special_offers FOR ALL TO anon USING (true) WITH CHECK (true);


-- 5. SERVICES FAQ TABLE
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

ALTER TABLE public.services_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services faqs" ON public.services_faqs;
CREATE POLICY "Public can view services faqs" 
ON public.services_faqs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage services faqs" ON public.services_faqs;
CREATE POLICY "Authenticated can manage services faqs" 
ON public.services_faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage services faqs fallback" ON public.services_faqs;
CREATE POLICY "Allow manage services faqs fallback"
ON public.services_faqs FOR ALL TO anon USING (true) WITH CHECK (true);


-- 6. BLOG POSTS TABLE
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

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated can manage blog posts" 
ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage blog posts fallback" ON public.blog_posts;
CREATE POLICY "Allow manage blog posts fallback"
ON public.blog_posts FOR ALL TO anon USING (true) WITH CHECK (true);


-- 7. PORTFOLIO PROJECTS TABLE
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

DROP POLICY IF EXISTS "Public can view portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can view portfolio projects" 
ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Authenticated can manage portfolio projects" 
ON public.portfolio_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage portfolio projects fallback" ON public.portfolio_projects;
CREATE POLICY "Allow manage portfolio projects fallback"
ON public.portfolio_projects FOR ALL TO anon USING (true) WITH CHECK (true);


-- 8. UPGRADE CUSTOMER REVIEWS (Instant Publishing & UUID Compatibility)
-- Modify customer_reviews to support both UUID and TEXT id seamlessly, and allow published status
ALTER TABLE public.customer_reviews DROP CONSTRAINT IF EXISTS customer_reviews_status_check;
ALTER TABLE public.customer_reviews ADD CONSTRAINT customer_reviews_status_check 
CHECK (status IN ('published', 'approved', 'pending', 'rejected'));

-- Update default status to 'published' for instant publishing without approval bottleneck
ALTER TABLE public.customer_reviews ALTER COLUMN status SET DEFAULT 'published';

-- Drop old strict policies
DROP POLICY IF EXISTS "Public can view approved customer reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Customers can submit reviews as pending" ON public.customer_reviews;
DROP POLICY IF EXISTS "Public can submit instant reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Public can view published customer reviews" ON public.customer_reviews;

-- 1. Public can view published non-spam reviews
CREATE POLICY "Public can view published customer reviews" 
ON public.customer_reviews FOR SELECT TO anon, authenticated
USING (status IN ('published', 'approved') AND is_spam = FALSE);

-- 2. Any customer can submit instant review with status = 'published'
CREATE POLICY "Public can submit instant reviews" 
ON public.customer_reviews FOR INSERT TO anon, authenticated 
WITH CHECK (
    status IN ('published', 'approved')
    AND rating >= 1 
    AND rating <= 5 
    AND length(trim(customer_name)) >= 2 
    AND length(trim(description)) >= 10
);

-- 3. Authenticated Admin can manage (view all, update, delete)
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.customer_reviews;
CREATE POLICY "Admins can manage all reviews" 
ON public.customer_reviews FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete fallback" ON public.customer_reviews;
CREATE POLICY "Allow admin delete fallback" 
ON public.customer_reviews FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- Realtime Publication: Enable realtime for tables so changes reflect across tabs and devices
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.work_videos;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_reviews;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.special_offers;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_header;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_sections;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
