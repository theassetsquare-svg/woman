import { useEffect } from 'react';

const BASE_URL = 'https://woman-5nj.pages.dev';
const SITE_NAME = '놀쿨 NOLCOOL';

interface OgMetaOptions {
  title: string;
  description: string;
  image: string;
  url: string;
  isHome?: boolean;
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

export function useOgMeta({ title, description, image, url, isHome }: OgMetaOptions) {
  useEffect(() => {
    const resolvedImage = image || '/og/default.svg';
    const absImage = `${BASE_URL}${resolvedImage}`;
    const absUrl = `${BASE_URL}${url}`;

    // 홈페이지만 놀쿨 포함, 나머지는 가게이름 — 후킹제목만
    const raw = isHome ? `${title} | ${SITE_NAME}` : title;
    const pageTitle = raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
    const desc = description.length > 150 ? description.slice(0, 147) + '…' : description;

    document.title = pageTitle;
    setMeta('description', desc);
    setMeta('og:title', pageTitle);
    setMeta('og:description', desc);
    setMeta('og:image', absImage);
    setMeta('og:url', absUrl);
    setMeta('og:type', 'website');
    setMeta('og:site_name', SITE_NAME);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '1200');
    setMeta('og:image:type', 'image/svg+xml');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', absImage);

    return () => {
      document.title = `전국 나이트·클럽·라운지·룸·요정·호빠 TOP 103 | ${SITE_NAME}`;
      setMeta('description', '전국 103곳 현장 검증 완료. 실장 연락처부터 분위기까지 비교해 보자');
      setMeta('og:title', `전국 나이트·클럽·라운지·룸·요정·호빠 TOP 103 | ${SITE_NAME}`);
      setMeta('og:description', '전국 103곳 현장 검증 완료. 실장 연락처부터 분위기까지 비교해 보자');
      setMeta('og:image', `${BASE_URL}/og/default.svg`);
      setMeta('og:url', BASE_URL);
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', `전국 나이트·클럽·라운지·룸·요정·호빠 TOP 103 | ${SITE_NAME}`);
      setMeta('twitter:description', '전국 103곳 현장 검증 완료. 실장 연락처부터 분위기까지 비교해 보자');
      setMeta('twitter:image', `${BASE_URL}/og/default.svg`);
    };
  }, [title, description, image, url, isHome]);
}
