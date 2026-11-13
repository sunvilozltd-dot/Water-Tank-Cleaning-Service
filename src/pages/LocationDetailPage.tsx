import React, { useState, useEffect } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { NotFoundPage } from './NotFoundPage';
import {
  DEFAULT_SERVICE_ZONES,
  DEFAULT_ZONE_AREAS,
  ServiceZoneRecord,
  ZoneAreaRecord,
  ZONES_CHANGED_EVENT,
  fetchZonesAndAreas,
  findAreaBySlug
} from '../services/zoneContentService';
import { PROBLEM_QA_ITEMS } from '../data/problemQaData';
import { sanitizeRichHtml, stripHtmlToPlainText } from '../utils/htmlSanitizer';
import { useLanguage } from '../context/LanguageContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SITE_DOMAIN } from '../config/siteDomain';
import { trackEvent, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import {
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Droplets,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Building2,
  Wrench,
  FileCheck2
} from 'lucide-react';

interface LocationDetailPageProps {
  slug: string;
  onOpenQuoteModal: () => void;
  onNavigate?: (path: string) => void;
}

function matchSyncDefaultArea(rawSlug: string): { area: ZoneAreaRecord; zone?: ServiceZoneRecord } | null {
  if (!rawSlug) return null;
  const normalized = rawSlug.toLowerCase().trim().replace(/^water-tank-cleaning-/, '').replace(/-dhaka$/, '');
  const matched = DEFAULT_ZONE_AREAS.find(
    a =>
      a.slug === rawSlug ||
      a.slug === normalized ||
      a.areaName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized.replace(/[^a-z0-9]/g, '') ||
      `water-tank-cleaning-${a.slug}` === rawSlug
  );
  if (!matched) return null;
  const zone = DEFAULT_SERVICE_ZONES.find(z => z.id === matched.zoneId || z.slug === matched.zoneSlug);
  return { area: matched, zone };
}

export const LocationDetailPage: React.FC<LocationDetailPageProps> = ({
  slug,
  onOpenQuoteModal,
  onNavigate
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  const isPreviewQuery =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1';
  const allowDraftPreview = Boolean(isPreviewQuery && isAdminAuthenticated);

  const initialMatch = !isSupabaseConfigured() ? matchSyncDefaultArea(slug) : null;
  const [resolvedArea, setResolvedArea] = useState<ZoneAreaRecord | null>(initialMatch?.area || null);
  const [resolvedZone, setResolvedZone] = useState<ServiceZoneRecord | undefined>(initialMatch?.zone);
  const [otherAreas, setOtherAreas] = useState<ZoneAreaRecord[]>(!isSupabaseConfigured() ? DEFAULT_ZONE_AREAS : []);
  const [loading, setLoading] = useState(!initialMatch);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let active = true;
    const syncMatch = !isSupabaseConfigured() ? matchSyncDefaultArea(slug) : null;
    if (!syncMatch) {
      setLoading(true);
    }

    const loadArea = async () => {
      try {
        const [found, bundle] = await Promise.all([
          findAreaBySlug(slug, { includeDraft: allowDraftPreview }),
          fetchZonesAndAreas({ includeDrafts: false })
        ]);
        if (!active) return;

        if (!found) {
          setResolvedArea(null);
          setNotFound(true);
        } else {
          setResolvedArea(found.area);
          setResolvedZone(found.zone);
          setNotFound(false);
        }

        if (bundle.fromDatabase || !isSupabaseConfigured() || bundle.areas.length > 0) {
          setOtherAreas(bundle.areas.filter(a => a.isVisible));
        }
      } catch {
        if (!active) return;
        if (!syncMatch) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadArea();
    const onZonesChanged = () => loadArea();
    if (typeof window !== 'undefined') {
      window.addEventListener(ZONES_CHANGED_EVENT, onZonesChanged);
    }
    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener(ZONES_CHANGED_EVENT, onZonesChanged);
      }
    };
  }, [slug, allowDraftPreview]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  if (loading && !resolvedArea) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0D9488]/30 border-t-[#0D9488] animate-spin mx-auto" />
          <p className="text-xs font-medium text-[#64748B]">এরিয়া তথ্য লোড হচ্ছে...</p>
        </div>
      </main>
    );
  }

  if (notFound || !resolvedArea) {
    return <NotFoundPage onNavigate={handleNavigate} />;
  }

  const content = allowDraftPreview ? resolvedArea.draftData : resolvedArea.publishedData;
  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const areaInquiryMsg = `আসসালামু আলাইকুম। আমি ${resolvedArea.areaNameBn} (${resolvedArea.areaName}) এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিসের জন্য কোটেশন জানতে চাই।`;
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(areaInquiryMsg)}`;

  const zoneDisplayName =
    lang === 'bn'
      ? resolvedZone?.nameBn || `${resolvedArea.areaNameBn} জোন`
      : resolvedZone?.nameEn || `${resolvedArea.areaName} Zone`;

  const breadcrumbsList = [
    { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
    { name: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', path: '/service-areas' },
    { name: lang === 'bn' ? resolvedArea.areaNameBn : resolvedArea.areaName, path: `/service-areas/${resolvedArea.slug}` }
  ];

  const localProblemQas = PROBLEM_QA_ITEMS.slice(0, 4);
  const structuredFaqs = [
    ...(content.faqs || []).map(f => ({
      question: stripHtmlToPlainText(f.question),
      answer: stripHtmlToPlainText(f.answer)
    })),
    ...localProblemQas.map(item => ({
      question: lang === 'bn' ? item.questionBn : item.questionEn,
      answer: lang === 'bn' ? item.directAnswerBn : (item.directAnswerEn || item.directAnswerBn)
    }))
  ];

  const introHtml = sanitizeRichHtml(lang === 'bn' ? content.introBn || content.intro : content.intro || content.introBn);
  const waterProblemsHtml = sanitizeRichHtml(
    lang === 'bn' ? content.waterProblemsBn || content.waterProblemsEn : content.waterProblemsEn || content.waterProblemsBn
  );
  const potentialCausesHtml = sanitizeRichHtml(
    lang === 'bn' ? content.potentialCausesBn || content.potentialCausesEn : content.potentialCausesEn || content.potentialCausesBn
  );
  const waterConditionHtml = sanitizeRichHtml(
    lang === 'bn' ? content.waterConditionNoteBn || content.waterConditionNote : content.waterConditionNote || content.waterConditionNoteBn
  );
  const practicalAdviceHtml = sanitizeRichHtml(
    lang === 'bn' ? content.practicalAdviceBn || content.practicalAdviceEn : content.practicalAdviceEn || content.practicalAdviceBn
  );

  const seoTitle =
    content.seoTitle || content.title || `${resolvedArea.areaName} Water Tank Cleaning Service | SUNVILOZ CLEAN CARE`;
  const seoDescription =
    content.metaDesc ||
    stripHtmlToPlainText(content.intro) ||
    `Professional overhead, underground reserve tank & pipeline cleaning service in ${resolvedArea.areaName}.`;

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`${SITE_DOMAIN}/service-areas/${resolvedArea.slug}`}
        ogTitle={content.ogTitle || seoTitle}
        ogDescription={content.ogDescription || seoDescription}
        ogImage={content.ogImage}
        ogImageAlt={content.ogImageAlt}
        noIndex={allowDraftPreview}
        serviceSchema={{
          name: `Water Tank Cleaning Service in ${resolvedArea.areaName}`,
          serviceType: 'Water Tank & Pipeline Cleaning Service',
          description: seoDescription
        }}
        breadcrumbs={breadcrumbsList}
        faqSchema={structuredFaqs.length > 0 ? structuredFaqs : undefined}
      />

      {allowDraftPreview && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3 text-xs font-bold flex items-center justify-between gap-3">
          <span>এডমিন প্রিভিউ মোড: আপনি এই এলাকার ড্রাফট সংস্করণ দেখছেন (সার্চ ইঞ্জিনের জন্য noindex)।</span>
          <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-amber-200">
            Status: {resolvedArea.status.toUpperCase()}
          </span>
        </div>
      )}

      <Breadcrumbs
        items={[
          { label: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', href: '/service-areas' },
          { label: lang === 'bn' ? resolvedArea.areaNameBn : resolvedArea.areaName, href: `/service-areas/${resolvedArea.slug}` }
        ]}
      />

      {/* 1. Location Hero Header */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{zoneDisplayName}</span>
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded-full text-xs font-mono font-bold">
              {lang === 'bn' ? 'দৈনিক টিম সক্রিয়' : 'Active Service Coverage'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123047] tracking-tight leading-tight">
            {lang === 'bn' ? content.titleBn || content.title : content.title}
          </h1>

          {introHtml && (
            <div
              className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl"
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          )}

          {content.heroImage && (
            <div className="pt-2">
              <img
                src={content.heroImage}
                alt={content.heroImageAlt || `${resolvedArea.areaName} Water Tank Cleaning Service`}
                className="w-full max-h-72 object-cover rounded-2xl border border-[#E2E8F0]"
                loading="lazy"
              />
            </div>
          )}

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: `location_${resolvedArea.slug}`, area: resolvedArea.areaName })}
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন' : 'Get WhatsApp Quotation'}</span>
            </a>

            <a
              href={`tel:${business.phone}`}
              onClick={() => trackPhoneClick({ source: `location_${resolvedArea.slug}`, area: resolvedArea.areaName })}
              className="px-5 py-3.5 bg-[#123047] hover:bg-[#1b4363] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>{lang === 'bn' ? `সরাসরি কল করুন (${business.displayPhone})` : `Call Direct (${business.displayPhone})`}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                trackEvent('area_quote_click', { area: resolvedArea.areaName });
                onOpenQuoteModal();
              }}
              className="px-5 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>{lang === 'bn' ? `${resolvedArea.areaNameBn}-এ অনলাইন কোটেশন` : `Online Quote (${resolvedArea.areaName})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Local Water Condition, Problems & Potential Causes (Editable from Admin) */}
      {(waterProblemsHtml || potentialCausesHtml || waterConditionHtml) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {waterProblemsHtml && (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#123047]">
                  {lang === 'bn'
                    ? `${resolvedArea.areaNameBn} এলাকার পানির ট্যাংক ও পাইপলাইনের সাধারণ সমস্যা`
                    : `Common Water Storage & Pipeline Problems in ${resolvedArea.areaName}`}
                </h2>
              </div>
              <div
                className="text-xs sm:text-sm text-[#475569] leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: waterProblemsHtml }}
              />
              {waterConditionHtml && (
                <div className="p-3.5 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                  <strong className="text-[#123047] block mb-1">
                    {lang === 'bn' ? 'আঞ্চলিক পানি ও আয়রন পর্যবেক্ষণ:' : 'Local Water & Sediment Notes:'}
                  </strong>
                  <div dangerouslySetInnerHTML={{ __html: waterConditionHtml }} />
                </div>
              )}
            </div>
          )}

          {(potentialCausesHtml || practicalAdviceHtml) && (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              {potentialCausesHtml && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#123047]">
                      {lang === 'bn' ? 'সম্ভাব্য কারণ (ট্যাংক, সাপ্লাই ও প্লাম্বিং)' : 'Potential Causes & Non-Cleaning Factors'}
                    </h2>
                  </div>
                  <div
                    className="text-xs sm:text-sm text-[#475569] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: potentialCausesHtml }}
                  />
                </div>
              )}

              {practicalAdviceHtml && (
                <div className="p-4 rounded-2xl bg-[#E8F5F3]/50 border border-[#0D9488]/20 space-y-1.5">
                  <h3 className="text-sm font-bold text-[#123047] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>{lang === 'bn' ? 'বাস্তবসম্মত ব্যবহারিক পরামর্শ' : 'Practical Maintenance Advice'}</span>
                  </h3>
                  <div
                    className="text-xs sm:text-sm text-[#475569] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: practicalAdviceHtml }}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Optional Verified Findings Block (Rendered ONLY if Admin added sourced findings; never fabricated) */}
      {Array.isArray(content.verifiedFindings) && content.verifiedFindings.length > 0 && (
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#123047]">
              {lang === 'bn' ? 'যাচাইকৃত পর্যবেক্ষণ ও তথ্যসূত্র' : 'Verified Observations & Sources'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.verifiedFindings.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                <p className="text-[#123047] font-semibold leading-relaxed">{item.summary}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                  {item.source && <span>সূত্র: {item.source}</span>}
                  {item.testedDate && <span>তারিখ: {item.testedDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Core Specialized Services in this Locality */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            {lang === 'bn' ? `${resolvedArea.areaNameBn}-এ আমাদের বিশেষায়িত সেবা` : `Services Available in ${resolvedArea.areaName}`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047] tracking-tight">
            {lang === 'bn' ? 'ওভারহেড, আন্ডারগ্রাউন্ড ও পাইপলাইন পরিচ্ছন্নতা' : 'Overhead, Reserve & Pipeline Cleaning'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {lang === 'bn'
              ? 'বাসা, অ্যাপার্টমেন্ট ভবন ও বাণিজ্যিক প্রাঙ্গণে আধুনিক যন্ত্রপাতির সমন্বয়ে নিরাপদ সার্ভিস।'
              : 'Mechanized, non-acid cleaning for residential apartments and commercial properties.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'ছাদের ওভারহেড ট্যাংক ক্লিনিং' : 'Overhead Water Tank Cleaning'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'তীব্র রোদে ছাদের পিভিসি বা আরসিসি ট্যাংকে দ্রুত শ্যাওলা ও বায়োফিল্ম জন্ম নেয়। আমরা ১৫০ বার রোটারি ওয়াটার জেটে ট্যাংকের দেয়াল মসৃণ রেখে শ্যাওলা ও তলদেশের পলি পরিষ্কার করি।'
                  : 'Rooftop tanks suffer from heat-induced algae bloom and supply silt. High-pressure rotary jet washing removes algae and biofilm without scratching tank interiors.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ফুড-গ্রেড নন-টক্সিক জীবাণুনাশক' : 'Food-grade safe sanitization'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ক্ষতিকর এসিডমুক্ত পদ্ধতি' : 'Zero harsh acids or pungent fumes'}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'আন্ডারগ্রাউন্ড রিজার্ভার ডিপ ক্লিন' : 'Underground Reserve Deep Clean'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'সরবরাহ লাইন ও গভীর নলকূপের ভারী কাদা, বালু ও আয়রন মাটির নিচের ট্যাংকে জমা হয়। সাবমারসিবল স্লাজ পাম্প ও ওয়েট ভ্যাকুয়ামের সাহায্যে তলদেশের থিক কাদা সম্পূর্ণ বের করা হয়।'
                  : 'Underground concrete reservoirs collect dense silt and iron sludge. Submersible slurry pumps and wet vacuums safely evacuate accumulated sediment.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ওয়াটারপ্রুফিং অক্ষত রাখা হয়' : 'Protects waterproofing membrane'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'সেফটি প্রোটোকল মেনে কাজ' : 'Confined-space safety protocol'}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'পানির পাইপলাইন ফ্লাশিং' : 'Water Pipeline Flushing'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'ট্যাংক পরিষ্কার হলেও পাইপে মরিচা বা আয়রন জমে থাকলে কল দিয়ে লালচে পানি ও কম প্রেশার দেখা দেয়। নিয়ন্ত্রিত হাইড্রো-পালস প্রযুক্তিতে দেয়াল বা টাইলস না ভেঙে অভ্যন্তরীণ পলি ফ্লাশ করা হয়।'
                  : 'Helps clear tap discoloration, iron scale, and organic sludge inside concealed PVC/CPVC lines using controlled air-water hydro-pulse flushing without breaking tiles.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ট্যাপ ও শাওয়ারের প্রবাহ উন্নয়ন' : 'Improves tap & shower flow'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'অপ্রয়োজনীয় দেয়াল ভাঙা ছাড়াই' : 'Non-destructive pipe inspection'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Systematic 6-Step Mechanized Workflow */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
            {lang === 'bn' ? 'বিজ্ঞানসম্মত কার্যপদ্ধতি' : 'Standardized Workflow'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
            {lang === 'bn' ? 'আমাদের সুশৃঙ্খল ৬-ধাপের মেকানাইজড ক্লিনিং' : 'Our 6-Step Hygienic Cleaning Process'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            { step: '০১', titleBn: 'পানি নিষ্কাশন ও ডেস্লাজিং', descBn: 'ট্যাংক খালি করে তলদেশের নোংরা পানি ড্রেন আউট করা হয়।' },
            { step: '০২', titleBn: 'ভারী কাদা ও স্লাজ উত্তোলন', descBn: 'সাবমারসিবল স্লাজ পাম্প দিয়ে গভীর কাদার স্তর উত্তোলন করা হয়।' },
            { step: '০৩', titleBn: '১৫০ বার হাই-প্রেসার জেট ওয়াশ', descBn: 'ট্যাংকের দেয়াল ও কোণা থেকে শ্যাওলা পরিষ্কার করা হয়।' },
            { step: '০৪', titleBn: 'ফুড-গ্রেড স্যানিটাইজার স্প্রে', descBn: 'নন-টক্সিক জীবাণুনাশক দিয়ে দেয়াল জীবাণুমুক্ত করা হয়।' },
            { step: '০৫', titleBn: 'বিশুদ্ধ পানি দিয়ে ফ্রেশ ফ্লাশিং', descBn: 'অবশিষ্টাংশ না রেখে পরিষ্কার পানিতে সম্পূর্ণ ট্যাংক রিন্স করা হয়।' },
            { step: '০৬', titleBn: 'চূড়ান্ত পরিদর্শন ও হ্যান্ডওভার', descBn: 'ভবন কর্তৃপক্ষকে কাজ দেখিয়ে হস্তান্তর করা হয়।' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#0D9488] bg-white px-2 py-0.5 rounded border border-[#0D9488]/20">
                ধাপ {item.step}
              </span>
              <h4 className="text-sm font-bold text-[#123047]">{item.titleBn}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{item.descBn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Coverage Details & Pricing Structure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {content.coverageDetails && content.coverageDetails.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? `${resolvedArea.areaNameBn}-এর আওতাভুক্ত এলাকা ও সেক্টর` : `Sub-areas & Sectors Covered`}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {content.coverageDetails.map((cov, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{cov}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.pricingFactors && content.pricingFactors.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'সার্ভিস চার্জ ও খরচ নির্ধারণের বিষয়সমূহ' : 'Pricing Factors & Estimates'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {content.pricingFactors.map((price, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                  <span>{price}</span>
                </li>
              ))}
            </ul>
            <div className="p-3 bg-[#F5FAFC] rounded-xl border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>{lang === 'bn' ? 'চূড়ান্ত খরচ ট্যাংকের ধারণক্ষমতা ও কাজের পরিধির ওপর নির্ভর করে কাজ শুরুর আগে জানানো হয়।' : 'Final quote confirmed according to tank capacity and physical access before work starts.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6. WhatsApp Photo Estimate CTA */}
      <SendTankPhotoCta source={`location_detail_${resolvedArea.slug}`} />

      {/* 7. Location & Problem-Based FAQs */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
            {lang === 'bn' ? 'সাধারণ প্রশ্ন ও সমস্যা সমাধান' : 'Frequently Asked Questions'}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
            {lang === 'bn' ? `${resolvedArea.areaNameBn} এলাকার পানি ও ট্যাংক বিষয়ক প্রশ্নোত্তর` : `Questions About Service in ${resolvedArea.areaName}`}
          </h3>
        </div>

        <div className="space-y-3">
          {structuredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#123047] hover:text-[#0D9488] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0D9488]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Specialized Services in this Zone */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
            {lang === 'bn' ? 'আমাদের বিশেষায়িত সেবা' : 'Available Services'}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
            {lang === 'bn' ? `${resolvedArea.areaNameBn} এলাকায় আমাদের ওয়াটার ট্যাংক ও পাইপলাইন সেবাসমূহ` : `Water Tank & Pipeline Services in ${resolvedArea.areaName}`}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <button
            type="button"
            onClick={() => handleNavigate('/services/water-tank-cleaning')}
            className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2">
              <Droplets className="w-6 h-6 text-[#0D9488]" />
              <h4 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-sm">
                Water Tank Cleaning Service
              </h4>
              <p className="text-[11px] text-[#64748B]">ছাদ ও রিজার্ভার মেকানাইজড ডিপ ক্লিন ও ফুড-গ্রেড স্যানিটাইজিং।</p>
            </div>
            <span className="text-[11px] font-bold text-[#0D9488] flex items-center gap-1 mt-3">
              <span>বিস্তারিত দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/overhead-tank-cleaning')}
            className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2">
              <Building2 className="w-6 h-6 text-[#0D9488]" />
              <h4 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-sm">
                Overhead Water Tank Cleaning Service
              </h4>
              <p className="text-[11px] text-[#64748B]">ছাদের পিভিসি ও আরসিসি ট্যাংকের রোটারি ওয়াটার জেট ও শ্যাওলা দূরীকরণ।</p>
            </div>
            <span className="text-[11px] font-bold text-[#0D9488] flex items-center gap-1 mt-3">
              <span>বিস্তারিত দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/underground-water-tank-cleaning')}
            className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#0D9488]" />
              <h4 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-sm">
                Underground Water Tank Cleaning Service
              </h4>
              <p className="text-[11px] text-[#64748B]">ভূগর্ভস্থ আরসিসি রিজার্ভার ও রিজার্ভ ট্যাংকের ভারী কাদা ভ্যাকুয়াম ও স্লাজ পাম্পিং।</p>
            </div>
            <span className="text-[11px] font-bold text-[#0D9488] flex items-center gap-1 mt-3">
              <span>বিস্তারিত দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/pipeline-cleaning')}
            className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2">
              <Wrench className="w-6 h-6 text-[#0D9488]" />
              <h4 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-sm">
                Water Pipeline Cleaning Service
              </h4>
              <p className="text-[11px] text-[#64748B]">দেয়াল অক্ষত রেখে হাইড্রো-পালস প্রেসারাইজড পদ্ধতিতে পাইপলাইনের মরিচা ফ্লাশিং।</p>
            </div>
            <span className="text-[11px] font-bold text-[#0D9488] flex items-center gap-1 mt-3">
              <span>বিস্তারিত দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </section>

      {/* 9. Explore Other Service Locations */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-[#0D9488]" />
          <span>অন্যান্য সার্ভিস এরিয়া</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#123047]">
          {lang === 'bn' ? 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের অন্যান্য সার্ভিস এলাকা' : 'Other Service Areas Across Dhaka, Narayanganj, Gazipur & Savar'}
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {otherAreas
            .filter(l => l.slug !== resolvedArea.slug)
            .map(loc => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => handleNavigate(`/service-areas/${loc.slug}`)}
                className="px-3 py-1.5 rounded-xl bg-[#F5FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-xs font-semibold text-[#123047] hover:text-[#0D9488] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-[#0D9488] shrink-0" />
                <span>{lang === 'bn' ? loc.areaNameBn : loc.areaName}</span>
              </button>
            ))}
        </div>
      </section>

      {/* 10. Smart Quote Wizard */}
      <section id="quote" className="pt-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047] tracking-tight">
            {lang === 'bn' ? `${resolvedArea.areaNameBn} এলাকায় দ্রুত কোটেশন নিন` : `Get a Quick Quote for ${resolvedArea.areaName}`}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {lang === 'bn' ? 'কেবল মোবাইল নম্বর, এলাকা ও সার্ভিসের ধরন দিয়েই কোটেশন অনুরোধ পাঠাতে পারবেন' : 'Submit your mobile number, area & service type for a quick estimate'}
          </p>
        </div>
        <SmartQuoteWizard />
      </section>
    </main>
  );
};

export default LocationDetailPage;
