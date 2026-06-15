// Run: node scripts/generate-icons.mjs
// Generates placeholder PWA icons using canvas API in Node 18+
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';

const SIZES = [192, 512];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, size, size);

  // Gold circle
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  grad.addColorStop(0, '#F5E07A');
  grad.addColorStop(0.5, '#D4AF37');
  grad.addColorStop(1, '#B8960C');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // "W" letter
  ctx.fillStyle = '#0A0A0A';
  ctx.font = `bold ${size * 0.35}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', cx, cy + size * 0.02);

  return canvas.toBuffer('image/png');
}

mkdirSync('public/icons', { recursive: true });

for (const size of SIZES) {
  try {
    const buf = drawIcon(size);
    writeFileSync(`public/icons/icon-${size}.png`, buf);
    console.log(`✓ icon-${size}.png`);
  } catch {
    console.warn(`canvas package not available — skipping icon-${size}.png`);
    console.warn('Install with: npm install canvas  OR use any PNG manually');
  }
}
