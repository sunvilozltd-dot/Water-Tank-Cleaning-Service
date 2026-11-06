import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  Filter, 
  Calendar, 
  Building2, 
  Camera, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { PublicCustomerReview, ReviewStats } from '../types/review';
import { 
  getPublicApprovedReviews, 
  calculateReviewStats, 
  REVIEWS_CHANGED_EVENT 
} from '../services/reviewService';
import { CustomerReviewModal } from './CustomerReviewModal';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

export const ReviewsSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { business } = useSiteConfig();

  const [reviews, setReviews] = useState<PublicCustomerReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalApproved: 0,
    averageRating: 0,
    countsByRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentagesByRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [selectedService, setSelectedService] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Load reviews on mount and when changed
  const loadReviews = async () => {
    try {
      const data = await getPublicApprovedReviews();
      setReviews(data);
      setStats(calculateReviewStats(data));
    } catch (err) {
      console.warn('Error loading public customer reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();

    const handleReviewsChanged = () => {
      loadReviews();
    };

    window.addEventListener(REVIEWS_CHANGED_EVENT, handleReviewsChanged);

    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('public:customer_reviews_feed')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'customer_reviews' },
            () => {
              loadReviews();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime public reviews notice:', err);
      }
    }

    return () => {
      window.removeEventListener(REVIEWS_CHANGED_EVENT, handleReviewsChanged);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Filter & Sort Logic
  const filteredReviews = reviews.filter((rev) => {
    if (selectedService === 'all') return true;
    return rev.serviceType.toLowerCase().includes(selectedService.toLowerCase());
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Unique service types for filter dropdown
  const uniqueServices = Array.from(new Set(reviews.map((r) => r.serviceType))).filter(Boolean);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section 
      className="py-16 sm:py-24 bg-[#F5FAFC] border-b border-[#E2E8F0]" 
      id="reviews-section" 
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F5F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider border border-[#0D9488]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{lang === 'bn' ? 'সানভিলোজ ভেরিফাইড রিভিউ' : 'Customer Experiences'}</span>
          </div>

          <h2 id="reviews-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight">
            {lang === 'bn' ? 'গ্রাহকদের বাস্তব সন্তুষ্টি ও রেটিং' : 'Real Customer Reviews & Ratings'}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto rounded-full" />

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
            {lang === 'bn'
              ? 'গুগল একাউন্টে যাচাইকৃত গ্রাহকদের সরাসরি রিভিউ। আমরা কোনো মনগড়া বা ফেক রিভিউ প্রদর্শন করি না—প্রতিটি মতামত প্রকৃত গ্রাহকের কাজের ওপর ভিত্তি করে অনুমোদিত।'
              : 'Authentic reviews verified via Google accounts. We strictly maintain 100% genuine customer feedback with zero fake testimonials.'}
          </p>
        </div>

        {/* ================= REVIEW SUMMARY DASHBOARD ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E2E8F0] shadow-sm max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Score & Stars */}
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-[#E2E8F0] pb-6 md:pb-0 md:pr-8 space-y-2">
              <div className="text-5xl sm:text-6xl font-black text-[#123047]">
                {stats.totalApproved > 0 ? stats.averageRating : '5.0'}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-1 text-[#F59E0B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${
                      (stats.averageRating || 5) >= star 
                        ? 'fill-[#F59E0B] text-[#F59E0B]' 
                        : 'text-slate-300'
                    }`} 
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                {lang === 'bn' 
                  ? `মোট ${stats.totalApproved} টি অনুমোদিত রিভিউ` 
                  : `Based on ${stats.totalApproved} verified reviews`}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0f766e] hover:to-[#0D9488] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#0D9488]/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'রিভিউ দিন' : 'Write a Review'}</span>
                </button>
              </div>
            </div>

            {/* 5-Star Breakdown Bars */}
            <div className="md:col-span-5 space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = stats.countsByRating[starNum as 1|2|3|4|5];
                const pct = stats.percentagesByRating[starNum as 1|2|3|4|5];
                return (
                  <div key={starNum} className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                      <span>{starNum}</span>
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    </span>

                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-14 text-right text-slate-500 font-medium">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Google Reviews CTA Badge */}
            <div className="md:col-span-3 bg-[#F5FAFC] p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto">
                {/* Google G logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-[#123047]">গুগল ম্যাপস রিভিউ</h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                গুগল প্রোফাইলেও আপনার মূল্যবান অভিজ্ঞতা শেয়ার করতে পারেন।
              </p>
              <a
                href={business?.googleReviewsUrl || 'https://maps.google.com/?q=Sunviloz+Clean+Care+Dhaka'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
              >
                <span>Google-এ রেট দিন</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

          </div>
        </div>

        {/* ================= CONTROLS: FILTER & SORT ================= */}
        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto pt-2">
            {/* Service Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>সার্ভিস অনুযায়ী:</span>
              </span>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 text-xs focus:outline-none focus:border-[#0D9488]"
              >
                <option value="all">সকল সার্ভিস ({reviews.length})</option>
                {uniqueServices.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">বাছাই করুন:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 text-xs focus:outline-none focus:border-[#0D9488]"
              >
                <option value="newest">সবচেয়ে নতুন (Newest First)</option>
                <option value="highest">সর্বোচ্চ রেটিং (Highest Rated)</option>
                <option value="lowest">সর্বনিম্ন রেটিং (Lowest Rated)</option>
              </select>
            </div>
          </div>
        )}

        {/* ================= REVIEWS GRID OR HONEST EMPTY STATE ================= */}
        {sortedReviews.length === 0 ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8F0] shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {reviews.length === 0 
                  ? 'এখনো কোনো গ্রাহক রিভিউ অনুমোদিত হয়নি' 
                  : 'এই ক্যাটাগরিতে কোনো রিভিউ পাওয়া যায়নি'}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-md mx-auto">
                {reviews.length === 0
                  ? 'আমাদের সার্ভিস গ্রহণ করে থাকলে আপনিই প্রথম রিভিউ দিন! প্রতিটি রিভিউ গুগল আইডিতে যাচাই করে অ্যাডমিন অনুমোদনের পর প্রকাশিত হয়।'
                  : 'ফিল্টার পরিবর্তন করে অন্যান্য সার্ভিসের গ্রাহক অভিজ্ঞতা দেখুন।'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0f766e] hover:to-[#0D9488] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0D9488]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'bn' ? 'রিভিউ ফর্ম পূরণ করুন' : 'Write a Direct Review'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sortedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Customer Info & Google Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-[#0D9488] font-bold flex items-center justify-center shrink-0 overflow-hidden">
                        {rev.avatarUrl ? (
                          <img src={rev.avatarUrl} alt={rev.customerName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{rev.customerName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#123047] truncate">
                          {rev.customerName}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Google Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(rev.createdAt)}</span>
                    </span>
                  </div>

                  {/* Rating Stars & Service Badge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[#F59E0B]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-4 h-4 ${
                            rev.rating >= s ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>

                    <span className="inline-block px-2.5 py-0.5 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/20 rounded-md text-[11px] font-semibold">
                      {rev.serviceType}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    "{rev.description}"
                  </p>
                </div>

                {/* Optional Customer Attached Photo */}
                {rev.photoUrl && (
                  <div className="pt-2 border-t border-slate-100">
                    <div
                      onClick={() => setSelectedPhotoPreview(rev.photoUrl || null)}
                      className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 group/img cursor-pointer"
                    >
                      <img 
                        src={rev.photoUrl} 
                        alt="Customer job result" 
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Camera className="w-4 h-4" />
                        <span>ছবি বড় করে দেখুন</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review Modal Form */}
      <CustomerReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={() => {
          loadReviews();
        }}
      />

      {/* Photo Preview Modal */}
      {selectedPhotoPreview && (
        <div 
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
            <img src={selectedPhotoPreview} alt="Customer Review Photo" className="w-full h-full object-contain" />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default ReviewsSection;
