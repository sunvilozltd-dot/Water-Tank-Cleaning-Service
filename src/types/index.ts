import { ServiceBookingFormConfig, CustomFormField } from './customBookingForm';
export * from './customBookingForm';

export type Language = 'en' | 'bn';

export type TankType = 'Rooftop Tank' | 'Underground Tank' | 'Both' | 'Not Sure';

export type TankCapacity = 
  | 'Under 1,000 Liters'
  | '1,000 2,000 Liters'
  | '2,000 5,000 Liters'
  | '5,000+ Liters'
  | "I Don't Know"
  | (string & {});

export type LeadStatus = 
  | 'New' 
  | 'Incomplete'
  | 'Abandoned'
  | 'Contacted' 
  | 'Information Required'
  | 'Quotation Preparing'
  | 'Quotation Sent' 
  | 'Quote Sent'
  | 'Follow-up' 
  | 'Follow-up Required' 
  | 'Confirmed' 
  | 'Booked' 
  | 'Completed' 
  | 'Cancelled'
  | 'Lost'
  | 'Quoted'
  | 'new'
  | 'incomplete'
  | 'abandoned'
  | 'contacted'
  | 'quoted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'lost';

export type LeadSource = 'Website' | 'WhatsApp' | 'Facebook' | 'Messenger' | 'Google' | 'Direct' | 'Other' | (string & {});

export interface QuoteFormData {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  district?: string;
  area: string;
  houseNumber?: string;
  roadNumber?: string;
  thana?: string;
  postcode?: string;
  address?: string;
  landmark?: string;
  customCapacity?: string;
  customFloors?: string;
  customFlats?: string;
  capacityUnknown?: boolean;
  additionalPipelineCleaning?: boolean;
  additionalAmc?: boolean;
  serviceType?: string;
  sourceContext?: string;
  tankType: TankType | '';
  tankLocation?: string;
  tankCapacity: TankCapacity | '';
  overheadCapacity?: string;
  undergroundCapacity?: string;
  overheadCustomCapacity?: string;
  undergroundCustomCapacity?: string;
  overheadUnknown?: boolean;
  undergroundUnknown?: boolean;
  numberOfTanks: number;
  numberOfFlats?: string;
  buildingType?: 'Residential' | 'Commercial' | 'Apartment Building' | 'Other' | string;
  pipelineCleaning?: 'Yes' | 'No' | boolean;
  tankAccessible?: 'Yes' | 'No' | string;
  lastCleaningDate?: string;
  preferredDate?: string;
  preferredTime?: string;
  callbackPreference?: 'phone' | 'whatsapp' | 'any';
  message?: string;
  notes?: string;
  estimatedPrice?: string;
  propertyType?: 'Residential' | 'Commercial' | 'Apartment Building' | 'Other';
  floors?: string;
  flats?: string;
  manualBuildingDetails?: string;
  tankDimensions?: string;
  overheadMaterial?: 'PVC' | 'RCC' | 'Stainless Steel' | 'Both' | string;
  selectedServices?: string[];
  additionalServices?: string[];
  customTankCount?: number;
  estimatedCapacity?: string;
  knowCapacity?: 'yes' | 'no';
  photos?: string[];
  photoUrls?: string[];
  customAnswers?: Record<string, any>;
  customFormTitle?: string;
}

export interface LeadActivity {
  id: string;
  timestamp: string;
  action: string;
  note: string;
  author: string;
}

export type LeadPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface QuoteLead extends QuoteFormData {
  id: string;
  leadNumber?: string;
  createdAt: string;
  updatedAt?: string;
  status: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  adminNote?: string;
  adminNotes?: string;
  quotedAmount?: number;
  calculatedEstimate?: number;
  scheduledDate?: string;
  assignedStaff?: string;
  quotationAmount?: number | string;
  quotationNotes?: string;
  quotationValidity?: string;
  quotationSentDate?: string;
  customerResponse?: string;
  followUpDate?: string;
  followUpNote?: string;
  bookingDate?: string;
  bookingTime?: string;
  bookingStatus?: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  campaign?: string;
  activityHistory?: LeadActivity[];
  isAbandoned?: boolean;
  completionStep?: number;
  lastActiveStepName?: string;
  leadStage?: 'first_step_captured' | 'tank_selected' | 'capacity_filled' | 'location_filled' | 'fully_submitted';
}

