// 결정적 콘텐츠 정리 파이프라인 (CI 자동수정에서도 재사용)
// venueContent.ts의 백틱 필드(intro/body/conclusion)를 업소 단위로 정리한다:
//  1) "OO의 경우," 패딩 접두사 제거
//  2) 깨진 조사 마커 "이(가)/을(를)/은(는)/과(와)/으로(로)" → 받침 기준 자동 해소(영문명 포함)
//  3) 끊긴 따옴표/대소문자/공백 아티팩트 정리
//  4) 교차페이지 공통 템플릿(보일러플레이트) 문장 제거
//  5) 대표키워드 문장-접두사 패딩 제거(앞쪽 2회만 유지)
//  6) 정확 중복 문장 제거(첫 등장만 유지)
import fs from 'fs';

const CONTENT = 'src/data/venueContent.ts';
const VENUES = 'src/data/venues.ts';

const CAT_LABEL = { room: '룸', yojeong: '요정', hoppa: '호빠', club: '클럽', lounge: '라운지', night: '나이트' };

const BOILERPLATE = [
  /인근은 접근성이 좋아 첫 방문이라도 어렵지 않다/,
  /운영이며 시간대에 따라 분위기의 밀도가 다르다/,
  /운영이지만 체감하는 분위기의 농도는 시간에 따라 완전히 다르다/,
  /·.*핵심이다/,
  /도착하면 그 기대가 현실이 된다/,
  /향하는 길에 기대감이 올라간다/,
  /만나는 지점에 이 공간이 있다/,
  /이런 조합은 .*흔치 않다/,
  /카드에 적힌 이 문구가 핵심 요약이다/,
  /왜 나오는지는 현장에 가면 안다/,
  /설명이 과장이 아니라는 건 방문 후 확인된다/,
  /라는 설명이 과장이 아닌 곳이다/,
  /첫 번째 경쟁력이고.*두 번째다/,
  /외출의 기준점이 되는 이유/,
  /가능한 이유가 있다/,
  /이 한 줄이 핵심이다/,
  /이 세 태그가 핵심이다/,
  // 2차: 여러 업소 공통 운영안내 템플릿(교차페이지 중복콘텐츠)
  /전화로 인원과 도착 시간을 알려주면/,
  /현장 스태프가 안내를 돕기 때문에/,
  /피크 타임은 개장 후 약 두 시간 뒤/,
  /직후가 한산해서 공간 파악에 좋다/,
  /시간대별 분위기 변화를 전부 경험/,
  /보면 분위기가 바뀌는 지점이 있다/,
  /이곳에서 확인할 수 있다/,
  /이곳을 선택할 때 이 점을 기억하자/,
  /이곳 경험자들이 입을 모으는 부분이다/,
  /검색하면 후기가 꽤 나온다/,
  /택시 기사에게 말하면 대부분 아는 곳/,
  /심야 교통편은 양호해서 귀가 걱정/,
  /주변 편의점과 ATM은 가까워서/,
  /주차장을 미리 확인하고 가면 시간을 아낄 수 있다/,
  /택시비는 부담 없는 수준이다/,
  /요일에 따라 분위기가 꽤 다르다/,
  /전화하면 현재 운영 상황을 바로 확인할 수 있다/,
  /전화하면.*방문 안내를 받을 수 있다/,
  /재방문율이 높은 곳으로 알려져 있다/,
  /근처 식당에서 1차를 마치고 넘어오는/,
  /한 번으로 전부 파악하기 어려운 곳이라는 평/,
  /추천해달라고 하면 한번쯤 가봐야 한다는 답/,
  /한 번은 가볼 만한 곳이다/,
];

