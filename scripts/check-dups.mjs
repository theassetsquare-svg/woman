// 모든 페이지 제목 수집
const titles = [];

// 1. 메인페이지
titles.push('호빠 처음이면 이것만 보세요 — 전국 TOP 25 완벽 정리');

// 2. 전체목록 페이지
titles.push('호빠 25곳 한눈에 비교 — 지역별 맞춤 검색');

// 3. 지역 카테고리 (RegionPage)
const regionHook = {
  gangnam: '강남호빠 어디가야 할지 모르겠다면? TOP 4 핵심 가이드',
  geondae: '건대호빠 단골만 모인다 — 검증된 TOP 1 실전 리뷰',
  jangan: '장안동호빠 프라이빗 끝판왕 — TOP 3 집중 탐구',
  busan: '부산호빠 해운대 밤바다보다 화려한 — TOP 10 총정리',
  gyeonggi: '수원호빠 서울 안 부러운 반전 매력 — TOP 4 현장 점검',
  daejeon: '대전호빠 현지인만 추천하는 숨겨진 핫플 — TOP 2 밀착 취재',
  gwangju: '광주호빠 호남 대표 — 딱 한 곳이면 끝',
  changwon: '창원호빠 경남 유일무이 — 반드시 가봐야 할 곳',
};
Object.values(regionHook).forEach(t => titles.push(t));

// 4. 개별 업소 상세페이지
const venues = [
  { label: '강남호빠 보스턴', hook: '첫 방문이라면 여기부터, 12년간 실패 없는 선택' },
  { label: '강남호빠 아이(I)', hook: '한 번 다녀오면 단골 확정, 재방문율 업계 1위의 비밀' },
  { label: '강남호빠 플러팅진혁', hook: '내 손으로 고른다, 무한초이스의 원조' },
  { label: '강남호빠 블랙홀', hook: '어게인 DNA 계승, 올해 가장 핫한 신상' },
  { label: '건대호빠 W클럽', hook: '10년 생존엔 비결이 있다' },
  { label: '장안동호빠 빈이', hook: '베테랑이 만드는 분위기' },
  { label: '장안동호빠 큐브', hook: '100명 중 뽑는 재미, 눈치 없이 무한초이스' },
  { label: '장안동호빠 빵빵', hook: '긴장된다면 딱 맞는 곳, 편안함의 정석' },
  { label: '해운대호빠 미슐랭', hook: '서울에서 일부러 내려오는 이유, 에이스 TOP 5 집결' },
  { label: '해운대호빠 큐(Q)', hook: '해변 도보 2분, 파도 소리와 함께하는 밤' },
  { label: '해운대호빠 다비드바', hook: '입문자 필수 코스, 첫 경험은 이곳' },
  { label: '부산호빠 아우라', hook: '30명 상시 대기, 스케일이 남다른 곳' },
  { label: '부산호빠 맨즈', hook: '광안리 바다 앞 40명, 못 픽하는 게 더 어렵다' },
  { label: '부산호빠 더블유(W)', hook: '오래 살아남은 데는 실력이 증거, 부산 최장수' },
  { label: '부산호빠 더킹', hook: '무한 음료 포함, 부산에서 제일 가벼운 밤' },
  { label: '부산호빠 제이에스(JS)', hook: '독립 분리형 룸 완비, 마주칠 염려 제로' },
  { label: '해운대호빠 미슐랭(지성)', hook: '내 스타일 정확히 읽는 실장이 있는 곳' },
  { label: '수원호빠 비스트', hook: '새벽 8시 논스톱, 12시간 풀가동' },
  { label: '수원호빠 메이드', hook: '들어가는 순간 압도당한다, 신축 최대 규모' },
  { label: '수원호빠 플레이 가라오케', hook: '노래방+호빠 한 번에, 오전 11시까지' },
  { label: '수원호빠 라스베가스', hook: '가볍게 화려하게, 인계동의 정답' },
  { label: '대전호빠 이클립스', hook: '대전 독보적 1위, 충청권 원정 맛집' },
  { label: '대전호빠 톰바', hook: '봉명동 대학가 감성, 젊은 에너지가 넘치는 밤' },
  { label: '광주호빠 W', hook: '호남권 유일, 이 한 곳만 기억하세요' },
  { label: '창원호빠 어벤져스', hook: '1인 전담 TC 시스템, 혼자 와도 편하게 즐기는 밤' },
];
venues.forEach(v => titles.push(v.label + ' — ' + v.hook));

console.log('=== 전체 ' + titles.length + '개 페이지 제목 ===');
titles.forEach((t, i) => console.log((i+1) + '. ' + t));

// 단어 빈도 분석 (2글자 이상 한글 단어만, hook 부분에서만 추출)
const wordCount = {};
// SEO 키워드로 의도적 중복인 것 제외
const seoKeywords = new Set(['호빠', '강남호빠', '건대호빠', '장안동호빠', '부산호빠', '해운대호빠', '수원호빠', '대전호빠', '광주호빠', '창원호빠']);

titles.forEach(t => {
  const words = t.match(/[가-힣]{2,}/g) || [];
  words.forEach(w => {
    if (!seoKeywords.has(w)) {
      wordCount[w] = (wordCount[w] || 0) + 1;
    }
  });
});

// 2회 이상 등장하는 단어
const duplicates = Object.entries(wordCount)
  .filter(([_, count]) => count >= 2)
  .sort((a, b) => b[1] - a[1]);

console.log('\n=== 2회 이상 중복 단어 (SEO 키워드 제외) ===');
if (duplicates.length === 0) {
  console.log('중복 단어 없음! ✓');
} else {
  duplicates.forEach(([word, count]) => {
    // 어떤 제목에서 나오는지 표시
    const inTitles = titles.filter(t => t.includes(word)).map((t, i) => '  → ' + t);
    console.log(word + ': ' + count + '회');
    inTitles.forEach(l => console.log(l));
  });
}
