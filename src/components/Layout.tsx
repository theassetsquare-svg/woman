import { Link, useLocation } from 'react-router-dom';
import { regions, getRegionCount } from '../data/venues';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-purple-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍸</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              호빠 디렉토리
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
            >
              홈
            </Link>
            <Link
              to="/venues"
              className={`text-sm font-medium transition-colors ${location.pathname === '/venues' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
            >
              전체 목록
            </Link>
            {regions.map((r) => (
              <Link
                key={r.id}
                to={`/region/${r.id}`}
                className={`text-sm font-medium transition-colors ${location.pathname === `/region/${r.id}` ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {r.name}
              </Link>
            ))}
          </nav>
          {/* Mobile menu button */}
          <MobileMenu />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-3">지역별</h4>
              <ul className="space-y-2">
                {regions.map((r) => (
                  <li key={r.id}>
                    <Link to={`/region/${r.id}`} className="text-sm text-gray-500 hover:text-gray-300">
                      {r.name} ({getRegionCount(r.id)})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-3">안내</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-500">2026년 영업 기준</li>
                <li className="text-sm text-gray-500">가격은 변동 가능</li>
                <li className="text-sm text-gray-500">방문 전 전화 확인 권장</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-600">
            &copy; 2026 호빠 디렉토리. 본 사이트의 정보는 참고용이며, 정확한 정보는 각 업소에 직접 확인하시기 바랍니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileMenu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="text-gray-400 p-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setOpen(false)} className={`text-sm ${location.pathname === '/' ? 'text-purple-400' : 'text-gray-400'}`}>
            홈
          </Link>
          <Link to="/venues" onClick={() => setOpen(false)} className={`text-sm ${location.pathname === '/venues' ? 'text-purple-400' : 'text-gray-400'}`}>
            전체 목록
          </Link>
          {regions.map((r) => (
            <Link
              key={r.id}
              to={`/region/${r.id}`}
              onClick={() => setOpen(false)}
              className={`text-sm ${location.pathname === `/region/${r.id}` ? 'text-purple-400' : 'text-gray-400'}`}
            >
              {r.emoji} {r.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
