import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { regions, venues, getRegionCount, getVenuesByRegion, getContactVenues, getVenueLabel, getVenueById } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';
import VenueCard from '../components/VenueCard';
import SearchBox from '../components/SearchBox';
import { SlideUpCTA, ScrollBanner, Top10Hook, TodayRecommendHook, FullCompareHook, PullToRefresh } from '../components/HookingWidgets';
import { EngagementSidebar, EndlessFeed } from '../components/EngagementEngine';

export default function HomePage() {
  const activeRegions = regions.filter((r) => getRegionCount(r.id) > 0);
  const contactVenues = getContactVenues();
  const premiumVenues = [getVenueById('ilsan-myeongwolgwan'), getVenueById('ilsan-room')].filter(Boolean);

  useOgMeta({
    title: '전국 나이트·클럽·라운지·룸·요정·호빠 TOP 103',
    description: '전국 103곳 현장 검증 완료. 실장 연락처부터 분위기까지 한눈에 비교하세요.',
    image: '',
    url: '',
    isHome: true,
  });

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div>
      {/* Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} />

      {/* Hero */}
      <section className="hero-section">
        <div className="relative px-4 py-12 text-center">
          <p className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 animate-fade-in">
            여성이 편안한 밤문화
          </p>
          <h1 className="text-3xl font-extrabold text-[#111111] leading-tight mb-3 animate-fade-in-up">
            전국 나이트·클럽·라운지<br />
            룸·요정·호빠 <span className="text-accent">TOP {venues.length}</span>
          </h1>
          <p className="text-sm text-[#333333] mb-6 leading-relaxed">
            현장 검증된 <span className="font-bold">{venues.length}곳</span>의 분위기·실장·입장 정보
          </p>
          <div className="mb-6">
            <SearchBox />
          </div>
          {/* 인기검색어 — 실제 103개에 있는 것만 */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {['일산 룸', '일산 요정', '강남 클럽', '압구정 클럽', '강남 호빠', '부산 나이트', '수원 나이트', '홍대 클럽', '이태원 클럽'].map((tag) => (
              <Link
                key={tag}
                to="/venues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#333333] bg-white border border-rosegold px-3 py-1.5 rounded-full hover:bg-surface-warm hover:text-accent transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ★ PREMIUM — 일산명월관요정 + 일산룸 ★ */}
      <section className="px-4 pt-6 pb-4">
        <div className="premium-section p-1 rounded-2xl">
          <div className="flex items-center gap-2 px-4 pt-4 mb-3">
            <span className="text-xs font-black text-[#B8860B] bg-[#FFF8DC] px-2.5 py-1 rounded-full border border-[#DAA520]">PREMIUM</span>
            <span className="text-xs font-semibold text-[#333333]">신실장 010-3695-4929</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-3 pb-4">
            {premiumVenues.map((v) => v && (
              <Link
                key={v.id}
                to={venuePath(v)}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card block p-4 rounded-xl text-center"
              >
                <p className="text-lg font-black text-[#111111] mb-1 leading-tight">{getVenueLabel(v)}</p>
                <p className="text-xs text-[#555555] mb-3">{v.area}</p>
                <a
                  href="tel:01036954929"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-bold text-white bg-[#DAA520] px-4 py-2 rounded-lg hover:bg-[#B8860B] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  신실장 전화하기
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 실장 연락처 공개 */}
      <section className="px-4 py-4">
        <div className="hooking-warm p-5">
          <p className="text-accent text-xs font-bold tracking-[0.15em] uppercase mb-2">실장 직영 · 전화 예약 가능</p>
          <h2 className="text-lg font-extrabold text-[#111111] mb-4 leading-tight">
            실장 연락처 공개 <span className="text-accent">{contactVenues.length}곳</span>
          </h2>
          <div className="space-y-2.5">
            {contactVenues.map((v) => (
              <div key={v.id} className="hooking-item">
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <span className="text-accent font-black text-sm">{v.contact}</span>
                  <span className="text-xs text-[#555555]">실장</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={venuePath(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] font-bold text-sm hover:text-accent transition-colors block truncate"
                  >
                    {getVenueLabel(v)}
                  </Link>
                  <p className="text-[#475569] text-xs mt-0.5">{v.area} · {v.hours}</p>
                </div>
                <a
                  href={`tel:${v.phone.replace(/-/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-bold text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  {v.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [A] 오늘 갈 곳 룰렛 */}
      <section className="px-4 py-6">
        <RouletteWidget />
      </section>

      {/* TOP 10 — 3위까지만 */}
      <section className="px-4 py-4">
        <Top10Hook items={[
          { rank: 1, name: getVenueLabel(venues[0]) },
          { rank: 2, name: getVenueLabel(venues[2]) },
          { rank: 3, name: getVenueLabel(venues[3]) },
        ]} />
      </section>

      {/* [B] VS 대결 투표 */}
      <section className="px-4 py-4">
        <VSBattleWidget />
      </section>

      {/* [D] 첫 방문 가이드 */}
      <section className="px-4 py-4">
        <div className="space-y-3">
          {[
            { title: '입장 전 반드시 확인할 것', desc: '드레스코드, 입장 시간, 테이블 예약 여부. 이 세 가지만 전화로 확인하면 현장에서 당황할 일이 없습니다.' },
            { title: '금요일 밤 10시 = 피크타임', desc: '대기가 길어지기 전인 9시~9시 30분에 도착하면 좋은 자리 선점이 가능합니다. 평일은 더 여유롭습니다.' },
            { title: '혼자 가도 괜찮을까?', desc: '1인 방문 비율이 생각보다 높습니다. 바 석에 앉으면 자연스럽고, 실장에게 미리 말하면 더 신경 써줍니다.' },
          ].map((item) => (
            <div key={item.title} className="tip-card">
              <h3 className="text-base font-extrabold text-[#111111] mb-1.5">{item.title}</h3>
              <p className="text-[#475569] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI 추천 티저 → 밤키 */}
      <section className="px-4 py-2">
        <TodayRecommendHook />
      </section>

      {/* [E] 인기 시간대 */}
      <section className="px-4 py-4">
        <PopularTimeWidget />
      </section>

      {/* Region Cards */}
      <section id="regions" className="px-4 py-6">
        <div className="section-header">
          <h2 className="text-[#111111] mb-2">지역별 업소</h2>
          <p className="text-[#475569] text-sm mt-4">원하는 지역을 선택하세요.</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {activeRegions.slice(0, 15).map((r) => (
            <Link
              key={r.id}
              to={`/${r.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="region-card group"
            >
              <h3 className="text-sm font-bold text-[#111111] group-hover:text-accent transition-colors">
                {r.name}
              </h3>
              <p className="text-xs text-[#475569] mt-0.5 font-medium">{getRegionCount(r.id)}곳</p>
            </Link>
          ))}
        </div>
        {activeRegions.length > 15 && (
          <Link
            to="/venues"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-accent font-semibold mt-4 hover:text-accent-hover"
          >
            전체 {activeRegions.length}개 지역 보기 →
          </Link>
        )}
      </section>

      {/* 103개 전체 비교 → 밤키 */}
      <section className="px-4 py-2">
        <FullCompareHook />
      </section>

      {/* Region Venue Previews — 가로 스와이프 (상위 10개 지역만) */}
      {activeRegions.slice(0, 10).map((r) => {
        const regionVenues = getVenuesByRegion(r.id);
        if (regionVenues.length === 0) return null;
        return (
          <section key={r.id} className="py-5">
            <div className="flex items-center justify-between mb-3 px-4">
              <h2 className="text-lg">{r.name}</h2>
              <Link to={`/${r.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover font-semibold transition-colors">
                전체보기 →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory">
              {regionVenues.map((v) => (
                <div key={v.id} className="shrink-0 w-[280px] snap-start">
                  <VenueCard venue={v} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* 중독 엔진 — 스트릭+미션+운세+진행률 */}
      <section className="px-4 py-6">
        <EngagementSidebar />
      </section>

      {/* 끝없는 탐험 피드 (틱톡식 무한스크롤) */}
      <section className="px-4 py-6">
        <EndlessFeed />
      </section>

      {/* CTA */}
      <section className="px-4 py-6 pb-10">
        <div className="cta-section p-6 text-center">
          <h3 className="text-lg font-extrabold text-[#111111] mb-2">
            지금 이 순간에도 자리가 빠지고 있습니다
          </h3>
          <p className="text-[#475569] text-sm leading-relaxed mb-6">
            금·토 밤 10시 이후는 인기 업소 대기 30분 이상. 미리 전화해서 자리를 잡아두세요.
          </p>
          <Link to="/venues" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
            전국 {venues.length}곳 비교하기
          </Link>
        </div>
      </section>

      {/* Floating widgets */}
      <SlideUpCTA />
      <ScrollBanner />
    </div>
  );
}

/** [A] 오늘 갈 곳 룰렛 */
function RouletteWidget() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof venues[0] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { clearTimeout(timerRef.current); };
  }, []);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    timerRef.current = setTimeout(() => {
      const random = venues[Math.floor(Math.random() * venues.length)];
      setResult(random);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="cta-section p-6 text-center">
      <h3 className="text-lg font-extrabold text-[#111111] mb-2">오늘 갈 곳 룰렛</h3>
      <p className="text-sm text-[#475569] mb-4">어디 갈지 고민될 때, 운명에 맡겨보세요.</p>
      <button
        onClick={spin}
        disabled={spinning}
        className="btn-primary text-sm mb-4"
      >
        {spinning ? '돌리는 중...' : '룰렛 돌리기'}
      </button>
      {result && (
        <div className="animate-fade-in-up mt-4 p-4 bg-surface-warm rounded-xl border-2 border-rosegold">
          <p className="text-xs text-accent font-bold mb-1">오늘의 추천</p>
          <Link
            to={venuePath(result)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-black text-[#111111] hover:text-accent transition-colors block"
          >
            {getVenueLabel(result)}
          </Link>
          <p className="text-sm text-[#475569] mt-1">{result.area} · {result.hours}</p>
        </div>
      )}
    </div>
  );
}

/** [B] VS 대결 투표 */
function VSBattleWidget() {
  const pair = useMemo(() => {
    const day = new Date().getDay();
    const a = venues[day % venues.length];
    const b = venues[(day + 7) % venues.length];
    return [a, b] as const;
  }, []);

  const [voted, setVoted] = useState<string | null>(null);
  const [counts, setCounts] = useState(() => ({
    a: 40 + Math.floor(Math.random() * 30),
    b: 40 + Math.floor(Math.random() * 30),
  }));

  const vote = (side: 'a' | 'b') => {
    if (voted) return;
    setVoted(side);
    setCounts((prev) => ({ ...prev, [side]: prev[side] + 1 }));
  };

  const total = counts.a + counts.b;
  const pctA = Math.round((counts.a / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div className="cta-section p-5">
      <h3 className="text-base font-extrabold text-[#111111] mb-1 text-center">이번주 VS 대결</h3>
      <p className="text-xs text-[#475569] mb-4 text-center">어디가 더 끌리세요?</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { side: 'a' as const, venue: pair[0], pct: pctA },
          { side: 'b' as const, venue: pair[1], pct: pctB },
        ].map(({ side, venue, pct }) => (
          <button
            key={side}
            onClick={() => vote(side)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              voted === side
                ? 'border-accent bg-surface-warm'
                : voted
                ? 'border-rosegold opacity-60'
                : 'border-rosegold hover:border-accent hover:bg-surface-warm'
            }`}
          >
            <p className="text-sm font-black text-[#111111] mb-1 leading-tight">{getVenueLabel(venue)}</p>
            <p className="text-xs text-[#475569]">{venue.area}</p>
            {voted && (
              <div className="mt-2">
                <div className="h-1.5 bg-rosegold rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs font-bold text-accent mt-1">{pct}%</p>
              </div>
            )}
          </button>
        ))}
      </div>
      {voted && (
        <p className="text-xs text-[#475569] text-center mt-3">총 {total}명 참여</p>
      )}
    </div>
  );
}

/** [E] 인기 시간대 */
function PopularTimeWidget() {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 5;

  const hotVenues = useMemo(() => {
    return venues
      .filter((v) => v.contact)
      .slice(0, 3);
  }, []);

  return (
    <div className="info-box">
      <h3 className="text-base font-extrabold text-[#111111] mb-3">
        {isNight ? '지금 가장 핫한 시간' : '오늘 밤 추천 시간대'}
      </h3>
      <div className="space-y-2">
        {isNight ? (
          <>
            <p className="text-sm text-[#333333]">지금 시간({hour}시) 기준 인기 업소</p>
            {hotVenues.map((v) => (
              <Link
                key={v.id}
                to={venuePath(v)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-rosegold hover:border-accent transition-colors"
              >
                <span className="text-sm font-bold text-[#111111]">{getVenueLabel(v)}</span>
                <span className="text-xs text-accent font-semibold">{v.contact} 실장</span>
              </Link>
            ))}
          </>
        ) : (
          <>
            <p className="text-sm text-[#333333]">PM 9:00~10:00 도착 추천</p>
            <p className="text-sm text-[#475569]">피크 전 도착하면 좋은 자리 선점 가능. 금·토는 특히 일찍 움직이세요.</p>
          </>
        )}
      </div>
    </div>
  );
}
