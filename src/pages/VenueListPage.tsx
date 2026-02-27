import { useState, useMemo } from 'react';
import { venues } from '../data/venues';
import VenueCard from '../components/VenueCard';
import RegionFilter from '../components/RegionFilter';

export default function VenueListPage() {
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">
        전체 호빠 목록
      </h1>
      <p className="text-gray-500 mb-8">
        2026년 기준 영업 확인된 전국 {venues.length}개 업소
      </p>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="업소명, 지역, 태그로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
        />
      </div>

      {/* Region Filter */}
      <div className="mb-8">
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-500">
        {filtered.length}개 업소
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">🔍</p>
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}
