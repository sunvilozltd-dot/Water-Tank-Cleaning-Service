import { QuoteFormData, QuoteLead, LeadStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';
import { getStoredAttribution } from '../utils/utmTracking';

const LOCAL_STORAGE_KEY = 'sunviloz_quote_leads_v1';

export function generateLeadNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `SVC-${dateStr}-${randomPart}`;
}

/**
 * Save new lead to Supabase (with offline/localStorage resilience and deduplication)
 */
export async function createLead(data: QuoteFormData, source = 'Website'): Promise<QuoteLead> {
  // Deduplication check: prevent accidental double-click / rapid retry duplicate records
  try {
    const localLeads = getLocalLeads();
    const nowMs = Date.now();
    const cleanPhone = (data.phone || '').trim().replace(/\D/g, '');
    const recentDuplicate = localLeads.find(l => {
      if (!l.createdAt || !l.phone) return false;
      const createdMs = new Date(l.createdAt).getTime();
      const isRecent = (nowMs - createdMs) < 20000; // 20 second idempotency window
      const lCleanPhone = l.phone.trim().replace(/\D/g, '');
      return isRecent && cleanPhone.length >= 10 && cleanPhone === lCleanPhone;
    });

    if (recentDuplicate) {
      return recentDuplicate;
    }
  } catch (dedupErr) {
    // Continue if dedup check fails
  }

  const leadNumber = generateLeadNumber();
  const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  // Combine extra details into message string for maximum visibility in DB & admin
  const extraDetails: string[] = [];
  if (data.callbackPreference) {
    extraDetails.push(`Callback: ${data.callbackPreference}`);
  }
  if (data.additionalServices && data.additionalServices.length > 0) {
    extraDetails.push(`Add-ons: ${data.additionalServices.join(', ')}`);
  }
  if (data.tankDimensions) {
    extraDetails.push(`Dimensions: ${data.tankDimensions}`);
  }
  if (data.overheadMaterial) {
    extraDetails.push(`Material: ${data.overheadMaterial}`);
  }
  if (data.manualBuildingDetails) {
    extraDetails.push(`Building: ${data.manualBuildingDetails}`);
  }
  if (data.notes && data.notes.trim()) {
    extraDetails.push(`Note: ${data.notes.trim()}`);
  }
  if (data.message && data.message.trim() && data.message !== data.notes) {
    extraDetails.push(data.message.trim());
  }

  const consolidatedMessage = data.message && data.message.includes('\n')
    ? data.message
    : (extraDetails.length > 0 ? extraDetails.join(' | ') : (data.message || ''));

  const attribution = getStoredAttribution();

  const newLead: QuoteLead = {
    ...data,
    id,
    leadNumber,
    createdAt: now,
    updatedAt: now,
    status: 'New',
    source: (data as any).source || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : source),
    utm_source: (data as any).utm_source || attribution.utm_source,
    utm_medium: (data as any).utm_medium || attribution.utm_medium,
    utm_campaign: (data as any).utm_campaign || attribution.utm_campaign,
    utm_term: data.utm_term || attribution.utm_term,
    utm_content: data.utm_content || attribution.utm_content,
    message: consolidatedMessage,
    whatsapp: data.whatsapp || data.phone
  };

  // 1. Always update local storage first (Ensures zero lead loss, offline resilience)
  try {
    const existing = getLocalLeads();
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify([newLead, ...existing]));
  } catch (err) {
    // Local storage full or unavailable
  }

  // 2. Insert into Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        lead_number: leadNumber,
        customer_name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        email: data.email || null,
        area: data.area,
        house_number: data.houseNumber || null,
        road_number: data.roadNumber || null,
        thana: data.thana || null,
        postcode: data.postcode || null,
        landmark: data.landmark || null,
        address: data.address || [
          data.houseNumber ? `বাসা: ${data.houseNumber}` : '',
          data.roadNumber ? `রোড: ${data.roadNumber}` : '',
          data.area,
          data.thana ? `থানা: ${data.thana}` : '',
          data.postcode ? `পোস্ট কোড: ${data.postcode}` : '',
          data.landmark ? `ল্যান্ডমার্ক: ${data.landmark}` : ''
        ].filter(Boolean).join(', ') || null,
        service_type: data.serviceType || 'Water Tank Cleaning',
        tank_type: data.tankType || null,
        tank_capacity: data.tankCapacity || null,
        capacity_unknown: Boolean(data.capacityUnknown || data.tankCapacity === 'ধারণক্ষমতা জানা নেই'),
        building_floors: data.floors || null,
        flat_count: data.flats || data.numberOfFlats || null,
        additional_pipeline_cleaning: Boolean(data.additionalPipelineCleaning || data.additionalServices?.includes('পাইপলাইন ক্লিনিং')),
        additional_amc: Boolean(data.additionalAmc || data.additionalServices?.includes('বার্ষিক চুক্তি (AMC)')),
        number_of_tanks: data.numberOfTanks || 1,
        number_of_flats: data.numberOfFlats || data.flats || null,
        building_type: data.buildingType || data.propertyType || null,
        preferred_date: data.preferredDate || null,
        preferred_time: data.preferredTime || null,
        message: consolidatedMessage || null,
        estimated_price: data.estimatedPrice || null,
        source: newLead.source,
        utm_source: newLead.utm_source || null,
        utm_medium: newLead.utm_medium || null,
        utm_campaign: newLead.utm_campaign || null,
        status: 'New',
        lead_status: 'New'
      };

      try {
        const sessionRes = await supabase.auth.getSession();
        const isAuthenticatedAdmin = Boolean(sessionRes.data?.session?.user);
        if (isAuthenticatedAdmin) {
          const { data: inserted, error } = await supabase
            .from('leads')
            .insert(payload)
            .select()
            .single();
          if (!error && inserted?.id) {
            newLead.id = inserted.id;
          }
        } else {
          // Public anonymous visitor: insert-only conforming with RLS
          await supabase.from('leads').insert([payload]);
        }
      } catch (insertErr) {
        // Fallback to plain insert
        try {
          await supabase.from('leads').insert(payload);
        } catch {
          // Ignore
        }
      }
    } catch {
      // Network error saving lead to Supabase (locally preserved)
    }
  }

  return newLead;
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
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        const local = getLocalLeads();
        const merged = [...mapped];
        local.forEach(loc => {
          if (!merged.some(m => m.leadNumber && m.leadNumber === loc.leadNumber)) {
            merged.push(loc);
          }
        });
        return merged;
      }
    } catch {
      // Use local fallback
    }
  }

  return getLocalLeads();
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
 * Save or update partial lead for Incomplete Order Tracking
 * Captures lead at Step 1 (Name & Mobile Number) and updates it in subsequent steps.
 */
