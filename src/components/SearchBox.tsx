import { useState, useRef, useEffect } from 'react';
import { searchVenues, type SearchResult } from '../utils/searchIndex';
import { getRegionName } from '../data/venues';
import { venuePath } from '../utils/slug';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }
    const r = searchVenues(query);
    setResults(r.slice(0, 8));
    setOpen(true);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto">
      <label htmlFor="hero-search" className="sr-only">업소 검색</label>
      <input
        id="hero-search"
        type="text"
        placeholder="업소명으로 검색 (예: 보스턴, 미슐랭, 비스트...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full bg-white text-navy rounded-xl px-5 py-4 text-base placeholder-slate-400 border-0 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-lg"
        autoComplete="off"
      />

      {open && results.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          role="listbox"
        >
          {results.map((r) => (
            <li key={r.venue.id} role="option">
              <a
                href={venuePath(r.venue)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-3.5 hover:bg-purple-50 transition-colors border-b border-border/50 last:border-b-0 no-underline"
                onClick={() => setOpen(false)}
              >
                <div className="min-w-0">
                  <span className="text-base font-bold text-navy block truncate">
                    {r.venue.name}
                  </span>
                  <span className="text-sm text-text-muted">
                    {getRegionName(r.venue.region)} · {r.venue.area}
                  </span>
                </div>
                <span className="text-sm text-accent font-semibold whitespace-nowrap ml-4">
                  상세보기 &rarr;
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border p-5 text-center z-50">
          <p className="text-text-muted text-base">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
