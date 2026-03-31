import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('/home/user/woman/src/data/venueContent.ts', 'utf8');

// === GANGNAM-I: fix 있어요(8), 파트너(11), 예약(13), 새벽(5), 전담(5), 있나요(5) ===

// 있어요: reduce from 8 to 4
// #1 summary: 있어요 -> 지닌 곳이에요 (철학이 있어요 -> 철학을 지닌 곳이에요)
c = c.replace(
  '숫자보다 깊이를 선택한 운영 철학이 있어요.',
  '숫자보다 깊이를 선택한 운영 철학을 지닌 곳이에요.'
);
// #3: 설계되어 있어요 -> 설계된 구조예요
c = c.replace(
  '모든 접점이 일관된 완성도를 갖추도록 설계되어 있어요.',
  '모든 접점이 일관된 완성도를 갖추도록 설계된 구조예요.'
);
// #4: 그 일관성에 있어요 -> 그 일관성 덕분이에요
c = c.replace(
  '재방문율이 높은 이유는 바로 그 일관성에 있어요.',
  '재방문율이 높은 이유는 바로 그 일관성 덕분이에요.'
);
// #5: 맞지 않을 수 있어요 -> 맞지 않아요
c = c.replace(
  '분께는 솔직히 맞지 않을 수 있어요.',
  '분께는 솔직히 어울리지 않아요.'
);

// 파트너: reduce from 11 to 4 - keep: summary(전담 파트너가 배정), section title(전담 파트너 배정이), conclusion(없음), quickPlan(전담 파트너 케어)
// Replace some
// summary: 소수 정예 파트너진 -> 소수 정예 선발진
c = c.replace(
  "'소수 정예 파트너진 — 숫자보다 깊이를 선택한 운영 철학을 지닌 곳이에요.',",
  "'소수 정예 선발진 — 숫자보다 깊이를 선택한 운영 철학을 지닌 곳이에요.',"
);
// intro: 파트너의 외모나 -> 동행자의 외모나
c = c.replace(
  '파트너의 외모나 인원수가 아니라,',
  '동행자의 외모나 인원수가 아니라,'
);
// section 1: 소수 파트너진 유지 -> 소수 선발진 유지
c = c.replace(
  '엄선된 소수 파트너진 유지,',
  '엄선된 소수 선발진 유지,'
);
// section 2: 음료 선호도, 파트너 스타일 -> 음료 선호도, 취향 스타일
c = c.replace(
  '인원 규모, 음료 선호도, 파트너 스타일,',
  '인원 규모, 음료 선호도, 취향 스타일,'
);
// section 3: 전담 파트너 배정이 포함돼요 -> 전담 배정이 포함돼요 (remove 파트너)
// Keep this one as is - it has 전담+파트너 together
// FAQ: 파트너를 미리 볼 수 있나요? - change
c = c.replace(
  "{ q: '파트너를 미리 볼 수 있나요?', a: '프라이버시 보호 차원에서 사전 제공은 하지 않아요. 살롱에서 직접 만나는 방식이에요.' },",
  "{ q: '선수를 미리 확인할 수 있나요?', a: '프라이버시 보호 차원에서 사전 제공은 하지 않아요. 살롱에서 직접 만나는 방식이에요.' },"
);
// FAQ answer: 파트너 담당자가 배정돼요 -> 담당자가 배정돼요
c = c.replace(
  "날짜·인원·원하는 분위기를 전해주시면 파트너 담당자가 배정돼요.",
  "날짜·인원·원하는 분위기를 전해주시면 전담 담당자가 배정돼요."
);
// FAQ answer: 전담 파트너 배정이 기본 구성 -> 전담 배정이 기본 구성
c = c.replace(
  "a: '양주, 안주, 전담 파트너 배정이 기본 구성이에요.",
  "a: '양주, 안주, 전담 담당자 배정이 기본 구성이에요."
);

