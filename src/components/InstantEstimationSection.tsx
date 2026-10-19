import React from 'react';
import { QuoteRequestSection } from './QuoteRequestSection';

interface InstantEstimationSectionProps {
  onOpenQuoteModal?: (serviceType?: string) => void;
}

/**
 * Replaces the obsolete instant cost calculator with the conversion-optimized
 * "Request a Quote / Get Your Quotation" section.
 * Does NOT display automated prices or instant calculations.
 */
export const InstantEstimationSection: React.FC<InstantEstimationSectionProps> = ({ onOpenQuoteModal }) => {
  return (
    <QuoteRequestSection 
      sourceContext="Homepage Quote Section"
      onExploreServices={() => {
        const el = document.getElementById('services');
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  );
};

export default InstantEstimationSection;
