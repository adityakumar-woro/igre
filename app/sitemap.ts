import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://igre.ae';

  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/listings', '/areas', '/services', '/about', '/team', '/contact', '/collaborate',
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1.0 : 0.8,
  }));

  let listings: MetadataRoute.Sitemap = [];
  let areas: MetadataRoute.Sitemap = [];

  try {
    const [ls, as] = await Promise.all([
      db.listing.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
      db.area.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    listings = ls.map((l) => ({
      url: `${base}/listings/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    areas = as.map((a) => ({
      url: `${base}/areas/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // db unavailable at build — return static routes only
  }

  return [...staticRoutes, ...areas, ...listings];
}
