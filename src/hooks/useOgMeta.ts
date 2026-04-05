import { useEffect } from 'react';

const BASE_URL = 'https://woman-5nj.pages.dev';
const SITE_NAME = '놀쿨 NOLCOOL';

interface OgMetaOptions {
  title: string;
  description: string;
  image: string;
  url: string;
  isHome?: boolean;
  imageAlt?: string;
}

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`);
  }
  if (el) {
    el.content = content;
  } else {
    el = document.createElement('meta');
    if (property.startsWith('twitter:')) {
      el.name = property;
    } else {
      el.setAttribute('property', property);
    }
    el.content = content;
    document.head.appendChild(el);
  }
}

export function useOgMeta({ title, description, image, url, isHome, imageAlt }: OgMetaOptions) {
  useEffect(() => {
    const resolvedImage = image || '/og/default.jpg';
    const absImage = `${BASE_URL}${resolvedImage}`;
    const absUrl = `${BASE_URL}${url}`;
    const alt = imageAlt || title;

    // 홈페이지만 놀쿨 포함, 나머지는 가게이름 — 후킹제목만
    const raw = isHome ? `${title} | ${SITE_NAME}` : title;
    const pageTitle = raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
    const desc = description.length > 150 ? description.slice(0, 147) + '…' : description;

    document.title = pageTitle;
    setMeta('description', desc);
    setMeta('og:title', pageTitle);
    setMeta('og:description', desc);
    setMeta('og:image', absImage);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:type', 'image/jpeg');
    setMeta('og:image:alt', alt);
    setMeta('og:url', absUrl);
    setMeta('og:type', 'website');
    setMeta('og:site_name', SITE_NAME);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', absImage);

    return () => {
      const defaultTitle = '놀쿨 — 전국 나이트·클럽·라운지·룸·요정·호빠 TOP 103';
      const defaultDesc = '놀쿨 — 전국 103곳 현장 검증. 실장 연락처부터 분위기까지 한눈에 비교';
      document.title = defaultTitle;
      setMeta('description', defaultDesc);
      setMeta('og:title', defaultTitle);
      setMeta('og:description', defaultDesc);
      setMeta('og:image', `${BASE_URL}/og/default.jpg`);
      setMeta('og:image:alt', '나이트 클럽 라운지 가이드');
      setMeta('og:url', BASE_URL);
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', defaultTitle);
      setMeta('twitter:description', defaultDesc);
      setMeta('twitter:image', `${BASE_URL}/og/default.jpg`);
    };
  }, [title, description, image, url, isHome, imageAlt]);
}
