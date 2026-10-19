export type FieldType = 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea';

export interface CustomFormField {
  id: string;
  name: string; // programmatic identifier, e.g. "sofa_seats"
  labelEn: string;
  labelBn: string;
  type: FieldType;
  placeholderEn?: string;
  placeholderBn?: string;
  required: boolean;
  options?: string[]; // English options for select/radio
  optionsBn?: string[]; // Bengali options for select/radio
  helpTextEn?: string;
  helpTextBn?: string;
  defaultValue?: string;
}

export interface ServiceBookingFormConfig {
  enabled: boolean;
  titleEn?: string;
  titleBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  submitButtonTextEn?: string;
  submitButtonTextBn?: string;
  estimatedPriceNoteEn?: string;
  estimatedPriceNoteBn?: string;
  fields: CustomFormField[];
}
