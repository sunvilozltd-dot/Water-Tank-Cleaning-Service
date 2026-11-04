import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Calendar, 
  Mail, 
  User, 
  Camera, 
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CustomerReview, ReviewStatus } from '../../types/review';
import { 
  getAllReviewsForAdmin, 
  approveReview, 
  rejectReview, 
  deleteReview, 
  markReviewAsSpam,
  REVIEWS_CHANGED_EVENT
} from '../../services/reviewService';

export const ReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalReview, setRejectModalReview] = useState<CustomerReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviewsForAdmin();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const handleReviewsChanged = () => {
      fetchReviews();
    };

    window.addEventListener(REVIEWS_CHANGED_EVENT, handleReviewsChanged);
    return () => {
      window.removeEventListener(REVIEWS_CHANGED_EVENT, handleReviewsChanged);
    };
  }, []);

  // Action Handlers
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveReview(id);
      await fetchReviews();
    } catch (err) {
      alert('অনুমোদন করতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalReview) return;
    setActionLoading(rejectModalReview.id);
    try {
      await rejectReview(rejectModalReview.id, rejectionReason.trim() || undefined);
      setRejectModalReview(null);
      setRejectionReason('');
      await fetchReviews();
    } catch (err) {
      alert('বাতিল করতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}"-এর রিভিউটি চিরতরে মুছে ফেলতে চান?`)) {
      return;
    }
    setActionLoading(id);
    try {
      await deleteReview(id);
      await fetchReviews();
    } catch (err) {
      alert('মুছে ফেলতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSpam = async (id: string) => {
    if (!window.confirm('এই রিভিউটিকে স্প্যাম হিসেবে চিহ্নিত করতে চান? এটি স্বয়ংক্রিয়ভাবে বাতিল তালিকায় চলে যাবে।')) {
      return;
    }
    setActionLoading(id);
    try {
      await markReviewAsSpam(id);
      await fetchReviews();
    } catch (err) {
      alert('স্প্যাম মার্ক করতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter reviews
  const pendingCount = reviews.filter(r => r.status === 'pending' && !r.isSpam).length;
  const approvedCount = reviews.filter(r => r.status === 'approved' && !r.isSpam).length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected' || r.isSpam).length;

  const filteredReviews = reviews.filter((r) => {
    // Tab filter
    if (activeTab === 'pending' && (r.status !== 'pending' || r.isSpam)) return false;
    if (activeTab === 'approved' && (r.status !== 'approved' || r.isSpam)) return false;
    if (activeTab === 'rejected' && (r.status !== 'rejected' && !r.isSpam)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchEmail = (r.customerEmail || '').toLowerCase().includes(q);
      const matchService = r.serviceType.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      return matchName || matchEmail || matchService || matchDesc;
    }

    return true;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('bn-BD', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Customer Reviews Moderation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              গ্রাহক রিভিউ ও রেটিং ব্যবস্থাপনা
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Google Account দিয়ে ভেরিফাইড গ্রাহক রিভিউসমূহ পরিচালনা করুন। নতুন রিভিউ অনুমোদনের আগ পর্যন্ত ওয়েবসাইটে প্রদর্শিত হবে না।
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* Counter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">অপেক্ষমান (Pending)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {pendingCount}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">অনুমোদিত (Approved)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {approvedCount}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-lg shadow-rose-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">বাতিলকৃত (Rejected)</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {rejectedCount}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">সকল রিভিউ (All)</span>
              <Filter className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {reviews.length}
            </div>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="গ্রাহকের নাম, ইমেইল, সার্ভিস কিংবা রিভিউর বিবরণী দিয়ে সার্চ করুন..."
          className="flex-1 bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0D9488]" />
          <p className="text-xs">রিভিউ লোড হচ্ছে...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">
            কোনো রিভিউ পাওয়া যায়নি
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'বর্তমানে অনুমোদনের অপেক্ষায় কোনো রিভিউ নেই।'
              : 'এই ক্যাটাগরিতে কোনো রিভিউ পাওয়া যায়নি।'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isLoading = actionLoading === review.id;
            const isApproved = review.status === 'approved';
            const isPending = review.status === 'pending';
            const isRejected = review.status === 'rejected';

            return (
              <div
                key={review.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-colors shadow-lg"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-[#38BDF8] font-bold flex items-center justify-center shrink-0 overflow-hidden">
                      {review.avatarUrl ? (
                        <img src={review.avatarUrl} alt={review.customerName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{review.customerName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {review.customerName}
                        </h4>
                        
                        {review.isVerifiedGoogle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Google Verified</span>
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : isPending 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {isApproved ? 'Approved (অনুমোদিত)' : isPending ? 'Pending (অপেক্ষমান)' : 'Rejected (বাতিল)'}
                        </span>

                        {review.isSpam && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                            SPAM
                          </span>
                        )}
                      </div>

                      {/* Customer Email (Admin Only view) */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>{review.customerEmail}</span>
                          <span className="text-[10px] text-slate-500">(পাবলিকলি গোপন)</span>
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(review.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 self-start">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${review.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-black text-white">{review.rating}.0</span>
                  </div>
                </div>

                {/* Service Tag & Description */}
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 bg-slate-950 text-[#38BDF8] border border-slate-800 rounded-lg text-xs font-semibold">
                    সার্ভিস: {review.serviceType}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                    "{review.description}"
                  </p>

                  {review.rejectionReason && (
                    <div className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-800/40">
                      <strong>বাতিলের কারণ:</strong> {review.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Optional Customer Attached Photo */}
                {review.photoUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div
                      onClick={() => setPhotoPreview(review.photoUrl || null)}
                      className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-700 cursor-pointer group shrink-0"
                    >
                      <img src={review.photoUrl} alt="Attached" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">গ্রাহকের যুক্ত করা ছবি (ক্লিক করে বড় দেখুন)</span>
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-500">
                    ID: {review.id}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleApprove(review.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন (Approve)</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setRejectModalReview(review)}
                        className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-600/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>বাতিল করুন (Reject)</span>
                      </button>
                    )}

                    {/* Mark as Spam Button */}
                    {!review.isSpam && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleMarkSpam(review.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Spam</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDelete(review.id, review.customerName)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>রিভিউ বাতিলকরণ (Reject Review)</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              আপনি কি নিশ্চিত যে <strong>"{rejectModalReview.customerName}"</strong>-এর রিভিউটি বাতিল করতে চান? বাতিলকৃত রিভিউ কখনো পাবলিক ওয়েবসাইটে প্রদর্শিত হবে না।
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                বাতিলের কারণ (ঐচ্ছিক):
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="যেমন: অনুচিত ভাষা, স্প্যাম বা অসম্পূর্ণ বিবরণ..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalReview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div
          onClick={() => setPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
            <img src={photoPreview} alt="Customer Photo" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
