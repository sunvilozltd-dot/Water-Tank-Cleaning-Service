// ==============================================================================
// SUNVILOZ CLEAN CARE — SECURE SUPABASE EDGE FUNCTION: NOTIFY-LEAD
// Server-authoritative Resend Email Notification with Ownership Verification,
// Status Guarding, Atomic Locking, Persistent Rate Limiting, and Verified Domains
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// HTML Escaping to prevent injection in generated email templates
function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// In-memory fast tier rate limiting tracker (max 15 requests per minute per IP)
const inMemoryRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isMemoryRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const record = inMemoryRateLimitMap.get(clientIp);

  if (!record || now > record.resetAt) {
    inMemoryRateLimitMap.set(clientIp, { count: 1, resetAt: now + 60000 });
    return false;
  }

  if (record.count >= 15) {
    return true;
  }

  record.count += 1;
  return false;
}

// Cryptographic SHA-256 helper in Deno Web Crypto API
async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: Sleep for exponential backoff retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // 2. Client IP Resolution & Fast In-Memory Check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   "client_unknown";

  if (isMemoryRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const { leadId, eventType, ownershipToken, isRetry = false } = body;

    // 3. Strict Server-Side Payload Validation
    if (!leadId || typeof leadId !== "string" || !UUID_REGEX.test(leadId)) {
      return new Response(JSON.stringify({ error: "Invalid lead ID: Must be a valid UUID." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (eventType !== "complete_lead" && eventType !== "abandoned_lead") {
      return new Response(JSON.stringify({ error: "Invalid eventType: Must be complete_lead or abandoned_lead." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4. Server Secrets & Environment Configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const recipientEmail = Deno.env.get("NOTIFICATION_RECIPIENT_EMAIL") || "sunvilozltd@gmail.com";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[notify-lead] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
      return new Response(JSON.stringify({ error: "Internal server configuration error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase Admin Client using privileged Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 5. Persistent Abuse Protection via Database RPC
    try {
      const { data: allowed, error: rateLimitErr } = await supabaseAdmin.rpc("check_notification_rate_limit", {
        p_identifier: clientIp,
        p_max_requests: 12,
        p_window_seconds: 60
      });

      if (!rateLimitErr && allowed === false) {
        return new Response(JSON.stringify({ error: "Persistent rate limit exceeded. Please wait a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (e) {
      console.warn("[notify-lead] Persistent rate limit warning:", e);
    }

    // 6. Verify the lead exists in the Supabase Database
    const { data: lead, error: fetchErr } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (fetchErr || !lead) {
      return new Response(JSON.stringify({ error: "Lead record not found in database. Notification rejected." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 7. CRITICAL: Caller Authorization & Lead Ownership Verification
    // Check if caller has valid Supabase Admin JWT
    let isCallerAdmin = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwtToken = authHeader.replace("Bearer ", "").trim();
      const { data: userData } = await supabaseAdmin.auth.getUser(jwtToken);
      if (userData?.user?.id) {
        const { data: adminCheck } = await supabaseAdmin.rpc("is_admin", {
          user_id: userData.user.id
        });
        if (adminCheck === true) {
          isCallerAdmin = true;
        }
      }
    }

    // If caller is NOT an admin, verify ownership token!
    if (!isCallerAdmin) {
      if (!ownershipToken || typeof ownershipToken !== "string" || ownershipToken.trim().length < 16) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing lead ownership token." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (!lead.lead_token_hash) {
        return new Response(JSON.stringify({ error: "Unauthorized: Legacy lead record requires admin credentials." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const clientTokenHash = await sha256Hex(ownershipToken);
      if (clientTokenHash !== lead.lead_token_hash) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid lead ownership token." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 8. CRITICAL: Validate Lead Status Before Sending
    const leadStatusLower = (lead.status || "").toLowerCase();

    if (eventType === "complete_lead") {
      // Must NOT be incomplete or abandoned
      if (leadStatusLower === "incomplete" && !lead.is_synced_to_cloud) {
        return new Response(JSON.stringify({ 
          error: "Invalid lead status: Cannot trigger complete notification for an incomplete lead." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } else if (eventType === "abandoned_lead") {
      // Must actually be incomplete or marked abandoned
      if (leadStatusLower !== "incomplete" && !lead.is_abandoned) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Lead is already completed or confirmed. Abandoned notification skipped." 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Phone Validation: Customer must have provided at least 10 digits
    const cleanPhoneDigits = (lead.phone || "").replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10) {
      return new Response(JSON.stringify({ error: "Lead does not contain a valid contact phone number." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 9. ATOMIC NOTIFICATION CLAIM & LOCKING
    // Atomically claim the notification row so simultaneous requests CANNOT send duplicate emails
    const { data: claim, error: claimErr } = await supabaseAdmin.rpc("claim_lead_notification", {
      p_lead_id: leadId,
      p_notification_type: eventType,
      p_recipient: recipientEmail,
      p_is_retry: Boolean(isRetry),
      p_lock_seconds: 45
    });

    if (claimErr || !claim?.allowed) {
      const reason = claim?.reason || "claim_rejected";
      const message = claim?.message || "Notification request not permitted at this time.";

      return new Response(JSON.stringify({
        success: reason === "already_sent",
        status: reason === "already_sent" ? "sent" : "blocked",
        message
      }), {
        status: reason === "already_sent" ? 200 : 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const currentRetryCount = claim.retry_count || 0;

    // 10. RESEND CONFIGURATION CHECK: Require verified domain & API key
    if (!resendApiKey) {
      const errMsg = "RESEND_API_KEY is not configured in Supabase Secrets.";
      console.error(`[notify-lead] ${errMsg}`);

      await supabaseAdmin
        .from("lead_notifications")
        .update({
          status: "failed",
          error_message: errMsg,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq("lead_id", leadId)
        .eq("notification_type", eventType);

      return new Response(JSON.stringify({
        error: errMsg,
        status: "failed"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!resendFromEmail || resendFromEmail.includes("onboarding@resend.dev")) {
      const errMsg = "RESEND_FROM_EMAIL is not configured or uses unverified test domain. Set a verified domain sender in Supabase Secrets (e.g. alerts@sunviloz.com).";
      console.error(`[notify-lead] ${errMsg}`);

      await supabaseAdmin
        .from("lead_notifications")
        .update({
          status: "failed",
          error_message: errMsg,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq("lead_id", leadId)
        .eq("notification_type", eventType);

      return new Response(JSON.stringify({
        error: errMsg,
        status: "failed"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const senderEmail = resendFromEmail.trim();

    // 11. Construct Clean, Safe HTML Email
    const isComplete = eventType === "complete_lead";
    const subjectPrefix = isComplete ? "🚨 নতুন কোটেশন লিড (New Lead)" : "⚠️ অসম্পূর্ণ লিড ফলোআপ (Abandoned Step 1)";
    const subject = `${subjectPrefix}: ${escapeHtml(lead.customer_name)} (${cleanPhoneDigits}) - ${escapeHtml(lead.area || "Dhaka")}`;

    const rawWhatsapp = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(
      `আসসালামু আলাইকুম ${lead.customer_name || ""} ভাই। সানভিলোজ ক্লিন কেয়ার থেকে আপনার পানির ট্যাংক পরিষ্কারের কোটেশন রিকোয়েস্ট পেয়েছি।`
    )}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #123047; padding: 24px; color: #ffffff; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #38bdf8; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
          .badge-complete { background: #e8f5f3; color: #0d9488; }
          .badge-abandoned { background: #fef3c7; color: #b45309; }
          .content { padding: 24px; color: #172b3a; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .info-table td.label { font-weight: bold; color: #64748b; width: 35%; }
          .info-table td.value { font-weight: 600; color: #123047; }
          .actions { margin-top: 24px; text-align: center; }
          .btn-call { display: inline-block; background: #123047; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 8px; }
          .btn-wa { display: inline-block; background: #25d366; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge ${isComplete ? 'badge-complete' : 'badge-abandoned'}">
              ${isComplete ? 'COMPLETED QUOTE REQUEST' : 'INCOMPLETE DROP-OFF (STEP 1 CAPTURED)'}
            </span>
            <h1>SUNVILOZ CLEAN CARE</h1>
            <p>Water Tank Cleaning Service Lead Notification</p>
          </div>
          <div class="content">
            <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
              ${isComplete 
                ? 'ওয়েবসাইট থেকে নতুন একটি সম্পূর্ণ কোটেশন রিকোয়েস্ট এসেছে। দ্রুত গ্রাহকের সাথে যোগাযোগ করুন।' 
                : 'একজন গ্রাহক ১ম ধাপে নাম ও মোবাইল দিয়ে ড্রপ-অফ করেছেন। দ্রুত ফলোআপ করে বুকিং নিশ্চিত করুন।'}
            </p>
            <table class="info-table">
              <tr><td class="label">রেফারেন্স আইডি:</td><td class="value">${escapeHtml(lead.lead_number || "N/A")}</td></tr>
              <tr><td class="label">গ্রাহকের নাম:</td><td class="value">${escapeHtml(lead.customer_name)}</td></tr>
              <tr><td class="label">মোবাইল নম্বর:</td><td class="value"><a href="tel:${cleanPhoneDigits}" style="color: #0d9488; text-decoration: none; font-weight: bold;">${escapeHtml(lead.phone)}</a></td></tr>
              <tr><td class="label">সার্ভিস:</td><td class="value">${escapeHtml(lead.service_type || "Water Tank Cleaning")}</td></tr>
              <tr><td class="label">ট্যাংক ধরন:</td><td class="value">${escapeHtml(lead.tank_type || "N/A")}</td></tr>
              <tr><td class="label">ধারণক্ষমতা:</td><td class="value">${escapeHtml(lead.tank_capacity || "N/A")}</td></tr>
              <tr><td class="label">এলাকা:</td><td class="value">${escapeHtml(lead.area || "Dhaka")}</td></tr>
              <tr><td class="label">ঠিকানা:</td><td class="value">${escapeHtml(lead.address || "N/A")}</td></tr>
              <tr><td class="label">স্ট্যাটাস:</td><td class="value">${escapeHtml(lead.status || "New")}</td></tr>
              <tr><td class="label">তারিখ ও সময়:</td><td class="value">${escapeHtml(new Date(lead.created_at || Date.now()).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }))}</td></tr>
              <tr><td class="label">মন্তব্য/নোট:</td><td class="value">${escapeHtml(lead.message || "None")}</td></tr>
            </table>

            <div class="actions">
              <a href="tel:${cleanPhoneDigits}" class="btn-call">📞 সরাসরি কল করুন</a>
              <a href="${whatsappLink}" target="_blank" class="btn-wa">💬 WhatsApp ওপেন করুন</a>
            </div>
          </div>
          <div class="footer">
            SUNVILOZ CLEAN CARE &bull; Hotlines: 01609999612 &bull; Dhaka, Gazipur, Savar, Narayanganj
          </div>
        </div>
      </body>
      </html>
    `;

    // 12. Dispatch Email via Resend with In-Flight Exponential Backoff
    let lastError: any = null;
    let resendMessageId: string | null = null;
    const maxSendAttempts = 2;

    for (let attempt = 1; attempt <= maxSendAttempts; attempt++) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [recipientEmail],
            subject: subject,
            html: emailHtml
          })
        });

        const resendData = await resendResponse.json();

        if (resendResponse.ok && resendData?.id) {
          resendMessageId = resendData.id;
          break; // Success!
        } else {
          lastError = resendData;
          if (attempt < maxSendAttempts && (resendResponse.status >= 500 || resendResponse.status === 429)) {
            await sleep(1500 * attempt);
            continue;
          }
          break;
        }
      } catch (networkErr: any) {
        lastError = { message: networkErr?.message || "Network request failed" };
        if (attempt < maxSendAttempts) {
          await sleep(1500 * attempt);
          continue;
        }
      }
    }

    // 13. Update Database: ONLY mark 'sent' after Resend confirms delivery acceptance!
    if (resendMessageId) {
      await supabaseAdmin
        .from("lead_notifications")
        .update({
          status: "sent",
          resend_message_id: resendMessageId,
          sent_at: new Date().toISOString(),
          error_message: null,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq("lead_id", leadId)
        .eq("notification_type", eventType);

      return new Response(JSON.stringify({
        success: true,
        status: "sent",
        messageId: resendMessageId
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      console.error("[notify-lead] Resend delivery failed:", lastError);
      const cleanErrMsg = lastError?.message || "Failed to deliver email through email service.";
      
      // Calculate exponential backoff next_retry_at: 1m, 2m, 4m, 8m
      const backoffMinutes = Math.pow(2, currentRetryCount);
      const nextRetryAt = new Date(Date.now() + backoffMinutes * 60000).toISOString();

      await supabaseAdmin
        .from("lead_notifications")
        .update({
          status: "failed",
          error_message: cleanErrMsg,
          next_retry_at: nextRetryAt,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq("lead_id", leadId)
        .eq("notification_type", eventType);

      return new Response(JSON.stringify({
        error: cleanErrMsg,
        status: "failed",
        nextRetryAt
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (err: any) {
    console.error("[notify-lead] Unhandled server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error occurred while processing notification." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
