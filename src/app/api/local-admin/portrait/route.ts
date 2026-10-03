import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import type { PortfolioPortrait } from '@/data/types';

export const runtime = 'nodejs';
const MAX_BYTES = 20 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Portrait uploads are only available in local development.' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get('host')) {
        return NextResponse.json({ error: 'Cross-origin uploads are not allowed.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid upload origin.' }, { status: 403 });
    }
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'Please use a photo smaller than 20 MB.' }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get('portrait');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Choose an original portrait photo.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Please use a photo smaller than 20 MB.' }, { status: 413 });
    }

    const original = Buffer.from(await file.arrayBuffer());
    // Only inspect the header. Never run rotate/resize/encode/background-removal.
    const metadata = await sharp(original, { limitInputPixels: 40_000_000 }).metadata();
    const format = metadata.format === 'heif' && metadata.compression === 'av1' ? 'avif' : metadata.format;
    const extension = format ? EXTENSIONS[format] : undefined;
    if (!extension || !metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) {
      return NextResponse.json({ error: 'Use a still JPEG, PNG, WebP, or AVIF portrait.' }, { status: 400 });
    }

    // The browser honors the original EXIF orientation; use display dimensions
    // for the aspect ratio without rewriting the original image.
    const sideways = metadata.orientation !== undefined && metadata.orientation >= 5 && metadata.orientation <= 8;
    const width = sideways ? metadata.height : metadata.width;
    const height = sideways ? metadata.width : metadata.height;
    const checksum = createHash('sha256').update(original).digest('hex');
    const fileName = `glen-original-${checksum.slice(0, 16)}.${extension}`;
    const directory = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, fileName), original);

    const portrait: PortfolioPortrait = {
      src: `/images/${fileName}`,
      width,
      height,
      mode: 'original',
    };
    return NextResponse.json({ portrait, checksum, bytes: original.byteLength, preserved: true });
  } catch {
    return NextResponse.json({ error: 'The photo could not be read. Please use a valid JPEG, PNG, WebP, or AVIF file.' }, { status: 400 });
  }
}
