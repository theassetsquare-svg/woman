import { venues, getRegionName, type Venue } from '../data/venues';

interface SearchEntry {
  venue: Venue;
  /** All searchable tokens, normalized */
  tokens: string[];
}

/** Normalize: lowercase, trim, remove extra spaces */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '').trim();
}

/** Build the search index once */
const index: SearchEntry[] = venues.map((v) => {
  const raw = [
    v.name,
    v.area,
    v.address,
    getRegionName(v.region),
    v.region,
    ...v.tags,
  ];
  return {
    venue: v,
    tokens: raw.map(normalize),
  };
});

export interface SearchResult {
  venue: Venue;
  matchType: 'exact' | 'partial';
}

/**
 * Search venues: exact match on name first, then partial contains on all fields.
 * Returns deduplicated results with exact matches ranked above partial.
 */
export function searchVenues(query: string): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const exactMatches: SearchResult[] = [];
  const partialMatches: SearchResult[] = [];
  const seen = new Set<string>();

  // Pass 1: exact name match
  for (const entry of index) {
    const nameNorm = normalize(entry.venue.name);
    if (nameNorm === q) {
      exactMatches.push({ venue: entry.venue, matchType: 'exact' });
      seen.add(entry.venue.id);
    }
  }

  // Pass 2: partial contains on all tokens
  for (const entry of index) {
    if (seen.has(entry.venue.id)) continue;
    const matches = entry.tokens.some((t) => t.includes(q)) ||
      normalize(entry.venue.name).includes(q);
    if (matches) {
      partialMatches.push({ venue: entry.venue, matchType: 'partial' });
      seen.add(entry.venue.id);
    }
  }

  return [...exactMatches, ...partialMatches];
}
