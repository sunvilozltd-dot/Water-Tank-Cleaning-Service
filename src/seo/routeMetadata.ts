import { BUSINESS_CONFIG, FAQS_DATA } from '../data/config';
import { PROBLEM_QA_ITEMS } from '../data/problemQaData';
import { INITIAL_SERVICES_FAQS } from '../utils/servicesFaqStore';
import {
  LiveSeoDataset,
  getCanonicalBaseUrl,
  isSliceAvailable
} from './siteDataFetcher';
import { escapeAttr, safeJsonForHtmlScript } from './safeSerialize';
import {
  resolveAuthoritativeHotline,
  resolveAuthoritativeHotlineDisplay
} from './seoResolver';
import { buildCoreRouteDefaults, resolveRouteMetadata } from './sharedRouteMetadata';

export interface ResolvedSeoRoute {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  h1: string;
  summary: string;
  features?: string[];
  faqs?: { question: string; answer: string }[];
  breadcrumbs: { name: string; path: string }[];
  serviceType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  lastmod?: string | null;
  articleMeta?: {
    publishedAt?: string;
    updatedAt?: string;
    imageUrl?: string;
    category?: string;
    readTime?: string;
    content?: string;
  };
  priority: number;
  changefreq?: 'daily' | 'weekly' | 'monthly';
}

export type RouteResolutionResult =
  | { kind: 'redirect'; destination: string; statusCode: 301 | 302 }
  | { kind: 'page'; statusCode: 200; route: ResolvedSeoRoute; fromLastKnownGood?: boolean }
  | { kind: 'not_found'; statusCode: 404 }
  | { kind: 'unavailable'; statusCode: 503; reason: string };

const DEFAULT_LOGO_URL =
  'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';

const STATIC_REDIRECTS: Record<string, { destination: string; statusCode: 301 | 302 }> = {
  '/water-tank-cleaning-service': { destination: '/services/water-tank-cleaning', statusCode: 301 },
  '/pipeline-cleaning-service': { destination: '/services/pipeline-cleaning', statusCode: 301 },
  '/services/water-pipeline-cleaning': { destination: '/services/pipeline-cleaning', statusCode: 301 },
  '/services/pipe-line-cleaning': { destination: '/services/pipeline-cleaning', statusCode: 301 },
  '/services/underground-tank-cleaning': { destination: '/services/underground-water-tank-cleaning', statusCode: 301 },
  '/services/overhead-water-tank-cleaning': { destination: '/services/overhead-tank-cleaning', statusCode: 301 },
  '/areas': { destination: '/service-areas', statusCode: 301 },
  '/projects': { destination: '/portfolio', statusCode: 301 },
  '/terms-and-conditions': { destination: '/terms', statusCode: 301 },
  '/pricing': { destination: '/get-quote', statusCode: 301 },
  '/services-faq': { destination: '/faq', statusCode: 301 },
  '/quote': { destination: '/get-quote', statusCode: 301 },
  '/tips': { destination: '/blog', statusCode: 301 }
};

const CORE_SERVICE_SLUGS = new Set([
  'water-tank-cleaning',
  'pipeline-cleaning',
  'overhead-tank-cleaning',
  'underground-water-tank-cleaning'
]);

const CORE_CITIES = ['Dhaka', 'Narayanganj', 'Gazipur', 'Savar'];

export function normalizePathname(rawPath: string): string {
  const withoutQuery = (rawPath || '/').split('?')[0].split('#')[0].trim();
  if (!withoutQuery || withoutQuery === '/') return '/';
  const clean = `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`;
  return clean || '/';
}

