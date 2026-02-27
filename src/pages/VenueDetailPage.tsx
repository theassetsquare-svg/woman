import { useParams, Link } from 'react-router-dom';
import { getVenueById, getRegionName, getVenuesByRegion } from '../data/venues';
import VenueCard from '../components/VenueCard';

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;

  if (!venue) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center">
        <p className="text-5xl mb-5" aria-hidden="true">😢</p>
        <h1 className="text-2xl mb-3">업소를 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-base">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-text-muted mb-10" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-navy transition-colors">홈</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/region/${venue.region}`} target="_blank" rel="noopener noreferrer" className="hover:text-navy transition-colors">{getRegionName(venue.region)}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">{venue.name}</span>
      </nav>

      {/* Main Info Card */}
      <article className="bg-surface border border-border rounded-2xl p-7 md:p-10 mb-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-3xl md:text-[2.25rem] mb-2">{venue.name}</h1>
            <p className="text-text-muted text-base font-medium">
              {getRegionName(venue.region)} · {venue.area}
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 whitespace-nowrap">
            영업중
          </span>
        </div>

        <p className="text-text text-base leading-relaxed mb-8 max-w-[680px]">{venue.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <InfoRow icon="📍" label="주소" value={venue.address} />
          <InfoRow icon="💰" label="가격대" value={venue.price} highlight />
          <InfoRow icon="🕐" label="영업시간" value={venue.hours} />
          <InfoRow icon="📞" label="연락처" value={venue.phone} />
        </div>

        <div className="flex flex-wrap gap-2">
          {venue.tags.map((tag) => (
            <span key={tag} className="text-sm bg-purple-50 text-accent px-3.5 py-1.5 rounded-full font-semibold border border-purple-200">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-12" role="alert">
        <p className="text-[15px] text-amber-800 leading-relaxed">
          <strong>안내:</strong> 본 정보는 2026년 확인 자료이며, 가격 및 영업시간은 변동될 수 있습니다. 방문 전 반드시 전화로 확인하시기 바랍니다.
        </p>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl mb-6">같은 지역 다른 호빠</h2>
          <div className="venue-grid">
            {related.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border">
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <div>
        <span className="text-sm text-text-muted font-medium block mb-0.5">{label}</span>
        <span className={`text-base font-semibold ${highlight ? 'text-accent' : 'text-navy'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
