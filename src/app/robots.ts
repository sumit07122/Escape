import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://escape-nine-lake.vercel.app');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/book',
          '/pricing',
          '/itinerary',
          '/gallery',
          '/inclusions',
          '/faq',
          '/contact',
          '/privacy-policy',
          '/terms',
          '/cancellation-policy',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/my-booking',
          '/my-bookings',
          '/ticket/*',
          '/tickets/*',
          '/verify/*',
        ],
      },
    ],
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
