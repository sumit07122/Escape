import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import WhatsAppCommunityButton from '@/components/WhatsAppCommunityButton';
import SocialProofToast from '@/components/SocialProofToast';
import { Analytics } from '@vercel/analytics/next';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'HIMALAYAN ESCAPE 🏔️ | Manali × Kasol 2026 Student Expedition',
  description:
    'Official booking portal for Himalayan Escape. Reserve your seat, select your bus cabin, and generate your boarding pass.',
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
    'Student Mountain Expedition',
    'Manali Kasol Trip',
    'Student Group Tour',
    'Solang Valley',
    'Atal Tunnel',
    'Kasol Riverside',
    'Manikaran Sahib',
    'Mathura Highway Departure',
  ],
  authors: [{ name: 'Student Trip Organizers' }],
  openGraph: {
    title: 'HIMALAYAN ESCAPE 🏔️ | Manali × Kasol 2026 Student Expedition',
    description:
      'Official booking portal for Himalayan Escape. Reserve your seat, select your bus cabin, and generate your boarding pass.',
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
    title: 'HIMALAYAN ESCAPE 🏔️ | Manali × Kasol 2026 Student Expedition',
    description:
      'Official booking portal for Himalayan Escape. Reserve your seat, select your bus cabin, and generate your boarding pass.',
    images: ['/images/hero-himalayas.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} h-full scroll-smooth`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F5EF] text-[#171918] selection:bg-[#163C32] selection:text-white">
        <Navbar />
        <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
        <WhatsAppCommunityButton />
        <SocialProofToast />
        <Analytics />
      </body>
    </html>
  );
}
