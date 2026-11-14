import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = String(
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  ).trim();
  const supabaseServiceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({
      success: false,
      message: 'Server Supabase environment variables (SUPABASE_URL / VITE_SUPABASE_URL and SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY) are not configured.'
    });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing Bearer token.' });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid session token.' });
  }

  const adminDb = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : userClient;

  const { data: adminRow } = await adminDb
    .from('admin_users')
    .select('id, email, is_active')
    .eq('id', userData.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!adminRow) {
    return res.status(403).json({ success: false, message: 'Forbidden: Active admin role required.' });
  }

  const deployHookUrl = (process.env.VERCEL_DEPLOY_HOOK_URL || '').trim();
  if (!deployHookUrl) {
    return res.status(200).json({
      success: true,
      configured: false,
      triggered: false,
      message:
        'VERCEL_DEPLOY_HOOK_URL সেট করা নেই। তবে লাইভ SSR রুট (/api/render, /sitemap.xml, /llms.txt) সরাসরি Supabase থেকে তাৎক্ষণিক আপডেট পরিবেশন করছে।'
    });
  }

  try {
    const hookResp = await fetch(deployHookUrl, { method: 'POST' });
    if (!hookResp.ok) {
      const detail = await hookResp.text().catch(() => '');
      return res.status(502).json({
        success: false,
        configured: true,
        triggered: false,
        message: `Vercel deploy hook ত্রুটি (HTTP ${hookResp.status}): ${detail.slice(0, 200)}`
      });
    }

    return res.status(200).json({
      success: true,
      configured: true,
      triggered: true,
      message: 'স্ট্যাটিক বিল্ড রিজেনারেশন (Vercel Deploy Hook) সফলভাবে শুরু হয়েছে।'
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      configured: true,
      triggered: false,
      message: `Vercel deploy hook কল ব্যর্থ হয়েছে: ${err?.message || 'Network error'}`
    });
  }
}