function resolveAbsoluteImageUrl(rawUrl: string | undefined, baseUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_LOGO_URL;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function buildAllRoutes(dataset: LiveSeoDataset): ResolvedSeoRoute[] {
  const seoCfg = dataset.siteConfig?.seo;
  const globalOgImage = seoCfg?.socialOgImage || DEFAULT_LOGO_URL;
  const phoneDisplay = resolveAuthoritativeHotlineDisplay(
    dataset.siteConfig?.business?.displayPhone,
    dataset.siteConfig?.business?.phone
  );
  const coreDefaults = buildCoreRouteDefaults(phoneDisplay);

  const problemFaqs = PROBLEM_QA_ITEMS.map(item => ({
    question: item.questionBn,
    answer: item.directAnswerBn
  }));

  const rawServicesFaqs =
    dataset.status?.configured && isSliceAvailable(dataset.status, 'servicesFaqs')
      ? dataset.servicesFaqs || []
      : INITIAL_SERVICES_FAQS;

  const homeVisibleFaqs = [...rawServicesFaqs]
    .filter(
      f =>
        (f.category === 'water-tank-cleaning' || f.category === 'pipeline-cleaning') &&
        f.isActive !== false
    )
    .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
    .map(f => ({
      question: f.questionBn || f.questionEn,
      answer: f.answerBn || f.answerEn
    }))
    .filter(item => Boolean(item.question && item.answer));

  const siteFaqList =
    Array.isArray(dataset.siteConfig?.faqs) && dataset.siteConfig.faqs.length > 0
      ? dataset.siteConfig.faqs
      : FAQS_DATA;

  const fullFaqHubItems = [
    ...problemFaqs,
    ...siteFaqList.map(f => ({
      question: f.questionBn || f.question,
      answer: f.answerBn || f.answer
    }))
  ];

  const makeCoreRoute = (
    path: string,
    extra: Partial<ResolvedSeoRoute> = {}
  ): ResolvedSeoRoute => {
    const def = coreDefaults[path];
    return {
      path,
      title: def.title,
      description: def.description,
      h1: def.h1,
      summary: def.summary,
      breadcrumbs: def.breadcrumbs,
      serviceType: def.serviceType,
      priority: def.priority,
      changefreq: def.changefreq,
      ...extra
    };
  };

  const routes: ResolvedSeoRoute[] = [
    makeCoreRoute('/', {
      h1:
        dataset.siteConfig?.hero?.headingBn ||
        coreDefaults['/'].h1,
      summary:
        dataset.siteConfig?.hero?.subheadingBn ||
        coreDefaults['/'].summary,
      features: [
        'আন্ডারগ্রাউন্ড রিজার্ভ ও ওভারহেড পানির ট্যাংক পরিষ্কার সার্ভিস (Water Tank Cleaning Service)',
        'হাইড্রো-পালস প্রেসারাইজড ওয়াটার পাইপলাইন ফ্লাশিং — দেয়াল বা টাইলস না ভেঙে',
        'হাই-প্রেসার রোটারি ওয়াটার জেট ও সাবমারসিবল স্লাজ পাম্পে কাদা-শ্যাওলা অপসারণ',
        'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার জুড়ে নির্ধারিত শিডিউলে মোবাইল টিম সার্ভিস'
      ],
      faqs: homeVisibleFaqs,
      lastmod: dataset.homepageRevision?.publishedAt || dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/services/water-tank-cleaning', {
      faqs: problemFaqs.slice(0, 4),
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/services/pipeline-cleaning', {
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/services/overhead-tank-cleaning', {
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/services/underground-water-tank-cleaning', {
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/services', {
      lastmod: dataset.services[0]?.updatedAt || dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/service-areas', {
      lastmod: dataset.areas[0]?.updatedAt || dataset.zones[0]?.updatedAt || null
    }),
    makeCoreRoute('/get-quote', {
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/faq', {
      faqs: fullFaqHubItems,
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/portfolio'),
    makeCoreRoute('/about'),
    makeCoreRoute('/contact', {
      lastmod: dataset.siteConfigUpdatedAt || null
    }),
    makeCoreRoute('/blog', {
      lastmod: dataset.blogPosts[0]?.updatedAt || dataset.blogPosts[0]?.publishedAt || null
    }),
    makeCoreRoute('/privacy-policy'),
    makeCoreRoute('/terms')
  ];

  // Dynamic Active Services added/edited in Admin (excluding slugs redirected statically)
  for (const srv of dataset.services) {
    const normalizedSlug =
      srv.slug === 'overhead-water-tank-cleaning'
        ? 'overhead-tank-cleaning'
        : srv.slug === 'water-pipeline-cleaning'
        ? 'pipeline-cleaning'
        : srv.slug;
    const routePath = `/services/${normalizedSlug}`;
    if (STATIC_REDIRECTS[routePath] || CORE_SERVICE_SLUGS.has(normalizedSlug)) {
      const existing = routes.find(r => r.path === routePath);
      if (existing) {
        if (srv.metaTitle?.trim()) existing.title = srv.metaTitle.trim();
        if (srv.metaDesc?.trim()) existing.description = srv.metaDesc.trim();
        if (srv.image?.trim()) existing.ogImage = srv.image.trim();
        if (Array.isArray(srv.faqs) && srv.faqs.length > 0) {
          existing.faqs = srv.faqs.map(f => ({
            question: f.questionBn || f.question,
            answer: f.answerBn || f.answer
          }));
        }
        if (srv.updatedAt || srv.publishedAt) {
          existing.lastmod = srv.updatedAt || srv.publishedAt || existing.lastmod;
        }
      }
      continue;
    }

    routes.push({
      path: routePath,
      title: srv.metaTitle || `${srv.title} | SUNVILOZ CLEAN CARE`,
      description:
        srv.metaDesc ||
        srv.shortDesc ||
        srv.shortDescBn ||
        `${srv.title} — SUNVILOZ CLEAN CARE`,
      h1: srv.titleBn || srv.title,
      summary: srv.shortDescBn || srv.shortDesc || '',
      faqs: Array.isArray(srv.faqs) && srv.faqs.length > 0
        ? srv.faqs.map(f => ({
            question: f.questionBn || f.question,
            answer: f.answerBn || f.answer
          }))
        : undefined,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: srv.title, path: routePath }
      ],
      serviceType: srv.title,
      ogImage: srv.image,
      ogImageAlt: srv.title,
      lastmod: srv.updatedAt || srv.publishedAt || null,
      priority: 0.85,
      changefreq: 'weekly'
    });
  }

  // Dynamic visible & published Zone Area detail pages
  for (const area of dataset.areas) {
    if (!area.isVisible || area.status !== 'published') continue;
    const content = area.publishedData;
    const baseTitle = content.seoTitle || content.title || `Water Tank Cleaning Service in ${area.areaName}`;
    const cleanTitle = baseTitle
      .replace(/ \| Sunviloz Clean Care/i, '')
      .replace(/ \| SUNVILOZ CLEAN CARE/i, '');

    routes.push({
      path: `/service-areas/${area.slug}`,
      title: `${cleanTitle} | SUNVILOZ CLEAN CARE`,
      description:
        content.metaDesc ||
        `Water tank cleaning and pipeline cleaning service in ${area.areaName}. WhatsApp or call ${phoneDisplay}.`,
      ogTitle: content.ogTitle,
      ogDescription: content.ogDescription,
      h1: content.titleBn || `${area.areaNameBn} এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস`,
      summary:
        content.introBn ||
        content.intro ||
        `${area.areaNameBn} এলাকায় আবাসিক ও বাণিজ্যিক ভবনের ওভারহেড, আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস।`,
      features: content.coverageDetails,
      faqs: (content.faqs || []).map(f => ({ question: f.question, answer: f.answer })),
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Service Areas', path: '/service-areas' },
        { name: area.areaName, path: `/service-areas/${area.slug}` }
      ],
      serviceType: `Water Tank Cleaning Service in ${area.areaName}`,
      ogImage: content.ogImage || content.heroImage,
      ogImageAlt: content.ogImageAlt || content.heroImageAlt,
      lastmod: area.updatedAt || area.publishedAt || null,
      priority: area.isCoreCity ? 0.9 : 0.85,
      changefreq: 'weekly'
    });
  }

  // Published Blog Articles strictly from Supabase blog_posts (published = true)
  for (const article of dataset.blogPosts) {
    routes.push({
      path: `/blog/${article.slug}`,
      title: article.metaTitle || `${article.title} | SUNVILOZ CLEAN CARE`,
      description:
        article.metaDescription ||
        article.excerpt ||
        article.excerptBn ||
        `${article.title} — SUNVILOZ CLEAN CARE.`,
      h1: article.titleBn || article.title,
      summary: article.excerptBn || article.excerpt,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: article.title, path: `/blog/${article.slug}` }
      ],
      articleMeta: {
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        imageUrl: article.imageUrl,
        category: article.category,
        readTime: article.readTime,
        content: article.content
      },
      ogImage: article.imageUrl,
      ogImageAlt: article.title,
      lastmod: article.updatedAt || article.publishedAt || null,
      priority: 0.75,
      changefreq: 'monthly'
    });
  }

  // Resolve final route metadata via shared resolver (pageSeoOverrides[routeKey] > entitySeo > routeDefault, zero `/` bleed)
  for (const r of routes) {
    const resolved = resolveRouteMetadata({
      routeKey: r.path,
      seoConfig: seoCfg,
      entitySeo: {
        title: r.path === '/' ? undefined : r.title,
        description: r.path === '/' ? undefined : r.description,
        ogTitle: r.ogTitle,
        ogDescription: r.ogDescription,
        ogImage: r.ogImage,
        ogImageAlt: r.ogImageAlt,
        noIndex: r.noIndex
      },
      routeDefault: coreDefaults[r.path] || {
        title: r.title,
        description: r.description
      }
    });
    r.title = resolved.title;
    r.description = resolved.description;
    r.ogTitle = resolved.ogTitle;
    r.ogDescription = resolved.ogDescription;
    r.ogImage = resolved.ogImage || globalOgImage;
    r.ogImageAlt = resolved.ogImageAlt;
    if (resolved.noIndex) r.noIndex = true;
  }

  return routes;
}

