import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fp = resolve(__dirname, '..', 'src/data/venueContent.ts');
let c = readFileSync(fp, 'utf-8');

const venuesRaw = readFileSync(resolve(__dirname, '..', 'src/data/venues.ts'), 'utf-8');
function pbb(raw, sm) { const m = raw.match(sm); const si = m.index + m[0].length - 1; let d = 0, ei = -1; for (let i = si; i < raw.length; i++) { if (raw[i] === '[') d++; else if (raw[i] === ']') { d--; if (d === 0) { ei = i; break; } } } let s = raw.substring(si, ei + 1).replace(/\bas\s+const\b/g, ''); return new Function(`return (${s})`)(); }
const venues = pbb(venuesRaw, /export\s+const\s+venues\s*:\s*Venue\[\]\s*=\s*\[/);

function getVenueSection(vid) {
  const sp = `'${vid}': {`;
  const si = c.indexOf(sp);
  if (si === -1) return null;
  let ei = c.length;
  const r = /\n'[a-z]+-[a-z]/g;
  r.lastIndex = si + sp.length;
  const m = r.exec(c);
  if (m) ei = m.index;
  return { start: si, end: ei, text: c.substring(si, ei) };
}

function countInSection(section, keyword) {
  let count = 0, pos = 0;
  while ((pos = section.indexOf(keyword, pos)) !== -1) { count++; pos += keyword.length; }
  return count;
}

function wordCount(section) {
  const textOnly = section.replace(/['"`,{}[\]:]/g, ' ').replace(/[^\uAC00-\uD7AF\u3131-\u3163a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return textOnly.split(' ').filter(w => w.length > 0).length;
}

// Replace N occurrences of keyword (from end) with replacement
function reduceKeyword(vid, keyword, replacement, count) {
  const sp = `'${vid}': {`;
  const si = c.indexOf(sp);
  if (si === -1) return 0;
  let ei = c.length;
  const r = /\n'[a-z]+-[a-z]/g;
  r.lastIndex = si + sp.length;
  const m = r.exec(c);
  if (m) ei = m.index;
  let sec = c.substring(si, ei);
  let cnt = 0, li = sec.length;
  while (cnt < count) {
    const idx = sec.lastIndexOf(keyword, li - 1);
    if (idx === -1) break;
    sec = sec.substring(0, idx) + replacement + sec.substring(idx + keyword.length);
    li = idx; cnt++;
  }
  c = c.substring(0, si) + sec + c.substring(ei);
  return cnt;
}

// Add keyword to intro (from start, first sentence)
function addKeywordToIntro(vid, keyword) {
  const sp = `'${vid}': {`;
  const si = c.indexOf(sp);
  if (si === -1) return 0;
  let ei = c.length;
  const r = /\n'[a-z]+-[a-z]/g;
  r.lastIndex = si + sp.length;
  const m = r.exec(c);
  if (m) ei = m.index;
  let sec = c.substring(si, ei);

  // Find intro field and insert keyword reference
  const introMatch = sec.match(/intro:\s*'/);
  if (!introMatch) return 0;
  const introStart = introMatch.index + introMatch[0].length;
  // Insert at start of intro
  sec = sec.substring(0, introStart) + keyword + '은(는) ' + sec.substring(introStart);
  c = c.substring(0, si) + sec + c.substring(ei);
  return 1;
}

console.log('='.repeat(80));
console.log('  KEYWORD DENSITY FIX');
console.log('='.repeat(80));

for (const v of venues) {
  const keyword = `${v.seoArea}호빠 ${v.name}`;
  const sec = getVenueSection(v.id);
  if (!sec) continue;

  const currentCount = countInSection(sec.text, keyword);
  const words = wordCount(sec.text);
  const kwWords = keyword.split(/\s+/).length;
  const density = currentCount * kwWords / words * 100;

  // Target: 1.0-1.5%
  const targetMin = Math.ceil(words * 0.01 / kwWords);
  const targetMax = Math.floor(words * 0.015 / kwWords);
  const targetIdeal = Math.max(targetMin, Math.min(targetMax, Math.round(words * 0.0125 / kwWords)));

  if (density >= 1.0 && density <= 1.5) {
    console.log(`  ✅ ${v.id}: ${density.toFixed(2)}% (${currentCount}x) — OK`);
    continue;
  }

  if (density > 1.5) {
    const reduce = currentCount - targetIdeal;
    if (reduce > 0) {
      // Replace excess with just the venue name (no region prefix)
      const replaced = reduceKeyword(v.id, keyword, v.name, reduce);
      const newCount = currentCount - replaced;
      const newDensity = newCount * kwWords / words * 100;
      console.log(`  🔧 ${v.id}: ${density.toFixed(2)}%→${newDensity.toFixed(2)}% (${currentCount}→${newCount}x, target ${targetIdeal})`);
    }
  } else if (density < 1.0) {
    const add = targetIdeal - currentCount;
    if (add > 0) {
      // Add to conclusion by replacing venue name alone with full keyword
      const sp = `'${v.id}': {`;
      const si = c.indexOf(sp);
      let ei2 = c.length;
      const r2 = /\n'[a-z]+-[a-z]/g;
      r2.lastIndex = si + sp.length;
      const m2 = r2.exec(c);
      if (m2) ei2 = m2.index;
      let sec2 = c.substring(si, ei2);

      // Find places where just the venue name appears (not as part of full keyword) and upgrade
      let added = 0;
      const nameOnly = v.name;
      let searchPos = 0;
      while (added < add && searchPos < sec2.length) {
        const idx = sec2.indexOf(nameOnly, searchPos);
        if (idx === -1) break;
        // Check it's not already part of full keyword
        const before = sec2.substring(Math.max(0, idx - keyword.length), idx);
        if (!before.endsWith(`${v.seoArea}호빠 `)) {
          sec2 = sec2.substring(0, idx) + keyword + sec2.substring(idx + nameOnly.length);
          searchPos = idx + keyword.length;
          added++;
        } else {
          searchPos = idx + nameOnly.length;
        }
      }
      c = c.substring(0, si) + sec2 + c.substring(ei2);
      const newCount = currentCount + added;
      const newWords = wordCount(c.substring(si, ei2));
      const newDensity = newCount * kwWords / newWords * 100;
      console.log(`  🔧 ${v.id}: ${density.toFixed(2)}%→${newDensity.toFixed(2)}% (${currentCount}→${newCount}x, added ${added})`);
    }
  }
}

writeFileSync(fp, c, 'utf-8');
console.log('\n✅ Density fixes applied');
