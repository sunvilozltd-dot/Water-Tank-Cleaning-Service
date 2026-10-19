import { QuoteFormData } from '../types';

export interface ValidationErrors {
  name?: string;
  phone?: string;
  area?: string;
  tankType?: string;
  tankCapacity?: string;
  numberOfTanks?: string;
}

/**
 * Validates a Bangladeshi mobile phone number.
 * Accepts:
 * - 01XXXXXXXXX (11 digits starting with 013, 014, 015, 016, 017, 018, 019)
 * - +8801XXXXXXXXX (14 digits)
 * - 8801XXXXXXXXX (13 digits)
 * Allows hyphens/spaces.
 */
export function isValidBangladeshiPhone(rawPhone: string): boolean {
  if (!rawPhone) return false;
  // Clean spaces, hyphens, parentheses
  const cleaned = rawPhone.replace(/[\s\-\(\)]/g, '');
  
  // Standard 11 digit check: 01[3-9]XXXXXXXX
  const standardPattern = /^01[3-9]\d{8}$/;
  if (standardPattern.test(cleaned)) return true;

  // With +88 prefix
  const intlPattern = /^\+8801[3-9]\d{8}$/;
  if (intlPattern.test(cleaned)) return true;

  // With 88 prefix without plus
  const bdPattern = /^8801[3-9]\d{8}$/;
  if (bdPattern.test(cleaned)) return true;

  return false;
}

/**
 * Formats a phone number cleanly for WhatsApp / direct call link
 */
export function sanitizePhoneForCall(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+88')) return digits;
  if (digits.startsWith('88')) return `+${digits}`;
  if (digits.startsWith('01')) return `+88${digits}`;
  return digits;
}

/**
 * Normalizes a Bangladeshi phone number to standard 11 digits: 01XXXXXXXXX
 */
export function normalizeBangladeshiPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('8801') && digits.length >= 13) {
    return digits.slice(2, 13);
  }
  if (digits.startsWith('01') && digits.length >= 11) {
    return digits.slice(0, 11);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    return '0' + digits;
  }
  return digits;
}

/**
 * Formats a phone number cleanly for UI display (e.g. 01712-345678)
 */
export function formatBangladeshiPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const localDigits = digits.startsWith('880') ? digits.slice(2) : digits;
  if (localDigits.length === 11) {
    return `${localDigits.slice(0, 5)}-${localDigits.slice(5)}`;
  }
  return phone;
}

/**
 * Comprehensive friendly form validation with accessible error messaging
 */
export function validateQuoteForm(data: QuoteFormData, lang: 'en' | 'bn' = 'en'): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  // Name check
  if (!data.name || data.name.trim().length === 0) {
    errors.name = lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.';
  } else if (data.name.trim().length < 2) {
    errors.name = lang === 'bn' ? 'নাম ন্যূনতম ২ অক্ষরের হতে হবে।' : 'Name must be at least 2 characters.';
  }

  // Phone check
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = lang === 'bn' ? 'অনুগ্রহ করে আপনার মোবাইল ফোন নম্বর দিন।' : 'Please enter your phone number.';
  } else if (!isValidBangladeshiPhone(data.phone.trim())) {
    errors.phone = lang === 'bn' 
      ? 'একটি সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' 
      : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).';
  }

  // Area check
  if (!data.area || data.area.trim().length === 0) {
    errors.area = lang === 'bn' ? 'অনুগ্রহ করে আপনার এলাকা নির্বাচন করুন বা লিখুন।' : 'Please select or enter your area in Dhaka.';
  }

  // Tank type check
  if (!data.tankType) {
    errors.tankType = lang === 'bn' ? 'অনুগ্রহ করে ট্যাংকের ধরন নির্বাচন করুন।' : 'Please select your tank type.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
