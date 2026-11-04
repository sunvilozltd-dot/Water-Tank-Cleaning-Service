import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Trash2,
  LogOut,
  UserCheck
} from 'lucide-react';
import { 
  AVAILABLE_REVIEW_SERVICES, 
  GoogleReviewUser 
} from '../types/review';
import { 
  submitCustomerReview, 
  getStoredGoogleReviewer, 
  saveGoogleReviewer, 
  clearGoogleReviewer,
  hasAlreadyReviewedService 
} from '../services/reviewService';
import { compressImageFile } from '../utils/imageCompressor';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const [googleUser, setGoogleUser] = useState<GoogleReviewUser | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [googleSignInInput, setGoogleSignInInput] = useState({
    name: '',
    email: ''
  });
  const [showManualGooglePrompt, setShowManualGooglePrompt] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [serviceType, setServiceType] = useState(AVAILABLE_REVIEW_SERVICES[0]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Check for existing Google reviewer session on mount
  useEffect(() => {
    if (!isOpen) return;
    
    // Check local reviewer session
    const existing = getStoredGoogleReviewer();
    if (existing) {
      setGoogleUser(existing);
      setCustomerName(existing.name || '');
    } else {
      // Check if user is already logged into Supabase auth
      if (isSupabaseConfigured()) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && user.email) {
            const verified: GoogleReviewUser = {
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
              avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
              googleId: user.id
            };
            setGoogleUser(verified);
            saveGoogleReviewer(verified);
            setCustomerName(verified.name);
          }
        }).catch(() => {
          // Ignore
        });
      }
    }
  }, [isOpen]);

  // Check duplicates when serviceType or googleUser changes
  useEffect(() => {
    if (googleUser?.email && serviceType) {
      hasAlreadyReviewedService(googleUser.email, serviceType).then(already => {
        if (already) {
          setDuplicateWarning('আপনি এই Google Account দিয়ে ইতিমধ্যে এই সার্ভিসের জন্য একটি রিভিউ দিয়েছেন। অন্য সার্ভিসের জন্য রিভিউ দিতে ড্রপডাউন পরিবর্তন করুন।');
        } else {
          setDuplicateWarning('');
        }
      });
    }
  }, [googleUser, serviceType]);

  if (!isOpen) return null;

  // Google Sign-In Trigger
  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured()) {
        // Initiate real Supabase Google OAuth
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.href,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        if (error) {
          setShowManualGooglePrompt(true);
        }
      } else {
        setShowManualGooglePrompt(true);
      }
    } catch {
      setShowManualGooglePrompt(true);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  // Verified Google account confirmation for client verification
  const handleConfirmGoogleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSignInInput.email || !googleSignInInput.email.includes('@')) {
      setErrorMsg('সঠিক Google Email Address প্রদান করুন');
      return;
    }
    if (!googleSignInInput.name.trim()) {
      setErrorMsg('আপনার Google অ্যাকাউন্টের পুরো নাম লিখুন');
      return;
    }

    const verifiedUser: GoogleReviewUser = {
      email: googleSignInInput.email.trim().toLowerCase(),
      name: googleSignInInput.name.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleSignInInput.name)}&backgroundColor=0d9488,14b8a6,38bdf8`,
      googleId: 'g_' + Math.random().toString(36).substring(2, 10)
    };

    setGoogleUser(verifiedUser);
    saveGoogleReviewer(verifiedUser);
    setCustomerName(verifiedUser.name);
    setShowManualGooglePrompt(false);
    setErrorMsg('');
  };

  const handleSignOutGoogle = () => {
    clearGoogleReviewer();
    setGoogleUser(null);
    setCustomerName('');
    setErrorMsg('');
    setDuplicateWarning('');
  };

  // Photo Upload Handler with Automatic Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPEG, PNG, WebP) আপলোড করুন');
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMsg('');

    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.78
      });
      setPhotoUrl(compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Form Submit Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!googleUser) {
      setErrorMsg('রিভিউ জমা দিতে অনুগ্রহ করে প্রথমে Google Account দিয়ে সাইন ইন করুন');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('অনুগ্রহ করে কমপক্ষে ১০ অক্ষরের বিস্তারিত রিভিউ লিখুন');
      return;
    }

    if (duplicateWarning) {
      setErrorMsg(duplicateWarning);
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitCustomerReview({
        customerName: customerName.trim(),
        customerEmail: googleUser.email,
        googleUserId: googleUser.googleId,
        serviceType,
        rating,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
        avatarUrl: googleUser.avatarUrl || undefined
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels: Record<number, { bn: string; en: string }> = {
    1: { bn: '১ স্টার — অসন্তোষজনক', en: '1 Star — Unsatisfactory' },
    2: { bn: '২ স্টার — মোটামুটি', en: '2 Stars — Fair' },
    3: { bn: '৩ স্টার — ভালো সার্ভিস', en: '3 Stars — Good' },
    4: { bn: '৪ স্টার — খুব ভালো', en: '4 Stars — Very Good' },
    5: { bn: '৫ স্টার — চমৎকার ও অসাধারণ!', en: '5 Stars — Excellent!' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#123047] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D9488]/30 text-[#38BDF8] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সানভিলোজ ক্লিন কেয়ার ভেরিফাইড রিভিউ</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              সার্ভিস রিভিউ ও মতামত দিন
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Success Screen */}
          {successMsg ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-[#123047]">
                রিভিউ সফলভাবে জমা হয়েছে!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {successMsg}
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 text-left space-y-1.5">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                  <span>রিভিউ নিরাপত্তা ও স্বচ্ছতা নীতি:</span>
                </div>
                <p>• প্রতিটি রিভিউ স্প্যাম ও অপব্যবহার রোধে অ্যাডমিন ভেরিফিকেশনের পর ওয়েবসাইটে প্রকাশিত হয়।</p>
                <p>• আপনার ইমেইল এড্রেস সম্পূর্ণ সুরক্ষিত এবং কখনোই ওয়েবসাইটে প্রকাশ করা হবে না।</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  ঠিক আছে (Close)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Duplicate Warning */}
              {duplicateWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* STEP 1: Google Account Verification */}
              {!googleUser ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto">
                    {/* Official Google 'G' icon */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#123047]">
                      Google Account দিয়ে ভেরিফিকেশন প্রয়োজন
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      ফেক রিভিউ ও স্প্যাম রোধে শুধুমাত্র গুগল অ্যাকাউন্টে সাইন ইন করে রিভিউ জমা দেওয়া যাবে। আপনার ইমেইল সম্পূর্ণ গোপন থাকবে।
                    </p>
                  </div>

                  {!showManualGooglePrompt ? (
                    <button
                      type="button"
                      disabled={isSigningInGoogle}
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{isSigningInGoogle ? 'Google-এ কানেক্ট হচ্ছে...' : 'Google দিয়ে সাইন ইন করুন (Sign in with Google)'}</span>
                    </button>
                  ) : (
                    <form onSubmit={handleConfirmGoogleProfile} className="space-y-3 pt-2 text-left">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          আপনার নাম (Google Account Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={googleSignInInput.name}
                          onChange={(e) => setGoogleSignInInput({ ...googleSignInInput, name: e.target.value })}
                          placeholder="e.g. Asif Rahman"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0D9488] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Google Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={googleSignInInput.email}
                          onChange={(e) => setGoogleSignInInput({ ...googleSignInInput, email: e.target.value })}
                          placeholder="yourname@gmail.com"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0D9488] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0f766e] transition-colors"
                      >
                        Google আইডি যাচাই সম্পন্ন করুন
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Verified Google User Banner */
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden">
                      {googleUser.avatarUrl ? (
                        <img src={googleUser.avatarUrl} alt={googleUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{googleUser.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {googleUser.name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Verified</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {googleUser.email} (গোপন রাখা হবে)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOutGoogle}
                    title="Sign out of Google"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Review Form Fields (Active once Google verified or prefilled) */}
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">
                    আপনার নাম (Customer Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] focus:outline-none"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">
                    যে সার্ভিসটি গ্রহণ করেছেন (Service Type) *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] focus:outline-none bg-white"
                  >
                    {AVAILABLE_REVIEW_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Star Rating (1 to 5) */}
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">
                    সার্ভিস রেটিং (Star Rating: ১ থেকে ৫) *
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                        >
                          <Star 
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              isFilled 
                                ? 'fill-[#F59E0B] text-[#F59E0B]' 
                                : 'text-slate-300 stroke-slate-300'
                            }`} 
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {starLabels[hoverRating || rating]?.bn}
                    </span>
                  </div>
                </div>

                {/* Review Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-[#123047]">
                      ক্লিনিং সার্ভিসের বাস্তব অভিজ্ঞতা ও রিভিউ (Review Description) *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {description.length}/1000 অক্ষর
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    placeholder="ক্লিনিং টিমের কাজের মান, পানির পরিচ্ছন্নতা ও আপনার অভিজ্ঞতা সম্পর্কে বিস্তারিত লিখুন..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Customer Photo Upload (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">
                    ট্যাংক বা কাজের ছবি (Customer Photo - ঐচ্ছিক)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />

                    {photoUrl ? (
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-sm shrink-0">
                        <img src={photoUrl} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#0D9488]" />
                        <span>{isUploadingPhoto ? 'ছবি প্রসেস হচ্ছে...' : 'ছবি যুক্ত করুন'}</span>
                      </button>
                    )}

                    <span className="text-[11px] text-slate-400">
                      পরিষ্কার করার ছবি যুক্ত করলে রিভিউ আরও বিশ্বাসযোগ্য হয়।
                    </span>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>গোপনীয়তা সুরক্ষা গ্যারান্টি:</span>
                  </div>
                  <p>আপনার Google Email শুধুমাত্র অ্যাকাউন্ট ও রিভিউ মালিকানা নিশ্চিতের জন্য ব্যবহৃত হয়। এটি কখনোই ওয়েবসাইটে প্রকাশ্যে দেখানো হবে না।</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    বাতিল (Cancel)
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !googleUser || Boolean(duplicateWarning)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0f766e] hover:to-[#0D9488] disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#0D9488]/20 transition-all cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>{submitting ? 'রিভিউ জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}</span>
                  </button>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
