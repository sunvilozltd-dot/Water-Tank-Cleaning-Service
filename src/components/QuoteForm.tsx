import React from 'react';
import { SmartQuoteWizard, SmartQuoteWizardProps } from './SmartQuoteWizard';

export interface QuoteFormProps extends SmartQuoteWizardProps {}

/**
 * Standardized QuoteForm component for Sunviloz Clean Care.
 * Powered by the 7-Step Smart Customer Journey with WhatsApp and Supabase integrations.
 */
export const QuoteForm: React.FC<QuoteFormProps> = (props) => {
  return <SmartQuoteWizard {...props} />;
};

export default QuoteForm;
