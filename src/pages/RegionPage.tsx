import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { regions, getVenuesByRegion, getRegionName, getRegionCount, getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

const BASE = 'https://woman-5nj.pages.dev';
const MAIN = getMainLink();

const regionHook: Record<string, { title: string; desc: string }> = {
  gangnam: {
    title: '강남 클럽·라운지·나이트 TOP 6 — 금요 밤 필수 코스',
    desc: '청담H2O나이트부터 아르쥬, 레이스, 사운드, 하입, 컬러까지. 강남권 핵심 6곳의 분위기·입장·예약 정보를 비교해 봤다.',
  },
  busan: {
    title: '부산연산동물나이트 — 따봉 실장 현장 검증 리뷰',
    desc: '부산 연산동 대표 나이트클럽. 따봉 실장이 직접 운영하는 현장의 사운드·분위기·입장 안내를 상세히 정리했습니다.',
  },
  gyeonggi: {
    title: '경기 나이트 TOP 5 — 성남·수원·파주·인덕원·일산 총정리',
    desc: '성남샴푸나이트, 수원찬스돔나이트, 파주야당스카이돔나이트, 인덕원국빈관나이트, 일산샴푸나이트 현장 검증 완료.',
  },
  seoul: {
    title: '서울 나이트 TOP 3 — 수유·신림·상봉 핵심 정리',
    desc: '수유샴푸나이트, 신림그랑프리나이트, 상봉동한국관나이트 현장 검증. 지역별 분위기와 입장 절차를 비교하세요.',
  },
  ulsan: {
    title: '울산챔피언나이트 — 춘자 실장 10년 직영 검증 리뷰',
    desc: '울산 현지인 10명 중 9명이 추천하는 대표 나이트. 춘자 실장 직영 현장의 모든 정보를 정리했습니다.',
  },
  incheon: {
    title: '인천아라비안나이트 — 이국적 콘셉트 현장 검증',
    desc: '인천 남동구 이국적 콘셉트 나이트클럽. 아라비안 테마 인테리어와 분위기를 현장에서 직접 확인한 결과입니다.',
  },
  daejeon: {
    title: '대전세븐나이트 — 충청권 전역에서 모이는 대표 무대',
    desc: '대전 서구 중심 세븐나이트. 세종·천안·청주에서도 원정 방문하는 이유를 사운드와 운영력으로 정리했습니다.',
  },
  itaewon: {
    title: '이태원클럽 와이키키유토피아 — 글로벌 파티 현장 검증',
    desc: '이태원 메인 스트리트, 한국인과 외국인이 어울리는 글로벌 파티 공간. 입장·분위기·교통편을 상세히 정리했습니다.',
  },
};

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

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
    return () => { document.head.removeChild(script); };
  }, [region]);

  if (!region) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-xl mb-3">지역을 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-sm">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-8" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">{getRegionName(region.id)}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2">{region.name} 나이트·클럽</h1>
        <p className="text-[#475569] text-sm leading-relaxed">
          {hook ? hook.desc : `검증된 ${venueList.length}곳 정보를 확인하세요.`}
        </p>
      </div>

      {/* Region pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {regions.filter((r) => getRegionCount(r.id) > 0).map((r) => (
          <Link
            key={r.id}
            to={`/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`region-pill text-sm ${r.id === regionId ? 'region-pill--active' : 'region-pill--inactive'}`}
            aria-current={r.id === regionId ? 'page' : undefined}
          >
            {r.name}
          </Link>
        ))}
      </div>

      {/* Venues */}
      {venueList.length === 0 ? (
        <div className="text-center py-20 text-[#475569]">
          <p className="text-base font-medium">이 지역에 등록된 업소가 없습니다.</p>
        </div>
      ) : (
        <div className="venue-grid">
          {venueList.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}

      {/* 메인 유입 CTA */}
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-mega-cta block mt-10"
      >
        <p className="text-lg font-black mb-1">103개 전체 업소 비교+랭킹</p>
        <p className="text-sm opacity-80">놀쿨에서 확인 →</p>
      </a>

      {/* Note */}
      <div className="note-box mt-10">
        <h3 className="text-base font-bold text-[#111111] mb-2">참고사항</h3>
        <ul className="text-sm text-[#475569] space-y-1.5 leading-relaxed">
          <li>영업시간 및 운영 조건은 변동될 수 있습니다.</li>
          <li>방문 전 반드시 전화로 영업 여부를 확인하세요.</li>
        </ul>
      </div>
    </div>
  );
}
