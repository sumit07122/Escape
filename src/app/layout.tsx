import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import PublicSiteLayout from '@/components/PublicSiteLayout';
import { Analytics } from '@vercel/analytics/next';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://escape-nine-lake.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Himalayan Escape 2026 | 6 Days Manali & Kasol Christmas Trip from Mathura',
  description:
    'Experience a 6-day, 5-night Himalayan adventure from Mathura to Kasol and Manali. Enjoy riverside camping, Solang Valley, Sissu, Jogini Waterfall and Christmas celebrations.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: [
    'Himalayan Escape',
    'Christmas Special 2026',
    'GLA University Trip',
    'Manali Kasol 6D5N',
    'Solang Valley',
    'Sissu',
    'Jogini Waterfall',
    'Riverside Camping Kasol',
    'Student Mountain Expedition',
  ],
  authors: [{ name: 'Student Trip Organizers' }],
  openGraph: {
    title: 'Himalayan Escape 2026 | 6 Days Manali & Kasol Christmas Trip from Mathura',
    description:
      'Experience a 6-day, 5-night Himalayan adventure from Mathura to Kasol and Manali. Enjoy riverside camping, Solang Valley, Sissu, Jogini Waterfall and Christmas celebrations.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Himalayan Escape 2026 Logo',
      },
      {
        url: '/images/hero-himalayas.jpg',
        width: 1200,
        height: 675,
        alt: 'Himalayan Escape 2026 | Manali × Kasol Student Expedition',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Himalayan Escape 2026 | 6 Days Manali & Kasol Christmas Trip from Mathura',
    description:
      'Experience a 6-day, 5-night Himalayan adventure from Mathura to Kasol and Manali. Enjoy riverside camping, Solang Valley, Sissu, Jogini Waterfall and Christmas celebrations.',
    images: ['/images/hero-himalayas.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable} h-full scroll-smooth`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F5EF] text-[#171918] selection:bg-[#163C32] selection:text-white">
        <PublicSiteLayout>
          {children}
        </PublicSiteLayout>
        <Analytics />
      </body>
    </html>
  );
}
