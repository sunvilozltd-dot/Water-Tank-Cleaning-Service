import React, { useState, useRef } from 'react';
import { 
  Send, 
  Phone, 
  MessageCircle, 
  Upload, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  FileText,
  AlertCircle,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';
import { QuoteFormData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { isValidBangladeshiPhone } from '../utils/validation';
import { createLead } from '../services/leadService';
import { generateWhatsAppQuoteUrl, openWhatsAppDirect, WHATSAPP_INT_NUMBER } from '../utils/whatsapp';
import { trackEvent, trackLeadSaved, trackFormStarted, trackWhatsAppClick } from '../utils/tracking';

interface QuoteRequestSectionProps {
  initialService?: string;
  sourceContext?: string;
  onExploreServices?: () => void;
}

const SERVICE_OPTIONS = [
  { value: 'Water Overhead Tank Cleaning', labelBn: 'ছাদের ওভারহেড ট্যাংক ক্লিনিং (Overhead Tank)', labelEn: 'Water Overhead Tank Cleaning' },
  { value: 'Water Reserve/Underground Tank Cleaning', labelBn: 'মাটির নিচের রিজার্ভার ক্লিনিং (Underground Tank)', labelEn: 'Water Reserve/Underground Tank Cleaning' },
  { value: 'Both Water Tank Cleaning', labelBn: 'উভয় ট্যাংক একসাথে (Both Tanks)', labelEn: 'Both Water Tank Cleaning' },
  { value: 'Both Water Tank Cleaning With Pipeline', labelBn: 'ট্যাংক ও পাইপলাইন সম্পূর্ণ ওয়াশ (Tanks + Pipeline)', labelEn: 'Both Water Tank Cleaning With Pipeline' },
  { value: 'Water Pipeline Cleaning', labelBn: 'পানির পাইপলাইন ফ্লাশিং (Pipeline Only)', labelEn: 'Water Pipeline Cleaning' },
  { value: 'Water Pipeline Cleaning + Both Water Tank Cleaning', labelBn: 'সম্পূর্ণ ওয়াটার হাইজিন সল্যুশন', labelEn: 'Water Pipeline Cleaning + Both Water Tank Cleaning' }
];

const BUILDING_TYPES = [
  'আবাসিক বাড়ি / ডুপ্লেক্স (Residential)',
  'বহুতল অ্যাপার্টমেন্ট ভবন (Apartment Building)',
  'বাণিজ্যিক ভবন / অফিস (Commercial)',
  'হাসপাতাল / ক্লিনিক (Hospital/Clinic)',
  'রেস্তোরাঁ / হোটেল (Restaurant/Hotel)',
  'অন্যান্য (Other)'
];

const DHAKA_AREAS = [
  'Uttara (উত্তরা)',
  'Gulshan 1 & 2 (গুলশান ১ ও ২)',
  'Banani (বনানী)',
  'Dhanmondi (ধানমন্ডি)',
  'Bashundhara R/A (বসুন্ধরা)',
  'Mirpur (মিরপুর)',
  'Mohammadpur (মোহাম্মদপুর)',
  'Baridhara & DOHS (বারিধারা)',
  'Badda & Merul Badda (বাড্ডা)',
  'Rampura & Banasree (বনশ্রী)',
  'Khilgaon & Malibagh (খিলগাঁও)',
  'Moghbazar & Eskaton (মগবাজার)',
  'Tejgaon (তেজগাঁও)',
  'Motijheel & Paltan (মতিঝিল)',
  'Old Dhaka (পুরান ঢাকা)',
  'Lalmatia (লালমাটিয়া)',
  'Niketan (নিকেতন)',
  'Nikunja (নিকুঞ্জ)',
  'Kafrul & Cantonment (ক্যান্টনমেন্ট)',
  'Jatrabari & Sayedabad (যাত্রাবাড়ী)',
  'Other Dhaka Area (ঢাকার অন্যান্য এলাকা)'
];

const LAST_CLEANING_OPTIONS = [
  'গত ৩-৪ মাসের মধ্যে',
  'গত ৬ মাসের মধ্যে',
  '১ বছর বা তার বেশি আগে',
  'কখনো পরিষ্কার করা হয়নি',
  'সঠিক মনে নেই'
];

export const QuoteRequestSection: React.FC<QuoteRequestSectionProps> = ({
  initialService,
  sourceContext = 'Homepage Quote Request Section',
  onExploreServices
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  // Form State
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    district: 'ঢাকা জেলা (Dhaka)',
    area: '',
    address: '',
    landmark: '',
    serviceType: initialService || 'Water Overhead Tank Cleaning',
    tankType: 'Rooftop Tank',
    overheadMaterial: 'PVC',
    tankCapacity: '১,০০০ - ২,০০০ লিটার',
    numberOfTanks: 1,
    buildingType: 'আবাসিক বাড়ি / ডুপ্লেক্স (Residential)',
    pipelineCleaning: 'No',
    tankAccessible: 'Yes',
    lastCleaningDate: 'গত ৬ মাসের মধ্যে',
    notes: ''
  });

  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [inquiryId, setInquiryId] = useState<string>('');
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      trackFormStarted(sourceContext);
    }
  };

  const handlePhoneChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      phone: val,
      whatsapp: sameAsPhone ? val : prev.whatsapp
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - photoPreviews.length;
    if (remainingSlots <= 0) {
      alert(lang === 'bn' ? 'সর্বোচ্চ ৪টি ছবি আপলোড করা যাবে।' : 'You can upload a maximum of 4 photos.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' : 'File size must be under 5MB.');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে JPG, PNG অথবা WebP ফরম্যাটের ছবি দিন।' : 'Please select JPG, PNG, or WebP.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotoPreviews(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.';
    }
    if (!formData.phone.trim()) {
      errs.phone = lang === 'bn' ? 'অনুগ্রহ করে আপনার মোবাইল ফোন নম্বর দিন।' : 'Please enter your mobile phone number.';
    } else if (!isValidBangladeshiPhone(formData.phone)) {
      errs.phone = lang === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712-345678)।' : 'Please provide a valid 11-digit Bangladeshi mobile number.';
    }
    if (!formData.area.trim()) {
      errs.area = lang === 'bn' ? 'অনুগ্রহ করে আপনার এলাকা নির্বাচন করুন বা লিখুন।' : 'Please select or enter your area.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleStart();

    if (!validate()) {
      const firstErr = document.getElementById('quote-form-top');
      firstErr?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalForm: QuoteFormData = {
        ...formData,
        whatsapp: sameAsPhone ? formData.phone : (formData.whatsapp || formData.phone),
        photos: photoPreviews,
        photoUrls: photoPreviews.length > 0 ? photoPreviews : undefined
      };

      const lead = await createLead(finalForm, sourceContext);
      const leadId = lead.leadNumber || `SVC-${Date.now().toString().slice(-6)}`;
      setInquiryId(leadId);

      trackLeadSaved(leadId, {
        source: sourceContext,
        service: finalForm.serviceType,
        area: finalForm.area,
        has_photos: photoPreviews.length > 0
      });

      const waUrl = generateWhatsAppQuoteUrl(finalForm, {
        serviceType: finalForm.serviceType,
        source: sourceContext,
        leadNumber: leadId
      });
      setWhatsAppUrl(waUrl);

      setIsSubmitted(true);
    } catch (err) {
      console.error('Inquiry submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="quote" 
      className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border-b border-slate-200"
      aria-labelledby="quote-section-heading"
    >
      <div id="quote-form-top" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#0B2545] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" aria-hidden="true" />
            <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট' : 'Request a Quotation'}</span>
          </div>
          
          <h2 id="quote-section-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] tracking-tight">
            {lang === 'bn' 
              ? 'ট্যাংকের বিবরণ দিয়ে ফ্রি কোটেশন গ্রহণ করুন' 
              : 'Provide Details to Receive Your Tank Cleaning Quotation'}
          </h2>
          
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {lang === 'bn'
              ? 'আপনার ছাদ বা আন্ডারগ্রাউন্ড ট্যাংকের সাইজ ও এলাকা জানালে আমাদের টিম সাথে সাথেই সাশ্রয়ী কোটেশন প্রদান করবে।'
              : 'Share your tank type, capacity, and requirements. Our specialized team will review your details and provide a tailored quotation and service plan.'}
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl relative overflow-hidden">
          
          {/* SUCCESS / CONFIRMATION STATE */}
          {isSubmitted ? (
            <div className="text-center py-6 sm:py-10 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 font-mono font-bold text-xs">
                  রেফারেন্স আইডি: {inquiryId}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0B2545]">
                  {lang === 'bn' ? 'ধন্যবাদ! আপনার রিকোয়েস্ট গৃহীত হয়েছে' : 'Thank You!'}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                  {lang === 'bn' 
                    ? 'আপনার সার্ভিস রিকোয়েস্ট সংরক্ষিত হয়েছে। আমাদের প্রতিনিধি দ্রুততম সময়ে ফোনে বা হোয়াটসঅ্যাপে যোগাযোগ করে কোটেশন ও শিডিউল নিশ্চিত করবে।'
                    : 'We have received your inquiry. Our team will review your requirements and reach out promptly with your customized quotation.'}
                </p>
              </div>

              {/* WHATSAPP CTA BOX */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 max-w-xl mx-auto space-y-3">
                <h4 className="text-base sm:text-lg font-black text-emerald-950 flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <span>{lang === 'bn' ? 'WhatsApp-এ তথ্য পাঠান' : 'Send Details on WhatsApp'}</span>
                </h4>
                <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                  {lang === 'bn' 
                    ? 'আপনার ট্যাংকের সকল বিবরণ স্বয়ংক্রিয়ভাবে মেসেজ বক্সে প্রস্তুত করা হয়েছে। সরাসরি হোয়াটসঅ্যাপে পাঠিয়ে দিন দ্রুত উত্তরের জন্য।'
                    : 'Your inquiry has been logged. For instant follow-up, connect directly with our coordination team on WhatsApp.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      trackWhatsAppClick({ source: 'quote_success_screen', leadNumber: inquiryId });
                      openWhatsAppDirect(whatsAppUrl, 'quote_whatsapp_cta', { leadNumber: inquiryId });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
                    <span>{lang === 'bn' ? 'WhatsApp-এ চ্যাট করুন' : 'Chat on WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`tel:${business.phone}`}
                  onClick={() => trackEvent('phone_click', { source: 'quote_success_call' })}
                  className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-cyan-700" aria-hidden="true" />
                  <span>{lang === 'bn' ? 'সরাসরি কল করুন (01609-999612)' : 'Call Hotline'}</span>
                </a>
                {onExploreServices && (
                  <button
                    type="button"
                    onClick={onExploreServices}
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-slate-600" aria-hidden="true" />
                    <span>{lang === 'bn' ? 'অন্যান্য সার্ভিস দেখুন' : 'Explore More Services'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              
              {/* STEP 1: SERVICE SELECTION */}
              <div className="space-y-3">
                <label htmlFor="quote-service-select" className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] flex items-center justify-center font-mono">1</span>
                  <span>{lang === 'bn' ? 'সার্ভিস নির্বাচন করুন *' : 'Select Service *'}</span>
                </label>
                <select
                  id="quote-service-select"
                  value={formData.serviceType}
                  onChange={(e) => {
                    handleStart();
                    setFormData(prev => ({ ...prev, serviceType: e.target.value }));
                  }}
                  className="w-full min-h-[48px] px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none transition-all"
                >
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'bn' ? opt.labelBn : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 2: TANK INFORMATION */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] flex items-center justify-center font-mono">2</span>
                  <span>{lang === 'bn' ? 'ট্যাংক ও ভবনের তথ্য' : 'Tank & Property Details'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Tank Type */}
                  <div>
                    <label htmlFor="quote-tank-type" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'ট্যাংকের অবস্থান' : 'Tank Type'}
                    </label>
                    <select
                      id="quote-tank-type"
                      value={formData.tankType}
                      onChange={(e) => setFormData(prev => ({ ...prev, tankType: e.target.value as any }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      <option value="Rooftop Tank">{lang === 'bn' ? 'ছাদের ট্যাংক (Rooftop Tank)' : 'Rooftop Tank'}</option>
                      <option value="Underground Tank">{lang === 'bn' ? 'আন্ডারগ্রাউন্ড রিজার্ভার (Underground Tank)' : 'Underground Tank'}</option>
                      <option value="Both">{lang === 'bn' ? 'উভয় ট্যাংক (Rooftop + Underground)' : 'Both Tanks'}</option>
                      <option value="Not Sure">{lang === 'bn' ? 'সঠিক জানি না (পরিদর্শন সাপেক্ষে)' : 'Not Sure'}</option>
                    </select>
                  </div>

                  {/* Approximate Capacity */}
                  <div>
                    <label htmlFor="quote-tank-capacity" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'ধারণক্ষমতা (লিটার)' : 'Approximate Tank Capacity'}
                    </label>
                    <select
                      id="quote-tank-capacity"
                      value={formData.tankCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, tankCapacity: e.target.value as any }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      <option value="Under 1,000 Liters">১,০০০ লিটার পর্যন্ত</option>
                      <option value="1,000 2,000 Liters">১,০০০ - ২,০০০ লিটার</option>
                      <option value="2,000 5,000 Liters">২,০০০ - ৫,০০০ লিটার</option>
                      <option value="5,000+ Liters">৫,০০০+ লিটার (বড় রিজার্ভার)</option>
                      <option value="I Don't Know">{lang === 'bn' ? 'ধারণক্ষমতা জানা নেই' : "I Don't Know"}</option>
                    </select>
                  </div>

                  {/* Number of Tanks */}
                  <div>
                    <label htmlFor="quote-tank-count" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'মোট ট্যাংকের সংখ্যা' : 'Number of Tanks'}
                    </label>
                    <select
                      id="quote-tank-count"
                      value={formData.numberOfTanks}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfTanks: parseInt(e.target.value, 10) || 1 }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      <option value={1}>১টি ট্যাংক (1 Tank)</option>
                      <option value={2}>২টি ট্যাংক (2 Tanks)</option>
                      <option value={3}>৩টি ট্যাংক (3 Tanks)</option>
                      <option value={4}>৪টি ট্যাংক (4 Tanks)</option>
                      <option value={5}>৫+ টি ট্যাংক (5+ Tanks)</option>
                    </select>
                  </div>

                  {/* Building Type */}
                  <div>
                    <label htmlFor="quote-building-type" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'ভবনের ধরন' : 'Building Type'}
                    </label>
                    <select
                      id="quote-building-type"
                      value={formData.buildingType}
                      onChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      {BUILDING_TYPES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Material / Tank Location */}
                  <div>
                    <label htmlFor="quote-tank-material" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'ট্যাংকের উপাদান' : 'Material / Location'}
                    </label>
                    <select
                      id="quote-tank-material"
                      value={formData.overheadMaterial}
                      onChange={(e) => setFormData(prev => ({ ...prev, overheadMaterial: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      <option value="PVC">PVC / প্লাস্টিক ট্যাংক</option>
                      <option value="RCC">RCC / কংক্রিট ঢালাই ট্যাংক</option>
                      <option value="Stainless Steel">স্টেইনলেস স্টিল (SS Tank)</option>
                      <option value="Underground Basement">মাটির নিচের রিজার্ভার</option>
                    </select>
                  </div>

                  {/* Last Cleaning Date */}
                  <div>
                    <label htmlFor="quote-last-clean" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'সর্বশেষ কবে পরিষ্কার হয়েছিল?' : 'Last Cleaned'}
                    </label>
                    <select
                      id="quote-last-clean"
                      value={formData.lastCleaningDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastCleaningDate: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    >
                      {LAST_CLEANING_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Quick Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === 'bn' ? 'পাইপলাইন ক্লিনিং প্রয়োজন?' : 'Pipeline Cleaning Needed?'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, pipelineCleaning: 'Yes' }))}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.pipelineCleaning === 'Yes' ? 'bg-[#0B2545] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        হ্যাঁ (Yes)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, pipelineCleaning: 'No' }))}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.pipelineCleaning === 'No' ? 'bg-[#0B2545] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        না (No)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === 'bn' ? 'ট্যাংকে নিরাপদে প্রবেশের সুবিধা আছে?' : 'Tank Accessible?'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tankAccessible: 'Yes' }))}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.tankAccessible === 'Yes' ? 'bg-[#0B2545] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        হ্যাঁ (Yes)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tankAccessible: 'No' }))}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.tankAccessible === 'No' ? 'bg-[#0B2545] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        না (No)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: PHOTO UPLOAD */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] flex items-center justify-center font-mono">3</span>
                    <span>{lang === 'bn' ? 'ট্যাংকের ছবি সংযুক্ত করুন (ঐচ্ছিক)' : 'Upload Photos (Optional)'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang === 'bn' ? 'সর্বোচ্চ ৪টি ছবি (JPG, PNG, WebP)' : 'Max 4 photos (JPG, PNG, WebP)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-square group shadow-2xs">
                      <img src={preview} alt={`Tank photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 cursor-pointer"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {photoPreviews.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-500 aspect-square flex flex-col items-center justify-center p-3 text-slate-500 hover:text-cyan-800 hover:bg-cyan-50/40 transition-all cursor-pointer group"
                    >
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-cyan-600 mb-1" />
                      <span className="text-[11px] font-bold text-center">
                        {lang === 'bn' ? '+ ছবি যোগ করুন' : 'Add Photo'}
                      </span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                  aria-label="Upload tank photos"
                />
              </div>

              {/* STEP 4: ADDRESS DETAILS */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] flex items-center justify-center font-mono">4</span>
                  <span>{lang === 'bn' ? 'সার্ভিস নেওয়ার ঠিকানা *' : 'Service Address *'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Area */}
                  <div>
                    <label htmlFor="quote-area-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'এলাকা নির্বাচন করুন *' : 'Select Area *'}
                    </label>
                    <select
                      id="quote-area-select"
                      value={formData.area}
                      onChange={(e) => {
                        handleStart();
                        setFormData(prev => ({ ...prev, area: e.target.value }));
                        if (errors.area) setErrors(prev => ({ ...prev, area: '' }));
                      }}
                      className={`w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.area ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-slate-50'
                      } focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none`}
                    >
                      <option value="">{lang === 'bn' ? '-- এলাকা বেছে নিন --' : '-- Select Dhaka Area --'}</option>
                      {DHAKA_AREAS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.area}</span>
                      </p>
                    )}
                  </div>

                  {/* Full Service Address */}
                  <div>
                    <label htmlFor="quote-full-address" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'বিস্তারিত ঠিকানা (বাড়ি, রোড, ব্লক)' : 'Full Address (House, Road, Block)'}
                    </label>
                    <input
                      id="quote-full-address"
                      type="text"
                      placeholder={lang === 'bn' ? 'যেমন: বাড়ি ১২, রোড ৫, সেক্টর ৩' : 'e.g. House 12, Road 5, Sector 3'}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 5: CONTACT INFORMATION */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] flex items-center justify-center font-mono">5</span>
                  <span>{lang === 'bn' ? 'যোগাযোগের তথ্য *' : 'Contact Information *'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="quote-customer-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      id="quote-customer-name"
                      type="text"
                      placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'Enter your full name'}
                      value={formData.name}
                      onChange={(e) => {
                        handleStart();
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-slate-50'
                      } focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label htmlFor="quote-customer-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      id="quote-customer-phone"
                      type="tel"
                      placeholder="01712-345678"
                      value={formData.phone}
                      onChange={(e) => {
                        handleStart();
                        handlePhoneChange(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-slate-50'
                      } focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="quote-customer-whatsapp" className="text-xs font-bold text-slate-700">
                        {lang === 'bn' ? 'WhatsApp নম্বর' : 'WhatsApp Number'}
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsPhone}
                          onChange={(e) => {
                            setSameAsPhone(e.target.checked);
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
                            }
                          }}
                          className="rounded text-[#0B2545] focus:ring-[#0B2545]"
                        />
                        <span>{lang === 'bn' ? 'মোবাইল নম্বরের অনুরূপ' : 'Same as phone'}</span>
                      </label>
                    </div>
                    <input
                      id="quote-customer-whatsapp"
                      type="tel"
                      placeholder="01609-999612"
                      disabled={sameAsPhone}
                      value={sameAsPhone ? formData.phone : formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 disabled:opacity-70 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="quote-customer-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'bn' ? 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      id="quote-customer-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Note */}
                <div>
                  <label htmlFor="quote-customer-notes" className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'bn' ? 'অতিরিক্ত নির্দেশনা বা মন্তব্য (ঐচ্ছিক)' : 'Additional Notes / Instructions (Optional)'}
                  </label>
                  <textarea
                    id="quote-customer-notes"
                    rows={2}
                    placeholder={lang === 'bn' ? 'যেমন: শুক্রবার সকালে কাজ করানো সুবিধাজনক, পানির লাইনে আয়রন বেশি ইত্যাদি...' : 'e.g. Friday preferred, narrow tank manhole...'}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* PRIVACY & SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>
                    {lang === 'bn' 
                      ? 'আপনার ব্যক্তিগত তথ্যাদি সম্পূর্ণ নিরাপদ ও সুরক্ষিত থাকবে এবং তৃতীয় কারও সাথে শেয়ার করা হয় না।'
                      : 'Your personal and contact details are stored securely and never shared with third parties.'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[52px] px-8 py-3.5 rounded-2xl bg-[#0B2545] hover:bg-[#071E3D] text-white font-extrabold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>{lang === 'bn' ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : 'Submitting Inquiry...'}</span>
                  ) : (
                    <>
                      <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট পাঠান' : 'Submit Details for Quotation'}</span>
                      <Send className="w-4 h-4 text-cyan-300" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};

export default QuoteRequestSection;
