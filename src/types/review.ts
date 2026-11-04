export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string; // Strictly private - never exposed on public website
  googleUserId?: string;
  serviceType: string;
  rating: number; // 1 to 5
  description: string;
  photoUrl?: string; // Optional customer uploaded photo or tank image
  avatarUrl?: string; // Google account profile picture
  status: ReviewStatus;
  rejectionReason?: string;
  isVerifiedGoogle: boolean;
  isSpam?: boolean;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
}

export interface PublicCustomerReview {
  id: string;
  customerName: string;
  serviceType: string;
  rating: number;
  description: string;
  photoUrl?: string;
  avatarUrl?: string;
  isVerifiedGoogle: boolean;
  createdAt: string;
  approvedAt?: string;
}

export interface ReviewSubmissionPayload {
  customerName: string;
  customerEmail: string;
  googleUserId?: string;
  serviceType: string;
  rating: number;
  description: string;
  photoUrl?: string;
  avatarUrl?: string;
}

export interface GoogleReviewUser {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId: string;
}

export interface ReviewStats {
  totalApproved: number;
  averageRating: number;
  countsByRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentagesByRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const AVAILABLE_REVIEW_SERVICES = [
  'Rooftop Water Tank Cleaning (ছাদের ট্যাংক ক্লিনিং)',
  'Underground Reserve Tank Cleaning (ভূগর্ভস্থ রিজার্ভার ক্লিনিং)',
  'Water Pipeline Descaling (পানির পাইপলাইন ফ্লাশিং)',
  'Both Tanks Deep Wash (উভয় ট্যাংক কম্বো সার্ভিস)',
  'Whole House / Apartment Water Sanitization (সম্পূর্ণ ভবনের পানি সুরক্ষা)',
  'Commercial / Factory Tank Cleaning (বাণিজ্যিক ও কারখানা ট্যাংক)'
];
