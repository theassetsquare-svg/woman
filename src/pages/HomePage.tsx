import { Link } from 'react-router-dom';
import { regions, venues, getRegionCount, getVenuesByRegion } from '../data/venues';
import VenueCard from '../components/VenueCard';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              2026 전국 호빠 디렉토리
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-2">
            서울 · 부산 · 수원 · 대전 · 광주 · 창원
          </p>
          <p className="text-sm text-gray-500 mb-8">
            2026년 기준 영업 확인된 <span className="text-purple-400 font-semibold">{venues.length}개</span> 업소 정보
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/venues"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              전체 목록 보기
            </Link>
            <a
              href="#regions"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-colors"
            >
              지역별 보기
            </a>
          </div>
        </div>
      </section>

      {/* Region Cards */}
      <section id="regions" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">지역별 호빠</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {regions.map((r) => {
            const count = getRegionCount(r.id);
            return (
              <Link
                key={r.id}
                to={`/region/${r.id}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-purple-700/50 transition-all group"
              >
                <div className="text-3xl mb-2">{r.emoji}</div>
                <h3 className="font-bold text-gray-100 group-hover:text-purple-400 transition-colors">
                  {r.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{count}곳</p>
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
          <section key={r.id} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {r.emoji} {r.name} 호빠
              </h2>
              <Link to={`/region/${r.id}`} className="text-sm text-purple-400 hover:text-purple-300">
                전체보기 &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionVenues.slice(0, 3).map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Info Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-800/30 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-3">2026년 영업 확인 완료</h3>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            본 디렉토리는 2026년 기준 영업 중인 호빠만 수록하고 있습니다.
            폐업 및 휴업 업소는 포함하지 않으며, 방문 전 전화 확인을 권장합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
