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
    setMeta('og:title', `${title} | 호빠 디렉토리`);
    setMeta('og:description', description);
    setMeta('og:image', absImage);
    setMeta('og:url', absUrl);
    setMeta('og:type', 'website');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | 호빠 디렉토리`);
    setMeta('twitter:description', description);
    setMeta('twitter:image', absImage);

    return () => {
      // Reset to defaults on unmount
      document.title = '호빠 디렉토리 | 2026 전국 호스트바 정보';
      setMeta('og:title', '호빠 디렉토리 | 2026 전국 호스트바 정보');
      setMeta('og:description', '2026년 전국 호빠 디렉토리 - 서울, 부산, 수원, 대전, 광주, 창원 영업중 호스트바 정보');
      setMeta('og:image', '');
      setMeta('og:url', BASE_URL);
      setMeta('twitter:card', 'summary');
      setMeta('twitter:title', '호빠 디렉토리 | 2026 전국 호스트바 정보');
      setMeta('twitter:description', '2026년 전국 호빠 디렉토리');
      setMeta('twitter:image', '');
    };
  }, [title, description, image, url]);
}
