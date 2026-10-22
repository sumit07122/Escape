import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

export const metadata: Metadata = {
  title: 'GLA Himalayan Escape | Manali × Kasol 6D/5N College Expedition',
  description:
    'Join GLA University Mathura for an unforgettable 6 Days / 5 Nights Himalayan expedition to Manali & Kasol. Luxury 2x2 AC coaches with interactive BookMyShow-style seat selection, resort stays, campfire & digital QR tickets.',
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
    title: 'GLA HIMALAYAN ESCAPE — MANALI × KASOL (6D/5N)',
    description: 'Mountains. Friends. Adventure. Memories. Starting from GLA University Mathura. Reserve your bus seat now for ₹1,000.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#08140e] text-[#f8faf9] selection:bg-orange-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  );
}