// 예약: reduce from 13 to 4
// Keep: 완전 사전예약제(summary), 사전예약제(intro), quickPlan 사전예약, conclusion 사전예약제
// Remove others
// section 2 title: 예약 통화를 하면 -> 연락하면
c = c.replace(
  'body: `예약 통화를 하면 담당자가 배정돼요.',
  'body: `전화하면 담당자가 배정돼요.'
);
// section 3: 세부 구성은 예약 통화에서 -> 세부 구성은 전화 상담에서
c = c.replace(
  '세부 구성은 예약 통화에서 담당자가 친절하게 안내해 드려요.',
  '세부 구성은 통화 상담에서 담당자가 친절하게 안내해 드려요.'
);
// section 5: 예약 통화 시 정확한 위치를 -> 통화 시 정확한 위치를
c = c.replace(
  '예약 통화 시 정확한 위치를 꼭 안내받으세요.',
  '통화 시 정확한 위치를 꼭 안내받으세요.'
);
// quickPlan scenario: 일주일 전 예약 -> 일주일 전 연락
c = c.replace(
  "'비즈니스 자리 3인 — 일주일 전 예약, 별도 공간 세팅, 전담 파트너 케어',",
  "'비즈니스 자리 3인 — 일주일 전 연락, 별도 공간 세팅, 전담 파트너 케어',"
);
// costNote: 예약 통화에서 -> 전화 상담에서
c = c.replace(
  "costNote: '예약 통화에서 담당자가 구성과 비용을 자세히 안내해 드려요.',",
  "costNote: '전화 상담에서 담당자가 구성과 비용을 자세히 안내해 드려요.',"
);
// FAQ: 예약은 어떻게 해야 하나요? -> 일정은 어떻게 잡나요?
c = c.replace(
  "{ q: '예약은 어떻게 해야 하나요?', a: '전화로만 받아요.",
  "{ q: '일정은 어떻게 잡나요?', a: '전화로만 받아요."
);
// FAQ: 완전 사전예약제라서 사전 연락 없이는 -> 사전예약제라서 연락 없이는
c = c.replace(
  "a: '완전 사전예약제라서 사전 연락 없이는 입장이 어려워요.'",
  "a: '사전예약제 원칙상 연락 없이는 입장이 어려워요.'"
);
// FAQ: 세부 내용은 예약 통화에서 -> 세부 내용은 통화에서
c = c.replace(
  "세부 내용은 예약 통화에서 확인해 주세요.",
  "세부 내용은 통화에서 확인해 주세요."
);
// conclusion: 완전 사전예약제가 결합해 -> 완전 사전예약제가 결합해 (keep)

// 새벽: reduce from 5 to 4
// Section title: 새벽 6시까지 영업하는 이유 -> keep (it's the main unique term)
// FAQ: 새벽 6시 전에 나올 수 있나요? -> 영업 종료 전에 나올 수 있나요?
c = c.replace(
  "{ q: '새벽 6시 전에 나올 수 있나요?', a: '물론이에요. 퇴장 시간은 자유롭게 결정하시면 돼요.' }",
  "{ q: '마감 전에 먼저 나올 수 있나요?', a: '물론이에요. 퇴장 시간은 자유롭게 결정하시면 돼요.' }"
);

// 전담: reduce from 5 to 4
// summary: 전담 파트너가 배정 -> keep (핵심 특징)
// 이미 위에서 파트너 교체로 일부 줄임, 확인 후 처리

// 있나요: reduce from 5 to 4
// '당일에 바로 방문할 수 있나요?' -> '당일 방문이 되나요?'
c = c.replace(
  "{ q: '당일에 바로 방문할 수 있나요?', a: '완전 사전예약제라서",
  "{ q: '당일 방문이 가능한가요?', a: '완전 사전예약제라서"
);

// === GANGNAM-FLIRTING: fix 캐스트(16), 교체(11), 점포의(5), 가장(5), 무제한(7), 기본(5) ===

