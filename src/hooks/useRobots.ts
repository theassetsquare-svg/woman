import { useEffect } from 'react';

/**
 * Toggles the <meta name="robots"> directive on the current page.
 * Used to mark not-found states as noindex so removed/unknown URLs that get
 * client-rendered (or served via the SPA 404 shell) are dropped by Google
 * instead of competing as duplicate content.
 */
export function useRobots(noindex: boolean) {
  useEffect(() => {
    // 네이버70-1(2026-11-08) — 있는 쪽은 미리 그린 판(scripts/prerender.mjs)의 값을 그대로 둔다. 예전처럼 'index, follow' 로 덮으면
    // dedicated/noindex-paths.json 의 검색 제외 쪽이 화면을 그린 뒤 다시 색인 허용으로 바뀐다(처음 받은 HTML 과 그린 뒤가 다름).
    if (!noindex) return;
    const el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!el) return;
    const prev = el.content;
    el.content = noindex ? 'noindex, follow' : 'index, follow';
    return () => {
      el.content = prev;
    };
  }, [noindex]);
}
