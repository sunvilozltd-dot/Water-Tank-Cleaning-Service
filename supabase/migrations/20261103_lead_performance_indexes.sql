-- ==============================================================================
-- SUNVILOZ CLEAN CARE — LEAD TABLE PERFORMANCE & INDEX OPTIMIZATION
-- Migration: 20261103_lead_performance_indexes.sql
-- ==============================================================================

-- 1. Optimized B-Tree Indexes for fast pagination, filtering, and lookup
CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON public.leads (lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_area ON public.leads (area);
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON public.leads (service_type);

-- 2. Composite index for admin date-range & status filtering
CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON public.leads (status, created_at DESC);

-- 3. Audit log query performance index
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
