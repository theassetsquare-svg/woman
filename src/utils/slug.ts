/**
 * URL slug utilities — deduplicate region tokens from venue paths.
 */

const BASE_URL = 'https://woman-5nj.pages.dev';

/**
 * Strip the region prefix from a venue ID if it matches the region.
 * e.g. venueSlug('seoul-boston', 'seoul') → 'boston'
 *      venueSlug('suwon-beast', 'gyeonggi') → 'suwon-beast' (no match)
 */
export function venueSlug(venueId: string, region: string): string {
  const prefix = region + '-';
  return venueId.startsWith(prefix) ? venueId.slice(prefix.length) : venueId;
}

/**
 * Build the canonical path for a venue.
 * e.g. venuePath({ id: 'seoul-boston', region: 'seoul' }) → '/seoul/boston'
 *      venuePath({ id: 'suwon-beast', region: 'gyeonggi' }) → '/gyeonggi/suwon-beast'
 */
export function venuePath(venue: { id: string; region: string }): string {
  return `/${venue.region}/${venueSlug(venue.id, venue.region)}`;
}

/**
 * Normalize a URL path by removing duplicate path segments.
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
  const clean = dedupeSlug(path);
  return clean === '/' ? BASE_URL : BASE_URL + clean;
}
