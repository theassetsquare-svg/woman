#!/usr/bin/env node
/**
 * lint:similarity
 * 페이지별 텍스트를 n-gram(trigram) 기반으로 벡터화하고,
 * Jaccard 유사도를 계산합니다.
 * 0.05(5%) 초과 쌍이 있으면 FAIL.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const THRESHOLD = 0.05;

// ── 불용어 ──
const STOPWORDS = new Set([
  '은', '는', '이', '가', '을', '를', '에', '의', '와', '과',
  '도', '로', '으로', '에서', '까지', '부터', '만', '에게',
  '그리고', '하지만', '그러나', '또는', '그래서', '그런데',
  '또', '더', '매우', '아주', '정말', '너무', '잘', '못', '안',
  '있습니다', '합니다', '됩니다', '입니다', '있는', '하는', '되는',
  '없는', '있다', '하다', '되다', '없다',
  '및', '등', '위', '후', '전', '내',
]);

function cleanText(text) {
  return text
    .replace(/[^\uAC00-\uD7A3\u3131-\u3163a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOPWORDS.has(t))
    .join(' ');
}

// n-gram 추출
function getNgrams(text, n = 3) {
  const cleaned = cleanText(text);
  const words = cleaned.split(/\s+/);
  const ngrams = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

// Jaccard 유사도
function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// 겹치는 n-gram 추출
function getOverlapping(setA, setB, limit = 5) {
  const overlapping = [];
  for (const item of setA) {
    if (setB.has(item)) {
      overlapping.push(item);
      if (overlapping.length >= limit) break;
    }
  }
  return overlapping;
}

// ── venueContent.ts 파싱 (lint-repeat-words와 동일 로직) ───────
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
    const strings = [];
    const strRegex = /[`'"]([^`'"]{10,})[`'"]/g;
    let sm;
    while ((sm = strRegex.exec(block)) !== null) {
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
  const ids = Object.keys(pages);
  let hasFailure = false;

  console.log('=== lint:similarity ===\n');

  // 각 페이지의 n-gram 세트 미리 계산
  const ngramSets = {};
  for (const id of ids) {
    ngramSets[id] = getNgrams(pages[id]);
  }

  const violations = [];

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const sim = jaccard(ngramSets[ids[i]], ngramSets[ids[j]]);
      if (sim > THRESHOLD) {
        const overlapping = getOverlapping(ngramSets[ids[i]], ngramSets[ids[j]]);
        violations.push({
          pair: `${ids[i]} ↔ ${ids[j]}`,
          similarity: sim,
          overlapping,
        });
      }
    }
  }

  if (violations.length > 0) {
    hasFailure = true;
    violations.sort((a, b) => b.similarity - a.similarity);
    for (const v of violations) {
      console.log(`FAIL  ${v.pair}  유사도: ${(v.similarity * 100).toFixed(2)}%`);
      if (v.overlapping.length > 0) {
        console.log(`  겹치는 구문: ${v.overlapping.map(s => `"${s}"`).join(', ')}`);
      }
      console.log('');
    }
  }

  if (hasFailure) {
    console.log(`\n❌ FAIL — ${violations.length}개 쌍이 유사도 ${THRESHOLD * 100}%를 초과합니다.`);
    process.exit(1);
  } else {
    console.log(`✅ PASS — 모든 페이지 쌍이 유사도 ${THRESHOLD * 100}% 이하입니다.`);
    process.exit(0);
  }
}

main();
