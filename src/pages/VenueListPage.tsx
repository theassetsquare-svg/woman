import { useState, useMemo } from 'react';
import { venues } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';
import RegionFilter from '../components/RegionFilter';

export default function VenueListPage() {
  useOgMeta({
    title: `호빠 ${venues.length}곳 한눈에 비교 — 지역별 맞춤 검색`,
    description: `강남·해운대·수원·대전 영업 확인된 ${venues.length}곳을 한 페이지에서 비교. 지역·분위기 필터로 나에게 딱 맞는 곳을 바로 찾아보세요`,
    image: '',
    url: '/venues',
  });

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const regionMatch = selectedRegion === 'all' || v.region === selectedRegion;
      const searchMatch =
        search === '' ||
        v.name.includes(search) ||
        v.area.includes(search) ||
        v.address.includes(search) ||
        v.tags.some((t) => t.includes(search));
      return regionMatch && searchMatch;
    });
  }, [selectedRegion, search]);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="mb-3">전체 호빠 목록</h1>
        <p className="text-text-muted text-base leading-relaxed max-w-xl">
          전국 {venues.length}개 업소를 검색하고 비교해 보세요.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="venue-search" className="sr-only">업소 검색</label>
        <input
          id="venue-search"
          type="text"
          placeholder="업소명, 지역, 태그로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input md:w-[420px]"
        />
      </div>

      {/* Region Filter */}
      <div className="mb-10">
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
      </div>

      {/* Results */}
      <p className="mb-5 text-base text-text-muted font-medium">
        {filtered.length}개 업소
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
          <p className="text-lg font-medium">검색 결과가 없습니다.</p>
          <p className="text-base mt-2">다른 키워드로 검색해 보세요.</p>
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
