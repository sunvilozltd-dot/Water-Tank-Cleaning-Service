import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../data/config';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'service';
  ogImage?: string;
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

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath = '/',
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  ogImage,
  noIndex = false,
  serviceSchema,
  faqSchema,
  breadcrumbs,
}) => {
  const fullTitle = formatSeoTitle(title);
  const metaDesc = description || 
    'Professional water tank cleaning service in Dhaka. Overhead, underground reserve tank and water pipeline cleaning. Contact SUNVILOZ CLEAN CARE: 01609999612.';
  const canonicalUrl = customCanonicalUrl || `${BUSINESS_CONFIG.canonicalBaseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const socialImage = ogImage || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';

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

    // 4B. Update Hreflang alternates (Only for valid existent URLs)
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

    // Remove legacy conflicting 'en' hreflang pointing to same URL
    const legacyEnTag = document.querySelector('link[rel="alternate"][hreflang="en"]');
    if (legacyEnTag) legacyEnTag.remove();

    setHreflang('bn', canonicalUrl);
    setHreflang('x-default', canonicalUrl);

    // 5. Update OpenGraph Tags
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
    setMeta('og:image', socialImage);
    setMeta('og:site_name', 'Sunviloz Clean Care');

    // 5B. Update Twitter Cards
    const setTwitter = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', fullTitle);
    setTwitter('twitter:description', metaDesc);
    setTwitter('twitter:image', socialImage);

    // 6. Update Google Site Verification if configured
    if (BUSINESS_CONFIG.googleSiteVerification) {
      let gsvTag = document.querySelector('meta[name="google-site-verification"]');
      if (!gsvTag) {
        gsvTag = document.createElement('meta');
        gsvTag.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gsvTag);
      }
      gsvTag.setAttribute('content', BUSINESS_CONFIG.googleSiteVerification);
    }

    // 7. JSON-LD Schemas
    const officialLogoUrl = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
      name: 'SUNVILOZ CLEAN CARE',
      description: 'Professional water tank cleaning service in Dhaka, Gazipur, Savar and Narayanganj for rooftop overhead tanks, underground reserve tanks, and water pipeline flushing.',
      url: BUSINESS_CONFIG.canonicalBaseUrl,
      telephone: '+88' + BUSINESS_CONFIG.phone,
      image: officialLogoUrl,
      logo: officialLogoUrl,
      sameAs: [
        BUSINESS_CONFIG.googleBusinessProfileUrl || 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8267734,90.4179331,17z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt'
      ],
      hasMap: BUSINESS_CONFIG.googleBusinessProfileUrl || 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8267734,90.4179331,17z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+88' + BUSINESS_CONFIG.phone,
        contactType: 'customer service',
        areaServed: ['Dhaka', 'Gazipur', 'Savar', 'Narayanganj'],
        availableLanguage: ['Bengali', 'English']
      },
      priceRange: 'BDT 1200 - 15000',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka Division',
        addressCountry: 'BD'
      },
      areaServed: [
        'Dhaka', 'Gazipur', 'Savar', 'Narayanganj', 'Uttara', 'Gulshan', 'Banani', 
        'Mirpur', 'Bashundhara', 'Mohammadpur', 'Dhanmondi', 'Badda', 'Baridhara', 
        'Khilkhet', 'Rampura'
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
        areaServed: [
          { '@type': 'City', name: 'Dhaka' },
          { '@type': 'City', name: 'Gazipur' },
          { '@type': 'City', name: 'Savar' },
          { '@type': 'City', name: 'Narayanganj' }
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
  }, [fullTitle, metaDesc, canonicalUrl, ogType, noIndex, serviceSchema, faqSchema, breadcrumbs]);

  return null;
};
