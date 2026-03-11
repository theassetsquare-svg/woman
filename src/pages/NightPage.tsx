import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNightVenuesByArea, getNightVenues, getVenueLabel } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';

export default function NightPage() {
  const grouped = getNightVenuesByArea();
  const allNightVenues = getNightVenues();

  useOgMeta({
    title: '전국 나이트·클럽·라운지 — 지역별 총정리',
    description: '부산·강남·수원·대전·인천·울산 나이트클럽, 클럽, 라운지 정보를 한눈에 비교하세요',
    image: '',
    url: '/night',
  });

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '전국 나이트·클럽·라운지 목록',
      numberOfItems: allNightVenues.length,
      itemListElement: allNightVenues.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: v.name,
        url: `https://woman-5nj.pages.dev${venuePath(v)}`,
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.dynamic = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [allNightVenues]);

  const categoryLabel = (cat?: string) => {
    if (cat === 'club') return '클럽';
    if (cat === 'lounge') return '라운지';
    return '나이트';
  };

  const categoryColor = (cat?: string) => {
    if (cat === 'club') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (cat === 'lounge') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Header */}
      <nav className="breadcrumb mb-10" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">나이트·클럽·라운지</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">
          전국 나이트·클럽·라운지
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-xl">
          지역별로 정리된 나이트클럽, 클럽, 라운지 정보를 확인하세요.
        </p>
      </div>

      {/* Grouped by area */}
      {grouped.map(({ area, venues }) => (
        <section key={area} className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-6 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-accent rounded-full" />
            {area}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((v) => (
              <Link
                key={v.id}
                to={venuePath(v)}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl border border-border p-6 hover:border-accent/40 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColor(v.category)}`}>
                    {categoryLabel(v.category)}
                  </span>
                  {v.contact && (
                    <span className="text-xs font-semibold text-text-muted bg-slate-100 px-2.5 py-1 rounded-full">
                      {v.contact} 실장
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-navy group-hover:text-accent transition-colors mb-2">
                  {getVenueLabel(v)}
                </h3>

                {/* Info */}
                <p className="text-sm text-text-muted mb-3 line-clamp-2">{v.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span>{v.hours}</span>
                  {v.phone !== '별도문의' && (
                    <span className="font-semibold text-accent">{v.phone}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Note */}
      <div className="note-box mt-10">
        <h3 className="text-lg font-bold text-navy mb-3">참고사항</h3>
        <ul className="text-base text-text-muted space-y-2 leading-relaxed">
          <li>영업시간 및 운영 조건은 변동될 수 있습니다.</li>
          <li>방문 전 반드시 전화로 영업 여부를 확인하세요.</li>
        </ul>
      </div>
    </div>
  );
}
