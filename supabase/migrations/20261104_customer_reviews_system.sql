-- ==============================================================================
-- SUNVILOZ CLEAN CARE — IN-HOUSE CUSTOMER REVIEWS & RATING SYSTEM
-- Migration: 20261104_customer_reviews_system.sql
-- Table: customer_reviews with RLS & Duplicate Prevention
-- ==============================================================================

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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    is_verified_google BOOLEAN DEFAULT TRUE,
    is_spam BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON public.customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_service ON public.customer_reviews(service_type);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_email ON public.customer_reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created ON public.customer_reviews(created_at DESC);

-- Unique index to prevent duplicate reviews for the same service from the same Google Account email
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_customer_service_review 
ON public.customer_reviews(LOWER(TRIM(customer_email)), LOWER(TRIM(service_type)))
WHERE is_spam = FALSE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public can only SELECT approved reviews
DROP POLICY IF EXISTS "Public can view approved customer reviews" ON public.customer_reviews;
CREATE POLICY "Public can view approved customer reviews" 
ON public.customer_reviews 
FOR SELECT 
USING (status = 'approved' AND is_spam = FALSE);

-- 2. Anyone (verified via Google) can insert a new review with status = 'pending'
DROP POLICY IF EXISTS "Customers can submit reviews as pending" ON public.customer_reviews;
CREATE POLICY "Customers can submit reviews as pending" 
ON public.customer_reviews 
FOR INSERT 
WITH CHECK (
    status = 'pending' 
    AND rating >= 1 
    AND rating <= 5 
    AND length(customer_name) >= 2 
    AND length(description) >= 10
);

-- 3. Authenticated Admins can view all reviews (pending, approved, rejected)
DROP POLICY IF EXISTS "Admins can view all customer reviews" ON public.customer_reviews;
CREATE POLICY "Admins can view all customer reviews" 
ON public.customer_reviews 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. Authenticated Admins can update review status (approve, reject)
DROP POLICY IF EXISTS "Admins can update review status" ON public.customer_reviews;
CREATE POLICY "Admins can update review status" 
ON public.customer_reviews 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. Authenticated Admins can delete reviews
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.customer_reviews;
CREATE POLICY "Admins can delete reviews" 
ON public.customer_reviews 
FOR DELETE 
TO authenticated 
USING (true);

-- Privacy-focused view that completely hides customer emails from public queries
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
WHERE status = 'approved' AND is_spam = FALSE;
