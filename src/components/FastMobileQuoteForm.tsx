import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from '../utils/validation';
import { createLead, getLeadDraft, saveLeadDraft, clearLeadDraft } from '../services/leadService';
import { trackFormStarted, trackLeadSaved, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

export interface FastMobileQuoteFormProps {
  initialService?: string;
  initialArea?: string;
  sourceContext?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const POPULAR_AREAS = [
  'মিরপুর (Mirpur)',
  'উত্তরা (Uttara)',
  'ধানমন্ডি (Dhanmondi)',
  'মোহাম্মদপুর (Mohammadpur)',
  'গুলশান (Gulshan)',
  'বনানী (Banani)',
  'বসুন্ধরা (Bashundhara)',
  'বাড্ডা (Badda)',
  'মালিবাগ/মৌচাক (Malibagh)',
  'যাত্রাবাড়ী (Jatrabari)',
  'সাভার (Savar)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
  'অন্যান্য এলাকা'
];

const SERVICE_OPTIONS = [
  { id: 'overhead', titleBn: 'ছাদের ট্যাংক (Overhead)', titleEn: 'Rooftop / Overhead Tank' },
  { id: 'underground', titleBn: 'আন্ডারগ্রাউন্ড রিজার্ভার', titleEn: 'Underground Reservoir' },
  { id: 'both', titleBn: 'উভয় ট্যাংক (ছাদ + রিজার্ভার)', titleEn: 'Both Tanks (Package)' },
  { id: 'pipeline', titleBn: 'পাইপলাইন ক্লিনিং', titleEn: 'Pipeline Descaling' }
];

export const FastMobileQuoteForm: React.FC<FastMobileQuoteFormProps> = ({
  initialService,
  initialArea = '',
  sourceContext = 'Fast Mobile Quote Form',
  onSuccess,
  onClose
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  // Load existing draft if present
  const existingDraft = getLeadDraft();

  const [name, setName] = useState<string>(existingDraft?.name || '');
  const [phone, setPhone] = useState<string>(existingDraft?.phone || '');
  const [selectedService, setSelectedService] = useState<string>(() => {
    if (initialService) {
      const lower = initialService.toLowerCase();
      if (lower.includes('underground')) return 'underground';
      if (lower.includes('overhead') || lower.includes('rooftop')) return 'overhead';
      if (lower.includes('pipeline')) return 'pipeline';
      if (lower.includes('both')) return 'both';
    }
    return 'both';
  });
  const [area, setArea] = useState<string>(existingDraft?.area || initialArea || POPULAR_AREAS[0]);
  const [customArea, setCustomArea] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedLeadNumber, setConfirmedLeadNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [areaError, setAreaError] = useState<string>('');

  const submittingRef = useRef<boolean>(false);
  const startedTrackingRef = useRef<boolean>(false);

  // Auto-save draft when user types valid data
  useEffect(() => {
    if (phone.length >= 6 || name.length >= 2) {
      saveLeadDraft({
        name,
        phone,
        area: area === 'অন্যান্য এলাকা' ? customArea : area
      });
    }
  }, [name, phone, area, customArea]);

  const handleFocus = () => {
    if (!startedTrackingRef.current) {
      startedTrackingRef.current = true;
      trackFormStarted(sourceContext);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError) setPhoneError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    setAreaError('');
    setPhoneError('');
    setErrorMessage('');

    const trimmedName = name.trim();
    const rawPhone = phone.trim();
    const finalArea = area === 'অন্যান্য এলাকা' ? customArea.trim() : area.trim();

    let hasError = false;

    if (!rawPhone) {
      setPhoneError(lang === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Please enter your mobile phone number');
      hasError = true;
    } else if (!isValidBangladeshiPhone(rawPhone)) {
      setPhoneError(
        lang === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX)'
      );
      hasError = true;
    }

    if (!finalArea) {
      setAreaError(lang === 'bn' ? 'আপনার এলাকা লিখুন বা নির্বাচন করুন' : 'Please select or enter your area');
      hasError = true;
    }

    if (hasError) return;

    const normalizedPhone = normalizeBangladeshiPhone(rawPhone);
    const serviceLabel = SERVICE_OPTIONS.find(s => s.id === selectedService);
    const serviceName = serviceLabel ? (lang === 'bn' ? serviceLabel.titleBn : serviceLabel.titleEn) : 'Water Tank Cleaning';

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const createdLead = await createLead({
        name: trimmedName || 'Website Visitor',
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        serviceType: serviceName,
        tankType: selectedService === 'overhead' ? 'Rooftop Tank' : selectedService === 'underground' ? 'Underground Tank' : 'Both',
        tankCapacity: "I Don't Know",
        numberOfTanks: selectedService === 'both' ? 2 : 1,
        area: finalArea,
        message: message.trim() || undefined
      }, sourceContext);

      if (!createdLead.isSyncedToCloud) {
        setErrorMessage(
          lang === 'bn'
            ? 'সার্ভারে রিকোয়েস্ট সংরক্ষণ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সরাসরি WhatsApp বা কল করে কোটেশন নিন।'
            : 'Could not save request to the server. Please retry or use WhatsApp / Call directly.'
        );
        return;
      }

      clearLeadDraft();

      const leadNum = createdLead.leadNumber || 'SVC-' + Date.now().toString().slice(-6);
      setConfirmedLeadNumber(leadNum);
      setIsSubmitted(true);

      trackLeadSaved(leadNum, {
        source: sourceContext,
        service: serviceName,
        area: finalArea
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Lead submission error:', err);
      setErrorMessage(
        lang === 'bn'
          ? 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সরাসরি WhatsApp বা কল করুন।'
          : 'Submission issue. Please retry or call / message us directly via WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const encodedWhatsappMsg = encodeURIComponent(
    `আসসালামু আলাইকুম। আমি সানভিলোজ ক্লিন কেয়ার ওয়েবসাইট থেকে দ্রুত কোটেশন রিকোয়েস্ট পাঠিয়েছি।\n` +
    `নাম: ${name}\n` +
    `মোবাইল: ${phone}\n` +
    `সার্ভিস: ${SERVICE_OPTIONS.find(s => s.id === selectedService)?.titleBn || 'ট্যাংক ক্লিনিং'}\n` +
    `এলাকা: ${area === 'অন্যান্য এলাকা' ? customArea : area}\n` +
    `রেফারেন্স নং: ${confirmedLeadNumber || 'Fast Lead'}`
  );

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-[#E8F5F3] text-[#0D9488] rounded-full mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D9488] bg-[#E8F5F3] px-3 py-1 rounded-full">
            {lang === 'bn' ? 'অনুরোধ গ্রহণ করা হয়েছে' : 'Request Received'}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
            {lang === 'bn' ? 'ধন্যবাদ! আপনার রিকোয়েস্ট পেয়েছি' : 'Thank you! We received your request'}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            {lang === 'bn'
              ? 'আমাদের কাস্টমার কেয়ার টিম দ্রুত আপনার সাথে যোগাযোগ করবে।'
              : 'Our customer support team will call you shortly with an exact quotation.'}
          </p>
          {confirmedLeadNumber && (
            <div className="inline-block mt-2 px-3 py-1 bg-[#F5FAFC] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#123047]">
              ট্র্যাকিং আইডি: <strong>{confirmedLeadNumber}</strong>
            </div>
          )}
        </div>

        {/* WhatsApp & Call Direct Actions */}
        <div className="pt-2 space-y-3">
          <a
            href={`https://wa.me/${rawWhatsapp}?text=${encodedWhatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'fast_form_success', leadNumber: confirmedLeadNumber })}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন' : 'Get Quote on WhatsApp'}</span>
          </a>

          <a
            href={`tel:${business.phone}`}
            onClick={() => trackPhoneClick({ source: 'fast_form_success' })}
            className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-[#123047] hover:bg-[#1b4363] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#38BDF8]" />
            <span>{lang === 'bn' ? `সরাসরি কল করুন (${business.displayPhone})` : `Call ${business.displayPhone}`}</span>
          </a>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#64748B] hover:text-[#123047] underline underline-offset-4 cursor-pointer pt-2"
          >
            {lang === 'bn' ? 'উইন্ডো বন্ধ করুন' : 'Close window'}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-xs font-bold text-[#123047]">
            {lang === 'bn' ? '১ মিনিটে দ্রুত কোটেশন' : 'Fast 1-Min Quote'}
          </span>
        </div>
        <span className="text-[11px] text-[#64748B] flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#0D9488]" />
          <span>১৫ মিনিটে রেসপন্স</span>
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2.5" role="alert">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${rawWhatsapp}?text=${encodedWhatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'fast_form_error_fallback' })}
              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold text-[11px] inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp-এ কোটেশন নিন</span>
            </a>
            <a
              href={`tel:${business.phone}`}
              onClick={() => trackPhoneClick({ source: 'fast_form_error_fallback' })}
              className="px-3 py-1.5 rounded-lg bg-[#123047] text-white font-bold text-[11px] inline-flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>সরাসরি কল করুন</span>
            </a>
          </div>
        </div>
      )}

      {/* Row 1: Name (Optional) & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-[#172B3A] mb-1">
            {lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={handleFocus}
              placeholder={lang === 'bn' ? 'যেমন: শফিকুল ইসলাম (ঐচ্ছিক)' : 'e.g. Shafiqul Islam (Optional)'}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-[#F5FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172B3A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition-all"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-xs font-semibold text-[#172B3A] mb-1">
            {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
            <input
              type="tel"
              inputMode="numeric"
              required
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={handleFocus}
              placeholder="01XXXXXXXXX"
              className={`w-full min-h-[44px] pl-9 pr-3 py-2 bg-[#F5FAFC] border rounded-xl text-xs sm:text-sm text-[#172B3A] placeholder-[#94A3B8] font-mono focus:bg-white focus:outline-none transition-all ${
                phoneError ? 'border-red-500 ring-2 ring-red-200' : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20'
              }`}
            />
          </div>
          {phoneError && <p className="mt-1 text-[11px] text-red-600 font-medium">{phoneError}</p>}
        </div>
      </div>

      {/* Row 2: Service Selection Pills */}
      <div>
        <label className="block text-xs font-semibold text-[#172B3A] mb-1.5">
          {lang === 'bn' ? 'কোন সার্ভিসটি প্রয়োজন?' : 'Which service do you need?'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_OPTIONS.map((svc) => {
            const isSelected = selectedService === svc.id;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => setSelectedService(svc.id)}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#E8F5F3] border-[#0D9488] text-[#0D9488] shadow-sm font-bold'
                    : 'bg-white border-[#E2E8F0] text-[#172B3A] hover:bg-[#F5FAFC] hover:border-slate-300'
                }`}
              >
                <span className="truncate">{lang === 'bn' ? svc.titleBn : svc.titleEn}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0D9488] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Area Selection */}
      <div>
        <label className="block text-xs font-semibold text-[#172B3A] mb-1">
          {lang === 'bn' ? 'আপনার এলাকা (ঢাকা, নারায়ণগঞ্জ, গাজীপুর, সাভার)' : 'Your Area'} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              if (areaError) setAreaError('');
            }}
            className="w-full min-h-[44px] pl-9 pr-8 py-2 bg-[#F5FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172B3A] appearance-none focus:bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition-all cursor-pointer"
          >
            {POPULAR_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>

        {area === 'অন্যান্য এলাকা' && (
          <input
            type="text"
            value={customArea}
            onChange={(e) => {
              setCustomArea(e.target.value);
              if (areaError) setAreaError('');
            }}
            placeholder={lang === 'bn' ? 'আপনার নির্দিষ্ট এলাকা ও ঠিকানা লিখুন' : 'Enter your specific locality/address'}
            className={`mt-2 w-full min-h-[40px] px-3 py-2 bg-white border rounded-xl text-xs text-[#172B3A] placeholder-[#94A3B8] focus:outline-none ${
              areaError ? 'border-red-500 ring-2 ring-red-200' : 'border-[#E2E8F0] focus:border-[#0D9488]'
            }`}
          />
        )}
        {areaError && <p className="mt-1 text-[11px] text-red-600 font-medium">{areaError}</p>}
      </div>

      {/* Row 4: Short Optional Message */}
      <div>
        <label className="block text-xs font-semibold text-[#172B3A] mb-1 flex items-center justify-between">
          <span>{lang === 'bn' ? 'ট্যাংকের ধারণক্ষমতা বা অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Tank capacity / Additional notes (Optional)'}</span>
          <span className="text-[10px] text-[#64748B]">{lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'}</span>
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={lang === 'bn' ? 'যেমন: ৫ তলা ভবন, ১০০০ লিটার ছাদের ট্যাংক' : 'e.g. 5-storied building, 1000L tank'}
          className="w-full min-h-[40px] px-3 py-2 bg-[#F5FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172B3A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0D9488]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-300 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{lang === 'bn' ? 'কোটেশন পাঠানো হচ্ছে...' : 'Submitting Request...'}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ফ্রি কোটেশন রিকোয়েস্ট পাঠান' : 'Get Free Quote Now'}</span>
          </>
        )}
      </button>

      {/* Trust Guarantee Microcopy */}
      <div className="flex items-center justify-around pt-2 text-[11px] text-[#64748B] border-t border-[#E2E8F0]/80">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>কোনো অগ্রিম চার্জ নেই</span>
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>ফুড-গ্রেড ডিসইনফেকশন</span>
        </span>
      </div>
    </form>
  );
};
