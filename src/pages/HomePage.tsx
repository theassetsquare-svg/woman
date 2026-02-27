import { Link } from 'react-router-dom';
import { regions, venues, getRegionCount, getVenuesByRegion } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';
import SearchBox from '../components/SearchBox';

export default function HomePage() {
  useOgMeta({
    title: '전국 호빠 추천 TOP 25 — 서울·부산·수원 완벽 가이드',
    description: '전국 호빠 디렉토리 — 서울, 부산, 수원, 대전, 광주, 창원 영업중 호스트바 정보',
    image: '',
    url: '',
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">
            NIGHTLIFE DIRECTORY
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-tight mb-5">
            전국 호빠 추천 TOP {venues.length}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-3 leading-relaxed">
            서울 · 부산 · 수원 · 대전 · 광주 · 창원
          </p>
          <p className="text-base text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            영업 확인된{' '}
            <span className="text-white font-bold">{venues.length}개</span> 업소의
            위치, 영업시간 정보를 한눈에 비교하세요.
          </p>
          {/* Search Box */}
          <div className="mb-8">
            <SearchBox />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/venues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-accent/30"
            >
              전체 목록 보기
            </Link>
            <a
              href="#regions"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-base border border-white/20"
            >
              지역별 보기
            </a>
          </div>
        </div>
      </section>

      {/* Hooking Section 1 — 첫 방문 필독 */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-6">
        <div className="bg-gradient-to-br from-navy via-[#1a2744] to-[#0c1a30] rounded-2xl p-8 md:p-10 border border-accent/20 shadow-xl shadow-accent/5">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-2">첫 방문이라면 반드시 읽으세요</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">
            호빠 처음 가는 분들이<br className="md:hidden" /> 가장 많이 하는 <span className="text-accent">5가지 실수</span>
          </h2>
          <div className="space-y-4">
            {[
              { num: '01', title: '아무 가게나 들어간다', desc: '검증 안 된 가게에 가면 바가지 확률 80%. 후기 0건인 곳은 피하세요.' },
              { num: '02', title: '가격을 미리 안 물어본다', desc: 'TC(테이블차지)·주류비·봉사료 — 3가지를 전화로 꼭 확인하세요. 현장에서 물어보면 이미 늦습니다.' },
              { num: '03', title: '금요일 밤 11시에 간다', desc: '대기 30분은 기본. 평일 10시가 선수 선택권도 넓고 서비스도 2배 좋습니다.' },
              { num: '04', title: '"싼 곳"만 찾는다', desc: 'TC 5만원 vs 15만원 — 가격 차이의 핵심은 선수 퀄리티입니다. 1인당 2만원 아끼려다 밤을 통째로 날리는 경우가 많습니다.' },
              { num: '05', title: '혼자 가기 무섭다고 포기한다', desc: '실제로 첫 방문객의 40%가 1인 방문. 혼자 가면 오히려 실장이 더 신경 써줍니다.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-4 items-start bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <span className="text-accent font-black text-lg shrink-0 w-8">{item.num}</span>
                <div>
                  <p className="text-white font-bold text-[15px] mb-1">{item.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hooking Section 2 — 내부자 팁 */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-accent/30 transition-all">
            <p className="text-2xl mb-3" aria-hidden="true">💡</p>
            <h3 className="text-lg font-extrabold text-navy mb-2">실장에게 이 한마디만 하세요</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              "초이스 몇 번까지 되나요?" — 이 질문 하나로 가게 수준을 바로 파악할 수 있습니다.
              무제한 초이스를 자신 있게 말하는 곳이 선수 퀄리티에 자신 있는 곳입니다.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-accent/30 transition-all">
            <p className="text-2xl mb-3" aria-hidden="true">🕐</p>
            <h3 className="text-lg font-extrabold text-navy mb-2">요일별 꿀타임이 다릅니다</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              월~목 밤 10시 = 선수 선택권 최대, 금토 밤 9시 = 분위기 최고.
              일요일은 쉬는 곳이 많으니 반드시 전화 확인 후 방문하세요.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-accent/30 transition-all">
            <p className="text-2xl mb-3" aria-hidden="true">📍</p>
            <h3 className="text-lg font-extrabold text-navy mb-2">강남 vs 장안동 vs 해운대</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              강남 = 최고급 선수 + 높은 가격, 장안동 = 가성비 + 프라이빗 룸,
              해운대 = 관광지 분위기 + 파티형. 취향에 따라 지역부터 정하세요.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-accent/30 transition-all">
            <p className="text-2xl mb-3" aria-hidden="true">⚠️</p>
            <h3 className="text-lg font-extrabold text-navy mb-2">이런 가게는 무조건 피하세요</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              전화 시 가격을 안 알려주는 곳, 후기가 전혀 없는 곳, "일단 오시면 됩니다"만 반복하는 곳.
              이 3가지 중 하나라도 해당되면 다른 곳을 찾으세요.
            </p>
          </div>
        </div>
      </section>

      {/* Region Cards */}
      <section id="regions" className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
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
                to={`/${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
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
                to={`/${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
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

      {/* Hooking Section 3 — 예산별 가이드 */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        <div className="bg-gradient-to-br from-navy via-[#1a2744] to-[#0c1a30] rounded-2xl p-8 md:p-10 border border-accent/20">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-2">예산별 완벽 가이드</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">
            내 예산에 맞는 호빠는<br className="md:hidden" /> <span className="text-accent">어디일까?</span>
          </h3>
          <div className="space-y-3">
            {[
              { budget: '10만원 이하', tag: '가성비', desc: '장안동·창원 지역 추천. TC + 기본 주류 포함 세트로 부담 없이 즐길 수 있습니다. 첫 방문 테스트용으로 딱 좋습니다.', color: 'text-emerald-400' },
              { budget: '10~20만원', tag: '가장 인기', desc: '수원·대전·부산 대부분의 가게가 이 구간. 양주 세트 + 무제한 초이스까지 포함되는 가격대입니다.', color: 'text-blue-400' },
              { budget: '20~30만원', tag: '프리미엄', desc: '강남·해운대 인기 가게 기본 라인. 에이스급 선수 배정 확률이 확 올라가는 구간입니다.', color: 'text-purple-400' },
              { budget: '30만원 이상', tag: 'VIP', desc: '강남 탑급 가게 풀서비스. 전담 실장 배정, 프라이빗 룸, 프리미엄 주류 — 특별한 날을 위한 선택.', color: 'text-amber-400' },
            ].map((item) => (
              <div key={item.budget} className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`font-black text-base ${item.color}`}>{item.budget}</span>
                  <span className="text-[11px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-bold">{item.tag}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hooking Section 4 — CTA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10 pb-16">
        <div className="bg-surface border-2 border-accent/30 rounded-2xl p-8 md:p-10 text-center">
          <p className="text-4xl mb-4" aria-hidden="true">🔥</p>
          <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3">
            지금 이 순간에도 자리가 빠지고 있습니다
          </h3>
          <p className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed mb-6">
            금·토 밤 10시 이후는 인기 가게 대기 30분 이상.
            미리 전화해서 자리를 잡아두는 것이 현명한 선택입니다.
            아래에서 지역별 업소를 확인하고, 지금 바로 전화해보세요.
          </p>
          <Link
            to="/venues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-accent/30"
          >
            전국 {venues.length}곳 한눈에 비교하기
          </Link>
        </div>
      </section>
    </div>
  );
}
