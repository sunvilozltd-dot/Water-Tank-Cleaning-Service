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
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <SeoHead
        title="Water Tank Cleaning Service Areas in Dhaka | SUNVILOZ CLEAN CARE"
        description="Water tank and pipeline cleaning coverage across all Dhaka locations: Gulshan, Banani, Uttara, Dhanmondi, Bashundhara, Mirpur, Mohammadpur, Gazipur, Savar, Narayanganj. 01609999612."
        canonicalUrl="https://sunvilozcleancare.com/service-areas"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', path: '/service-areas' }
        ]}
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
