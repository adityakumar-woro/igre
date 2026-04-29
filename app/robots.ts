import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/dashboard', '/my', '/api', '/change-password'],
      },
    ],
    sitemap: 'https://igre.ae/sitemap.xml',
  };
}
