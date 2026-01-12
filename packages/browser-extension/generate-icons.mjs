import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG icon template
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <g transform="translate(${size/2}, ${size/2})">
    <circle cx="${-15 * size/128}" cy="${-10 * size/128}" r="${20 * size/128}"
            fill="none" stroke="white" stroke-width="${4 * size/128}"/>
    <line x1="${5 * size/128}" y1="${-10 * size/128}"
          x2="${35 * size/128}" y2="${-10 * size/128}"
          stroke="white" stroke-width="${4 * size/128}"/>
    <line x1="${25 * size/128}" y1="${-10 * size/128}"
          x2="${25 * size/128}" y2="${5 * size/128}"
          stroke="white" stroke-width="${4 * size/128}"/>
    <line x1="${35 * size/128}" y1="${-10 * size/128}"
          x2="${35 * size/128}" y2="${10 * size/128}"
          stroke="white" stroke-width="${4 * size/128}"/>
  </g>
</svg>
`;

async function generateIcons() {
  const assetsDir = path.join(__dirname, 'src', 'assets');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const sizes = [16, 32, 48, 128];

  for (const size of sizes) {
    const svg = createIconSVG(size);
    const outputPath = path.join(assetsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Created icon-${size}.png`);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
