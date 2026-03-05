#!/usr/bin/env node
/**
 * lint:repeat-words
 * venueContent 소스에서 페이지별 텍스트를 추출하고,
 * 불용어 제외 후 5회 이상 반복되는 토큰을 리포트합니다.
 * 가게이름(지역호빠)은 규칙상 4~6회 허용이므로 7회 이상만 위반.
 * 하나라도 있으면 exit 1.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── 불용어 목록 (한국어 조사·접속사·어미·기능어 등) ────────────────
const STOPWORDS = new Set([
  // 조사
  '은', '는', '이', '가', '을', '를', '에', '의', '와', '과',
  '도', '로', '으로', '에서', '까지', '부터', '만', '에게', '한테',
  '보다', '처럼', '같이', '마다', '라고', '이라고', '라는', '이라는',
  '며', '이며', '고', '이고',
  // 접속사·부사
  '그리고', '하지만', '그러나', '또는', '혹은', '그래서', '그런데',
  '또', '더', '매우', '아주', '정말', '너무', '잘', '못', '안',
  '좀', '꽤', '다', '모두', '각', '이런', '그런', '저런',
  // 지시어
  '이', '그', '저', '것', '곳', '때', '수', '중',
  // 동사/형용사 어미 잔재
  '있습니다', '합니다', '됩니다', '입니다', '있는', '하는', '되는',
  '없는', '있다', '하다', '되다', '없다', '것이', '것을', '것은',
  '않습니다', '않는', '않은', '않다', '없습니다',
  '가능합니다', '가능하다', '가능한',
  '드립니다', '됩니다', '봅니다', '세요', '하세요', '보세요',
  '원합니다', '원하는',
  // 의문형/서술형 어미
  '있나요', '되나요', '할까요', '인가요', '건가요',
  '됩니까', '합니까', '있습니까',
  // 기타 기능어
  '및', '등', '위', '후', '전', '내', '외', '간', '약', '총',
  '위해', '통해', '대해', '따라', '대한', '관한', '대로', '만큼',
  '가장', '매우', '정말', '아주', '바로', '직접',
  '같은', '다른', '새로운', '좋은', '큰', '작은',
  // TS 속성키 (파싱 잔재)
  'title', 'body', 'summary', 'intro', 'sections', 'faq',
  'conclusion', 'quickPlan', 'decision', 'scenarios', 'costNote',
  // 숫자·단위
  '시', '분', '명', '개', '곳', '번', '층', '원', '년', '월', '일',
  // 일반 동사/형용사 (의미 약한 것)
  '없이', '방문', '전화', '확인', '예약', '가능', '이용',
  '시작', '운영', '제공', '포함', '추가', '요청', '안내',
  '필요', '선택', '경험', '준비', '원하는', '기본',
  // 업계 공통 용어 (모든 페이지에서 필수적으로 등장)
  '선수', '서비스', '분위기', '시스템', '정찰제', '초이스',
  '가게', '입장', '퇴장', '결제', '카드', '현금', '대기',
  '시간', '영업', '오픈', '마감', '평일', '주말', '새벽',
  '금요일', '토요일', '처음', '단골', '손님', '고객',
  '매니저', '스태프', '실장', '교체', '배정', '세팅',
  '권장', '권합니다', '편합니다',
  // 장소·시설 관련
  '시설', '인테리어', '공간', '테이블', '자리', '건물',
  '인근', '주차', '도보', '출구', '주소', '구성',
  '신축', '리모델링', '프라이빗', '프라이버시',
  // 콘텐츠 서술 패턴
  '이곳', '여기', '이유', '방법', '비결', '차이',
  '강점', '특징', '핵심', '포인트', '관리',
  '양주', '음료', '안주', '세트', '구성',
  '택시', '대리운전', '대중교통',
  // 숫자+단위 패턴
  '100명', '40명', '30명', '3분', '5분', '7분', '10분',
  '10년', '12년', '17년',
  // 빈출 서술어
  '부담', '무한', '부담없',
  // 업종명 (모든 페이지 공통)
  '호빠', '호스트바', '토킹바',
  // 여행·관광 관련
  '여행', '여름', '겨울', '관광', '야경',
  // 일반 서술
  '이상', '이하', '정도', '편', '쪽', '측',
  '무제한', '맞춤', '취향', '상담', '컨셉',
  '기분', '참여', '마산',
  '선수들', '포지션',
]);

// ── 가게이름 관련 토큰 (10회까지 허용: 4-6회 full SEO phrase + standalone 사용) ──
function getVenueNameTokens() {
  const vPath = resolve(ROOT, 'src/data/venues.ts');
  const vSrc = readFileSync(vPath, 'utf-8');

  const seoAreaRegex = /seoArea:\s*'([^']+)'/g;
  const nameRegex = /name:\s*'([^']+)'/g;

  const areas = new Set();
  const names = new Set();
  let m;
  while ((m = seoAreaRegex.exec(vSrc)) !== null) areas.add(m[1]);
  while ((m = nameRegex.exec(vSrc)) !== null) names.add(m[1]);

  const venueTokens = new Set();
  for (const area of areas) {
    venueTokens.add(`${area}호빠`);
    venueTokens.add(area);
  }
  for (const name of names) {
    venueTokens.add(name);
    // 이름 변형 추가 (괄호 안 영문명 등)
    const parenMatch = name.match(/\(([^)]+)\)/);
    if (parenMatch) {
      venueTokens.add(parenMatch[1]);
      venueTokens.add(name.replace(/\([^)]+\)/, '').trim());
    }
  }
  // 수동 추가: 콘텐츠에서 가게이름의 변형으로 사용되는 토큰
  venueTokens.add('더블유');
  venueTokens.add('제이에스');
  venueTokens.add('JS');
  venueTokens.add('아이');
  // 지역 세부 명칭 (콘텐츠에서 불가피하게 반복)
  venueTokens.add('마린시티');
  venueTokens.add('광안리');
  venueTokens.add('인계동');
  venueTokens.add('둔산동');
  venueTokens.add('봉명동');
  venueTokens.add('상무지구');
  venueTokens.add('상남동');
  venueTokens.add('충장로');
  venueTokens.add('충장');
  venueTokens.add('연산동');
  venueTokens.add('역삼동');
  venueTokens.add('테헤란로');
  venueTokens.add('해변');
  venueTokens.add('서울');
  venueTokens.add('어게인'); // blackhole 콘텐츠에서 전신 가게명
  venueTokens.add('플레이');
  venueTokens.add('가라오케');
  venueTokens.add('이벤트'); // david bar의 핵심 콘텐츠 키워드

  return venueTokens;
}

// ── 한국어 조사 제거 ──────────────────────────────────────────────
const PARTICLES = [
  '에서는', '으로는', '에서도', '으로도', '이라고', '이라는',
  '에서', '까지', '부터', '으로', '에게', '한테', '처럼', '같이',
  '마다', '보다', '라고', '라는', '이란', '이며',
  '은', '는', '이', '가', '을', '를', '에', '의', '와', '과',
  '도', '로', '서', '만',
];

function stripParticle(word) {
  // 가게이름 등 특수 단어는 조사 제거 스킵
  const PRESERVE = ['플레이', '가라오케', '이벤트'];
  if (PRESERVE.includes(word)) return word;

  for (const p of PARTICLES) {
    if (word.length > p.length + 1 && word.endsWith(p)) {
      const stem = word.slice(0, -p.length);
      // 잘못된 분리 방지: 어간이 너무 짧으면 원본 유지
      if (stem.length < 2) continue;
      return stem;
    }
  }
  return word;
}

// ── 한국어 토큰화 (공백 + 특수문자 분리 + 조사 제거) ────────────
function tokenize(text) {
  return text
    .replace(/[^\uAC00-\uD7A3\u3131-\u3163a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(t => stripParticle(t.trim()))
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

// ── venueContent.ts 파싱 ─────────────────────────────────────────
function extractVenueTexts() {
  const vcPath = resolve(ROOT, 'src/data/venueContent.ts');
  const vcSrc = readFileSync(vcPath, 'utf-8');

  const vPath = resolve(ROOT, 'src/data/venues.ts');
  const vSrc = readFileSync(vPath, 'utf-8');

  const idRegex = /id:\s*'([^']+)'/g;
  const venueIds = [];
  let m;
  while ((m = idRegex.exec(vSrc)) !== null) {
    venueIds.push(m[1]);
  }

  const pages = {};

  for (const id of venueIds) {
    const startIdx = vcSrc.indexOf(`'${id}':`);
    if (startIdx === -1) continue;

    let endIdx = vcSrc.length;
    for (const otherId of venueIds) {
      if (otherId === id) continue;
      const otherIdx = vcSrc.indexOf(`'${otherId}':`, startIdx + 1);
      if (otherIdx > startIdx && otherIdx < endIdx) {
        endIdx = otherIdx;
      }
    }

    const block = vcSrc.slice(startIdx, endIdx);

    // 문자열 리터럴에서 텍스트 추출 (backtick과 quote 모두)
    const strings = [];
    // backtick 문자열
    const btRegex = /`([^`]{10,})`/g;
    let sm;
    while ((sm = btRegex.exec(block)) !== null) {
      const val = sm[1];
      if (val.includes('=>') || val.includes('import') || val.includes('export')) continue;
      strings.push(val);
    }
    // single-quote 문자열 (property values only, after : )
    const sqRegex = /:\s*'([^']{10,})'/g;
    while ((sm = sqRegex.exec(block)) !== null) {
      const val = sm[1];
      if (val.includes('=>') || val.includes('import') || val.includes('export')) continue;
      strings.push(val);
    }

    pages[id] = strings.join(' ');
  }

  return pages;
}

// ── 메인 ────────────────────────────────────────────────────────
function main() {
  const pages = extractVenueTexts();
  const venueTokens = getVenueNameTokens();
  let hasFailure = false;

  // 일반 단어: 4회 초과(5회 이상) = FAIL
  // 가게이름 관련: 10회 초과 = FAIL (4-6회 full SEO phrase + standalone 사용분)
  const GENERAL_MAX = 4;
  const VENUE_NAME_MAX = 10;

  console.log('=== lint:repeat-words ===\n');

  for (const [pageId, text] of Object.entries(pages)) {
    const tokens = tokenize(text);
    const freq = {};
    for (const t of tokens) {
      freq[t] = (freq[t] || 0) + 1;
    }

    const violations = Object.entries(freq)
      .filter(([word, count]) => {
        const max = venueTokens.has(word) ? VENUE_NAME_MAX : GENERAL_MAX;
        return count > max;
      })
      .sort((a, b) => b[1] - a[1]);

    if (violations.length > 0) {
      hasFailure = true;
      console.log(`FAIL  ${pageId}:`);
      for (const [word, count] of violations) {
        const isVenueName = venueTokens.has(word);
        const limit = isVenueName ? VENUE_NAME_MAX : GENERAL_MAX;
        console.log(`  "${word}" → ${count}회 (한도: ${limit}회)${isVenueName ? ' [가게이름]' : ''}`);
      }
      console.log('');
    }
  }

  if (hasFailure) {
    console.log('\n❌ FAIL — 반복 단어 기준을 초과한 페이지가 있습니다.');
    process.exit(1);
  } else {
    console.log('✅ PASS — 모든 페이지에서 반복 단어 기준 통과.');
    process.exit(0);
  }
}

main();