export interface PortfolioItem {
  id: string;
  before: string;
  after: string;
  title: string;
  titleBn: string;
  note?: string;
  noteBn?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  shortDesc?: string;
  shortDescBn?: string;
  fullDesc?: string;
  fullDescBn?: string;
  description?: string;
  descriptionBn?: string;
  features?: string[];
  featuresBn?: string[];
  popular?: boolean;
  whatIsThis?: string;
  whatIsThisBn?: string;
  whyNeeded?: string;
  whyNeededBn?: string;
  whenNeeded?: string[];
  whenNeededBn?: string[];
  equipment?: string[];
  equipmentBn?: string[];
  iconName?: string;
  icon?: string;
  startingPrice?: any;
  startingPriceBn?: string;
  isPrimary?: boolean;
  benefits?: string[];
  benefitsBn?: string[];
  process?: string[];
  processBn?: string[];
  idealFor?: any;
  idealForBn?: string[];
  image?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoTitleBn?: string;
  portfolioImages?: PortfolioItem[];
  beforeAfterImage?: {
    before: string;
    after: string;
  };
  faqs?: {
    question: string;
    questionBn?: string;
    answer: string;
    answerBn?: string;
  }[];
  isCustomAdded?: boolean;
  bookingFormConfig?: ServiceBookingFormConfig;
  metaTitle?: string;
  metaDesc?: string;
  name?: string;
  short_description?: string;
  full_description?: string;
  category?: string;
  featured_image?: string;
  gallery_images?: string[];
  is_active?: boolean;
  display_order?: number;
  show_on_homepage?: boolean;
  show_in_navigation?: boolean;
  show_in_quote_form?: boolean;
  seo_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  supportedMaterials?: ('Plastic' | 'Steel' | 'Concrete')[];
  formConfig?: {
    requiresTankMaterial?: boolean;
    requiresTankCapacity?: boolean;
    requiresPropertyDetails?: boolean;
    requiresPipelineDetails?: boolean;
    supportedMaterials?: ('Plastic' | 'Steel' | 'Concrete')[];
    capacityOptions?: string[];
    allowCustomCapacity?: boolean;
    allowUnknownCapacity?: boolean;
  };
}

export interface FaqItem {
  id: number;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  category?: 'General' | 'Pricing' | 'Process' | 'Booking';
}

export interface ReviewItem {
  id: string;
  customerName: string;
  area: string;
  service: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

export interface ProcessStep {
  step: string;
  number: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
}

export interface AreaInfo {
  name: string;
  nameBn: string;
  zone: 'North Dhaka' | 'South Dhaka' | 'Central Dhaka' | 'Suburbs';
  active: boolean;
  typicalResponseTime: string;
}

export interface ArticleItem {
  slug: string;
  title: string;
  titleBn: string;
  metaDesc: string;
  category: string;
  readTime: string;
  publishedDate: string;
  summary: string;
  summaryBn: string;
  content: string[];
  contentBn: string[];
  keyTakeaways: string[];
  relatedServiceSlug: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  titleBn?: string;
  category?: 'Rooftop' | 'Underground' | 'Pipeline' | 'Apartment' | 'Commercial' | string;
  area?: string;
  location?: string;
  locationBn?: string;
  tankType?: string;
  capacity?: string;
  serviceDate?: string;
  completedDate?: string;
  beforeImg?: string;
  beforeImage?: string;
  duringImg?: string;
  afterImg?: string;
  afterImage?: string;
  additionalImages?: string[];
  summary?: string;
  summaryBn?: string;
  description?: string;
  descriptionBn?: string;
  relatedServiceSlug?: string;
  featured?: boolean;
  videoUrl?: string;
}

export interface WorkVideoItem {
  id: string;
  title: string;
  titleBn?: string;
  description?: string;
  descriptionBn?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  url?: string;
  thumbnailUrl?: string;
  relatedServiceSlug?: string;
  featured?: boolean;
  uploadedVideoUrl?: string;
  duration?: string;
  createdAt?: string;
}

export type VideoItem = WorkVideoItem;

export interface LocationPageData {
  slug: string;
  areaName: string;
  areaNameBn: string;
  zone?: string;
  title?: string;
  titleBn?: string;
  metaDesc?: string;
  metaDescription?: string;
  intro?: string;
  introBn?: string;
  description?: string;
  descriptionBn?: string;
  waterConditionNote?: string;
  waterConditionNoteBn?: string;
  coverageDetails?: string[];
  pricingFactors?: string[];
  faqs?: { question: string; answer: string }[];
}
