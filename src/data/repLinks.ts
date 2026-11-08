// 네이버70-1(2026-11-08) — 같은 가게의 대표 쪽이 다른 사이트에 있는 겹침 쪽(naver-watch config/naver-rep-pages.json).
// 이 쪽들은 검색 제외(dedicated/noindex-paths.json · 사이트맵에서 뺌)이고, 본문 맨 위에 대표 쪽으로 가는 링크 한 줄을 둔다.
// 주소·글은 그대로(301 0 · 지우기 0). scripts/prerender.mjs 가 이 파일을 글자로 읽는다 — 한 줄에 한 곳 · 큰따옴표 · 칸 순서(path, name, href, label, tail) 그대로.
export interface RepLink { path: string; name: string; href: string; label: string; tail: string; }

export const repLinks: RepLink[] = [
  { path: "/daegu/babamba-night", name: "대구바밤바나이트", href: "https://aa.nolcool.com/duryu-babamba-night/", label: "대구바밤바나이트 위치 안내", tail: "주소와 반고개역까지 거리, 500m 안 공영주차장은 그쪽에 공공 자료로 다시 확인해 적었습니다." },
  { path: "/paju", name: "파주야당스카이돔나이트", href: "https://d.nolcool.com/hall/paju-skydome-night-5/", label: "파주야당스카이돔나이트 위치 안내", tail: "주소와 야당역까지 거리, 주차 요금은 그쪽에서 공공 자료로 다시 확인한 값입니다." },
];

// 쪽 경로(끝 / 있어도 됨) → 그 쪽의 대표 링크
export function getRepLink(pagePath: string): RepLink | undefined {
  const p = pagePath.replace(/\/$/, '');
  return repLinks.find((r) => r.path === p);
}
