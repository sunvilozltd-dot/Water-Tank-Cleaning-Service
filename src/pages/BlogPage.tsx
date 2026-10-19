import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BlogSection } from '../components/BlogSection';
import { BlogPost } from '../types/blog';
import { useLanguage } from '../context/LanguageContext';

interface BlogPageProps {
  onOpenPostModal?: (post: BlogPost) => void;
  onNavigate?: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onOpenPostModal, onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        title="Tips & Guides - Water Tank Cleaning & Hygiene | Sunviloz Dhaka"
        description="Read articles and health guides about water tank sanitation, contamination risks, maintenance frequency, and cleaning guidelines for Dhaka properties."
        canonicalUrl="https://sunvilozcleancare.com/blog"
      />
      <Breadcrumbs items={[{ label: 'Tips & Guides', href: '/blog' }]} />
      <BlogSection onNavigate={onNavigate} onOpenPostModal={onOpenPostModal} />
    </main>
  );
};

export default BlogPage;
