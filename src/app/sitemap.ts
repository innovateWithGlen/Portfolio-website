import type { MetadataRoute } from 'next';

const SITE_URL = 'https://glenmonteiro.dev';

// Required for `output: export` — evaluated once at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
