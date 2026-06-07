/**
 * OG 이미지 생성 (1200×1200, 한글 = opentype.js text→path → 폰트 의존 0, 두부 0).
 * 실사진 아님(브랜드 카드). 실사진은 광고주 확보 시 교체.
 *
 * 폰트: scripts/fonts/Pretendard-{Bold,Regular}.otf (레포 포함)
 * 텍스트를 벡터 path로 변환해 SVG에 넣으므로 빌드머신 폰트 설치 불필요.
 *
 * 실행: node scripts/gen-og.mjs   (출력: public/og/<id>.jpg, category-*.jpg, default.jpg)
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import opentype from 'opentype.js';

const SIZE = 1200;
const ogDir = path.resolve('public/og');
fs.mkdirSync(ogDir, { recursive: true });

function loadFont(p) {
  const buf = fs.readFileSync(p);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const BOLD = loadFont('scripts/fonts/Pretendard-Bold.otf');
const REG = loadFont('scripts/fonts/Pretendard-Regular.otf');

// 중앙 정렬된 텍스트를 벡터 path로
function centeredPath(text, fontSize, baselineY, font, fill, opacity = 1) {
  const w = font.getAdvanceWidth(text, fontSize);
  let x = (SIZE - w) / 2;
  // 너무 길면 자간 축소 대신 폰트 축소(호출측에서 처리). 여기선 그대로.
  const p = font.getPath(text, x, baselineY, fontSize);
  return `<path d="${p.toPathData(2)}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}
// 폭이 넘치면 들어맞는 폰트 크기 계산
function fitFontSize(text, font, maxSize, maxWidth) {
  let s = maxSize;
  while (s > 20 && font.getAdvanceWidth(text, s) > maxWidth) s -= 2;
  return s;
}

const colorSchemes = {
  night: { bg1: '#1C1917', bg2: '#292524', a1: '#DB2777', a2: '#E8B4B8' },
  club: { bg1: '#0F172A', bg2: '#1E293B', a1: '#3B82F6', a2: '#60A5FA' },
  lounge: { bg1: '#1E1033', bg2: '#2D1B69', a1: '#D97706', a2: '#FCD34D' },
  room: { bg1: '#052E16', bg2: '#14532D', a1: '#10B981', a2: '#34D399' },
  yojeong: { bg1: '#450A0A', bg2: '#7F1D1D', a1: '#F59E0B', a2: '#FCD34D' },
  hoppa: { bg1: '#500724', bg2: '#831843', a1: '#F472B6', a2: '#FDA4AF' },
};
const catLabel = { night: '나이트', club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };

function cardSvg({ title, sub, area, brand, scheme }) {
  const c = colorSchemes[scheme] || colorSchemes.night;
  const titleSize = fitFontSize(title, BOLD, 100, SIZE - 160);
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`);
  parts.push(`<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c.bg1}"/><stop offset="100%" stop-color="${c.bg2}"/></linearGradient></defs>`);
  parts.push(`<rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>`);
  parts.push(`<rect x="0" y="0" width="${SIZE}" height="10" fill="${c.a1}"/>`);
  parts.push(`<rect x="0" y="${SIZE - 10}" width="${SIZE}" height="10" fill="${c.a2}"/>`);
  // 중앙 블록
  parts.push(centeredPath(title, titleSize, 560, BOLD, '#ffffff'));
  if (sub) parts.push(centeredPath(sub, 48, 680, BOLD, c.a1));
  if (area) parts.push(centeredPath(area, 38, 760, REG, '#94a3b8'));
  // 하단 브랜드
  parts.push(centeredPath('놀쿨 NOLCOOL', 44, 1010, BOLD, '#ffffff'));
  parts.push(centeredPath(brand || '여성이 편안한 밤문화 가이드', 30, 1075, REG, c.a2));
  parts.push('</svg>');
  return parts.join('');
}

async function writeJpg(svg, outPath, quality = 88) {
  await sharp(Buffer.from(svg)).jpeg({ quality }).toFile(outPath);
}

// ---- venues 파싱 ----
const content = fs.readFileSync(path.resolve('src/data/venues.ts'), 'utf-8');
const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*region:\s*'([^']+)',\s*area:\s*'([^']+)',[\s\S]*?keyword:\s*'([^']*)'[\s\S]*?category:\s*'([^']+)'/g;
const venues = [];
let m;
while ((m = re.exec(content)) !== null) {
  venues.push({ id: m[1], name: m[2], area: m[4], keyword: m[5] || m[2], category: m[6] });
}
console.log(`Found ${venues.length} venues`);

let ok = 0;
for (const v of venues) {
  const svg = cardSvg({ title: v.keyword, sub: catLabel[v.category] || '나이트', area: v.area, scheme: v.category });
  await writeJpg(svg, path.join(ogDir, `${v.id}.jpg`));
  ok++;
}

// 카테고리 카드
for (const [key, label] of Object.entries(catLabel)) {
  const svg = cardSvg({ title: `전국 ${label}`, sub: '현장 검증', area: '', brand: '실패 없는 한 곳을 고르세요', scheme: key });
  await writeJpg(svg, path.join(ogDir, `category-${key}.jpg`));
  ok++;
}

// 홈 default
{
  const svg = cardSvg({ title: '놀쿨 NOLCOOL', sub: '전국 밤문화 가이드', area: `나이트·클럽·라운지·룸·요정·호빠 TOP ${venues.length}`, brand: '여성이 편안한 밤문화 가이드', scheme: 'night' });
  await writeJpg(svg, path.join(ogDir, 'default.jpg'), 92);
  ok++;
}

console.log(`OG done: ${ok} images (1200×1200, 한글 path 렌더).`);
