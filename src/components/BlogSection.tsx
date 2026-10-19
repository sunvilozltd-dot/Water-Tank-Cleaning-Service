import React, { useState } from 'react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useBlogPosts } from '../utils/blogStore';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost } from '../types/blog';

interface BlogSectionProps {
  onSelectPost?: (slug: string) => void;
  onOpenPostModal?: (post: any) => void;
  onBookService?: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ 
  onSelectPost, 
  onNavigate 
}) => {
  const { lang } = useLanguage();
  const { publishedPosts } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(publishedPosts.map(p => p.category)))];

  const filteredPosts = activeCategory === 'all'
    ? publishedPosts
    : publishedPosts.filter(p => p.category === activeCategory);

  const handlePostClick = (post: BlogPost, e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = `/blog/${post.slug}`;
    if (onNavigate) {
      onNavigate(targetUrl);
    } else if (onSelectPost) {
      onSelectPost(post.slug);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200" id="blog" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#0B2545] text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'bn' ? 'পানি সুরক্ষা ও স্বাস্থ্য সচেতনতা' : 'Water Hygiene & Safety'}</span>
          </div>
          <h2 id="blog-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tips &amp; Guides
          </h2>
          <div className="w-16 h-1 bg-amber-500 mt-2.5 rounded-full" aria-hidden="true" />
        </div>

        {/* Category Filter Pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 mb-8" role="group" aria-label="Blog categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0B2545] ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={activeCategory === cat}
              >
                {cat === 'all' ? (lang === 'bn' ? 'সকল গাইড (All)' : 'All Guides') : cat}
              </button>
            ))}
          </div>
        )}

        {/* 3-Column Card Grid (Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const title = lang === 'bn' && post.titleBn ? post.titleBn : post.title;
            const excerpt = lang === 'bn' && post.excerptBn ? post.excerptBn : post.excerpt;
            const category = lang === 'bn' && post.categoryBn ? post.categoryBn : post.category;
            const readTime = lang === 'bn' && post.readTimeBn ? post.readTimeBn : post.readTime;

            return (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                onClick={(e) => handlePostClick(post, e)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer block no-underline text-inherit focus-visible:outline-2 focus-visible:outline-[#0B2545]"
              >
                <div>
                  <div className="mb-3.5">
                    <span className="inline-block px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-md tracking-wide shadow-2xs">
                      {category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0B2B5C] transition-colors leading-snug mb-3 line-clamp-3">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{readTime}</span>
                  </span>

                  <span className="font-bold text-cyan-800 group-hover:text-[#0B2B5C] flex items-center gap-1 transition-colors">
                    <span>{lang === 'bn' ? 'সম্পূর্ণ পড়ুন' : 'Read Full Guide'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
