#!/usr/bin/env node
/**
 * Builds the transparent hero portrait that sits in front of your name.
 *
 *   node scripts/make-cutout.mjs <photo> [output]
 *
 * - Photos on a plain white / light studio backdrop are cut out automatically.
 * - Images that are already transparent (PNG / WebP cutouts) are just trimmed.
 * - Output defaults to public/images/glen-cutout.webp, which the hero uses.
 */
import sharp from 'sharp';

const [input, output = 'public/images/glen-cutout.webp'] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node scripts/make-cutout.mjs <photo> [output]');
  process.exit(1);
}

const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

let seeThrough = 0;
for (let i = 3; i < data.length; i += 4) if (data[i] < 250) seeThrough++;
const alreadyCutOut = seeThrough / N > 0.02;
if (!alreadyCutOut) removeBackdrop();

// Trim to the subject, keeping a head-and-shoulders crop.
let minX = W, minY = H, maxX = -1, maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 12) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX < 0) throw new Error('No subject found in the image.');
const cropW = maxX - minX + 1;
const cropH = Math.min(maxY - minY + 1, Math.round(cropW * 1.1));

const result = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .resize({ width: Math.min(cropW, 960), withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 95, effort: 6 })
  .toFile(output);

console.log(`✓ ${output} — ${result.width}×${result.height}, ${Math.round(result.size / 1024)} KB${alreadyCutOut ? ' (input was already transparent)' : ''}`);

function removeBackdrop() {
  // 1. Backdrop colour: median of the top edge and upper sides (always backdrop in a portrait).
  const samples = [];
  const take = (x, y) => {
    const o = (y * W + x) * 4;
    samples.push([data[o], data[o + 1], data[o + 2]]);
  };
  for (let x = 0; x < W; x += 2) take(x, 0);
  for (let y = 0; y < H * 0.35; y += 2) { take(0, y); take(W - 1, y); }
  const median = (c) => samples.map((s) => s[c]).sort((a, b) => a - b)[samples.length >> 1];
  const B = [median(0), median(1), median(2)];

  const dist = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    dist[i] = Math.max(Math.abs(data[o] - B[0]), Math.abs(data[o + 1] - B[1]), Math.abs(data[o + 2] - B[2]));
  }

  // 2. Flood-fill the backdrop from the border, so enclosed light areas (shirt collar) are kept.
  const FILL = 48;
  const isBg = new Uint8Array(N);
  const stack = new Int32Array(N);
  let top = 0;
  const push = (i) => {
    if (!isBg[i] && dist[i] < FILL) { isBg[i] = 1; stack[top++] = i; }
  };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (top) {
    const i = stack[--top];
    const x = i % W;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (i >= W) push(i - W);
    if (i < N - W) push(i + W);
  }

  // 3. Mark a 2px band around the subject's outline.
  const R = 2;
  const band = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      search: for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < W && isBg[yy * W + xx] !== isBg[i]) { band[i] = 1; break search; }
        }
      }
    }
  }

  // 4. Alpha: backdrop 0, subject 255. Edge pixels are un-mixed from the backdrop using the
  //    nearby solid subject colour, which leaves no white halo on dark backgrounds.
  const S = 4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const o = i * 4;
      if (!band[i]) { data[o + 3] = isBg[i] ? 0 : 255; continue; }

      let fr = 0, fg = 0, fb = 0, n = 0;
      for (let dy = -S; dy <= S; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -S; dx <= S; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const j = yy * W + xx;
          if (!isBg[j] && !band[j]) { const q = j * 4; fr += data[q]; fg += data[q + 1]; fb += data[q + 2]; n++; }
        }
      }
      const F = n ? [fr / n, fg / n, fb / n] : [20, 20, 20];
      const fx = F[0] - B[0], fy = F[1] - B[1], fz = F[2] - B[2];
      const len2 = fx * fx + fy * fy + fz * fz;
      let a = len2 < 400
        ? (dist[i] < FILL ? 0 : 1)
        : ((data[o] - B[0]) * fx + (data[o + 1] - B[1]) * fy + (data[o + 2] - B[2]) * fz) / len2;
      a = Math.min(1, Math.max(0, a));
      if (a < 0.04) a = 0;
      data[o + 3] = Math.round(a * 255);
      if (a > 0 && a < 1) {
        for (let c = 0; c < 3; c++) {
          data[o + c] = Math.min(255, Math.max(0, Math.round((data[o + c] - (1 - a) * B[c]) / a)));
        }
      }
    }
  }
}
