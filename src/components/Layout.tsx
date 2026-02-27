import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { regions, getRegionCount } from '../data/venues';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="site-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="호빠 디렉토리 홈">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-sm font-black shadow-md shadow-accent/25 group-hover:shadow-accent/40 transition-shadow">
              H
            </span>
            <span className="text-xl font-extrabold text-navy tracking-tight">
              호빠 디렉토리
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="메인 네비게이션">
            <NavLink to="/" current={location.pathname}>홈</NavLink>
            <NavLink to="/venues" current={location.pathname}>전체 목록</NavLink>
            <span className="w-px h-5 bg-border mx-2" aria-hidden="true" />
            {regions.map((r) => (
              <NavLink key={r.id} to={`/${r.id}`} current={location.pathname}>
                {r.name}
              </NavLink>
            ))}
          </nav>

          <MobileMenu />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1" role="main">{children}</main>

      {/* Footer */}
      <footer className="site-footer text-white mt-20" role="contentinfo">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
            <div>
              <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5">지역별</h4>
              <ul className="space-y-3">
                {regions.map((r) => (
                  <li key={r.id}>
                    <Link to={`/${r.id}`} className="text-[15px] text-slate-400 hover:text-white transition-colors">
                      {r.name} <span className="text-slate-600">({getRegionCount(r.id)})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5">안내</h4>
              <ul className="space-y-3 text-[15px] text-slate-400">
                <li>영업 확인된 업소만 수록</li>
                <li>영업시간은 변동 가능</li>
                <li>방문 전 전화 확인 권장</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5">호빠 디렉토리</h4>
              <p className="text-[15px] text-slate-400 leading-relaxed">
                전국 호빠 정보를 한곳에서.<br />
                영업 확인된 업소만 수록합니다.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-sm text-slate-600">
            &copy; 호빠 디렉토리. 본 사이트의 정보는 참고용이며, 정확한 정보는 각 업소에 직접 확인하시기 바랍니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, current, children }: { to: string; current: string; children: React.ReactNode }) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to);
  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
    >
      {children}
    </Link>
  );
}

function MobileMenu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-navy p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
          className="mobile-menu absolute top-full left-0 right-0 p-5 flex flex-col gap-1"
          aria-label="모바일 네비게이션"
        >
          <MobileLink to="/" label="홈" current={location.pathname} onClick={() => setOpen(false)} />
          <MobileLink to="/venues" label="전체 목록" current={location.pathname} onClick={() => setOpen(false)} />
          <div className="h-px bg-border my-2" />
          {regions.map((r) => (
            <MobileLink
              key={r.id}
              to={`/${r.id}`}
              label={r.name}
              current={location.pathname}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function MobileLink({ to, label, current, onClick }: { to: string; label: string; current: string; onClick: () => void }) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
        isActive ? 'text-accent bg-surface-warm' : 'text-text hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
