import { useEffect } from 'react';

/**
 * Toggles the <meta name="robots"> directive on the current page.
 * Used to mark not-found states as noindex so removed/unknown URLs that get
 * client-rendered (or served via the SPA 404 shell) are dropped by Google
 * instead of competing as duplicate content.
 */
export function useRobots(noindex: boolean) {
  useEffect(() => {
    const el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!el) return;
    const prev = el.content;
    el.content = noindex ? 'noindex, follow' : 'index, follow';
    return () => {
      el.content = prev;
    };
  }, [noindex]);
}
