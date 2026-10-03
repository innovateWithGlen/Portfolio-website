import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/portfolio.json');

function getMeta(html: string, attribute: string, value: string) {
  const tagPattern = new RegExp(`<meta[^>]*(?:${attribute}=["']${value}["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*${attribute}=["']${value}["'])[^>]*>`, 'i');
  const match = html.match(tagPattern);
  return match?.[1] || match?.[2] || '';
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body.action === 'preview') {
      const url = typeof body.url === 'string' ? body.url.trim() : '';
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(url);
      } catch {
        return NextResponse.json({ error: 'Please provide a valid URL.' }, { status: 400 });
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Only HTTP and HTTPS URLs are supported.' }, { status: 400 });
      }

      const response = await fetch(parsedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GlenwebPortfolioBot/1.0)' },
        signal: AbortSignal.timeout(12000),
      });
      const html = await response.text();

      const title = getMeta(html, 'property', 'og:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || parsedUrl.hostname;
      const description = getMeta(html, 'property', 'og:description') || getMeta(html, 'name', 'description') || 'Designed, deployed, and optimized by Glen Monteiro.';
      let image = getMeta(html, 'property', 'og:image');

      if (image) {
        image = new URL(image, parsedUrl).toString();
      } else {
        image = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&waitUntil=load&waitForTimeout=4000&embed=screenshot.url`;
      }

      return NextResponse.json({
        title: title.trim(),
        description: description.trim(),
        image,
        url,
      });
    }

    if (body.action === 'save') {
      if (!body.data || !Array.isArray(body.data.projects) || !Array.isArray(body.data.services) || !body.data.ui) {
        return NextResponse.json({ error: 'Invalid portfolio data. Profile, services, and projects are required.' }, { status: 400 });
      }

      const icons = new Set(['code', 'search', 'tag', 'cloud', 'workflow', 'commerce', 'sparkles']);
      const invalidService = body.data.services.some((service: Record<string, unknown>) => (
        !service || typeof service.id !== 'string' || typeof service.title !== 'string' ||
        typeof service.description !== 'string' || typeof service.tech !== 'string' ||
        typeof service.techLabel !== 'string' || !icons.has(String(service.icon)) ||
        !['available', 'coming-soon'].includes(String(service.status))
      ));
      if (invalidService) {
        return NextResponse.json({ error: 'A service has missing or invalid fields.' }, { status: 400 });
      }

      const portrait = body.data.ui.portrait;
      if (portrait && (
        portrait.mode !== 'original' || typeof portrait.src !== 'string' ||
        !/^\/images\/glen-original-[a-f0-9]{16}\.(jpg|png|webp|avif)$/.test(portrait.src) ||
        !Number.isInteger(portrait.width) || !Number.isInteger(portrait.height) ||
        portrait.width < 1 || portrait.height < 1
      )) {
        return NextResponse.json({ error: 'Import the original portrait using the photo control before saving.' }, { status: 400 });
      }

      await fs.writeFile(DATA_FILE, JSON.stringify(body.data, null, 2), 'utf-8');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Local admin request failed:', error);
    return NextResponse.json({ error: 'The request could not be completed.' }, { status: 500 });
  }
}
