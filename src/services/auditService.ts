import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

export interface AuditLogItem {
  id: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

const AUDIT_STORAGE_KEY = 'sunviloz_audit_trail_v1';

export function getAuditLogs(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string
): Promise<void> {
  const item: AuditLogItem = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    adminEmail: adminEmail || 'Admin',
    action,
    entity,
    entityId,
    details,
    timestamp: new Date().toISOString()
  };

  // 1. Save to local storage (capped to 50 entries to preserve space)
  try {
    const existing = getAuditLogs();
    const updated = [item, ...existing].slice(0, 50);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    // Gracefully ignore local save error to prevent quota issues
  }

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('audit_logs').insert({
        admin_email: item.adminEmail,
        action: item.action,
        entity: item.entity,
        entity_id: item.entityId || null,
        details: item.details || null
      });
    } catch {
      // Ignore background audit insert error
    }
  }
}

export const recordAuditLog = logAdminAction;
