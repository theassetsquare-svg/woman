/**
 * Normalize a URL path by removing duplicate tokens.
 * e.g. "/venue/venue/seoul-boston" → "/venue/seoul-boston"
 *      "/region/region/busan"     → "/region/busan"
 */
export function dedupeSlug(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const seg of segments) {
    if (!seen.has(seg)) {
      seen.add(seg);
      deduped.push(seg);
    }
  }
  return '/' + deduped.join('/');
}

/**
 * Build an absolute canonical URL from a relative path.
 */
export function canonicalUrl(path: string): string {
  const base = 'https://woman-5nj.pages.dev';
  const clean = dedupeSlug(path);
  return clean === '/' ? base : base + clean;
}