// 캐스트: reduce from 16 to 4 - keep: intro #1 question, intro #2 mention, quickPlan, conclusion
// summary: 캐스트 교체 무제한 -> 선수 교체 무제한
c = c.replace(
  "'강남대로 320번지 — 업계 최초로 캐스트 교체 무제한을 도입한 점포다.',",
  "'강남대로 320번지 — 업계 최초로 선수 교체 무제한을 도입한 점포다.',"
);
// summary: 교체 횟수 상한이 -> (keep, 교체 not 캐스트)
// intro: 맞지 않는 캐스트와 -> 맞지 않는 선수와
c = c.replace(
  '맞지 않는 캐스트와 억지로 시간을 보내거나,',
  '맞지 않는 선수와 억지로 시간을 보내거나,'
);
// section 1: 착석하면 첫 캐스트가 -> 착석하면 첫 번째 선수가
c = c.replace(
  'body: `착석하면 첫 캐스트가 합류한다.',
  'body: `착석하면 첫 번째 선수가 합류한다.'
);
// section 1: 다른 캐스트를 원한다면 -> 다른 선수를 원한다면
c = c.replace(
  '다른 캐스트를 원한다면 간단히 전달하면 된다.',
  '다른 선수를 원한다면 간단히 전달하면 된다.'
);
// section 2: 각자 다른 캐스트와 시간을 -> 각자 다른 선수와 시간을
c = c.replace(
  '각자 다른 캐스트와 시간을 가질 수 있어',
  '각자 다른 선수와 시간을 가질 수 있어'
);
// section 4: 첫 캐스트 합류 -> 첫 선수 합류
c = c.replace(
  '입장 → 자리 배치 → 첫 캐스트 합류 → 대화 → 교체 요청 → 새 캐스트 합류.',
  '입장 → 자리 배치 → 첫 선수 합류 → 대화 → 교체 요청 → 새 선수 합류.'
);
// section 6: 자유로운 캐스트 선택과 -> 자유로운 선수 선택과
c = c.replace(
  '자유로운 캐스트 선택과 합리적 세트의 조합이다.',
  '자유로운 선수 선택과 합리적 세트의 조합이다.'
);
// quickPlan decision: 여러 캐스트를 비교 -> 여러 선수를 비교
c = c.replace(
  "처음 입장이거나 여러 캐스트를 비교해 보고 싶은",
  "처음 입장이거나 여러 선수를 비교해 보고 싶은"
);
// scenario: 여러 캐스트 만나보며 -> 여러 선수 만나보며
c = c.replace(
  "'혼자 탐색 — 목요일 9시 30분 입장, 여러 캐스트 만나보며 취향 확인',",
  "'혼자 탐색 — 목요일 9시 30분 입장, 여러 선수 만나보며 취향 확인',"
);
// FAQ: 각자 다른 캐스트와 -> 각자 다른 선수와
c = c.replace(
  "각자 다른 캐스트와 시간을 나누어 비교할 수 있습니다.",
  "각자 다른 선수와 시간을 나누어 비교할 수 있습니다."
);
// FAQ: 캐스트 연락처를 받을 수 있나요? -> 선수 연락처를 받을 수 있나요?
c = c.replace(
  "{ q: '캐스트 연락처를 받을 수 있나요?', a: '점포 방침에 따라 개인 연락처 교환은 제한됩니다.' }",
  "{ q: '선수 연락처를 받을 수 있나요?', a: '점포 방침에 따라 개인 연락처 교환은 제한됩니다.' }"
);
// conclusion: 캐스트 무제한 교체 -> keep (핵심 키워드)

// 교체: reduce from 11 to 4
// summary: 교체 횟수 상한이 -> 변경 횟수 상한이
c = c.replace(
  "'교체 횟수 상한이 존재하지 않는다 — 이 한 문장이 점포의 정체성이다.',",
  "'변경 횟수 상한이 존재하지 않는다 — 이 한 문장이 점포의 정체성이다.',"
);
// intro: 교체를 어떻게 말해야 할지 -> 바꿔달라고 어떻게 말해야 할지
c = c.replace(
  '교체를 어떻게 말해야 할지 몰라 그냥 앉아 있는 상황이',
  '바꿔달라고 어떻게 말해야 할지 몰라 그냥 앉아 있는 상황이'
);
// section title: 무제한 교체 시스템의 -> 무제한 선택 시스템의
c = c.replace(
  "title: '무제한 교체 시스템의 실제 작동 구조',",
  "title: '무제한 선택 시스템의 실제 작동 구조',"
);
// section 3: 무제한 교체를 충분히 -> 자유 선택을 충분히
c = c.replace(
  '여유로운 환경에서 무제한 교체를 충분히 활용할 수 있는',
  '여유로운 환경에서 자유로운 선택을 충분히 활용할 수 있는'
);
// scenario: 무제한 교체 활용 -> 자유 선택 활용
c = c.replace(
  "'친구 셋 첫 경험 — 수요일 10시 워크인, 무제한 교체 활용, 약 2시간',",
  "'친구 셋 첫 경험 — 수요일 10시 워크인, 자유 선택 활용, 약 2시간',"
);
// FAQ: 캐스트 교체가 정말 무제한인가요? -> 선수 변경이 정말 무제한인가요?
c = c.replace(
  "{ q: '캐스트 교체가 정말 무제한인가요?', a: '횟수 제한이 없습니다.",
  "{ q: '선수 변경이 정말 무제한인가요?', a: '횟수 제한이 없습니다."
);
// 나머지: keep 교체 요청(section4), 교체라는 방침(conclusion), 이 점포에서 캐스트 변경(section1)

