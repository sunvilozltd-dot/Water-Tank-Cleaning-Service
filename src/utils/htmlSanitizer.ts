// Safe HTML sanitization and verification token validation helpers (XSS prevention)

const ALLOWED_TAGS = new Set(['p', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h3', 'h4', 'br']);

/**
 * Strips potentially dangerous HTML tags/attributes from rich content.
 * Uses DOMParser in the browser and a strict regex fallback during SSR/Node prerender.
 */
export function sanitizeRichHtml(input?: string | null): string {
  if (!input) return '';
  const raw = String(input).trim();
  if (!raw) return '';

  // Remove script/style/iframe/object/embed tags and contents completely first
  const strippedDangerous = raw
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|textarea|button|meta|link|base)[^>]*\/?>/gi, '');

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(strippedDangerous, 'text/html');

      const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return escapeHtml(node.textContent || '');
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return '';
        }
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        const childrenHtml = Array.from(el.childNodes).map(walk).join('');

        if (!ALLOWED_TAGS.has(tag)) {
          return childrenHtml;
        }
        if (tag === 'br') {
          return '<br />';
        }
        const normalizedTag = tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag;
        return `<${normalizedTag}>${childrenHtml}</${normalizedTag}>`;
      };

      return Array.from(doc.body.childNodes).map(walk).join('');
    } catch {
      // Fallback below
    }
  }

  // Node / SSR fallback allowlist
  return strippedDangerous
    .replace(/on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (_match, slash, tag) => {
      const lower = String(tag).toLowerCase();
      if (!ALLOWED_TAGS.has(lower)) return '';
      if (lower === 'br') return '<br />';
      const normalized = lower === 'b' ? 'strong' : lower === 'i' ? 'em' : lower;
      return `<${slash ? '/' : ''}${normalized}>`;
    });
}

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripHtmlToPlainText(input?: string | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts and validates a Google Search Console or Bing Webmaster verification token.
 * Accepts either a raw token (e.g. "AbCdEf123456...") or a pasted <meta ... content="..."> tag,
 * and returns ONLY the safe alphanumeric/-/_ token if valid.
 */
export function extractVerificationToken(input?: string | null): string {
  if (!input) return '';
  let trimmed = String(input).trim();
  if (!trimmed) return '';

  // If admin pasted the full <meta name="..." content="TOKEN"> tag, extract content safely
  const contentMatch = trimmed.match(/content\s*=\s*["']([^"']+)["']/i);
  if (contentMatch && contentMatch[1]) {
    trimmed = contentMatch[1].trim();
  }

  // Strict token allowlist (no quotes, angle brackets, scripts, or spaces)
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(trimmed)) {
    return '';
  }

  return trimmed;
}

export function isValidVerificationToken(input?: string | null): boolean {
  if (!input || !String(input).trim()) return true; // empty is allowed (cleared)
  return extractVerificationToken(input).length > 0;
}

/**
 * Validates safe HTTPS URLs (prevents javascript:, data:, or non-http protocols)
 */
export function isSafeHttpsUrl(input?: string | null): boolean {
  if (!input || !String(input).trim()) return false;
  try {
    const parsed = new URL(String(input).trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeHttpsUrl(input?: string | null): string {
  if (!input) return '';
  const trimmed = String(input).trim();
  return isSafeHttpsUrl(trimmed) ? trimmed : '';
}
