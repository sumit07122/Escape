export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { findBestAdjacentSeats, calculateHoldExpiration } from '@/lib/bus-seating';
import { cleanExpiredHolds } from '@/lib/server-utils';
import { SittingPreference } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingSessionId,
      count = 1,
      busId: requestedBusId,
      preference = 'NO_PREFERENCE',
    } = body;

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'bookingSessionId is required' }, { status: 400 });
    }

    const travellersCount = Math.max(1, Math.min(Number(count) || 1, 6));

    // 1. Purge expired holds
    await db.seatHold.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await cleanExpiredHolds();

    // 2. Fetch buses
    const buses = await db.bus.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { busNumber: 'asc' },
      include: {
        seats: {
          where: { isBookable: true },
          include: { seatHold: true, seatBooking: true },
        },
      },
    });

    if (buses.length === 0) {
      return NextResponse.json({ error: 'No active buses configured' }, { status: 404 });
    }

    // Prioritize requested bus if provided, otherwise order buses by available seats
    let chosenBus = requestedBusId ? buses.find((b) => b.id === requestedBusId) : null;
    const now = new Date();

    const getAvailableSeatsForBus = (b: (typeof buses)[0]) => {
      return b.seats
        .filter((seat) => {
          if (seat.status === 'BOOKED' || seat.seatBooking) return false;
          if (seat.status === 'BLOCKED') return false;
          // If held by another active session, not available
          if (
            seat.seatHold &&
            seat.seatHold.status === 'ACTIVE' &&
            seat.seatHold.expiresAt > now &&
            seat.seatHold.bookingSessionId !== bookingSessionId
          ) {
            return false;
          }
          return true;
        })
        .map((s) => s.seatNumber);
    };

    let targetSeats: string[] = [];
    let selectedBus = chosenBus;

    if (selectedBus) {
      const avail = getAvailableSeatsForBus(selectedBus);
      if (avail.length >= travellersCount) {
        targetSeats = findBestAdjacentSeats(avail, travellersCount, preference as SittingPreference);
      }
    }

    // If requested bus didn't have enough, or wasn't specified, check all buses
    if (targetSeats.length < travellersCount) {
      for (const bus of buses) {
        const avail = getAvailableSeatsForBus(bus);
        if (avail.length >= travellersCount) {
          const candidate = findBestAdjacentSeats(avail, travellersCount, preference as SittingPreference);
          if (candidate.length === travellersCount) {
            targetSeats = candidate;
            selectedBus = bus;
            break;
          }
        }
      }
    }

    if (targetSeats.length < travellersCount || !selectedBus) {
      return NextResponse.json({
        error: `Could not find ${travellersCount} seats together. Please select seats manually or contact coordinators.`,
      }, { status: 409 });
    }

    const expiresAt = calculateHoldExpiration(10); // 10 minutes

    // 3. Atomically release previous holds and lock new target seats
    await db.$transaction(async (tx) => {
      // Release any other seats held by this session
      const previousHolds = await tx.seatHold.findMany({
        where: {
          bookingSessionId,
          status: 'ACTIVE',
        },
        include: { busSeat: true },
      });

      for (const prevHold of previousHolds) {
        if (!targetSeats.includes(prevHold.busSeat.seatNumber) || prevHold.busSeat.busId !== selectedBus!.id) {
          await tx.seatHold.update({
            where: { id: prevHold.id },
            data: { status: 'RELEASED' },
          });
          await tx.busSeat.update({
            where: { id: prevHold.busSeatId },
            data: { status: 'AVAILABLE', isAvailable: true },
          });
        }
      }

      // Hold target seats
      for (const seatNumber of targetSeats) {
        const busSeat = await tx.busSeat.findUnique({
          where: {
            busId_seatNumber: {
              busId: selectedBus!.id,
              seatNumber,
            },
          },
        });

        if (!busSeat) continue;

        await tx.seatHold.upsert({
          where: { busSeatId: busSeat.id },
          update: {
            bookingSessionId,
            status: 'ACTIVE',
            expiresAt,
          },
          create: {
            busSeatId: busSeat.id,
            bookingSessionId,
            status: 'ACTIVE',
            expiresAt,
          },
        });

        await tx.busSeat.update({
          where: { id: busSeat.id },
          data: { status: 'HELD', isAvailable: false },
        });
      }
    });

    return NextResponse.json({
      success: true,
      busId: selectedBus.id,
      busNumber: selectedBus.busNumber,
      vehicleName: selectedBus.vehicleName,
      seatNumbers: targetSeats,
      heldSecondsRemaining: 600,
    });
  } catch (error: any) {
    console.error('Error in auto-assign seats:', error);
    return NextResponse.json({ error: error.message || 'Failed to auto-assign seats' }, { status: 500 });
  }
}
