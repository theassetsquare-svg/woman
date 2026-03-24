import { Link } from 'react-router-dom';
import { regions, venues, getRegionCount, getVenuesByRegion, getContactVenues, getVenueLabel } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';
import SearchBox from '../components/SearchBox';
import { SlideUpCTA, ScrollBanner, Top10Hook, TodayRecommendHook, FullCompareHook } from '../components/HookingWidgets';

export default function HomePage() {
  const activeRegions = regions.filter((r) => getRegionCount(r.id) > 0);
  const contactVenues = getContactVenues();

  useOgMeta({
    title: '나이트·클럽·라운지 TOP 19 — 금요일 밤 어디 갈지 3초면 끝',
    description: '강남·부산·수원·신림·인천·대전·울산 현장 검증 완료. 실장 연락처부터 분위기까지 한눈에 비교하세요',
    image: '',
    url: '',
  });

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="relative px-4 py-16 text-center">
          <p className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 animate-fade-in">
            여성이 편안한 밤문화
          </p>
          <h1 className="text-3xl font-extrabold text-[#111111] leading-tight mb-4 animate-fade-in-up">
            나이트·클럽·라운지<br />
            TOP {venues.length}
          </h1>
          <p className="text-base text-[#475569] mb-3 leading-relaxed animate-fade-in">
            강남 · 부산 · 수원 · 인천 · 대전 · 울산
          </p>
          <p className="text-sm text-[#555555] mb-8 leading-relaxed">
            현장 검증된{' '}
            <span className="text-[#111111] font-bold">{venues.length}곳</span>의
            분위기·실장·입장 정보를 비교하세요.
          </p>
          <div className="mb-8">
            <SearchBox />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/venues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              전체 업소 보기
            </Link>
            <a
              href="#regions"
              className="btn-secondary text-sm"
            >
              지역별 보기
            </a>
          </div>
        </div>
      </section>

      {/* 닉네임+전화 7개 — 상단 노출 */}
      <section className="px-4 pt-10 pb-4">
        <div className="hooking-warm p-6">
          <p className="text-accent text-xs font-bold tracking-[0.15em] uppercase mb-2">실장 직영 · 전화 예약 가능</p>
          <h2 className="text-xl font-extrabold text-[#111111] mb-6 leading-tight">
            실장 연락처 공개 <span className="text-accent">{contactVenues.length}곳</span>
          </h2>
          <div className="space-y-3">
            {contactVenues.map((v) => (
              <div key={v.id} className="hooking-item">
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <span className="text-accent font-black text-sm">{v.contact}</span>
                  <span className="text-[10px] text-[#555555]">실장</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/${v.region}/${v.id.startsWith(v.region + '-') ? v.id.slice(v.region.length + 1) : v.id}`}
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

      {/* 나이트 처음 가는 분을 위한 팁 */}
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

      {/* [후킹10] TOP 10 랭킹 — 3위까지만 */}
      <section className="px-4 py-4">
        <Top10Hook items={[
          { rank: 1, name: getVenueLabel(venues[0]) },
          { rank: 2, name: getVenueLabel(venues[4]) },
          { rank: 3, name: getVenueLabel(venues[3]) },
        ]} />
      </section>

      {/* [후킹4] AI 추천 티저 */}
      <section className="px-4">
        <TodayRecommendHook />
      </section>

      {/* Region Cards */}
      <section id="regions" className="px-4 py-8">
        <div className="section-header">
          <h2 className="text-[#111111] mb-2">지역별 나이트·클럽</h2>
          <p className="text-[#475569] text-sm mt-4">
            원하는 지역을 선택하세요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activeRegions.map((r) => {
            const count = getRegionCount(r.id);
            return (
              <Link
                key={r.id}
                to={`/${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="region-card group"
              >
                <h3 className="text-base font-bold text-[#111111] group-hover:text-accent transition-colors">
                  {r.name}
                </h3>
                <p className="text-sm text-[#475569] mt-1 font-medium">{count}곳</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* [후킹5] 103개 전체 비교 */}
      <section className="px-4">
        <FullCompareHook />
      </section>

      {/* Region Venue Previews — 가로 스와이프 */}
      {activeRegions.map((r) => {
        const regionVenues = getVenuesByRegion(r.id);
        if (regionVenues.length === 0) return null;
        return (
          <section key={r.id} className="py-6">
            <div className="flex items-center justify-between mb-4 px-4">
              <h2 className="text-lg">
                {r.name}
              </h2>
              <Link
                to={`/${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:text-accent-hover font-semibold transition-colors"
              >
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

      {/* CTA */}
      <section className="px-4 py-6 pb-10">
        <div className="cta-section p-6 text-center">
          <h3 className="text-lg font-extrabold text-[#111111] mb-2">
            지금 이 순간에도 자리가 빠지고 있습니다
          </h3>
          <p className="text-[#475569] text-sm leading-relaxed mb-6">
            금·토 밤 10시 이후는 인기 업소 대기 30분 이상.
            미리 전화해서 자리를 잡아두세요.
          </p>
          <Link
            to="/venues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            전국 {venues.length}곳 비교하기
          </Link>
        </div>
      </section>

      {/* Floating hooking widgets */}
      <SlideUpCTA />
      <ScrollBanner />
    </div>
  );
}
