export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React, { Suspense } from 'react';
import AdminReportsClient from '@/components/admin/AdminReportsClient';

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-stone-500 font-mono flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Financial Intelligence...</span>
        </div>
      }
    >
      <AdminReportsClient />
    </Suspense>
  );
}
