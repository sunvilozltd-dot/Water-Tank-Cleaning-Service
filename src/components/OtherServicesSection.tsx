import React from 'react';
import { ServiceItem } from '../types';

interface OtherServicesSectionProps {
  onOpenQuoteModal?: (serviceName?: string) => void;
  onSelectService?: (service: ServiceItem) => void;
  onNavigate?: (path: string) => void;
}

export const OtherServicesSection: React.FC<OtherServicesSectionProps> = () => {
  return null;
};

export default OtherServicesSection;
