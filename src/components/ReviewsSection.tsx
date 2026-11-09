import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  MapPin,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { PublicCustomerReview } from '../types/review';
import { getPublicApprovedReviews } from '../services/reviewService';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// Official Sunviloz Clean Care Google Business Profile Review URL
const OFFICIAL_GOOGLE_REVIEW_URL =
  'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8266213,90.4190328,15z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt?entry=ttu';

const OFFICIAL_GOOGLE_MAPS_PROFILE_URL =
  'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8267734,90.4179331,17z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt';

export const ReviewsSection: React.FC = () => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const [reviews, setReviews] = useState<PublicCustomerReview[]>([]);
  const [loading, setLoading] = useState(true);

  const googleReviewLink = business?.googleReviewsUrl || OFFICIAL_GOOGLE_REVIEW_URL;
  const googleProfileLink = business?.googleBusinessProfileUrl || OFFICIAL_GOOGLE_MAPS_PROFILE_URL;

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        const data = await getPublicApprovedReviews();
        if (mounted) {
          setReviews(data || []);
        }
      } catch (err) {
        console.warn('ReviewsSection notice:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, []);

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
      className="py-16 sm:py-24 bg-[#F5FAFC] border-b border-[#E2E8F0] relative overflow-hidden" 
      id="reviews-section" 
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0D9488] text-xs font-bold uppercase tracking-wider border border-[#0D9488]/30 shadow-xs">
            {/* Google Multicolor G Icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{lang === 'bn' ? 'গুগল বিজনেস প্রোফাইল রিভিউ' : 'Google Business Profile Reviews'}</span>
          </div>

          <h2 id="reviews-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight">
            {lang === 'bn' ? 'গ্রাহকদের সরাসরি গুগল রিভিউ ও রেটিং' : 'Real Google Reviews & Customer Feedback'}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto rounded-full" />

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
            {lang === 'bn'
              ? 'সানভিলোজ ক্লিন কেয়ারের অফিসিয়াল গুগল বিজনেস প্রোফাইলে গ্রাহকদের সরাসরি মতামত দেখুন এবং আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন।'
              : 'Explore verified customer ratings on our official Google Business Profile or share your own service experience directly on Google Maps.'}
          </p>
        </div>

        {/* ================= GOOGLE BUSINESS PROFILE HERO CARD ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E2E8F0] shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            
            {/* Business Info Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-8 h-8" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-[#123047]">
                    Sunviloz Clean Care
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Verified</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Dhaka, Bangladesh</span>
                  </span>
                  <span>•</span>
                  <span>Water Tank &amp; Pipeline Cleaning</span>
                </div>
              </div>
            </div>

            {/* Prominent "গুগলে রিভিউ দিন" Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0f766e] hover:to-[#0D9488] text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-[#0D9488]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{lang === 'bn' ? 'গুগলে রিভিউ দিন' : 'Review on Google'}</span>
                <ExternalLink className="w-4 h-4 text-white/90" />
              </a>

              <a
                href={googleProfileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#123047] border border-[#E2E8F0] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{lang === 'bn' ? 'ম্যাপসে প্রোফাইল দেখুন' : 'View on Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
              </a>
            </div>

          </div>

          {/* Three Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-[#475569]">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#123047]">১০০% ভেরিফাইড রিভিউ</strong>
                <span>সরাসরি অফিসিয়াল গুগল আইডির মাধ্যমে প্রকাশিত।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <MessageSquare className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#123047]">বাস্তব গ্রাহক মতামত</strong>
                <span>কোনো ফেক বা মনগড়া রিভিউ প্রদর্শন করা হয় না।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Sparkles className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#123047]">স্বচ্ছ সার্ভিস অভিজ্ঞতা</strong>
                <span>কাজ শেষে সরাসরি গুগল ম্যাপসে মতামত প্রদান করুন।</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= REVIEWS FEED IF SYNCED ================= */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
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
                          <span>Google Reviewer</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

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

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    "{rev.description}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-[#0D9488]">{rev.serviceType}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span>Google Maps</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default ReviewsSection;
