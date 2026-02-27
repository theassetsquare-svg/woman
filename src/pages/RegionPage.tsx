import { useParams, Link } from 'react-router-dom';
import { regions, getVenuesByRegion, getRegionName } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

  const regionAreas: Record<string, string> = {
    gangnam: '역삼·강남 프리미엄 총정리',
    geondae: '건대입구 완벽 가이드',
    jangan: '장안동·동대문 총정리',
    busan: '해운대·광안리 총정리',
    gyeonggi: '수원 인계동 총정리',
    daejeon: '둔산동·봉명동 총정리',
    gwangju: '상무지구 대표',
    changwon: '상남동 완벽 가이드',
  };

  useOgMeta(
    region
      ? {
          title: `${region.name}호빠 추천 TOP ${venueList.length} — ${regionAreas[region.id] ?? ''}`,
          description: `${region.name} 영업중 호빠 ${venueList.length}곳 — 위치, 영업시간 비교`,
          image: '',
          url: `/${region.id}`,
        }
      : { title: '지역을 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!region) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center">
        <p className="text-5xl mb-5" aria-hidden="true">😢</p>
        <h1 className="text-2xl mb-3">지역을 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-base">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-text-muted mb-10" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-navy transition-colors">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">{getRegionName(region.id)}</span>
      </nav>

      <div className="mb-10">
        <h1 className="mb-3">
          {region.emoji} {region.name} 호빠
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-xl">
          영업 확인된 {venueList.length}개 업소 정보를 확인하세요.
        </p>
      </div>

      {/* Region Nav */}
      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="지역 선택">
        {regions.map((r) => (
          <Link
            key={r.id}
            to={`/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
              r.id === regionId
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-slate-100 text-text-muted hover:bg-slate-200 hover:text-navy'
            }`}
            aria-current={r.id === regionId ? 'page' : undefined}
          >
            {r.emoji} {r.name}
          </Link>
        ))}
      </div>

      {/* Venue List */}
      {venueList.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
          <p className="text-5xl mb-5" aria-hidden="true">🔍</p>
          <p className="text-lg font-medium">이 지역에 등록된 업소가 없습니다.</p>
        </div>
      ) : (
        <div className="venue-grid">
          {venueList.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-14 bg-surface border border-border rounded-2xl p-7">
        <h3 className="text-lg font-bold text-navy mb-3">참고사항</h3>
        <ul className="text-base text-text-muted space-y-2 leading-relaxed">
          <li>• 가격 및 영업시간은 변동될 수 있습니다.</li>
          <li>• 방문 전 반드시 전화로 영업 여부를 확인하세요.</li>
          <li>• 본 사이트는 정보 제공 목적이며, 업소와 직접적인 관련이 없습니다.</li>
        </ul>
      </div>
    </div>
  );
}
