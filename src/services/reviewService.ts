import { 
  CustomerReview, 
  PublicCustomerReview, 
  ReviewSubmissionPayload, 
  ReviewStats, 
  GoogleReviewUser 
} from '../types/review';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

const REVIEWS_STORAGE_KEY = 'sunviloz_customer_reviews_master_v1';
const GOOGLE_USER_SESSION_KEY = 'sunviloz_google_reviewer_session';
export const REVIEWS_CHANGED_EVENT = 'sunviloz_customer_reviews_changed';

// Initial state starts completely honest with NO fake reviews as requested
const INITIAL_REVIEWS: CustomerReview[] = [];

/**
 * Strips HTML tags and malicious characters to prevent XSS attacks
 */
function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Returns stored reviews from local cache
 */
function getCachedReviews(): CustomerReview[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS;
  try {
    const raw = safeGetItem(REVIEWS_STORAGE_KEY);
    if (!raw) return INITIAL_REVIEWS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

/**
 * Saves reviews into local cache and dispatches event
 */
function setCachedReviews(reviews: CustomerReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent(REVIEWS_CHANGED_EVENT, { detail: reviews }));
  } catch (err) {
    console.error('Failed to cache customer reviews:', err);
  }
}

/**
 * Retrieves public approved reviews from Supabase with local fallback.
 * Strictly hides customer email to protect privacy.
 */
export async function getPublicApprovedReviews(): Promise<PublicCustomerReview[]> {
  let reviews: CustomerReview[] = getCachedReviews();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('id, customer_name, service_type, rating, description, photo_url, avatar_url, is_verified_google, created_at, approved_at, status, is_spam')
        .eq('status', 'approved')
        .eq('is_spam', false)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: CustomerReview[] = data.map((item: any) => ({
          id: item.id,
          customerName: item.customer_name,
          customerEmail: '', // Never populate private email for public requests
          serviceType: item.service_type,
          rating: Number(item.rating),
          description: item.description,
          photoUrl: item.photo_url || undefined,
          avatarUrl: item.avatar_url || undefined,
          status: 'approved',
          isVerifiedGoogle: Boolean(item.is_verified_google),
          createdAt: item.created_at,
          approvedAt: item.approved_at
        }));
        
        // Merge with approved items in cache
        const nonSupabase = reviews.filter(r => r.status === 'approved' && !mapped.some(m => m.id === r.id));
        reviews = [...mapped, ...nonSupabase];
      }
    } catch (err) {
      console.warn('Could not fetch approved reviews from Supabase, using local store:', err);
    }
  }

  // Filter only approved & non-spam reviews
  const approvedOnly = reviews.filter(r => r.status === 'approved' && !r.isSpam);

  // Return public format with email completely omitted
  return approvedOnly.map(r => ({
    id: r.id,
    customerName: r.customerName,
    serviceType: r.serviceType,
    rating: r.rating,
    description: r.description,
    photoUrl: r.photoUrl,
    avatarUrl: r.avatarUrl,
    isVerifiedGoogle: r.isVerifiedGoogle,
    createdAt: r.createdAt,
    approvedAt: r.approvedAt
  }));
}

/**
 * Retrieves all reviews (Pending, Approved, Rejected) for Admin Dashboard
 */
export async function getAllReviewsForAdmin(): Promise<CustomerReview[]> {
  let reviews: CustomerReview[] = getCachedReviews();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const fromDb: CustomerReview[] = data.map((item: any) => ({
          id: item.id,
          customerName: item.customer_name,
          customerEmail: item.customer_email,
          googleUserId: item.google_user_id || undefined,
          serviceType: item.service_type,
          rating: Number(item.rating),
          description: item.description,
          photoUrl: item.photo_url || undefined,
          avatarUrl: item.avatar_url || undefined,
          status: item.status as CustomerReview['status'],
          rejectionReason: item.rejection_reason || undefined,
          isVerifiedGoogle: Boolean(item.is_verified_google),
          isSpam: Boolean(item.is_spam),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          approvedAt: item.approved_at
        }));

        // Merge keeping local pending if not synced
        const nonDb = reviews.filter(r => !fromDb.some(d => d.id === r.id));
        reviews = [...fromDb, ...nonDb];
        setCachedReviews(reviews);
      }
    } catch (err) {
      console.warn('Could not fetch all reviews from Supabase, using local store:', err);
    }
  }

  return reviews;
}

