export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTripConfig, updateTripConfig } from '@/lib/trip-config';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';
import { db } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized coordinator session' }, { status: 401 });
    }

    const config = await getTripConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('[API_ADMIN_GET_CONFIG_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to retrieve trip configuration' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized coordinator session' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      tripTitle,
      subtitle,
      totalCapacity,
      packagePrice,
      depositPrice,
      pickupLocation,
      reportingTime,
      departureDate,
      emergencyHelplines,
      announcementBanner,
      announcementActive,
    } = body;

    const updated = await updateTripConfig({
      ...(tripTitle !== undefined && { tripTitle: String(tripTitle).trim() }),
      ...(subtitle !== undefined && { subtitle: String(subtitle).trim() }),
      ...(totalCapacity !== undefined && { totalCapacity: Number(totalCapacity) }),
      ...(packagePrice !== undefined && { packagePrice: Number(packagePrice) }),
      ...(depositPrice !== undefined && { depositPrice: Number(depositPrice) }),
      ...(pickupLocation !== undefined && { pickupLocation: String(pickupLocation).trim() }),
      ...(reportingTime !== undefined && { reportingTime: String(reportingTime).trim() }),
      ...(departureDate !== undefined && { departureDate: String(departureDate).trim() }),
      ...(Array.isArray(emergencyHelplines) && { emergencyHelplines }),
      ...(announcementBanner !== undefined && { announcementBanner }),
      ...(announcementActive !== undefined && { announcementActive: Boolean(announcementActive) }),
    });

    // Also sync with Trip / Package models if they exist in DB
    try {
      if (totalCapacity !== undefined) {
        await db.trip.updateMany({
          data: { capacity: Number(totalCapacity) },
        });
        await db.globalSettings.upsert({
          where: { id: 'global_default' },
          update: { tripCapacity: Number(totalCapacity) },
          create: { id: 'global_default', tripCapacity: Number(totalCapacity) },
        });
      }
      if (packagePrice !== undefined || depositPrice !== undefined) {
        await db.trip.updateMany({
          data: {
            ...(packagePrice !== undefined && {
              packagePrice: Number(packagePrice),
              packagePricePerTraveller: Number(packagePrice),
            }),
            ...(depositPrice !== undefined && {
              reservationAmount: Number(depositPrice),
              reservationAmountPerTraveller: Number(depositPrice),
            }),
          },
        });
        await db.package.updateMany({
          data: {
            ...(packagePrice !== undefined && { price: Number(packagePrice) }),
            ...(depositPrice !== undefined && { reservationAmount: Number(depositPrice) }),
          },
        });
      }
    } catch (syncErr) {
      console.warn('[CONFIG_SYNC_RELATIONAL_WARN]:', syncErr);
    }

    createAuditLog({
      action: 'ADMIN_CONFIG_UPDATE',
      entityType: 'SETTINGS',
      entityId: 'global',
      performedBy: `${admin.name} (${admin.email})`,
      newValue: JSON.stringify(body),
    }).catch(() => {});

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/book', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/my-bookings', 'page');
    } catch (revalErr) {
      console.warn('[REVALIDATE_PATH_WARN]:', revalErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Trip configuration updated successfully',
      config: updated,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('[API_ADMIN_UPDATE_CONFIG_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update trip configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PATCH(request);
}
