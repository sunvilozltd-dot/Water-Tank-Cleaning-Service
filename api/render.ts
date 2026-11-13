import { fetchLiveSeoDataset, LiveSeoDataset } from '../src/seo/siteDataFetcher';
import {
  resolveRoute,
  renderRouteHtmlFromTemplate,
  render404HtmlFromTemplate,
  render503HtmlFromTemplate,
  normalizePathname
} from '../src/seo/routeMetadata';
import { SPA_HTML_TEMPLATE } from './_generated/spaTemplate';

function extractRequestedPath(req: any): string {
  const queryPath = req?.query?.path;
  if (typeof queryPath === 'string' && queryPath.trim()) {
    return normalizePathname(queryPath);
  }
  if (Array.isArray(queryPath) && queryPath[0]) {
    return normalizePathname(String(queryPath[0]));
  }
  const rawUrl = String(req?.url || '/');
  try {
    const parsed = new URL(rawUrl, 'https://sunvilozcleancare.com');
    const qPath = parsed.searchParams.get('path');
    if (qPath) return normalizePathname(qPath);
    if (parsed.pathname.startsWith('/api/render')) return '/';
    return normalizePathname(parsed.pathname);
  } catch {
    return '/';
  }
}

export async function renderPathToResponse(
  rawPath: string,
  customDataset?: LiveSeoDataset,
  templateHtml: string = SPA_HTML_TEMPLATE
): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}> {
  const dataset = customDataset || (await fetchLiveSeoDataset());
  const resolution = resolveRoute(rawPath, dataset);

  if (resolution.kind === 'redirect') {
    return {
      statusCode: resolution.statusCode,
      headers: {
        Location: resolution.destination,
        'Cache-Control': 'public, max-age=0, s-maxage=60'
      },
      body: ''
    };
  }

  if (resolution.kind === 'unavailable') {
    const html503 = render503HtmlFromTemplate(templateHtml, dataset);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '30',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store, must-revalidate'
      },
      body: html503
    };
  }

  if (resolution.kind === 'not_found') {
    const html404 = render404HtmlFromTemplate(templateHtml, dataset);
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store, must-revalidate'
      },
      body: html404
    };
  }

  const html = renderRouteHtmlFromTemplate(templateHtml, resolution.route, dataset);
  if (resolution.fromLastKnownGood) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Source': 'last-known-good',
        'Cache-Control': 'public, max-age=0, s-maxage=10',
        'CDN-Cache-Control': 'public, max-age=0, s-maxage=10',
        'Vercel-CDN-Cache-Control': 'public, max-age=0, s-maxage=10'
      },
      body: html
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      'Vercel-CDN-Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    },
    body: html
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const requestedPath = extractRequestedPath(req);
    const result = await renderPathToResponse(requestedPath);

    for (const [key, val] of Object.entries(result.headers)) {
      res.setHeader(key, val);
    }

    if (result.statusCode === 301 || result.statusCode === 302) {
      return res.status(result.statusCode).end();
    }

    if (req.method === 'HEAD') {
      return res.status(result.statusCode).end();
    }

    return res.status(result.statusCode).send(result.body);
  } catch (err: any) {
    console.error('[api/render] Failed SSR route render:', err?.message || err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send(SPA_HTML_TEMPLATE);
  }
}
