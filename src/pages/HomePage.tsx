import { Link } from 'react-router-dom';
import { regions, venues, getRegionCount, getVenuesByRegion } from '../data/venues';
import VenueCard from '../components/VenueCard';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">
            2026 NIGHTLIFE DIRECTORY
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-tight mb-5">
            전국 호빠 디렉토리
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-3 leading-relaxed">
            서울 · 부산 · 수원 · 대전 · 광주 · 창원
          </p>
          <p className="text-base text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            2026년 영업 확인 완료,{' '}
            <span className="text-white font-bold">{venues.length}개</span> 업소의
            위치, 가격, 영업시간 정보를 제공합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/venues"
              className="px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-accent/30"
            >
              전체 목록 보기
            </Link>
            <a
              href="#regions"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-base border border-white/20"
            >
              지역별 보기
            </a>
          </div>
        </div>
      </section>

      {/* Region Cards */}
      <section id="regions" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-3">지역별 호빠</h2>
          <p className="text-text-muted text-base max-w-lg mx-auto leading-relaxed">
            원하는 지역을 선택하면 그 지역의 모든 업소 정보를 확인할 수 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {regions.map((r) => {
            const count = getRegionCount(r.id);
            return (
              <Link
                key={r.id}
                to={`/region/${r.id}`}
                className="bg-surface border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-accent/30 transition-all group"
              >
                <div className="text-4xl mb-3" aria-hidden="true">{r.emoji}</div>
                <h3 className="text-base font-bold text-navy group-hover:text-accent transition-colors">
                  {r.name}
                </h3>
                <p className="text-sm text-text-muted mt-1.5 font-medium">{count}곳</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured by Region */}
      {regions.map((r) => {
        const regionVenues = getVenuesByRegion(r.id);
        if (regionVenues.length === 0) return null;
        return (
          <section key={r.id} className="max-w-6xl mx-auto px-5 md:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl">
                {r.emoji} {r.name} 호빠
              </h2>
              <Link
                to={`/region/${r.id}`}
                className="text-[15px] text-accent hover:text-accent-hover font-semibold"
              >
                전체보기 &rarr;
              </Link>
            </div>
            <div className="venue-grid">
              {regionVenues.slice(0, 3).map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Info Banner */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16">
        <div className="bg-navy rounded-2xl p-10 md:p-14 text-center">
          <h3 className="text-2xl font-extrabold text-white mb-4">2026년 영업 확인 완료</h3>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            본 디렉토리는 2026년 영업 확인된 호빠만 수록하고 있습니다.
            폐업 및 휴업 업소는 포함하지 않으며, 방문 전 전화 확인을 권장합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
