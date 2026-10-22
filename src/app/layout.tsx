import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

export const metadata: Metadata = {
  title: 'Himalayan Escape — Student Mountain Expedition',
  description:
    '6 Days / 5 Nights student expedition departing near GLA Main Gate, Mathura to Manali and Kasol. Reserve your seat for ₹1,000 per traveller.',
  keywords: [
    'Himalayan Escape',
    'Student Mountain Expedition',
    'Manali Kasol Trip',
    'Student Group Tour',
    'Solang Valley',
    'Atal Tunnel',
    'Kasol Riverside',
    'Manikaran Sahib',
    'GLA Main Gate Mathura',
  ],
  authors: [{ name: 'Student Trip Organizers' }],
  openGraph: {
    title: 'Himalayan Escape — Student Mountain Expedition',
    description: '6 Days / 5 Nights student expedition departing near GLA Main Gate, Mathura to Manali and Kasol. Reserve your seat for ₹1,000 per traveller.',
    type: 'website',
    images: [
      {
        url: '/images/hero-himalayas.jpg',
        width: 1200,
        height: 675,
        alt: 'Himalayan Escape — Student Mountain Expedition',
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