/**
 * Resolves an incoming URL path to a redirect, an authoritative 200 route, a true 404,
 * or a temporary 503 when a required database query failed without last-known-good fallback.
 */
export function resolveRoute(rawPath: string, dataset: LiveSeoDataset): RouteResolutionResult {
  const cleanPath = normalizePathname(rawPath);
  const status = dataset.status;
  const stale = new Set(status?.staleSlices || []);

  // 1. Dynamic DB redirects
  const dbRedirect = dataset.redirects.find(
    r => r.isActive && normalizePathname(r.fromPath) === cleanPath
  );
  if (dbRedirect && normalizePathname(dbRedirect.toPath) !== cleanPath) {
    return {
      kind: 'redirect',
      destination: dbRedirect.toPath,
      statusCode: dbRedirect.statusCode === 302 ? 302 : 301
    };
  }

  // 2. Canonical static redirects
  if (STATIC_REDIRECTS[cleanPath]) {
    return {
      kind: 'redirect',
      destination: STATIC_REDIRECTS[cleanPath].destination,
      statusCode: STATIC_REDIRECTS[cleanPath].statusCode
    };
  }
  if (cleanPath.startsWith('/areas/')) {
    const slug = cleanPath.replace('/areas/', '').replace(/^water-tank-cleaning-/, '');
    return { kind: 'redirect', destination: `/service-areas/${slug}`, statusCode: 301 };
  }
  if (cleanPath.startsWith('/tips/')) {
    const slug = cleanPath.replace('/tips/', '');
    return { kind: 'redirect', destination: `/blog/${slug}`, statusCode: 301 };
  }

  // 3. Hub pages that depend directly on live tables — return 503 if unrecovered DB outage
  if (cleanPath === '/blog' && status && !isSliceAvailable(status, 'blogPosts')) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Blog database query failed without fallback snapshot.'
    };
  }
  if (
    cleanPath === '/service-areas' &&
    status &&
    !isSliceAvailable(status, 'areas') &&
    !isSliceAvailable(status, 'zones')
  ) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Service areas database query failed without fallback snapshot.'
    };
  }
  if (cleanPath === '/services' && status && !isSliceAvailable(status, 'services')) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Services database query failed without fallback snapshot.'
    };
  }

  // 4. Match published route
  const allRoutes = buildAllRoutes(dataset);
  const matched = allRoutes.find(r => r.path === cleanPath);
  if (matched) {
    let fromLkg = Boolean(status?.usedLastKnownGood);
    if (cleanPath.startsWith('/blog/') && stale.has('blogPosts')) fromLkg = true;
    if (cleanPath.startsWith('/service-areas/') && stale.has('areas')) fromLkg = true;
    if (cleanPath.startsWith('/services/') && stale.has('services')) fromLkg = true;
    return { kind: 'page', statusCode: 200, route: matched, fromLastKnownGood: fromLkg };
  }

  // 5. Distinguish true 404 from database/query failures for dynamic routes or unknown redirect paths
  if (status) {
    if (!status.configured) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Database client is not configured.'
      };
    }

    if (cleanPath.startsWith('/blog/') && !status.blogPostsOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify blog article slug due to database query failure.'
      };
    }

    if (cleanPath.startsWith('/service-areas/') && !status.areasOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify service area slug due to database query failure.'
      };
    }

    if (cleanPath.startsWith('/services/') && !status.servicesOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify service slug due to database query failure.'
      };
    }

    if (!status.redirectsOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify redirect rules due to database query failure.'
      };
    }
  }

  // 6. Authoritatively missing URL (all relevant queries succeeded) -> true 404
  return { kind: 'not_found', statusCode: 404 };
}

