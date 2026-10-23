export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view your bookings.' },
        { status: 401 }
      );
    }

    const email = session.email.toLowerCase().trim();

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          { userId: session.id },
          { primaryEmail: { equals: email, mode: 'insensitive' } },
          { travellers: { some: { email: { equals: email, mode: 'insensitive' } } } },
        ],
      },
      include: {
        travellers: {
          include: {
            ticket: true,
            seatBooking: {
              include: {
                busSeat: true,
              },
            },
          },
        },
        bus: true,
        package: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        tickets: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        image: session.image,
      },
      bookings,
    });
  } catch (error: unknown) {
    console.error('Error fetching user bookings:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve bookings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