// 점포의: reduce from 5 to 4
// '이 점포의 포지션은 분명하다' -> '포지션은 분명하다'
c = c.replace(
  'body: `이 점포의 포지션은 분명하다.',
  'body: `포지션은 분명하다.'
);
// FAQ: 이것이 이 점포의 핵심 운영 방식 -> 이것이 핵심 운영 방식
c = c.replace(
  "이것이 이 점포의 핵심 운영 방식입니다.",
  "이것이 이곳의 핵심 운영 방식입니다."
);

// 가장: reduce from 5 to 4
// summary: 가장 많이 거론되는 -> 빈번히 거론되는
c = c.replace(
  "'초방 손님에게 가장 많이 거론되는 강남 호빠 중 하나다.',",
  "'초방 손님에게 빈번히 거론되는 강남 호빠 중 하나다.',"
);

// 무제한: reduce from 7 to 4
// summary: 캐스트 교체 무제한 -> already changed to 선수 교체 무제한 (still 무제한)
// '무제한 교체가 가능하다는' -> '제한 없는 교체가 가능하다는'
c = c.replace(
  '무제한 교체가 가능하다는 구조는 실제 분위기를',
  '제한 없는 교체가 가능하다는 구조는 실제 분위기를'
);
// section title: 무제한 선택 시스템 -> already changed above
// 자유로운 선택 활용 -> already changed scenario
// FAQ: 선수 변경이 정말 무제한 -> already changed above

// 기본: reduce from 5 to 4
// FAQ question/answer: 음료와 안주가 기본 포함인가요?
c = c.replace(
  "{ q: '음료와 안주가 기본 포함인가요?', a: '기본 세트에 포함됩니다.",
  "{ q: '음료와 안주가 포함되나요?', a: '세트에 포함됩니다."
);

// === GANGNAM-BLACKHOLE: fix 착석(9), 무광(6), 라운지의(6), 라운지(20+), 있다(5), 간접조명(8) ===

// 착석: reduce from 9 to 4
// summary: 오후 8시 착석 시작 -> 오후 8시 개장
c = c.replace(
  "'오후 8시 착석 시작, 이른 아침 6시 영업 종료.',",
  "'오후 8시 개장, 이른 아침 6시 영업 종료.',"
);
// intro: 착석한 손님 사이의 -> 앉은 손님 사이의
c = c.replace(
  '음량은 착석한 손님 사이의 대화를 가로막지',
  '음량은 앉아 있는 손님 사이의 대화를 가로막지'
);
// section 3: 착석 시간대별로 -> 시간대별로
c = c.replace(
  '착석 시간대별로 비중이 달라지는데,',
  '시간대 흐름에 따라 비중이 달라지는데,'
);
// section title: 신규 라운지의 현재 분위기와 착석 여건 -> 신규 라운지의 현재 분위기와 좌석 여건
c = c.replace(
  "title: '신규 라운지의 현재 분위기와 착석 여건',",
  "title: '신규 라운지의 현재 분위기와 좌석 여건',"
);
// section 4 body: 평일은 착석 위치 선택의 폭 -> 평일은 좌석 위치 선택의 폭
c = c.replace(
  '평일은 착석 위치 선택의 폭이 넓고,',
  '평일은 좌석 위치 선택의 폭이 넓고,'
);
// section 7: 만취 상태에서 착석을 요청 -> 만취 상태에서 입장을 요청
c = c.replace(
  '명백한 만취 상태에서 착석을 요청하는 경우 거절된다.',
  '명백한 만취 상태에서 입장을 요청하는 경우 거절된다.'
);
// FAQ: 착석 선택 폭이 넓습니다 -> 자리 선택의 폭이 넓습니다
c = c.replace(
  "평일 9~10시가 여유롭고 착석 선택 폭이 넓습니다.",
  "평일 9~10시가 여유롭고 자리 선택의 폭이 넓습니다."
);

