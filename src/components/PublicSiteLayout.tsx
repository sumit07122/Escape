'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import WhatsAppCommunityButton from '@/components/WhatsAppCommunityButton';
import SocialProofPopup from '@/components/SocialProofPopup';
import VisitorLeadPopup from '@/components/auth/VisitorLeadPopup';

export default function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // In the admin portal, completely isolate from public chrome:
  // No public navbar, no footer, no mobile booking bar, no floating WhatsApp widget, no public container padding.
  if (isAdmin) {
    return (
      <div data-admin-root="true" className="admin-root min-h-screen w-full bg-[#101916] text-stone-100">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomBar />
      <WhatsAppCommunityButton />
      <SocialProofPopup />
      <VisitorLeadPopup />
    </>
  );
}
