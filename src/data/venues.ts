export interface Venue {
  id: string;
  name: string;
  region: string;
  area: string;
  seoArea: string;
  address: string;
  description: string;
  hours: string;
  phone: string;
  tags: string[];
  card_hook: string;
  card_value: string;
  card_tags: string;
}

export const regions = [
  { id: 'gangnam', name: '강남', emoji: '🏙️' },
  { id: 'geondae', name: '건대', emoji: '🎪' },
  { id: 'jangan', name: '장안동', emoji: '🌃' },
  { id: 'busan', name: '부산', emoji: '🌊' },
  { id: 'gyeonggi', name: '경기/수원', emoji: '🏛️' },
  { id: 'daejeon', name: '대전', emoji: '🔬' },
  { id: 'gwangju', name: '광주', emoji: '🎨' },
  { id: 'changwon', name: '창원', emoji: '🏭' },
] as const;

export const venues: Venue[] = [
  // ===== 강남 =====
  {
    id: 'gangnam-boston',
    name: '보스턴',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 테헤란로77길 9',
    description: '강남호빠 보스턴 — 12년째 같은 자리에서 살아남은 이유? 정찰제 운영, 바가지 제로. 처음이라면 무조건 여기부터 시작하세요',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '0507-0094-1200',
    tags: ['강남', '프리미엄', '12년전통'],
    card_hook: '테헤란로, 12년째 같은 자리.\n한 번 온 손님이 다시 찾는 이유가 있습니다.',
    card_value: '보스턴 — 강남역 도보 5분, 정찰제 운영',
    card_tags: '강남 · 12년전통 · 정찰제',
  },
  {
    id: 'gangnam-i',
    name: '아이(I)',
    region: 'gangnam',
    area: '역삼',
    seoArea: '강남',
    address: '서울시 강남구 역삼동 (조선호텔 인근)',
    description: '강남호빠 아이(I) — 재방문율 업계 1위, 17년 경력 하이엔드. 한 번 가면 단골 확정되는 이유를 직접 확인하세요',
    hours: 'PM 8:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['역삼', '하이엔드', 'VIP', '17년전통'],
    card_hook: '조선호텔 뒷골목, 17년 무사고 운영.\n재방문율 업계 1위 — 아는 사람만 오는 곳.',
    card_value: '아이(I) — VIP 전담 시스템, 새벽 6시까지',
    card_tags: '역삼 · VIP전담 · 17년경력',
  },
  {
    id: 'gangnam-flirting',
    name: '플러팅진혁',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 강남대로 320',
    description: '강남호빠 플러팅진혁 — 마음에 안 들면 바로 교체, 무한초이스 원조. 선수 눈치 안 보고 내가 직접 고르는 시스템',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['강남', '무한초이스', '인기'],
    card_hook: '강남대로 한복판, 무한초이스 시스템.\n선수 교체 눈치 볼 필요 없는 시스템.',
    card_value: '플러팅진혁 — 무한초이스 원조',
    card_tags: '강남 · 무한초이스 · 자유교체',
  },
  {
    id: 'gangnam-blackhole',
    name: '블랙홀',
    region: 'gangnam',
    area: '역삼',
    seoArea: '강남',
    address: '서울시 강남구 역삼동 832-7',
    description: '강남호빠 블랙홀 — 어게인팀 DNA를 물려받은 신생 프리미엄. 검증된 팀이 새 간판으로 다시 시작한 곳',
    hours: 'PM 8:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['역삼', '프리미엄', '신규오픈', '어게인팀'],
    card_hook: '역삼동 832번지, 어게인의 DNA를 물려받은 신생.\n검증된 팀이 새 간판 아래 다시 시작한 곳.',
    card_value: '블랙홀 — 역삼동, 프리미엄 신생',
    card_tags: '역삼 · 어게인계승 · 프리미엄',
  },

  // ===== 건대 =====
  {
    id: 'geondae-wclub',
    name: 'W클럽',
    region: 'geondae',
    area: '건대',
    seoArea: '건대',
    address: '서울시 광진구 동일로 166',
    description: '건대호빠 W클럽 — 건대에서 10년 생존한 데는 이유가 있다. 20대 후반 직장인 모임에 딱 맞는 에너지',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['건대', '10년전통', '트렌디'],
    card_hook: '건대입구역 2번 출구, 10년 연속 생존.\n20대 후반 직장인 모임에 딱 맞는 에너지.',
    card_value: 'W클럽 — 도보 3분, 10년 운영',
    card_tags: '건대 · 20대후반 · 활기찬밤',
  },

  // ===== 장안동 =====
  {
    id: 'jangan-bini',
    name: '빈이',
    region: 'jangan',
    area: '장안동',
    seoArea: '장안동',
    address: '서울시 동대문구 장안동 367',
    description: '장안동호빠 빈이 — 10년 베테랑 실장이 직접 운영. 서울 동북권에서 가장 검증된 선택',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['장안동', '동대문', '베테랑'],
    card_hook: '10년 경력 실장이 직접 운영.\n서울 동북권에서 가장 검증된 선택지.',
    card_value: '빈이 — 베테랑 실장 직접 운영',
    card_tags: '장안동 · 베테랑운영 · 검증된서비스',
  },
  {
    id: 'jangan-cube',
    name: '큐브',
    region: 'jangan',
    area: '장안동',
    seoArea: '장안동',
    address: '서울시 성동구 천호대로 432',
    description: '장안동호빠 큐브 — 100명 중 내 맘에 드는 사람 고르기. 무제한 초이스, 눈치 없이 마음껏 고르는 시스템',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-5157-9050',
    tags: ['장안동', '여성전용', '무한초이스', '대형'],
    card_hook: '장한평역 5번출구, 100명 이상 매일 출근.\n무제한 초이스 — 눈치 없이 마음껏 고르는 시스템.',
    card_value: '큐브 — 대형, 무제한 초이스',
    card_tags: '장안동 · 100명출근 · 무한초이스',
  },
  {
    id: 'jangan-bbangbbang',
    name: '빵빵',
    region: 'jangan',
    area: '장안동',
    seoArea: '장안동',
    address: '서울시 동대문구 장안동',
    description: '장안동호빠 빵빵 — 처음이라 긴장된다면 여기가 정답. 편안한 분위기에서 부담 없이 시작하는 밤',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['장안동', '동대문', '호스트바'],
    card_hook: '소문으로만 퍼지는 가게.\n편안하게 한 잔 하고 싶을 때 찾는 곳.',
    card_value: '빵빵 — 편안한 분위기',
    card_tags: '장안동 · 편안한분위기 · 추천',
  },

  // ===== 부산 =====
  {
    id: 'busan-michelin',
    name: '미슐랭',
    region: 'busan',
    area: '해운대',
    seoArea: '해운대',
    address: '부산시 해운대구 마린시티2로 33',
    description: '해운대호빠 미슐랭 — 부산 에이스 랭킹 TOP 5 전원 집결. 서울에서 일부러 내려오는 손님이 있는 곳',
    hours: 'PM 8:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['해운대', '프리미엄', '마린시티'],
    card_hook: '마린시티 야경 앞, 부산 선수 랭킹 1~5위 집결.\n서울에서 일부러 내려오는 손님이 있는 곳.',
    card_value: '미슐랭 — 마린시티 직통, 새벽 6시까지',
    card_tags: '해운대 · 에이스집결 · 야경뷰',
  },
  {
    id: 'busan-q',
    name: '큐(Q)',
    region: 'busan',
    area: '해운대',
    seoArea: '해운대',
    address: '부산시 해운대구 해운대해변로265번길 7',
    description: '해운대호빠 큐(Q) — 해변 도보 2분, 파도 소리 들리는 거리. 해운대에서 가장 가까운 프리미엄 호빠',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['해운대', '해변', '프리미엄'],
    card_hook: '해변에서 걸어서 2분.\n파도 소리 들리는 거리에서 시작되는 밤.',
    card_value: '큐(Q) — 해변 도보 2분, 프리미엄',
    card_tags: '해운대 · 해변인접 · 프리미엄',
  },
  {
    id: 'busan-david',
    name: '다비드바',
    region: 'busan',
    area: '해운대',
    seoArea: '해운대',
    address: '부산시 해운대구 중동1로 15-2',
    description: '해운대호빠 다비드바 — 호빠 처음이라면 여기서 시작하세요. 부담 제로 여성전용 토킹바의 원조',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['해운대', '이벤트바', '여성전용'],
    card_hook: '여성전용 토킹바의 원조.\n첫 방문 부담 낮추고 싶을 때 정답.',
    card_value: '다비드바 — 여성전용 토킹 이벤트바',
    card_tags: '해운대 · 부담없는 · 토킹이벤트',
  },
  {
    id: 'busan-aura',
    name: '아우라',
    region: 'busan',
    area: '수영구',
    seoArea: '부산',
    address: '부산시 수영구 광남로 106',
    description: '부산호빠 아우라 — 선수 30명 상시 대기, 부산 최대 규모. 초이스 폭이 좁다는 불만과는 거리가 먼 곳',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['수영구', '최대규모', '대형'],
    card_hook: '선수 30명 상시 대기, 부산 최대 규모.\n"초이스 폭이 좁다"는 불만과는 거리가 먼 곳.',
    card_value: '아우라 — 광남로, 부산 최대 규모',
    card_tags: '수영구 · 30명대기 · 넓은초이스',
  },
  {
    id: 'busan-menz',
    name: '맨즈',
    region: 'busan',
    area: '광안리',
    seoArea: '부산',
    address: '부산시 수영구 광안해변로 179',
    description: '부산호빠 맨즈 — 광안리 바다 앞 40명 중 고르는 밤. 광안대교 불빛 아래 가장 넓은 초이스',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-5557-8179',
    tags: ['광안리', '대규모선수진', '신규오픈'],
    card_hook: '광안대교 불빛 아래, 40명 중 고르는 밤.\n광안리에서 가장 넓은 초이스를 경험할 수 있다.',
    card_value: '맨즈 — 광안해변로, 선수 40명 상주',
    card_tags: '광안리 · 40명대기 · 대규모선수진',
  },
  {
    id: 'busan-w',
    name: '더블유(W)',
    region: 'busan',
    area: '연산동',
    seoArea: '부산',
    address: '부산시 연제구 반송로 8',
    description: '부산호빠 더블유(W) — 부산 최장수 운영 기록 보유. 오래 살아남은 가게엔 이유가 있다',
    hours: 'PM 8:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['연산동', '최다선수', '오래된전통'],
    card_hook: '연산동 터줏대감, 부산 최장수 운영 기록.\n오래 살아남은 가게 — 실력이 곧 증거다.',
    card_value: '더블유(W) — 오후 8시 오픈, 최장수 운영',
    card_tags: '연산동 · 최장수 · 선수다양',
  },
  {
    id: 'busan-theking',
    name: '더킹',
    region: 'busan',
    area: '연제구',
    seoArea: '부산',
    address: '부산시 연제구 반송로 32-8',
    description: '부산호빠 더킹 — 무한 음료 포함, 부산에서 가장 부담 없는 선택. 가볍게 한 잔 하고 싶은 밤에',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['연제구', '부담없는', '무한음료'],
    card_hook: '무한 음료 포함, 부산에서 가장 부담 없는 선택.\n가볍게 한 잔 하고 싶은 금요일에.',
    card_value: '더킹 — 무한 음료 포함',
    card_tags: '연제구 · 부담없는 · 무한음료',
  },
  {
    id: 'busan-js',
    name: '제이에스(JS)',
    region: 'busan',
    area: '하단',
    seoArea: '부산',
    address: '부산시 사하구 하단동 511-11',
    description: '부산호빠 제이에스 — 분리형 프라이빗 룸 완비, 아는 사람 마주칠 걱정 제로. 하단 지역 대표',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['하단', '깨끗한시설', '프라이빗룸'],
    card_hook: '하단역 근처, 분리된 프라이빗 룸 완비.\n아는 사람 마주칠 걱정 없는 설계.',
    card_value: '제이에스 — 프라이빗 룸 완비',
    card_tags: '하단 · 프라이빗룸 · 신축시설',
  },
  {
    id: 'busan-michelin-jisung',
    name: '미슐랭(지성)',
    region: 'busan',
    area: '해운대',
    seoArea: '해운대',
    address: '부산시 해운대구 중동1로 44-2',
    description: '해운대호빠 미슐랭(지성) — 내 취향을 정확히 파악하는 MD 지성 실장의 맞춤 큐레이션. 3분 안에 맞춤 선수 배정',
    hours: 'PM 8:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['해운대', '프리미엄', 'VIP'],
    card_hook: 'MD 지성 실장이 직접 큐레이션하는 밤.\n취향 말하면 3분 안에 맞춤 선수 배정.',
    card_value: '미슐랭(지성) — 맞춤 큐레이션',
    card_tags: '해운대 · MD직접관리 · 맞춤배정',
  },

  // ===== 경기/수원 =====
  {
    id: 'suwon-beast',
    name: '비스트',
    region: 'gyeonggi',
    area: '수원 인계동',
    seoArea: '수원',
    address: '수원시 팔달구 인계동 1031-16',
    description: '수원호빠 비스트 — 새벽 8시까지 논스톱 12시간 영업. 인계동에서 밤이 짧다고 느꼈다면 여기',
    hours: 'PM 8:00 ~ AM 8:00',
    phone: '010-8289-9196',
    tags: ['수원', '인계동', '럭셔리'],
    card_hook: '인계동 유흥가 한가운데, 새벽 8시까지 논스톱.\n서울 안 가도 되는 이유를 비스트가 증명한다.',
    card_value: '비스트 — 12시간 영업',
    card_tags: '수원 · 새벽8시까지 · 럭셔리인테리어',
  },
  {
    id: 'suwon-maid',
    name: '메이드',
    region: 'gyeonggi',
    area: '수원 인계동',
    seoArea: '수원',
    address: '수원시 팔달구 인계동 1041-6',
    description: '수원호빠 메이드 — 들어가는 순간 다르다, 신축 최대 규모. "수원에 이런 데가?" 후기의 절반',
    hours: 'PM 8:00 ~ AM 8:00',
    phone: '별도문의',
    tags: ['수원', '인계동', '신규오픈', '최대규모'],
    card_hook: '인계동 신축 최대 규모, 인테리어부터 다르다.\n"수원에 이런 데가?" 라는 반응이 후기의 절반.',
    card_value: '메이드 — 최대 규모, 신축 프리미엄 시설',
    card_tags: '수원 · 신축오픈 · 최대규모',
  },
  {
    id: 'suwon-play',
    name: '플레이 가라오케',
    region: 'gyeonggi',
    area: '수원 인계동',
    seoArea: '수원',
    address: '수원시 팔달구 인계동 1041-4',
    description: '수원호빠 플레이 가라오케 — 노래방+호빠 한 번에 즐기는 조합. 다음 날 오전 11시까지 시간 제한 없음',
    hours: 'PM 9:00 ~ AM 11:00',
    phone: '별도문의',
    tags: ['수원', '인계동', '프리미엄', '가라오케'],
    card_hook: '노래방 음향에 호빠 서비스를 더한 조합.\n다음 날 오전 11시까지 — 시간 제한 걱정 없다.',
    card_value: '플레이 — 가라오케+호빠, 오전 11시까지',
    card_tags: '수원 · 가라오케 · 14시간영업',
  },
  {
    id: 'suwon-lasvegas',
    name: '라스베가스',
    region: 'gyeonggi',
    area: '수원 인계동',
    seoArea: '수원',
    address: '수원시 팔달구 인계로124번길',
    description: '수원호빠 라스베가스 — 화려한 조명 아래 부담 없이 즐기는 인계동의 정답',
    hours: 'PM 8:00 ~ PM 1:00(익일)',
    phone: '별도문의',
    tags: ['수원', '인계동', '화려한'],
    card_hook: '인계동의 화려한 연출, 부담 없는 구성.\n화려한 조명 아래 편하게 즐기는 금요 밤.',
    card_value: '라스베가스 — 화려한 분위기',
    card_tags: '수원 · 화려한연출 · 부담없는',
  },

  // ===== 대전 =====
  {
    id: 'daejeon-eclipse',
    name: '이클립스',
    region: 'daejeon',
    area: '둔산동',
    seoArea: '대전',
    address: '대전시 서구 둔산동 982',
    description: '대전호빠 이클립스 — 대전에서 경쟁자 없는 독보적 1위. 충청권 전역에서 원정 오는 단골이 증명',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['둔산동', '대전1위', '프리미엄'],
    card_hook: '둔산동 중심, 대전에서 경쟁자 없는 독보적 1위.\n충청권 전역에서 일부러 원정 오는 단골이 많다.',
    card_value: '이클립스 — 중심가, 대전 유일 프리미엄',
    card_tags: '둔산동 · 대전1위 · 충청권대표',
  },
  {
    id: 'daejeon-tombar',
    name: '톰바',
    region: 'daejeon',
    area: '봉명동',
    seoArea: '대전',
    address: '대전시 유성구 봉명동 547-1',
    description: '대전호빠 톰바 — 유성 봉명동 대학가 감성, 젊은 에너지가 다르다. 카이스트·충남대 근처',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-2390-0472',
    tags: ['유성', '봉명동', '대전1등'],
    card_hook: '유성 봉명동, 대전 유흥의 중심축.\n카이스트·충남대 근처 — 젊은 에너지가 다르다.',
    card_value: '톰바 — 전화 예약 필수',
    card_tags: '유성 · 봉명동 · 젊은분위기',
  },

  // ===== 광주 =====
  {
    id: 'gwangju-w',
    name: 'W',
    region: 'gwangju',
    area: '상무지구',
    seoArea: '광주',
    address: '광주시 서구 상무번영로 53',
    description: '광주호빠 W — 호남권 유일한 선택지, 상무지구 대표. 광주에서 움직이지 않아도 되는 밤',
    hours: 'PM 9:30 ~ AM 5:00',
    phone: '별도문의',
    tags: ['상무지구', '광주대표'],
    card_hook: '상무지구 번영로, 광주 유일의 선택지.\n호남권에서 움직이지 않아도 되는 밤.',
    card_value: 'W — PM 9:30 오픈',
    card_tags: '상무지구 · 광주유일 · 호남권대표',
  },

  // ===== 창원 =====
  {
    id: 'changwon-avengers',
    name: '어벤져스',
    region: 'changwon',
    area: '상남동',
    seoArea: '창원',
    address: '창원시 성산구 마디미로37번길 12',
    description: '창원호빠 어벤져스 — 1인 전담 TC 시스템으로 혼자 와도 부담 없이 시작. 경남 대표 호빠',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['상남동', '창원1등', '부담없는', '1인TC'],
    card_hook: '1인 TC 시스템 — 혼자 와도 부담 없이 시작.\n둘이 와도 각자 편하게 즐기는 구조.',
    card_value: '어벤져스 — 1인 TC 시스템',
    card_tags: '창원 · 1인TC · 부담없는시작',
  },
];

