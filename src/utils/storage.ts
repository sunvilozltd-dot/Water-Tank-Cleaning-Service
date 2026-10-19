import { QuoteFormData, QuoteLead } from '../types';
import { createLead, getLocalLeads, updateLead, exportLeadsToCsv as exportCsvFromService } from '../services/leadService';

const STORAGE_KEY = 'sunviloz_quote_leads_v1';

export async function saveLead(data: QuoteFormData, source = 'Website Quick Form'): Promise<QuoteLead> {
  return await createLead(data, source);
}

export function getStoredLeads(): QuoteLead[] {
  return getLocalLeads();
}

export function updateLeadStatus(id: string, status: QuoteLead['status']): void {
  updateLead(id, { status }).catch(() => {
    // Background update
  });
}

export function exportLeadsToCsv(): string {
  const leads = getStoredLeads();
  return exportCsvFromService(leads);
}
