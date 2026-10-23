export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import MyBookingsClient from '@/components/MyBookingsClient';
import { getTripConfig } from '@/lib/trip-config';

export const metadata = {
  title: 'My Bookings & Boarding Passes | Himalayan Escape',
  description: 'View your confirmed bus seats, download official QR passes, and check gate departure details.',
};

export default async function MyBookingsPage() {
  const tripConfig = await getTripConfig();

  return <MyBookingsClient initialConfig={tripConfig} />;
}
