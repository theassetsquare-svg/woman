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
    description: '테헤란로 정찰제 운영으로 바가지 걱정 제로. 한 번 온 손님이 계속 찾는 이유를 직접 확인하세요',
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
    description: '역삼동 조선호텔 인근, 한 번 가면 단골 확정. VIP 전담 시스템으로 새벽 6시까지 특별한 밤을 경험하세요',
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
    description: '마음에 안 들면 바로 교체, 선수 눈치 볼 필요 없는 자유로운 시스템. 강남대로에서 가장 당당하게 즐기는 법',
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
    description: '역삼동 검증된 팀이 새 간판으로 재시작. 프리미엄 선수진과 완성된 운영 노하우를 직접 확인하세요',
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
    description: '건대입구역 도보 3분, 트렌디한 에너지와 검증된 선수진. 활기찬 금요 밤을 원한다면 여기부터 확인하세요',
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
    name: '',
    region: 'jangan',
    area: '장안동',
    seoArea: '장안동',
    address: '서울시 동대문구 장안동 367',
    description: '서울 동대문구에서 가장 검증된 선택지. 경력이 만드는 차이를 한 번만 경험해보세요',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['장안동', '동대문', '베테랑'],
    card_hook: '10년 경력 실장이 직접 운영.\n서울 동북권에서 가장 검증된 선택지.',
    card_value: '베테랑 실장 직접 운영',
    card_tags: '장안동 · 베테랑운영 · 검증된서비스',
  },
  {
    id: 'jangan-cube',
    name: '큐브',
    region: 'jangan',
    area: '장안동',
    seoArea: '장안동',
    address: '서울시 성동구 천호대로 432',
    description: '장한평역 5번출구, 매일 대규모 선수 출근. 눈치 없이 마음껏 선택하는 시스템을 직접 체험하세요',
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
    description: '편안한 분위기에서 부담 없이 시작하는 밤. 입소문만으로 채워지는 단골 가게의 비결을 확인하세요',
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
    description: '마린시티 야경 앞 프리미엄, 부산 선수 랭킹 최상위권 전원 배치. 새벽 6시까지 특별한 밤을 경험하세요',
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
    description: '해운대해변로 프리미엄 입지, 바다 향기 느끼며 즐기는 특별한 선택. 분위기부터 선수까지 직접 확인하세요',
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
    description: '여성전용 토킹바의 시작점. 첫 경험도 편하게, 긴장 풀리는 분위기에서 자연스럽게 즐겨보세요',
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
    description: '수영구 광남로, 선택폭이 넓다는 건 이런 뜻. 매일 풀가동되는 대형 라인업을 직접 확인하세요',
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
    description: '광안대교 불빛 아래 펼쳐지는 대규모 선수진. 해변 분위기에서 넓은 선택폭을 직접 경험하세요',
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
    description: '연산동 터줏대감, 실력으로 증명한 세월. 오후 8시부터 시작되는 검증된 밤을 직접 확인하세요',
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
    description: '연제구에서 가볍게 한 잔 하고 싶은 밤에 딱 맞는 곳. 편하게 즐기면서 특별한 시간을 보내세요',
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
    description: '하단역 근처 분리형 독립 공간, 비밀 보장되는 설계. 신축 시설에서 편안한 밤을 경험하세요',
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
    description: 'MD 지성 실장이 직접 큐레이션, 말하면 3분 안에 딱 맞는 선수 연결. 특별한 밤을 경험하세요',
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
    description: '인계동 유흥가 한가운데, 서울 원정 필요 없는 럭셔리 시설. 밤이 짧다고 느꼈다면 여기를 확인하세요',
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
    description: '인계동 프리미엄 인테리어, "이런 데가 여기에?" 후기의 절반. 직접 눈으로 확인해야 믿는 공간',
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
    description: '인계동에서 가라오케 음향과 함께 즐기는 특별한 밤. 시간 제한 걱정 없는 14시간 영업을 직접 경험하세요',
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
    description: '가볍게 즐기면서도 분위기는 확실하게. 편안한 금요 밤을 원한다면 여기서 시작하세요',
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
    description: '둔산동 중심가에서 프리미엄 선수진과 시스템을 갖춘 단 하나의 선택지. 직접 확인하세요',
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
    description: '유성 카이스트·충남대 근처, 활기찬 분위기 속 검증된 선수진. 전화 예약 후 방문하세요',
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
    description: '상무지구 번영로, 광주에서 다른 곳 알아볼 필요 없는 대표 업소. 직접 확인하고 전화하세요',
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
    description: '상남동 경남 대표, 둘이 와도 각자 즐기는 구조. 부담 없이 시작하는 밤을 직접 경험하세요',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['상남동', '창원1등', '부담없는', '1인TC'],
    card_hook: '1인 TC 시스템 — 혼자 와도 부담 없이 시작.\n둘이 와도 각자 편하게 즐기는 구조.',
    card_value: '어벤져스 — 1인 TC 시스템',
    card_tags: '창원 · 1인TC · 부담없는시작',
  },
];

