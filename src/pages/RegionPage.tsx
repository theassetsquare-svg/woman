import { useParams, Link } from 'react-router-dom';
import { regions, getVenuesByRegion, getRegionName } from '../data/venues';
import VenueCard from '../components/VenueCard';

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

  if (!region) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😢</p>
        <h1 className="text-2xl font-bold mb-2">지역을 찾을 수 없습니다</h1>
        <Link to="/venues" className="text-purple-400 hover:text-purple-300">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-300">홈</Link>
        <span>/</span>
        <span className="text-gray-300">{getRegionName(region.id)}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">
          {region.emoji} {region.name} 호빠
        </h1>
        <p className="text-gray-500">
          2026년 기준 영업 확인된 {venueList.length}개 업소
        </p>
      </div>

      {/* Region Nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {regions.map((r) => (
          <Link
            key={r.id}
            to={`/region/${r.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              r.id === regionId
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {r.emoji} {r.name}
          </Link>
        ))}
      </div>

      {/* Venue List */}
      {venueList.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">🔍</p>
          <p>이 지역에 등록된 업소가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venueList.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-10 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-2 text-purple-400">참고사항</h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• 가격 및 영업시간은 변동될 수 있습니다.</li>
          <li>• 방문 전 반드시 전화로 영업 여부를 확인하세요.</li>
          <li>• 본 사이트는 정보 제공 목적이며, 업소와 직접적인 관련이 없습니다.</li>
        </ul>
      </div>
    </div>
  );
}