// 무광: reduce from 6 to 4
// summary: 무광 블랙 벽면과 네온 간접조명이 -> 다크톤 벽면과 네온 조명이
c = c.replace(
  "'무광 블랙 벽면과 네온 간접조명이 공간 전체의 첫인상을 결정짓는다.',",
  "'다크톤 벽면과 네온 조명이 공간 전체의 첫인상을 결정짓는다.',"
);
// section 2 title: 무광 블랙과 네온이 만드는 -> 블랙 마감과 네온이 만드는
c = c.replace(
  "title: '무광 블랙과 네온이 만드는 공간감',",
  "title: '블랙 마감과 네온이 만드는 공간감',"
);
// FAQ: 무광 블랙 벽면에 네온 간접조명이 -> 블랙 벽면에 네온 라인이
c = c.replace(
  "a: '무광 블랙 벽면에 네온 간접조명이 포인트인 다크 톤 라운지입니다.'",
  "a: '블랙 벽면에 네온 라인이 포인트인 다크 톤 공간입니다.'"
);

// 라운지의: reduce from 6 to 4
// intro second paragraph: 이 라운지의 사운드는 -> 이 공간의 사운드는
c = c.replace(
  '\n이 라운지의 사운드는 힙합 트랙과',
  '\n이 공간의 사운드는 힙합 트랙과'
);
// section 1: 이 라운지의 멤버진은 -> 이 공간의 멤버진은
c = c.replace(
  '이 라운지의 멤버진은 그 역량을',
  '이 공간의 멤버진은 그 역량을'
);
// section 6: 클럽의 소음 대신 라운지의 깊이 -> 클럽의 소음 대신 이곳의 깊이
c = c.replace(
  '클럽의 소음 대신 라운지의 깊이 있는 분위기를',
  '클럽의 소음 대신 이곳의 깊이 있는 분위기를'
);

// 라운지: this appears too many times - core word of this venue, but need to trim
// intro: 라운지 입구에서부터 -> 입구에서부터
c = c.replace(
  '라운지 입구에서부터 무광 블랙 마감의',
  '입구에서부터 무광 블랙 마감의'
);
// section 1 title: 어게인DNA가 이 라운지에 -> 어게인DNA가 이곳에
c = c.replace(
  "title: '어게인DNA가 이 라운지에 이식된 방식',",
  "title: '어게인DNA가 이곳에 이식된 방식',"
);
// section 4: 이 라운지의 심야 분위기는 -> 이 공간의 심야 분위기는
c = c.replace(
  '이 라운지의 심야 분위기는 점점 안정되는 추세다.',
  '이 공간의 심야 분위기는 점점 안정되는 추세다.'
);
// section 5: 7분 거리에 라운지가 있다 -> 7분 거리에 위치한다
c = c.replace(
  '직진하면 7분 거리에 라운지가 있다.',
  '직진하면 7분 거리에 목적지가 있다.'
);
// section 6 title: 이 라운지가 맞는 취향의 기준 -> 이 공간이 맞는 취향의 기준
c = c.replace(
  "title: '이 라운지가 맞는 취향의 기준',",
  "title: '이 공간이 맞는 취향의 기준',"
);
// section 6: 이 라운지는 감각적인 -> 이 공간은 감각적인
c = c.replace(
  '이 라운지는 감각적인 배경음이 흐르는',
  '이 공간은 감각적인 배경음이 흐르는'
);
// section 7: 라운지 현장 관리 -> 공간 현장 관리
c = c.replace(
  '경험 많은 운영진이 라운지 현장 관리를',
  '경험 많은 운영진이 공간 현장 관리를'
);
// quickPlan decision: 강남호빠 블랙홀은 감각적인 라운지에서 -> (keep - 핵심 문장)
// FAQ: 어게인DNA를 이어받아 별도로 오픈한 라운지입니다 -> 공간입니다
c = c.replace(
  "a: '어게인DNA를 이어받아 별도로 오픈한 라운지입니다. 핵심 멤버진이 합류해 있습니다.'",
  "a: '어게인DNA를 이어받아 별도로 오픈한 곳입니다. 핵심 멤버진이 합류해 있습니다.'"
);
// FAQ: 다크 톤 라운지입니다 -> already changed to 다크 톤 공간입니다

