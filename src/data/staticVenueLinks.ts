// 전용22-8(2026-10-07) — 앱 자료(venues.ts)에서 빼고 정적 쪽(public/<경로>/index.html)으로 둔 가게.
// 목록·추천·곳 수(scripts/prerender.mjs 의 linkVenues · src/pages/RegionPage.tsx · CategoryPage.tsx · VenueListPage.tsx)에
// 「링크만 있는 줄」로 싣는다 — 가게를 앱 자료에서 뺐어도 다른 쪽의 목록·추천·곳 수는 빼기 전과 같아야 한다.
// 닉네임·번호·카드 그림은 넣지 않는다(그 가게 쪽 자신에만 둔다).
// prerender.mjs 가 이 파일을 글자로 읽는다 — 한 줄에 한 곳 · 큰따옴표 · 칸 순서(region, name, tail, href, category, area, after) 그대로.
// after = 빼기 전 venues.ts 에서 바로 앞에 있던 가게의 id(목록에서 그 가게 바로 뒤 자리에 끼운다).
export interface StaticVenueLink { region: string; name: string; tail: string; href: string; category: string; area: string; after: string; }

export const staticVenueLinks: StaticVenueLink[] = [
  { region: "seoul-etc", name: "신림그랑프리나이트", tail: "신림 나이트", href: "https://ff.nolcool.com/seoul-etc/sinlim-grandprix-night/", category: "night", area: "신림", after: "gangnam-juliana-night" },
];