function renderCrawlableBody(route: ResolvedSeoRoute, dataset: LiveSeoDataset, baseUrl: string): string {
  const isHome = route.path === '/';
  const biz = dataset.siteConfig?.business;
  const phone = resolveAuthoritativeHotline(biz?.phone);
  const displayPhone = resolveAuthoritativeHotlineDisplay(biz?.displayPhone, biz?.phone);
  const whatsappUrl = biz?.whatsappUrl || BUSINESS_CONFIG.whatsappUrl;
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);

  return `
    <header style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0; background: #123047;">
      <nav style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="color: #38BDF8; font-weight: 900; text-decoration: none; font-size: 1.35rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE Logo" style="height: 38px; width: auto;" />
          <span>SUNVILOZ CLEAN CARE</span>
        </a>
        <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <a href="/services/water-tank-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Water Tank Cleaning</a>
          <a href="/services/pipeline-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Pipeline Cleaning</a>
          <a href="/service-areas" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Service Areas</a>
          <a href="/blog" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Tips &amp; Guides</a>
          <a href="/get-quote" style="color: #38BDF8; font-weight: bold; text-decoration: none; font-size: 0.9rem;">Get Quote</a>
        </div>
      </nav>
    </header>

    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #172B3A;">
      ${
        !isHome
          ? `
        <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #64748B;">
          ${route.breadcrumbs
            .map(
              (bc, idx) => `
            ${idx > 0 ? ' <span style="margin: 0 0.4rem; color: #CBD5E1;">/</span> ' : ''}
            <a href="${escapeAttr(bc.path)}" style="color: ${idx === route.breadcrumbs.length - 1 ? '#0D9488' : '#64748B'}; text-decoration: none; font-weight: ${idx === route.breadcrumbs.length - 1 ? 'bold' : 'normal'};">${escapeAttr(bc.name)}</a>
          `
            )
            .join('')}
        </nav>
      `
          : ''
      }

      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2.15rem; font-weight: 900; color: #123047; line-height: 1.25; margin-bottom: 1rem;">
          ${escapeAttr(route.h1)}
        </h1>
        <p style="font-size: 1.1rem; color: #475569; max-width: 850px; line-height: 1.7; margin-bottom: 1.75rem;">
          ${escapeAttr(route.summary)}
        </p>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 2.5rem;">
          <a href="${escapeAttr(whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #25D366; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>WhatsApp-এ কোটেশন নিন</span>
          </a>
          <a href="tel:${escapeAttr(phone)}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #123047; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>সরাসরি কল করুন: ${escapeAttr(displayPhone)}</span>
          </a>
        </div>
      </div>

      ${
        route.features && route.features.length > 0
          ? `
        <section style="margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #123047; margin-bottom: 1rem;">সেবা ও কভারেজের মূল বৈশিষ্ট্য</h2>
          <ul style="padding-left: 1.25rem; color: #334155; line-height: 1.8;">
            ${route.features.map(f => `<li>${escapeAttr(f)}</li>`).join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        route.faqs && route.faqs.length > 0
          ? `
        <section style="margin-bottom: 3rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #123047; margin-bottom: 1.25rem;">
            সাধারণ প্রশ্ন ও উত্তর (Frequently Asked Questions)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${route.faqs
              .map(
                faq => `
              <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 0.75rem; padding: 1.25rem;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #123047; margin-top: 0; margin-bottom: 0.5rem;">
                  ${escapeAttr(faq.question)}
                </h3>
                <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  ${escapeAttr(faq.answer)}
                </p>
              </article>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }
    </main>

    <footer style="background: #123047; color: #CBD5E1; padding: 2rem 1.5rem; font-size: 0.85rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="color: #FFFFFF;">SUNVILOZ CLEAN CARE</strong> — Water Tank &amp; Pipeline Cleaning Service
        </div>
        <div>
          হটলাইন: <a href="tel:${escapeAttr(phone)}" style="color: #38BDF8; text-decoration: none; font-weight: bold;">${escapeAttr(displayPhone)}</a>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generates complete HTML with route metadata, safe JSON-LD, safe hydration snapshots,
 * and crawlable SSR body HTML inside `#root`.
 */
