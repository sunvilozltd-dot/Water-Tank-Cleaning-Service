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
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title={lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন | সানভিলোজ ক্লিন কেয়ার ঢাকা' : 'Our Work Videos - Sunviloz Clean Care Dhaka'}
        description="Watch real cleaning project videos of rooftop and underground water tanks cleaned across Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/portfolio"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন' : 'Work Videos', href: '/portfolio' }]} />
      <OurWorkVideosSection />
    </main>
  );
};

export default PortfolioPage;