// 간접조명: reduce from 8 to 4
// intro: 무광 블랙 마감의 벽면과 네온 간접조명이 -> 무광 블랙 마감의 벽면과 네온 조명이
c = c.replace(
  '무광 블랙 마감의 벽면과 네온 간접조명이 공간 전체의 톤을 결정한다.',
  '무광 블랙 마감의 벽면과 네온 조명이 공간 전체의 톤을 결정한다.'
);
// intro: 간접조명 아래 테이블마다 -> 조도 설계 아래 테이블마다
c = c.replace(
  '간접조명 아래 테이블마다 독립된 분위기권이',
  '조도 설계 아래 테이블마다 독립된 분위기권이'
);
// section 2: 간접조명 설정 덕에 -> 조명 설정 덕에
c = c.replace(
  '간접조명 설정 덕에 얼굴이 자연스럽게',
  '조명 설정 덕에 얼굴이 자연스럽게'
);
// scenario: 간접조명 아래 2시간 30분 -> 은은한 조명 아래 2시간 30분
c = c.replace(
  "'친구 둘, 금요일 밤 — 10시 착석, 간접조명 아래 2시간 30분',",
  "'친구 둘, 금요일 밤 — 10시 입장, 은은한 조명 아래 2시간 30분',"
);
// conclusion: 간접조명 아래에서, -> 조명 아래에서,
c = c.replace(
  '감각적인 배경음과 간접조명 아래에서,',
  '감각적인 배경음과 조명 아래에서,'
);

// 있다: reduce from 5 to 4
// 포진해 있다 -> 포진했다
c = c.replace(
  '이미 숙련도를 갖춘 멤버진이 포진해 있다.',
  '이미 숙련도를 갖춘 멤버진이 포진했다.'
);

writeFileSync('/home/user/woman/src/data/venueContent.ts', c, 'utf8');
console.log('All word reductions done');

// Final verification
import { readFileSync as rf } from 'fs';
const nc = rf('/home/user/woman/src/data/venueContent.ts', 'utf8');
const venueRanges = [
  { key: 'gangnam-boston', keyword: '강남호빠 보스턴', start: nc.indexOf("'gangnam-boston':"), end: nc.indexOf("'gangnam-i':") },
  { key: 'gangnam-i', keyword: '강남호빠 아이\\(I\\)', start: nc.indexOf("'gangnam-i':"), end: nc.indexOf("'gangnam-flirting':") },
  { key: 'gangnam-flirting', keyword: '강남호빠 플러팅', start: nc.indexOf("'gangnam-flirting':"), end: nc.indexOf("'gangnam-blackhole':") },
  { key: 'gangnam-blackhole', keyword: '강남호빠 블랙홀', start: nc.indexOf("'gangnam-blackhole':"), end: nc.indexOf('// ===== 건대 =====') },
];

for (const v of venueRanges) {
  const section = nc.slice(v.start, v.end);
  const words = section.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const overLimit = Object.entries(freq).filter(([w, count]) => count >= 5).sort((a, b) => b[1] - a[1]);
  const kwCount = (section.match(new RegExp(v.keyword, 'g')) || []).length;
  console.log(`\n${v.key}: keyword=${kwCount}`);
  if (overLimit.length === 0) {
    console.log('  OK - no word repeats 5+ times');
  } else {
    overLimit.slice(0, 10).forEach(([w, count]) => console.log(`  ${count}x ${w}`));
  }
}
