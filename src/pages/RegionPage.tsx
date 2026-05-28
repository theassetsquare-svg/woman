import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { regions, getVenuesByRegion, getRegionName, getRegionCount, getMainLink } from '../data/venues';
import { regionSeo } from '../data/regionSeo';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

const BASE = 'https://woman-5nj.pages.dev';
const MAIN = getMainLink();

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = regions.find((r) => r.id === regionId);
  const venueList = regionId ? getVenuesByRegion(regionId) : [];

  const seo = region ? regionSeo[region.id] : null;

  useOgMeta(
    region
      ? {
          title: seo?.title || `${getRegionName(region.id)} 밤문화 가이드`,
          description: seo?.desc || `${getRegionName(region.id)} 지역 밤문화 정보를 정리했습니다.`,
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
        <h1 className="mb-2">{region.name} 밤문화 가이드</h1>
        <p className="text-[#475569] text-sm leading-relaxed">
          {seo ? seo.desc : `${region.name} 지역 검증된 ${venueList.length}곳 정보를 확인하세요.`}
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