export function getVenueLabel(venue: Venue): string {
  return `${venue.seoArea}호빠 ${venue.name}`;
}

const seoHooks: Record<string, string> = {
  'gangnam-boston': '처음이라면 여기부터, 12년간 실패 없는 선택',
  'gangnam-i': '한 번 가면 단골 확정, 재방문율 업계 1위의 비밀',
  'gangnam-flirting': '내가 직접 고른다, 무한초이스의 원조',
  'gangnam-blackhole': '어게인 DNA 계승, 지금 가장 핫한 신상',
  'geondae-wclub': '10년 생존엔 이유가 있다',
  'jangan-bini': '10년 베테랑이 직접 잡는 분위기',
  'jangan-cube': '100명 중 고르는 재미, 눈치 없이 무한초이스',
  'jangan-bbangbbang': '처음이라 긴장된다면 여기가 답',
  'busan-michelin': '서울에서 일부러 내려오는 이유, 에이스 TOP 5 집결',
  'busan-q': '해변 도보 2분, 파도 소리와 함께하는 밤',
  'busan-david': '호빠 처음이라면 여기서 시작하세요',
  'busan-aura': '30명 상시 대기, 고르는 재미가 다르다',
  'busan-menz': '광안리 바다 앞 40명, 못 고르는 게 더 어렵다',
  'busan-w': '오래 살아남은 데는 이유가 있다, 부산 최장수',
  'busan-theking': '무한 음료 포함, 부산에서 가장 부담 없는 밤',
  'busan-js': '프라이빗 룸 완비, 아는 사람 걱정 제로',
  'busan-michelin-jisung': '내 취향 정확히 파악하는 실장이 있는 곳',
  'suwon-beast': '새벽 8시까지 논스톱, 밤이 짧다면 여기',
  'suwon-maid': '들어가는 순간 다르다, 신축 최대 규모',
  'suwon-play': '노래방+호빠 한 번에, 오전 11시까지',
  'suwon-lasvegas': '부담 없이 화려하게, 인계동의 정답',
  'daejeon-eclipse': '대전 1위엔 이유가 있다, 충청권 원정 맛집',
  'daejeon-tombar': '봉명동 대학가 감성, 젊은 에너지가 다르다',
  'gwangju-w': '호남권 유일, 여기만 가면 된다',
  'changwon-avengers': '1인 전담 시스템, 부담 제로로 시작하는 밤',
};

export function getVenueHook(venueId: string): string {
  return seoHooks[venueId] ?? '';
}

export function getVenuesByRegion(regionId: string): Venue[] {
  return venues.filter((v) => v.region === regionId);
}

export function getVenueById(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}

export function getRegionName(regionId: string): string {
  return regions.find((r) => r.id === regionId)?.name ?? regionId;
}

export function getRegionCount(regionId: string): number {
  return venues.filter((v) => v.region === regionId).length;
}

/**
 * Reverse-lookup a venue by region + deduplicated slug.
 * Handles both cases:
 *  - region-prefixed IDs:  region='gangnam', slug='boston' → id='gangnam-boston'
 *  - non-matching prefix:  region='gyeonggi', slug='suwon-beast' → id='suwon-beast'
 */
export function getVenueByRegionSlug(region: string, slug: string): Venue | undefined {
  return venues.find((v) => v.id === `${region}-${slug}` && v.region === region)
    || venues.find((v) => v.id === slug && v.region === region);
}
