import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle, 
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
    <section className="py-16 sm:py-24 bg-[#080A0D] border-b border-[#303743]" id="reviews-section" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2585FF]">
            {lang === 'bn' ? 'গ্রাহকদের সন্তুষ্টির রিভিউ' : 'Customer Experiences'}
          </span>
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1.5">
            {t('reviews.h2')}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#2585FF] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-2xl mx-auto">
            {t('reviews.sub')}
          </p>
        </div>

        {/* Customer Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#11151B] rounded-2xl p-6 border border-[#303743] hover:border-[#2585FF]/40 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1 text-amber-400" aria-label={`${rev.rating} out of 5 stars`}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                    ))}
                    <span className="sr-only">{rev.rating} out of 5 stars</span>
                  </div>
                  {rev.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#28C76F] bg-[#28C76F]/10 px-2 py-0.5 rounded-full border border-[#28C76F]/30">
                      <CheckCircle className="w-3 h-3 text-[#28C76F]" aria-hidden="true" />
                      <span>{lang === 'bn' ? 'যাচাইকৃত কাজ' : 'Verified Service'}</span>
                    </span>
                  )}
                </div>

                {/* Review comment */}
                <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed italic mb-5">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Service Meta */}
              <div className="pt-3.5 border-t border-[#303743]">
                <div className="font-bold text-white text-sm">
                  {rev.customerName}
                </div>
                <div className="text-[11px] text-[#B8C0CC] font-medium">
                  {rev.area}
                </div>
                <div className="text-[11px] text-[#2585FF] font-semibold mt-0.5">
                  {rev.service}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Option for customer to submit feedback */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-white bg-[#171C24] hover:bg-[#202630] border border-[#303743] hover:border-[#2585FF] px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#2585FF]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'আপনার মূল্যবান মতামত দিন' : 'Share Service Feedback'}</span>
          </button>
        </div>

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="add-review-title">
            <div className="bg-[#11151B] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#303743]">
              <div className="flex items-center justify-between mb-3">
                <h3 id="add-review-title" className="text-lg font-bold text-white">
                  {lang === 'bn' ? 'মতামত প্রদান করুন' : 'Share Your Experience'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-[#B8C0CC] hover:text-white transition-colors"
                  aria-label="Close review modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#B8C0CC] mb-5">
                {lang === 'bn' ? 'আপনার বাস্তব অভিজ্ঞতা অন্য গ্রাহকদের সঠিক সেবা নির্বাচনে সাহায্য করবে।' : 'Let fellow Dhaka residents know about the quality and punctuality of service.'}
              </p>

              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C24] border border-[#303743] text-white text-xs sm:text-sm focus:outline-none focus:border-[#2585FF]"
                    placeholder="e.g. Tanvir Ahmed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    {lang === 'bn' ? 'এলাকা / ঠিকানা' : 'Area / Neighborhood'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.area}
                    onChange={(e) => setNewReview({ ...newReview, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C24] border border-[#303743] text-white text-xs sm:text-sm focus:outline-none focus:border-[#2585FF]"
                    placeholder="e.g. Dhanmondi, Dhaka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    {lang === 'bn' ? 'রেটিং' : 'Rating'}
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C24] border border-[#303743] text-white text-xs sm:text-sm focus:outline-none focus:border-[#2585FF]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    {lang === 'bn' ? 'আপনার মন্তব্য' : 'Review Comment'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C24] border border-[#303743] text-white text-xs sm:text-sm focus:outline-none focus:border-[#2585FF]"
                    placeholder={lang === 'bn' ? 'কাজের মান ও অভিজ্ঞতা লিখুন...' : 'Describe your cleaning service experience...'}
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-[#B8C0CC] hover:text-white bg-[#171C24] border border-[#303743]"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2585FF] hover:bg-[#1a73e8]"
                  >
                    {lang === 'bn' ? 'জমা দিন' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
