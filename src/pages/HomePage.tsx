import React, { useState, useMemo } from 'react';
import { SeoHead } from '../components/SeoHead';
import { HomepageDynamicRenderer } from '../components/HomepageDynamicRenderer';
import { BlogPost } from '../types/blog';
import { useServicesFaqs } from '../utils/servicesFaqStore';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenBlogModal: (post: BlogPost) => void;
  onNavigate?: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenQuoteModal,
  onOpenBlogModal,
  onNavigate
}) => {
  const { lang } = useLanguage();
  const { faqs } = useServicesFaqs();
  const [visibleHomeFaqs, setVisibleHomeFaqs] = useState<{ question: string; answer: string }[] | null>(null);

  const defaultHomeFaqs = useMemo(
    () =>
      [...faqs]
        .filter(
          f =>
            (f.category === 'water-tank-cleaning' || f.category === 'pipeline-cleaning') &&
            f.isActive !== false
        )
        .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
        .map(f => ({
          question: lang === 'bn' ? f.questionBn || f.questionEn : f.questionEn || f.questionBn,
          answer: lang === 'bn' ? f.answerBn || f.answerEn : f.answerEn || f.answerBn
        }))
        .filter(item => Boolean(item.question && item.answer)),
    [faqs, lang]
  );

  const activeHomeFaqs = visibleHomeFaqs ?? defaultHomeFaqs;

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Semantic H1 for search engines and accessibility without altering hero visual design */}
      <h1 className="sr-only">
        Water Tank Cleaning Service in Dhaka, Narayanganj, Gazipur &amp; Savar — SUNVILOZ CLEAN CARE
      </h1>

      <SeoHead
        canonicalPath="/"
        canonicalUrl="https://sunvilozcleancare.com/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
        faqSchema={activeHomeFaqs}
      />
      <HomepageDynamicRenderer
        onOpenQuoteModal={onOpenQuoteModal}
        onOpenBlogModal={onOpenBlogModal}
        onNavigate={onNavigate}
        onVisibleFaqsChange={setVisibleHomeFaqs}
      />
    </main>
  );
};
