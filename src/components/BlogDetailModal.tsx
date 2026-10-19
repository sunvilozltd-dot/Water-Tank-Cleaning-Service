import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Clock, 
  Share2, 
  Check, 
  MessageCircle, 
  Phone, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { BlogPost } from '../types/blog';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

interface BlogDetailModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onBookService?: (serviceName?: string) => void;
  onOpenQuoteModal?: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  post,
  onClose,
  onBookService,
  onOpenQuoteModal
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (post) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      // Reset reading progress on new post open
      setReadingProgress(0);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setReadingProgress(100);
    } else {
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setReadingProgress(pct);
    }
  };

  if (!post) return null;

  const title = lang === 'bn' && post.titleBn ? post.titleBn : post.title;
  const content = lang === 'bn' && post.contentBn ? post.contentBn : post.content;
  const category = lang === 'bn' && post.categoryBn ? post.categoryBn : post.category;
  const readTime = lang === 'bn' && post.readTimeBn ? post.readTimeBn : post.readTime;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `${title}\n\nRead this cleaning guide: ${window.location.origin}/blog/${post.slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTriggerBooking = () => {
    onClose();
    if (onOpenQuoteModal) {
      onOpenQuoteModal();
    } else if (onBookService) {
      onBookService('Water Tank Cleaning Service');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="blog-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-[#171C24] text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto border border-[#303743]">
        
        {/* Sticky Fixed Header with Reading Progress Bar */}
        <div className="sticky top-0 z-40 bg-[#171C24]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#303743] flex items-center justify-between gap-3 shrink-0 relative">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-[#2585FF]/20 text-[#2585FF] border border-[#2585FF]/30 text-[11px] font-bold rounded-md">
              {category}
            </span>
            <span className="text-xs text-[#303743] hidden sm:inline">•</span>
            <span className="text-xs text-[#B8C0CC] font-medium hidden sm:inline flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B8C0CC]" aria-hidden="true" />
              <span>{readTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Progress Percentage Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-cyan-300 font-bold shadow-xs">
              <BookOpen className="w-3 h-3 text-cyan-400" />
              <span>{Math.round(readingProgress)}%</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#202630] hover:bg-[#2a3240] text-[#B8C0CC] hover:text-white flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2585FF]"
              aria-label="Close article modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll-based reading progress bar track */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-[#202630] overflow-hidden" 
            role="progressbar" 
            aria-valuenow={Math.round(readingProgress)} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label="Reading progress"
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-100 ease-out shadow-sm"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        {/* Modal Scrollable Content Container */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6 scroll-smooth"
        >
          
          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-[#080A0D] border border-[#303743]">
              <img
                src={post.imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div>
            <h2 id="blog-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {title}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#B8C0CC]">
              <span>{post.publishedAt}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
          </div>

          <div className="text-sm sm:text-base text-[#B8C0CC] space-y-4 leading-relaxed font-normal">
            {content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Social Share & Copy Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#303743]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#B8C0CC]">
                {lang === 'bn' ? 'শেয়ার করুন:' : 'Share this Guide:'}
              </span>
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#28C76F] hover:bg-[#22aa5e] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202630] hover:bg-[#2a3240] text-white border border-[#303743] text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#28C76F]" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Service Booking Card inside Article */}
          <div className="bg-[#11151B] border border-[#303743] rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase text-[#2585FF] tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#2585FF]" aria-hidden="true" />
                <span>{lang === 'bn' ? 'প্রফেশনাল সার্ভিস প্রয়োজন?' : 'Need Professional Assistance?'}</span>
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {lang === 'bn' ? 'আজই বুক করুন নিরাপদ ওয়াটার ট্যাংক ও ডিপ ক্লিনিং' : 'Book Safe Water Tank & Deep Cleaning Today'}
              </h4>
              <p className="text-xs text-[#B8C0CC]">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপে তাৎক্ষণিক কোটেশন গ্রহণ করুন অথবা আমাদের কল করুন।' : 'Get an instant quote on WhatsApp or call our hotline.'}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTriggerBooking}
                className="min-h-[44px] flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href={`tel:${business.phone}`}
                className="min-h-[44px] flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#202630] hover:bg-[#2a3240] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-[#303743]"
              >
                <Phone className="w-3.5 h-3.5 text-[#2585FF]" aria-hidden="true" />
                <span>{business.displayPhone}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogDetailModal;
