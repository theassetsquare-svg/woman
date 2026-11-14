// 일산83-1(2026-11-15) — 앱이 그리는 가게 쪽 중 광고주가 있는 쪽의 광고주 세트.
// 대표님 2026-11-13 13:30(번호) · 13:48(닉네임) · 2026-11-15 01:47 — 일산 쪽 광고주(docs/규칙/일산_총책임자_광고주_새번호_2026-11-13.md).
// 그 가게 쪽 하나에만: 맨 위 1:1 카드 · og:image · 구조화 데이터 그림과 전화 · 「광고」 표시 · 연락처 · 문의(담당) 줄 · 아래 고정 전화바(번호만).
// 가게 자료(venues.ts)의 phone · contact 는 그대로 둔다 — 그 칸은 홈 · 목록 · 비교 위젯에도 나가서, 일산 쪽 밖에 닉네임 · 번호가 생긴다.
// scripts/prerender.mjs 가 이 파일을 글자로 읽는다 — 한 줄에 한 곳 · 큰따옴표 · 칸 순서(id, card, nick, tel, alt) 그대로.
// card = public/ 아래 그림의 사이트 경로(1200×1200 png). 이 표에 있는 가게는 inquiryCards.ts(광고문의 카드)에 두지 않는다.
export interface VenueAd { id: string; card: string; nick: string; tel: string; alt: string; }

export const venueAds: VenueAd[] = [
  { id: "ilsan-room", card: "/ilsan/room/card-ilsan-room-48327aed.png", nick: "일산룸 총책임자 신실장", tel: "010-3541-0027", alt: "일산룸 일산룸 총책임자 신실장 010-3541-0027 광고문의 카톡 besta12" },
];

export function getVenueAd(venueId: string): VenueAd | undefined {
  return venueAds.find((a) => a.id === venueId);
}

// 구조화 데이터 전화 꼴(이 사이트 광고주 쪽과 같은 +82 꼴)
export const ldTel = (tel: string) => `+82-${tel.slice(1)}`;
