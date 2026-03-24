import fs from 'fs';
import path from 'path';

// Parse venues.ts to extract venue data
const venuesPath = path.resolve('src/data/venues.ts');
const content = fs.readFileSync(venuesPath, 'utf-8');

// Extract venue objects using regex
const venueRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*region:\s*'([^']+)',\s*area:\s*'([^']+)',[\s\S]*?keyword:\s*'([^']*)'[\s\S]*?category:\s*'([^']+)'/g;

const venues = [];
let match;
while ((match = venueRegex.exec(content)) !== null) {
  venues.push({
    id: match[1],
    name: match[2],
    area: match[4],
    keyword: match[5],
    category: match[6],
  });
}

console.log(`Found ${venues.length} venues`);

// Color schemes by category
const colorSchemes = {
  night:   { bg1: '#1C1917', bg2: '#292524', accent1: '#DB2777', accent2: '#E8B4B8' },
  club:    { bg1: '#0F172A', bg2: '#1E293B', accent1: '#3B82F6', accent2: '#60A5FA' },
  lounge:  { bg1: '#1E1033', bg2: '#2D1B69', accent1: '#D97706', accent2: '#FCD34D' },
  room:    { bg1: '#052E16', bg2: '#14532D', accent1: '#10B981', accent2: '#34D399' },
  yojeong: { bg1: '#450A0A', bg2: '#7F1D1D', accent1: '#F59E0B', accent2: '#FCD34D' },
  hoppa:   { bg1: '#500724', bg2: '#831843', accent1: '#F472B6', accent2: '#FDA4AF' },
};

// Category labels
const categoryLabels = {
  night: '나이트',
  club: '클럽',
  lounge: '라운지',
  room: '룸',
  yojeong: '요정',
  hoppa: '호빠',
};

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSvg(venue) {
  const colors = colorSchemes[venue.category] || colorSchemes.night;
  const categoryLabel = categoryLabels[venue.category] || '나이트';
  const displayName = venue.keyword || venue.name;
  const area = venue.area;

  // Determine font size based on name length
  let fontSize = 48;
  if (displayName.length > 16) {
    fontSize = 36;
  } else if (displayName.length > 12) {
    fontSize = 40;
  }

  const escapedName = escapeXml(displayName);
  const escapedArea = escapeXml(area);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg1}"/>
      <stop offset="100%" style="stop-color:${colors.bg2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.accent1}"/>
      <stop offset="100%" style="stop-color:${colors.accent2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  <rect x="0" y="626" width="1200" height="4" fill="url(#accent)"/>
  <text x="600" y="240" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" font-weight="900" fill="white" letter-spacing="-1">${escapedName}</text>
  <text x="600" y="320" text-anchor="middle" font-family="sans-serif" font-size="28" fill="${colors.accent1}" font-weight="700">${categoryLabel}</text>
  <text x="600" y="400" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#94a3b8" font-weight="600">${escapedArea}</text>
  <text x="600" y="540" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#64748b" font-weight="600">여성이 편안한 밤문화</text>
</svg>`;
}

// Create output directory
const outDir = path.resolve('public/og');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate SVGs for all venues
let created = 0;
for (const venue of venues) {
  const filePath = path.join(outDir, `${venue.id}.svg`);
  const svg = generateSvg(venue);
  fs.writeFileSync(filePath, svg, 'utf-8');
  created++;
  console.log(`  Created: ${venue.id}.svg (${venue.keyword || venue.name}, ${venue.category})`);
}

console.log(`\nTotal: ${created} SVG files generated`);

// Also update default.svg
const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1C1917"/>
      <stop offset="100%" style="stop-color:#292524"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#DB2777"/>
      <stop offset="100%" style="stop-color:#E8B4B8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  <rect x="0" y="626" width="1200" height="4" fill="url(#accent)"/>
  <text x="600" y="220" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="48" font-weight="900" fill="white" letter-spacing="-1">나이트 · 클럽 · 라운지</text>
  <text x="600" y="280" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="36" fill="white" font-weight="700" letter-spacing="-1">룸 · 요정 · 호빠</text>
  <text x="600" y="360" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="36" fill="#E8B4B8" font-weight="700">TOP 103</text>
  <text x="600" y="440" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="24" fill="#94a3b8" font-weight="600">현장 검증 · 실장 연락처 · 분위기 비교</text>
  <text x="600" y="540" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="22" fill="#64748b" font-weight="600">여성이 편안한 밤문화</text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'default.svg'), defaultSvg, 'utf-8');
console.log('Updated: default.svg (TOP 103, all 6 categories)');