export function renderRouteHtmlFromTemplate(
  baseTemplate: string,
  route: ResolvedSeoRoute,
  dataset: LiveSeoDataset,
  renderedRootHtmlOverride?: string
): string {
  const baseUrl = getCanonicalBaseUrl();
  const canonicalUrl = `${baseUrl}${route.path === '/' ? '/' : route.path}`;
  const biz = dataset.siteConfig?.business;
  const seoCfg = dataset.siteConfig?.seo;
  const hotlineE164 = resolveAuthoritativeHotline(biz?.phone);
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  const resolvedSocialImage = resolveAbsoluteImageUrl(route.ogImage || seoCfg?.socialOgImage, baseUrl);
  const ogAlt = route.ogImageAlt || seoCfg?.ogImageAlt || 'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service';
  const gbpVerified = Boolean(biz?.gbpVerified && biz?.googleBusinessProfileUrl);
  const indexingDisabled = seoCfg?.indexingAllowed === false || route.noIndex;
  const ogType = route.articleMeta ? 'article' : 'website';
  const resolvedOgTitle = route.ogTitle || route.title;
  const resolvedOgDescription = route.ogDescription || route.description;

  let html = baseTemplate.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(route.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '');
  html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  if (indexingDisabled) {
    html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>\s*/i, '');
  } else {
    html = html.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
    );
  }
  html = html.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(resolvedOgTitle)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(resolvedOgDescription)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(resolvedSocialImage)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:alt" content="${escapeAttr(ogAlt)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(resolvedOgTitle)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(resolvedOgDescription)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(resolvedSocialImage)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${escapeAttr(ogAlt)}" />`
  );

  // Inject robots + GSC / Bing Webmaster verification tags if configured
  const extraMetaTags: string[] = [
    `<meta name="robots" content="${indexingDisabled ? 'noindex, nofollow' : 'index, follow'}" />`
  ];
  if (biz?.googleSiteVerification?.trim()) {
    extraMetaTags.push(
      `<meta name="google-site-verification" content="${escapeAttr(biz.googleSiteVerification.trim())}" />`
    );
  }
  if (biz?.bingSiteVerification?.trim()) {
    extraMetaTags.push(`<meta name="msvalidate.01" content="${escapeAttr(biz.bingSiteVerification.trim())}" />`);
  }
  html = html.replace('</head>', `  ${extraMetaTags.join('\n    ')}\n  </head>`);

  // Structured JSON-LD
  const localBusinessSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${baseUrl}/#localbusiness`,
    name: biz?.name || 'SUNVILOZ CLEAN CARE',
    url: baseUrl,
    telephone: hotlineE164,
    email: biz?.email || BUSINESS_CONFIG.email,
    image: logoUrl,
    logo: logoUrl,
    description:
      'Water tank cleaning service and water pipeline cleaning service across Dhaka, Narayanganj, Gazipur, and Savar for overhead PVC/RCC tanks and underground reservoirs.',
    areaServed: CORE_CITIES.map(c => ({ '@type': 'City', name: c }))
  };

  if (biz?.operatingHours?.trim()) {
    localBusinessSchema.openingHours = biz.operatingHours.trim();
  }

  if (gbpVerified && biz?.googleBusinessProfileUrl) {
    localBusinessSchema.sameAs = [biz.googleBusinessProfileUrl];
    localBusinessSchema.hasMap = biz.googleBusinessProfileUrl;
  }

  const schemaEntries: { id: string; data: Record<string, any> }[] = [
    { id: 'jsonld-local-business', data: localBusinessSchema }
  ];

  if (route.breadcrumbs && route.breadcrumbs.length > 0) {
    schemaEntries.push({
      id: 'jsonld-breadcrumbs',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: route.breadcrumbs.map((bc, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: bc.name,
          item: `${baseUrl}${bc.path.startsWith('/') ? bc.path : `/${bc.path}`}`
        }))
      }
    });
  }

  if (route.serviceType) {
    schemaEntries.push({
      id: 'jsonld-service',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: route.serviceType,
        serviceType: route.serviceType,
        description: route.summary,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          '@id': `${baseUrl}/#localbusiness`,
          name: biz?.name || 'SUNVILOZ CLEAN CARE',
          telephone: hotlineE164,
          url: baseUrl
        },
        areaServed: CORE_CITIES.map(c => ({ '@type': 'City', name: c }))
      }
    });
  }

  if (route.faqs && route.faqs.length > 0) {
    schemaEntries.push({
      id: 'jsonld-faq',
      data: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    });
  }

  if (route.articleMeta) {
    const blogPosting: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: route.h1,
      description: route.description,
      image: [resolvedSocialImage],
      author: {
        '@type': 'Organization',
        name: biz?.name || 'SUNVILOZ CLEAN CARE',
        url: baseUrl
      },
      publisher: {
        '@type': 'Organization',
        name: biz?.name || 'SUNVILOZ CLEAN CARE',
        logo: {
          '@type': 'ImageObject',
          url: logoUrl
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    };
    if (route.articleMeta.publishedAt) {
      blogPosting.datePublished = route.articleMeta.publishedAt;
    }
    if (route.articleMeta.updatedAt || route.articleMeta.publishedAt) {
      blogPosting.dateModified = route.articleMeta.updatedAt || route.articleMeta.publishedAt;
    }
    schemaEntries.push({ id: 'jsonld-blog-posting', data: blogPosting });
  }

  // Strip secondary managed jsonld-* blocks (preserve unrelated third-party scripts) before injecting current route schemas
  html = html.replace(
    /<script\s+id="jsonld-(?:breadcrumbs|service|faq|blog-posting)"[^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );

  const schemasMarkup = indexingDisabled
    ? ''
    : schemaEntries
        .map(
          entry =>
            `\n    <script id="${entry.id}" type="application/ld+json">\n    ${safeJsonForHtmlScript(entry.data, true).replace(/\n/g, '\n    ')}\n    </script>`
        )
        .join('\n');

  html = html.replace(/<script\s+id="jsonld-local-business"[^>]*>[\s\S]*?<\/script>/i, schemasMarkup);

  const rootBody = renderedRootHtmlOverride || renderCrawlableBody(route, dataset, baseUrl);
  html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>/i, `<div id="root">${rootBody}</div>`);

  // Safe public hydration snapshots using safeJsonForHtmlScript (prevents </script> breakout and strips secrets)
  const snapshotScripts: string[] = [];
  if (dataset.homepageSections.length > 0) {
    snapshotScripts.push(
      `window.__INITIAL_HOMEPAGE_SECTIONS__ = ${safeJsonForHtmlScript(dataset.homepageSections)}; window.__HOMEPAGE_REVISION__ = ${safeJsonForHtmlScript(dataset.homepageRevision)};`
    );
  }
  if (dataset.imageRegistry) {
    snapshotScripts.push(
      `window.__INITIAL_IMAGE_REGISTRY__ = ${safeJsonForHtmlScript(dataset.imageRegistry)};`
    );
  }
  if (dataset.status?.configured && isSliceAvailable(dataset.status, 'servicesFaqs')) {
    snapshotScripts.push(
      `window.__INITIAL_SERVICES_FAQS__ = ${safeJsonForHtmlScript(dataset.servicesFaqs)};`
    );
  }
  if (dataset.status?.configured && isSliceAvailable(dataset.status, 'services')) {
    snapshotScripts.push(
      `window.__INITIAL_SERVICES__ = ${safeJsonForHtmlScript(dataset.services)};`
    );
  }
  if (dataset.siteConfig) {
    const publicSiteConfig: Record<string, any> = {
      business: dataset.siteConfig.business || undefined,
      announcement: dataset.siteConfig.announcement || undefined,
      hero: dataset.siteConfig.hero || undefined,
      faqs: dataset.siteConfig.faqs || undefined,
      images: dataset.siteConfig.images || undefined,
      seo: dataset.siteConfig.seo
        ? { ...dataset.siteConfig.seo, indexNowKey: '' }
        : undefined
    };
    snapshotScripts.push(
      `window.__INITIAL_SITE_CONFIG__ = ${safeJsonForHtmlScript(publicSiteConfig)};`
    );
  }

  if (snapshotScripts.length > 0) {
    const snapshotTag = `<script id="__SUNVILOZ_HOMEPAGE_SNAPSHOT__">${snapshotScripts.join(' ')}</script>`;
    html = html.replace('</head>', `  ${snapshotTag}\n</head>`);
  }

  return html;
}

