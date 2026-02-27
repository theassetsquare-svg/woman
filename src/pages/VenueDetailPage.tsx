import { useParams, Link } from 'react-router-dom';
import { getVenueById, getRegionName, getVenuesByRegion } from '../data/venues';
import VenueCard from '../components/VenueCard';

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😢</p>
        <h1 className="text-2xl font-bold mb-2">업소를 찾을 수 없습니다</h1>
        <Link to="/venues" className="text-purple-400 hover:text-purple-300">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-300">홈</Link>
        <span>/</span>
        <Link to={`/region/${venue.region}`} className="hover:text-gray-300">{getRegionName(venue.region)}</Link>
        <span>/</span>
        <span className="text-gray-300">{venue.name}</span>
      </nav>

      {/* Main Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">{venue.name}</h1>
            <p className="text-gray-500">
              {getRegionName(venue.region)} · {venue.area}
            </p>
          </div>
          <span className="bg-green-900/40 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
            영업중
          </span>
        </div>

        <p className="text-gray-300 mb-6">{venue.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InfoRow label="주소" value={venue.address} />
          <InfoRow label="가격대" value={venue.price} highlight />
          <InfoRow label="영업시간" value={venue.hours} />
          <InfoRow label="연락처" value={venue.phone} />
        </div>

        <div className="flex flex-wrap gap-2">
          {venue.tags.map((tag) => (
            <span key={tag} className="text-sm bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-5 mb-10">
        <p className="text-sm text-yellow-300/80">
          ⚠️ 본 정보는 2026년 기준이며, 가격 및 영업시간은 변동될 수 있습니다. 방문 전 반드시 전화로 확인하시기 바랍니다.
        </p>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">
            같은 지역 다른 호빠
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <span className={`text-sm ${highlight ? 'text-purple-400 font-semibold' : 'text-gray-200'}`}>
        {value}
      </span>
    </div>
  );
}
