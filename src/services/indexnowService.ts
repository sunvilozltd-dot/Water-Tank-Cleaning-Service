import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { getProductionDomain } from '../config/siteDomain';

export interface IndexNowSubmissionResult {
  success: boolean;
  status: 'Pending' | 'Submitted' | 'Accepted' | 'Failed';
  outboxStatus?: 'queued' | 'processing' | 'submitted' | 'accepted' | 'failed' | 'dead_letter';
  httpStatus?: number;
  urlsCount: number;
  message: string;
  skipped?: boolean;
  disabled?: boolean;
  queued?: boolean;
}

export interface IndexNowOutboxSummary {
  queued: number;
  processing: number;
  submitted: number;
  accepted: number;
  failed: number;
  dead_letter: number;
}

export interface IndexNowSchedulerInfo {
  automaticRetryActive: boolean;
  cronSecretConfigured: boolean;
  serviceRoleConfigured: boolean;
  cronTriggerConfigured: boolean;
  schedule: string | null;
  lastRunAt: string | null;
  message: string;
}

export interface IndexNowServerStatus {
  configured: boolean;
  keyFormatValid: boolean;
  keyFileVerified: boolean;
  verificationFilePath: string | null;
  outboxSummary?: IndexNowOutboxSummary;
  scheduler?: IndexNowSchedulerInfo;
  message: string;
}

export interface IndexNowLogRecord {
  id: string;
  urls: string[];
  action: string;
  status: 'Pending' | 'Submitted' | 'Accepted' | 'Failed';
  http_status: number | null;
  attempts: number;
  response_detail: string | null;
  triggered_by: string | null;
  created_at: string;
}

export interface IndexNowOutboxRecord {
  id: string;
  urls: string[];
  action: string;
  entity_type: string | null;
  entity_slug: string | null;
  verify_public: boolean;
  status: 'queued' | 'processing' | 'submitted' | 'accepted' | 'failed' | 'dead_letter';
  attempts: number;
  max_attempts: number;
  next_retry_at: string;
  last_http_status: number | null;
  last_error: string | null;
  public_verified: boolean;
  triggered_by: string | null;
  processed_at: string | null;
  created_at: string;
}

export function buildCanonicalUrlsForIndexNow(inputs: string[]): string[] {
  const productionOrigin = getProductionDomain();
  const seen = new Set<string>();
  const valid: string[] = [];

  for (const raw of inputs) {
    if (!raw || typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    let fullUrl = '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.origin !== productionOrigin) continue;
        fullUrl = `${productionOrigin}${parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '')}`;
      } catch {
        continue;
      }
    } else {
      const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      fullUrl = `${productionOrigin}${normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+$/, '')}`;
    }

    if (/\/(admin|api|login|404)(\/|$)/i.test(fullUrl) || fullUrl.includes('?')) {
      continue;
    }

    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      valid.push(fullUrl);
    }
  }

  return valid;
}

export async function fetchIndexNowServerStatus(): Promise<IndexNowServerStatus> {
  const fallback: IndexNowServerStatus = {
    configured: false,
    keyFormatValid: false,
    keyFileVerified: false,
    verificationFilePath: null,
    message: 'IndexNow সার্ভার স্ট্যাটাস যাচাই করা যায়নি।'
  };

  if (!isSupabaseConfigured()) return fallback;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return fallback;

    const resp = await fetch('/api/indexnow', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!resp.ok) return fallback;

    const payload = await resp.json();
    return {
      configured: Boolean(payload?.configured),
      keyFormatValid: Boolean(payload?.keyFormatValid),
      keyFileVerified: Boolean(payload?.keyFileVerified),
      verificationFilePath: payload?.verificationFilePath || null,
      outboxSummary: payload?.outboxSummary,
      scheduler: payload?.scheduler,
      message: payload?.message || ''
    };
  } catch {
    return {
      ...fallback,
      message: 'IndexNow এন্ডপয়েন্ট এখন উপলব্ধ নয় (Vercel production/preview এনভায়রনমেন্টে সক্রিয় হয়)।'
    };
  }
}

