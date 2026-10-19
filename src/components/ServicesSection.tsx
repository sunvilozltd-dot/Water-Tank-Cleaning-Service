import React from 'react';
import { PopularServicesSection } from './PopularServicesSection';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onSelectService?: (service: ServiceItem) => void;
  onGetQuoteForService?: (service: ServiceItem) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenQuoteModal = () => {},
  onNavigate
}) => {
  return (
    <div id="services">
      <PopularServicesSection 
        onOpenQuoteModal={onOpenQuoteModal} 
        onNavigate={onNavigate} 
      />
    </div>
  );
};

export default ServicesSection;
