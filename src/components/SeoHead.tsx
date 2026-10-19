import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../data/config';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'service';
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
  if (!rawTitle) return `Water Tank Cleaning Service in Dhaka | ${BUSINESS_CONFIG.name}`;
  const brand = BUSINESS_CONFIG.name;
  const regex = new RegExp(`\\s*(\\||-)\\s*(${brand}|Sunviloz Clean Care.*|Sunviloz.*)$`, 'i');
  const cleaned = rawTitle.replace(regex, '').trim();
  if (cleaned.toLowerCase().includes(brand.toLowerCase())) {
    return cleaned;
  }
  return `${cleaned} | ${brand}`;
};

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath = '/',
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  noIndex = false,
  serviceSchema,
  faqSchema,
  breadcrumbs,
}) => {
  const fullTitle = formatSeoTitle(title);
  const metaDesc = description || 
    'Professional water tank cleaning service in Dhaka for rooftop, underground and residential or commercial water tanks. Request a free quotation on WhatsApp.';
  const canonicalUrl = customCanonicalUrl || `${BUSINESS_CONFIG.canonicalBaseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  useEffect(() => {
    // 1. Update document title
    document.title = fullTitle;

    // 2. Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', metaDesc);

    // 3. Update Robots meta tag for search engine indexing
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 4. Update Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. Update OpenGraph Tags
    const setMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('og:title', fullTitle);
    setMeta('og:description', metaDesc);
    setMeta('og:url', canonicalUrl);
    setMeta('og:type', ogType);

    // 5. Update Google Site Verification if configured
    if (BUSINESS_CONFIG.googleSiteVerification) {
      let gsvTag = document.querySelector('meta[name="google-site-verification"]');
      if (!gsvTag) {
        gsvTag = document.createElement('meta');
        gsvTag.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gsvTag);
      }
      gsvTag.setAttribute('content', BUSINESS_CONFIG.googleSiteVerification);
    }

    // 6. JSON-LD Schemas
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: BUSINESS_CONFIG.name,
      description: 'Professional water tank cleaning service in Dhaka for rooftop, underground and commercial water storage reservoirs.',
      url: BUSINESS_CONFIG.canonicalBaseUrl,
      telephone: '+88' + BUSINESS_CONFIG.phone,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+88' + BUSINESS_CONFIG.phone,
        contactType: 'customer service',
        areaServed: 'Dhaka',
        availableLanguage: ['English', 'Bengali']
      },
      priceRange: 'BDT 1200 - 15000',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka Division',
        addressCountry: 'BD'
      },
      areaServed: [
        'Dhaka', 'Kuril', 'Bashundhara', 'Baridhara', 'Gulshan', 'Banani', 
        'Uttara', 'Khilkhet', 'Badda', 'Rampura', 'Mirpur', 'Mohammadpur', 'Dhanmondi'
      ]
    };

    let breadcrumbSchema = null;
    if (breadcrumbs && breadcrumbs.length > 0) {
      breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((bc, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: bc.name,
          item: `${BUSINESS_CONFIG.canonicalBaseUrl}${bc.path.startsWith('/') ? bc.path : `/${bc.path}`}`
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
          name: BUSINESS_CONFIG.name,
          telephone: '+88' + BUSINESS_CONFIG.phone,
          url: BUSINESS_CONFIG.canonicalBaseUrl
        },
        areaServed: {
          '@type': 'City',
          name: 'Dhaka'
        }
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
  }, [fullTitle, metaDesc, canonicalUrl, ogType, noIndex, serviceSchema, faqSchema, breadcrumbs]);

  return null;
};
