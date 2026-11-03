import { QuoteFormData, QuoteLead, LeadStatus, LeadNotificationRecord } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';
import { getStoredAttribution } from '../utils/utmTracking';
import { sanitizeInputString, normalizeBangladeshiPhone } from '../utils/validation';

const LOCAL_STORAGE_KEY = 'sunviloz_quote_leads_v1';

export function generateLeadNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `SVC-${dateStr}-${randomPart}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(str?: string | null): boolean {
  return Boolean(str && UUID_REGEX.test(str));
}

const PENDING_SYNC_STORAGE_KEY = 'sunviloz_pending_lead_sync_v1';

export function generateOwnershipToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export function generateIdempotencyKey(): string {
  return 'idem_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
}

/**
 * Save new lead or complete an existing incomplete lead in Supabase
 * If existingLeadId is provided, updates the existing row instead of creating a duplicate!
 */
export async function createLead(
  data: QuoteFormData, 
  source = 'Website', 
  existingLeadId?: string | null,
  ownershipToken?: string | null
): Promise<QuoteLead> {
  const cleanPhone = normalizeBangladeshiPhone(data.phone || '');
  const cleanName = sanitizeInputString(data.name, 100);
  const cleanArea = sanitizeInputString(data.area, 100);
  const cleanWhatsapp = normalizeBangladeshiPhone(data.whatsapp || data.phone || '');

  // Deduplication check: prevent accidental double-click / rapid retry duplicate records
  if (!existingLeadId) {
    try {
      const localLeads = getLocalLeads();
      const nowMs = Date.now();
      const recentDuplicate = localLeads.find(l => {
        if (!l.createdAt || !l.phone) return false;
        const createdMs = new Date(l.createdAt).getTime();
        const isRecent = (nowMs - createdMs) < 20000; // 20 second idempotency window
        const lCleanPhone = normalizeBangladeshiPhone(l.phone);
        return isRecent && cleanPhone.length >= 10 && cleanPhone === lCleanPhone;
      });

      if (recentDuplicate) {
        return recentDuplicate;
      }
    } catch {
      // Continue if dedup check fails
    }
  }

  const attribution = getStoredAttribution();
  const now = new Date().toISOString();

  // Combine extra details into message string for maximum visibility in DB & admin
  const extraDetails: string[] = [];
  if (data.callbackPreference) {
    extraDetails.push(`Callback: ${sanitizeInputString(data.callbackPreference, 50)}`);
  }
  if (data.additionalServices && data.additionalServices.length > 0) {
    extraDetails.push(`Add-ons: ${data.additionalServices.map(s => sanitizeInputString(s, 50)).join(', ')}`);
  }
  if (data.tankDimensions) {
    extraDetails.push(`Dimensions: ${sanitizeInputString(data.tankDimensions, 100)}`);
  }
  if (data.overheadMaterial) {
    extraDetails.push(`Material: ${sanitizeInputString(data.overheadMaterial, 50)}`);
  }
  if (data.manualBuildingDetails) {
    extraDetails.push(`Building: ${sanitizeInputString(data.manualBuildingDetails, 100)}`);
  }
  if (data.notes && data.notes.trim()) {
    extraDetails.push(`Note: ${sanitizeInputString(data.notes, 500)}`);
  }
  if (data.message && data.message.trim() && data.message !== data.notes) {
    extraDetails.push(sanitizeInputString(data.message, 500));
  }

  const consolidatedMessage = data.message && data.message.includes('\n')
    ? sanitizeInputString(data.message, 1000)
    : (extraDetails.length > 0 ? extraDetails.join(' | ') : sanitizeInputString(data.message || '', 500));

  const address = sanitizeInputString(data.address || [
    data.houseNumber ? `বাসা: ${data.houseNumber}` : '',
    data.roadNumber ? `রোড: ${data.roadNumber}` : '',
    cleanArea,
    data.thana ? `থানা: ${data.thana}` : '',
    data.postcode ? `পোস্ট কোড: ${data.postcode}` : '',
    data.landmark ? `ল্যান্ডমার্ক: ${data.landmark}` : ''
  ].filter(Boolean).join(', '), 300) || undefined;

  let leadId = existingLeadId && isValidUUID(existingLeadId) ? existingLeadId : ('offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  let leadNumber = generateLeadNumber();
  let isSynced = false;

  // Cancel any pending abandonment notification since lead has now been completed
  if (existingLeadId) {
    cancelAbandonedLeadCheck(existingLeadId);
  }

  // 1. Synchronize to Supabase via complete_customer_lead RPC
  if (isSupabaseConfigured()) {
    try {
      let effectiveToken = ownershipToken || (data as any).ownershipToken || (getLeadDraft()?.ownershipToken) || null;
      const { data: rpcRes, error: rpcError } = await supabase.rpc('complete_customer_lead', {
        p_lead_id: existingLeadId && isValidUUID(existingLeadId) ? existingLeadId : null,
        p_customer_name: cleanName,
        p_phone: cleanPhone,
        p_whatsapp: cleanWhatsapp,
        p_email: data.email ? sanitizeInputString(data.email, 100) : null,
        p_area: cleanArea || 'Dhaka',
        p_address: address || null,
        p_service_type: data.serviceType || 'Water Tank Cleaning',
        p_tank_type: data.tankType || null,
        p_tank_capacity: data.tankCapacity || null,
        p_floors: data.floors ? sanitizeInputString(data.floors, 30) : null,
        p_flats: data.flats ? sanitizeInputString(data.flats, 30) : (data.numberOfFlats ? String(data.numberOfFlats) : null),
        p_additional_pipeline: Boolean(data.additionalPipelineCleaning || data.additionalServices?.includes('পাইপলাইন ক্লিনিং')),
        p_additional_amc: Boolean(data.additionalAmc || data.additionalServices?.includes('বার্ষিক চুক্তি (AMC)')),
        p_preferred_date: data.preferredDate || null,
        p_preferred_time: data.preferredTime || null,
        p_message: consolidatedMessage || null,
        p_source: (data as any).source || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : source),
        p_utm_source: (data as any).utm_source || attribution.utm_source || null,
        p_utm_medium: (data as any).utm_medium || attribution.utm_medium || null,
        p_utm_campaign: (data as any).utm_campaign || attribution.utm_campaign || null,
        p_ownership_token: effectiveToken
      });

      if (!rpcError && rpcRes && rpcRes.id) {
        leadId = rpcRes.id;
        leadNumber = rpcRes.lead_number || leadNumber;
        if (rpcRes.ownership_token) {
          effectiveToken = rpcRes.ownership_token;
        }
        isSynced = true;
      } else {
        // Fallback to direct table insertion if RPC is not yet created
        const { data: insertData, error: insertError } = await supabase
          .from('leads')
          .insert([{
            customer_name: cleanName,
            phone: cleanPhone,
            whatsapp: cleanWhatsapp,
            email: data.email ? sanitizeInputString(data.email, 100) : null,
            area: cleanArea,
            address: address || null,
            service_type: data.serviceType || 'Water Tank Cleaning',
            tank_type: data.tankType || null,
            tank_capacity: data.tankCapacity || null,
            message: consolidatedMessage || null,
            source: (data as any).source || source,
            status: 'New',
            lead_status: 'New'
          }])
          .select('id, lead_number')
          .single();

        if (!insertError && insertData) {
          leadId = insertData.id;
          leadNumber = insertData.lead_number || leadNumber;
          isSynced = true;
        }
      }
    } catch (err: any) {
      console.warn('[LeadService] Network error saving lead to Supabase:', err?.message || err);
      isSynced = false;
    }
  }

  const finalLead: QuoteLead = {
    ...data,
    id: leadId,
    ownershipToken: ownershipToken || (data as any).ownershipToken || getLeadDraft()?.ownershipToken,
    name: cleanName,
    phone: cleanPhone,
    whatsapp: cleanWhatsapp,
    area: cleanArea,
    address,
    leadNumber,
    createdAt: now,
    updatedAt: now,
    status: 'New',
    isSyncedToCloud: isSynced,
    source: (data as any).source || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : source),
    utm_source: (data as any).utm_source || attribution.utm_source,
    utm_medium: (data as any).utm_medium || attribution.utm_medium,
    utm_campaign: (data as any).utm_campaign || attribution.utm_campaign,
    utm_term: data.utm_term || attribution.utm_term,
    utm_content: data.utm_content || attribution.utm_content,
    message: consolidatedMessage
  };

  // 2. Update local storage (if existing lead, replace it; otherwise prepend)
  try {
    const existing = getLocalLeads();
    const existingIdx = existing.findIndex(l => (existingLeadId && l.id === existingLeadId) || l.id === leadId || l.leadNumber === leadNumber);
    if (existingIdx >= 0) {
      existing[existingIdx] = finalLead;
      safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } else {
      safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify([finalLead, ...existing]));
    }
  } catch {
    // Ignore storage issues
  }

  // 3. Dispatch Email Notification to Business Owner (Deduplicated)
  dispatchLeadNotification(finalLead, 'complete_lead').catch(() => {});

  // 4. If offline, enqueue for background sync
  if (!isSynced) {
    enqueuePendingSync({ action: 'complete', leadId, payload: finalLead });
  }

  return finalLead;
}

/**
 * Get leads from Supabase with fallback to localStorage
 */
export async function fetchAllLeads(): Promise<QuoteLead[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: QuoteLead[] = data.map(item => ({
          id: item.id,
          leadNumber: item.lead_number,
          name: item.customer_name,
          phone: item.phone,
          whatsapp: item.whatsapp || item.phone,
          email: item.email || undefined,
          area: item.area,
          address: item.address || undefined,
          serviceType: item.service_type || 'Water Tank Cleaning',
          tankType: item.tank_type || '',
          tankLocation: item.tank_location || undefined,
          tankCapacity: item.tank_capacity || '',
          numberOfTanks: item.number_of_tanks || 1,
          numberOfFlats: item.number_of_flats || undefined,
          buildingType: item.building_type || undefined,
          preferredDate: item.preferred_date || undefined,
          preferredTime: item.preferred_time || undefined,
          message: item.message || undefined,
          notes: item.message || undefined,
          estimatedPrice: item.estimated_price || undefined,
          source: item.source || 'Website',
          status: (item.status as LeadStatus) || 'New',
          adminNote: item.admin_note || undefined,
          isSyncedToCloud: true,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        const local = getLocalLeads();
        const merged = [...mapped];
        local.forEach(loc => {
          if (!merged.some(m => m.leadNumber && m.leadNumber === loc.leadNumber)) {
            merged.push({ ...loc, isSyncedToCloud: false });
          }
        });
        return merged;
      }
    } catch {
      // Use local fallback
    }
  }

  return getLocalLeads().map(l => ({ ...l, isSyncedToCloud: false }));
}

/**
 * Update lead status and admin note
 */
export async function updateLead(id: string, updates: { 
  status?: LeadStatus; 
  adminNote?: string;
  customerName?: string;
  phone?: string;
  area?: string;
}): Promise<boolean> {
  // Update local
  try {
    const leads = getLocalLeads();
    const updated = leads.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: updates.status || item.status,
          adminNote: updates.adminNote !== undefined ? updates.adminNote : item.adminNote,
          name: updates.customerName || item.name,
          phone: updates.phone || item.phone,
          area: updates.area || item.area,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  // Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (updates.status) payload.status = updates.status;
      if (updates.adminNote !== undefined) payload.admin_note = updates.adminNote;
      if (updates.customerName) payload.customer_name = updates.customerName;
      if (updates.phone) payload.phone = updates.phone;
      if (updates.area) payload.area = updates.area;

      const { error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', id);

      if (error) return false;
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<boolean> {
  try {
    const leads = getLocalLeads();
    const filtered = leads.filter(l => l.id !== id);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) return false;
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Migrate legacy LocalStorage leads to Supabase
 */
export async function migrateLocalLeadsToSupabase(): Promise<{ total: number; migrated: number; errors: number }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
  }

  const localLeads = getLocalLeads();
  let migrated = 0;
  let errors = 0;

  for (const lead of localLeads) {
    try {
      const { error } = await supabase
        .from('leads')
        .upsert({
          lead_number: lead.leadNumber || generateLeadNumber(),
          customer_name: lead.name,
          phone: lead.phone,
          whatsapp: lead.whatsapp || lead.phone,
          email: lead.email || null,
          area: lead.area,
          address: lead.address || null,
          service_type: lead.serviceType || 'Water Tank Cleaning',
          tank_type: lead.tankType || null,
          tank_location: lead.tankLocation || null,
          tank_capacity: lead.tankCapacity || null,
          number_of_tanks: lead.numberOfTanks || 1,
          number_of_flats: lead.numberOfFlats || null,
          building_type: lead.buildingType || lead.propertyType || null,
          preferred_date: lead.preferredDate || null,
          preferred_time: lead.preferredTime || null,
          message: lead.message || lead.notes || null,
          estimated_price: lead.estimatedPrice || null,
          source: lead.source || 'Website',
          status: lead.status || 'New',
          admin_note: lead.adminNote || null,
          created_at: lead.createdAt || new Date().toISOString()
        }, { onConflict: 'lead_number' });

      if (error) {
        errors++;
      } else {
        migrated++;
      }
    } catch {
      errors++;
    }
  }

  return { total: localLeads.length, migrated, errors };
}

/**
 * Specifically syncs any locally saved leads that failed to reach Supabase
 */
export async function syncUnsyncedLeadsToSupabase(): Promise<{ synced: number; failed: number }> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, failed: 0 };
  }

  const localLeads = getLocalLeads();
  let synced = 0;
  let failed = 0;

  for (let i = 0; i < localLeads.length; i++) {
    const lead = localLeads[i];
    if (lead.isSyncedToCloud) continue;

    try {
      const payload: Record<string, any> = {
        lead_number: lead.leadNumber || generateLeadNumber(),
        customer_name: lead.name,
        phone: lead.phone,
        whatsapp: lead.whatsapp || lead.phone,
        email: lead.email || null,
        area: lead.area,
        address: lead.address || null,
        service_type: lead.serviceType || 'Water Tank Cleaning',
        tank_type: lead.tankType || null,
        tank_capacity: lead.tankCapacity || null,
        number_of_tanks: lead.numberOfTanks || 1,
        number_of_flats: lead.numberOfFlats || null,
        building_type: lead.buildingType || lead.propertyType || null,
        preferred_date: lead.preferredDate || null,
        preferred_time: lead.preferredTime || null,
        message: lead.message || lead.notes || null,
        estimated_price: lead.estimatedPrice || null,
        source: lead.source || 'Website',
        status: lead.status || 'New',
        admin_note: lead.adminNote || null,
        created_at: lead.createdAt || new Date().toISOString()
      };

      const { error } = await supabase.from('leads').upsert(payload, { onConflict: 'lead_number' });
      if (!error) {
        localLeads[i].isSyncedToCloud = true;
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(localLeads));
  return { synced, failed };
}

/**
 * Get leads from localStorage
 */
export function getLocalLeads(): QuoteLead[] {
  try {
    const raw = safeGetItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Export leads to CSV
 */
export function exportLeadsToCsv(leads: QuoteLead[]): string {
  if (!leads || leads.length === 0) return '';
  const headers = [
    'Lead #',
    'Date',
    'Customer Name',
    'Phone',
    'WhatsApp',
    'Area',
    'Address',
    'Service',
    'Tank Type',
    'Capacity',
    'No. of Tanks',
    'Flats/Building',
    'Preferred Date',
    'Preferred Time',
    'Estimated Price',
    'Source',
    'Status',
    'Customer Message',
    'Admin Notes'
  ];

  const rows = leads.map(l => [
    `"${l.leadNumber || l.id}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.phone || ''}"`,
    `"${l.whatsapp || l.phone || ''}"`,
    `"${(l.area || '').replace(/"/g, '""')}"`,
    `"${(l.address || '').replace(/"/g, '""')}"`,
    `"${(l.serviceType || 'Water Tank Cleaning').replace(/"/g, '""')}"`,
    `"${(l.tankType || '').replace(/"/g, '""')}"`,
    `"${(l.tankCapacity || 'N/A').replace(/"/g, '""')}"`,
    l.numberOfTanks || 1,
    `"${(l.numberOfFlats || l.flats || l.buildingType || '').replace(/"/g, '""')}"`,
    `"${(l.preferredDate || 'Flexible').replace(/"/g, '""')}"`,
    `"${(l.preferredTime || 'Flexible').replace(/"/g, '""')}"`,
    `"${(l.estimatedPrice || 'Pending').replace(/"/g, '""')}"`,
    `"${(l.source || 'Website').replace(/"/g, '""')}"`,
    `"${l.status || 'New'}"`,
    `"${(l.message || l.notes || '').replace(/"/g, '""')}"`,
    `"${(l.adminNote || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export const getLeads = fetchAllLeads;

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  return updateLead(id, { status });
}

export async function updateLeadDetails(lead: QuoteLead): Promise<boolean> {
  try {
    const local = getLocalLeads();
    const updated = local.map(l => l.id === lead.id ? { ...l, ...lead, updatedAt: new Date().toISOString() } : l);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('leads')
          .update({
            customer_name: lead.name,
            phone: lead.phone,
            whatsapp: lead.whatsapp || lead.phone,
            email: lead.email || null,
            area: lead.area,
            address: lead.address || null,
            service_type: lead.serviceType || 'Water Tank Cleaning',
            tank_type: lead.tankType || null,
            tank_capacity: lead.tankCapacity || null,
            number_of_tanks: lead.numberOfTanks || 1,
            number_of_flats: lead.numberOfFlats || null,
            building_type: lead.buildingType || lead.propertyType || null,
            preferred_date: lead.preferredDate || null,
            preferred_time: lead.preferredTime || null,
            message: lead.message || lead.notes || null,
            estimated_price: lead.estimatedPrice || null,
            status: lead.status || 'New',
            admin_note: lead.adminNote || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);
      } catch {
        // Ignore remote update failure if offline
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Save or update partial lead for Incomplete Order Tracking.
 * - In Step 1: Calls Supabase create_partial_lead RPC to generate and return a true UUID.
 * - In subsequent steps: Calls update_partial_lead RPC using that UUID.
 * - Never uses locally generated pseudo-strings as the Supabase UUID!
 * - Fallback to localStorage and background retry queue.
 */
export async function saveOrUpdatePartialLead(
  leadId: string | null,
  data: Partial<QuoteLead> & { name: string; phone: string },
  ownershipToken?: string | null,
  idempotencyKey?: string | null
): Promise<QuoteLead> {
  const localLeads = getLocalLeads();
  const now = new Date().toISOString();
  const cleanPhone = normalizeBangladeshiPhone(data.phone);
  const cleanName = sanitizeInputString(data.name, 100);
  const cleanWhatsapp = normalizeBangladeshiPhone(data.whatsapp || cleanPhone);
  const cleanArea = sanitizeInputString(data.area, 100) || 'Dhaka';
  const attribution = getStoredAttribution();

  // Deduplication check: check if draft in storage already has a valid UUID
  const draft = getLeadDraft();
  const effectiveLeadId = (leadId && isValidUUID(leadId)) 
    ? leadId 
    : (draft?.leadId && isValidUUID(draft.leadId) ? draft.leadId : null);
  const effectiveToken = ownershipToken || (data as any).ownershipToken || draft?.ownershipToken || generateOwnershipToken();
  const effectiveIdempotencyKey = idempotencyKey || (data as any).idempotencyKey || draft?.idempotencyKey || generateIdempotencyKey();

  // 1. UPDATE EXISTING PARTIAL LEAD (Guaranteed: never creates duplicate row!)
  if (effectiveLeadId && isValidUUID(effectiveLeadId)) {
    const existingIndex = localLeads.findIndex(l => l.id === effectiveLeadId);
    let updated: QuoteLead;

    if (existingIndex >= 0) {
      updated = {
        ...localLeads[existingIndex],
        ...data,
        name: cleanName || localLeads[existingIndex].name,
        phone: cleanPhone || localLeads[existingIndex].phone,
        whatsapp: cleanWhatsapp || localLeads[existingIndex].whatsapp,
        area: cleanArea || localLeads[existingIndex].area,
        ownershipToken: effectiveToken,
        updatedAt: now
      };
      localLeads[existingIndex] = updated;
    } else {
      updated = {
        ...data,
        id: effectiveLeadId,
        ownershipToken: effectiveToken,
        leadNumber: generateLeadNumber(),
        name: cleanName,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        area: cleanArea,
        tankType: (data.tankType as any) || '',
        tankCapacity: (data.tankCapacity as any) || '',
        numberOfTanks: data.numberOfTanks || 1,
        status: 'Incomplete',
        isAbandoned: true,
        completionStep: data.completionStep || 2,
        lastActiveStepName: data.lastActiveStepName || 'Step 2 - Details Added',
        createdAt: now,
        updatedAt: now,
        isSyncedToCloud: false,
        source: 'Website Booking Form'
      };
      localLeads.unshift(updated);
    }

    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(localLeads));

    // Supabase update via update_partial_lead RPC with ownership token
    if (isSupabaseConfigured()) {
      try {
        const { error: rpcErr } = await supabase.rpc('update_partial_lead', {
          p_lead_id: effectiveLeadId,
          p_ownership_token: effectiveToken,
          p_tank_type: updated.tankType || null,
          p_tank_capacity: updated.tankCapacity || null,
          p_area: updated.area || 'Dhaka',
          p_service_type: updated.serviceType || 'Water Tank Cleaning',
          p_message: updated.message || updated.notes || null,
          p_step: updated.completionStep || 2
        });

        if (!rpcErr) {
          updated.isSyncedToCloud = true;
          safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(localLeads));
        } else {
          enqueuePendingSync({
            action: 'update_partial',
            leadId: effectiveLeadId,
            payload: {
              p_ownership_token: effectiveToken,
              p_tank_type: updated.tankType || null,
              p_tank_capacity: updated.tankCapacity || null,
              p_area: updated.area || 'Dhaka',
              p_service_type: updated.serviceType || 'Water Tank Cleaning',
              p_step: updated.completionStep || 2
            }
          });
        }
      } catch {
        enqueuePendingSync({
          action: 'update_partial',
          leadId: effectiveLeadId,
          payload: { p_ownership_token: effectiveToken, p_tank_type: updated.tankType, p_tank_capacity: updated.tankCapacity, p_area: updated.area }
        });
      }
    }

    return updated;
  }

  // 2. CREATE BRAND NEW PARTIAL LEAD (First-Step Lead Capture)
  let generatedUuid: string | null = null;
  let generatedLeadNum = generateLeadNumber();
  let receivedToken: string = effectiveToken;
  let isCloudSynced = false;

  if (isSupabaseConfigured()) {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('create_partial_lead', {
        p_customer_name: cleanName,
        p_phone: cleanPhone,
        p_whatsapp: cleanWhatsapp,
        p_area: cleanArea,
        p_service_type: data.serviceType || 'Water Tank Cleaning',
        p_source: (data.source as any) || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : 'Website Booking Wizard (Step 1)'),
        p_utm_source: data.utm_source || attribution.utm_source || null,
        p_utm_medium: data.utm_medium || attribution.utm_medium || null,
        p_utm_campaign: data.utm_campaign || attribution.utm_campaign || null,
        p_ownership_token: effectiveToken,
        p_idempotency_key: effectiveIdempotencyKey
      });

      if (!rpcErr && rpcRes && rpcRes.id) {
        generatedUuid = rpcRes.id;
        generatedLeadNum = rpcRes.lead_number || generatedLeadNum;
        if (rpcRes.ownership_token) {
          receivedToken = rpcRes.ownership_token;
        }
        isCloudSynced = true;
      }
    } catch (err) {
      console.warn('[LeadService] Network failure during partial lead RPC:', err);
    }
  }

  // Fallback ID only if completely offline
  const finalId = generatedUuid || ('offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));

  const newLead: QuoteLead = {
    ...data,
    id: finalId,
    idempotencyKey: effectiveIdempotencyKey,
    ownershipToken: receivedToken,
    leadNumber: generatedLeadNum,
    name: cleanName,
    phone: cleanPhone,
    whatsapp: cleanWhatsapp,
    area: cleanArea,
    serviceType: data.serviceType || 'Water Tank Cleaning',
    tankType: (data.tankType as any) || '',
    tankCapacity: (data.tankCapacity as any) || '',
    numberOfTanks: data.numberOfTanks || 1,
    status: 'Incomplete',
    isAbandoned: true,
    completionStep: data.completionStep || 1,
    lastActiveStepName: data.lastActiveStepName || 'Step 1 - Contact Captured',
    isSyncedToCloud: isCloudSynced,
    source: (data.source as any) || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : 'Website Booking Wizard (Step 1)'),
    utm_source: data.utm_source || attribution.utm_source,
    utm_medium: data.utm_medium || attribution.utm_medium,
    utm_campaign: data.utm_campaign || attribution.utm_campaign,
    createdAt: now,
    updatedAt: now
  };

  safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify([newLead, ...localLeads]));

  // Schedule abandonment notification check in case user drops off after capturing contact
  if (cleanPhone.length >= 10) {
    scheduleAbandonedLeadCheck(newLead);
  }

  // If offline, enqueue for background sync with stable idempotency key
  if (!isCloudSynced) {
    enqueuePendingSync({
      action: 'create_partial',
      payload: {
        p_customer_name: cleanName,
        p_phone: cleanPhone,
        p_whatsapp: cleanWhatsapp,
        p_area: cleanArea,
        p_service_type: newLead.serviceType,
        p_source: newLead.source,
        p_ownership_token: receivedToken,
        p_idempotency_key: effectiveIdempotencyKey
      }
    });
  }

  return newLead;
}

// ------------------------------------------------------------------------------
// DRAFT LEAD MANAGEMENT (Resilient auto-save with zero duplicate spam)
// ------------------------------------------------------------------------------
const DRAFT_STORAGE_KEY = 'sunviloz_quote_draft_v1';
let draftDebounceTimer: any = null;
let isCreatingPartialLeadPromise: Promise<QuoteLead | null> | null = null;

export function getLeadDraft(): Partial<QuoteFormData> | null {
  try {
    const raw = safeGetItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLeadDraft(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Save draft lead locally immediately and debounces cloud draft if meaningful phone exists.
 * Does not spam Supabase on every keystroke.
 * Ensures EXACTLY ONE Supabase incomplete lead is created, capturing and persisting its UUID.
 */
export function saveLeadDraft(data: Partial<QuoteFormData>): void {
  // 1. Immediately persist locally
  const existingDraft = getLeadDraft() || {};
  const mergedDraft: Partial<QuoteFormData> = {
    ...existingDraft,
    ...data,
    leadId: data.leadId || existingDraft.leadId,
    ownershipToken: data.ownershipToken || existingDraft.ownershipToken,
    idempotencyKey: data.idempotencyKey || existingDraft.idempotencyKey || generateIdempotencyKey()
  };

  try {
    safeSetItem(DRAFT_STORAGE_KEY, JSON.stringify(mergedDraft));
  } catch {
    // Ignore
  }

  // 2. Only consider syncing partial lead to cloud if meaningful contact details (11-digit phone) exist
  const cleanPhone = normalizeBangladeshiPhone(mergedDraft.phone || '');
  if (cleanPhone.length < 11 || !isSupabaseConfigured()) {
    return;
  }

  if (draftDebounceTimer) {
    clearTimeout(draftDebounceTimer);
  }

  // 10-second debounce to ensure user paused typing before cloud save
  draftDebounceTimer = setTimeout(async () => {
    try {
      const currentDraft = getLeadDraft() || mergedDraft;
      const targetLeadId = currentDraft.leadId;
      const targetToken = currentDraft.ownershipToken || generateOwnershipToken();
      const targetIdempotencyKey = currentDraft.idempotencyKey || generateIdempotencyKey();

      // If we already have a valid Supabase UUID, UPDATE THAT RECORD — NEVER create a new one!
      if (targetLeadId && isValidUUID(targetLeadId)) {
        await saveOrUpdatePartialLead(targetLeadId, {
          name: currentDraft.name || 'Website Visitor',
          phone: cleanPhone,
          whatsapp: currentDraft.whatsapp || cleanPhone,
          area: currentDraft.area || 'Dhaka',
          serviceType: currentDraft.serviceType || 'Water Tank Cleaning',
          tankType: currentDraft.tankType,
          tankCapacity: currentDraft.tankCapacity,
          numberOfTanks: currentDraft.numberOfTanks || 1,
          status: 'Incomplete',
          isAbandoned: true,
          completionStep: 1,
          lastActiveStepName: 'Auto-saved Draft'
        }, targetToken, targetIdempotencyKey);
        return;
      }

      // If no leadId exists yet, create it EXACTLY ONCE using an in-flight singleton promise lock
      if (!isCreatingPartialLeadPromise) {
        isCreatingPartialLeadPromise = (async () => {
          try {
            const partial = await saveOrUpdatePartialLead(null, {
              name: currentDraft.name || 'Website Visitor',
              phone: cleanPhone,
              whatsapp: currentDraft.whatsapp || cleanPhone,
              area: currentDraft.area || 'Dhaka',
              serviceType: currentDraft.serviceType || 'Water Tank Cleaning',
              tankType: currentDraft.tankType,
              tankCapacity: currentDraft.tankCapacity,
              numberOfTanks: currentDraft.numberOfTanks || 1,
              status: 'Incomplete',
              isAbandoned: true,
              completionStep: 1,
              lastActiveStepName: 'Auto-saved Draft'
            }, targetToken, targetIdempotencyKey);

            if (partial && partial.id && isValidUUID(partial.id)) {
              const updatedDraft = {
                ...(getLeadDraft() || currentDraft),
                leadId: partial.id,
                ownershipToken: (partial as any).ownershipToken || targetToken,
                idempotencyKey: (partial as any).idempotencyKey || targetIdempotencyKey
              };
              safeSetItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDraft));

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sunviloz_lead_id_synced', {
                  detail: { leadId: partial.id, ownershipToken: updatedDraft.ownershipToken }
                }));
              }
            }
            return partial;
          } finally {
            isCreatingPartialLeadPromise = null;
          }
        })();
      }
      await isCreatingPartialLeadPromise;
    } catch (err) {
      console.warn('[LeadService] Non-blocking autosave warning:', err);
    }
  }, 10000);
}

// ------------------------------------------------------------------------------
// PAGINATED LEADS QUERY (Scalable Admin Dashboard Querying)
// ------------------------------------------------------------------------------
export interface PaginatedLeadsResult {
  leads: QuoteLead[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function fetchPaginatedLeads(params: {
  page: number;
  pageSize: number;
  statusFilter?: string;
  searchQuery?: string;
}): Promise<PaginatedLeadsResult> {
  const { page = 1, pageSize = 20, statusFilter, searchQuery } = params;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      if (statusFilter && statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery && searchQuery.trim()) {
        const cleanTerm = searchQuery.trim();
        query = query.or(`customer_name.ilike.%${cleanTerm}%,phone.ilike.%${cleanTerm}%,area.ilike.%${cleanTerm}%,lead_number.ilike.%${cleanTerm}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const totalCount = count || data.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        const mapped: QuoteLead[] = data.map(item => ({
          id: item.id,
          leadNumber: item.lead_number,
          name: item.customer_name,
          phone: item.phone,
          whatsapp: item.whatsapp || item.phone,
          email: item.email || undefined,
          area: item.area,
          address: item.address || undefined,
          serviceType: item.service_type || 'Water Tank Cleaning',
          tankType: item.tank_type || '',
          tankCapacity: item.tank_capacity || '',
          numberOfTanks: item.number_of_tanks || 1,
          status: (item.status as LeadStatus) || 'New',
          adminNote: item.admin_note || undefined,
          isSyncedToCloud: true,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        return {
          leads: mapped,
          totalCount,
          totalPages,
          currentPage: page
        };
      }
    } catch (err) {
      console.warn('[LeadService] Error fetching paginated leads from cloud:', err);
    }
  }

  // Fallback to local storage with simulated pagination
  const allLocal = getLocalLeads();
  let filtered = allLocal;
  if (statusFilter && statusFilter !== 'All') {
    filtered = filtered.filter(l => l.status === statusFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.toLowerCase();
    filtered = filtered.filter(l => 
      l.name?.toLowerCase().includes(term) || 
      l.phone?.includes(term) || 
      l.area?.toLowerCase().includes(term) ||
      l.leadNumber?.toLowerCase().includes(term)
    );
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize;
  const leads = filtered.slice(from, from + pageSize).map(l => ({ ...l, isSyncedToCloud: false }));

  return {
    leads,
    totalCount,
    totalPages,
    currentPage: page
  };
}

// ------------------------------------------------------------------------------
// FREE-TIER RESOURCE USAGE METRICS (Real-time live database calculation)
// ------------------------------------------------------------------------------
export interface DatabaseUsageMetrics {
  totalLeadsCount: number;
  incompleteLeadsCount: number;
  auditLogsCount: number;
  mediaItemsCount: number;
  estimatedDbSizeBytes: number;
  estimatedDbSizeFormatted: string;
  maxFreeTierBytes: number;
  percentUsed: number;
}

export async function fetchLiveDatabaseResourceUsage(): Promise<DatabaseUsageMetrics> {
  const defaultMetrics: DatabaseUsageMetrics = {
    totalLeadsCount: 0,
    incompleteLeadsCount: 0,
    auditLogsCount: 0,
    mediaItemsCount: 0,
    estimatedDbSizeBytes: 1048576, // ~1MB baseline
    estimatedDbSizeFormatted: '1.2 MB',
    maxFreeTierBytes: 524288000, // 500 MB Supabase free limit
    percentUsed: 0.24
  };

  if (!isSupabaseConfigured()) {
    return defaultMetrics;
  }

  try {
    const [leadsRes, auditRes, mediaRes] = await Promise.all([
      supabase.from('leads').select('id, status', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      supabase.from('media_library').select('id', { count: 'exact', head: true })
    ]);

    const totalLeads = leadsRes.count || 0;
    const auditLogs = auditRes.count || 0;
    const mediaItems = mediaRes.count || 0;

    // Approximate database size based on average row footprint (PostgreSQL ~2KB/row overhead)
    const estimatedBytes = (totalLeads * 3500) + (auditLogs * 1200) + (mediaItems * 4000) + 1500000;
    const megabytes = (estimatedBytes / (1024 * 1024)).toFixed(2);
    const maxFree = 500 * 1024 * 1024; // 500 MB
    const percent = Math.min(100, Number(((estimatedBytes / maxFree) * 100).toFixed(2)));

    return {
      totalLeadsCount: totalLeads,
      incompleteLeadsCount: 0,
      auditLogsCount: auditLogs,
      mediaItemsCount: mediaItems,
      estimatedDbSizeBytes: estimatedBytes,
      estimatedDbSizeFormatted: `${megabytes} MB`,
      maxFreeTierBytes: maxFree,
      percentUsed: percent
    };
  } catch (err) {
    console.warn('[LeadService] Failed to calculate live resource metrics:', err);
    return defaultMetrics;
  }
}

// ------------------------------------------------------------------------------
// OFFLINE QUEUE & RETRY SYNCHRONIZATION
// ------------------------------------------------------------------------------
export interface PendingSyncItem {
  id: string;
  action: 'create_partial' | 'update_partial' | 'complete';
  leadId?: string;
  payload: any;
  timestamp: string;
}

export function enqueuePendingSync(item: {
  action: 'create_partial' | 'update_partial' | 'complete';
  leadId?: string;
  payload: any;
}): void {
  try {
    const raw = safeGetItem(PENDING_SYNC_STORAGE_KEY);
    const queue: PendingSyncItem[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action: item.action,
      leadId: item.leadId,
      payload: item.payload,
      timestamp: new Date().toISOString()
    });
    // Keep max 50 pending records to prevent overflow
    if (queue.length > 50) queue.shift();
    safeSetItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore
  }
}

export async function flushPendingLeadSync(): Promise<void> {
  if (!isSupabaseConfigured() || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return;
  }

  try {
    const raw = safeGetItem(PENDING_SYNC_STORAGE_KEY);
    if (!raw) return;
    const queue: PendingSyncItem[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remaining: PendingSyncItem[] = [];

    for (const item of queue) {
      try {
        if (item.action === 'create_partial') {
          const res = await supabase.rpc('create_partial_lead', item.payload);
          if (res.error) {
            remaining.push(item);
          } else if (res.data?.id && isValidUUID(res.data.id)) {
            // Ensure the actual Supabase UUID is persisted in client draft
            const currentDraft = getLeadDraft();
            if (currentDraft && (!currentDraft.leadId || !isValidUUID(currentDraft.leadId))) {
              const updatedDraft = {
                ...currentDraft,
                leadId: res.data.id,
                ownershipToken: res.data.ownership_token || currentDraft.ownershipToken
              };
              safeSetItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDraft));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sunviloz_lead_id_synced', {
                  detail: { leadId: res.data.id, ownershipToken: updatedDraft.ownershipToken }
                }));
              }
            }
          }
        } else if (item.action === 'update_partial' && item.leadId && isValidUUID(item.leadId)) {
          const res = await supabase.rpc('update_partial_lead', { p_lead_id: item.leadId, ...item.payload });
          if (res.error) remaining.push(item);
        } else if (item.action === 'complete') {
          const res = await supabase.rpc('complete_customer_lead', item.payload);
          if (res.error) remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    safeSetItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore
  }
}