export async function enqueueIndexNowUrls(
  pathsOrUrls: string[],
  options: {
    action?: string;
    entityType?: string;
    entitySlug?: string;
    verifyPublic?: boolean;
  } = {}
): Promise<IndexNowSubmissionResult> {
  const urls = buildCanonicalUrlsForIndexNow(pathsOrUrls);
  if (urls.length === 0) {
    return {
      success: true,
      skipped: true,
      status: 'Failed',
      urlsCount: 0,
      message: 'কোনো বৈধ পাবলিক ক্যানোনিকাল URL পাওয়া যায়নি।'
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      skipped: true,
      status: 'Failed',
      urlsCount: urls.length,
      message: 'Supabase সেশন কনফিগার করা নেই; IndexNow পিং স্কিপ করা হয়েছে।'
    };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      return {
        success: false,
        status: 'Failed',
        urlsCount: urls.length,
        message: 'শুধুমাত্র লগ-ইন করা অ্যাডমিন IndexNow পিং পাঠাতে পারবেন।'
      };
    }

    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        mode: 'enqueue',
        urls,
        action: options.action || 'admin_publish',
        entityType: options.entityType,
        entitySlug: options.entitySlug,
        verifyPublic: Boolean(options.verifyPublic)
      })
    });

    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (payload?.disabled || payload?.skipped) {
      return {
        success: false,
        disabled: true,
        skipped: true,
        status: 'Failed',
        httpStatus: response.status,
        urlsCount: urls.length,
        message: payload.message || 'IndexNow বন্ধ আছে (সার্ভারে INDEXNOW_KEY সেট করা নেই)।'
      };
    }

    if ((response.ok || response.status === 202) && payload) {
      return {
        success: Boolean(payload.success || payload.queued),
        queued: Boolean(payload.queued),
        outboxStatus: payload.outboxStatus,
        status: payload.status || 'Pending',
        httpStatus: payload.httpStatus || response.status,
        urlsCount: urls.length,
        message: payload.message || 'IndexNow আউটবক্সে URL যুক্ত হয়েছে।'
      };
    }

    return {
      success: false,
      outboxStatus: payload?.outboxStatus,
      status: 'Failed',
      httpStatus: response.status,
      urlsCount: urls.length,
      message: payload?.message || `IndexNow পিং ব্যর্থ হয়েছে (HTTP ${response.status})। মূল কনটেন্ট সেভ অক্ষত আছে।`
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'Failed',
      urlsCount: urls.length,
      message: err?.message || 'IndexNow নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। মূল কনটেন্ট সেভ অক্ষত আছে।'
    };
  }
}

export async function submitUrlsToIndexNow(
  pathsOrUrls: string[],
  action = 'admin_publish'
): Promise<IndexNowSubmissionResult> {
  return enqueueIndexNowUrls(pathsOrUrls, { action, verifyPublic: false });
}

export async function processIndexNowQueue(): Promise<{ success: boolean; processed: number; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, processed: 0, message: 'Supabase কনফিগার করা নেই।' };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      return { success: false, processed: 0, message: 'অ্যাডমিন সেশন প্রয়োজন।' };
    }
    const resp = await fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ mode: 'process_queue', limit: 20 })
    });
    const payload = await resp.json().catch(() => ({}));
    return {
      success: Boolean(resp.ok && payload?.success),
      processed: Number(payload?.processed || 0),
      message: payload?.message || 'কিউ প্রসেস সম্পন্ন হয়েছে।'
    };
  } catch (err: any) {
    return { success: false, processed: 0, message: err?.message || 'কিউ প্রসেস করা যায়নি।' };
  }
}

export async function fetchIndexNowLogs(limit = 30): Promise<IndexNowLogRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('indexnow_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as IndexNowLogRecord[];
  } catch {
    return [];
  }
}

export async function fetchIndexNowOutbox(limit = 30): Promise<IndexNowOutboxRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('indexnow_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as IndexNowOutboxRecord[];
  } catch {
    return [];
  }
}

export async function triggerSiteRebuild(): Promise<{
  success: boolean;
  configured?: boolean;
  triggered?: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase কনফিগার করা নেই।' };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      return { success: false, message: 'অ্যাডমিন লগ-ইন সেশন প্রয়োজন।' };
    }
    const resp = await fetch('/api/rebuild', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await resp.json().catch(() => ({}));
    return {
      success: Boolean(resp.ok && payload?.success),
      configured: payload?.configured,
      triggered: payload?.triggered,
      message: payload?.message || 'রিবিল্ড অনুরোধ সম্পন্ন হয়েছে।'
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'রিবিল্ড অনুরোধ ব্যর্থ হয়েছে।' };
  }
}
