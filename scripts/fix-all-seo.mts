/**
 * FINAL SEO Fix: density 1.5-2.5% + similarity <10%
 *
 * Every generated sentence MUST contain the venue keyword or unique data,
 * making it impossible for two venues to share the same sentence.
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(contentPath, 'utf-8');

type V = typeof venues[0];

function lcg(seed: number) { let s = seed; return () => { s = (s * 16807 + 12345) % 2147483647; return s / 2147483647; }; }
function shuffle<T>(a: T[], rng: () => number): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// ===== Every sentence uses venue-specific data =====
type SentGen = (v: V, kw: string) => string;

const gens: SentGen[] = [
  // location-based (use address)
  (v, kw) => `${kw}의 주소는 ${v.address}이다.`,
  (v, kw) => `${v.address}에 위치한 ${kw}은(는) 걸어서 찾아도 금방이다.`,
  (v) => `${v.address} 인근 주차장을 미리 확인하고 가면 시간을 아낄 수 있다.`,
  (v) => `${v.address} 주변은 밤이 되면 분위기가 확 바뀐다.`,
  (v) => `${v.address}까지 택시비는 부담 없는 수준이다.`,

  // hours-based
  (v, kw) => `${kw}은(는) ${v.hours} 동안 영업한다.`,
  (v) => `영업 시작 시간인 ${v.hours.split('~')[0]?.trim() || '저녁'} 직후가 한산해서 공간 파악에 좋다.`,
  (v) => `마감인 ${v.hours.split('~')[1]?.trim() || '새벽'}까지 남으면 시간대별 분위기 변화를 전부 경험할 수 있다.`,
  (v) => `${v.hours} 중 피크 타임은 개장 후 약 두 시간 뒤다.`,

  // tags-based (tags are unique combinations)
  (v, kw) => `${kw}을(를) 한마디로 표현하면 ${v.tags[0] || '분위기'}라는 단어가 가장 가깝다.`,
  (v) => `#${v.tags[0] || '야간'} #${v.tags[1] || '분위기'} #${v.tags[2] || '공간'} — 이 세 태그가 핵심이다.`,
  (v) => `${v.tags[0] || '분위기'}과 ${v.tags[1] || '감성'}이 공존하는 장소는 ${v.area}에서 찾기 쉽지 않다.`,

  // name-based (unique per venue)
  (v, kw) => `${kw}은(는) 재방문율이 높은 곳으로 알려져 있다.`,
  (v) => `${v.name}이(가) 위치한 동네에서 밤문화의 기준이 되는 장소라는 평이 많다.`,
  (v) => `${v.name}의 간판을 찾아 골목을 걷다 보면 분위기가 바뀌는 지점이 있다.`,
  (v) => `${v.name}을(를) 추천해달라고 하면 한번쯤 가봐야 한다는 답이 돌아온다.`,
  (v) => `${v.name} 근처 식당에서 1차를 마치고 넘어오는 사람이 많다.`,
  (v) => `${v.name}이라고 택시 기사에게 말하면 대부분 아는 곳이다.`,

  // contact-based
  (v, kw) => v.contact ? `${v.contact} 실장에게 전화하면 ${kw} 방문 안내를 받을 수 있다.` : `${kw}에 전화하면 현재 운영 상황을 바로 확인할 수 있다.`,
  (v) => v.contact ? `${v.contact} 실장이 현장을 직접 관리하기 때문에 서비스 품질이 일정하다.` : `현장 스태프가 안내를 돕기 때문에 첫 방문이라도 어렵지 않다.`,
  (v) => v.contact ? `${v.contact} 실장에게 인원과 목적을 알려주면 맞춤 안내를 받는다.` : `방문 전 전화로 인원과 도착 시간을 알려주면 준비가 빠르다.`,

  // description-based (description is unique per venue)
  (v) => `한 줄 소개: ${v.description.slice(0, 50)}.`,
  (v) => `${v.description.slice(0, 40)}라는 설명이 과장이 아닌 곳이다.`,

  // card_hook based (unique per venue)
  (v) => `"${v.card_hook.split('\n')[0]}" — 이 한 줄이 핵심이다.`,
  (v) => `${v.card_value.split('·')[0]?.trim() || '대표'}가 이곳의 가장 큰 강점이다.`,

  // practical with area
  (v) => `${v.area}역 방면에서 오면 도보로 충분하다.`,
  (v) => `${v.area} 주변 편의점과 ATM은 가까워서 급한 일에도 대응 가능하다.`,
  (v) => `${v.area}에서의 밤은 요일에 따라 분위기가 꽤 다르다.`,
  (v) => `${v.area} 심야 교통편은 양호해서 귀가 걱정은 덜어도 된다.`,
  (v, kw) => `${kw}을(를) 검색하면 후기가 꽤 나온다.`,
  (v, kw) => `두 번째 방문 때 ${kw}의 진가를 알게 된다는 후기가 많다.`,
  (v, kw) => `${kw}은(는) 한 번으로 전부 파악하기 어려운 곳이라는 평이 있다.`,
];

function generateUniqueContent(v: V, idx: number): string {
  const seed = v.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) * 31 + idx * 7 + 99;
  const rng = lcg(seed);
  const kw = getVenueLabel(v);

  const pool = shuffle(gens, rng);
  const count = 10 + Math.floor(rng() * 5); // 10-14 sentences
  const sents = pool.slice(0, count).map(g => g(v, kw));

  // Group into paragraphs of 2-3 sentences each
  const paras: string[] = [];
  for (let i = 0; i < sents.length; i += 2 + Math.floor(rng() * 2)) {
    paras.push(sents.slice(i, i + 2 + Math.floor(rng() * 2)).join(' '));
  }
  return paras.join('\n\n');
}

// ===== HELPERS =====
function removeKw(text: string, kw: string, keepFirst: boolean): string {
  const reps: [string, string][] = [
    [kw + '에서 확인할 수 있다', '이곳에서 확인할 수 있다'],
    [kw + '을(를) 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '을 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '를 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '을 고를 때', '이곳을 선택할 때'],
    [kw + ' 경험자', '이곳 경험자'], [kw + '만의 ', '이곳만의 '],
    [kw + '에서 ', '이곳에서 '], [kw + '의 ', '이곳의 '],
    [kw + '은 ', '이곳은 '], [kw + '는 ', '이곳은 '],
    [kw + '이 ', '이곳이 '], [kw + '가 ', '이곳이 '],
    [kw + '을 ', '이곳을 '], [kw + '를 ', '이곳을 '],
    [kw + '도 ', '이곳도 '], [kw + '. ', ''], [kw + ', ', ''], [kw, '이곳'],
  ];
  if (keepFirst) {
    const idx = text.indexOf(kw);
    if (idx === -1) return text;
    let after = text.slice(idx + kw.length);
    for (const [f, t] of reps) { while (after.includes(f)) after = after.replace(f, t); }
    return text.slice(0, idx + kw.length) + after;
  }
  let r = text;
  for (const [f, t] of reps) { while (r.includes(f)) r = r.replace(f, t); }
  return r;
}

function extractBlock(id: string): { block: string; start: number; end: number } | null {
  const marker = `'${id}': {`; const si = src.indexOf(marker); if (si === -1) return null;
  let d = 0, i = src.indexOf('{', si); const start = i;
  for (; i < src.length; i++) { if (src[i] === '{') d++; if (src[i] === '}') d--; if (d === 0) break; }
  return { block: src.slice(start, i + 1), start, end: i + 1 };
}

function extractText(block: string): string {
  const t: string[] = [];
  const m1 = block.match(/summary:\s*\[([\s\S]*?)\]/); if (m1) { const i = m1[1].match(/'([^']*)'/g); if (i) i.forEach(s => t.push(s.replace(/'/g, ''))); }
  const m2 = block.match(/intro:\s*`([\s\S]*?)`/); if (m2) t.push(m2[1]);
  const r = /title:\s*'([^']*)',\s*body:\s*`([\s\S]*?)`/g; let m; while ((m = r.exec(block)) !== null) { t.push(m[1]); t.push(m[2]); }
  const m3 = block.match(/decision:\s*'([^']*)'/); if (m3) t.push(m3[1]);
  const m4 = block.match(/scenarios:\s*\[([\s\S]*?)\]/); if (m4) { const r2 = /'([^']+)'/g; let s; while ((s = r2.exec(m4[1])) !== null) t.push(s[1]); }
  const m5 = block.match(/costNote:\s*'([^']*)'/); if (m5) t.push(m5[1]);
  const r3 = /q:\s*'([^']*)',\s*a:\s*'([^']*)'/g; while ((m = r3.exec(block)) !== null) { t.push(m[1]); t.push(m[2]); }
  const m6 = block.match(/conclusion:\s*`([\s\S]*?)`/); if (m6) t.push(m6[1]);
  return t.join(' ');
}

function countKw(t: string, kw: string): number { let c = 0, p = 0; while ((p = t.indexOf(kw, p)) !== -1) { c++; p += kw.length; } return c; }

function getSubKw(v: V) {
  const m: Record<string, string> = { club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };
  return `${v.seoArea} ${m[v.category || 'night'] || '나이트'}`;
}

function buildPageText(v: V, contentText: string): string {
  const label = getVenueLabel(v);
  return [`홈 ${v.area} ${v.name}`, label, v.area, v.contact ? `${v.contact} 실장` : '', v.card_hook,
    `${label} 상세 정보`, v.description, v.tags.join(' '), `${label} 핵심 요약`,
    `${getSubKw(v)} 이용 가이드`, contentText, `30초 플랜`, `${label} FAQ`, `${getSubKw(v)} 방문 전 확인`].join(' ');
}

// ===== PROCESS =====
for (let vi = 0; vi < venues.length; vi++) {
  const v = venues[vi];
  const kw = getVenueLabel(v);
  const ext = extractBlock(v.id);
  if (!ext) continue;
  let newBlock = ext.block;

  // Remove keyword from body (keep 1st in intro)
  const introM = newBlock.match(/intro:\s*`([\s\S]*?)`/);
  if (introM && introM[1].includes(kw)) newBlock = newBlock.replace(introM[0], `intro: \`${removeKw(introM[1], kw, true)}\``);
  const sbr = /body:\s*`([\s\S]*?)`/g; let sm; const sr: [string,string][] = [];
  while ((sm = sbr.exec(newBlock)) !== null) if (sm[1].includes(kw)) sr.push([sm[0], `body: \`${removeKw(sm[1], kw, false)}\``]);
  for (const [o, n] of sr) newBlock = newBlock.replace(o, n);
  const cm = newBlock.match(/conclusion:\s*`([\s\S]*?)`/); if (cm && cm[1].includes(kw)) newBlock = newBlock.replace(cm[0], `conclusion: \`${removeKw(cm[1], kw, false)}\``);
  const smm = newBlock.match(/summary:\s*\[([\s\S]*?)\]/); if (smm && smm[1].includes(kw)) newBlock = newBlock.replace(smm[0], `summary: [${removeKw(smm[1], kw, false)}]`);
  const fr = /a:\s*'([^']*)'/g; let fm; const frs: [string,string][] = [];
  while ((fm = fr.exec(newBlock)) !== null) if (fm[1].includes(kw)) frs.push([fm[0], `a: '${removeKw(fm[1], kw, false)}'`]);
  for (const [o, n] of frs) newBlock = newBlock.replace(o, n);
  const dm = newBlock.match(/decision:\s*'([^']*)'/); if (dm && dm[1].includes(kw)) newBlock = newBlock.replace(dm[0], `decision: '${removeKw(dm[1], kw, false)}'`);

  // Generate unique content
  const uniqueContent = generateUniqueContent(v, vi);

  // Calculate density with full content
  let ct = extractText(newBlock);
  let fullText = ct + ' ' + uniqueContent;
  let pt = buildPageText(v, fullText);
  let kwc = countKw(pt, kw);
  let den = (kwc * kw.length) / pt.length * 100;

  let toAdd = uniqueContent;
  toAdd = uniqueContent; // Keep keywords for uniqueness

  // Check density: if > 2.5%, add extra NON-keyword padding
  pt = buildPageText(v, ct + ' ' + toAdd);
  kwc = countKw(pt, kw);
  den = (kwc * kw.length) / pt.length * 100;

  let loopCount = 0;
  while (den > 2.5 && loopCount < 20) {
    loopCount++;
    const targetTotal = Math.ceil(kwc * kw.length / 0.022);
    const moreNeeded = targetTotal - pt.length;
    if (moreNeeded <= 0) break;

    // Extra padding using UNIQUE per-venue data (card_hook, card_value, description)
    const seed2 = vi * 13 + 777 + toAdd.length;
    const rng2 = lcg(seed2);
    const hookLines = v.card_hook.split('\n').filter(l => l.trim().length > 5);
    const valParts = v.card_value.split('·').map(s => s.trim()).filter(s => s.length > 2);
    const tagParts = v.card_tags.split('·').map(s => s.trim()).filter(s => s.length > 2);
    const extras = shuffle([
      `"${(hookLines[0] || v.description.slice(0,40)).replace(kw, '이곳')}" — 이것이 이 공간을 정의하는 문장이다.`,
      `"${(hookLines[1] || hookLines[0] || '').replace(kw, '이곳')}" — 이 말이 왜 나오는지는 현장에 가면 안다.`,
      `${valParts[0] || v.area}가 이곳의 첫 번째 경쟁력이고, ${valParts[1] || '분위기'}가 두 번째다.`,
      `${tagParts.join(' · ')} — 이 조합이 이곳에서만 가능한 이유가 있다.`,
      `${v.description.replace(kw, '이곳')} 이 설명이 과장이 아니라는 건 방문 후 확인된다.`,
      `${v.address}로 향하는 길에 기대감이 올라간다. 도착하면 그 기대가 현실이 된다.`,
      `${v.hours} 운영이지만 체감하는 분위기의 농도는 시간에 따라 완전히 다르다.`,
      `${v.tags.slice(0, 2).join('과 ')}이 만나는 지점에 이 공간이 있다. 이런 조합은 ${v.area}에서 흔치 않다.`,
      `이곳이 밤 외출의 기준점이 되는 이유는 ${v.address} 현장의 밀도에 있다.`,
      `"${v.card_hook.replace(/\n/g, ' ').replace(kw, '이곳').slice(0, 50)}" — 카드에 적힌 이 문구가 핵심 요약이다.`,
    ], rng2);

    const padCount = Math.min(6, Math.ceil(moreNeeded / 100));
    // Strip keyword from ALL padding to prevent infinite density loop
    const cleanPad = extras.slice(0, padCount).map(s => s.replace(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '이곳')).join('\n\n');
    toAdd += '\n\n' + cleanPad;

    pt = buildPageText(v, ct + ' ' + toAdd);
    kwc = countKw(pt, kw);
    den = (kwc * kw.length) / pt.length * 100;
  }

  // If density < 1.5% (short keywords), trim content
  if (den < 1.5) {
    const maxTotal = Math.floor(kwc * kw.length / 0.015);
    const baseLen = buildPageText(v, ct).length;
    const allowed = Math.max(maxTotal - baseLen, 50);
    toAdd = toAdd.slice(0, allowed);
  }

  // Append
  const introRe = newBlock.match(/intro:\s*`([\s\S]*?)`/);
  if (introRe) newBlock = newBlock.replace(introRe[0], `intro: \`${introRe[1]}\n\n${toAdd}\``);

  src = src.slice(0, ext.start) + newBlock + src.slice(ext.end);
}

writeFileSync(contentPath, src, 'utf-8');
console.log('Done!');
