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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="blog-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white text-[#172B3A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto border border-[#E2E8F0]">
        
        {/* Sticky Fixed Header with Reading Progress Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0 relative">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 text-[11px] font-bold rounded-md">
              {category}
            </span>
            <span className="text-xs text-[#E2E8F0] hidden sm:inline">•</span>
            <span className="text-xs text-[#64748B] font-medium hidden sm:inline flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#64748B]" aria-hidden="true" />
              <span>{readTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Progress Percentage Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5FAFC] border border-[#E2E8F0] text-[11px] font-mono text-[#0D9488] font-bold shadow-xs">
              <BookOpen className="w-3 h-3 text-[#0D9488]" />
              <span>{Math.round(readingProgress)}%</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5FAFC] hover:bg-[#E8F5F3] text-[#64748B] hover:text-[#123047] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
              aria-label="Close article modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll-based reading progress bar track */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-[#E2E8F0] overflow-hidden" 
            role="progressbar" 
            aria-valuenow={Math.round(readingProgress)} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            <div 
              className="h-full bg-[#0D9488] transition-all duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
        >
          
          {/* Article Featured Image */}
          {post.imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-md bg-[#F5FAFC]">
              <img 
                src={post.imageUrl} 
                alt={title}
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </div>
          )}

          {/* Article Title */}
          <div>
            <h1 id="blog-modal-title" className="text-xl sm:text-2xl md:text-3xl font-black text-[#123047] leading-tight">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mt-2.5">
              <span>{post.publishedAt}</span>
              <span>•</span>
              <span>{lang === 'bn' ? 'সানভিলোজ ক্লিন কেয়ার টেকনিক্যাল টিম' : 'Sunviloz Clean Care Technical Team'}</span>
            </div>
          </div>

          {/* Article Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-[#172B3A] leading-relaxed border-t border-[#E2E8F0] pt-6 font-normal">
            {content.split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (trimmed === '---') {
                return <hr key={index} className="border-t border-[#E2E8F0] my-4" />;
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl sm:text-2xl font-extrabold text-[#123047] pt-4 pb-1">
                    {trimmed.replace(/^##\s*/, '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold text-[#123047] pt-3">
                    {trimmed.replace(/^###\s*/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                  <ul key={index} className="list-disc list-inside space-y-1.5 pl-2 text-[#172B3A]">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx} className="leading-relaxed">
                        {item.replace(/^[-*]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                  <ol key={index} className="list-decimal list-inside space-y-1.5 pl-2 text-[#172B3A]">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx} className="leading-relaxed">
                        {item.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="leading-relaxed text-[#172B3A]">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Social Share Strip */}
          <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#64748B]">
              {lang === 'bn' ? 'আর্টিকেলটি শেয়ার করুন:' : 'Share this article:'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${title}\n\nRead this cleaning guide: https://sunvilozcleancare.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5FAFC] hover:bg-[#E8F5F3] text-[#172B3A] border border-[#E2E8F0] text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Service Booking Card inside Article */}
          <div className="bg-[#F5FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-[#172B3A] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase text-[#0D9488] tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
                <span>{lang === 'bn' ? 'প্রফেশনাল সার্ভিস প্রয়োজন?' : 'Need Professional Assistance?'}</span>
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'আজই বুক করুন নিরাপদ ওয়াটার ট্যাংক ও ডিপ ক্লিনিং' : 'Book Safe Water Tank & Deep Cleaning Today'}
              </h4>
              <p className="text-xs text-[#64748B]">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপে তাৎক্ষণিক কোটেশন গ্রহণ করুন অথবা আমাদের কল করুন।' : 'Get an instant quote on WhatsApp or call our hotline.'}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTriggerBooking}
                className="min-h-[44px] flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-md shadow-[#0D9488]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href={`tel:${business.phone}`}
                className="min-h-[44px] flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#123047] hover:bg-[#0d2233] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-[#123047]"
              >
                <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
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
