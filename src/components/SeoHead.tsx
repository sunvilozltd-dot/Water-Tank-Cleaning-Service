import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../data/config';
import { useSiteConfig } from '../context/SiteConfigContext';
import { extractVerificationToken, sanitizeHttpsUrl } from '../utils/htmlSanitizer';
import { SITE_DOMAIN } from '../config/siteDomain';
import {
  extractRouteKey,
  formatSeoTitle as formatCanonicalSeoTitle,
  resolveAuthoritativeHotline
} from '../seo/seoResolver';
import { resolveRouteMetadata } from '../seo/sharedRouteMetadata';

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
  articleSchema?: {
    headline: string;
    description: string;
    datePublished?: string;
    dateModified?: string;
    image?: string;
    url?: string;
  };
  faqSchema?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; path: string }[];
}

export const formatSeoTitle = formatCanonicalSeoTitle;

const OFFICIAL_LOGO_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath,
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  ogTitle: customOgTitle,
  ogDescription: customOgDescription,
  ogImage,
  ogImageAlt,
  noIndex = false,
  serviceSchema,
  articleSchema,
  faqSchema,
  breadcrumbs,
}) => {
  const siteConfig = useSiteConfig();
  const business = siteConfig?.business || BUSINESS_CONFIG;
  const seo = siteConfig?.seo;

  const baseOrigin = (seo?.canonicalBaseUrl || business.canonicalBaseUrl || SITE_DOMAIN).replace(/\/+$/, '');
  const routeKey = extractRouteKey(canonicalPath, customCanonicalUrl);
  const resolvedMeta = resolveRouteMetadata({
    routeKey,
    seoConfig: seo,
    entitySeo: {
      title,
      description,
      ogTitle: customOgTitle,
      ogDescription: customOgDescription,
      ogImage,
      ogImageAlt,
      noIndex
    }
  });

  const fullTitle = resolvedMeta.title;
  const metaDesc = resolvedMeta.description;

  const canonicalUrl =
    customCanonicalUrl ||
    `${baseOrigin}${routeKey === '/' ? '/' : routeKey}`;

  const socialImage =
    sanitizeHttpsUrl(resolvedMeta.ogImage) ||
    OFFICIAL_LOGO_URL;

  const socialImageAlt =
    resolvedMeta.ogImageAlt ||
    'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service in Dhaka';

  const ogTitle = resolvedMeta.ogTitle;
  const ogDescription = resolvedMeta.ogDescription;
  const effectiveNoIndex = resolvedMeta.noIndex;

  const gscToken = extractVerificationToken(business.googleSiteVerification);
  const bingToken = extractVerificationToken(business.bingSiteVerification);
  const gbpVerified = Boolean(business.gbpVerified);
  const gbpUrl = gbpVerified ? sanitizeHttpsUrl(business.googleBusinessProfileUrl) : '';
  const authoritativePhoneE164 = resolveAuthoritativeHotline(business.phone);

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

    // 2. Canonical (omit on noindex routes such as 404/draft preview) & strip invalid single-URL hreflang
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (effectiveNoIndex) {
      if (existingCanonical) existingCanonical.remove();
    } else {
      let canonicalTag = existingCanonical;
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', canonicalUrl);
    }

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // 3. OpenGraph Tags
    upsertMetaByProperty('og:title', ogTitle);
    upsertMetaByProperty('og:description', ogDescription);
    upsertMetaByProperty('og:url', effectiveNoIndex ? null : canonicalUrl);
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
      '@id': `${baseOrigin}/#localbusiness`,
      name: 'SUNVILOZ CLEAN CARE',
      description:
        'Professional water tank cleaning and pipeline flushing service in Dhaka, Narayanganj, Gazipur and Savar for overhead and underground water storage tanks.',
      url: baseOrigin,
      telephone: authoritativePhoneE164,
      email: business.email || 'sunvilozltd@gmail.com',
      image: OFFICIAL_LOGO_URL,
      logo: OFFICIAL_LOGO_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: authoritativePhoneE164,
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
    if (!effectiveNoIndex && breadcrumbs && breadcrumbs.length > 0) {
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
    if (!effectiveNoIndex && serviceSchema) {
      structuredServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceSchema.name,
        serviceType: serviceSchema.serviceType,
        description: serviceSchema.description,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          '@id': `${baseOrigin}/#localbusiness`,
          name: 'SUNVILOZ CLEAN CARE',
          telephone: authoritativePhoneE164,
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
    if (!effectiveNoIndex && faqSchema && faqSchema.length > 0) {
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

    let structuredArticleSchema: Record<string, any> | null = null;
    if (!effectiveNoIndex && articleSchema) {
      const articleImage = sanitizeHttpsUrl(articleSchema.image) || socialImage;
      const articleUrl = articleSchema.url || canonicalUrl;
      structuredArticleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: articleSchema.headline,
        description: articleSchema.description,
        image: [articleImage],
        author: {
          '@type': 'Organization',
          name: 'SUNVILOZ CLEAN CARE',
          url: baseOrigin
        },
        publisher: {
          '@type': 'Organization',
          name: 'SUNVILOZ CLEAN CARE',
          logo: {
            '@type': 'ImageObject',
            url: OFFICIAL_LOGO_URL
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl
        }
      };
      if (articleSchema.datePublished) {
        structuredArticleSchema.datePublished = articleSchema.datePublished;
      }
      if (articleSchema.dateModified || articleSchema.datePublished) {
        structuredArticleSchema.dateModified = articleSchema.dateModified || articleSchema.datePublished;
      }
    }

    const syncJsonLd = (id: string, data: object | null) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (!data) {
        if (existing) existing.remove();
        return;
      }
      let script = existing;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    };

    syncJsonLd('jsonld-local-business', effectiveNoIndex ? null : localBusinessSchema);
    syncJsonLd('jsonld-breadcrumbs', breadcrumbSchema);
    syncJsonLd('jsonld-service', structuredServiceSchema);
    syncJsonLd('jsonld-faq', structuredFaqSchema);
    syncJsonLd('jsonld-blog-posting', structuredArticleSchema);
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
    authoritativePhoneE164,
    business.email,
    serviceSchema,
    articleSchema,
    faqSchema,
    breadcrumbs
  ]);

  return null;
};