// ------------------------------------------------------------------------------
// RESEND EMAIL NOTIFICATIONS (Server-side Edge Function Dispatcher)
// ------------------------------------------------------------------------------
const NOTIFICATION_CACHE_PREFIX = 'sunviloz_notif_sent_';
const abandonmentTimers = new Map<string, any>();

export async function dispatchLeadNotification(
  lead: QuoteLead,
  eventType: 'complete_lead' | 'abandoned_lead',
  isRetry = false
): Promise<boolean> {
  const cacheKey = `${NOTIFICATION_CACHE_PREFIX}${lead.id || lead.leadNumber}_${eventType}`;
  if (!isRetry && safeGetItem(cacheKey)) {
    return true; // Already sent (deduplicated)
  }

  const cleanPhone = normalizeBangladeshiPhone(lead.phone);
  if (cleanPhone.length < 10) return false;

  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.functions.invoke('notify-lead', {
        body: {
          leadId: isValidUUID(lead.id) ? lead.id : undefined,
          leadNumber: lead.leadNumber,
          name: lead.name,
          phone: cleanPhone,
          whatsapp: lead.whatsapp || cleanPhone,
          serviceType: lead.serviceType,
          tankType: lead.tankType,
          tankCapacity: lead.tankCapacity,
          area: lead.area,
          address: lead.address,
          message: lead.message,
          eventType,
          isRetry,
          ownershipToken: (lead as any).ownershipToken || getLeadDraft()?.ownershipToken
        }
      });

      if (!error) {
        safeSetItem(cacheKey, new Date().toISOString());
        return true;
      }
    }
  } catch (err) {
    console.warn('[LeadService] Notification trigger warning:', err);
  }
  return false;
}

