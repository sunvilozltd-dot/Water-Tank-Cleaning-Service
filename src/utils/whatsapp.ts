import { QuoteFormData } from '../types';
import { trackEvent } from './tracking';

export const WHATSAPP_INT_NUMBER = '8801609999612';
export const WHATSAPP_DISPLAY_NUMBER = '01609-999612';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_INT_NUMBER}`;

export interface WhatsAppMessageOptions {
  serviceType?: string;
  source?: string;
  leadNumber?: string;
}

/**
 * Builds the standardized professional quote message for Sunviloz Clean Care WhatsApp.
 * Supports Unicode & Bengali characters seamlessly.
 */
export function buildWhatsAppQuoteMessage(data: QuoteFormData, options?: WhatsAppMessageOptions): string {
  const service = options?.serviceType || data.serviceType || 'Water Tank Cleaning Service';
  const tankType = data.tankType || 'Overhead Tank';
  const material = data.overheadMaterial ? ` (${data.overheadMaterial})` : '';
  const numTanks = data.numberOfTanks ? String(data.numberOfTanks) : '1';
  let capacityInfo = data.tankCapacity || data.estimatedCapacity || '';

  if (!capacityInfo || capacityInfo === "I Don't Know") {
    if (data.flats || data.numberOfFlats || data.floors) {
      capacityInfo = `ভবন: ${data.floors ? data.floors + ' তলা, ' : ''}${data.flats || data.numberOfFlats || ''} ফ্ল্যাট`;
    } else if (data.tankDimensions) {
      capacityInfo = `সাইজ: ${data.tankDimensions}`;
    } else {
      capacityInfo = "জানা নেই (পরিদর্শন সাপেক্ষে)";
    }
  }

  const leadNumStr = options?.leadNumber ? `রেফারেন্স: ${options.leadNumber}\n` : '';
  const fullAddress = [data.address, data.area, data.district || 'ঢাকা'].filter(Boolean).join(', ');
  
  const extraNotes: string[] = [];
  if (data.pipelineCleaning) extraNotes.push(`পাইপলাইন ক্লিনিং: ${data.pipelineCleaning}`);
  if (data.tankAccessible) extraNotes.push(`ট্যাংক এক্সেস: ${data.tankAccessible}`);
  if (data.buildingType) extraNotes.push(`বিল্ডিং: ${data.buildingType}`);
  if (data.lastCleaningDate) extraNotes.push(`সর্বশেষ পরিষ্কার: ${data.lastCleaningDate}`);
  if (data.notes && data.notes.trim()) extraNotes.push(data.notes.trim());
  if (data.message && data.message.trim() && data.message !== data.notes) extraNotes.push(data.message.trim());

  const extraNotesStr = extraNotes.length > 0 ? extraNotes.join(' | ') : 'প্রযোজ্য নয়';

  return `আসসালামু আলাইকুম Sunviloz Clean Care,\n` +
    `আমি ওয়াটার ট্যাংক ক্লিনিং সার্ভিস সংক্রান্ত কোটেশন ও শিডিউল নিশ্চিত করতে চাই।\n\n` +
    `${leadNumStr}` +
    `নাম: ${data.name || 'সম্মানিত গ্রাহক'}\n` +
    `ফোন: ${data.phone || ''}\n` +
    `সার্ভিস: ${service}\n` +
    `ট্যাংক: ${tankType}${material} (${numTanks} টি)\n` +
    `ধারণক্ষমতা: ${capacityInfo}\n` +
    `ঠিকানা: ${fullAddress || data.area || 'ঢাকা'}\n` +
    `অতিরিক্ত তথ্য: ${extraNotesStr}\n\n` +
    `অনুগ্রহ করে কোটেশন ও সম্ভাব্য শিডিউল জানিয়ে মেসেজের উত্তর দিন। ধন্যবাদ!`;
}

/**
 * Generates the full WhatsApp URL with properly encoded message parameter.
 */
export function generateWhatsAppQuoteUrl(data: QuoteFormData, options?: WhatsAppMessageOptions): string {
  const message = buildWhatsAppQuoteMessage(data, options);
  const encoded = encodeURIComponent(message);
  return `${WHATSAPP_BASE_URL}?text=${encoded}`;
}

/**
 * Generates a simple contact message URL for general inquiries
 */
export function generateWhatsAppContactUrl(contactData: {
  name: string;
  phone: string;
  area?: string;
  message?: string;
}): string {
  const text = `New Service Inquiry - Sunviloz Clean Care\n` +
    `Name: ${contactData.name || 'Customer'}\n` +
    `Phone: ${contactData.phone || ''}\n` +
    `Area: ${contactData.area || 'Dhaka'}\n` +
    `Message: ${contactData.message?.trim() || 'Please contact me regarding water tank cleaning schedule and price quotation.'}\n\n` +
    `Please confirm details.`;
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(text)}`;
}

/**
 * Safely opens WhatsApp in mobile app or new desktop tab,
 * dispatches tracking event, and returns the URL.
 */
export function openWhatsAppDirect(url: string, eventName = 'whatsapp_click', extraParams: Record<string, any> = {}): void {
  trackEvent(eventName, {
    url,
    timestamp: new Date().toISOString(),
    ...extraParams
  });

  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  } catch (err) {
    console.warn('Failed to open WhatsApp window, falling back to location.href', err);
    window.location.href = url;
  }
}

export function formatWhatsAppUrl(data: any): string {
  return generateWhatsAppQuoteUrl(data);
}

/**
 * Generates recovery message URL directly to customer's WhatsApp for abandoned/incomplete leads
 */
export function generateAbandonedLeadRecoveryWhatsAppUrl(lead: { name: string; phone: string; lastActiveStepName?: string; area?: string }): string {
  const cleanPhone = (lead.phone || '').replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('01') ? `88${cleanPhone}` : cleanPhone;
  const text = `আসসালামু আলাইকুম ${lead.name || 'গ্রাহক'} সাহেব, Sunviloz Clean Care থেকে যোগাযোগ করছি।\n\nআপনি আমাদের ওয়েবসাইটে পানির ট্যাংক পরিষ্কারের বুকিং শুরু করেছিলেন (${lead.lastActiveStepName || 'ধাপ ১'}).\n\nবুকিংটি কনফার্ম করতে অথবা বিশেষ ছাড়ে কোটেশন পেতে আপনাকে কীভাবে সহযোগিতা করতে পারি? ধন্যবাদ!`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

