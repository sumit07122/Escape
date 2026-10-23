export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React, { Suspense } from 'react';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { getTripConfig } from '@/lib/trip-config';

export default async function AdminPage() {
  const tripConfig = await getTripConfig();

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-stone-500 font-mono flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Operations Desk...</span>
        </div>
      }
    >
      <AdminDashboardClient initialConfig={tripConfig} />
    </Suspense>
  );
}
