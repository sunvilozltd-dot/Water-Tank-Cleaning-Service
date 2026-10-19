import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PricingSection } from '../components/PricingSection';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { useLanguage } from '../context/LanguageContext';

interface PricingPageProps {
  onOpenQuoteModal: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenQuoteModal }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title="Water Tank Cleaning Price in Dhaka | Sunviloz Clean Care"
        description="Transparent water tank cleaning price in Dhaka. Overhead PVC tank from ৳1,200, RCC tank from ৳1,800, underground reservoir from ৳2,500. Request an exact quotation."
        canonicalUrl="https://sunvilozcleancare.com/pricing"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'মূল্য তালিকা' : 'Pricing', href: '/pricing' }]} />

      <PricingSection onOpenQuoteModal={onOpenQuoteModal} showPhotoCta={false} />

      <div className="py-2">
        <SendTankPhotoCta source="pricing_page_mid" />
      </div>

      <div id="calculator">
        <SmartQuoteWizard />
      </div>
    </main>
  );
};

export default PricingPage;
