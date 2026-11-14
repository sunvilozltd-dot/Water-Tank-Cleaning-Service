import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_CANONICAL_ORIGIN = 'https://sunvilozcleancare.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY_REGEX = /^[a-zA-Z0-9-]{8,128}$/;

export interface IndexNowSchedulerStatus {
  automaticRetryActive: boolean;
  cronSecretConfigured: boolean;
  serviceRoleConfigured: boolean;
  cronTriggerConfigured: boolean;
  schedule: string | null;
  lastRunAt: string | null;
  message: string;
}

export function safeTokenEquals(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function computeSchedulerStatus(params: {
  cronSecret?: string;
  serviceRoleKey?: string;
  indexNowKey?: string;
  isVercelRuntime?: boolean;
  externalCronEnabled?: boolean;
  lastRunAt?: string | null;
}): IndexNowSchedulerStatus {
  const cronSecretConfigured = Boolean((params.cronSecret || '').trim());
  const serviceRoleConfigured = Boolean((params.serviceRoleKey || '').trim());
  const trimmedKey = (params.indexNowKey || '').trim();
  const keyReady = Boolean(trimmedKey && INDEXNOW_KEY_REGEX.test(trimmedKey));
  const cronTriggerConfigured = Boolean(params.isVercelRuntime || params.externalCronEnabled);

  const automaticRetryActive = Boolean(
    cronSecretConfigured && serviceRoleConfigured && keyReady && cronTriggerConfigured
  );

  const missing: string[] = [];
  if (!keyReady) missing.push('INDEXNOW_KEY');
  if (!cronSecretConfigured) missing.push('CRON_SECRET');
  if (!serviceRoleConfigured) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!cronTriggerConfigured) missing.push('Vercel/External Cron Runtime');

  return {
    automaticRetryActive,
    cronSecretConfigured,
    serviceRoleConfigured,
    cronTriggerConfigured,
    schedule: cronTriggerConfigured ? '0 3 * * *' : null,
    lastRunAt: params.lastRunAt || null,
    message: automaticRetryActive
      ? 'স্বয়ংক্রিয় IndexNow রিট্রাই শিডিউলার সক্রিয় আছে (Authenticated Cron: 0 3 * * *)।'
      : `স্বয়ংক্রিয় রিট্রাই নিষ্ক্রিয় — অনুপস্থিত: ${missing.join(', ')}। ম্যানুয়ালি "Process Outbox Queue" ব্যবহার করুন।`
  };
}

export type OutboxStatus = 'queued' | 'processing' | 'submitted' | 'accepted' | 'failed' | 'dead_letter';

export interface OutboxRecord {
  id: string;
  urls: string[];
  action: string;
  entity_type?: string | null;
  entity_slug?: string | null;
  verify_public: boolean;
  status: OutboxStatus;
  attempts: number;
  max_attempts: number;
  next_retry_at: string;
  last_http_status?: number | null;
  last_error?: string | null;
  public_verified?: boolean;
  batch_key?: string | null;
  triggered_by?: string | null;
}

export function getCanonicalOrigin(): string {
  const raw = String(process.env.VITE_SITE_URL || DEFAULT_CANONICAL_ORIGIN)
    .trim()
    .replace(/\/+$/, '');
  if (
    raw.startsWith('https://') &&
    !raw.includes('localhost') &&
    !raw.includes('vercel.app') &&
    !raw.includes('run.app')
  ) {
    return raw;
  }
  return DEFAULT_CANONICAL_ORIGIN;
}

export function validateAndDedupeUrls(rawUrls: unknown, canonicalOrigin: string): string[] {
  if (!Array.isArray(rawUrls)) return [];
  const seen = new Set<string>();
  const valid: string[] = [];

  for (const item of rawUrls) {
    if (typeof item !== 'string') continue;
    try {
      const parsed = new URL(item.trim());
      if (parsed.origin !== canonicalOrigin) continue;
      if (/\/(admin|api|login|404)(\/|$)/i.test(parsed.pathname)) continue;
      const cleanPath = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
      const canonical = `${canonicalOrigin}${cleanPath}`;
      if (!seen.has(canonical)) {
        seen.add(canonical);
        valid.push(canonical);
      }
    } catch {
      continue;
    }
  }

  return valid;
}

