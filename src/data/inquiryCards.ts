// 일산31-3(2026-10-12) — 광고주가 없는 가게 쪽의 「광고문의」 카드.
// 대표님 지시 2026-10-11: 「일산룸 들어간 제목에는 전부 광고문의 · 전화번호 전부 삭제」.
// 그 가게 쪽의 맨 위 그림 · og:image · 구조화 데이터 그림을 이 카드로 바꾸고 「문의」 줄을 더한다(닉네임·번호 0).
// 목록·추천의 축소판(public/og/<id>.jpg)은 그대로 둔다 — 다른 쪽은 바뀌지 않는다.
// scripts/prerender.mjs 가 이 파일을 글자로 읽는다 — 한 줄에 한 곳 · 큰따옴표 · 칸 순서(id, card, text, alt) 그대로.
// card = public/ 아래 그림의 사이트 경로(1200×1200 png).
export interface InquiryCard { id: string; card: string; text: string; alt: string; }

export const inquiryCards: InquiryCard[] = [
  { id: "ilsan-room", card: "/ilsan/room/card-ilsan-room-a69f4b39.png", text: "광고문의 카톡 besta12", alt: "일산룸 광고문의 카톡 besta12" },
];

export function getInquiryCard(venueId: string): InquiryCard | undefined {
  return inquiryCards.find((c) => c.id === venueId);
}
