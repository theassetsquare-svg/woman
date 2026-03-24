import { useState, useMemo, useEffect } from 'react';
import { venues, regions, getRegionCount, getVenueLabel } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';
import VenueCard from '../components/VenueCard';

export default function VenueListPage() {
  useOgMeta({
    title: `전국 나이트·클럽·라운지 ${venues.length}곳 — 지역별 필터 검색`,
    description: `강남부터 울산까지 현장 검증된 업소만 모았습니다. 분위기·실장·카테고리별로 내게 맞는 곳을 골라보세요`,
    image: '',
    url: '/venues',
  });

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '전국 나이트·클럽·라운지 목록',
      numberOfItems: venues.length,
      itemListElement: venues.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: getVenueLabel(v),
        url: `https://woman-5nj.pages.dev${venuePath(v)}`,
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.dynamic = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const regionMatch = selectedRegion === 'all' || v.region === selectedRegion;
      const catMatch = selectedCat === 'all' || v.category === selectedCat;
      const searchMatch =
        search === '' ||
        v.name.includes(search) ||
        v.area.includes(search) ||
        (v.keyword && v.keyword.includes(search)) ||
        v.tags.some((t) => t.includes(search));
      return regionMatch && catMatch && searchMatch;
    });
  }, [selectedRegion, selectedCat, search]);

  const activeRegions = regions.filter((r) => getRegionCount(r.id) > 0);

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">전체 업소 목록</h1>
        <p className="text-[#475569] text-sm leading-relaxed">
          전국 {venues.length}곳을 검색하고 비교하세요.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label htmlFor="venue-search" className="sr-only">업소 검색</label>
        <input
          id="venue-search"
          type="text"
          placeholder="업소명, 지역, 태그로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'all', label: '전체' },
          { value: 'night', label: '나이트' },
          { value: 'club', label: '클럽' },
          { value: 'lounge', label: '라운지' },
          { value: 'room', label: '룸' },
          { value: 'yojeong', label: '요정' },
          { value: 'hoppa', label: '호빠' },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCat(cat.value)}
            className={`region-pill text-sm ${selectedCat === cat.value ? 'region-pill--active' : 'region-pill--inactive'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedRegion('all')}
          className={`region-pill text-sm ${selectedRegion === 'all' ? 'region-pill--active' : 'region-pill--inactive'}`}
        >
          전체
        </button>
        {activeRegions.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRegion(r.id)}
            className={`region-pill text-sm ${selectedRegion === r.id ? 'region-pill--active' : 'region-pill--inactive'}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="mb-4 text-sm text-[#475569] font-medium">
        {filtered.length}개 업소
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#475569]">
          <p className="text-base font-medium">검색 결과가 없습니다.</p>
          <p className="text-sm mt-2">다른 키워드로 검색해 보세요.</p>
        </div>
      ) : (
        <div className="venue-grid">
          {filtered.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}
