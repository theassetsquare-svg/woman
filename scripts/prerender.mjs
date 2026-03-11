/**
 * Post-build prerender script.
 * Generates route-specific HTML files so crawlers (especially Naver)
 * see correct meta tags and content without JS rendering.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://woman-5nj.pages.dev';
const template = readFileSync('dist/index.html', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');
const contentSrc = readFileSync('src/data/venueContent.ts', 'utf8');

// ====== Parse venue data ======
function parseVenues() {
  const results = [];
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']*)',\s*region:\s*'([^']+)',\s*area:\s*'([^']*)',\s*seoArea:\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(venuesSrc)) !== null) {
    const id = m[1], name = m[2], region = m[3], area = m[4], seoArea = m[5];
    // Check if it has keyword (night/club/lounge)
    const idx = venuesSrc.indexOf(`id: '${id}'`);
    const chunk = venuesSrc.slice(idx, idx + 800);
    const kwMatch = chunk.match(/keyword:\s*'([^']*)'/);
    const catMatch = chunk.match(/category:\s*'([^']*)'/);
    const phoneMatch = chunk.match(/phone:\s*'([^']*)'/);

    const keyword = kwMatch ? kwMatch[1] : (seoArea + '호빠' + (name ? ' ' + name : ''));
    const category = catMatch ? catMatch[1] : null;
    const phone = phoneMatch ? phoneMatch[1] : '';

    const prefix = region + '-';
    const slug = id.startsWith(prefix) ? id.slice(prefix.length) : id;
    const path = `/${region}/${slug}`;

    results.push({ id, name, region, area, seoArea, keyword, category, phone, path });
  }
  return results;
}

function getHook(venueId) {
  const m = venuesSrc.match(new RegExp(`'${venueId}':\\s*'([^']*)'`, 'g'));
  if (!m) return '';
  // Find in seoHooks section
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

function getIntro(venueId) {
  const blockStart = contentSrc.indexOf(`'${venueId}'`);
  if (blockStart === -1) return '';
  const chunk = contentSrc.slice(blockStart, blockStart + 2000);
  const im = chunk.match(/intro:\s*`([^`]*)`/);
  return im ? im[1].replace(/\n/g, ' ').slice(0, 200) : '';
}

function getRegionName(regionId) {
  const rm = venuesSrc.match(new RegExp(`id:\\s*'${regionId}',\\s*name:\\s*'([^']*)'`));
  return rm ? rm[1] : regionId;
}

// ====== HTML generator ======
function generateHTML(opts) {
  const { title, description, canonical, ogImage, h1, introText, jsonLd } = opts;

  let html = template;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escAttr(description)}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${escAttr(canonical)}"`
  );

  // Replace OG tags
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

  // Replace Twitter tags
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
    html = html.replace(
      /<meta name="twitter:card" content="[^"]*"/,
      `<meta name="twitter:card" content="summary_large_image"`
    );
  }

  // Add route-specific JSON-LD before </head>
  if (jsonLd) {
    const ldScripts = jsonLd.map(ld =>
      `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
    ).join('\n    ');
    html = html.replace('</head>', `    ${ldScripts}\n  </head>`);
  }

  // Add noscript content inside #root
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

// --- Home page (update dist/index.html with og:image) ---
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

// --- /venues ---
{
  const title = '전국 호빠 25곳 한방에 비교 — 지역별 필터 검색 | 호빠 디렉토리';
  const desc = '강남부터 창원까지 영업 확인된 업소만 모았습니다. 분위기·선수·시스템 조건으로 내게 맞는 곳을 골라보세요';
  writePage('/venues', generateHTML({
    title, description: desc,
    canonical: `${BASE}/venues`,
    h1: '전체 호빠 목록',
    introText: desc,
  }));
  count++;
}

// --- /night ---
{
  const title = '전국 나이트·클럽·라운지 — 지역별 총정리 | 호빠 디렉토리';
  const desc = '부산·강남·수원·대전·인천·울산 나이트클럽, 클럽, 라운지 정보를 한눈에 비교하세요';
  writePage('/night', generateHTML({
    title, description: desc,
    canonical: `${BASE}/night`,
    h1: '전국 나이트·클럽·라운지',
    introText: desc,
  }));
  count++;
}

// --- Region pages ---
// Region hook data (extracted from RegionPage.tsx regionHook)
const regionMeta = {
  gangnam: { title: '강남호빠 TOP 4 — 실패 없는 선택법 공개', desc: '역삼·테헤란로에서 검증된 4곳을 선수 수준·초이스 방식·영업시간까지 낱낱이 비교합니다' },
  geondae: { title: '건대호빠 TOP 1 — 10년 생존 비결', desc: '건대입구역 3분 거리, 동서울 유일 장수 가게의 모든 것을 공개합니다' },
  jangan: { title: '장안동호빠 TOP 3 — 100명 출근 무한초이스', desc: '장안동·장한평·답십리 3곳을 선수 인원·초이스 방식·분위기까지 비교합니다' },
  busan: { title: '부산호빠 TOP 10 — 해운대부터 하단까지 총정리', desc: '해운대·광안리·연산동·수영구 10곳을 전수 조사했습니다' },
  gyeonggi: { title: '수원호빠 TOP 4 — 인계동 서울급 반전 매력', desc: '인계동 유흥가에서 검증된 4곳을 시설·영업시간·시스템까지 비교합니다' },
  daejeon: { title: '대전호빠 TOP 2 — 둔산동·봉명동 완전 정복', desc: '충청권에서 검증된 2곳을 선수진·분위기·접근성까지 비교합니다' },
  gwangju: { title: '광주호빠 TOP 1 — 호남 유일 검증 선택지', desc: '상무지구에서 검증된 단 한 곳, 모든 정보를 공개합니다' },
  changwon: { title: '창원호빠 TOP 1 — 경남 대표 TC 시스템', desc: '상남동에서 1인 전담 TC 시스템으로 운영하는 곳의 모든 것을 공개합니다' },
  seoul: { title: '서울 나이트 — 수유·신림·상봉 총정리', desc: '서울 지역 나이트클럽 정보를 한눈에 비교하세요' },
  itaewon: { title: '이태원 클럽 — 글로벌 파티 명소', desc: '이태원 클럽 정보를 확인하세요' },
  incheon: { title: '인천 나이트 — 아라비안나이트 총정리', desc: '인천 지역 나이트클럽 정보를 한눈에 비교하세요' },
  ulsan: { title: '울산 나이트 — 챔피언나이트 총정리', desc: '울산 지역 나이트클럽 정보를 한눈에 비교하세요' },
};

for (const regionId of regions) {
  const meta = regionMeta[regionId] || { title: `${getRegionName(regionId)} 호빠`, desc: `${getRegionName(regionId)} 지역 정보` };
  const fullTitle = `${meta.title} | 호빠 디렉토리`;

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
    h1: `${getRegionName(regionId)} 호빠`,
    introText: meta.desc,
    jsonLd: [breadcrumb],
  }));
  count++;
}

// --- Venue detail pages ---
for (const v of venues) {
  const hook = getHook(v.id);
  const desc = getDesc(v.id);
  const intro = getIntro(v.id);
  const title = `${v.keyword}${hook ? ' — ' + hook : ''} | 호빠 디렉토리`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
      { '@type': 'ListItem', position: 2, name: getRegionName(v.region), item: `${BASE}/${v.region}` },
      { '@type': 'ListItem', position: 3, name: v.name || v.keyword, item: `${BASE}${v.path}` },
    ],
  };

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': v.category ? 'NightClub' : 'LocalBusiness',
    name: v.keyword,
    url: `${BASE}${v.path}`,
    image: `${BASE}/og/${v.id}.svg`,
  };
  if (v.phone) localBusiness.telephone = v.phone;

  writePage(v.path, generateHTML({
    title,
    description: desc || intro,
    canonical: `${BASE}${v.path}`,
    ogImage: `${BASE}/og/${v.id}.svg`,
    h1: v.keyword,
    introText: intro || desc,
    jsonLd: [breadcrumb, localBusiness],
  }));
  count++;
}

console.log(`Prerender complete: ${count} pages generated.`);
