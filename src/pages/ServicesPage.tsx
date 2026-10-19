import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ServicesSection } from '../components/ServicesSection';
import { SolutionProcessSection } from '../components/SolutionProcessSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { useLanguage } from '../context/LanguageContext';

interface ServicesPageProps {
  onOpenQuoteModal: () => void;
  onNavigate?: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenQuoteModal, onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title={lang === 'bn' ? 'আমাদের সেবাসমূহ | সানভিলোজ ক্লিন কেয়ার ঢাকা' : 'Our Services - Water Tank & Pipeline Cleaning in Dhaka'}
        description="Comprehensive water tank cleaning services including underground reservoir deep wash, rooftop overhead tank sanitization, and pipeline descaling in Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/services"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' }]} />

      <ServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />
      <SolutionProcessSection />
      <FinalCtaSection onOpenQuoteModal={onOpenQuoteModal} />
    </main>
  );
};

export default ServicesPage;