export function computeNextRetryAt(attempts: number, nowMs: number = Date.now()): string {
  // Exponential backoff in minutes capped at 60m: 1m, 2m, 4m, 8m, 16m...
  const delayMinutes = Math.min(60, Math.pow(2, Math.max(0, attempts - 1)));
  return new Date(nowMs + delayMinutes * 60 * 1000).toISOString();
}

export async function verifyPublicKeyFile(
  canonicalOrigin: string,
  indexNowKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ verified: boolean; detail: string }> {
  const keyLocation = `${canonicalOrigin}/${indexNowKey}.txt`;
  try {
    const resp = await fetchImpl(keyLocation, {
      method: 'GET',
      headers: { Accept: 'text/plain' }
    });
    if (!resp.ok) {
      return {
        verified: false,
        detail: `পাবলিক ভেরিফিকেশন ফাইল (${keyLocation}) পাওয়া যায়নি (HTTP ${resp.status})। Vercel-এ INDEXNOW_KEY সেট করে রিডিপ্লয় করুন।`
      };
    }
    const content = (await resp.text()).trim();
    if (content !== indexNowKey) {
      return {
        verified: false,
        detail: `ভেরিফিকেশন ফাইলের (${keyLocation}) মান সার্ভারের INDEXNOW_KEY-এর সাথে মিলছে না।`
      };
    }
    return { verified: true, detail: 'ভেরিফিকেশন ফাইল যাচাইকৃত।' };
  } catch (err: any) {
    return {
      verified: false,
      detail: `ভেরিফিকেশন ফাইল (${keyLocation}) যাচাই করা যায়নি: ${err?.message || 'Network error'}`
    };
  }
}

export async function verifyPublicUrlsReachable(
  urls: string[],
  fetchImpl: typeof fetch = fetch
): Promise<{ allReady: boolean; firstFailedUrl?: string; httpStatus?: number; error?: string }> {
  // Verify primary entity URLs (exclude homepage/hub pages if multiple, or check all up to 5)
  const sorted = [...urls].sort((a, b) => b.length - a.length).slice(0, 5);
  for (const url of sorted) {
    try {
      const resp = await fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'text/html' }
      });
      if (resp.status !== 200) {
        return {
          allReady: false,
          firstFailedUrl: url,
          httpStatus: resp.status,
          error: `Public URL ${url} returned HTTP ${resp.status} (not ready for IndexNow)`
        };
      }
    } catch (err: any) {
      return {
        allReady: false,
        firstFailedUrl: url,
        error: `Public URL ${url} check failed: ${err?.message || 'Network error'}`
      };
    }
  }
  return { allReady: true };
}

