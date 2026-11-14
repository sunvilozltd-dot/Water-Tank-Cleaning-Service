import { FullSiteConfig } from '../types/siteConfig';
import { ZoneAreaRecord } from '../services/zoneContentService';
import { ProblemQaItem } from '../data/problemQaData';
import { escapeXml, toValidIsoDate } from './safeSerialize';
import {
  resolveAuthoritativeHotline,
  resolveAuthoritativeHotlineDisplay,
  WHATSAPP_E164
} from './seoResolver';

export interface SitemapRouteInput {
  path: string;
  priority: number;
  changefreq?: 'daily' | 'weekly' | 'monthly';
  lastmod?: string | null;
  noIndex?: boolean;
}

export interface LlmsServiceEntry {
  slug: string;
  title: string;
  titleBn?: string;
  shortDesc?: string;
  processSteps?: string[];
}

export interface LlmsZoneEntry {
  slug: string;
  nameEn: string;
  nameBn: string;
  placesText: string;
}

export interface LlmsArticleEntry {
  slug: string;
  title: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface LlmsGeneratorInput {
  baseUrl: string;
  siteConfig?: Partial<FullSiteConfig> | null;
  services: LlmsServiceEntry[];
  zones: LlmsZoneEntry[];
  areas: ZoneAreaRecord[];
  articles: LlmsArticleEntry[];
  qaItems: ProblemQaItem[];
}

/**
 * Generates truthful sitemap.xml.
 * - Excludes noIndex, admin, api, login, 404, and query paths.
 * - Includes <lastmod> ONLY when a real, valid content timestamp (updatedAt/publishedAt) exists.
 * - Never stamps build date ("today") as content lastmod.
 */
export function buildSitemapXml(
  routes: SitemapRouteInput[],
  baseUrl: string,
  indexingAllowed = true
): string {
  if (!indexingAllowed) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const seen = new Set<string>();
  const items: string[] = [];

  for (const r of routes) {
    if (r.noIndex) continue;
    if (/^\/(admin|api|login|404)/i.test(r.path)) continue;
    if (r.path.includes('?')) continue;

    const normalizedPath = r.path === '/' ? '/' : `/${r.path.replace(/^\/+|\/+$/g, '')}`;
    const loc = `${cleanBase}${normalizedPath}`;
    if (seen.has(loc)) continue;
    seen.add(loc);

    const validLastmod = toValidIsoDate(r.lastmod);
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      ...(validLastmod ? [`    <lastmod>${escapeXml(validLastmod)}</lastmod>`] : []),
      `    <changefreq>${escapeXml(r.changefreq || 'weekly')}</changefreq>`,
      `    <priority>${Number(r.priority ?? 0.5).toFixed(2)}</priority>`,
      '  </url>'
    ];
    items.push(lines.join('\n'));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</urlset>\n`;
}

/**
 * Generates truthful llms.txt derived from verified, editable site_settings & database entities.
 * Unknown or unconfigured claims are omitted cleanly rather than hardcoded.
 */
export function buildLlmsTxt(input: LlmsGeneratorInput): string {
  const cleanBase = input.baseUrl.replace(/\/+$/, '');
  const biz = input.siteConfig?.business;
  const seo = input.siteConfig?.seo;

  const brandName = biz?.name?.trim() || 'SUNVILOZ CLEAN CARE';
  const tagline =
    biz?.tagline?.trim() ||
    'Water Tank Cleaning Service and Water Pipeline Cleaning Service.';

  const lines: string[] = [
    `# ${brandName}`,
    '',
    `> ${tagline}`,
    '',
    `Website: ${cleanBase}`
  ];

  const hotlineE164 = resolveAuthoritativeHotline(biz?.phone);
  const hotlineDisplay = resolveAuthoritativeHotlineDisplay(biz?.displayPhone, biz?.phone);
  const waDigits = (biz?.whatsappNumber || WHATSAPP_E164).replace(/[^0-9]/g, '').replace(/^880/, '');
  lines.push(`Hotline: ${hotlineDisplay} (${hotlineE164})`);
  lines.push(`WhatsApp: +880${waDigits}`);
  if (biz?.email?.trim()) {
    lines.push(`Email: ${biz.email.trim()}`);
  }
  if (biz?.address?.trim()) {
    lines.push(`Coverage / Location: ${biz.address.trim()}`);
  }
  if (biz?.operatingHours?.trim()) {
    lines.push(`Service Hours: ${biz.operatingHours.trim()}`);
  }
  if (biz?.gbpVerified && biz?.googleBusinessProfileUrl?.trim()) {
    lines.push(`Verified Google Business Profile: ${biz.googleBusinessProfileUrl.trim()}`);
  }

  lines.push('');

  const customSummary = seo?.llmsSummary?.trim();
  if (customSummary) {
    lines.push('## Overview', customSummary, '');
  }

  if (input.services.length > 0) {
    lines.push('## Published Services');
    for (const s of input.services) {
      const label = s.titleBn && s.titleBn !== s.title ? `${s.title} (${s.titleBn})` : s.title;
      lines.push(`- ${label}: ${cleanBase}/services/${s.slug}`);
      if (s.shortDesc?.trim()) {
        lines.push(`  Summary: ${s.shortDesc.trim()}`);
      }
    }
    lines.push(`- Request Quotation: ${cleanBase}/get-quote`, '');
  }

  const editableSteps = Array.isArray(input.siteConfig?.cleaningSteps)
    ? input.siteConfig.cleaningSteps.filter(step => step?.title?.trim() || step?.titleBn?.trim())
    : [];

  if (editableSteps.length > 0) {
    lines.push('## Documented Cleaning Workflow');
    for (const step of editableSteps) {
      const name = step.title?.trim() || step.titleBn?.trim();
      const desc = step.description?.trim() || step.descriptionBn?.trim();
      lines.push(`- Step ${step.number || step.step}: ${name}${desc ? ` — ${desc}` : ''}`);
    }
    lines.push('');
  }

  if (input.zones.length > 0) {
    lines.push('## Published Service Zones');
    for (const z of input.zones) {
      lines.push(`- ${z.nameEn} (${z.nameBn}): ${z.placesText}`);
    }
    lines.push('');
  }

  const visibleAreas = input.areas.filter(a => a.isVisible && a.status === 'published');
  if (visibleAreas.length > 0) {
    lines.push('## Published Location Pages');
    for (const a of visibleAreas) {
      lines.push(`- ${a.areaName} (${a.areaNameBn}): ${cleanBase}/service-areas/${a.slug}`);
    }
    lines.push('');
  }

  if (input.qaItems.length > 0) {
    lines.push('## Water Tank & Pipeline Maintenance Q&A');
    for (const qa of input.qaItems) {
      lines.push(`- ${qa.questionBn} -> ${qa.directAnswerBn}`);
    }
    lines.push(`- Full Q&A Hub: ${cleanBase}/faq`, '');
  }

  if (input.articles.length > 0) {
    lines.push('## Published Articles');
    for (const post of input.articles) {
      const dateStr = toValidIsoDate(post.updatedAt || post.publishedAt);
      lines.push(`- ${post.title}: ${cleanBase}/blog/${post.slug}${dateStr ? ` (Date: ${dateStr})` : ''}`);
    }
    lines.push('');
  }

  lines.push(
    '## Scope & Accuracy Note',
    'Published service information above reflects active database entries. Tank cleaning and pipeline flushing address physical sediment, algae, and storage hygiene; drinking water potability verification requires certified laboratory water testing.',
    ''
  );

  return lines.join('\n');
}
