import { useParams, Link } from 'react-router-dom';
import { regions, getVenuesByRegion, getRegionName } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

  const regionAreas: Record<string, string> = {
    gangnam: '안 가본 사람은 있어도 한 번만 간 사람은 없다',
    geondae: '아는 사람만 가는 숨은 보석',
    jangan: '프라이빗 끝판왕, 아는 사람만 안다',
    busan: '해운대 밤바다보다 화려한 부산의 밤',
    gyeonggi: '서울 안 부러운 수원의 반전 매력',
    daejeon: '현지인만 아는 대전 숨겨진 핫플',
    gwangju: '호남 대표, 여기만 가면 된다',
    changwon: '경남 유일무이, 반드시 가봐야 할 곳',
  };

  useOgMeta(
    region
      ? {
          title: `${region.name}호빠 추천 TOP ${venueList.length} — ${regionAreas[region.id] ?? ''}`,
          description: `${region.name} 호빠 ${venueList.length}곳 완전 분석 — 선수·분위기·시스템 비교하고 후회 없는 선택하세요`,
          image: '',
          url: `/${region.id}`,
        }
      : { title: '지역을 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!region) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center">
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
      <nav className="breadcrumb mb-10" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">{getRegionName(region.id)}</span>
      </nav>

      <div className="mb-10">
        <h1 className="mb-3">
          {region.name} 호빠
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-xl">
          영업 확인된 {venueList.length}개 업소 정보를 확인하세요.
        </p>
      </div>

      {/* Region Nav */}
      <div className="flex flex-wrap gap-2.5 mb-10" role="group" aria-label="지역 선택">
        {regions.map((r) => (
          <Link
            key={r.id}
            to={`/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`region-pill ${
              r.id === regionId
                ? 'region-pill--active'
                : 'region-pill--inactive'
            }`}
            aria-current={r.id === regionId ? 'page' : undefined}
          >
            {r.name}
          </Link>
        ))}
      </div>

      {/* Venue List */}
      {venueList.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
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
      <div className="note-box mt-14">
        <h3 className="text-lg font-bold text-navy mb-3">참고사항</h3>
        <ul className="text-base text-text-muted space-y-2 leading-relaxed">
          <li>영업시간 및 운영 조건은 변동될 수 있습니다.</li>
          <li>방문 전 반드시 전화로 영업 여부를 확인하세요.</li>
          <li>본 사이트는 정보 제공 목적이며, 업소와 직접적인 관련이 없습니다.</li>
        </ul>
      </div>
    </div>
  );
}