export function getVenueLabel(venue: Venue): string {
  return `${venue.seoArea}호빠${venue.name ? ' ' + venue.name : ''}`;
}

const seoHooks: Record<string, string> = {
  'gangnam-boston': '정찰제 12년 검증, 첫 방문 완벽 가이드',
  'gangnam-i': '완전예약제 17년, 재방문율 업계 3배',
  'gangnam-flirting': '무한초이스 원조, 교체 눈치 제로',
  'gangnam-blackhole': '어게인 팀 합류, 주목할 신생 라운지',
  'geondae-wclub': '역세권 3분, 10년 생존 비결 공개',
  'jangan-bini': '실장 직접 운영, 동북권 검증 완료',
  'jangan-cube': '100명 출근, 무한초이스 시스템 체험',
  'jangan-bbangbbang': '긴장 제로, 편안하게 시작하는 밤',
  'busan-michelin': '에이스 5인 배치, 마린시티 야경 앞',
  'busan-q': '해변 2분, 파도 소리와 시작하는 밤',
  'busan-david': '토킹바 원조, 첫 방문 부담 제로',
  'busan-aura': '30명 상시 대기, 부산 넓은 선택폭',
  'busan-menz': '광안대교 앞 40명, 고르는 재미가 있는 밤',
  'busan-w': '연산동 장수 기록, 실력이 곧 증거',
  'busan-theking': '무한 음료 포함, 가볍게 시작하기 좋은 곳',
  'busan-js': '분리형 룸 완비, 비밀 보장 설계',
  'busan-michelin-jisung': 'MD 실장 큐레이션, 3분 맞춤 배정',
  'suwon-beast': '새벽 8시까지, 12시간 논스톱 영업',
  'suwon-maid': '신축 시설 압도, 수원 반전 매력 발견',
  'suwon-play': '노래방 결합, 오전 11시까지 가능',
  'suwon-lasvegas': '화려한 조명, 부담 없는 인계동 밤',
  'daejeon-eclipse': '둔산동 독보적 존재, 충청권 원정지',
  'daejeon-tombar': '봉명동 대학가 감성, 젊은 에너지 충전',
  'gwangju-w': '호남 유일, 이 한 곳이면 충분',
  'changwon-avengers': '1인 전담 TC, 혼자 가도 편안한 시스템',
};