export function render404HtmlFromTemplate(
  baseTemplate: string,
  dataset: LiveSeoDataset,
  renderedRootHtmlOverride?: string
): string {
  const baseUrl = getCanonicalBaseUrl();
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  let html = baseTemplate.replace(
    /<title>.*?<\/title>/i,
    '<title>404 — Page Not Found | SUNVILOZ CLEAN CARE</title>'
  );
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    '<meta name="description" content="Requested page could not be found on SUNVILOZ CLEAN CARE." />'
  );
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>\s*/i, '');
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '');
  html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  html = html.replace(
    /<script\s+id="jsonld-(?:local-business|breadcrumbs|service|faq|blog-posting)"[^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');

  const fallback404Body = `
      <main style="max-width: 720px; margin: 4rem auto; padding: 2rem; text-align: center; font-family: sans-serif;">
        <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE" style="height: 48px; margin: 0 auto 1rem;" />
        <h1 style="font-size: 2rem; color: #123047;">৪০৪ — পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)</h1>
        <p style="color: #475569; margin: 1rem 0 2rem;">আপনি যে লিংকটি খুঁজছেন তা পরিবর্তন হয়েছে অথবা বর্তমানে উপলব্ধ নয়।</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/" style="background: #123047; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">হোমপেজে ফিরুন</a>
          <a href="/service-areas" style="background: #0D9488; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">সার্ভিস এরিয়া দেখুন</a>
        </div>
      </main>
    `;

  html = html.replace(
    /<div\s+id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${renderedRootHtmlOverride || fallback404Body}</div>`
  );
  return html;
}

export function render503HtmlFromTemplate(
  baseTemplate: string,
  dataset: LiveSeoDataset
): string {
  const baseUrl = getCanonicalBaseUrl();
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  const phone = resolveAuthoritativeHotline(dataset.siteConfig?.business?.phone);
  const displayPhone = resolveAuthoritativeHotlineDisplay(
    dataset.siteConfig?.business?.displayPhone,
    dataset.siteConfig?.business?.phone
  );

  let html = baseTemplate.replace(
    /<title>.*?<\/title>/i,
    '<title>503 — Temporarily Unavailable | SUNVILOZ CLEAN CARE</title>'
  );
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    '<meta name="description" content="This page is temporarily unavailable while reconnecting to the content database. Please retry shortly." />'
  );
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>\s*/i, '');
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '');
  html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  html = html.replace(
    /<script\s+id="jsonld-(?:local-business|breadcrumbs|service|faq|blog-posting)"[^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');

  const fallback503Body = `
      <main style="max-width: 720px; margin: 4rem auto; padding: 2rem; text-align: center; font-family: sans-serif;">
        <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE" style="height: 48px; margin: 0 auto 1rem;" />
        <h1 style="font-size: 1.85rem; color: #123047;">সাময়িক সংযোগ ত্রুটি (503 — Service Temporarily Unavailable)</h1>
        <p style="color: #475569; margin: 1rem 0 2rem; line-height: 1.6;">
          সার্ভারের ডেটাবেজ সংযোগে সাময়িক সমস্যা হওয়ায় এই মুহূর্তে পৃষ্ঠাটি লোড করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/" style="background: #123047; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">হোমপেজে যান</a>
          <a href="tel:${escapeAttr(phone)}" style="background: #0D9488; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">কল করুন: ${escapeAttr(displayPhone)}</a>
        </div>
      </main>
    `;

  html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>/i, `<div id="root">${fallback503Body}</div>`);
  return html;
}
