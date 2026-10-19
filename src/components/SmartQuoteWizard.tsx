import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Phone, 
  User, 
  Home, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  MessageCircle, 
  AlertCircle,
  Building,
  Wrench,
  CalendarCheck,
  Droplets,
  ShieldCheck,
  Send,
  Building2,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';
import { QuoteFormData, QuoteLead } from '../types';
import { createLead, saveOrUpdatePartialLead } from '../services/leadService';
import { trackFormStarted, trackFormStepCompleted, trackLeadSaved, trackWhatsAppClick } from '../utils/tracking';
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from '../utils/validation';
import { calculateQuoteEstimate } from '../utils/pricingCalculator';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export interface SmartQuoteWizardProps {
  initialService?: string;
  initialArea?: string;
  sourceContext?: string;
  compact?: boolean;
  onSuccess?: () => void;
  onCloseModal?: () => void;
}

type TankTypeChoice = 'overhead' | 'underground' | 'both' | '';

export const SmartQuoteWizard: React.FC<SmartQuoteWizardProps> = ({
  initialService,
  initialArea = '',
  sourceContext = 'Website Quote Wizard',
  compact = false,
  onSuccess,
  onCloseModal
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  // Progressive Disclosure:
  // Step 1: Customer Name & Mobile Number (First-Step Lead Capture)
  // Step 2: Tank Selection (Overhead / Underground / Both)
  // Step 3: Capacity & Building Info
  // Step 4: Location & Address
  // Step 5: Add-ons, Schedule & Review
  // Step 6: Submission Success (WhatsApp & Confirmation)
  const [step, setStep] = useState<number>(1);
  const [capturedLeadId, setCapturedLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [confirmedLeadNumber, setConfirmedLeadNumber] = useState<string>('');

  // Step 1: Contact Information (First Step)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Step 2: Tank Type
  const [tankType, setTankType] = useState<TankTypeChoice>(() => {
    if (initialService) {
      const lower = initialService.toLowerCase();
      if (lower.includes('underground')) return 'underground';
      if (lower.includes('overhead') || lower.includes('rooftop')) return 'overhead';
      if (lower.includes('both')) return 'both';
    }
    return '';
  });

  // Step 3: Overhead Capacity
  const [overheadCapacityChoice, setOverheadCapacityChoice] = useState<string>('');
  const [overheadCustomCap, setOverheadCustomCap] = useState<string>('');

  // Step 3: Underground Capacity
  const [undergroundCapacityChoice, setUndergroundCapacityChoice] = useState<string>('');
  const [undergroundCustomCap, setUndergroundCustomCap] = useState<string>('');

  // Building information (if "I don't know" selected on either)
  const [floorsChoice, setFloorsChoice] = useState<string>('');
  const [customFloors, setCustomFloors] = useState<string>('');
  const [flatsChoice, setFlatsChoice] = useState<string>('');
  const [customFlats, setCustomFlats] = useState<string>('');

  // Step 4: Location
  const [selectedArea, setSelectedArea] = useState<string>(initialArea || '');
  const [customArea, setCustomArea] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [roadNumber, setRoadNumber] = useState<string>('');
  const [thana, setThana] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');

  // Step 5: Optional Add-ons & Scheduling
  const [pipelineCleaning, setPipelineCleaning] = useState<boolean>(false);
  const [annualContract, setAnnualContract] = useState<boolean>(false);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Auto-scroll to top of form when step changes
  useEffect(() => {
    if (step > 1 && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [step]);

  const markStarted = () => {
    if (!hasStarted) {
      setHasStarted(true);
      trackFormStarted(sourceContext);
    }
  };

  // Determine if building info is required
  const isOverheadUnknown = overheadCapacityChoice === 'unknown';
  const isUndergroundUnknown = undergroundCapacityChoice === 'unknown';
  const hasAnyUnknown = 
    ((tankType === 'overhead' || tankType === 'both') && isOverheadUnknown) ||
    ((tankType === 'underground' || tankType === 'both') && isUndergroundUnknown);
  const showBuildingInfo = true;

  // Resolved values
  const getOverheadCapacityString = () => {
    if (isOverheadUnknown) return 'জানা নাই';
    return overheadCustomCap.trim() ? `${overheadCustomCap.trim()} লিটার` : 'হাতে লেখা হয়নি';
  };

  const getUndergroundCapacityString = () => {
    if (isUndergroundUnknown) return 'জানা নাই';
    return undergroundCustomCap.trim() ? `${undergroundCustomCap.trim()} লিটার` : 'হাতে লেখা হয়নি';
  };

  const getEffectiveArea = () => {
    if (selectedArea === 'অন্যান্য' || selectedArea === 'Other') {
      return customArea.trim() || 'অন্যান্য এলাকা (Dhaka)';
    }
    return selectedArea.trim() || customArea.trim() || 'ঢাকা (Dhaka)';
  };

  const getEffectiveFloors = () => {
    return customFloors.trim() ? `${customFloors.trim()} তলা` : (floorsChoice ? `${floorsChoice} তলা` : '');
  };

  const getEffectiveFlats = () => {
    return customFlats.trim() ? `${customFlats.trim()}টি ফ্ল্যাট` : (flatsChoice ? `${flatsChoice}টি ফ্ল্যাট` : '');
  };

  // Estimate calculation for live preview
  const estimateResult = calculateQuoteEstimate({
    tankType: tankType === 'overhead' ? 'Rooftop Tank' : tankType === 'underground' ? 'Underground Tank' : tankType === 'both' ? 'Both' : '',
    tankCapacity: tankType === 'overhead' ? (isOverheadUnknown ? "I Don't Know" : overheadCapacityChoice) : tankType === 'underground' ? (isUndergroundUnknown ? "I Don't Know" : undergroundCapacityChoice) : "I Don't Know",
    floors: floorsChoice === 'custom' ? customFloors : floorsChoice,
    flats: flatsChoice === 'custom' ? customFlats : flatsChoice,
    additionalPipelineCleaning: pipelineCleaning,
    additionalAmc: annualContract
  });

  // STEP 1 HANDLER: Collect Customer Name & Mobile Number (First-Step Lead Capture)
  const handleStep1Submit = async () => {
    markStarted();
    setNameError('');
    setPhoneError('');
    setErrorMsg('');

    const trimmedName = customerName.trim();
    const rawPhone = customerPhone.trim();

    let hasError = false;

    if (!trimmedName) {
      setNameError(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      hasError = true;
    } else if (trimmedName.length < 2) {
      setNameError(lang === 'bn' ? 'নাম ন্যূনতম ২ অক্ষরের হতে হবে।' : 'Name must be at least 2 characters.');
      hasError = true;
    }

    if (!rawPhone) {
      setPhoneError(lang === 'bn' ? 'অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।' : 'Please enter your mobile phone number.');
      hasError = true;
    } else if (!isValidBangladeshiPhone(rawPhone)) {
      setPhoneError(lang === 'bn' 
        ? 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা +8801XXXXXXXXX)' 
        : 'Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX or +8801XXXXXXXXX)');
      hasError = true;
    }

    if (hasError) return;

    const normalized = normalizeBangladeshiPhone(rawPhone);

    // Save lead IMMEDIATELY as Incomplete Lead so drop-offs can be followed up by admin!
    setIsSubmitting(true);
    try {
      const partialLead = await saveOrUpdatePartialLead(capturedLeadId, {
        name: trimmedName,
        phone: normalized,
        whatsapp: normalized,
        area: getEffectiveArea(),
        status: 'Incomplete',
        isAbandoned: true,
        completionStep: 1,
        lastActiveStepName: 'Step 1 - Contact Captured',
        source: (sourceContext || 'Website Booking Wizard') as any
      });

      if (partialLead?.id) {
        setCapturedLeadId(partialLead.id);
      }
      trackFormStepCompleted(1, 'contact_captured', { source: sourceContext, phone: normalized });
      setStep(2);
    } catch (err) {
      console.warn('Non-blocking lead capture warning:', err);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2 HANDLER: Tank Type
  const handleStep2Next = async () => {
    if (!tankType) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ট্যাংকের ধরন নির্বাচন করুন' : 'Please select which tank you need cleaned');
      return;
    }
    setErrorMsg('');
    trackFormStepCompleted(2, 'tank_type', { source: sourceContext, tankType });

    // Update partial lead in background
    if (capturedLeadId) {
      saveOrUpdatePartialLead(capturedLeadId, {
        name: customerName.trim(),
        phone: normalizeBangladeshiPhone(customerPhone),
        tankType: tankType === 'overhead' ? 'Rooftop Tank' : tankType === 'underground' ? 'Underground Tank' : 'Both',
        serviceType: tankType === 'both' ? 'Both Water Tank Cleaning' : tankType === 'underground' ? 'Underground Water Tank Cleaning' : 'Overhead Tank Cleaning',
        completionStep: 2,
        lastActiveStepName: `Step 2 - Tank Selected (${tankType})`
      }).catch(() => {});
    }

    setStep(3);
  };

  // STEP 3 HANDLER: Capacity Details
  const handleStep3Next = async () => {
    setErrorMsg('');
    const overheadActive = tankType === 'overhead' || tankType === 'both';
    const undergroundActive = tankType === 'underground' || tankType === 'both';

    // If either tank has "জানা নাই" selected:
    // "যে কোন একটায় জানা নাই সিলেক্ট করলে অপর টা আর কোন তথ্য লাগবে না।"
    // "ভবনের বিবরণ (ক্যাপাসিটি নির্ণয়ের জন্য): ভবনের তলা সংখ্যা: হাতে দিবে, মোট ফ্ল্যাট সংখ্যা: হাতে দিবে।"
    if (hasAnyUnknown) {
      if (!customFloors.trim()) {
        setErrorMsg(lang === 'bn' ? 'ক্যাপাসিটি নির্ণয়ের জন্য ভবনের তলা সংখ্যা হাতে লিখুন' : 'Please enter building floors count');
        return;
      }
      if (!customFlats.trim()) {
        setErrorMsg(lang === 'bn' ? 'ক্যাপাসিটি নির্ণয়ের জন্য মোট ফ্ল্যাট সংখ্যা হাতে লিখুন' : 'Please enter total flats count');
        return;
      }
    } else {
      // Neither is unknown -> user must enter tank sizes by hand
      if (overheadActive && !overheadCustomCap.trim()) {
        setErrorMsg(lang === 'bn' ? 'ওভারহেড ট্যাংকের সাইজ হাতে লিখুন অথবা "জানা নাই" সিলেক্ট করুন' : 'Please enter overhead tank size or select "Don\'t Know"');
        return;
      }
      if (undergroundActive && !undergroundCustomCap.trim()) {
        setErrorMsg(lang === 'bn' ? 'আন্ডারগ্রাউন্ড ট্যাংকের সাইজ হাতে লিখুন অথবা "জানা নাই" সিলেক্ট করুন' : 'Please enter underground tank size or select "Don\'t Know"');
        return;
      }
    }

    setErrorMsg('');
    trackFormStepCompleted(3, 'capacity_info', { source: sourceContext });

    // Update partial lead in background
    if (capturedLeadId) {
      saveOrUpdatePartialLead(capturedLeadId, {
        name: customerName.trim(),
        phone: normalizeBangladeshiPhone(customerPhone),
        tankCapacity: (tankType === 'both' ? `${getOverheadCapacityString()} + ${getUndergroundCapacityString()}` : tankType === 'overhead' ? getOverheadCapacityString() : getUndergroundCapacityString()) as any,
        overheadCapacity: (tankType === 'overhead' || tankType === 'both') ? getOverheadCapacityString() : undefined,
        undergroundCapacity: (tankType === 'underground' || tankType === 'both') ? getUndergroundCapacityString() : undefined,
        floors: showBuildingInfo ? getEffectiveFloors() : undefined,
        flats: showBuildingInfo ? getEffectiveFlats() : undefined,
        completionStep: 3,
        lastActiveStepName: 'Step 3 - Capacity Details Provided'
      }).catch(() => {});
    }

    setStep(4);
  };

  // STEP 4 HANDLER: Location & Address
  const handleStep4Next = async () => {
    const area = getEffectiveArea();
    if (!area) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার ঢাকা এলাকার নাম নির্বাচন বা লিখুন' : 'Please select or enter your area in Dhaka');
      return;
    }
    setErrorMsg('');
    trackFormStepCompleted(4, 'location_info', { source: sourceContext, area });

    // Update partial lead in background
    if (capturedLeadId) {
      saveOrUpdatePartialLead(capturedLeadId, {
        name: customerName.trim(),
        phone: normalizeBangladeshiPhone(customerPhone),
        area,
        houseNumber: houseNumber.trim() || undefined,
        roadNumber: roadNumber.trim() || undefined,
        thana: thana.trim() || undefined,
        postcode: postcode.trim() || undefined,
        landmark: landmark.trim() || undefined,
        completionStep: 4,
        lastActiveStepName: `Step 4 - Location Provided (${area})`
      }).catch(() => {});
    }

    setStep(5);
  };

  // Structured WhatsApp Message Builder
  const buildWhatsAppMessage = (leadNum?: string) => {
    const lines: string[] = [
      '💧 নতুন কোটেশন ও বুকিং রিকোয়েস্ট (Sunviloz Clean Care)',
      leadNum ? `রেফারেন্স নং: ${leadNum}` : '',
      '--------------------------------',
      '👤 গ্রাহকের তথ্য:',
      `নাম: ${customerName.trim()}`,
      `মোবাইল: ${normalizeBangladeshiPhone(customerPhone)}`,
      '',
      '📍 ঠিকানা ও এলাকা:',
      `এলাকা: ${getEffectiveArea()}`,
      houseNumber.trim() ? `বাসা: ${houseNumber.trim()}` : '',
      roadNumber.trim() ? `রোড: ${roadNumber.trim()}` : '',
      thana.trim() ? `থানা: ${thana.trim()}` : '',
      postcode.trim() ? `পোস্ট কোড: ${postcode.trim()}` : '',
      landmark.trim() ? `ল্যান্ডমার্ক: ${landmark.trim()}` : '',
      '',
      '🚰 ট্যাংকের তথ্য:',
      `ট্যাংকের ধরন: ${tankType === 'overhead' ? 'ওভারহেড / ছাদের ট্যাংক' : tankType === 'underground' ? 'আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক' : 'উভয় ট্যাংক (Overhead + Underground)'}`
    ].filter(Boolean);

    if (tankType === 'overhead' || tankType === 'both') {
      lines.push(`ওভারহেড ট্যাংক ক্যাপাসিটি: ${getOverheadCapacityString()}`);
    }

    if (tankType === 'underground' || tankType === 'both') {
      lines.push(`আন্ডারগ্রাউন্ড রিজার্ভার ক্যাপাসিটি: ${getUndergroundCapacityString()}`);
    }

    if (showBuildingInfo) {
      lines.push(`ভবনের তলা: ${getEffectiveFloors()}`);
      lines.push(`মোট ফ্ল্যাট: ${getEffectiveFlats()}`);
    }

    lines.push('');
    lines.push('🔧 অতিরিক্ত সেবা:');
    const addOns: string[] = [];
    if (pipelineCleaning) addOns.push('• পানির পাইপলাইন পরিষ্কার (Hydro-Pulse Flushing)');
    if (annualContract) addOns.push('• বার্ষিক রক্ষণাবেক্ষণ চুক্তি (AMC Contract)');
    if (addOns.length > 0) {
      lines.push(...addOns);
    } else {
      lines.push('কোনো অতিরিক্ত সেবা নেওয়া হয়নি');
    }

    if (preferredDate.trim()) {
      lines.push(`পছন্দের তারিখ: ${preferredDate.trim()}`);
    }
    if (preferredTime.trim()) {
      lines.push(`পছন্দের সময়: ${preferredTime.trim()}`);
    }
    if (customerNotes.trim()) {
      lines.push(`গ্রাহকের মন্তব্য: ${customerNotes.trim()}`);
    }

    return lines.join('\n');
  };

  // STEP 5: Final Submission Handler
  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fullAddressParts = [
        houseNumber.trim() ? `বাসা: ${houseNumber.trim()}` : '',
        roadNumber.trim() ? `রোড: ${roadNumber.trim()}` : '',
        getEffectiveArea(),
        thana.trim() ? `থানা: ${thana.trim()}` : '',
        postcode.trim() ? `পোস্ট কোড: ${postcode.trim()}` : '',
        landmark.trim() ? `নিকটবর্তী: ${landmark.trim()}` : ''
      ].filter(Boolean);

      const normalizedPhone = normalizeBangladeshiPhone(customerPhone);

      const fullLeadPayload: Partial<QuoteLead> & { name: string; phone: string } = {
        name: customerName.trim(),
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        area: getEffectiveArea(),
        houseNumber: houseNumber.trim() || undefined,
        roadNumber: roadNumber.trim() || undefined,
        thana: thana.trim() || undefined,
        postcode: postcode.trim() || undefined,
        landmark: landmark.trim() || undefined,
        address: fullAddressParts.join(', '),
        serviceType: initialService || (tankType === 'both' ? 'Both Water Tank Cleaning' : tankType === 'underground' ? 'Underground Water Tank Cleaning' : 'Overhead Tank Cleaning'),
        tankType: tankType === 'overhead' ? 'Rooftop Tank' : tankType === 'underground' ? 'Underground Tank' : 'Both',
        tankCapacity: (tankType === 'both' ? `${getOverheadCapacityString()} + ${getUndergroundCapacityString()}` : tankType === 'overhead' ? getOverheadCapacityString() : getUndergroundCapacityString()) as any,
        overheadCapacity: (tankType === 'overhead' || tankType === 'both') ? getOverheadCapacityString() : undefined,
        undergroundCapacity: (tankType === 'underground' || tankType === 'both') ? getUndergroundCapacityString() : undefined,
        overheadCustomCapacity: overheadCustomCap.trim() || undefined,
        undergroundCustomCapacity: undergroundCustomCap.trim() || undefined,
        overheadUnknown: isOverheadUnknown,
        undergroundUnknown: isUndergroundUnknown,
        numberOfTanks: tankType === 'both' ? 2 : 1,
        floors: showBuildingInfo ? getEffectiveFloors() : undefined,
        flats: showBuildingInfo ? getEffectiveFlats() : undefined,
        additionalPipelineCleaning: pipelineCleaning,
        additionalAmc: annualContract,
        capacityUnknown: isOverheadUnknown || isUndergroundUnknown,
        preferredDate: preferredDate.trim() || undefined,
        preferredTime: preferredTime.trim() || undefined,
        notes: customerNotes.trim() || undefined,
        status: 'New', // Confirmed conversion from incomplete!
        isAbandoned: false,
        completionStep: 5,
        lastActiveStepName: 'Completed Booking Request',
        source: (sourceContext || 'Website Booking Form') as any
      };

      // Update lead to Confirmed in database / localStorage
      const savedLead = await saveOrUpdatePartialLead(capturedLeadId, fullLeadPayload);
      const leadNum = savedLead.leadNumber || 'SVC-' + Math.floor(100000 + Math.random() * 900000);
      setConfirmedLeadNumber(leadNum);

      trackLeadSaved('smart_quote_wizard_complete', { phone: normalizedPhone, leadNum });

      // Generate WhatsApp Link to 01609999612
      const rawNumber = '8801609999612';
      const msg = buildWhatsAppMessage(leadNum);
      const generatedWaUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
      setWhatsappUrl(generatedWaUrl);

      // Transition to Success Screen
      setStep(6);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      const rawNumber = '8801609999612';
      setWhatsappUrl(`https://wa.me/${rawNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`);
      setStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Popular Dhaka Area Chips for quick selection
  const POPULAR_DHAKA_AREAS = [
    'Gulshan',
    'Banani',
    'Uttara',
    'Bashundhara',
    'Dhanmondi',
    'Mirpur',
    'Mohammadpur',
    'Baridhara',
    'Badda',
    'Khilkhet',
    'Rampura',
    'Banasree',
    'Mohakhali',
    'Old Dhaka'
  ];

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-[#08162A]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#020A16]/90 overflow-hidden transition-all duration-300 relative border-t-2 border-t-cyan-400 ${compact ? 'p-4 sm:p-6' : 'p-6 sm:p-8 lg:p-10'}`}
    >
      {/* Step Progress Indicator (Steps 1 to 5) */}
      {step <= 5 && (
        <div className="mb-6 sm:mb-8 border-b border-cyan-900/40 pb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{lang === 'bn' ? `ধাপ 0${step} / 05` : `Step ${step} of 5`}</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {step === 1 && (lang === 'bn' ? '১. নাম ও মোবাইল নম্বর' : '1. Name & Mobile')}
              {step === 2 && (lang === 'bn' ? '২. ট্যাংকের ধরন' : '2. Tank Selection')}
              {step === 3 && (lang === 'bn' ? '৩. ধারণক্ষমতা ও বিবরণ' : '3. Capacity Details')}
              {step === 4 && (lang === 'bn' ? '৪. এলাকা ও ঠিকানা' : '4. Location & Address')}
              {step === 5 && (lang === 'bn' ? '৫. সেবা ও নিশ্চিতকরণ' : '5. Add-ons & Review')}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#040D1A] rounded-full overflow-hidden border border-cyan-950">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Global Error Alert Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 01 — CUSTOMER NAME & MOBILE NUMBER (FIRST-STEP LEAD CAPTURE) */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                {lang === 'bn' ? 'ধাপ ০১ — দ্রুত শুরু' : 'Step 1 — Quick Start'}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '১০০% তথ্য সুরক্ষিত' : '100% Privacy Protected'}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? 'আপনার নাম ও মোবাইল নম্বর লিখুন' : 'Enter Your Name & Mobile Number'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' 
                ? 'মাত্র ১ মিনিটে সঠিক কোটেশন পেতে আপনার নাম এবং যোগাযোগের মোবাইল নম্বর দিয়ে এগিয়ে যান।' 
                : 'Get an instant accurate estimate in under 1 minute. We will send quotation details to your number.'}
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Customer Name */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                {lang === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Your Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder={lang === 'bn' ? 'উদা: মোঃ আরিফুল ইসলাম' : 'e.g. John Doe / Md. Ariful Islam'}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#06152B] border text-white text-sm focus:outline-none transition-colors ${
                    nameError 
                      ? 'border-rose-500 focus:border-rose-400' 
                      : 'border-cyan-800/60 focus:border-cyan-400'
                  }`}
                  autoFocus
                />
              </div>
              {nameError && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                {lang === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Number (11 Digits) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="01XXXXXXXXX বা +8801XXXXXXXXX"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#06152B] border text-white text-sm focus:outline-none transition-colors ${
                    phoneError 
                      ? 'border-rose-500 focus:border-rose-400' 
                      : 'border-cyan-800/60 focus:border-cyan-400'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'bn' 
                    ? 'WhatsApp সক্রিয় নম্বর হলে কোটেশন ও ফটো পাঠানো অনেক দ্রুত হয়।' 
                    : 'WhatsApp-enabled numbers allow instant quotation photos & updates.'}
                </p>
              )}
            </div>
          </div>

          {/* Privacy & Trust assurance pill */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/30 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {lang === 'bn' 
                ? 'আপনার তথ্যের শতভাগ গোপনীয়তা নিশ্চিত করা হয়। কোনো প্রকার স্প্যাম কল দেওয়া হবে না।' 
                : 'Your contact details are strictly confidential. Zero spam policy guaranteed.'}
            </span>
          </div>

          {/* First-Step CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStep1Submit}
              disabled={isSubmitting}
              className="w-full min-h-[50px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-600/30 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'bn' ? 'বুকিং এগিয়ে নিন — Continue to Booking' : 'Continue to Booking'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 02 — SELECT TANK TYPE                                     */}
      {/* ============================================================== */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                {lang === 'bn' ? 'ধাপ ০২ — ট্যাংক নির্বাচন' : 'Step 2 — Tank Selection'}
              </span>
              <span className="text-[11px] text-slate-400">
                ({customerName.trim()})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? 'আপনার কোন ধরনের ট্যাংক পরিষ্কার করতে চান?' : 'Which tank do you need cleaned?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' ? 'সঠিক অপশনটি নির্বাচন করুন' : 'Select the appropriate tank option below'}
            </p>
          </div>

          {/* 3 Selectable Radio Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* Card 1: Overhead / Rooftop Tank */}
            <button
              type="button"
              onClick={() => {
                setTankType('overhead');
                setErrorMsg('');
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                tankType === 'overhead'
                  ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                  : 'bg-[#06152B] hover:bg-[#081B38] border-cyan-900/50 hover:border-cyan-700/60'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mb-3">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  {lang === 'bn' ? 'ওভারহেড ট্যাংক' : 'Overhead Tank'}
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  {lang === 'bn' ? 'ছাদের ওপরের পিভিসি বা আরসিসি পানির ট্যাংক' : 'Rooftop PVC or RCC overhead tank'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold">{lang === 'bn' ? 'ছাদের ট্যাংক' : 'Rooftop'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'overhead' ? 'bg-cyan-400 border-cyan-400 text-[#040D1A]' : 'border-slate-600'}`}>
                  {tankType === 'overhead' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>

            {/* Card 2: Underground Tank */}
            <button
              type="button"
              onClick={() => {
                setTankType('underground');
                setErrorMsg('');
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                tankType === 'underground'
                  ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                  : 'bg-[#06152B] hover:bg-[#081B38] border-cyan-900/50 hover:border-cyan-700/60'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mb-3">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  {lang === 'bn' ? 'আন্ডারগ্রাউন্ড ট্যাংক' : 'Underground Tank'}
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  {lang === 'bn' ? 'নিচতলা বা ভূগর্ভস্থ রিজার্ভার ট্যাংক' : 'Ground floor or underground reserve'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">{lang === 'bn' ? 'ভূগর্ভস্থ' : 'Underground'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'underground' ? 'bg-cyan-400 border-cyan-400 text-[#040D1A]' : 'border-slate-600'}`}>
                  {tankType === 'underground' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>

            {/* Card 3: Both Tanks */}
            <button
              type="button"
              onClick={() => {
                setTankType('both');
                setErrorMsg('');
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                tankType === 'both'
                  ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                  : 'bg-[#06152B] hover:bg-[#081B38] border-cyan-900/50 hover:border-cyan-700/60'
              }`}
            >
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lang === 'bn' ? 'জনপ্রিয় প্যাকেজ' : 'Best Value'}
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  {lang === 'bn' ? 'উভয় ট্যাংক (ছাদ + নিচ)' : 'Both Tanks'}
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  {lang === 'bn' ? 'ওভারহেড ও আন্ডারগ্রাউন্ড যৌথ ক্লিনিং' : 'Full overhead + underground system'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center justify-between text-xs">
                <span className="text-purple-400 font-semibold">{lang === 'bn' ? 'কম্বো সার্ভিস' : 'Combo'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'both' ? 'bg-cyan-400 border-cyan-400 text-[#040D1A]' : 'border-slate-600'}`}>
                  {tankType === 'both' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(1);
              }}
              className="px-4 py-2.5 rounded-xl border border-cyan-900/60 bg-[#06152B] hover:bg-[#0A2244] text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep2Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#040D1A] font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 03 — CAPACITY & BUILDING INFO                              */}
      {/* ============================================================== */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৩ — ধারণক্ষমতা ও বিবরণ' : 'Step 3 — Tank Capacity'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? 'ট্যাংকের আনুমানিক ধারণক্ষমতা কত?' : 'Estimated Tank Capacity?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' ? 'ধারণক্ষমতা জানা না থাকলে "জানা নেই" বেছে নিন।' : 'If unsure, select "I Don\'t Know" to estimate based on floors.'}
            </p>
          </div>

          {/* Section A: Overhead Tank Capacity */}
          {(tankType === 'overhead' || tankType === 'both') && (
            <div className={`space-y-3 bg-[#06152B] p-4 sm:p-5 rounded-2xl border transition-all ${
              isUndergroundUnknown && tankType === 'both' 
                ? 'border-cyan-900/40 bg-[#06152B]/70' 
                : 'border-cyan-900/60'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'ওভারহেড (ছাদের) ট্যাংকের সাইজ:' : 'Overhead (Rooftop) Tank Size:'}
                  </h3>
                </div>
                {isUndergroundUnknown && tankType === 'both' && (
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/50">
                    {lang === 'bn' ? 'আন্ডারগ্রাউন্ডে "জানা নাই" সিলেক্ট থাকায় এটি আর পূরণ করা লাগবে না' : 'Optional because underground is unknown'}
                  </span>
                )}
              </div>

              {/* Hand-written Input & "জানা নাই" Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    disabled={isOverheadUnknown}
                    value={isOverheadUnknown ? (lang === 'bn' ? 'জানা নাই' : "Don't Know") : overheadCustomCap}
                    onChange={(e) => {
                      setOverheadCustomCap(e.target.value);
                      setOverheadCapacityChoice('custom');
                      setErrorMsg('');
                    }}
                    placeholder={lang === 'bn' ? 'হাতে ট্যাংকের সাইজ লিখুন (যেমন: ১,০০০ বা ২০০০ লিটার)' : 'Write tank size (e.g. 1000 or 2000 L)'}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none ${
                      isOverheadUnknown
                        ? 'bg-slate-900 text-slate-400 border-slate-800 cursor-not-allowed opacity-80'
                        : 'bg-[#081B38] text-white border-cyan-800/80 focus:border-cyan-400 placeholder-slate-500'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isOverheadUnknown) {
                      setOverheadCapacityChoice('custom');
                    } else {
                      setOverheadCapacityChoice('unknown');
                    }
                    setErrorMsg('');
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    isOverheadUnknown
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                      : 'bg-[#081B38] text-slate-300 border-cyan-900/80 hover:bg-[#0B254A] hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isOverheadUnknown ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-400'
                  }`}>
                    {isOverheadUnknown ? '✓' : ''}
                  </span>
                  <span>{lang === 'bn' ? 'জানা নাই' : "I Don't Know"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section B: Underground Tank Capacity */}
          {(tankType === 'underground' || tankType === 'both') && (
            <div className={`space-y-3 bg-[#06152B] p-4 sm:p-5 rounded-2xl border transition-all ${
              isOverheadUnknown && tankType === 'both' 
                ? 'border-cyan-900/40 bg-[#06152B]/70' 
                : 'border-cyan-900/60'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'আন্ডারগ্রাউন্ড রিজার্ভার ট্যাংকের সাইজ:' : 'Underground Reservoir Size:'}
                  </h3>
                </div>
                {isOverheadUnknown && tankType === 'both' && (
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/50">
                    {lang === 'bn' ? 'ওভারহেডে "জানা নাই" সিলেক্ট থাকায় এটি আর পূরণ করা লাগবে না' : 'Optional because overhead is unknown'}
                  </span>
                )}
              </div>

              {/* Hand-written Input & "জানা নাই" Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    disabled={isUndergroundUnknown}
                    value={isUndergroundUnknown ? (lang === 'bn' ? 'জানা নাই' : "Don't Know") : undergroundCustomCap}
                    onChange={(e) => {
                      setUndergroundCustomCap(e.target.value);
                      setUndergroundCapacityChoice('custom');
                      setErrorMsg('');
                    }}
                    placeholder={lang === 'bn' ? 'হাতে ট্যাংকের সাইজ লিখুন (যেমন: ৫,০০০ বা ১০০০০ লিটার)' : 'Write reservoir size (e.g. 5000 or 10000 L)'}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none ${
                      isUndergroundUnknown
                        ? 'bg-slate-900 text-slate-400 border-slate-800 cursor-not-allowed opacity-80'
                        : 'bg-[#081B38] text-white border-cyan-800/80 focus:border-cyan-400 placeholder-slate-500'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isUndergroundUnknown) {
                      setUndergroundCapacityChoice('custom');
                    } else {
                      setUndergroundCapacityChoice('unknown');
                    }
                    setErrorMsg('');
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    isUndergroundUnknown
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                      : 'bg-[#081B38] text-slate-300 border-cyan-900/80 hover:bg-[#0B254A] hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isUndergroundUnknown ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-400'
                  }`}>
                    {isUndergroundUnknown ? '✓' : ''}
                  </span>
                  <span>{lang === 'bn' ? 'জানা নাই' : "I Don't Know"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section C: ভবনের বিবরণ (ক্যাপাসিটি নির্ণয়ের জন্য) — ভবনের তলা সংখ্যা: হাতে দিবে, মোট ফ্ল্যাট সংখ্যা: হাতে দিবে */}
          <div className={`space-y-4 p-4 sm:p-5 rounded-2xl border transition-all ${
            hasAnyUnknown 
              ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30' 
              : 'bg-[#06152B] border-cyan-900/50'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'bn' ? 'ভবনের বিবরণ (ক্যাপাসিটি নির্ণয়ের জন্য):' : 'Building Info (for estimation):'}
                </h3>
              </div>
              {hasAnyUnknown && (
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-900/60 px-2.5 py-0.5 rounded-full border border-cyan-700/50">
                  {lang === 'bn' ? 'ট্যাংকের সাইজ অজানা থাকায় এটি আবশ্যক' : 'Required for capacity calculation'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'ভবনের তলা সংখ্যা:' : 'Total Floors:'} {hasAnyUnknown && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customFloors}
                  onChange={(e) => {
                    setCustomFloors(e.target.value);
                    setFloorsChoice('custom');
                    setErrorMsg('');
                  }}
                  placeholder={lang === 'bn' ? 'হাতে তলা লিখুন (যেমন: ৬)' : 'Enter floors (e.g. 6)'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081B38] border border-cyan-900 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'মোট ফ্ল্যাট সংখ্যা:' : 'Total Flats:'} {hasAnyUnknown && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={customFlats}
                  onChange={(e) => {
                    setCustomFlats(e.target.value);
                    setFlatsChoice('custom');
                    setErrorMsg('');
                  }}
                  placeholder={lang === 'bn' ? 'হাতে মোট ফ্ল্যাট লিখুন (যেমন: ১২)' : 'Enter flats (e.g. 12)'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081B38] border border-cyan-900 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(2);
              }}
              className="px-4 py-2.5 rounded-xl border border-cyan-900/60 bg-[#06152B] hover:bg-[#0A2244] text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep3Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#040D1A] font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 04 — LOCATION & ADDRESS                                   */}
      {/* ============================================================== */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৪ — এলাকা ও ঠিকানা' : 'Step 4 — Service Area'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? 'আপনার এলাকা ও ঠিকানা দিন' : 'Enter Your Location in Dhaka'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' ? 'ঢাকায় আমাদের মোবাইল টিম দ্রুত পৌঁছানোর জন্য সঠিক এলাকা নির্বাচন করুন।' : 'We provide water tank cleaning across all zones in Dhaka.'}
            </p>
          </div>

          {/* Quick Select Area Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">
              {lang === 'bn' ? 'জনপ্রিয় এলাকা নির্বাচন করুন:' : 'Select Area:'}
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {POPULAR_DHAKA_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    setSelectedArea(area);
                    setCustomArea('');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedArea === area
                      ? 'bg-cyan-500 text-[#040D1A] font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-[#06152B] text-slate-300 hover:bg-[#092040] border border-cyan-900/60'
                  }`}
                >
                  {area}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('অন্যান্য');
                  setErrorMsg('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedArea === 'অন্যান্য'
                    ? 'bg-cyan-500 text-[#040D1A] font-bold'
                    : 'bg-[#06152B] text-slate-300 hover:bg-[#092040] border border-cyan-900/60'
                }`}
              >
                {lang === 'bn' ? 'অন্যান্য এলাকা' : 'Other Area'}
              </button>
            </div>
          </div>

          {/* Custom Area Input */}
          {(selectedArea === 'অন্যান্য' || !selectedArea) && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'আপনার এলাকার নাম লিখুন *' : 'Enter Area Name *'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => {
                    setCustomArea(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={lang === 'bn' ? 'উদা: বসুন্ধরা আবাসিক, মিরপুর-১০, উত্তরা সেক্টর-৪' : 'e.g. Uttara Sector 7, Bashundhara R/A'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#06152B] border border-cyan-900 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Detailed Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'বাসা / হোল্ডিং নং (ঐচ্ছিক):' : 'House / Holding No (Optional):'}
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder={lang === 'bn' ? 'বাসা নং' : 'House #'}
                className="w-full px-3 py-2 rounded-xl bg-[#06152B] border border-cyan-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'রোড / ব্লক / লেন (ঐচ্ছিক):' : 'Road / Block (Optional):'}
              </label>
              <input
                type="text"
                value={roadNumber}
                onChange={(e) => setRoadNumber(e.target.value)}
                placeholder={lang === 'bn' ? 'রোড / ব্লক নং' : 'Road # / Block'}
                className="w-full px-3 py-2 rounded-xl bg-[#06152B] border border-cyan-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'থানা (ঐচ্ছিক):' : 'Thana (Optional):'}
              </label>
              <input
                type="text"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                placeholder={lang === 'bn' ? 'থানা' : 'Thana'}
                className="w-full px-3 py-2 rounded-xl bg-[#06152B] border border-cyan-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'পোস্টাল কোড (ঐচ্ছিক):' : 'Postal Code (Optional):'}
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ১২১২, ১২৩০' : 'e.g. 1212, 1230'}
                className="w-full px-3 py-2 rounded-xl bg-[#06152B] border border-cyan-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'ল্যান্ডমার্ক বা নিকটবর্তী স্থান (ঐচ্ছিক):' : 'Landmark (Optional):'}
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={lang === 'bn' ? 'মসজিদের পাশে / স্কুলের বিপরীতে' : 'Near Mosque / Opposite School'}
                className="w-full px-3 py-2 rounded-xl bg-[#06152B] border border-cyan-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(3);
              }}
              className="px-4 py-2.5 rounded-xl border border-cyan-900/60 bg-[#06152B] hover:bg-[#0A2244] text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep4Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#040D1A] font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 05 — ADD-ONS, SCHEDULE & REVIEW                           */}
      {/* ============================================================== */}
      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৫ — অতিরিক্ত সেবা ও নিশ্চিতকরণ' : 'Step 5 — Add-ons & Review'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? 'আপনার রিকোয়েস্ট পর্যালোচনা করুন' : 'Review & Confirm Booking'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' 
                ? 'ঐচ্ছিক সেবা নির্বাচন করুন এবং পছন্দমতো শিডিউলের তারিখ দিন।' 
                : 'Select any add-on services and confirm your booking request.'}
            </p>
          </div>

          {/* Optional Additional Services */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              {lang === 'bn' ? 'অতিরিক্ত সেবা যোগ করুন (ঐচ্ছিক):' : 'Optional Additional Services:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Addon 1: Pipeline Cleaning */}
              <button
                type="button"
                onClick={() => setPipelineCleaning(!pipelineCleaning)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  pipelineCleaning
                    ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                    : 'bg-[#06152B] hover:bg-[#092040] border-cyan-900/60'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${pipelineCleaning ? 'bg-cyan-400 border-cyan-400 text-[#040D1A]' : 'border-slate-600'}`}>
                  {pipelineCleaning && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'পানির পাইপলাইন পরিষ্কার' : 'Pipeline Cleaning'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {lang === 'bn' ? 'দেয়াল না ভেঙে লাইনের আয়রন ও মরিচা ফ্লাশিং' : 'Non-invasive hydro-pulse descaling'}
                  </p>
                </div>
              </button>

              {/* Addon 2: AMC Contract */}
              <button
                type="button"
                onClick={() => setAnnualContract(!annualContract)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  annualContract
                    ? 'bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-[#06152B] hover:bg-[#092040] border-cyan-900/60'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${annualContract ? 'bg-emerald-400 border-emerald-400 text-[#040D1A]' : 'border-slate-600'}`}>
                  {annualContract && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'বার্ষিক চুক্তি (AMC Package)' : 'Annual Contract (AMC)'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {lang === 'bn' ? 'বছরে ২-৪ বার নিয়মিত পরিষ্কারে বিশেষ ছাড়' : 'Year-round scheduled maintenance'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Preferred Date & Time (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#06152B] p-4 rounded-xl border border-cyan-900/50">
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'পছন্দের তারিখ (ঐচ্ছিক):' : 'Preferred Date (Optional):'}
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#081B38] border border-cyan-900 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {lang === 'bn' ? 'পছন্দের সময় (ঐচ্ছিক):' : 'Preferred Time (Optional):'}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#081B38] border border-cyan-900 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="">{lang === 'bn' ? 'যেকোনো সময় (Flexible)' : 'Anytime (Flexible)'}</option>
                <option value="Morning (8:00 AM - 12:00 PM)">{lang === 'bn' ? 'সকাল (৮:০০ - ১২:০০)' : 'Morning (8am - 12pm)'}</option>
                <option value="Afternoon (12:00 PM - 4:00 PM)">{lang === 'bn' ? 'দুপুর (১২:০০ - ৪:০০)' : 'Afternoon (12pm - 4pm)'}</option>
                <option value="Evening (4:00 PM - 8:00 PM)">{lang === 'bn' ? 'বিকাল / সন্ধ্যা (৪:০০ - ৮:০০)' : 'Evening (4pm - 8pm)'}</option>
              </select>
            </div>
          </div>

          {/* Quick Summary Card & Estimated Price */}
          <div className="bg-[#06152B] p-4 sm:p-5 rounded-2xl border border-cyan-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {lang === 'bn' ? 'সার্ভিস রিকোয়েস্ট সারসংক্ষেপ:' : 'Quotation Summary:'}
              </h4>
              <span className="text-[11px] text-slate-400">
                {customerName.trim()} ({normalizeBangladeshiPhone(customerPhone)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-cyan-500 mr-1">•</span>
                <span className="text-white font-medium">{lang === 'bn' ? 'ট্যাংক:' : 'Tank:'}</span>{' '}
                {tankType === 'overhead' ? 'ওভারহেড ট্যাংক' : tankType === 'underground' ? 'আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক' : 'উভয় ট্যাংক'}
              </div>
              <div>
                <span className="text-cyan-500 mr-1">•</span>
                <span className="text-white font-medium">{lang === 'bn' ? 'ক্যাপাসিটি:' : 'Capacity:'}</span>{' '}
                {tankType === 'both' ? `ছাদ: ${getOverheadCapacityString()}, নিচ: ${getUndergroundCapacityString()}` : (tankType === 'overhead' ? getOverheadCapacityString() : getUndergroundCapacityString())}
              </div>
              <div>
                <span className="text-cyan-500 mr-1">•</span>
                <span className="text-white font-medium">{lang === 'bn' ? 'এলাকা:' : 'Area:'}</span> {getEffectiveArea()}
              </div>
              {(customFloors || customFlats) && (
                <div>
                  <span className="text-cyan-500 mr-1">•</span>
                  <span className="text-white font-medium">{lang === 'bn' ? 'ভবন:' : 'Building:'}</span>{' '}
                  {[getEffectiveFloors(), getEffectiveFlats()].filter(Boolean).join(', ')}
                </div>
              )}
              {estimateResult.hasSufficientInfo && estimateResult.minPrice && (
                <div className="text-emerald-400 font-bold">
                  <span className="text-emerald-500 mr-1">•</span>
                  <span>{lang === 'bn' ? 'আনুমানিক শুরু:' : 'Est. Start:'}</span> ৳{estimateResult.minPrice.toLocaleString()} {lang === 'bn' ? 'থেকে' : 'start'}
                </div>
              )}
            </div>
          </div>

          {/* Final Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(4);
              }}
              className="min-h-[46px] px-5 py-2.5 rounded-xl border border-cyan-900/60 bg-[#06152B] hover:bg-[#0A2244] text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitFinal}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial min-h-[50px] px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-600/30 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Confirming Booking...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট নিশ্চিত করুন' : 'Confirm & Request Quote'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 06 — SUBMISSION SUCCESS                                   */}
      {/* ============================================================== */}
      {step === 6 && (
        <div className="space-y-6 text-center py-4 sm:py-6 animate-fadeIn">
          {/* Success Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            {confirmedLeadNumber && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {lang === 'bn' ? `রেফারেন্স নম্বর: ${confirmedLeadNumber}` : `Booking Ref: ${confirmedLeadNumber}`}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'bn' ? 'আপনার কোটেশন রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!' : 'Quote Request Received!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'bn' 
                ? `ধন্যবাদ ${customerName}! আমাদের টেকনিক্যাল টিম আপনার তথ্য পেয়ে গেছে। দ্রুত চূড়ান্ত কোটেশন ও শিডিউলের জন্য নিচের বাটনে ক্লিক করে সরাসরি WhatsApp এ মেসেজ পাঠান।`
                : `Thank you ${customerName}! Our crew has received your details. For instant confirmation, connect directly via WhatsApp.`}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="max-w-md mx-auto pt-2 flex flex-col gap-3">
            {/* Primary WhatsApp Action to 01609999612 */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'quote_wizard_success' })}
              className="min-h-[50px] px-6 py-3.5 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] active:bg-[#1c9250] text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-[#28C76F]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>{lang === 'bn' ? 'WhatsApp এ মেসেজ পাঠান (01609-999612)' : 'Send to WhatsApp (01609-999612)'}</span>
            </a>

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${business.phone}`}
              className="min-h-[46px] px-6 py-3 rounded-xl bg-[#06152B] hover:bg-[#0A2244] text-white border border-cyan-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? `জরুরি হেল্পলাইনে কল করুন: ${business.displayPhone}` : `Call Hotline: ${business.displayPhone}`}</span>
            </a>

            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="mt-2 text-xs text-slate-400 hover:text-white underline cursor-pointer py-1"
              >
                {lang === 'bn' ? 'উইন্ডো বন্ধ করুন' : 'Close Window'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartQuoteWizard;
