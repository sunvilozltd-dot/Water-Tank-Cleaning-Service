import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../data/config';
import { useSiteConfig } from '../context/SiteConfigContext';
import { extractVerificationToken, sanitizeHttpsUrl } from '../utils/htmlSanitizer';
import { SITE_DOMAIN } from '../config/siteDomain';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'service';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  serviceSchema?: {
    name: string;
    description: string;
    serviceType: string;
  };
  faqSchema?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; path: string }[];
}

export const formatSeoTitle = (rawTitle?: string): string => {
  const brand = 'SUNVILOZ CLEAN CARE';
  if (!rawTitle) return `Water Tank Cleaning Service in Dhaka | ${brand}`;
  const trimmed = rawTitle.trim();
  if (trimmed.toLowerCase().includes(brand.toLowerCase()) || trimmed.toLowerCase().includes('sunviloz clean care')) {
    return trimmed;
  }
  const regex = new RegExp(`\\s*(\\||-)\\s*(${brand}|Sunviloz Clean Care.*|Sunviloz.*)$`, 'i');
  const cleaned = trimmed.replace(regex, '').trim();
  return `${cleaned} | ${brand}`;
};

const OFFICIAL_LOGO_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath = '/',
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  ogTitle: customOgTitle,
  ogDescription: customOgDescription,
  ogImage,
  ogImageAlt,
  noIndex = false,
  serviceSchema,
  faqSchema,
  breadcrumbs,
}) => {
  const siteConfig = useSiteConfig();
  const business = siteConfig?.business || BUSINESS_CONFIG;
  const seo = siteConfig?.seo;

  const baseOrigin = (seo?.canonicalBaseUrl || business.canonicalBaseUrl || SITE_DOMAIN).replace(/\/+$/, '');
  const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const routeKey = normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+$/, '');
  const override = seo?.pageSeoOverrides?.[routeKey];

  const resolvedRawTitle = override?.title || title || seo?.defaultMetaTitle;
  const fullTitle = formatSeoTitle(resolvedRawTitle);
  const metaDesc =
    override?.description ||
    description ||
    seo?.defaultMetaDescription ||
    'Professional water tank cleaning service in Dhaka, Narayanganj, Gazipur & Savar. Overhead, underground reserve tank and water pipeline flushing. Contact SUNVILOZ CLEAN CARE: 01609999612.';

  const canonicalUrl =
    customCanonicalUrl ||
    `${baseOrigin}${routeKey === '/' ? '/' : routeKey}`;

  const socialImage =
    sanitizeHttpsUrl(override?.ogImage) ||
    sanitizeHttpsUrl(ogImage) ||
    sanitizeHttpsUrl(seo?.socialOgImage) ||
    OFFICIAL_LOGO_URL;

  const socialImageAlt =
    override?.ogImageAlt ||
    ogImageAlt ||
    seo?.ogImageAlt ||
    'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service in Dhaka';

  const ogTitle = override?.ogTitle
    ? formatSeoTitle(override.ogTitle)
    : customOgTitle
    ? formatSeoTitle(customOgTitle)
    : fullTitle;
  const ogDescription = override?.ogDescription || customOgDescription || metaDesc;
  const effectiveNoIndex = Boolean(noIndex || override?.noIndex || seo?.indexingAllowed === false);

  const gscToken = extractVerificationToken(business.googleSiteVerification);
  const bingToken = extractVerificationToken(business.bingSiteVerification);
  const gbpVerified = Boolean(business.gbpVerified);
  const gbpUrl = gbpVerified ? sanitizeHttpsUrl(business.googleBusinessProfileUrl) : '';

  useEffect(() => {
    document.title = fullTitle;

    const upsertMetaByName = (name: string, content: string | null) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!content) {
        if (tag) tag.remove();
        return;
      }
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const upsertMetaByProperty = (property: string, content: string | null) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!content) {
        if (tag) tag.remove();
        return;
      }
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 1. Description & Robots
    upsertMetaByName('description', metaDesc);
    upsertMetaByName('robots', effectiveNoIndex ? 'noindex, nofollow' : 'index, follow');

    // 2. Canonical & Hreflang
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    const setHreflang = (lang: string, href: string) => {
      let tag = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', 'alternate');
        tag.setAttribute('hreflang', lang);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };
    const legacyEnTag = document.querySelector('link[rel="alternate"][hreflang="en"]');
    if (legacyEnTag) legacyEnTag.remove();
    setHreflang('bn', canonicalUrl);
    setHreflang('x-default', canonicalUrl);

    // 3. OpenGraph Tags
    upsertMetaByProperty('og:title', ogTitle);
    upsertMetaByProperty('og:description', ogDescription);
    upsertMetaByProperty('og:url', canonicalUrl);
    upsertMetaByProperty('og:type', ogType);
    upsertMetaByProperty('og:image', socialImage);
    upsertMetaByProperty('og:image:alt', socialImageAlt);
    upsertMetaByProperty('og:site_name', 'SUNVILOZ CLEAN CARE');

    // 4. Twitter Cards
    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', ogTitle);
    upsertMetaByName('twitter:description', ogDescription);
    upsertMetaByName('twitter:image', socialImage);
    upsertMetaByName('twitter:image:alt', socialImageAlt);

    // 5. Search Engine Verification Tokens (Google Search Console & Bing Webmaster Tools)
    upsertMetaByName('google-site-verification', gscToken || null);
    upsertMetaByName('msvalidate.01', bingToken || null);

    // 6. Schema.org JSON-LD (Strict Truthfulness: no unverified priceRange, openingHours, or unverified GBP links)
    const localBusinessSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
      '@id': `${SITE_DOMAIN}/#localbusiness`,
      name: 'SUNVILOZ CLEAN CARE',
      description:
        'Professional water tank cleaning and pipeline flushing service in Dhaka, Narayanganj, Gazipur and Savar for overhead and underground water storage tanks.',
      url: baseOrigin,
      telephone: `+88${(business.phone || '01609999612').replace(/^\+?88/, '')}`,
      email: business.email || 'sunvilozltd@gmail.com',
      image: OFFICIAL_LOGO_URL,
      logo: OFFICIAL_LOGO_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: `+88${(business.phone || '01609999612').replace(/^\+?88/, '')}`,
        contactType: 'customer service',
        areaServed: ['Dhaka', 'Narayanganj', 'Gazipur', 'Savar'],
        availableLanguage: ['Bengali', 'English']
      },
      areaServed: [
        { '@type': 'City', name: 'Dhaka' },
        { '@type': 'City', name: 'Narayanganj' },
        { '@type': 'City', name: 'Gazipur' },
        { '@type': 'City', name: 'Savar' }
      ]
    };

    if (gbpVerified && gbpUrl) {
      localBusinessSchema.sameAs = [gbpUrl];
      localBusinessSchema.hasMap = gbpUrl;
    }

    let breadcrumbSchema = null;
    if (breadcrumbs && breadcrumbs.length > 0) {
      breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((bc, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: bc.name,
          item: `${baseOrigin}${bc.path.startsWith('/') ? bc.path : `/${bc.path}`}`
        }))
      };
    }

    let structuredServiceSchema = null;
    if (serviceSchema) {
      structuredServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceSchema.name,
        serviceType: serviceSchema.serviceType,
        description: serviceSchema.description,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          '@id': `${SITE_DOMAIN}/#localbusiness`,
          name: 'SUNVILOZ CLEAN CARE',
          telephone: `+88${(business.phone || '01609999612').replace(/^\+?88/, '')}`,
          url: baseOrigin
        },
        areaServed: [
          { '@type': 'City', name: 'Dhaka' },
          { '@type': 'City', name: 'Narayanganj' },
          { '@type': 'City', name: 'Gazipur' },
          { '@type': 'City', name: 'Savar' }
        ]
      };
    }

    let structuredFaqSchema = null;
    if (faqSchema && faqSchema.length > 0) {
      structuredFaqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSchema.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      };
    }

    const injectJsonLd = (id: string, data: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    };

    injectJsonLd('jsonld-local-business', localBusinessSchema);
    if (breadcrumbSchema) injectJsonLd('jsonld-breadcrumbs', breadcrumbSchema);
    if (structuredServiceSchema) injectJsonLd('jsonld-service', structuredServiceSchema);
    if (structuredFaqSchema) injectJsonLd('jsonld-faq', structuredFaqSchema);

    return () => {
      const breadcrumbEl = document.getElementById('jsonld-breadcrumbs');
      if (breadcrumbEl && !breadcrumbs) breadcrumbEl.remove();
      const serviceEl = document.getElementById('jsonld-service');
      if (serviceEl && !serviceSchema) serviceEl.remove();
      const faqEl = document.getElementById('jsonld-faq');
      if (faqEl && !faqSchema) faqEl.remove();
    };
  }, [
    fullTitle,
    metaDesc,
    canonicalUrl,
    ogType,
    ogTitle,
    ogDescription,
    socialImage,
    socialImageAlt,
    effectiveNoIndex,
    gscToken,
    bingToken,
    gbpVerified,
    gbpUrl,
    baseOrigin,
    business.phone,
    business.email,
    serviceSchema,
    faqSchema,
    breadcrumbs
  ]);

  return null;
};
