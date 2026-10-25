// 일산31-3(2026-10-12) — 광고주가 없는 가게 쪽의 「광고문의」 카드.
// 대표님 지시 2026-10-11: 「일산룸 들어간 제목에는 전부 광고문의 · 전화번호 전부 삭제」.
// 그 가게 쪽의 맨 위 그림 · og:image · 구조화 데이터 그림을 이 카드로 바꾸고 「문의」 줄을 더한다(닉네임·번호 0).
// 목록·추천의 축소판(public/og/<id>.jpg)은 그대로 둔다 — 다른 쪽은 바뀌지 않는다.
// scripts/prerender.mjs 가 이 파일을 글자로 읽는다 — 한 줄에 한 곳 · 큰따옴표 · 칸 순서(id, card, text, alt) 그대로.
// card = public/ 아래 그림의 사이트 경로(1200×1200 png).
export interface InquiryCard { id: string; card: string; text: string; alt: string; }

export const inquiryCards: InquiryCard[] = [
  { id: "ilsan-room", card: "/ilsan/room/card-ilsan-room-a69f4b39.png", text: "광고문의 카톡 besta12", alt: "일산룸 광고문의 카톡 besta12" },
  // 전체57-1(2026-10-25) — 대표님 지시 2026-10-25 15:0x 「광고문의 썸네일이미지를 먼저 만들어」 · 가게 쪽 둘
  { id: "ansan-hit-night", card: "/ansan/hit-night/card-ansan-hit-night-232b3ed2.png", text: "광고문의 카톡 besta12", alt: "안산히트나이트 광고문의 카톡 besta12" },
  { id: "yeongdeungpo-terminal-night", card: "/seoul-etc/yeongdeungpo-terminal-night/card-yeongdeungpo-terminal-night-339b4ac0.png", text: "광고문의 카톡 besta12", alt: "영등포터미널나이트 광고문의 카톡 besta12" },
  // 전체57-1(2026-10-25) — 울산챔피언나이트 광고 끝(해지 2026-10-25 · data/forbidden-contacts.json 해지광고주) → 광고문의(닉네임·번호 0)
  { id: "ulsan-champion-night", card: "/ulsan/champion-night/card-ulsan-champion-night-d45fc57c.png", text: "광고문의 카톡 besta12", alt: "울산챔피언나이트 광고문의 카톡 besta12" },
  // 지역 쪽 둘 — id 는 지역 id · 카드 첫 줄은 그 쪽 주제 · scripts/prerender.mjs 의 지역 쪽과 src/pages/RegionPage.tsx 가 읽는다
  { id: "uijeongbu", card: "/uijeongbu/card-uijeongbu-c964d58b.png", text: "광고문의 카톡 besta12", alt: "의정부 나이트·클럽 광고문의 카톡 besta12" },
  { id: "ulsan", card: "/ulsan/card-ulsan-4260cc09.png", text: "광고문의 카톡 besta12", alt: "울산 나이트 광고문의 카톡 besta12" },
];

// 가게 id 또는 지역 id(가게 id 와 겹치는 이름 없음)
export function getInquiryCard(venueId: string): InquiryCard | undefined {
  return inquiryCards.find((c) => c.id === venueId);
}
