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
  keyword?: string;
  contact?: string;
  category?: 'night' | 'club' | 'lounge';
}

export const regions = [
  { id: 'gangnam', name: '강남' },
  { id: 'busan', name: '부산' },
  { id: 'gyeonggi', name: '경기' },
  { id: 'seoul', name: '서울' },
  { id: 'ulsan', name: '울산' },
  { id: 'incheon', name: '인천' },
  { id: 'daejeon', name: '대전' },
  { id: 'itaewon', name: '이태원' },
] as const;

export const venues: Venue[] = [
  // ===== 닉네임+전화 7개 (상단 노출) =====
  {
    id: 'busan-mulnight',
    name: '물나이트',
    region: 'busan',
    area: '연산동',
    seoArea: '부산연산동',
    address: '부산시 연제구 연산동',
    description: '부산 연산동 한복판, 따봉 실장이 직접 현장을 관리하는 신뢰도 높은 나이트. 사운드와 조명 모두 현장에서 직접 확인해야 그 차이를 느낄 수 있습니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-7942-9076',
    tags: ['부산', '연산동', '나이트', '따봉실장'],
    card_hook: '연산동 한복판, 따봉 실장 직영.\n사운드 한 번 들으면 다시 올 수밖에 없는 현장.',
    card_value: '따봉 실장 · 연산동 대표 · PM 9:00~',
    card_tags: '연산동 · 실장직영 · 전화예약가능',
    keyword: '부산연산동물나이트',
    contact: '따봉',
    category: 'night',
  },
  {
    id: 'seongnam-shampoo',
    name: '샴푸나이트',
    region: 'gyeonggi',
    area: '성남',
    seoArea: '성남',
    address: '경기도 성남시 중원구',
    description: '성남 지역 중심부, 박찬호 실장이 직접 이끄는 세련된 무대. 매주 금토 이벤트가 달라지니 방문 전 전화 한 통이면 완벽한 밤이 시작됩니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-3987-6885',
    tags: ['성남', '경기', '나이트', '박찬호실장'],
    card_hook: '성남 중심가, 박찬호 실장 직영.\n매주 다른 이벤트, 매번 새로운 밤.',
    card_value: '박찬호 실장 · 성남 대표 · PM 9:00~',
    card_tags: '성남 · 실장직영 · 이벤트풍성',
    keyword: '성남샴푸나이트',
    contact: '박찬호',
    category: 'night',
  },
  {
    id: 'suwon-chancedom',
    name: '찬스돔나이트',
    region: 'gyeonggi',
    area: '수원',
    seoArea: '수원',
    address: '경기도 수원시 팔달구',
    description: '수원 팔달구, 강호동 실장이 운영하는 돔 구조의 대형 공간. 천장이 높아 소리가 퍼지는 방식 자체가 다르고, 그래서 한번 와본 사람은 돔의 매력을 잊지 못합니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-9354-1323',
    tags: ['수원', '경기', '나이트', '강호동실장', '돔구조'],
    card_hook: '수원 유일 돔 구조, 강호동 실장 직영.\n천장이 높아서 소리가 다르다.',
    card_value: '강호동 실장 · 돔형 대공간 · PM 9:00~',
    card_tags: '수원 · 돔구조 · 대형공간',
    keyword: '수원찬스돔나이트',
    contact: '강호동',
    category: 'night',
  },
  {
    id: 'seoul-sinlim-grandprix',
    name: '그랑프리나이트',
    region: 'seoul',
    area: '신림',
    seoArea: '신림',
    address: '서울시 관악구 신림동',
    description: '신림역 인근 관악구 최대 규모, 태양 실장이 현장을 총괄합니다. 금요일 밤이면 신림 일대가 이곳으로 모이는 데는 이유가 있습니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-4241-3748',
    tags: ['신림', '관악구', '나이트', '태양실장', '대규모'],
    card_hook: '신림역 5분, 태양 실장 직영.\n관악구에서 가장 넓은 공간, 가장 센 사운드.',
    card_value: '태양 실장 · 관악구 최대 · PM 9:00~',
    card_tags: '신림 · 대규모 · 강력사운드',
    keyword: '신림그랑프리나이트',
    contact: '태양',
    category: 'night',
  },
  {
    id: 'gangnam-h2o',
    name: 'H2O나이트',
    region: 'gangnam',
    area: '청담',
    seoArea: '청담',
    address: '서울시 강남구 청담동',
    description: '청담동 한가운데, 펩시맨 실장이 이끄는 최고급 나이트. 입장부터 퇴장까지 VIP 동선이 설계되어 있어 강남권에서도 격이 다른 경험을 할 수 있습니다',
    hours: 'PM 10:00 ~ AM 6:00',
    phone: '010-5655-4866',
    tags: ['청담', '강남', '나이트', '펩시맨실장', 'VIP'],
    card_hook: '청담동 VIP 동선, 펩시맨 실장 직영.\n강남에서도 한 단계 위의 밤.',
    card_value: '펩시맨 실장 · 청담 최고급 · PM 10:00~',
    card_tags: '청담 · VIP전용 · 프리미엄사운드',
    keyword: '청담H2O나이트',
    contact: '펩시맨',
    category: 'night',
  },
  {
    id: 'paju-skydome',
    name: '스카이돔나이트',
    region: 'gyeonggi',
    area: '파주 야당',
    seoArea: '파주야당',
    address: '경기도 파주시 야당동',
    description: '파주 야당역 인근, 막내 실장이 운영하는 돔형 나이트. 경기 북부에서 이 규모의 사운드를 갖춘 곳은 여기뿐이라 일산·김포에서도 찾아옵니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-8255-3509',
    tags: ['파주', '야당', '나이트', '막내실장', '스카이돔'],
    card_hook: '경기 북부 유일 돔형, 막내 실장 직영.\n일산·김포에서도 일부러 찾아오는 이유.',
    card_value: '막내 실장 · 경기북부 유일 · PM 9:00~',
    card_tags: '파주야당 · 돔형 · 경기북부대표',
    keyword: '파주야당스카이돔나이트',
    contact: '막내',
    category: 'night',
  },
  {
    id: 'ulsan-champion',
    name: '챔피언나이트',
    region: 'ulsan',
    area: '울산',
    seoArea: '울산',
    address: '울산광역시 남구',
    description: '울산 남구 중심, 춘자 실장이 10년 넘게 지켜온 현장. 울산에서 나이트 한 곳만 추천하라면 현지인 열에 아홉은 이름을 말합니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '010-5653-0069',
    tags: ['울산', '나이트', '춘자실장', '10년전통'],
    card_hook: '울산 남구, 춘자 실장 10년 직영.\n현지인 열에 아홉이 추천하는 곳.',
    card_value: '춘자 실장 · 울산 유일 대표 · PM 9:00~',
    card_tags: '울산 · 10년전통 · 현지인추천',
    keyword: '울산챔피언나이트',
    contact: '춘자',
    category: 'night',
  },

  // ===== 전화없는 12개 =====
  {
    id: 'seoul-suyu-shampoo',
    name: '샴푸나이트',
    region: 'seoul',
    area: '수유',
    seoArea: '수유',
    address: '서울시 강북구 수유동',
    description: '수유역 인근, 강북에서 이 정도 사운드 시스템을 갖춘 곳을 찾기 어렵습니다. 평일에도 빈자리가 드물 정도로 동네 단골이 탄탄합니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['수유', '강북', '나이트', '샴푸나이트'],
    card_hook: '수유역 인근, 강북 최강 사운드.\n평일에도 빈자리 드문 동네 명소.',
    card_value: '수유 대표 · 강북 최대 음향 · PM 9:00~',
    card_tags: '수유 · 강북 · 탄탄한단골',
    keyword: '수유샴푸나이트',
    category: 'night',
  },
  {
    id: 'indeogwon-gukbingwan',
    name: '국빈관나이트',
    region: 'gyeonggi',
    area: '인덕원',
    seoArea: '인덕원',
    address: '경기도 안양시 동안구 인덕원',
    description: '인덕원역 도보권, 안양·의왕·과천에서 접근성이 뛰어난 입지. 격조 있는 내부 인테리어가 다른 나이트와 확연히 구별되는 분위기를 만듭니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['인덕원', '안양', '나이트', '국빈관', '격조'],
    card_hook: '인덕원역 도보권, 격조 있는 인테리어.\n안양·의왕·과천 접근성 최고.',
    card_value: '인덕원 대표 · 격조 있는 공간 · PM 9:00~',
    card_tags: '인덕원 · 격조 · 접근성우수',
    keyword: '인덕원국빈관나이트',
    category: 'night',
  },
  {
    id: 'ilsan-shampoo',
    name: '샴푸나이트',
    region: 'gyeonggi',
    area: '일산',
    seoArea: '일산',
    address: '경기도 고양시 일산동구',
    description: '일산 중심가, 고양시에서 가장 넓은 플로어와 최신 음향 장비를 갖췄습니다. 주말이면 파주·김포 쪽에서도 원정 오는 경기 서북부 핵심 거점입니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['일산', '고양시', '나이트', '샴푸나이트', '경기서북부'],
    card_hook: '일산 중심가, 고양시 최대 규모.\n파주·김포에서도 원정 오는 경기 서북부 거점.',
    card_value: '일산 대표 · 고양시 최대 · PM 9:00~',
    card_tags: '일산 · 최대규모 · 최신음향',
    keyword: '일산샴푸나이트',
    category: 'night',
  },
  {
    id: 'incheon-arabian',
    name: '아라비안나이트',
    region: 'incheon',
    area: '인천',
    seoArea: '인천',
    address: '인천광역시 남동구',
    description: '인천 남동구, 이국적 콘셉트 인테리어가 발을 들이는 순간부터 현실과 분리시킵니다. 인천에서 분위기로 승부하는 유일한 나이트입니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['인천', '나이트', '아라비안', '이국적'],
    card_hook: '인천 남동구, 이국적 콘셉트 인테리어.\n현실과 분리되는 순간부터 밤이 시작.',
    card_value: '인천 유일 콘셉트 · 이국적 분위기 · PM 9:00~',
    card_tags: '인천 · 이국적 · 콘셉트인테리어',
    keyword: '인천아라비안나이트',
    category: 'night',
  },
  {
    id: 'daejeon-seven',
    name: '세븐나이트',
    region: 'daejeon',
    area: '대전',
    seoArea: '대전',
    address: '대전광역시 서구',
    description: '대전 서구 중심, 충청권 전역에서 모이는 대표 나이트클럽. 세종·천안·청주에서도 일부러 찾아오는 데는 사운드와 운영력에 이유가 있습니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['대전', '나이트', '세븐', '충청권대표'],
    card_hook: '대전 서구, 충청권 전역에서 모이는 곳.\n세종·천안·청주에서도 원정 오는 이유.',
    card_value: '대전 대표 · 충청권 거점 · PM 9:00~',
    card_tags: '대전 · 충청권대표 · 강력사운드',
    keyword: '대전세븐나이트',
    category: 'night',
  },
  {
    id: 'seoul-sangbong-hankukgwan',
    name: '한국관나이트',
    region: 'seoul',
    area: '상봉동',
    seoArea: '상봉동',
    address: '서울시 중랑구 상봉동',
    description: '상봉역 인근, 서울 동북권에서 가장 오래된 전통 나이트. 세대를 넘어 부모님 시절부터 이어진 단골 문화가 이 가게의 진짜 자산입니다',
    hours: 'PM 9:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['상봉동', '중랑구', '나이트', '한국관', '전통'],
    card_hook: '상봉역 인근, 서울 동북권 전통 명소.\n세대를 넘어 이어지는 단골 문화.',
    card_value: '상봉동 대표 · 동북권 전통 · PM 9:00~',
    card_tags: '상봉동 · 전통명소 · 오래된신뢰',
    keyword: '상봉동한국관나이트',
    category: 'night',
  },

  // ===== 클럽 =====
  {
    id: 'gangnam-club-race',
    name: '레이스',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 역삼동',
    description: '강남 한복판, 금요일 밤이면 입장 줄이 50m를 넘기는 건 과장이 아닙니다. DJ 라인업과 사운드 시스템이 몸을 먼저 움직이게 만드는 곳입니다',
    hours: 'PM 10:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['강남', '클럽', '레이스', 'EDM', '금요밤'],
    card_hook: '강남 한복판, 금요 밤 입장줄 50m.\nDJ 사운드가 몸을 먼저 움직이게 한다.',
    card_value: '강남 클럽 대표 · EDM 명소 · PM 10:00~',
    card_tags: '강남 · EDM · 금요밤필수',
    keyword: '강남클럽 레이스',
    category: 'club',
  },
  {
    id: 'gangnam-club-sound',
    name: '사운드',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 논현동',
    description: '강남 논현동, 이름 그대로 음향에 모든 걸 건 클럽. 독일제 스피커 시스템이 만드는 저음은 가슴이 아니라 뼈를 울리는 수준입니다',
    hours: 'PM 10:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['강남', '클럽', '사운드', '프리미엄음향'],
    card_hook: '강남 논현동, 이름값 하는 음향 클럽.\n독일제 스피커가 뼈를 울리는 저음.',
    card_value: '프리미엄 음향 · 강남 클럽 · PM 10:00~',
    card_tags: '강남 · 프리미엄음향 · 독일제시스템',
    keyword: '강남클럽 사운드',
    category: 'club',
  },
  {
    id: 'itaewon-waikiki',
    name: '와이키키유토피아',
    region: 'itaewon',
    area: '이태원',
    seoArea: '이태원',
    address: '서울시 용산구 이태원동',
    description: '이태원 메인 스트리트, 한국인과 외국인이 자연스럽게 섞이는 글로벌 파티 공간. 여기선 언어가 아니라 음악이 대화의 수단이 됩니다',
    hours: 'PM 10:00 ~ AM 6:00',
    phone: '별도문의',
    tags: ['이태원', '클럽', '와이키키', '글로벌', '파티'],
    card_hook: '이태원 메인, 글로벌 파티 공간.\n언어가 아닌 음악으로 소통하는 밤.',
    card_value: '이태원 클럽 대표 · 글로벌감성 · PM 10:00~',
    card_tags: '이태원 · 글로벌 · 다국적파티',
    keyword: '이태원클럽 와이키키유토피아',
    category: 'club',
  },
  {
    id: 'gangnam-lounge-hype',
    name: '하입',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 신사동',
    description: '강남 신사동, 클럽의 에너지와 라운지의 여유가 공존하는 공간. 소파석에 앉아 DJ 셋을 감상하는 방식이 여기서 시작됐습니다',
    hours: 'PM 8:00 ~ AM 4:00',
    phone: '별도문의',
    tags: ['강남', '라운지', '하입', '소파석', '세련됨'],
    card_hook: '강남 신사동, 에너지와 여유의 공존.\n소파석에서 DJ 셋을 감상하는 새로운 방식.',
    card_value: '강남 라운지 · 소파석+DJ · PM 8:00~',
    card_tags: '강남 · 라운지 · 소파석감상',
    keyword: '강남라운지 하입',
    category: 'lounge',
  },
  {
    id: 'gangnam-lounge-color',
    name: '컬러',
    region: 'gangnam',
    area: '강남',
    seoArea: '강남',
    address: '서울시 강남구 압구정동',
    description: '강남 압구정, 시간대별로 조명 색상이 바뀌며 분위기가 완전히 전환됩니다. 같은 공간인데 9시와 12시의 무드가 전혀 다른 경험을 선사합니다',
    hours: 'PM 8:00 ~ AM 4:00',
    phone: '별도문의',
    tags: ['강남', '라운지', '컬러', '감각적조명', '트렌디'],
    card_hook: '강남 압구정, 시간대별 조명 전환.\n9시와 12시의 분위기가 완전히 다르다.',
    card_value: '감각적 라운지 · 조명연출 · PM 8:00~',
    card_tags: '강남 · 트렌디 · 조명연출',
    keyword: '강남라운지 컬러',
    category: 'lounge',
  },
  {
    id: 'gangnam-lounge-arju',
    name: '아르쥬',
    region: 'gangnam',
    area: '청담',
    seoArea: '청담',
    address: '서울시 강남구 청담동',
    description: '청담동 고급 클럽, 입장 기준이 까다롭기로 유명하지만 그래서 안에서의 경험이 보장됩니다. 드레스코드와 예약은 필수입니다',
    hours: 'PM 10:00 ~ AM 5:00',
    phone: '별도문의',
    tags: ['청담', '클럽', '아르쥬', '고급', '드레스코드'],
    card_hook: '청담동, 입장 기준이 곧 품질 보증.\n까다로운 문 안쪽의 경험은 확실하다.',
    card_value: '청담 프리미엄 클럽 · 예약필수 · PM 10:00~',
    card_tags: '청담 · 프리미엄 · 드레스코드필수',
    keyword: '청담클럽 아르쥬',
    category: 'club',
  },
];

