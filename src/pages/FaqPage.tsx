import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FaqSection } from '../components/FaqSection';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const FaqPage: React.FC = () => {
  const { lang } = useLanguage();
  const { faqs } = useSiteConfig();

  const structuredFaqs = faqs.map(f => ({
    question: lang === 'bn' ? f.questionBn : f.question,
    answer: lang === 'bn' ? f.answerBn : f.answer
  }));

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        title="Frequently Asked Questions (FAQ) | SUNVILOZ CLEAN CARE"
        description="Comprehensive answers to common questions about water tank cleaning costs, process, time needed, chemicals used, and pipeline flushing in Dhaka. 01609999612."
        canonicalUrl="https://sunvilozcleancare.com/faq"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'FAQ', path: '/faq' }
        ]}
        faqSchema={structuredFaqs}
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'FAQ', href: '/faq' }]} />
      <FaqSection />
    </main>
  );
};

export default FaqPage;
