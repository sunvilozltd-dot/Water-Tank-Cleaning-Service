import React, { useState } from 'react';
import { 
  Star, 
  Plus,
  X,
  MessageSquare
} from 'lucide-react';
import { ReviewItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const ReviewsSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { reviews, updateReviewsList } = useSiteConfig();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    area: '',
    service: 'Water Tank Cleaning',
    rating: 5,
    comment: ''
  });

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const item: ReviewItem = {
      id: 'rev_' + Date.now(),
      customerName: newReview.name,
      area: newReview.area || 'Dhaka',
      service: newReview.service,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      comment: newReview.comment,
      isVerified: false
    };

    updateReviewsList([item, ...reviews]);
    setShowAddModal(false);
    setNewReview({ name: '', area: '', service: 'Water Tank Cleaning', rating: 5, comment: '' });
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F5FAFC] border-b border-[#E2E8F0]" id="reviews-section" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            {lang === 'bn' ? 'গ্রাহকদের সন্তুষ্টির রিভিউ' : 'Customer Experiences'}
          </span>
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight mt-2.5">
            {t('reviews.h2')}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
            {t('reviews.sub')}
          </p>
        </div>

        {/* Customer Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Rating stars (#F59E0B) */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1 text-[#F59E0B]" aria-label={`${rev.rating} out of 5 stars`}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F59E0B]" aria-hidden="true" />
                    ))}
                    <span className="sr-only">{rev.rating} out of 5 stars</span>
                  </div>
                  {rev.date && (
                    <span className="text-[11px] text-[#94A3B8] font-mono">
                      {rev.date}
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Customer Info */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#123047]">
                    {rev.customerName}
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    {rev.area}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5F3] text-[#0D9488]">
                  {rev.service}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Review Trigger */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#123047] hover:border-[#0D9488] hover:text-[#0D9488] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0D9488]" />
            <span>{lang === 'bn' ? 'আপনার রিভিউ যোগ করুন' : 'Write a Review'}</span>
          </button>
        </div>

      </div>

      {/* Write a Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#123047]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E2E8F0] shadow-2xl relative text-[#172B3A] animate-fadeIn">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#172B3A] rounded-full hover:bg-[#F5FAFC]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#123047] mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0D9488]" />
              <span>{lang === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share Your Experience'}</span>
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              {lang === 'bn' ? 'আমাদের সেবা সম্পর্কে আপনার মূল্যবান মতামত লিখুন।' : 'Leave your feedback regarding our cleaning service.'}
            </p>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#172B3A] block mb-1">
                  {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="e.g. Asif Mahmud"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#F5FAFC] border border-[#E2E8F0] text-[#172B3A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172B3A] block mb-1">
                  {lang === 'bn' ? 'এলাকা (Dhaka Area)' : 'Area / Neighborhood'}
                </label>
                <input
                  type="text"
                  value={newReview.area}
                  onChange={(e) => setNewReview({ ...newReview, area: e.target.value })}
                  placeholder="e.g. Dhanmondi / Uttara"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#F5FAFC] border border-[#E2E8F0] text-[#172B3A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172B3A] block mb-1">
                  {lang === 'bn' ? 'রেটিং (Rating)' : 'Rating'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-[#F59E0B] fill-[#F59E0B]'
                            : 'text-[#CBD5E1]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172B3A] block mb-1">
                  {lang === 'bn' ? 'আপনার মন্তব্য' : 'Comment / Review'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share details of your experience..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#F5FAFC] border border-[#E2E8F0] text-[#172B3A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F5FAFC]"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-xs"
                >
                  {lang === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
