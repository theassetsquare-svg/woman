import { venues, getRegionName, getVenueLabel, type Venue } from '../data/venues';

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
    v.seoArea + v.name,       // "강남보스턴"
    getVenueLabel(v),          // "강남호빠 보스턴"
    v.seoArea + '호빠',        // "강남호빠"
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

  // Pass 1: exact name match (name or combined label)
  for (const entry of index) {
    const v = entry.venue;
    const exactTokens = [v.name, v.seoArea + v.name, getVenueLabel(v)].map(normalize);
    if (exactTokens.some((t) => t === q)) {
      exactMatches.push({ venue: v, matchType: 'exact' });
      seen.add(v.id);
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
