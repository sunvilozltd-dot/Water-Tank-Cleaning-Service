/**
 * Safely serializes arbitrary JSON payloads for direct embedding inside HTML
 * `<script>` and `<script type="application/ld+json">` elements.
 * Prevents `</script>` breakout, `<!--` HTML comment injection, and JS line-separator errors.
 */
export function safeJsonForHtmlScript(value: unknown, pretty = false): string {
  const json = JSON.stringify(value === undefined ? null : value, null, pretty ? 2 : undefined);
  if (!json) return 'null';
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function escapeAttr(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeXml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates and formats an authentic content timestamp (e.g. `updated_at` or `published_at`).
 * Never fabricates a fallback timestamp such as `new Date()`.
 * Returns null if the input is missing or invalid.
 */
export function toValidIsoDate(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Date-only YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear() >= 2020 && parsed.getUTCFullYear() <= 2100) {
      return trimmed;
    }
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  if (year < 2020 || year > 2100) return null;
  return parsed.toISOString().split('T')[0];
}
