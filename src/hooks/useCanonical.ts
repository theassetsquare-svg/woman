import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrl } from '../utils/slug';

/**
 * Updates the canonical link tag and og:url meta on each route change.
 */
export function useCanonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = canonicalUrl(pathname);

    // Update canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) {
      link.href = url;
    } else {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }

    // Update og:url
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = url;
  }, [pathname]);
}
