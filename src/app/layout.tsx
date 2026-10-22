import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

export const metadata: Metadata = {
  title: 'GLA Himalayan Escape — Manali & Kasol',
  description:
    '6 Days / 5 Nights Himalayan trip from GLA University, Mathura to Manali and Kasol. Reserve your seat for ₹1,000 per traveller.',
  keywords: [
    'GLA University',
    'Manali Kasol Trip',
    'GLA Himalayan Escape',
    'College Group Tour',
    'Solang Valley',
    'Atal Tunnel',
    'Kasol Riverside',
    'Manikaran Sahib',
    'Mathura to Manali',
  ],
  authors: [{ name: 'GLA Expedition Team' }],
  openGraph: {
    title: 'GLA Himalayan Escape — Manali & Kasol',
    description: '6 Days / 5 Nights Himalayan trip from GLA University, Mathura to Manali and Kasol. Reserve your seat for ₹1,000 per traveller.',
    type: 'website',
    images: [
      {
        url: '/images/hero-himalayas.jpg',
        width: 1200,
        height: 675,
        alt: 'GLA Himalayan Escape - Manali & Kasol',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F7F5EF] text-[#171918] selection:bg-[#163C32] selection:text-white">
        <Navbar />
        <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  );
}
