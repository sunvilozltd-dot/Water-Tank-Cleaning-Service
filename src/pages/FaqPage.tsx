import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FaqSection } from '../components/FaqSection';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { PROBLEM_QA_ITEMS } from '../data/problemQaData';

export const FaqPage: React.FC = () => {
  const { lang } = useLanguage();
  const { faqs } = useSiteConfig();

  const structuredFaqs = [
    ...PROBLEM_QA_ITEMS.map(item => ({
      question: lang === 'bn' ? item.questionBn : item.questionEn,
      answer: lang === 'bn' ? item.directAnswerBn : (item.directAnswerEn || item.directAnswerBn)
    })),
    ...faqs.map(f => ({
      question: lang === 'bn' ? f.questionBn : f.question,
      answer: lang === 'bn' ? f.answerBn : f.answer
    }))
  ];

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        canonicalPath="/faq"
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
