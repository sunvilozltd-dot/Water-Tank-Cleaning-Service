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
  ExternalLink,
  ArrowUpDown,
  X
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
import { logAdminAction } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

export const ReviewsTab: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'published' | 'all' | 'rejected' | 'pending'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | number>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modals & Confirmation
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmationReview, setDeleteConfirmationReview] = useState<CustomerReview | null>(null);
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

    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('admin:customer_reviews')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'customer_reviews' },
            () => {
              fetchReviews();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime admin reviews notice:', err);
      }
    }

    return () => {
      window.removeEventListener(REVIEWS_CHANGED_EVENT, handleReviewsChanged);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Action Handlers
  const handleConfirmDelete = async () => {
    if (!deleteConfirmationReview) return;
    const target = deleteConfirmationReview;
    setActionLoading(target.id);
    try {
      const success = await deleteReview(target.id);
      if (success) {
        await logAdminAction(
          adminUser?.email || 'admin@sunviloz.com',
          'Deleted Customer Review',
          'Review',
          target.id,
          `Customer: ${target.customerName}, Rating: ${target.rating}★, Service: ${target.serviceType}`
        );
        setDeleteConfirmationReview(null);
        await fetchReviews();
      } else {
        alert('ডাটাবেজ থেকে রিভিউ মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('রিভিউ মুছে ফেলতে ত্রুটি দেখা দিয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSpam = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি "${name}"-এর রিভিউটিকে স্প্যাম হিসেবে চিহ্নিত করতে চান? এটি ওয়েবসাইট থেকে সরানো হবে।`)) {
      return;
    }
    setActionLoading(id);
    try {
      await markReviewAsSpam(id);
      await logAdminAction(
        adminUser?.email || 'admin@sunviloz.com',
        'Marked Review as Spam',
        'Review',
        id,
        `Customer: ${name}`
      );
      await fetchReviews();
    } catch (err) {
      alert('স্প্যাম মার্ক করতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoading(null);
    }
  };

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

  // Counts
  const publishedCount = reviews.filter(r => (r.status === 'published' || r.status === 'approved') && !r.isSpam).length;
  const pendingCount = reviews.filter(r => r.status === 'pending' && !r.isSpam).length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected' || r.isSpam).length;

  // Filter & Sort
  const filteredReviews = reviews.filter((r) => {
    const isLive = (r.status === 'published' || r.status === 'approved') && !r.isSpam;
    const isRejected = r.status === 'rejected' || r.isSpam;
    const isPending = r.status === 'pending' && !r.isSpam;

    if (activeTab === 'published' && !isLive) return false;
    if (activeTab === 'rejected' && !isRejected) return false;
    if (activeTab === 'pending' && !isPending) return false;

    // Rating filter
    if (ratingFilter !== 'all' && Math.round(r.rating) !== ratingFilter) return false;

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

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
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
              <span>Customer Reviews &amp; Moderation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              গ্রাহক রিভিউ ও Google Reviews ইন্টিগ্রেশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              ওয়েবসাইটে সরাসরি গ্রাহকদের Google Business Profile-এ রিভিউ দিতে উৎসাহিত করা হয়।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8266213,90.4190328,15z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0f766e] hover:to-[#0D9488] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#0D9488]/20 shrink-0"
            >
              <span>গুগল রিভিউ লিংক টেস্ট</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={fetchReviews}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ করুন</span>
            </button>
          </div>
        </div>

        {/* Counter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('published')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === 'published'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">লাইভ / প্রকাশিত</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {publishedCount}
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
              <span className="text-xs font-semibold">বাতিল / স্প্যাম</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {rejectedCount}
            </div>
          </button>

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
        </div>
      </div>

      {/* Control Bar: Search + Star Filter + Sort By */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="গ্রাহকের নাম, ইমেইল, কিংবা রিভিউর বিষয় দিয়ে সার্চ করুন..."
              className="flex-1 bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white px-1.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Rating Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>স্টার ফিল্টার:</span>
            </span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="all">সব স্টার (All Ratings)</option>
              <option value="5">৫ স্টার (5 Stars)</option>
              <option value="4">৪ স্টার (4 Stars)</option>
              <option value="3">৩ স্টার (3 Stars)</option>
              <option value="2">২ স্টার (2 Stars)</option>
              <option value="1">১ স্টার (1 Star)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>সর্টিং:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="newest">সর্বশেষ তারিখ (Newest First)</option>
              <option value="oldest">পুরোনো তারিখ (Oldest First)</option>
              <option value="highest">সর্বোচ্চ রেটিং (Highest Rating)</option>
              <option value="lowest">সর্বনিম্ন রেটিং (Lowest Rating)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0D9488]" />
          <p className="text-xs">ডাটাবেজ থেকে রিভিউ লোড হচ্ছে...</p>
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">
            কোনো রিভিউ পাওয়া যায়নি
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ফিল্টারের সাথে মিলে এমন কোনো রিভিউ পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => {
            const isLoading = actionLoading === review.id;
            const isLive = (review.status === 'published' || review.status === 'approved') && !review.isSpam;
            const isPending = review.status === 'pending';
            const isRejected = review.status === 'rejected' || review.isSpam;

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
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : isPending 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {isLive ? 'লাইভ / প্রকাশিত' : isPending ? 'অপেক্ষমান' : 'বাতিল / স্প্যাম'}
                        </span>
                      </div>

                      {/* Admin-only private customer email */}
                      {review.customerEmail && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{review.customerEmail}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">Admin Only</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stars + Date */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1">
                    <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold ml-1 text-white">{review.rating}.0</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Service Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-[#38BDF8] text-xs font-medium border border-slate-700/60">
                  <span>সার্ভিস: {review.serviceType}</span>
                </div>

                {/* Review Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                  {review.description}
                </p>

                {/* Customer Photo Preview (if uploaded) */}
                {review.photoUrl && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(review.photoUrl || null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs font-semibold hover:bg-blue-900/40 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>কাস্টমার ফটো দেখুন (Click to view image)</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {review.id}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve button if pending */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleApprove(review.id)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন</span>
                      </button>
                    )}

                    {/* Mark as Spam */}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleMarkSpam(review.id, review.customerName)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 border border-amber-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>স্প্যাম হিসেবে ফ্ল্যাগ করুন</span>
                      </button>
                    )}

                    {/* Delete Permanently */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmationReview(review)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছে ফেলুন (Delete)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal with Audit Trail notice */}
      {deleteConfirmationReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">
                রিভিউটি চিরতরে মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-white">&quot;{deleteConfirmationReview.customerName}&quot;</span>-এর এই রিভিউটি মুছে ফেললে এটি Supabase ডাটাবেজ এবং ওয়েবসাইট থেকে চিরতরে মুছে যাবে।
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-300">সার্ভিস:</strong> {deleteConfirmationReview.serviceType}</div>
              <div><strong className="text-slate-300">রেটিং:</strong> {deleteConfirmationReview.rating} স্টার</div>
              <div className="line-clamp-2"><strong className="text-slate-300">বিবরণী:</strong> {deleteConfirmationReview.description}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmationReview(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading === deleteConfirmationReview.id}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading === deleteConfirmationReview.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {photoPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPhotoPreview(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={photoPreview} alt="Customer uploaded" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