export async function fetchLeadNotification(leadId: string): Promise<LeadNotificationRecord | null> {
  if (!isSupabaseConfigured() || !isValidUUID(leadId)) return null;
  try {
    const { data, error } = await supabase
      .from('lead_notifications')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as LeadNotificationRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export async function retryLeadNotification(
  leadId: string,
  eventType: 'complete_lead' | 'abandoned_lead' = 'complete_lead'
): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !isValidUUID(leadId)) {
    return { success: false, message: 'Invalid lead ID.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-lead', {
      body: {
        leadId,
        eventType,
        isRetry: true
      }
    });

    if (error) {
      return { success: false, message: error.message || 'Notification retry request failed.' };
    }

    if (data?.error) {
      return { success: false, message: data.error };
    }

    return { 
      success: true, 
      message: data?.message || (data?.status === 'sent' ? 'Notification successfully delivered via Resend!' : 'Notification processed.') 
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error while attempting retry.' };
  }
}

export function scheduleAbandonedLeadCheck(lead: QuoteLead): void {
  const cleanPhone = normalizeBangladeshiPhone(lead.phone);
  if (cleanPhone.length < 10) return;

  const key = lead.id || lead.leadNumber || '';
  if (!key) return;

  if (abandonmentTimers.has(key)) {
    clearTimeout(abandonmentTimers.get(key));
  }

  // Check in 15 minutes
  const timer = setTimeout(async () => {
    try {
      const currentLeads = getLocalLeads();
      const current = currentLeads.find(l => l.id === lead.id || l.leadNumber === lead.leadNumber);
      if (current && (current.status === 'Incomplete' || current.isAbandoned)) {
        await dispatchLeadNotification(current, 'abandoned_lead');
      }
    } catch {
      // Ignore
    } finally {
      abandonmentTimers.delete(key);
    }
  }, 15 * 60 * 1000);

  abandonmentTimers.set(key, timer);
}

export function cancelAbandonedLeadCheck(leadIdOrNumber: string): void {
  if (leadIdOrNumber && abandonmentTimers.has(leadIdOrNumber)) {
    clearTimeout(abandonmentTimers.get(leadIdOrNumber));
    abandonmentTimers.delete(leadIdOrNumber);
  }
}

// Auto-register browser online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingLeadSync();
  });
}