export async function saveOrUpdatePartialLead(
  leadId: string | null,
  data: Partial<QuoteLead> & { name: string; phone: string }
): Promise<QuoteLead> {
  const localLeads = getLocalLeads();
  const now = new Date().toISOString();

  if (leadId) {
    const existingIndex = localLeads.findIndex(l => l.id === leadId);
    if (existingIndex >= 0) {
      const existing = localLeads[existingIndex];
      const updated: QuoteLead = {
        ...existing,
        ...data,
        updatedAt: now
      };
      localLeads[existingIndex] = updated;
      safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(localLeads));

      // Attempt Supabase sync
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('leads').update({
            customer_name: updated.name,
            phone: updated.phone,
            whatsapp: updated.whatsapp || updated.phone,
            area: updated.area || 'Dhaka',
            service_type: updated.serviceType || 'Water Tank Cleaning',
            tank_type: updated.tankType || null,
            tank_capacity: updated.tankCapacity || null,
            status: updated.status,
            message: updated.message || updated.notes || null,
            updated_at: now
          }).eq('id', leadId);
        } catch {
          // Ignore
        }
      }
      return updated;
    }
  }

  // Create brand new partial lead
  const attribution = getStoredAttribution();
  const leadNumber = generateLeadNumber();
  const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const newLead: QuoteLead = {
    ...data,
    id,
    leadNumber,
    name: data.name.trim(),
    phone: data.phone.trim(),
    whatsapp: data.whatsapp || data.phone.trim(),
    area: data.area || 'Dhaka',
    serviceType: data.serviceType || 'Water Tank Cleaning',
    tankType: (data.tankType as any) || '',
    tankCapacity: (data.tankCapacity as any) || '',
    numberOfTanks: data.numberOfTanks || 1,
    status: data.status || 'Incomplete',
    isAbandoned: data.isAbandoned !== undefined ? data.isAbandoned : true,
    completionStep: data.completionStep || 1,
    lastActiveStepName: data.lastActiveStepName || 'Step 1 - Contact Captured',
    source: (data.source as any) || (attribution.utm_source ? `${attribution.utm_source}${attribution.utm_medium ? ` (${attribution.utm_medium})` : ''}` : 'Website Booking Form (Step 1)'),
    utm_source: data.utm_source || attribution.utm_source,
    utm_medium: data.utm_medium || attribution.utm_medium,
    utm_campaign: data.utm_campaign || attribution.utm_campaign,
    createdAt: now,
    updatedAt: now
  };

  safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify([newLead, ...localLeads]));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('leads').insert([{
        lead_number: leadNumber,
        customer_name: newLead.name,
        phone: newLead.phone,
        whatsapp: newLead.whatsapp,
        area: newLead.area,
        service_type: newLead.serviceType,
        status: newLead.status,
        source: newLead.source,
        utm_source: newLead.utm_source || null,
        utm_medium: newLead.utm_medium || null,
        utm_campaign: newLead.utm_campaign || null,
        message: `Step 1 Incomplete Lead: ${newLead.lastActiveStepName}`,
        created_at: now
      }]);
    } catch {
      // Ignore
    }
  }

  return newLead;
}
