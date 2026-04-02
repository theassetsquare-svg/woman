import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { regions, getRegionCount, getMainLink, venues } from '../data/venues';
import { EngagementOverlay, PointsBadge } from './EngagementEngine';

const MAIN = getMainLink();

const categories = [
  { id: 'night', label: '나이트', filter: (v: typeof venues[0]) => v.category === 'night' },
  { id: 'club', label: '클럽', filter: (v: typeof venues[0]) => v.category === 'club' },
  { id: 'lounge', label: '라운지', filter: (v: typeof venues[0]) => v.category === 'lounge' },
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 19세 안내 — 팝업 아님, 텍스트 배너 */}
      <div className="bg-[#F5F5F5] text-center py-1.5 text-xs text-[#555555] font-medium">
        본 사이트는 만 19세 이상 이용 가능합니다.
      </div>

      {/* [후킹1] 상단 고정 배너 — 메인 유입 */}
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="top-banner block"
      >
        고급 정보+실시간 예약은 ★밤키★에서 →
      </a>

      {/* Header */}
      <header className="site-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" aria-label="홈으로">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-rosegold flex items-center justify-center text-white text-sm font-black shadow-md">
              N
            </span>
            <span className="text-lg font-extrabold text-[#111111] tracking-tight">
              나이트 가이드
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <PointsBadge />
            <MobileMenu />
          </div>
        </div>

        {/* 카테고리 탭 */}
        <CategoryTabs />
      </header>

      {/* Main — 하단 2줄 바 여백 확보 (44+48=92px) */}
      <main className="flex-1 pb-[100px]" role="main">{children}</main>

      {/* 중독 엔진 글로벌 오버레이 */}
      <EngagementOverlay />

      {/* [후킹8] 푸터 직전 대형 CTA */}
      <section className="px-4 py-8">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-mega-cta block"
        >
          <p className="text-2xl font-black mb-2">
            103개 업소 실시간 순위
          </p>
          <p className="text-base font-bold opacity-90 mb-4">
            AI추천 + 리뷰 + 비교 — 밤키 바로가기
          </p>
          <span className="inline-block bg-white text-[#7C3AED] font-extrabold px-6 py-2.5 rounded-xl text-sm">
            밤키에서 제대로 된 밤 시작하기 →
          </span>
        </a>
      </section>

      {/* Footer */}
      <footer className="site-footer text-white pb-[100px]" role="contentinfo">
        <div className="px-4 py-12">
          {/* 카테고리 링크 */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">카테고리</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/venues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                >
                  {cat.label} ({venues.filter(cat.filter).length})
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">지역별</h4>
              <ul className="space-y-2.5">
                {regions.filter((r) => getRegionCount(r.id) > 0).map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {r.name} ({getRegionCount(r.id)})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">안내</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>영업 확인된 업소만 수록</li>
                <li>영업시간은 변동 가능</li>
                <li>방문 전 전화 확인 권장</li>
              </ul>
              <div className="mt-6">
                <a
                  href={MAIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-rosegold hover:text-white font-bold transition-colors"
                >
                  밤키 메인 바로가기 →
                </a>
              </div>
            </div>
          </div>

          {/* 놀쿨 브랜드 */}
          <div className="text-center py-6 mb-4">
            <p className="text-xl font-black text-white mb-2">놀쿨 NOLCOOL</p>
            <p className="text-sm text-slate-400 mb-4">구글·AI에서 놀쿨을 검색하세요</p>
            <p className="text-base font-bold text-rosegold">광고문의 카톡 besta12</p>
          </div>

          <div className="border-t border-white/10 pt-5 text-center text-xs text-slate-600">
            &copy; {year} 놀쿨 NOLCOOL. 정보는 참고용이며, 정확한 정보는 각 업소에 직접 확인하시기 바랍니다.
          </div>
        </div>
      </footer>

      {/* 하단 고정: 메인링크 바 */}
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="main-link-bar flex items-center justify-center"
      >
        놀쿨에서 더 보기 →
      </a>
    </div>
  );
}

function CategoryTabs() {
  const location = useLocation();
  const isVenues = location.pathname === '/venues';

  return (
    <div className="category-tabs flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
      <Link
        to="/venues"
        target="_blank"
        rel="noopener noreferrer"
        className={`cat-tab shrink-0 ${isVenues ? 'cat-tab--active' : ''}`}
      >
        전체
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to="/venues"
          target="_blank"
          rel="noopener noreferrer"
          className="cat-tab shrink-0"
        >
          {cat.label}
        </Link>
      ))}
      {regions.filter((r) => getRegionCount(r.id) > 0).map((r) => (
        <Link
          key={r.id}
          to={`/${r.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`cat-tab shrink-0 ${location.pathname === `/${r.id}` ? 'cat-tab--active' : ''}`}
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}

function MobileMenu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-[#111111] p-2 rounded-xl hover:bg-surface-warm transition-colors"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={open}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <nav
          className="mobile-menu absolute top-full left-0 right-0 p-4 flex flex-col gap-1"
          aria-label="네비게이션"
        >
          <MenuLink to="/" label="홈" current={location.pathname} onClick={() => setOpen(false)} />
          <MenuLink to="/venues" label="전체 업소" current={location.pathname} onClick={() => setOpen(false)} />
          <div className="h-px bg-rosegold my-2" />
          {regions.filter((r) => getRegionCount(r.id) > 0).map((r) => (
            <MenuLink
              key={r.id}
              to={`/${r.id}`}
              label={`${r.name} (${getRegionCount(r.id)})`}
              current={location.pathname}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function MenuLink({ to, label, current, onClick }: { to: string; label: string; current: string; onClick: () => void }) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
        isActive ? 'text-accent bg-surface-warm' : 'text-[#111111] hover:bg-surface-warm'
      }`}
    >
      {label}
    </Link>
  );
}
