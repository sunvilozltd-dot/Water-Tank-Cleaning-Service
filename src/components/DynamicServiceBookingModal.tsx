import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Phone, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Send, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Droplets,
  Layers,
  Wrench,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ServiceItem } from '../types';
import { CustomFormField, ServiceBookingFormConfig } from '../types/customBookingForm';
import { getServiceBookingForm } from '../data/defaultServiceBookingForms';
import { createLead } from '../services/leadService';
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from '../utils/validation';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackEvent, trackWhatsAppClick } from '../utils/tracking';
import { DHAKA_AREAS } from '../data/config';

interface DynamicServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  initialArea?: string;
  onSuccess?: () => void;
}

export const DynamicServiceBookingModal: React.FC<DynamicServiceBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  initialArea = '',
  onSuccess
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  // Contact fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [addressDetails, setAddressDetails] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  // Dynamic custom answers
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  
  // Validation and Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadNumber, setSubmittedLeadNumber] = useState<string | null>(null);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string>('');

  // Get active form config for this service
  const formConfig: ServiceBookingFormConfig = service 
    ? getServiceBookingForm(service)
    : { enabled: true, fields: [] };

  // Reset or initialize default answers when modal opens
  useEffect(() => {
    if (isOpen && service) {
      setSubmittedLeadNumber(null);
      setGeneratedWhatsAppUrl('');
      setErrors({});

      const initialValues: Record<string, any> = {};
      formConfig.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        } else if (field.type === 'select' && field.options && field.options.length > 0) {
          // Pre-select first option or leave empty
          initialValues[field.name] = '';
        } else {
          initialValues[field.name] = '';
        }
      });
      setCustomAnswers(initialValues);
    }
  }, [isOpen, service?.id, service?.bookingFormConfig]);

  if (!isOpen || !service) return null;

  const handleCustomFieldChange = (name: string, value: any) => {
    setCustomAnswers(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Validate Customer Name
    if (!customerName.trim()) {
      newErrors.customerName = lang === 'bn' ? 'আপনার নাম লিখুন' : 'Please enter your name';
    }

    // 2. Validate Bangladeshi Phone
    if (!customerPhone.trim()) {
      newErrors.customerPhone = lang === 'bn' ? '১১ ডিজিটের মোবাইল নম্বর লিখুন' : 'Please enter 11-digit mobile number';
    } else if (!isValidBangladeshiPhone(customerPhone)) {
      newErrors.customerPhone = lang === 'bn' ? 'সঠিক বাংলাদেশি নম্বর দিন (যেমন: 01712345678)' : 'Valid Bangladeshi phone required (01XXXXXXXXX)';
    }

    // 3. Validate Area
    if (!selectedArea) {
      newErrors.selectedArea = lang === 'bn' ? 'আপনার এলাকা নির্বাচন করুন' : 'Please select your area in Dhaka';
    }

    // 4. Validate dynamic custom fields
    formConfig.fields.forEach(field => {
      if (field.required) {
        const val = customAnswers[field.name];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.name] = lang === 'bn' 
            ? `এই তথ্যটি পূরণ করা আবশ্যক`
            : `This field is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedPhone = normalizeBangladeshiPhone(customerPhone);
      const serviceTitle = lang === 'bn' ? (service.titleBn || service.title) : service.title;

      // Construct formatted summary of custom answers
      const customSummaryLines: string[] = [];
      const answersObject: Record<string, any> = {};

      formConfig.fields.forEach(field => {
        const val = customAnswers[field.name];
        if (val !== undefined && val !== '') {
          const fieldLabel = lang === 'bn' ? field.labelBn : field.labelEn;
          customSummaryLines.push(`• ${fieldLabel}: ${val}`);
          answersObject[field.labelBn || field.name] = val;
        }
      });

      const fullMessage = [
        `সার্ভিস: ${serviceTitle}`,
        `এলাকা: ${selectedArea}`,
        addressDetails ? `ঠিকানা: ${addressDetails}` : '',
        preferredDate ? `পছন্দের তারিখ: ${preferredDate} ${preferredTime ? `(${preferredTime})` : ''}` : '',
        '',
        '--- সার্ভিসের প্রয়োজনীয় তথ্যাবলী ---',
        ...customSummaryLines
      ].filter(Boolean).join('\n');

      // 1. Submit lead to database/store
      const leadPayload = {
        name: customerName.trim(),
        phone: normalizedPhone,
        area: selectedArea,
        address: addressDetails.trim(),
        serviceType: service.title,
        tankType: 'Not Sure' as const,
        tankCapacity: '' as const,
        numberOfTanks: 1,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        message: fullMessage,
        customAnswers: answersObject,
        customFormTitle: formConfig.titleBn || formConfig.titleEn || serviceTitle,
        sourceContext: `Custom Form - ${service.title}`
      };

      const result = await createLead(leadPayload);
      const generatedLeadNumber = result.leadNumber || `LEAD-${Date.now().toString(36).toUpperCase()}`;
      setSubmittedLeadNumber(generatedLeadNumber);

      // 2. Generate WhatsApp URL with proper Bangladesh country code
      const rawWa = (business.whatsappNumber || '8801609999612').replace(/\D/g, '');
      const validWaNumber = rawWa.startsWith('88') ? rawWa : (rawWa.startsWith('0') ? `88${rawWa}` : `880${rawWa}`);
      const waText = [
        `*SUNVILOZ Clean Care - সার্ভিস বুকিং রিকোয়েস্ট* 📋`,
        `*অর্ডার নং:* #${generatedLeadNumber}`,
        `--------------------------------`,
        `*সার্ভিস:* ${serviceTitle}`,
        `*গ্রাহক:* ${customerName.trim()}`,
        `*মোবাইল:* ${normalizedPhone}`,
        `*এলাকা:* ${selectedArea}`,
        addressDetails ? `*ঠিকানা:* ${addressDetails.trim()}` : null,
        preferredDate ? `*তারিখ:* ${preferredDate} ${preferredTime ? `(${preferredTime})` : ''}` : null,
        `--------------------------------`,
        `*প্রয়োজনীয় তথ্যাবলী:*`,
        ...customSummaryLines,
        `--------------------------------`,
        `অনুগ্রহ করে কোটেশন নিশ্চিত করুন এবং টিম প্রেরণের সময়সূচি জানাবেন।`
      ].filter(Boolean).join('\n');

      const fullWaUrl = `https://wa.me/${validWaNumber}?text=${encodeURIComponent(waText)}`;
      setGeneratedWhatsAppUrl(fullWaUrl);

      trackEvent('custom_service_booked', {
        serviceId: service.id,
        serviceTitle: service.title,
        leadNumber: generatedLeadNumber
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to submit custom booking form:', err);
      alert('বুকিং সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#020712]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-[#08172C] text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto border border-cyan-500/30 border-t-4 border-t-cyan-400">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#061426]/98 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-cyan-900/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {lang === 'bn' ? 'কাস্টম বুকিং ফরম' : 'Custom Booking'}
                </span>
                <span className="text-xs text-slate-400">Sunviloz Clean Care</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white line-clamp-1">
                {lang === 'bn' 
                  ? (formConfig.titleBn || `${service.titleBn || service.title} বুকিং`)
                  : (formConfig.titleEn || `${service.title} Booking`)}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0D2444] hover:bg-[#12315C] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#08172C] space-y-6">

          {/* SUCCESS SCREEN */}
          {submittedLeadNumber ? (
            <div className="py-8 px-4 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  অর্ডার ট্র্যাকিং নং: #{submittedLeadNumber}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'bn' ? 'আপনার বুকিং রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!' : 'Booking Request Received Successfully!'}
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  ধন্যবাদ {customerName}। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করে সঠিক কোটেশন ও শিডিউল চূড়ান্ত করবেন।
                </p>
              </div>

              {/* 1-Click WhatsApp Button */}
              {generatedWhatsAppUrl && (
                <div className="pt-2 max-w-md mx-auto">
                  <a
                    href={generatedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('custom_booking_success_wa')}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে তাৎক্ষণিক কনফার্ম করুন' : 'Confirm Instantly on WhatsApp'}</span>
                  </a>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {lang === 'bn' ? 'হোয়াটসঅ্যাপে মেসেজ পাঠালে আপনার বুকিং অগ্রাধিকার ভিত্তিতে কনফার্ম করা হবে।' : 'Sending on WhatsApp ensures priority dispatch.'}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {lang === 'bn' ? 'উইন্ডো বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            /* BOOKING FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Form Subtitle / Banner */}
              <div className="bg-[#0D2444]/60 border border-cyan-800/40 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    {lang === 'bn'
                      ? (formConfig.subtitleBn || 'এই সার্ভিসের জন্য সঠিক তথ্য নির্বাচন করুন যাতে আমাদের টেকনিশিয়ান দল উপযুক্ত সরঞ্জাম নিয়ে আসতে পারে।')
                      : (formConfig.subtitleEn || 'Please provide accurate details so our specialized team arrives with appropriate equipment.')}
                  </p>
                  {service.startingPrice && (
                    <div className="mt-1 text-emerald-400 font-bold">
                      {lang === 'bn' ? `প্রাথমিক মূল্য: ৳${Number(service.startingPrice).toLocaleString()} থেকে শুরু` : `Starts from: ৳${Number(service.startingPrice).toLocaleString()}`}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 1: CUSTOMER CONTACT DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-cyan-900/40">
                  <User className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    ১. আপনার যোগাযোগের তথ্য (Contact Details)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      আপনার নাম <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                      }}
                      placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ রহমান' : 'e.g. John Doe'}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                        errors.customerName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                      }`}
                    />
                    {errors.customerName && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.customerName}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      মোবাইল নম্বর (WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: '' }));
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                        errors.customerPhone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                      }`}
                    />
                    {errors.customerPhone && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.customerPhone}</span>
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      ঢাকা শহরের এলাকা <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedArea}
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        if (errors.selectedArea) setErrors(prev => ({ ...prev, selectedArea: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border text-xs text-white focus:outline-none transition-all ${
                        errors.selectedArea ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                      }`}
                    >
                      <option value="">{lang === 'bn' ? '-- এলাকা নির্বাচন করুন --' : '-- Select Area --'}</option>
                      {DHAKA_AREAS.map(a => (
                        <option key={a.name} value={a.name}>
                          {lang === 'bn' ? a.nameBn : a.name}
                        </option>
                      ))}
                    </select>
                    {errors.selectedArea && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.selectedArea}</span>
                      </p>
                    )}
                  </div>

                  {/* Specific Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      বাড়ি / রোড নম্বর / ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: বাড়ি ১২, রোড ৪, ব্লক সি' : 'House 12, Road 4'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border border-cyan-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC CUSTOM SERVICE FIELDS (Configured by Admin) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-cyan-900/40">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      ২. এই সার্ভিসের প্রয়োজনীয় তথ্যাবলী (Service Requirements)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-mono">
                    {formConfig.fields.length} Fields
                  </span>
                </div>

                <div className="space-y-4">
                  {formConfig.fields.map((field) => {
                    const fieldLabel = lang === 'bn' ? field.labelBn : field.labelEn;
                    const fieldError = errors[field.name];
                    const currentValue = customAnswers[field.name] ?? '';

                    return (
                      <div key={field.id} className="p-3.5 rounded-xl bg-[#040D1A]/80 border border-cyan-950 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-200">
                          {fieldLabel} {field.required && <span className="text-rose-400">*</span>}
                        </label>

                        {/* Text input */}
                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            placeholder={lang === 'bn' ? (field.placeholderBn || '') : (field.placeholderEn || '')}
                            className={`w-full px-3.5 py-2 rounded-lg bg-[#08172C] border text-xs text-white placeholder-slate-500 focus:outline-none ${
                              fieldError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                            }`}
                          />
                        )}

                        {/* Number input */}
                        {field.type === 'number' && (
                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            placeholder={lang === 'bn' ? (field.placeholderBn || '0') : (field.placeholderEn || '0')}
                            className={`w-full px-3.5 py-2 rounded-lg bg-[#08172C] border text-xs text-white placeholder-slate-500 focus:outline-none ${
                              fieldError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                            }`}
                          />
                        )}

                        {/* Select Dropdown */}
                        {field.type === 'select' && (
                          <select
                            value={currentValue}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-lg bg-[#08172C] border text-xs text-white focus:outline-none ${
                              fieldError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                            }`}
                          >
                            <option value="">
                              {lang === 'bn' 
                                ? (field.placeholderBn || '-- একটি অপশন বেছে নিন --')
                                : (field.placeholderEn || '-- Choose an option --')}
                            </option>
                            {(field.options || []).map((opt, idx) => {
                              const label = (lang === 'bn' && field.optionsBn?.[idx]) ? field.optionsBn[idx] : opt;
                              return (
                                <option key={idx} value={label}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        )}

                        {/* Radio options */}
                        {field.type === 'radio' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {(field.options || []).map((opt, idx) => {
                              const label = (lang === 'bn' && field.optionsBn?.[idx]) ? field.optionsBn[idx] : opt;
                              const isChecked = currentValue === label;

                              return (
                                <label
                                  key={idx}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-cyan-950/60 border-cyan-400 text-white font-semibold'
                                      : 'bg-[#08172C] border-cyan-900/40 text-slate-300 hover:border-cyan-700'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={field.name}
                                    checked={isChecked}
                                    onChange={() => handleCustomFieldChange(field.name, label)}
                                    className="accent-cyan-400 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span>{label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Textarea */}
                        {field.type === 'textarea' && (
                          <textarea
                            rows={3}
                            value={currentValue}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            placeholder={lang === 'bn' ? (field.placeholderBn || '') : (field.placeholderEn || '')}
                            className={`w-full px-3.5 py-2 rounded-lg bg-[#08172C] border text-xs text-white placeholder-slate-500 focus:outline-none ${
                              fieldError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900/50 focus:border-cyan-400'
                            }`}
                          />
                        )}

                        {/* Help Text / Error */}
                        {fieldError ? (
                          <p className="text-[11px] text-rose-400 mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{fieldError}</span>
                          </p>
                        ) : field.helpTextBn || field.helpTextEn ? (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lang === 'bn' ? field.helpTextBn : field.helpTextEn}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: PREFERRED DATE & TIME */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-cyan-900/40">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    ৩. পছন্দের তারিখ ও সময় (Preferred Schedule)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      কাজের তারিখ
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border border-cyan-900/50 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      পছন্দের সময়সূচি
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040D1A] border border-cyan-900/50 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">{lang === 'bn' ? 'যেকোনো সুবিধাজনক সময়ে' : 'Anytime'}</option>
                      <option value="সকাল ৯:০০ - ১২:০০">{lang === 'bn' ? 'সকাল ৯:০০ - দুপুর ১২:০০' : 'Morning (9 AM - 12 PM)'}</option>
                      <option value="দুপুর ১২:০০ - ৩:০০">{lang === 'bn' ? 'দুপুর ১২:০০ - বিকাল ৩:০০' : 'Afternoon (12 PM - 3 PM)'}</option>
                      <option value="বিকাল ৩:০০ - সন্ধ্যা ৬:০০">{lang === 'bn' ? 'বিকাল ৩:০০ - সন্ধ্যা ৬:০০' : 'Evening (3 PM - 6 PM)'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Note if available */}
              {formConfig.estimatedPriceNoteBn && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{lang === 'bn' ? formConfig.estimatedPriceNoteBn : formConfig.estimatedPriceNoteEn}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{lang === 'bn' ? 'বুকিং সাবমিট হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {lang === 'bn'
                          ? (formConfig.submitButtonTextBn || 'বুকিং রিকোয়েস্ট পাঠান')
                          : (formConfig.submitButtonTextEn || 'Submit Booking Request')}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  {lang === 'bn' ? '🔒 আপনার তথ্য ১০০% সুরক্ষিত এবং কোনো লুকানো চার্জ নেই' : '🔒 Your details are 100% confidential. No hidden charges.'}
                </p>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
