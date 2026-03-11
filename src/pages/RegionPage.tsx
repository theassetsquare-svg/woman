import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { regions, venues, getVenuesByRegion, getRegionName } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

const BASE = 'https://woman-5nj.pages.dev';

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const allRegionVenues = regionId ? venues.filter((v) => v.region === regionId) : [];
  const isNightRegion = allRegionVenues.length > 0 && allRegionVenues.every((v) => v.category);
  const venueList = isNightRegion ? allRegionVenues : (regionId ? getVenuesByRegion(regionId) : []);

  const regionHook: Record<string, { title: string; desc: string }> = {
    gangnam: {
      title: '강남호빠 TOP 4 — 실패 없는 선택법 공개',
      desc: '역삼·테헤란로에서 검증된 4곳을 선수 수준·초이스 방식·영업시간까지 낱낱이 비교합니다. 정찰제부터 완전예약제까지 특성별로 골라보세요',
    },
    geondae: {
      title: '건대호빠 — 단골이 입 다무는 검증된 1곳',
      desc: '건대입구역 도보 3분 거리, 10년 생존한 이유를 선수·분위기·시스템으로 직접 확인하세요. 성수·광진 직장인 모임에 딱 맞는 에너지가 있습니다',
    },
    jangan: {
      title: '장안동호빠 TOP 3 — 프라이빗 끝판왕 대결',
      desc: '동대문구에서 검증 완료된 3곳, 룸 구조·선수진·초이스 횟수까지 전격 해부합니다. 100명 출근 대형부터 편안한 소규모까지 비교 가이드 제공',
    },
    busan: {
      title: '부산호빠 TOP 10 — 해운대부터 하단까지 총정리',
      desc: '해운대·광안리·연산동·수영구 10곳을 전수 조사했습니다. 지역별 에이스 선수 위치와 분위기·시스템 차이를 한눈에 비교할 수 있습니다',
    },
    gyeonggi: {
      title: '수원호빠 TOP 4 — 인계동 서울급 반전 매력',
      desc: '인계동 검증된 4곳을 현장 확인했습니다. 새벽 8시까지 논스톱 영업하는 곳부터 신축 시설로 압도하는 곳까지 특징별 비교 가이드를 확인하세요',
    },
    daejeon: {
      title: '대전호빠 TOP 2 — 현지인만 아는 숨은 곳',
      desc: '둔산동·봉명동에서 검증 완료된 2곳입니다. 충청권 대표 가게의 선수·분위기·시스템을 밀착 취재한 결과를 정리했습니다. 전화 예약 후 방문 권장',
    },
    gwangju: {
      title: '광주호빠 — 호남권 유일무이 이 한 곳이면 끝',
      desc: '상무지구 번영로에서 검증 완료된 광주 유일의 가게입니다. 다른 곳 알아볼 필요 없는 이유를 선수·시스템·접근성까지 직접 확인하세요',
    },
    changwon: {
      title: '창원호빠 — 경남 대표 반드시 확인할 곳',
      desc: '상남동에서 검증 완료된 경남 대표 가게입니다. 1인 전담 TC 시스템으로 혼자 가도 걱정 없고, 둘이 와도 분리 운영이 가능한 유일한 곳입니다',
    },
    seoul: {
      title: '서울 나이트·클럽 — 수유·신림·상봉 핵심 3곳 총정리',
      desc: '수유샴푸나이트·신림그랑프리나이트·상봉동한국관나이트 현장 검증 완료. 지역별 특성과 입장 절차를 한눈에 비교하세요',
    },
    itaewon: {
      title: '이태원클럽 와이키키유토피아 — 현장 검증 리뷰',
      desc: '이태원 대표 클럽 와이키키유토피아의 입장 절차·분위기·교통편을 상세히 정리했습니다',
    },
    incheon: {
      title: '인천아라비안나이트 — 구월동 검증 완료 리뷰',
      desc: '인천 구월동 소재 아라비안나이트의 운영 시간·입장 안내·분위기를 현장 확인한 결과입니다',
    },
    ulsan: {
      title: '울산챔피언나이트 — 울산 대표 검증 리뷰',
      desc: '울산 소재 챔피언나이트의 현장 정보·운영 방식·교통 접근성을 직접 확인한 결과입니다',
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

  // Inject BreadcrumbList JSON-LD
  useEffect(() => {
    if (!region) return;

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
        { '@type': 'ListItem', position: 2, name: getRegionName(region.id), item: `${BASE}/${region.id}` },
      ],
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.dynamic = 'true';
    script.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [region]);

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
          {region.name} {isNightRegion ? '나이트·클럽' : '호빠'}
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
