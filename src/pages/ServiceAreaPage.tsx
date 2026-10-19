import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ServiceAreaSection } from '../components/ServiceAreaSection';
import { useLanguage } from '../context/LanguageContext';

interface ServiceAreaPageProps {
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (area?: string) => void;
}

export const ServiceAreaPage: React.FC<ServiceAreaPageProps> = ({ 
  onNavigate,
  onOpenQuoteModal 
}) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        title="Service Areas & Coverage Across Dhaka | Sunviloz Clean Care"
        description="Comprehensive water tank and pipeline cleaning coverage across all Dhaka locations: Gulshan, Banani, Dhanmondi, Uttara, Bashundhara, Mirpur, and Old Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/service-areas"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', href: '/service-areas' }]} />
      <ServiceAreaSection 
        onNavigate={onNavigate} 
        onAreaSelected={(area) => {
          if (onOpenQuoteModal) onOpenQuoteModal(area);
        }} 
      />
    </main>
  );
};

export default ServiceAreaPage;