const MAIN_LINK = 'https://ilsanroom.pages.dev';

export function getMainLink(): string {
  return MAIN_LINK;
}

export function getVenueLabel(venue: Venue): string {
  if (venue.keyword) return venue.keyword;
  return `${venue.seoArea}나이트 ${venue.name}`;
}

const seoHooks: Record<string, string> = {
  'busan-mulnight': '따봉 실장이 직접 관리하는 현장, 한번 오면 단골 된다',
  'seongnam-shampoo': '박찬호 실장 직영, 매주 다른 이벤트로 채우는 밤',
  'suwon-chancedom': '돔 천장 아래 울리는 사운드, 강호동이 만드는 파티',
  'seoul-sinlim-grandprix': '역에서 5분, 태양 실장이 이끄는 관악 최대 무대',
  'gangnam-h2o': 'VIP 동선 설계, 펩시맨 실장의 프리미엄 경험',
  'paju-skydome': '경기 북부 유일 돔형, 막내 실장이 지키는 밤의 열기',
  'ulsan-champion': '현지인 9명이 추천, 춘자 실장이 지켜온 전통의 무대',
  'seoul-suyu-shampoo': '강북 최강 사운드, 평일에도 빈자리 없는 이유',
  'indeogwon-gukbingwan': '도보권 접근성, 격조와 편의를 동시에 갖춘 공간',
  'ilsan-shampoo': '고양시 최대 플로어, 경기 서북부 원정객이 모이는 곳',
  'incheon-arabian': '이국적 콘셉트 인테리어, 현실과 분리되는 밤',
  'daejeon-seven': '충청권 전역에서 모이는 대표 무대, 사운드에 이유가 있다',
  'seoul-sangbong-hankukgwan': '전통 명소, 세대를 넘어 이어지는 단골 신뢰',
  'gangnam-club-race': '금요밤 입장줄 50m, 몸이 먼저 반응하는 EDM',
  'gangnam-club-sound': '독일제 스피커 시스템, 이름값 하는 프리미엄 음향',
  'itaewon-waikiki': '글로벌 파티, 음악이 언어를 대신하는 공간',
  'gangnam-lounge-hype': '신사동, 소파석에서 DJ 셋을 감상하는 새로운 방식',
  'gangnam-lounge-color': '압구정, 9시와 12시의 분위기가 완전히 다른 공간',
  'gangnam-lounge-arju': '입장 기준이 곧 품질 보증, 예약 필수 프리미엄',
};

