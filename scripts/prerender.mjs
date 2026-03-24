/**
 * Post-build prerender script.
 * Generates route-specific HTML files for crawlers.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://woman-5nj.pages.dev';
const SITE_NAME = '여성이 편안한 밤문화';
const template = readFileSync('dist/index.html', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

// ====== Parse venue data ======
function parseVenues() {
  const results = [];
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']*)',\s*region:\s*'([^']+)',\s*area:\s*'([^']*)',\s*seoArea:\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(venuesSrc)) !== null) {
    const id = m[1], name = m[2], region = m[3], area = m[4], seoArea = m[5];
    const idx = venuesSrc.indexOf(`id: '${id}'`);
    const chunk = venuesSrc.slice(idx, idx + 800);
    const kwMatch = chunk.match(/keyword:\s*'([^']*)'/);
    const catMatch = chunk.match(/category:\s*'([^']*)'/);
    const phoneMatch = chunk.match(/phone:\s*'([^']*)'/);

    const keyword = kwMatch ? kwMatch[1] : (seoArea + '나이트 ' + name);
    const category = catMatch ? catMatch[1] : 'night';
    const phone = phoneMatch ? phoneMatch[1] : '';

    const prefix = region + '-';
    const slug = id.startsWith(prefix) ? id.slice(prefix.length) : id;
    const path = `/${region}/${slug}`;

    results.push({ id, name, region, area, seoArea, keyword, category, phone, path });
  }
  return results;
}

function getHook(venueId) {
  const hookStart = venuesSrc.indexOf('const seoHooks');
  const hookEnd = venuesSrc.indexOf('const seoDescriptions');
  const hookSection = venuesSrc.slice(hookStart, hookEnd);
  const hm = hookSection.match(new RegExp(`'${venueId}':\\s*'([^']*)'`));
  return hm ? hm[1] : '';
}

function getDesc(venueId) {
  const descStart = venuesSrc.indexOf('const seoDescriptions');
  const descSection = venuesSrc.slice(descStart);
  const dm = descSection.match(new RegExp(`'${venueId}':\\s*'([^']*)'`));
  return dm ? dm[1] : '';
}

function getRegionName(regionId) {
  const rm = venuesSrc.match(new RegExp(`id:\\s*'${regionId}',\\s*name:\\s*'([^']*)'`));
  return rm ? rm[1] : regionId;
}

function generateHTML(opts) {
  const { title, description, canonical, ogImage, h1, introText, jsonLd } = opts;
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escAttr(description)}"`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${escAttr(canonical)}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escAttr(title)}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escAttr(description)}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${escAttr(canonical)}"`
  );
  if (ogImage) {
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${escAttr(ogImage)}"`
    );
  }
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${escAttr(title)}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${escAttr(description)}"`
  );
  if (ogImage) {
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${escAttr(ogImage)}"`
    );
  }
  if (jsonLd) {
    const ldScripts = jsonLd.map(ld =>
      `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
    ).join('\n    ');
    html = html.replace('</head>', `    ${ldScripts}\n  </head>`);
  }
  if (h1 && introText) {
    const noscript = `<noscript><h1>${escHtml(h1)}</h1><p>${escHtml(introText)}</p></noscript>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${noscript}</div>`);
  }
  return html;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function writePage(path, html) {
  const dir = `dist${path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}

// ====== Generate pages ======
const venues = parseVenues();
const regions = [...new Set(venues.map(v => v.region))];
let count = 0;

// Home
{
  let html = template;
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${BASE}/og/default.svg"`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${BASE}/og/default.svg"`
  );
  writeFileSync('dist/index.html', html);
  count++;
}

// /venues
{
  const title = `전국 나이트·클럽·라운지 ${venues.length}곳 — 지역별 필터 검색 | ${SITE_NAME}`;
  const desc = '강남부터 울산까지 현장 검증된 업소만 모았습니다. 분위기·실장·카테고리별로 골라보세요';
  writePage('/venues', generateHTML({
    title, description: desc,
    canonical: `${BASE}/venues`,
    h1: '전체 업소 목록',
    introText: desc,
  }));
  count++;
}

// Region pages
const regionMeta = {
  gangnam: { title: '강남 클럽·라운지·나이트 TOP 6 — 금요 밤 필수 코스', desc: '청담H2O나이트부터 아르쥬, 레이스, 사운드, 하입, 컬러까지 강남권 핵심 6곳 비교' },
  busan: { title: '부산연산동물나이트 — 따봉 실장 현장 검증', desc: '부산 연산동 대표 나이트클럽의 사운드·분위기·입장 안내를 상세히 정리' },
  gyeonggi: { title: '경기 나이트 TOP 5 — 성남·수원·파주·인덕원·일산', desc: '경기도 주요 나이트클럽 5곳 현장 검증 완료' },
  seoul: { title: '서울 나이트 TOP 3 — 수유·신림·상봉', desc: '서울 지역 나이트클럽 핵심 3곳 비교' },
  ulsan: { title: '울산챔피언나이트 — 춘자 실장 10년 직영', desc: '울산 대표 나이트클럽 현장 검증 리뷰' },
  incheon: { title: '인천아라비안나이트 — 이국적 콘셉트 검증', desc: '인천 남동구 아라비안 테마 나이트클럽 현장 리뷰' },
  daejeon: { title: '대전세븐나이트 — 충청권 대표 나이트', desc: '대전 서구 세븐나이트 현장 검증 리뷰' },
  itaewon: { title: '이태원클럽 와이키키유토피아 — 글로벌 파티', desc: '이태원 대표 글로벌 파티 클럽 현장 검증' },
};

for (const regionId of regions) {
  const meta = regionMeta[regionId] || { title: `${getRegionName(regionId)} 나이트·클럽`, desc: `${getRegionName(regionId)} 지역 정보` };
  const fullTitle = `${meta.title} | ${SITE_NAME}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
      { '@type': 'ListItem', position: 2, name: getRegionName(regionId), item: `${BASE}/${regionId}` },
    ],
  };

  writePage(`/${regionId}`, generateHTML({
    title: fullTitle,
    description: meta.desc,
    canonical: `${BASE}/${regionId}`,
    h1: `${getRegionName(regionId)} 나이트·클럽`,
    introText: meta.desc,
    jsonLd: [breadcrumb],
  }));
  count++;
}

// Category pages
const categoryPages = [
  { path: '/clubs', label: '클럽', key: 'club' },
  { path: '/nights', label: '나이트', key: 'night' },
  { path: '/lounges', label: '라운지', key: 'lounge' },
  { path: '/rooms', label: '룸', key: 'room' },
  { path: '/yojeong', label: '요정', key: 'yojeong' },
  { path: '/hoppa', label: '호빠', key: 'hoppa' },
];

for (const cp of categoryPages) {
  const catVenues = venues.filter(v => v.category === cp.key);
  const title = `${cp.label} ${catVenues.length}곳 — 전체보기 | ${SITE_NAME}`;
  const desc = `전국 ${cp.label} ${catVenues.length}곳 현장 검증 완료. 분위기·실장·입장 정보 한눈에.`;
  writePage(cp.path, generateHTML({
    title, description: desc,
    canonical: `${BASE}${cp.path}`,
    ogImage: `${BASE}/og/category-${cp.key}.svg`,
    h1: `${cp.label} 전체보기`,
    introText: desc,
  }));
  count++;
}

// Quiz + Safety pages
{
  writePage('/quiz', generateHTML({
    title: `밤문화 MBTI — 나에게 맞는 곳은 어디? | ${SITE_NAME}`,
    description: '10개 질문으로 알아보는 나의 밤문화 유형. 결과에 맞는 업소 추천까지.',
    canonical: `${BASE}/quiz`,
    h1: '밤문화 MBTI',
    introText: '10개 질문으로 알아보는 나의 밤문화 유형.',
  }));
  count++;
  writePage('/safety', generateHTML({
    title: `안전 가이드 — 음주 계산기·긴급 연락처 | ${SITE_NAME}`,
    description: '즐거운 밤을 위한 안전 가이드. 음주 계산기, 긴급 연락처, 대리운전 번호까지.',
    canonical: `${BASE}/safety`,
    h1: '안전 가이드',
    introText: '즐거운 밤도 안전이 먼저.',
  }));
  count++;
}

// Community pages
{
  writePage('/community', generateHTML({
    title: `커뮤니티 — 밤문화 후기·팁·파티모집 | ${SITE_NAME}`,
    description: '전국 밤문화 솔직 후기, 꿀팁, 파티 모집. 진짜 경험한 사람들의 이야기.',
    canonical: `${BASE}/community`,
    h1: '커뮤니티',
    introText: '밤문화 후기, 꿀팁, 파티 모집까지. 진짜 경험한 사람들의 이야기.',
  }));
  count++;
  writePage('/community/guidelines', generateHTML({
    title: `커뮤니티 가이드라인 — 건강한 밤문화 이야기 | ${SITE_NAME}`,
    description: '서로 존중하는 커뮤니티를 위한 가이드라인.',
    canonical: `${BASE}/community/guidelines`,
    h1: '커뮤니티 가이드라인',
    introText: '서로 존중하는 커뮤니티를 위한 가이드라인.',
  }));
  count++;
}

// Magazine, Ranking, Events, Map pages
{
  writePage('/magazine', generateHTML({
    title: `매거진 — 밤문화 가이드 & 비교 분석 | ${SITE_NAME}`,
    description: '강남 vs 홍대 비교, 나이트 초보 가이드, 룸과 요정 차이까지. 현장 기반 밤문화 매거진.',
    canonical: `${BASE}/magazine`,
    h1: '매거진',
    introText: '현장 경험을 바탕으로 정리한 밤문화 가이드. 비교, 분석, 초보 안내까지.',
  }));
  count++;
  writePage('/ranking', generateHTML({
    title: `인기 랭킹 TOP 20 — 전국 나이트·클럽·라운지 | ${SITE_NAME}`,
    description: '전국 나이트, 클럽, 라운지, 룸, 요정 인기 랭킹 TOP 20. 실장 연결 가능 업소 우선 표시.',
    canonical: `${BASE}/ranking`,
    h1: '인기 랭킹 TOP 20',
    introText: '실장 연결 가능 업소를 우선으로, 전국 인기 업소를 한눈에.',
  }));
  count++;
  writePage('/events', generateHTML({
    title: `이벤트 캘린더 — 전국 밤문화 일정 | ${SITE_NAME}`,
    description: '금요 나이트 피크타임, 토요 클럽 DJ 파티, 평일 이벤트까지. 전국 밤문화 일정을 한눈에.',
    canonical: `${BASE}/events`,
    h1: '이벤트 캘린더',
    introText: '전국 밤문화 주요 일정을 한눈에 확인하세요.',
  }));
  count++;
  writePage('/map', generateHTML({
    title: `지역별 업소 찾기 — 전국 나이트·클럽·라운지 | ${SITE_NAME}`,
    description: '지역을 선택하면 해당 지역의 나이트, 클럽, 라운지, 룸, 요정 업소를 한눈에 확인할 수 있습니다.',
    canonical: `${BASE}/map`,
    h1: '지역별 업소 찾기',
    introText: '지역을 선택하면 해당 지역의 업소를 확인할 수 있습니다.',
  }));
  count++;
}

// Venue detail pages
for (const v of venues) {
  const hook = getHook(v.id);
  const desc = getDesc(v.id);
  const title = `${v.keyword}${hook ? ' — ' + hook : ''} | ${SITE_NAME}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
      { '@type': 'ListItem', position: 2, name: getRegionName(v.region), item: `${BASE}/${v.region}` },
      { '@type': 'ListItem', position: 3, name: v.keyword, item: `${BASE}${v.path}` },
    ],
  };

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'NightClub',
    name: v.keyword,
    url: `${BASE}${v.path}`,
    image: `${BASE}/og/${v.id}.svg`,
  };
  if (v.phone && v.phone !== '별도문의') localBusiness.telephone = v.phone;

  writePage(v.path, generateHTML({
    title,
    description: desc,
    canonical: `${BASE}${v.path}`,
    ogImage: `${BASE}/og/${v.id}.svg`,
    h1: v.keyword,
    introText: desc,
    jsonLd: [breadcrumb, localBusiness],
  }));
  count++;
}

console.log(`Prerender complete: ${count} pages generated.`);
