import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { OurWorkVideosSection } from '../components/OurWorkVideosSection';
import { useLanguage } from '../context/LanguageContext';

interface PortfolioPageProps {
  onNavigate?: (path: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        canonicalPath="/portfolio"
        canonicalUrl="https://sunvilozcleancare.com/portfolio"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন' : 'Work Videos', path: '/portfolio' }
        ]}
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন' : 'Work Videos', href: '/portfolio' }]} />
      <OurWorkVideosSection />
    </main>
  );
};

export default PortfolioPage;