const seoDescriptions: Record<string, string> = {
  'busan-mulnight': '부산연산동물나이트는 따봉 실장이 직접 현장을 관리하는 연산동 대표 나이트클럽입니다. 최신 사운드 시스템과 조명 연출로 부산 밤문화의 중심지 역할을 합니다. 방문 전 전화 예약을 권장합니다.',
  'seongnam-shampoo': '성남샴푸나이트는 박찬호 실장이 이끄는 성남 지역 대표 나이트입니다. 매주 금토마다 달라지는 특별 이벤트와 세련된 무대 연출이 특징이며, 사전 문의 후 방문하면 더 알찬 밤을 보낼 수 있습니다.',
  'suwon-chancedom': '수원찬스돔나이트는 강호동 실장이 운영하는 수원 유일의 돔 구조 나이트클럽입니다. 높은 천장에서 울려 퍼지는 사운드가 독보적이며, 대형 파티를 원하는 분께 적합합니다.',
  'seoul-sinlim-grandprix': '신림그랑프리나이트는 태양 실장이 총괄하는 관악구 최대 규모 무대입니다. 역에서 도보 5분, 금요일 밤엔 신림 일대 인파가 이곳으로 쏠리는 데는 분명한 이유가 있습니다.',
  'gangnam-h2o': '청담H2O나이트는 펩시맨 실장이 이끄는 강남권 최고급 공간입니다. VIP 전용 동선이 설계되어 입장부터 퇴장까지 격이 다르며, 반드시 사전 예약 후 방문해야 합니다.',
  'paju-skydome': '파주야당스카이돔나이트는 막내 실장이 운영하는 경기 북부 유일 돔형 공간입니다. 천장이 높아 소리 울림 자체가 독보적이고, 일산·김포 방면에서도 일부러 찾아옵니다.',
  'ulsan-champion': '울산챔피언나이트는 춘자 실장이 10년 넘게 지켜온 울산 대표 나이트클럽입니다. 현지인 추천율이 압도적이며, 울산에서 나이트를 찾는다면 첫 번째 선택지입니다.',
  'seoul-suyu-shampoo': '수유샴푸나이트는 수유역 바로 앞, 강북 음향의 기준을 새로 세운 곳입니다. 동네 단골이 탄탄해서 평일 밤에도 빈 테이블 찾기가 쉽지 않습니다.',
  'indeogwon-gukbingwan': '인덕원국빈관나이트는 인덕원역 도보권에 위치한 안양 지역 대표 나이트입니다. 격조 있는 인테리어와 안양·의왕·과천에서의 뛰어난 접근성이 강점입니다.',
  'ilsan-shampoo': '일산샴푸나이트는 고양시 최대 플로어를 자랑하며 최신 음향 장비가 압도적입니다. 주말이면 파주·김포 쪽에서 택시 타고 올 만큼 경기 서북부 밤의 구심점 역할을 합니다.',
  'incheon-arabian': '인천아라비안나이트는 인천 남동구에 위치한 이국적 콘셉트 나이트클럽입니다. 아라비안 테마 인테리어가 현실과 분리되는 독특한 경험을 선사하며, 인천에서 분위기로 승부하는 유일한 곳입니다.',
  'daejeon-seven': '대전세븐나이트는 서구 중심부에서 충청 전역 손님을 끌어모으는 저력 있는 무대입니다. 세종·천안·청주에서 차 몰고 올 만큼 사운드와 운영 안정감 모두 입증된 곳입니다.',
  'seoul-sangbong-hankukgwan': '상봉동한국관나이트는 상봉역 인근 서울 동북권 전통 나이트입니다. 세대를 넘어 이어지는 단골 문화가 이 가게의 진짜 자산이며, 오랜 역사만큼 운영 노하우가 축적된 곳입니다.',
  'gangnam-club-race': '강남클럽 레이스는 강남 한복판에서 금요일 밤 입장줄 50m를 넘기는 EDM 명소입니다. DJ 라인업과 사운드 시스템이 국내 최정상급이며, 사전 예약을 권장합니다.',
  'gangnam-club-sound': '강남클럽 사운드는 이름 그대로 음향에 모든 것을 건 프리미엄 클럽입니다. 독일제 스피커 시스템이 만드는 저음은 뼈를 울리는 수준이며, 음악 매니아에게 추천합니다.',
  'itaewon-waikiki': '이태원클럽 와이키키유토피아는 한국인과 외국인이 자연스럽게 어울리는 글로벌 파티 공간입니다. 음악이 언어를 대신하는 이태원 대표 클럽이며, 사전 예약 권장합니다.',
  'gangnam-lounge-hype': '강남라운지 하입은 신사동에서 클럽 에너지와 라운지 여유를 동시에 경험할 수 있는 공간입니다. 소파석에서 DJ 셋을 감상하는 새로운 방식을 제안하며, 사전 예약 필수입니다.',
  'gangnam-lounge-color': '강남라운지 컬러는 압구정에서 시간대별 조명 연출로 분위기가 완전히 전환되는 감각적 공간입니다. 9시와 12시의 무드가 전혀 달라 두 번 방문하는 기분을 느낄 수 있습니다.',
  'gangnam-lounge-arju': '청담클럽 아르쥬는 까다로운 입장 기준으로 유명한 청담 프리미엄 클럽입니다. 드레스코드와 사전 예약이 필수이며, 기준을 통과한 안쪽 공간의 경험은 확실히 보장됩니다.',
};

