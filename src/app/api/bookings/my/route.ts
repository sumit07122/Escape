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

    const orConditions: any[] = [{ userId: session.id }];

    if (session.email) {
      const email = session.email.toLowerCase().trim();
      orConditions.push({ primaryEmail: { equals: email, mode: 'insensitive' } });
      orConditions.push({ travellers: { some: { email: { equals: email, mode: 'insensitive' } } } });
    }

    if (session.phone) {
      const cleanPhone = session.phone.replace(/[^0-9]/g, '').slice(-10);
      if (cleanPhone) {
        orConditions.push({ primaryPhone: { contains: cleanPhone } });
        orConditions.push({ travellers: { some: { phone: { contains: cleanPhone } } } });
      }
    }

    const bookings = await db.booking.findMany({
      where: {
        OR: orConditions,
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
        phone: session.phone || null,
        email: session.email || null,
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