const seoDescriptions: Record<string, string> = {
  'gangnam-boston': '강남역 도보 5분 테헤란로, 12년째 정찰제로 운영하는 검증된 가게입니다. 추가 요금 걱정 없이 첫 방문부터 깔끔하게 즐길 수 있고, 주말 예약은 목요일 전에 전화하세요',
  'gangnam-i': '역삼동 조선호텔 인근에서 17년간 완전 예약제로만 운영해온 곳입니다. 방문 전 전담 매니저가 배정되어 세팅부터 퇴장까지 밀착 관리합니다. 최소 하루 전 예약 필수',
  'gangnam-flirting': '강남대로 한복판, 선수 교체 횟수 제한이 없는 무한초이스 시스템의 원조 가게입니다. 눈치 없이 마음껏 골라보세요. 평일 워크인 가능하고 주말은 사전 전화 권장',
  'gangnam-blackhole': '역삼동에서 어게인 핵심 팀이 새 간판으로 시작한 라운지입니다. 경력 3년 이상 베테랑 선수진과 다크 모던 인테리어가 조화를 이루는 공간, 오후 8시부터 새벽 6시까지',
  'geondae-wclub': '건대입구역 2번 출구 도보 3분, 동서울에서 유일하게 10년을 버틴 가게입니다. 성수·광진 직장인 회식 2차 단골 코스로 통하며, 주말은 사전 전화 예약을 권장합니다',
  'jangan-bini': '장안동 367번지, 10년 경력 실장이 직접 취향을 읽어 선수를 배정합니다. 룸 중심 운영으로 프라이빗하게 즐길 수 있는 동대문구 검증 선택지, 방문 전 전화 확인 필수',
  'jangan-cube': '장한평역 5번 출구, 매일 100명 이상 선수가 출근하는 대형 시스템입니다. 무한초이스로 눈치 없이 고르는 쾌감을 경험해 보세요. 여성전용 운영, 카드결제 가능합니다',
  'jangan-bbangbbang': '장안동에서 입소문만으로 채워지는 단골 가게입니다. 편안한 분위기에서 부담 없이 시작하고 싶은 분에게 딱 맞는 곳으로, 처음이라 긴장되는 분께 자주 추천됩니다',
  'busan-michelin': '마린시티 야경 앞에서 부산 선수 랭킹 상위권이 모인 곳입니다. 서울에서 일부러 내려오는 단골이 있을 만큼 선수 퀄리티에 자부심이 있습니다. 오후 8시 오픈, 새벽 6시 마감',
  'busan-q': '해운대 해변에서 걸어서 2분, 파도 소리가 들리는 거리에서 시작하는 밤입니다. 해변 여행과 함께 계획하면 분위기와 서비스를 동시에 누릴 수 있습니다. 사전 전화 권장',
  'busan-david': '해운대 여성전용 토킹바의 시작점입니다. 부담 없이 대화부터 시작할 수 있어 첫 경험자에게 안성맞춤인 곳이며, 이벤트 요소가 포함되어 자연스럽게 분위기가 풀립니다',
  'busan-aura': '수영구 광남로에서 선수 30명이 상시 대기하는 부산 최대 규모 가게입니다. 선택폭이 넓어서 취향에 맞는 선수를 고를 확률이 높습니다. 매일 풀가동, 전화 후 방문 권장',
  'busan-menz': '광안대교 불빛이 보이는 광안해변로, 선수 40명 상주하는 대규모 라인업입니다. 고르는 것 자체가 즐거운 밤을 경험할 수 있으며, 신규 오픈으로 시설도 깔끔합니다',
  'busan-w': '연산동에서 부산 내 장수 운영 기록을 보유한 가게입니다. 오래 살아남은 이유는 실력으로 증명됩니다. 오후 8시부터 시작해 새벽까지 검증된 시간을 보낼 수 있습니다',
  'busan-theking': '연제구에서 가볍게 한 잔 하고 싶은 밤에 어울리는 곳입니다. 무한 음료가 포함되어 부담 없이 시작할 수 있으며, 금요일 밤 편안하게 즐기려면 전화 확인 후 방문하세요',
  'busan-js': '하단역 근처, 분리형 독립 공간으로 설계된 프라이빗 룸을 갖춘 곳입니다. 아는 사람 마주칠 걱정 없이 편안하게 이용할 수 있고, 신축 시설이라 환경도 깔끔합니다',
  'busan-michelin-jisung': 'MD 지성 실장이 취향을 직접 읽고 3분 안에 맞춤 선수를 배정하는 큐레이션 시스템입니다. 해운대에서 자신만의 밤을 설계하고 싶은 분에게 적합하며, 사전 상담을 권장합니다',
  'suwon-beast': '인계동 유흥가 한가운데 위치, 오후 8시부터 새벽 8시까지 12시간 논스톱으로 운영합니다. 서울 원정 없이 럭셔리 시설을 경험할 수 있는 수원 대표 가게입니다',
  'suwon-maid': '인계동 신축 건물에 자리한 수원 최대 규모 시설입니다. "이런 데가 수원에?" 반응이 후기의 절반이며, 인테리어로 압도하는 공간을 직접 확인해 보세요. 새벽 8시까지 운영',
  'suwon-play': '인계동에서 노래방 음향과 호빠 서비스를 결합한 가게입니다. 다음 날 오전 11시까지 14시간 영업으로 시간 제한 걱정이 없으며, 수원에서 유일한 가라오케 결합형입니다',
  'suwon-lasvegas': '인계동 화려한 조명 아래 편안하게 즐기는 금요 밤에 어울리는 곳입니다. 분위기는 확실하면서도 부담 없는 구성으로 가볍게 시작하기 좋습니다. 오후 8시 오픈, 전화 확인 권장',
  'daejeon-eclipse': '둔산동 중심가에서 충청권 전역의 원정객이 찾아올 정도로 독보적인 존재입니다. 선수진과 시스템 모두 검증 완료된 단 하나의 선택지, 전화 예약 후 방문하세요',
  'daejeon-tombar': '유성 봉명동, 카이스트·충남대 근처에서 젊은 에너지를 느낄 수 있는 가게입니다. 활기찬 분위기 속 검증된 선수진과 함께하는 밤을 경험하세요. 전화 예약 필수',
  'gwangju-w': '상무지구 번영로, 호남권에서 유일하게 검증된 가게입니다. 다른 곳 알아볼 필요 없이 이 한 곳만 기억하면 됩니다. 오후 9시 30분 오픈이며, 방문 전 전화 확인 필수',
  'changwon-avengers': '상남동 경남 대표 가게로, 1인 전담 TC 시스템을 운영합니다. 혼자 와도 각자 편하게 즐기는 구조이며, 둘이 오더라도 분리 운영이 가능합니다. 전화 한 통으로 시작하세요',
};

export function getVenueSeoDescription(venueId: string): string {
  return seoDescriptions[venueId] ?? '';
}

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
