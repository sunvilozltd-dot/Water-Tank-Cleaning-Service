import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Check, 
  MessageCircle, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Droplets,
  BookOpen,
  Layers
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useBlogPosts } from '../utils/blogStore';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

interface BlogPostDetailPageProps {
  slug: string;
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
}

export const BlogPostDetailPage: React.FC<BlogPostDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenQuoteModal
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { publishedPosts } = useBlogPosts();
  const [copied, setCopied] = useState(false);
  const [pageProgress, setPageProgress] = useState(0);

  // Scroll to top on page mount or slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPageProgress(0);
  }, [slug]);

  // Window scroll listener for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setPageProgress(100);
      } else {
        const pct = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
        setPageProgress(pct);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Find article by slug or id
  const post = publishedPosts.find(p => p.slug === slug || p.id === slug);

  // Suggested other articles
  const otherPosts = publishedPosts
    .filter(p => p.slug !== slug && p.id !== slug)
    .slice(0, 3);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://sunvilozcleancare.com/blog/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    if (!post) return;
    const title = lang === 'bn' && post.titleBn ? post.titleBn : post.title;
    const url = typeof window !== 'undefined' ? window.location.href : `https://sunvilozcleancare.com/blog/${slug}`;
    const text = `${title}\n\nপড়ুন এই গুরুত্বপূর্ণ পরামর্শ: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 text-center">
        <SeoHead
          title="Article Not Found - Sunviloz Clean Care"
          description="The requested water tank cleaning guide or hygiene article was not found."
        />
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'bn' ? 'আর্টিকেলটি পাওয়া যায়নি' : 'Article Not Found'}
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {lang === 'bn' 
            ? 'আপনি যে আর্টিকেলটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিংকটি পরিবর্তিত হয়েছে।' 
            : 'The requested guide could not be located. It might have been updated or moved.'}
        </p>
        <div>
          <button
            type="button"
            onClick={() => handleNavigate('/blog')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সকল Tips & Guides দেখুন' : 'Browse All Tips & Guides'}</span>
          </button>
        </div>
      </main>
    );
  }

  const title = lang === 'bn' && post.titleBn ? post.titleBn : post.title;
  const content = lang === 'bn' && post.contentBn ? post.contentBn : post.content;
  const category = lang === 'bn' && post.categoryBn ? post.categoryBn : post.category;
  const readTime = lang === 'bn' && post.readTimeBn ? post.readTimeBn : post.readTime;
  const excerpt = lang === 'bn' && post.excerptBn ? post.excerptBn : post.excerpt;

  // Render paragraphs with markdown-like highlights
  const renderFormattedContent = (rawText: string) => {
    const blocks = rawText.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 2 or 3
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        const cleanHeading = trimmed.replace(/^#{2,3}\s+/, '');
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full" aria-hidden="true" />
            <span>{cleanHeading}</span>
          </h3>
        );
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(Boolean);
        return (
          <ul key={idx} className="space-y-2 my-4 pl-4 border-l-2 border-blue-500/30">
            {items.map((item, itemIdx) => {
              const cleanItem = item.replace(/^[\*\-]\s+/, '');
              return (
                <li key={itemIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-blue-400 font-bold shrink-0">•</span>
                  <span>{cleanItem}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').filter(Boolean);
        return (
          <ol key={idx} className="space-y-2.5 my-4">
            {items.map((item, itemIdx) => {
              const cleanItem = item.replace(/^\d+\.\s+/, '');
              return (
                <li key={itemIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
                    {itemIdx + 1}
                  </span>
                  <span>{cleanItem}</span>
                </li>
              );
            })}
          </ol>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="min-h-screen bg-[#080A0D] text-white py-6 sm:py-10 px-4 sm:px-6 relative">
      {/* Top Fixed Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-900/40 backdrop-blur-xs overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pageProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Article reading progress"
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-100 ease-out shadow-xs"
          style={{ width: `${pageProgress}%` }}
        />
      </div>

      <SeoHead
        title={`${title} | Sunviloz Clean Care`}
        description={post.seo?.metaDescription || excerpt}
        canonicalUrl={`https://sunvilozcleancare.com/blog/${post.slug}`}
        ogType="article"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Tips & Guides', href: '/blog' },
              { label: title, href: `/blog/${post.slug}` }
            ]}
          />

          <button
            type="button"
            onClick={() => handleNavigate('/blog')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সকল Tips & Guides' : 'All Tips & Guides'}</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-extrabold rounded-lg tracking-wide shadow-sm">
              {category}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{readTime}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.publishedAt}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
            {title}
          </h1>

          {/* Author info and social actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{post.author}</span>
                <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'পানি ও হাইজিন স্পেশালিস্ট' : 'Water Hygiene Specialist'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-[#28C76F] hover:bg-[#22aa5e] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        {post.imageUrl && (
          <div className="rounded-3xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 shadow-2xl relative">
            <img
              src={post.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Lead Excerpt Highlight Box */}
        {excerpt && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/40 border border-blue-900/50 text-blue-200 text-sm sm:text-base font-medium leading-relaxed">
            {excerpt}
          </div>
        )}

        {/* Article Body */}
        <section className="space-y-5 bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-md">
          {renderFormattedContent(content)}
        </section>

        {/* Service Booking & Inquiry Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-800/60 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'bn' ? 'সানভিলোজ স্পেশালিস্ট কেয়ার' : 'Sunviloz Specialist Care'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'আপনার ভবনের পানির ট্যাংকও কি পরিষ্কার করা প্রয়োজন?' : 'Need Safe Water Tank Cleaning in Dhaka?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {lang === 'bn' 
                ? '১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশ ও ফুড-গ্রেড স্যানিটাইজেশন পদ্ধতিতে সম্পূর্ণ জীবাণুমুক্ত সেবা নিন।'
                : 'Experience chemical-free 150-bar rotary pressure washing and food-grade non-toxic sterilization.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onOpenQuoteModal ? onOpenQuoteModal('Water Tank Cleaning Service') : handleNavigate('/get-quote')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{lang === 'bn' ? 'তাৎক্ষণিক কোটেশন নিন' : 'Get Free Quote'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`tel:${business.phone}`}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>{business.displayPhone}</span>
            </a>
          </div>
        </div>

        {/* Related Tips & Guides */}
        {otherPosts.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{lang === 'bn' ? 'আরও অন্যান্য Tips & Guides' : 'More Tips & Guides'}</span>
              </h3>
              <button
                type="button"
                onClick={() => handleNavigate('/blog')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherPosts.map((other) => {
                const otherTitle = lang === 'bn' && other.titleBn ? other.titleBn : other.title;
                const otherCategory = lang === 'bn' && other.categoryBn ? other.categoryBn : other.category;
                return (
                  <div
                    key={other.id}
                    onClick={() => handleNavigate(`/blog/${other.slug}`)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between p-4 cursor-pointer group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        {otherCategory}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {otherTitle}
                      </h4>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{other.readTime}</span>
                      <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{lang === 'bn' ? 'পড়ুন' : 'Read'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};

export default BlogPostDetailPage;