export async function processOutboxItem(
  db: SupabaseClient,
  item: OutboxRecord,
  options: {
    canonicalOrigin: string;
    indexNowKey: string;
    triggeredBy: string;
    fetchImpl?: typeof fetch;
  }
): Promise<{
  status: OutboxStatus;
  httpStatus: number | null;
  attempts: number;
  message: string;
}> {
  const fetchImpl = options.fetchImpl || fetch;
  const canonicalHost = new URL(options.canonicalOrigin).host;
  const validUrls = validateAndDedupeUrls(item.urls, options.canonicalOrigin).slice(0, 500);
  const nextAttempts = (item.attempts || 0) + 1;
  const maxAttempts = item.max_attempts || 5;

  if (validUrls.length === 0) {
    await db
      .from('indexnow_outbox')
      .update({
        status: 'dead_letter',
        attempts: nextAttempts,
        last_error: 'No valid canonical URLs',
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id);
    return { status: 'dead_letter', httpStatus: null, attempts: nextAttempts, message: 'কোনো বৈধ URL নেই।' };
  }

  // 1. Lock item to processing
  await db
    .from('indexnow_outbox')
    .update({ status: 'processing', attempts: nextAttempts })
    .eq('id', item.id);

  // 2. Verify key verification file
  const keyCheck = await verifyPublicKeyFile(options.canonicalOrigin, options.indexNowKey, fetchImpl);
  if (!keyCheck.verified) {
    const finalStatus: OutboxStatus = nextAttempts >= maxAttempts ? 'dead_letter' : 'failed';
    await db
      .from('indexnow_outbox')
      .update({
        status: finalStatus,
        attempts: nextAttempts,
        last_error: keyCheck.detail.slice(0, 500),
        next_retry_at: computeNextRetryAt(nextAttempts)
      })
      .eq('id', item.id);

    await db.from('indexnow_logs').insert([
      {
        urls: validUrls,
        action: item.action,
        status: 'Failed',
        http_status: null,
        attempts: nextAttempts,
        response_detail: keyCheck.detail.slice(0, 500),
        triggered_by: options.triggeredBy
      }
    ]);

    return { status: finalStatus, httpStatus: null, attempts: nextAttempts, message: keyCheck.detail };
  }

  // 3. Verify public URL returns HTTP 200 before publish notification (never notify bots of 404/stale drafts)
  let publicVerified = item.public_verified ?? false;
  if (item.verify_public) {
    const reachCheck = await verifyPublicUrlsReachable(validUrls, fetchImpl);
    if (!reachCheck.allReady) {
      const finalStatus: OutboxStatus = nextAttempts >= maxAttempts ? 'dead_letter' : 'queued';
      const detail = reachCheck.error || 'Public URL not ready yet';
      await db
        .from('indexnow_outbox')
        .update({
          status: finalStatus,
          attempts: nextAttempts,
          public_verified: false,
          last_http_status: reachCheck.httpStatus ?? null,
          last_error: detail.slice(0, 500),
          next_retry_at: computeNextRetryAt(nextAttempts)
        })
        .eq('id', item.id);

      return {
        status: finalStatus,
        httpStatus: reachCheck.httpStatus ?? null,
        attempts: nextAttempts,
        message: `পাবলিক পেজ এখনো প্রস্তুত নয় (${detail}); কিউতে রিট্রাই শিডিউল করা হয়েছে।`
      };
    }
    publicVerified = true;
  }

  // 4. Submit batch to IndexNow API
  const payload = {
    host: canonicalHost,
    key: options.indexNowKey,
    keyLocation: `${options.canonicalOrigin}/${options.indexNowKey}.txt`,
    urlList: validUrls
  };

  let httpStatus: number | null = null;
  let resultStatus: OutboxStatus = 'failed';
  let logStatus: 'Submitted' | 'Accepted' | 'Failed' = 'Failed';
  let detail = '';

  try {
    const apiRes = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    httpStatus = apiRes.status;
    const bodyText = await apiRes.text().catch(() => '');
    detail = bodyText ? bodyText.slice(0, 500) : `HTTP ${httpStatus}`;

    if (httpStatus === 200 || httpStatus === 202) {
      resultStatus = httpStatus === 202 ? 'accepted' : 'submitted';
      logStatus = httpStatus === 202 ? 'Accepted' : 'Submitted';
    } else {
      resultStatus = nextAttempts >= maxAttempts ? 'dead_letter' : 'failed';
      logStatus = 'Failed';
    }
  } catch (err: any) {
    detail = err?.message || 'IndexNow network error';
    resultStatus = nextAttempts >= maxAttempts ? 'dead_letter' : 'failed';
    logStatus = 'Failed';
  }

  const isSuccess = resultStatus === 'submitted' || resultStatus === 'accepted';

  await db
    .from('indexnow_outbox')
    .update({
      status: resultStatus,
      attempts: nextAttempts,
      public_verified: publicVerified,
      last_http_status: httpStatus,
      last_error: isSuccess ? null : detail,
      next_retry_at: isSuccess ? new Date().toISOString() : computeNextRetryAt(nextAttempts),
      processed_at: isSuccess ? new Date().toISOString() : null
    })
    .eq('id', item.id);

  await db.from('indexnow_logs').insert([
    {
      urls: validUrls,
      action: item.action,
      status: logStatus,
      http_status: httpStatus,
      attempts: nextAttempts,
      response_detail: detail,
      triggered_by: options.triggeredBy
    }
  ]);

  return {
    status: resultStatus,
    httpStatus,
    attempts: nextAttempts,
    message: isSuccess
      ? `${validUrls.length}টি URL সফলভাবে IndexNow-এ পাঠানো হয়েছে (${resultStatus}; এটি স্বয়ংক্রিয় ইনডেক্সিংয়ের নিশ্চয়তা নয়)।`
      : `IndexNow ডেলিভারি ব্যর্থ (${detail}) — রিট্রাই কিউতে সংরক্ষিত (${resultStatus})।`
  };
}

export async function processDueOutboxQueue(
  db: SupabaseClient,
  options: {
    canonicalOrigin: string;
    indexNowKey: string;
    triggeredBy: string;
    limit?: number;
    fetchImpl?: typeof fetch;
  }
) {
  const nowIso = new Date().toISOString();
  const { data: rows, error } = await db
    .from('indexnow_outbox')
    .select('*')
    .in('status', ['queued', 'failed'])
    .lte('next_retry_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(options.limit || 10);

  if (error || !Array.isArray(rows) || rows.length === 0) {
    return { processed: 0, results: [] as any[] };
  }

  const results = [];
  for (const row of rows) {
    const outboxRow = row as OutboxRecord;
    if ((outboxRow.attempts || 0) >= (outboxRow.max_attempts || 5)) continue;
    const res = await processOutboxItem(db, outboxRow, options);
    results.push({ id: outboxRow.id, ...res });
  }

  return { processed: results.length, results };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, status: 'Failed', message: 'Method not allowed' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = String(
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  ).trim();
  const supabaseServiceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
    return res.status(503).json({
      success: false,
      status: 'Failed',
      message: 'Server Supabase environment variables (SUPABASE_URL / VITE_SUPABASE_URL and SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY) are not configured.'
    });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  let isCronQuery = req.query?.cron === '1';
  if (!isCronQuery && typeof req.url === 'string') {
    try {
      const parsed = new URL(req.url, DEFAULT_CANONICAL_ORIGIN);
      isCronQuery = parsed.searchParams.get('cron') === '1';
    } catch {
      // ignore URL parse failure
    }
  }

  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const isCronAuthorized = Boolean(isCronQuery && cronSecret && token && safeTokenEquals(token, cronSecret));

  if (isCronQuery && !isCronAuthorized) {
    if (!cronSecret) {
      return res.status(503).json({
        success: false,
        status: 'Failed',
        message: 'Cron scheduler disabled: CRON_SECRET is not configured on the server.'
      });
    }
    return res.status(401).json({
      success: false,
      status: 'Failed',
      message: 'Unauthorized: Invalid CRON_SECRET Bearer token.'
    });
  }

  let adminDb: SupabaseClient;
  let triggeredBy = 'cron';

  if (isCronAuthorized) {
    if (!supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        message: 'SUPABASE_SERVICE_ROLE_KEY is required for background CRON_SECRET outbox processing.'
      });
    }
    adminDb = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } else {
    if (!token) {
      return res.status(401).json({
        success: false,
        status: 'Failed',
        message: 'Unauthorized: Missing admin Bearer token.'
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        status: 'Failed',
        message: 'Unauthorized: Invalid session token.'
      });
    }

    adminDb = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : userClient;

    const { data: adminRow } = await adminDb
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('id', userData.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminRow) {
      return res.status(403).json({
        success: false,
        status: 'Failed',
        message: 'Forbidden: Admin privileges required for IndexNow.'
      });
    }
    triggeredBy = userData.user.email || userData.user.id;
  }

  const canonicalOrigin = getCanonicalOrigin();
  const rawIndexNowKey = (process.env.INDEXNOW_KEY || '').trim();
  const isKeyConfigured = Boolean(rawIndexNowKey);
  const isKeyFormatValid = INDEXNOW_KEY_REGEX.test(rawIndexNowKey);

  // If invoked via cron=1 with valid CRON_SECRET, process due queue items
  if (isCronAuthorized) {
    if (!isKeyConfigured || !isKeyFormatValid) {
      return res.status(200).json({ skipped: true, reason: 'INDEXNOW_KEY not configured' });
    }
    const queueRes = await processDueOutboxQueue(adminDb, {
      canonicalOrigin,
      indexNowKey: rawIndexNowKey,
      triggeredBy: 'cron_outbox'
    });
    return res.status(200).json({ success: true, ...queueRes });
  }

  // Authenticated GET: return key status + scheduler status + outbox summary
  if (req.method === 'GET') {
    const [{ data: outboxRows }, { data: lastCronLogs }] = await Promise.all([
      adminDb
        .from('indexnow_outbox')
        .select('id, status')
        .order('created_at', { ascending: false })
        .limit(100),
      adminDb
        .from('indexnow_logs')
        .select('created_at')
        .eq('triggered_by', 'cron_outbox')
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    const summary = {
      queued: 0,
      processing: 0,
      submitted: 0,
      accepted: 0,
      failed: 0,
      dead_letter: 0
    };
    if (Array.isArray(outboxRows)) {
      for (const r of outboxRows as any[]) {
        if (r.status in summary) {
          summary[r.status as keyof typeof summary]++;
        }
      }
    }

    const scheduler = computeSchedulerStatus({
      cronSecret,
      serviceRoleKey: supabaseServiceKey,
      indexNowKey: rawIndexNowKey,
      isVercelRuntime: process.env.VERCEL === '1',
      externalCronEnabled: process.env.INDEXNOW_CRON_ENABLED === 'true',
      lastRunAt: Array.isArray(lastCronLogs) && lastCronLogs[0]?.created_at ? lastCronLogs[0].created_at : null
    });

    if (!isKeyConfigured) {
      return res.status(200).json({
        configured: false,
        keyFormatValid: false,
        keyFileVerified: false,
        verificationFilePath: null,
        outboxSummary: summary,
        scheduler,
        message: 'IndexNow বন্ধ আছে (সার্ভার এনভায়রনমেন্টে INDEXNOW_KEY সেট করা নেই)।'
      });
    }
    if (!isKeyFormatValid) {
      return res.status(200).json({
        configured: true,
        keyFormatValid: false,
        keyFileVerified: false,
        verificationFilePath: null,
        outboxSummary: summary,
        scheduler,
        message: 'INDEXNOW_KEY ফরম্যাট সঠিক নয় (৮–১২৮ অক্ষরের ইংরেজি বর্ণ, সংখ্যা বা হাইফেন হতে হবে)।'
      });
    }
    const check = await verifyPublicKeyFile(canonicalOrigin, rawIndexNowKey);
    return res.status(200).json({
      configured: true,
      keyFormatValid: true,
      keyFileVerified: check.verified,
      verificationFilePath: `/${rawIndexNowKey}.txt`,
      outboxSummary: summary,
      scheduler,
      message: check.verified
        ? `IndexNow সক্রিয় এবং ভেরিফিকেশন ফাইল (/${rawIndexNowKey}.txt) যাচাইকৃত।`
        : check.detail
    });
  }

  // POST: disabled when INDEXNOW_KEY missing
  if (!isKeyConfigured) {
    return res.status(200).json({
      success: false,
      disabled: true,
      skipped: true,
      status: 'Failed',
      urlsCount: 0,
      message: 'IndexNow বন্ধ আছে (সার্ভারে INDEXNOW_KEY সেট করা নেই)। মূল কনটেন্ট ও ওয়েবসাইট স্বাভাবিকভাবে কাজ করছে।'
    });
  }

  if (!isKeyFormatValid) {
    return res.status(400).json({
      success: false,
      status: 'Failed',
      urlsCount: 0,
      message: 'সার্ভারে সেট করা INDEXNOW_KEY ফরম্যাট অবৈধ (৮–১২৮ অক্ষরের a-z, A-Z, 0-9, - হতে হবে)।'
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const mode = body.mode === 'process_queue' ? 'process_queue' : body.mode === 'enqueue' ? 'enqueue' : 'submit';

  if (mode === 'process_queue') {
    const queueRes = await processDueOutboxQueue(adminDb, {
      canonicalOrigin,
      indexNowKey: rawIndexNowKey,
      triggeredBy,
      limit: Number(body.limit) || 10
    });
    return res.status(200).json({
      success: true,
      processed: queueRes.processed,
      results: queueRes.results,
      message:
        queueRes.processed > 0
          ? `${queueRes.processed}টি IndexNow কিউ কাজ প্রসেস করা হয়েছে।`
          : 'প্রসেস করার মতো কোনো বকেয়া কিউ আইটেম নেই।'
    });
  }

  const validUrls = validateAndDedupeUrls(body.urls, canonicalOrigin);
  const action = typeof body.action === 'string' ? body.action.slice(0, 64) : 'admin_publish';
  const entityType = typeof body.entityType === 'string' ? body.entityType.slice(0, 64) : null;
  const entitySlug = typeof body.entitySlug === 'string' ? body.entitySlug.slice(0, 128) : null;
  const verifyPublic = Boolean(body.verifyPublic);

  if (validUrls.length === 0) {
    return res.status(400).json({
      success: false,
      status: 'Failed',
      message: 'No valid canonical production URLs supplied.'
    });
  }

  const batchUrls = validUrls.slice(0, 500);
  const batchKey = `${action}:${batchUrls.join('|').slice(0, 200)}`;

  // Deduplicate recently queued/submitted identical batch within last 60 seconds
  try {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: existing } = await adminDb
      .from('indexnow_outbox')
      .select('id, status')
      .eq('batch_key', batchKey)
      .gte('created_at', oneMinuteAgo)
      .in('status', ['queued', 'processing'])
      .limit(1);

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(202).json({
        success: true,
        queued: true,
        deduplicated: true,
        status: 'Pending',
        urlsCount: batchUrls.length,
        message: 'এই URL ব্যাচটি ইতিমধ্যেই IndexNow আউটবক্স কিউতে অপেক্ষমাণ রয়েছে।'
      });
    }
  } catch {
    // Non-blocking dedupe check
  }

  const { data: insertedRow, error: insertError } = await adminDb
    .from('indexnow_outbox')
    .insert([
      {
        urls: batchUrls,
        action,
        entity_type: entityType,
        entity_slug: entitySlug,
        verify_public: verifyPublic,
        status: 'queued',
        attempts: 0,
        max_attempts: 5,
        next_retry_at: new Date().toISOString(),
        batch_key: batchKey,
        triggered_by: triggeredBy
      }
    ])
    .select('*')
    .single();

  if (insertError || !insertedRow) {
    return res.status(500).json({
      success: false,
      status: 'Failed',
      urlsCount: batchUrls.length,
      message: `IndexNow আউটবক্সে সংরক্ষণ ব্যর্থ হয়েছে: ${insertError?.message || 'Unknown DB error'}`
    });
  }

  // Dispatch immediately (non-blocking relative to content save) and update outbox + logs honestly
  const dispatchRes = await processOutboxItem(adminDb, insertedRow as OutboxRecord, {
    canonicalOrigin,
    indexNowKey: rawIndexNowKey,
    triggeredBy
  });

  const isSuccess = dispatchRes.status === 'submitted' || dispatchRes.status === 'accepted';
  const uiStatus: 'Pending' | 'Submitted' | 'Accepted' | 'Failed' =
    dispatchRes.status === 'accepted'
      ? 'Accepted'
      : dispatchRes.status === 'submitted'
      ? 'Submitted'
      : dispatchRes.status === 'queued'
      ? 'Pending'
      : 'Failed';

  return res.status(isSuccess ? 200 : dispatchRes.status === 'queued' ? 202 : 502).json({
    success: isSuccess,
    queued: dispatchRes.status === 'queued',
    outboxStatus: dispatchRes.status,
    status: uiStatus,
    httpStatus: dispatchRes.httpStatus,
    attempts: dispatchRes.attempts,
    urlsCount: batchUrls.length,
    message: dispatchRes.message
  });
}
