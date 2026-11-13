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
import { createLead, saveOrUpdatePartialLead, getLeadDraft, saveLeadDraft, clearLeadDraft, generateIdempotencyKey } from '../services/leadService';
import { trackFormStarted, trackFormStepCompleted, trackLeadSaved, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';
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
  // Step 1: Contact Information (First Step with draft restore)
  const existingDraft = React.useMemo(() => getLeadDraft(), []);
  const [step, setStep] = useState<number>(1);
  const [capturedLeadId, setCapturedLeadId] = useState<string | null>(() => existingDraft?.leadId || null);
  const [ownershipToken, setOwnershipToken] = useState<string | null>(() => existingDraft?.ownershipToken || null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [confirmedLeadNumber, setConfirmedLeadNumber] = useState<string>('');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Sync across tabs or autosave events
  useEffect(() => {
    const handleIdSync = (e: any) => {
      if (e.detail?.leadId) {
        setCapturedLeadId(e.detail.leadId);
      }
      if (e.detail?.ownershipToken) {
        setOwnershipToken(e.detail.ownershipToken);
      }
    };
    window.addEventListener('sunviloz_lead_id_synced', handleIdSync);
    return () => window.removeEventListener('sunviloz_lead_id_synced', handleIdSync);
  }, []);

  const [customerName, setCustomerName] = useState<string>(() => existingDraft?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(() => existingDraft?.phone || '');

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
    const effectiveName = trimmedName || 'Website Visitor';

    // Save lead IMMEDIATELY as Incomplete Lead so drop-offs can be followed up by admin!
    setIsSubmitting(true);
    try {
      const draft = getLeadDraft();
      const effectiveIdemKey = draft?.idempotencyKey || generateIdempotencyKey();
      const partialLead = await saveOrUpdatePartialLead(capturedLeadId, {
        name: effectiveName,
        phone: normalized,
        whatsapp: normalized,
        area: getEffectiveArea(),
        status: 'Incomplete',
        isAbandoned: true,
        completionStep: 1,
        lastActiveStepName: 'Step 1 - Contact Captured',
        source: (sourceContext || 'Website Booking Wizard') as any
      }, ownershipToken, effectiveIdemKey);

      if (partialLead?.id) {
        setCapturedLeadId(partialLead.id);
        const token = (partialLead as any).ownershipToken || ownershipToken;
        if (token) setOwnershipToken(token);
        saveLeadDraft({
          ...(getLeadDraft() || {}),
          name: trimmedName,
          phone: normalized,
          leadId: partialLead.id,
          ownershipToken: token,
          idempotencyKey: (partialLead as any).idempotencyKey || effectiveIdemKey
        });
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
      }, ownershipToken).catch(() => {});
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
      }, ownershipToken).catch(() => {});
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
      }, ownershipToken).catch(() => {});
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
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
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
        status: 'New', // Confirmed full submission
        isAbandoned: false,
        completionStep: 5,
        lastActiveStepName: 'Completed Booking Request',
        source: (sourceContext || 'Website Booking Form') as any
      };

      // Reliably save complete lead to Supabase (and local storage fallback)
      // Passing capturedLeadId & ownershipToken ensures completing an incomplete lead updates the SAME database record securely!
      const savedLead = await createLead(fullLeadPayload as any, sourceContext || 'Website Booking Form', capturedLeadId, ownershipToken);
      const leadNum = savedLead.leadNumber || 'SVC-' + Math.floor(100000 + Math.random() * 900000);

      // Generate WhatsApp Link
      const rawNumber = (business.whatsappNumber || '8801609999612').replace(/\D/g, '');
      const msg = buildWhatsAppMessage(leadNum);
      const generatedWaUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
      setWhatsappUrl(generatedWaUrl);

      if (!savedLead.isSyncedToCloud) {
        setIsCloudSynced(false);
        setErrorMsg(
          lang === 'bn'
            ? 'সার্ভারে রিকোয়েস্ট সংরক্ষণ করা যায়নি। অনুগ্রহ করে নিচের "পুনরায় চেষ্টা করুন" বাটনে ক্লিক করুন অথবা সরাসরি WhatsApp-এ কোটেশন নিন।'
            : 'Could not sync your request to the server. Please retry or send your details directly on WhatsApp.'
        );
        return;
      }

      setConfirmedLeadNumber(leadNum);
      setIsCloudSynced(true);
      clearLeadDraft();

      trackLeadSaved(leadNum, { phone: normalizedPhone, leadNum, source: sourceContext, service: fullLeadPayload.serviceType, area: fullLeadPayload.area });

      // Transition to Success Screen
      setStep(6);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(lang === 'bn'
        ? 'তথ্য পাঠাতে কিছুটা সমস্যা হয়েছে। নিচের বাটনে পুনরায় চেষ্টা করুন অথবা সরাসরি WhatsApp-এ বার্তা পাঠান।'
        : 'There was an issue sending your details. Please retry below or message directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Popular Area Chips for quick selection (Dhaka, Narayanganj, Gazipur, Savar)
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
    'Old Dhaka',
    'Narayanganj',
    'Gazipur',
    'Savar'
  ];

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transition-all duration-300 relative border-t-4 border-t-[#0D9488] ${compact ? 'p-4 sm:p-6' : 'p-6 sm:p-8 lg:p-10'}`}
    >
      {/* Step Progress Indicator (Steps 1 to 5) */}
      {step <= 5 && (
        <div className="mb-6 sm:mb-8 border-b border-[#E2E8F0] pb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2.5">
            <span className="flex items-center gap-1.5 font-bold text-[#123047]">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              <span>{lang === 'bn' ? `ধাপ 0${step} / 05` : `Step ${step} of 5`}</span>
            </span>
            <span className="text-[11px] text-[#0D9488] font-bold font-mono">
              {step === 1 && (lang === 'bn' ? '১. নাম ও মোবাইল নম্বর' : '1. Name & Mobile')}
              {step === 2 && (lang === 'bn' ? '২. ট্যাংকের ধরন' : '2. Tank Selection')}
              {step === 3 && (lang === 'bn' ? '৩. ধারণক্ষমতা ও বিবরণ' : '3. Capacity Details')}
              {step === 4 && (lang === 'bn' ? '৪. এলাকা ও ঠিকানা' : '4. Location & Address')}
              {step === 5 && (lang === 'bn' ? '৫. সেবা ও নিশ্চিতকরণ' : '5. Add-ons & Review')}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#F5FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
            <div 
              className="h-full bg-gradient-to-r from-[#0D9488] via-[#38BDF8] to-[#0D9488] transition-all duration-500 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Global Error Alert Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
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
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 uppercase tracking-wider">
                {lang === 'bn' ? 'ধাপ ০১ — দ্রুত শুরু' : 'Step 1 — Quick Start'}
              </span>
              <span className="text-[11px] text-[#16A34A] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'তথ্য সম্পূর্ণ সুরক্ষিত' : 'Privacy Protected'}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'মোবাইল নম্বর ও নাম (ঐচ্ছিক) লিখুন' : 'Enter Mobile Number & Name (Optional)'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {lang === 'bn'
                ? 'সঠিক কোটেশন পেতে আপনার সক্রিয় মোবাইল নম্বর দিয়ে এগিয়ে যান।'
                : 'Get an accurate estimate quickly. Enter your mobile number to continue.'}
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Customer Name (Optional) */}
            <div>
              <label className="text-xs font-semibold text-[#172B3A] block mb-1.5">
                {lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder={lang === 'bn' ? 'উদা: মোঃ আরিফুল ইসলাম (ঐচ্ছিক)' : 'e.g. Md. Ariful Islam (Optional)'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 text-[#172B3A] text-sm focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-semibold text-[#172B3A] block mb-1.5">
                {lang === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Number (11 Digits) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="01XXXXXXXXX বা +8801XXXXXXXXX"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-[#172B3A] text-sm focus:outline-none transition-colors ${
                    phoneError 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-[#64748B] mt-1">
                  {lang === 'bn' 
                    ? 'WhatsApp সক্রিয় নম্বর হলে কোটেশন ও ফটো পাঠানো অনেক দ্রুত হয়।' 
                    : 'WhatsApp-enabled numbers allow instant quotation photos & updates.'}
                </p>
              )}
            </div>
          </div>

          {/* Privacy & Trust assurance pill */}
          <div className="p-3 bg-[#F5FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5 text-xs text-[#64748B]">
            <Lock className="w-4 h-4 text-[#0D9488] shrink-0" />
            <span>
              {lang === 'bn'
                ? 'আপনার তথ্যের সম্পূর্ণ গোপনীয়তা বজায় রাখা হয়। কোনো অযাচিত কল দেওয়া হবে না।'
                : 'Your contact details are kept strictly confidential. Zero spam calls.'}
            </span>
          </div>

          {/* First-Step CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStep1Submit}
              disabled={isSubmitting}
              className="w-full min-h-[50px] px-6 py-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0D9488]/20 active:scale-[0.99] disabled:opacity-50"
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
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
                {lang === 'bn' ? 'ধাপ ০২ — ট্যাংক নির্বাচন' : 'Step 2 — Tank Selection'}
              </span>
              <span className="text-[11px] text-[#64748B]">
                ({customerName.trim()})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'আপনার কোন ধরনের ট্যাংক পরিষ্কার করতে চান?' : 'Which tank do you need cleaned?'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
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
                  ? 'bg-[#E8F5F3] border-[#0D9488] ring-2 ring-[#0D9488]/30 shadow-md'
                  : 'bg-[#F5FAFC] hover:bg-white border-[#E2E8F0] hover:border-[#0D9488]/50'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#0D9488] flex items-center justify-center mb-3 shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#123047] mb-1">
                  {lang === 'bn' ? 'ওভারহেড ট্যাংক' : 'Overhead Tank'}
                </h3>
                <p className="text-xs text-[#64748B] leading-snug">
                  {lang === 'bn' ? 'ছাদের ওপরের পিভিসি বা আরসিসি পানির ট্যাংক' : 'Rooftop PVC or RCC overhead tank'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#0D9488] font-bold">{lang === 'bn' ? 'ছাদের ট্যাংক' : 'Rooftop'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'overhead' ? 'bg-[#0D9488] border-[#0D9488] text-white' : 'border-[#CBD5E1]'}`}>
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
                  ? 'bg-[#E8F5F3] border-[#0D9488] ring-2 ring-[#0D9488]/30 shadow-md'
                  : 'bg-[#F5FAFC] hover:bg-white border-[#E2E8F0] hover:border-[#0D9488]/50'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#0D9488] flex items-center justify-center mb-3 shadow-sm">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#123047] mb-1">
                  {lang === 'bn' ? 'আন্ডারগ্রাউন্ড ট্যাংক' : 'Underground Tank'}
                </h3>
                <p className="text-xs text-[#64748B] leading-snug">
                  {lang === 'bn' ? 'নিচতলা বা ভূগর্ভস্থ রিজার্ভার ট্যাংক' : 'Ground floor or underground reserve'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#0D9488] font-bold">{lang === 'bn' ? 'ভূগর্ভস্থ' : 'Underground'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'underground' ? 'bg-[#0D9488] border-[#0D9488] text-white' : 'border-[#CBD5E1]'}`}>
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
                  ? 'bg-[#E8F5F3] border-[#0D9488] ring-2 ring-[#0D9488]/30 shadow-md'
                  : 'bg-[#F5FAFC] hover:bg-white border-[#E2E8F0] hover:border-[#0D9488]/50'
              }`}
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B] text-white">
                {lang === 'bn' ? 'জনপ্রিয় প্যাকেজ' : 'Best Value'}
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#0D9488] flex items-center justify-center mb-3 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#123047] mb-1">
                  {lang === 'bn' ? 'উভয় ট্যাংক (ছাদ + নিচ)' : 'Both Tanks'}
                </h3>
                <p className="text-xs text-[#64748B] leading-snug">
                  {lang === 'bn' ? 'ওভারহেড ও আন্ডারগ্রাউন্ড যৌথ ক্লিনিং' : 'Full overhead + underground system'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#0D9488] font-bold">{lang === 'bn' ? 'কম্বো সার্ভিস' : 'Combo'}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tankType === 'both' ? 'bg-[#0D9488] border-[#0D9488] text-white' : 'border-[#CBD5E1]'}`}>
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
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5FAFC] hover:bg-white text-[#123047] text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep2Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0D9488]/20"
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
            <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৩ — ধারণক্ষমতা ও বিবরণ' : 'Step 3 — Tank Capacity'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'ট্যাংকের আনুমানিক ধারণক্ষমতা কত?' : 'Estimated Tank Capacity?'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {lang === 'bn' ? 'ধারণক্ষমতা জানা না থাকলে "জানা নেই" বেছে নিন।' : 'If unsure, select "I Don\'t Know" to estimate based on floors.'}
            </p>
          </div>

          {/* Section A: Overhead Tank Capacity */}
          {(tankType === 'overhead' || tankType === 'both') && (
            <div className={`space-y-3 bg-[#F5FAFC] p-4 sm:p-5 rounded-2xl border transition-all ${
              isUndergroundUnknown && tankType === 'both' 
                ? 'border-[#E2E8F0] bg-[#F5FAFC]/80' 
                : 'border-[#E2E8F0]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0D9488]" />
                  <h3 className="text-sm font-bold text-[#123047]">
                    {lang === 'bn' ? 'ওভারহেড (ছাদের) ট্যাংকের সাইজ:' : 'Overhead (Rooftop) Tank Size:'}
                  </h3>
                </div>
                {isUndergroundUnknown && tankType === 'both' && (
                  <span className="text-[11px] font-semibold text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
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
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-80'
                        : 'bg-white text-[#172B3A] border-[#E2E8F0] focus:border-[#0D9488] placeholder-[#64748B]/50'
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
                      ? 'bg-[#F59E0B] text-white border-amber-500 font-extrabold shadow-sm'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#123047]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isOverheadUnknown ? 'border-white bg-white text-[#F59E0B]' : 'border-[#CBD5E1]'
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
            <div className={`space-y-3 bg-[#F5FAFC] p-4 sm:p-5 rounded-2xl border transition-all ${
              isOverheadUnknown && tankType === 'both' 
                ? 'border-[#E2E8F0] bg-[#F5FAFC]/80' 
                : 'border-[#E2E8F0]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#0D9488]" />
                  <h3 className="text-sm font-bold text-[#123047]">
                    {lang === 'bn' ? 'আন্ডারগ্রাউন্ড রিজার্ভার ট্যাংকের সাইজ:' : 'Underground Reservoir Size:'}
                  </h3>
                </div>
                {isOverheadUnknown && tankType === 'both' && (
                  <span className="text-[11px] font-semibold text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
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
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-80'
                        : 'bg-white text-[#172B3A] border-[#E2E8F0] focus:border-[#0D9488] placeholder-[#64748B]/50'
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
                      ? 'bg-[#F59E0B] text-white border-amber-500 font-extrabold shadow-sm'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#123047]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isUndergroundUnknown ? 'border-white bg-white text-[#F59E0B]' : 'border-[#CBD5E1]'
                  }`}>
                    {isUndergroundUnknown ? '✓' : ''}
                  </span>
                  <span>{lang === 'bn' ? 'জানা নাই' : "I Don't Know"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section C: ভবনের বিবরণ */}
          <div className={`space-y-4 p-4 sm:p-5 rounded-2xl border transition-all ${
            hasAnyUnknown 
              ? 'bg-[#E8F5F3] border-[#0D9488]/40 ring-1 ring-[#0D9488]/20' 
              : 'bg-[#F5FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-sm font-bold text-[#123047]">
                  {lang === 'bn' ? 'ভবনের বিবরণ (ক্যাপাসিটি নির্ণয়ের জন্য):' : 'Building Info (for estimation):'}
                </h3>
              </div>
              {hasAnyUnknown && (
                <span className="text-[11px] font-bold text-[#0D9488] bg-white px-2.5 py-0.5 rounded-full border border-[#0D9488]/30">
                  {lang === 'bn' ? 'ট্যাংকের সাইজ অজানা থাকায় এটি আবশ্যক' : 'Required for capacity calculation'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#172B3A] block mb-1 font-semibold">
                  {lang === 'bn' ? 'ভবনের তলা সংখ্যা:' : 'Total Floors:'} {hasAnyUnknown && <span className="text-red-500">*</span>}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs sm:text-sm focus:outline-none focus:border-[#0D9488] placeholder-[#64748B]/50"
                />
              </div>

              <div>
                <label className="text-xs text-[#172B3A] block mb-1 font-semibold">
                  {lang === 'bn' ? 'মোট ফ্ল্যাট সংখ্যা:' : 'Total Flats:'} {hasAnyUnknown && <span className="text-red-500">*</span>}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs sm:text-sm focus:outline-none focus:border-[#0D9488] placeholder-[#64748B]/50"
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
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5FAFC] hover:bg-white text-[#123047] text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep3Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0D9488]/20"
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
            <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৪ — এলাকা ও ঠিকানা' : 'Step 4 — Service Area'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'আপনার এলাকা ও ঠিকানা দিন' : 'Enter Your Location in Dhaka'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {lang === 'bn' ? 'ঢাকায় আমাদের মোবাইল টিম দ্রুত পৌঁছানোর জন্য সঠিক এলাকা নির্বাচন করুন।' : 'We provide water tank cleaning across all zones in Dhaka.'}
            </p>
          </div>

          {/* Quick Select Area Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#172B3A] block">
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
                      ? 'bg-[#0D9488] text-white font-bold shadow-sm'
                      : 'bg-[#F5FAFC] text-[#172B3A] hover:bg-white border border-[#E2E8F0]'
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
                    ? 'bg-[#0D9488] text-white font-bold'
                    : 'bg-[#F5FAFC] text-[#172B3A] hover:bg-white border border-[#E2E8F0]'
                }`}
              >
                {lang === 'bn' ? 'অন্যান্য এলাকা' : 'Other Area'}
              </button>
            </div>
          </div>

          {/* Custom Area Input */}
          {(selectedArea === 'অন্যান্য' || !selectedArea) && (
            <div>
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'আপনার এলাকার নাম লিখুন *' : 'Enter Area Name *'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#0D9488] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => {
                    setCustomArea(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={lang === 'bn' ? 'উদা: বসুন্ধরা আবাসিক, মিরপুর-১০, উত্তরা সেক্টর-৪' : 'e.g. Uttara Sector 7, Bashundhara R/A'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
                />
              </div>
            </div>
          )}

          {/* Detailed Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'বাসা / হোল্ডিং নং (ঐচ্ছিক):' : 'House / Holding No (Optional):'}
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder={lang === 'bn' ? 'বাসা নং' : 'House #'}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'রোড / ব্লক / লেন (ঐচ্ছিক):' : 'Road / Block (Optional):'}
              </label>
              <input
                type="text"
                value={roadNumber}
                onChange={(e) => setRoadNumber(e.target.value)}
                placeholder={lang === 'bn' ? 'রোড / ব্লক নং' : 'Road # / Block'}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'থানা (ঐচ্ছিক):' : 'Thana (Optional):'}
              </label>
              <input
                type="text"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                placeholder={lang === 'bn' ? 'থানা' : 'Thana'}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'পোস্টাল কোড (ঐচ্ছিক):' : 'Postal Code (Optional):'}
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ১২১২, ১২৩০' : 'e.g. 1212, 1230'}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-[#172B3A] block mb-1">
                {lang === 'bn' ? 'ল্যান্ডমার্ক বা নিকটবর্তী স্থান (ঐচ্ছিক):' : 'Landmark (Optional):'}
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={lang === 'bn' ? 'মসজিদের পাশে / স্কুলের বিপরীতে' : 'Near Mosque / Opposite School'}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
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
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5FAFC] hover:bg-white text-[#123047] text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleStep4Next}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0D9488]/20"
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
            <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
              {lang === 'bn' ? 'ধাপ ০৫ — অতিরিক্ত সেবা ও নিশ্চিতকরণ' : 'Step 5 — Add-ons & Review'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'আপনার রিকোয়েস্ট পর্যালোচনা করুন' : 'Review & Confirm Booking'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {lang === 'bn' 
                ? 'ঐচ্ছিক সেবা নির্বাচন করুন এবং পছন্দমতো শিডিউলের তারিখ দিন।' 
                : 'Select any add-on services and confirm your booking request.'}
            </p>
          </div>

          {/* Optional Additional Services */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              {lang === 'bn' ? 'অতিরিক্ত সেবা যোগ করুন (ঐচ্ছিক):' : 'Optional Additional Services:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Addon 1: Pipeline Cleaning */}
              <button
                type="button"
                onClick={() => setPipelineCleaning(!pipelineCleaning)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  pipelineCleaning
                    ? 'bg-[#E8F5F3] border-[#0D9488] ring-1 ring-[#0D9488]'
                    : 'bg-[#F5FAFC] hover:bg-white border-[#E2E8F0]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${pipelineCleaning ? 'bg-[#0D9488] border-[#0D9488] text-white' : 'border-[#CBD5E1]'}`}>
                  {pipelineCleaning && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#123047] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>{lang === 'bn' ? 'পানির পাইপলাইন পরিষ্কার' : 'Pipeline Cleaning'}</span>
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
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
                    ? 'bg-[#E8F5F3] border-[#0D9488] ring-1 ring-[#0D9488]'
                    : 'bg-[#F5FAFC] hover:bg-white border-[#E2E8F0]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${annualContract ? 'bg-[#0D9488] border-[#0D9488] text-white' : 'border-[#CBD5E1]'}`}>
                  {annualContract && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#123047] flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>{lang === 'bn' ? 'বার্ষিক চুক্তি (AMC Package)' : 'Annual Contract (AMC)'}</span>
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                    {lang === 'bn' ? 'বছরে ২-৪ বার নিয়মিত পরিষ্কারে বিশেষ ছাড়' : 'Year-round scheduled maintenance'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Preferred Date & Time (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <div>
              <label className="text-xs text-[#172B3A] block mb-1 font-semibold">
                {lang === 'bn' ? 'পছন্দের তারিখ (ঐচ্ছিক):' : 'Preferred Date (Optional):'}
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              />
            </div>
            <div>
              <label className="text-xs text-[#172B3A] block mb-1 font-semibold">
                {lang === 'bn' ? 'পছন্দের সময় (ঐচ্ছিক):' : 'Preferred Time (Optional):'}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#172B3A] text-xs focus:outline-none focus:border-[#0D9488]"
              >
                <option value="">{lang === 'bn' ? 'যেকোনো সময় (Flexible)' : 'Anytime (Flexible)'}</option>
                <option value="Morning (8:00 AM - 12:00 PM)">{lang === 'bn' ? 'সকাল (৮:০০ - ১২:০০)' : 'Morning (8am - 12pm)'}</option>
                <option value="Afternoon (12:00 PM - 4:00 PM)">{lang === 'bn' ? 'দুপুর (১২:০০ - ৪:০০)' : 'Afternoon (12pm - 4pm)'}</option>
                <option value="Evening (4:00 PM - 8:00 PM)">{lang === 'bn' ? 'বিকাল / সন্ধ্যা (৪:০০ - ৮:০০)' : 'Evening (4pm - 8pm)'}</option>
              </select>
            </div>
          </div>

          {/* Quick Summary Card & Estimated Price */}
          <div className="bg-[#F5FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                {lang === 'bn' ? 'সার্ভিস রিকোয়েস্ট সারসংক্ষেপ:' : 'Quotation Summary:'}
              </h4>
              <span className="text-[11px] text-[#64748B] font-medium">
                {customerName.trim()} ({normalizeBangladeshiPhone(customerPhone)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#172B3A]">
              <div>
                <span className="text-[#0D9488] mr-1">•</span>
                <span className="font-semibold text-[#123047]">{lang === 'bn' ? 'ট্যাংক:' : 'Tank:'}</span>{' '}
                {tankType === 'overhead' ? 'ওভারহেড ট্যাংক' : tankType === 'underground' ? 'আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক' : 'উভয় ট্যাংক'}
              </div>
              <div>
                <span className="text-[#0D9488] mr-1">•</span>
                <span className="font-semibold text-[#123047]">{lang === 'bn' ? 'ক্যাপাসিটি:' : 'Capacity:'}</span>{' '}
                {tankType === 'both' ? `ছাদ: ${getOverheadCapacityString()}, নিচ: ${getUndergroundCapacityString()}` : (tankType === 'overhead' ? getOverheadCapacityString() : getUndergroundCapacityString())}
              </div>
              <div>
                <span className="text-[#0D9488] mr-1">•</span>
                <span className="font-semibold text-[#123047]">{lang === 'bn' ? 'এলাকা:' : 'Area:'}</span> {getEffectiveArea()}
              </div>
              {(customFloors || customFlats) && (
                <div>
                  <span className="text-[#0D9488] mr-1">•</span>
                  <span className="font-semibold text-[#123047]">{lang === 'bn' ? 'ভবন:' : 'Building:'}</span>{' '}
                  {[getEffectiveFloors(), getEffectiveFlats()].filter(Boolean).join(', ')}
                </div>
              )}
              {estimateResult.hasSufficientInfo && estimateResult.minPrice && (
                <div className="text-[#16A34A] font-bold">
                  <span className="text-[#16A34A] mr-1">•</span>
                  <span>{lang === 'bn' ? 'আনুমানিক শুরু:' : 'Est. Start:'}</span> ৳{estimateResult.minPrice.toLocaleString()} {lang === 'bn' ? 'থেকে' : 'start'}
                </div>
              )}
            </div>
          </div>

          {/* Submission Error Banner with Retry */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Submission'}
                </button>
                <a
                  href={`https://wa.me/8801609999612?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Final Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(4);
              }}
              className="min-h-[46px] px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5FAFC] hover:bg-white text-[#123047] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitFinal}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial min-h-[50px] px-8 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0D9488]/20 active:scale-[0.99] disabled:opacity-50"
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
          <div className="w-16 h-16 rounded-2xl bg-[#E8F5F3] border border-[#0D9488]/30 text-[#0D9488] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-[#0D9488]" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            {confirmedLeadNumber && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30">
                  {lang === 'bn' ? `রেফারেন্স নম্বর: ${confirmedLeadNumber}` : `Booking Ref: ${confirmedLeadNumber}`}
                </span>
                {isCloudSynced ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'সার্ভারে সংরক্ষিত' : 'Synced to Cloud'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'অফলাইন ব্যাকআপ' : 'Local Backup'}</span>
                  </span>
                )}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'অনুরোধ গ্রহণ করা হয়েছে!' : 'Quote Request Received!'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {lang === 'bn'
                ? `ধন্যবাদ ${customerName.trim() || ''}! আমাদের টেকনিক্যাল টিম আপনার তথ্য পেয়েছে। দ্রুত কোটেশন ও শিডিউলের জন্য সরাসরি WhatsApp-এ মেসেজ পাঠান।`
                : `Thank you ${customerName.trim() || ''}! Our crew has received your details. Connect directly via WhatsApp for quick scheduling.`}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="max-w-md mx-auto pt-2 flex flex-col gap-3">
            {/* Primary WhatsApp Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'quote_wizard_success', leadNumber: confirmedLeadNumber })}
              className="min-h-[50px] px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1c9250] text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>{lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন (01609-999612)' : 'Get Quote on WhatsApp (01609-999612)'}</span>
            </a>

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${business.phone}`}
              onClick={() => trackPhoneClick({ source: 'quote_wizard_success' })}
              className="min-h-[46px] px-6 py-3 rounded-xl bg-[#123047] hover:bg-[#1b4363] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>{lang === 'bn' ? `সরাসরি কল করুন: ${business.displayPhone}` : `Call Hotline: ${business.displayPhone}`}</span>
            </a>

            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="mt-2 text-xs text-[#64748B] hover:text-[#123047] underline cursor-pointer py-1"
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
