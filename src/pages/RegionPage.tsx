import { useParams, Link } from 'react-router-dom';
import { regions, getVenuesByRegion, getRegionName } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

  const regionHook: Record<string, { title: string; desc: string }> = {
    gangnam: {
      title: '강남호빠 어디가야 할지 모르겠다면? TOP 4 핵심 가이드',
      desc: '강남호빠 4곳 선수 퀄리티·분위기·시스템 집중 분석 — 처음이라도 실패 없이 고르는 법',
    },
    geondae: {
      title: '건대호빠 단골만 모인다 — 검증된 TOP 1 실전 리뷰',
      desc: '건대호빠 검증된 1곳 — 선수·분위기·시스템 낱낱이 파헤치기',
    },
    jangan: {
      title: '장안동호빠 프라이빗 끝판왕 — TOP 3 집중 탐구',
      desc: '장안동호빠 3곳 프라이빗 전격 해부 — 선수·룸·시스템으로 딱 맞는 곳 찾기',
    },
    busan: {
      title: '부산호빠 해운대 밤바다보다 화려한 — TOP 10 총정리',
      desc: '부산호빠 해운대·광안리 10곳 전수 조사 — 선수·분위기·시스템 낱낱이 공개',
    },
    gyeonggi: {
      title: '수원호빠 서울 안 부러운 반전 매력 — TOP 4 현장 점검',
      desc: '수원호빠 인계동 4곳 현장 확인 — 서울 안 가도 되는 이유, 선수·시스템·분위기 공개',
    },
    daejeon: {
      title: '대전호빠 현지인만 추천하는 숨겨진 핫플 — TOP 2 밀착 취재',
      desc: '대전호빠 둔산동·봉명동 2곳 밀착 탐방 — 현지인이 인정한 선수·분위기·시스템 공개',
    },
    gwangju: {
      title: '광주호빠 호남 대표 — 딱 한 곳이면 끝',
      desc: '광주호빠 호남권 대표 검증된 1곳 — 선수·분위기·시스템 전격 해부',
    },
    changwon: {
      title: '창원호빠 경남 유일무이 — 반드시 가봐야 할 곳',
      desc: '창원호빠 경남 대표 검증된 1곳 — 선수·분위기·시스템 현장 리포트',
    },
  };

  const hook = region ? regionHook[region.id] : null;

  useOgMeta(
    region && hook
      ? {
          title: hook.title,
          description: hook.desc,
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