function jong(ch) {
  const c = ch.charCodeAt(0);
  if (c < 0xAC00 || c > 0xD7A3) return null;
  return (c - 0xAC00) % 28;
}
// 받침 있으면 true. 한글이 아니면(영문/괄호) 모음종결로 간주(false).
function hasJong(ch) {
  const j = jong(ch);
  if (j === null) return false;
  return j !== 0;
}
function resolveParticles(text) {
  const rules = [
    [/([가-힣A-Za-z)])이\(가\)/g, (m, w) => w + (hasJong(w) ? '이' : '가')],
    [/([가-힣A-Za-z)])을\(를\)/g, (m, w) => w + (hasJong(w) ? '을' : '를')],
    [/([가-힣A-Za-z)])은\(는\)/g, (m, w) => w + (hasJong(w) ? '은' : '는')],
    [/([가-힣A-Za-z)])과\(와\)/g, (m, w) => w + (hasJong(w) ? '과' : '와')],
    [/([가-힣A-Za-z)])와\(과\)/g, (m, w) => w + (hasJong(w) ? '과' : '와')],
    [/([가-힣A-Za-z)])으로\(로\)/g, (m, w) => w + (jong(w) === 0 || jong(w) === 8 || jong(w) === null ? '로' : '으로')],
    [/([가-힣A-Za-z)])로\(으로\)/g, (m, w) => w + (jong(w) === 0 || jong(w) === 8 || jong(w) === null ? '로' : '으로')],
  ];
  for (const [re, fn] of rules) text = text.replace(re, fn);
  return text;
}
function tidy(text) {
  return text
    .replace(/\bpM\b/g, 'PM').replace(/\baM\b/g, 'AM')
    .replace(/[""""]/g, '')           // 끊긴 따옴표 제거
    .replace(/([.!?])\1+/g, '$1')
    .replace(/ {2,}/g, ' ')
    .replace(/ +([.!?,])/g, '$1')
    .replace(/^[\s,.!?]+/, '')
    .trim();
}
const isBoilerplate = (s) => BOILERPLATE.some((re) => re.test(s));

// 업소 1곳의 모든 필드에서 공유하는 상태(seen 문장, 키워드 접두사 예산)
function makeState() { return { seen: new Set(), kwPrefix: 0 }; }
const KW_PREFIX_BUDGET = 2;

export function cleanField(text, keyword, state) {
  let t = text.replace(/[^\s.!?,"]+의 경우,\s*/g, '');
  t = resolveParticles(t);
  t = tidy(t);

  const kwRe = keyword ? new RegExp('^' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+') : null;
  const paragraphs = t.split(/\n\n+/);
  const outParas = [];
  for (const para of paragraphs) {
    const sentences = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const kept = [];
    for (let raw of sentences) {
      let norm = raw.trim().replace(/\s+/g, ' ');
      if (!norm) continue;
      // 키워드 문장-접두사 패딩: 예산 초과 시 제거(반복 접두사도 모두)
      if (kwRe) {
        while (kwRe.test(norm)) {
          if (state.kwPrefix < KW_PREFIX_BUDGET) { state.kwPrefix++; break; }
          norm = norm.replace(kwRe, '').trim();
        }
      }
      norm = norm.replace(/^[\s,.!?]+/, '').trim();
      if (isBoilerplate(norm)) continue;
      // 의미 없는 짧은 파편 제거(한글 2자 미만)
      if ((norm.match(/[가-힣]/g) || []).length < 2) continue;
      const key = norm.replace(/([.!?])\1+/g, '$1');
      if (state.seen.has(key)) continue;
      state.seen.add(key);
      kept.push(key);
    }
    if (kept.length) outParas.push(kept.join(' '));
  }
  return outParas.join('\n\n');
}

function buildKeywordMap() {
  const src = fs.readFileSync(VENUES, 'utf-8');
  const map = {};
  const re = /\{\s*id:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']*)'[\s\S]*?category:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, id, seoArea, cat] = m;
    map[id] = { keyword: seoArea + (CAT_LABEL[cat] || ''), seoArea };
  }
  return map;
}

// 카테고리 라벨 조사 오류(모음종결 라벨 + 이 → 가)
function fixLabelParticles(text) {
  return text
    .replace(/호빠이( |$)/g, '호빠가$1')
    .replace(/라운지이( |$)/g, '라운지가$1')
    .replace(/나이트이( |$)/g, '나이트가$1');
}

function run() {
  const kwMap = buildKeywordMap();
  let src = fs.readFileSync(CONTENT, 'utf-8');
  // 업소 블록 단위 처리
  const keyRe = /'([a-z0-9-]+)':\s*\{/g;
  const blocks = [];
  let m;
  while ((m = keyRe.exec(src)) !== null) { if (m.index > 100) blocks.push({ id: m[1], start: m.index }); }
  let beforeLen = 0, afterLen = 0, changed = 0;
  let out = '';
  let cursor = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const end = i < blocks.length - 1 ? blocks[i + 1].start : src.length;
    out += src.slice(cursor, b.start);
    let block = src.slice(b.start, end);
    const info = kwMap[b.id] || {};
    const keyword = info.keyword;
    const seoArea = info.seoArea;
    const seoAreaFix = seoArea && hasJong(seoArea[seoArea.length - 1]);
    const state = makeState();
    block = block.replace(/`([^`]*)`/g, (mm, inner) => {
      beforeLen += inner.length;
      let cleaned = cleanField(inner, keyword, state);
      cleaned = fixLabelParticles(cleaned);
      if (seoAreaFix) cleaned = cleaned.replaceAll(`${seoArea}가 `, `${seoArea}이 `);
      afterLen += cleaned.length;
      if (cleaned !== inner) changed++;
      return '`' + cleaned + '`';
    });
    out += block;
    cursor = end;
  }
  out += src.slice(cursor);
  fs.writeFileSync(CONTENT, out, 'utf-8');
  console.log(`업소 ${blocks.length}곳 / 백틱 필드 ${changed}개 정리`);
  console.log(`본문 총길이 ${beforeLen.toLocaleString()} → ${afterLen.toLocaleString()} chars`);
}

if (import.meta.url === `file://${process.argv[1]}`) run();
