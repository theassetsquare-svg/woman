import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('/home/user/woman/src/data/venueContent.ts', 'utf8');

// Show 전담 occurrences in gangnam-i
const iStart = c.indexOf("'gangnam-i':");
const iEnd = c.indexOf("'gangnam-flirting':");
const iSection = c.slice(iStart, iEnd);
console.log('전담 in gangnam-i:');
const tdRegex = /전담/g;
let m;
while ((m = tdRegex.exec(iSection)) !== null) {
  console.log(' ', JSON.stringify(iSection.slice(Math.max(0, m.index-15), m.index+20)));
}

// Show 있나요 occurrences
console.log('\n있나요 in gangnam-i:');
const inRegex = /있나요/g;
while ((m = inRegex.exec(iSection)) !== null) {
  console.log(' ', JSON.stringify(iSection.slice(Math.max(0, m.index-15), m.index+20)));
}

// Show 선수 occurrences in gangnam-flirting
const fStart = c.indexOf("'gangnam-flirting':");
const fEnd = c.indexOf("'gangnam-blackhole':");
const fSection = c.slice(fStart, fEnd);
console.log('\n선수 in gangnam-flirting:');
const snRegex = /선수/g;
while ((m = snRegex.exec(fSection)) !== null) {
  console.log(' ', JSON.stringify(fSection.slice(Math.max(0, m.index-15), m.index+20)));
}

// Show 공간의 occurrences in gangnam-blackhole
const bStart = c.indexOf("'gangnam-blackhole':");
const bEnd = c.indexOf('// ===== 건대 =====');
const bSection = c.slice(bStart, bEnd);
console.log('\n공간의 in gangnam-blackhole:');
const kgRegex = /공간의/g;
while ((m = kgRegex.exec(bSection)) !== null) {
  console.log(' ', JSON.stringify(bSection.slice(Math.max(0, m.index-15), m.index+20)));
}
