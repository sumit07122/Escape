import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { POST as createOrderPost } from './create-order/route';

export async function GET() {
  try {
    const [settings, confirmedCount] = await Promise.all([
      db.globalSettings.findFirst(),
      db.seatBooking.count({ where: { status: 'CONFIRMED' } }),
    ]);

    const capacityLimit = settings?.tripCapacity ?? 75;

    return NextResponse.json({
      capacityLimit,
      confirmedCount,
      remainingSeats: Math.max(0, capacityLimit - confirmedCount),
      isFull: confirmedCount >= capacityLimit,
    });
  } catch (error) {
    console.error('Error fetching bookings capacity:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings capacity' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clone = request.clone();
    const body = await clone.json().catch(() => ({}));
    const travellers = body?.travellers;
    const newTravellers = Array.isArray(travellers) ? travellers.length : 1;

    const [settings, currentConfirmed] = await Promise.all([
      db.globalSettings.findFirst(),
      db.seatBooking.count({ where: { status: 'CONFIRMED' } }),
    ]);

    const capacityLimit = settings?.tripCapacity ?? 75;

    if (currentConfirmed + newTravellers > capacityLimit) {
      return NextResponse.json(
        { error: 'Booking limit reached for this expedition. Please contact trip leads.' },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error('Error verifying dynamic capacity in POST /api/bookings:', err);
  }

  return createOrderPost(request);
}
