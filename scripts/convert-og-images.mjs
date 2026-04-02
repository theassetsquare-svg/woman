/**
 * Convert all SVG og:images to JPG (1200x630)
 * Also create the homepage brand image (놀쿨 NOLCOOL + purple bg)
 */
import sharp from 'sharp';
import { readdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const ogDir = join(process.cwd(), 'public/og');
const files = readdirSync(ogDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${files.length} SVG files to convert`);

let success = 0;
let failed = 0;

for (const file of files) {
  const svgPath = join(ogDir, file);
  const jpgName = file.replace('.svg', '.jpg');
  const jpgPath = join(ogDir, jpgName);

  try {
    await sharp(svgPath)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .flatten({ background: { r: 17, g: 17, b: 17 } }) // dark bg for transparency
      .jpeg({ quality: 85 })
      .toFile(jpgPath);
    success++;
  } catch (err) {
    console.error(`FAILED: ${file} →`, err.message);
    failed++;

    // Create a fallback branded image
    try {
      const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#1a1a2e"/>
        <text x="600" y="280" text-anchor="middle" fill="#E8B4B8" font-size="48" font-weight="900" font-family="sans-serif">${basename(file, '.svg')}</text>
        <text x="600" y="380" text-anchor="middle" fill="#8B5CF6" font-size="32" font-weight="700" font-family="sans-serif">놀쿨 NOLCOOL</text>
      </svg>`;

      await sharp(Buffer.from(svg))
        .resize(1200, 630)
        .jpeg({ quality: 85 })
        .toFile(jpgPath);
      console.log(`  → Created fallback for ${file}`);
      failed--;
      success++;
    } catch (err2) {
      console.error(`  → Fallback also failed:`, err2.message);
    }
  }
}

// Create homepage brand image: 놀쿨 NOLCOOL + purple bg
const brandSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="250" text-anchor="middle" fill="white" font-size="80" font-weight="900" font-family="sans-serif">놀쿨</text>
  <text x="600" y="350" text-anchor="middle" fill="white" font-size="56" font-weight="700" font-family="sans-serif" opacity="0.9">NOLCOOL</text>
  <text x="600" y="440" text-anchor="middle" fill="white" font-size="28" font-weight="500" font-family="sans-serif" opacity="0.7">전국 나이트·클럽·라운지 TOP 103</text>
  <text x="600" y="520" text-anchor="middle" fill="#E8B4B8" font-size="24" font-weight="600" font-family="sans-serif">여성이 편안한 밤문화 가이드</text>
</svg>`;

try {
  await sharp(Buffer.from(brandSvg))
    .resize(1200, 630)
    .jpeg({ quality: 90 })
    .toFile(join(ogDir, 'default.jpg'));
  console.log('✅ Created homepage brand image: default.jpg');
} catch (err) {
  console.error('Failed to create brand image:', err.message);
}

console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
