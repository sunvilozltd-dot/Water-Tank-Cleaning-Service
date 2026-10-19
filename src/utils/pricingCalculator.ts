import { QuoteFormData } from '../types';
import { BUSINESS_CONFIG } from '../data/config';

export interface PriceEstimateResult {
  hasSufficientInfo: boolean;
  minPrice?: number;
  maxPrice?: number;
  formattedEstimate: string;
  formattedEstimateBn: string;
  explanationEn: string;
  explanationBn: string;
  isEstimated: true;
  disclaimerEn: string;
  disclaimerBn: string;
}

export interface StructuredRange {
  min: number;
  max: number;
  avg: number;
}

/**
 * Robustly parses range strings such as '5-6', '5–6', '10+', or single numbers
 */
export function parseRangeValue(val?: string | number): StructuredRange {
  if (val === undefined || val === null || val === '') return { min: 0, max: 0, avg: 0 };
  if (typeof val === 'number') return { min: val, max: val, avg: val };
  const str = String(val).trim();
  if (str.endsWith('+')) {
    const num = parseFloat(str.replace('+', '')) || 0;
    return { min: num, max: num * 1.5, avg: num * 1.25 };
  }
  if (str.includes('-') || str.includes('–')) {
    const parts = str.split(/[-–]/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length === 2) {
      return { min: Math.min(parts[0], parts[1]), max: Math.max(parts[0], parts[1]), avg: (parts[0] + parts[1]) / 2 };
    }
  }
  const parsed = parseFloat(str) || 0;
  return { min: parsed, max: parsed, avg: parsed };
}

/**
 * Calculates a reliable price range based strictly on approved Sunviloz Clean Care pricing rules.
 * Never invents prices. When details are insufficient, indicates that quotation requires review.
 */
