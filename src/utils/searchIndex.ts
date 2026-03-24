import { venues, getRegionName, getVenueLabel, type Venue } from '../data/venues';

interface SearchEntry {
  venue: Venue;
  tokens: string[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '').trim();
}

const index: SearchEntry[] = venues.map((v) => {
  const raw = [
    v.name,
    v.area,
    v.address,
    getRegionName(v.region),
    v.region,
    ...v.tags,
    getVenueLabel(v),
    v.keyword || '',
    v.seoArea + '나이트',
    v.seoArea + '클럽',
    v.seoArea + '라운지',
    v.contact || '',
  ];
  return {
    venue: v,
    tokens: raw.filter(Boolean).map(normalize),
  };
});

export interface SearchResult {
  venue: Venue;
  matchType: 'exact' | 'partial';
}

export function searchVenues(query: string): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const exactMatches: SearchResult[] = [];
  const partialMatches: SearchResult[] = [];
  const seen = new Set<string>();

  for (const entry of index) {
    const v = entry.venue;
    const exactTokens = [v.name, v.keyword || '', getVenueLabel(v)].map(normalize);
    if (exactTokens.some((t) => t === q)) {
      exactMatches.push({ venue: v, matchType: 'exact' });
      seen.add(v.id);
    }
  }

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
