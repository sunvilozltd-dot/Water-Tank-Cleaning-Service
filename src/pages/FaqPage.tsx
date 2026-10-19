import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FaqSection } from '../components/FaqSection';
import { useLanguage } from '../context/LanguageContext';

export const FaqPage: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        title="Frequently Asked Questions - Water Tank Cleaning Dhaka"
        description="Find answers to common questions about water tank cleaning process, pricing, time needed, chemicals used, and safety in Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/faq"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'FAQ', href: '/faq' }]} />
      <FaqSection />
    </main>
  );
};