/**
 * Checks whether this Google account email has already reviewed this service
 */
export async function hasAlreadyReviewedService(
  email: string, 
  serviceType: string
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanService = serviceType.trim().toLowerCase();

  // 1. Check local cache
  const localList = getCachedReviews();
  const existsLocally = localList.some(
    r => r.customerEmail?.toLowerCase() === cleanEmail && 
         r.serviceType.toLowerCase() === cleanService &&
         !r.isSpam
  );
  if (existsLocally) return true;

  // 2. Check Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('customer_reviews')
        .select('id')
        .ilike('customer_email', cleanEmail)
        .ilike('service_type', cleanService)
        .eq('is_spam', false)
        .limit(1);

      if (data && data.length > 0) {
        return true;
      }
    } catch {
      // Fallback to local
    }
  }

  return false;
}

/**
 * Submits a new customer review.
 * Always created in 'pending' status for admin approval.
 */
export async function submitCustomerReview(
  payload: ReviewSubmissionPayload
): Promise<{ success: boolean; message: string; review?: CustomerReview }> {
  const cleanName = sanitizeText(payload.customerName);
  const cleanEmail = payload.customerEmail.trim().toLowerCase();
  const cleanDesc = sanitizeText(payload.description);
  const cleanService = sanitizeText(payload.serviceType);

  // Validation
  if (!cleanName || cleanName.length < 2) {
    return { success: false, message: 'অনুগ্রহ করে আপনার সঠিক নাম প্রদান করুন (Name is required)' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Google অ্যাকাউন্টের ভ্যালিড ইমেইল প্রয়োজন (Valid Google email is required)' };
  }
  if (!cleanService) {
    return { success: false, message: 'অনুগ্রহ করে সার্ভিসের ধরন নির্বাচন করুন (Please select a service type)' };
  }
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    return { success: false, message: '১ থেকে ৫ স্টারের মধ্যে রেটিং দিন (Rating must be 1 to 5 stars)' };
  }
  if (!cleanDesc || cleanDesc.length < 10) {
    return { success: false, message: 'কমপক্ষে ১০ অক্ষরের বিস্তারিত রিভিউ লিখুন (Review must be at least 10 characters)' };
  }

  // Duplicate check: Prevent multiple reviews for the same service from the same Google Account
  const isDuplicate = await hasAlreadyReviewedService(cleanEmail, cleanService);
  if (isDuplicate) {
    return { 
      success: false, 
      message: 'আপনি এই Google Account দিয়ে ইতিমধ্যে এই সার্ভিসের জন্য একটি রিভিউ দিয়েছেন। আপনি চাইলে অন্য কোনো সার্ভিসের জন্য রিভিউ দিতে পারেন।' 
    };
  }

  const newReview: CustomerReview = {
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    customerName: cleanName,
    customerEmail: cleanEmail,
    googleUserId: payload.googleUserId,
    serviceType: cleanService,
    rating: Math.round(payload.rating),
    description: cleanDesc,
    photoUrl: payload.photoUrl,
    avatarUrl: payload.avatarUrl,
    status: 'pending', // Strictly pending until admin approval!
    isVerifiedGoogle: true,
    isSpam: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local store
  const existing = getCachedReviews();
  setCachedReviews([newReview, ...existing]);

  // 2. Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .insert({
          id: newReview.id,
          customer_name: newReview.customerName,
          customer_email: newReview.customerEmail,
          google_user_id: newReview.googleUserId || null,
          service_type: newReview.serviceType,
          rating: newReview.rating,
          description: newReview.description,
          photo_url: newReview.photoUrl || null,
          avatar_url: newReview.avatarUrl || null,
          status: 'pending',
          is_verified_google: true,
          is_spam: false
        });

      if (error) {
        console.warn('Supabase insert note (cached locally):', error.message);
      }
    } catch (err) {
      console.warn('Could not insert review to Supabase:', err);
    }
  }

  return {
    success: true,
    message: 'আপনার রিভিউটি সফলভাবে জমা হয়েছে! সানভিলোজ ক্লিন কেয়ার টিমের যাচাইয়ের পর এটি ওয়েবসাইটে প্রকাশিত হবে।',
    review: newReview
  };
}

