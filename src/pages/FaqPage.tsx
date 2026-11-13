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
        title="Frequently Asked Questions & Water Tank Problem Solutions | SUNVILOZ CLEAN CARE"
        description="Direct answers to 10 common water tank & pipeline problems in Dhaka, Narayanganj, Gazipur & Savar: dirty water, algae, odor, rust, low pressure, pricing and booking. 01609999612."
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
