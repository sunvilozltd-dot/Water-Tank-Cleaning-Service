-- ==============================================================================
-- SUNVILOZ CLEAN CARE — CASE STUDIES & EXTENDED SERVICE / AREA SEO FIELDS
-- Migration: 20261116_case_studies_and_seo_fields.sql
-- Purpose:
--   1. Adds case-study workflow columns (`slug`, `area_slug`, `status`,
--      `duration`, `customer_problem`, `work_done`, `actual_result`, captions,
--      SEO fields, `details` jsonb) to `public.portfolio_projects`.
--   2. Tightens `public.portfolio_projects` public SELECT RLS so anonymous/public
--      clients can ONLY read published projects with explicit customer consent.
--   3. Adds `extended_content` JSONB on `public.services` for structured scope,
--      excluded scope, customer prep, duration factors, pricing factors, and
--      verified optional price notes.
--   4. Reloads PostgREST schema cache (`NOTIFY pgrst, 'reload schema'`).
-- ==============================================================================

-- 1. Extend public.portfolio_projects for full Case Study publishing workflow
ALTER TABLE public.portfolio_projects
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS area_slug TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS customer_problem TEXT,
  ADD COLUMN IF NOT EXISTS customer_problem_bn TEXT,
  ADD COLUMN IF NOT EXISTS work_done TEXT,
  ADD COLUMN IF NOT EXISTS work_done_bn TEXT,
  ADD COLUMN IF NOT EXISTS actual_result TEXT,
  ADD COLUMN IF NOT EXISTS actual_result_bn TEXT,
  ADD COLUMN IF NOT EXISTS before_caption TEXT,
  ADD COLUMN IF NOT EXISTS before_caption_bn TEXT,
  ADD COLUMN IF NOT EXISTS after_caption TEXT,
  ADD COLUMN IF NOT EXISTS after_caption_bn TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure status constraint is safe and idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'portfolio_projects_status_check'
  ) THEN
    ALTER TABLE public.portfolio_projects
      ADD CONSTRAINT portfolio_projects_status_check
      CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_projects_slug_unique
  ON public.portfolio_projects (slug)
  WHERE slug IS NOT NULL AND length(trim(slug)) > 0;

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status_consent
  ON public.portfolio_projects (status, customer_consent_granted, service_date DESC);

-- Tighten RLS: public can ONLY view published case studies with explicit customer consent
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage portfolio projects fallback" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated can manage portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view portfolio projects" ON public.portfolio_projects;

CREATE POLICY "Public can view published consented portfolio projects"
ON public.portfolio_projects
FOR SELECT TO anon, authenticated
USING (
  COALESCE(status, 'published') = 'published'
  AND customer_consent_granted = true
);

DROP POLICY IF EXISTS "Admin manage portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Admin manage portfolio projects"
ON public.portfolio_projects
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 2. Extend public.services for structured included/excluded scope & pricing factors
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS extended_content JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
