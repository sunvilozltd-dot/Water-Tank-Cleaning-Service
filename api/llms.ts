import {
  fetchLiveSeoDataset,
  getCanonicalBaseUrl,
  hasUnrecoveredCriticalFailure
} from '../src/seo/siteDataFetcher';
import { buildLlmsTxt } from '../src/seo/seoGenerators';
import { PROBLEM_QA_ITEMS } from '../src/data/problemQaData';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const dataset = await fetchLiveSeoDataset();
    if (
      hasUnrecoveredCriticalFailure(dataset.status, [
        'siteSettings',
        'zones',
        'areas',
        'services',
        'blogPosts'
      ])
    ) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Retry-After', '60');
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      return res.status(503).send('llms.txt temporarily unavailable due to database error');
    }

    const baseUrl = getCanonicalBaseUrl();

    const txt = buildLlmsTxt({
      baseUrl,
      siteConfig: dataset.siteConfig,
      services: dataset.services,
      zones: dataset.zones,
      areas: dataset.areas,
      articles: dataset.blogPosts,
      qaItems: PROBLEM_QA_ITEMS
    });

    const cacheValue = dataset.status.usedLastKnownGood
      ? 'public, max-age=0, s-maxage=15'
      : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (dataset.status.usedLastKnownGood) {
      res.setHeader('X-Content-Source', 'last-known-good');
    }
    res.setHeader('Cache-Control', cacheValue);
    res.setHeader('CDN-Cache-Control', cacheValue);
    res.setHeader('Vercel-CDN-Cache-Control', cacheValue);

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    return res.status(200).send(txt);
  } catch (err: any) {
    console.error('[api/llms] Failed generating dynamic llms.txt:', err?.message || err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).send('Unable to generate llms.txt');
  }
}
