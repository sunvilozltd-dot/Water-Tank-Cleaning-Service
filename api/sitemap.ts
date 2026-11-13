import {
  fetchLiveSeoDataset,
  getCanonicalBaseUrl,
  hasUnrecoveredCriticalFailure
} from '../src/seo/siteDataFetcher';
import { buildAllRoutes } from '../src/seo/routeMetadata';
import { buildSitemapXml } from '../src/seo/seoGenerators';

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
      return res.status(503).send('Sitemap temporarily unavailable due to database error');
    }

    const baseUrl = getCanonicalBaseUrl();
    const indexingAllowed = dataset.siteConfig?.seo?.indexingAllowed !== false;
    const routes = buildAllRoutes(dataset);
    const xml = buildSitemapXml(routes, baseUrl, indexingAllowed);

    const cacheValue = dataset.status.usedLastKnownGood
      ? 'public, max-age=0, s-maxage=15'
      : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    if (dataset.status.usedLastKnownGood) {
      res.setHeader('X-Content-Source', 'last-known-good');
    }
    res.setHeader('Cache-Control', cacheValue);
    res.setHeader('CDN-Cache-Control', cacheValue);
    res.setHeader('Vercel-CDN-Cache-Control', cacheValue);

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    return res.status(200).send(xml);
  } catch (err: any) {
    console.error('[api/sitemap] Failed generating dynamic sitemap:', err?.message || err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).send('Unable to generate sitemap');
  }
}