export function calculateQuoteEstimate(
  data: Partial<QuoteFormData>,
  customPricing?: Partial<typeof BUSINESS_CONFIG.pricing>
): PriceEstimateResult {
  const pricing = { ...BUSINESS_CONFIG.pricing, ...customPricing };
  const disclaimerEn = 'Final price may vary depending on tank size, accessibility, condition, number of tanks and service requirements.';
  const disclaimerBn = 'ট্যাংকের সাইজ, সংখ্যা, অবস্থান ও ময়লার পরিমাণের ওপর ভিত্তি করে চূড়ান্ত কোটেশন নির্ধারিত হয়।';

  // Check if we have at least tankType
  if (!data.tankType) {
    return {
      hasSufficientInfo: false,
      formattedEstimate: 'Quotation upon review',
      formattedEstimateBn: 'বিবরণ পর্যালোচনার পর কোটেশন প্রদান',
      explanationEn: 'Final quotation will be confirmed after reviewing your tank details.',
      explanationBn: 'আপনার ট্যাংকের বিবরণ পর্যালোচনার পর চূড়ান্ত কোটেশন প্রদান করা হবে।',
      isEstimated: true,
      disclaimerEn,
      disclaimerBn
    };
  }

  const numTanks = Math.max(1, data.numberOfTanks || 1);
  const tankType = data.tankType;
  const rawMaterial = data.overheadMaterial || 'PVC';
  const isRcc = rawMaterial.toUpperCase().includes('RCC') || rawMaterial.toUpperCase().includes('CONCRETE');
  const capacity = data.tankCapacity || '';
  const flatsRange = parseRangeValue(data.flats || data.numberOfFlats);
  const floorsRange = parseRangeValue(data.floors);
  const flats = flatsRange.avg;
  const floors = floorsRange.avg;

  let baseMin = 0;
  let baseMax = 0;

  // 1. Determine base by tank type and material
  if (tankType === 'Rooftop Tank') {
    if (isRcc) {
      baseMin = pricing.rooftopRccStartingPrice || 1800;
      baseMax = baseMin + 500;
    } else {
      // PVC or default
      baseMin = pricing.rooftopPvcStartingPrice || 1200;
      baseMax = baseMin + 400;
    }
  } else if (tankType === 'Underground Tank') {
    baseMin = pricing.undergroundStartingPrice || 2500;
    baseMax = baseMin + 800;
  } else if (tankType === 'Both') {
    const roofPart = isRcc ? (pricing.rooftopRccStartingPrice || 1800) : (pricing.rooftopPvcStartingPrice || 1200);
    const underPart = pricing.undergroundStartingPrice || 2500;
    baseMin = roofPart + underPart;
    baseMax = baseMin + 1000;
  } else {
    // 'Not Sure'
    return {
      hasSufficientInfo: false,
      formattedEstimate: 'Quotation upon review',
      formattedEstimateBn: 'বিবরণ পর্যালোচনার পর কোটেশন প্রদান',
      explanationEn: 'Final quotation will be confirmed after reviewing your tank details.',
      explanationBn: 'আপনার ট্যাংকের বিবরণ পর্যালোচনার পর চূড়ান্ত কোটেশন প্রদান করা হবে।',
      isEstimated: true,
      disclaimerEn,
      disclaimerBn
    };
  }

  // 2. Adjust for capacity or building size
  const isUnknownCapacity = !capacity || capacity === "I Don't Know";
  if (!isUnknownCapacity) {
    if (capacity === 'Under 1,000 Liters') {
      // Base applies
    } else if (capacity === '1,000 2,000 Liters' || capacity === '1,000 – 2,000 Liters') {
      baseMin += 300;
      baseMax += 400;
    } else if (capacity === '2,000 5,000 Liters' || capacity === '2,000 – 5,000 Liters') {
      baseMin += 600;
      baseMax += 900;
    } else if (capacity === '5,000+ Liters') {
      baseMin += 1200;
      baseMax += 1800;
    }
  } else if (flats > 0 || floors > 0) {
    const effectiveUnits = flats > 0 ? flats : floors * 2;
    if (effectiveUnits <= 4) {
      baseMin = Math.max(baseMin, 1800);
      baseMax = Math.max(baseMax, 2500);
    } else if (effectiveUnits <= 8) {
      baseMin = Math.max(baseMin, 2800);
      baseMax = Math.max(baseMax, 3800);
    } else if (effectiveUnits <= 14) {
      baseMin = Math.max(baseMin, 4200);
      baseMax = Math.max(baseMax, 5500);
    } else {
      baseMin = Math.max(baseMin, 6000);
      baseMax = Math.max(baseMax, 8500);
    }
  } else {
    // Unknown capacity and no building flats/floors provided
    return {
      hasSufficientInfo: false,
      formattedEstimate: 'Quotation upon review',
      formattedEstimateBn: 'বিবরণ পর্যালোচনার পর কোটেশন প্রদান',
      explanationEn: 'Final quotation will be confirmed after reviewing your tank details.',
      explanationBn: 'আপনার ট্যাংকের বিবরণ পর্যালোচনার পর চূড়ান্ত কোটেশন প্রদান করা হবে।',
      isEstimated: true,
      disclaimerEn,
      disclaimerBn
    };
  }

  // 3. Multi-tank multiplier (first tank full, additional tanks 30% discount)
  let totalMin = baseMin;
  let totalMax = baseMax;
  if (numTanks > 1) {
    const additionalTanks = numTanks - 1;
    totalMin += additionalTanks * Math.round(baseMin * 0.7);
    totalMax += additionalTanks * Math.round(baseMax * 0.7);
  }

  // 4. Add-on services
  const addServices = data.additionalServices || [];
  if (addServices.includes('pipeline') || data.pipelineCleaning === true || data.pipelineCleaning === 'Yes') {
    totalMin += (pricing.pipelineStartingPrice || 1500);
    totalMax += 2200;
  }
  if (addServices.includes('sludge_pump')) {
    totalMin += 800;
    totalMax += 1200;
  }
  if (addServices.includes('water_test')) {
    totalMin += 500;
    totalMax += 800;
  }

  const roundedMin = Math.round(totalMin / 100) * 100;
  const roundedMax = Math.round(totalMax / 100) * 100;

  return {
    hasSufficientInfo: true,
    minPrice: roundedMin,
    maxPrice: roundedMax,
    formattedEstimate: `৳ ${roundedMin.toLocaleString()} - ৳ ${roundedMax.toLocaleString()}`,
    formattedEstimateBn: `৳ ${roundedMin.toLocaleString('bn-BD')} - ৳ ${roundedMax.toLocaleString('bn-BD')}`,
    explanationEn: `Estimated price range for ${numTanks} tank(s) based on your selected specifications.`,
    explanationBn: `আপনার প্রদত্ত তথ্য অনুযায়ী ${numTanks}টি ট্যাংকের আনুমানিক প্রাইস রেঞ্জ।`,
    isEstimated: true,
    disclaimerEn,
    disclaimerBn
  };
}

export const calculateEstimate = calculateQuoteEstimate;
