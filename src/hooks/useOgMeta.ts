import { useEffect } from 'react';

const BASE_URL = 'https://woman-5nj.pages.dev';

interface OgMetaOptions {
  title: string;
  description: string;
  image: string; // path like /og/seoul-boston.svg
  url: string;   // path like /venue/seoul-boston
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

export function useOgMeta({ title, description, image, url }: OgMetaOptions) {
  useEffect(() => {
    const absImage = `${BASE_URL}${image}`;
    const absUrl = `${BASE_URL}${url}`;

    document.title = `${title} | 호빠 디렉토리`;
    setMeta('description', description);
    setMeta('og:title', `${title} | 호빠 디렉토리`);
    setMeta('og:description', description);
    setMeta('og:image', absImage);
    setMeta('og:url', absUrl);
    setMeta('og:type', 'website');
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '1200');
    setMeta('og:image:type', 'image/svg+xml');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | 호빠 디렉토리`);
    setMeta('twitter:description', description);
    setMeta('twitter:image', absImage);

    return () => {
      // Reset to defaults on unmount
      document.title = '호빠 추천 TOP 25 — 오늘 밤 어디 갈지 3초면 끝 | 호빠 디렉토리';
      setMeta('description', '강남·해운대·수원·대전·광주·창원 검증 완료, 선수 퀄리티부터 초이스 시스템까지 한눈에 비교하고 바로 전화하세요');
      setMeta('og:title', '호빠 추천 TOP 25 — 오늘 밤 어디 갈지 3초면 끝');
      setMeta('og:description', '강남·해운대·수원·대전·광주·창원 검증 완료, 선수 퀄리티부터 초이스 시스템까지 한눈에 비교하고 바로 전화하세요');
      setMeta('og:image', '');
      setMeta('og:url', BASE_URL);
      setMeta('twitter:card', 'summary');
      setMeta('twitter:title', '호빠 추천 TOP 25 — 오늘 밤 어디 갈지 3초면 끝');
      setMeta('twitter:description', '강남·해운대·수원·대전·광주·창원 검증 완료, 선수 퀄리티부터 초이스 시스템까지 한눈에 비교하고 바로 전화하세요');
      setMeta('twitter:image', '');
    };
  }, [title, description, image, url]);
}