export function getVenueSeoDescription(venueId: string): string {
  return seoDescriptions[venueId] ?? '';
}

export function getVenueHook(venueId: string): string {
  return seoHooks[venueId] ?? '';
}

export function getSubKeywords(venue: Venue): string[] {
  if (venue.category === 'club') {
    return [`${venue.seoArea} 클럽`, `${venue.seoArea} 클럽 추천`, `${venue.seoArea} 클럽 순위`];
  }
  if (venue.category === 'lounge') {
    return [`${venue.seoArea} 라운지`, `${venue.seoArea} 라운지바`, `${venue.seoArea} 라운지 추천`];
  }
  return [`${venue.seoArea} 나이트`, `${venue.seoArea} 나이트클럽`, `${venue.seoArea} 나이트 추천`];
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

export function getNightVenues(): Venue[] {
  return venues.filter((v) => v.category === 'night');
}

export function getClubVenues(): Venue[] {
  return venues.filter((v) => v.category === 'club');
}

export function getLoungeVenues(): Venue[] {
  return venues.filter((v) => v.category === 'lounge');
}

export function getContactVenues(): Venue[] {
  return venues.filter((v) => !!v.contact && v.phone !== '별도문의');
}

export function getVenuesByCategory(): { category: string; label: string; venues: Venue[] }[] {
  return [
    { category: 'night', label: '나이트', venues: getNightVenues() },
    { category: 'club', label: '클럽', venues: getClubVenues() },
    { category: 'lounge', label: '라운지', venues: getLoungeVenues() },
  ];
}

export function getVenueByRegionSlug(region: string, slug: string): Venue | undefined {
  return venues.find((v) => v.id === `${region}-${slug}` && v.region === region)
    || venues.find((v) => v.id === slug && v.region === region);
}