/**
 * Admin action: Approve a review
 */
export async function approveReview(id: string): Promise<boolean> {
  const reviews = getCachedReviews();
  const now = new Date().toISOString();
  const updated = reviews.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedAt: now, updatedAt: now } : r);
  setCachedReviews(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('customer_reviews')
        .update({ status: 'approved', approved_at: now, updated_at: now })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase approve error:', err);
    }
  }

  return true;
}

/**
 * Admin action: Reject a review with optional reason
 */
export async function rejectReview(id: string, reason?: string): Promise<boolean> {
  const reviews = getCachedReviews();
  const now = new Date().toISOString();
  const updated = reviews.map(r => r.id === id ? { 
    ...r, 
    status: 'rejected' as const, 
    rejectionReason: reason || 'Does not meet review guidelines',
    updatedAt: now 
  } : r);
  setCachedReviews(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('customer_reviews')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason || 'Does not meet review guidelines', 
          updated_at: now 
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase reject error:', err);
    }
  }

  return true;
}

/**
 * Admin action: Permanently delete a review
 */
export async function deleteReview(id: string): Promise<boolean> {
  const reviews = getCachedReviews();
  const updated = reviews.filter(r => r.id !== id);
  setCachedReviews(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}

/**
 * Admin action: Mark review as spam
 */
export async function markReviewAsSpam(id: string): Promise<boolean> {
  const reviews = getCachedReviews();
  const now = new Date().toISOString();
  const updated = reviews.map(r => r.id === id ? { 
    ...r, 
    isSpam: true, 
    status: 'rejected' as const, 
    rejectionReason: 'Flagged as spam',
    updatedAt: now 
  } : r);
  setCachedReviews(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('customer_reviews')
        .update({ is_spam: true, status: 'rejected', rejection_reason: 'Flagged as spam', updated_at: now })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase spam flag error:', err);
    }
  }

  return true;
}

/**
 * Calculates accurate statistics from approved reviews
 */
export function calculateReviewStats(reviews: PublicCustomerReview[] | CustomerReview[]): ReviewStats {
  const approved = reviews.filter(r => ('status' in r ? r.status === 'approved' : true));
  const totalApproved = approved.length;

  if (totalApproved === 0) {
    return {
      totalApproved: 0,
      averageRating: 0,
      countsByRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentagesByRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const rev of approved) {
    const star = Math.max(1, Math.min(5, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[star] = (counts[star] || 0) + 1;
    sum += rev.rating;
  }

  const averageRating = Number((sum / totalApproved).toFixed(1));

  const percentages = {
    5: Math.round((counts[5] / totalApproved) * 100),
    4: Math.round((counts[4] / totalApproved) * 100),
    3: Math.round((counts[3] / totalApproved) * 100),
    2: Math.round((counts[2] / totalApproved) * 100),
    1: Math.round((counts[1] / totalApproved) * 100)
  };

  return {
    totalApproved,
    averageRating,
    countsByRating: counts,
    percentagesByRating: percentages
  };
}

// ==============================================================================
// GOOGLE ACCOUNT VERIFICATION SESSION HELPERS FOR REVIEW SUBMISSION
// ==============================================================================

export function getStoredGoogleReviewer(): GoogleReviewUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(GOOGLE_USER_SESSION_KEY) || localStorage.getItem(GOOGLE_USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGoogleReviewer(user: GoogleReviewUser): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(user);
    sessionStorage.setItem(GOOGLE_USER_SESSION_KEY, serialized);
    localStorage.setItem(GOOGLE_USER_SESSION_KEY, serialized);
  } catch (err) {
    console.error('Failed to store Google reviewer session:', err);
  }
}

export function clearGoogleReviewer(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GOOGLE_USER_SESSION_KEY);
    localStorage.removeItem(GOOGLE_USER_SESSION_KEY);
  } catch {
    // Ignore
  }
}
