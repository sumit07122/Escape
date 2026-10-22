import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateBookingPricing } from '@/lib/pricing';
import { createRazorpayOrder } from '@/lib/razorpay';
import { generateBookingId } from '@/lib/qr';
import { cleanExpiredHolds, createAuditLog } from '@/lib/server-utils';
import { TravellerInput } from '@/types';
import { getUserSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      travellers,
      sittingPreference = 'NO_PREFERENCE',
      busId,
      selectedSeats,
      bookingSessionId,
      emergencyContactName,
      emergencyContactPhone,
    } = body;

    if (!busId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return NextResponse.json({ error: 'Missing bus or seat selection' }, { status: 400 });
    }

    if (!travellers || !Array.isArray(travellers) || travellers.length === 0) {
      return NextResponse.json({ error: 'Traveller details are required' }, { status: 400 });
    }

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is missing' }, { status: 400 });
    }

    // Number of seats must equal number of travellers
    if (selectedSeats.length !== travellers.length) {
      return NextResponse.json({
        error: `Seat selection mismatch: ${selectedSeats.length} seats selected for ${travellers.length} travellers`,
      }, { status: 400 });
    }

    // 1. Clean expired holds first
    await cleanExpiredHolds();

    // 2. Fetch master trip and check capacity limit (75)
    const trip = await db.trip.findFirst({
      include: {
        packages: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Count currently confirmed travellers across the entire trip
    const confirmedCount = await db.seatBooking.count({
      where: {
        busSeat: { bus: { tripId: trip.id } },
        status: 'CONFIRMED',
      },
    });

    if (confirmedCount + travellers.length > trip.capacity) {
      return NextResponse.json({
        error: `Sorry, this trip has reached capacity. Only ${Math.max(0, trip.capacity - confirmedCount)} seats remain.`,
      }, { status: 409 });
    }

    // 3. Verify all selected seats are held by this bookingSessionId and not expired
    const now = new Date();
    const heldSeats = await db.busSeat.findMany({
      where: {
        busId,
        seatNumber: { in: selectedSeats },
        seatHold: {
          bookingSessionId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
      },
      include: { seatHold: true },
    });

    if (heldSeats.length !== selectedSeats.length) {
      return NextResponse.json({
        error: 'Your seat hold has expired or is invalid. Please select your seats again.',
      }, { status: 409 });
    }

    const primaryTraveller = travellers[0];

    // 4. Server-side calculate pricing strictly: ₹6,200 total, ₹1,000 reservation deposit per traveller
    const pricing = calculateBookingPricing({
      travellersCount: travellers.length,
    });

    // 5. Generate unique booking ID
    const bookingId = generateBookingId();

    // 6. Create Razorpay order for ₹1,000 * travellersCount reservation amount
    const orderResult = await createRazorpayOrder({
      amountInRupees: pricing.reservationAmount,
      receipt: `RCPT-${bookingId}`,
      notes: {
        bookingId,
        travellersCount: String(travellers.length),
        seats: selectedSeats.join(','),
      },
    });

    // 7. Find default package ID
    const selectedPackage = trip.packages[0] || (await db.package.findFirst({ where: { tripId: trip.id } }));
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Package not configured' }, { status: 500 });
    }

    // Check customer user session if available
    const customerUser = await getUserSessionFromRequest(request);

    // 8. Persist pending Booking and Travellers in database
    const txResult = await db.$transaction(async (tx) => {
      // Find or create User for customer if needed
      let linkedUserId = customerUser?.id;
      if (!linkedUserId && primaryTraveller.email) {
        const existing = await tx.user.findUnique({ where: { email: primaryTraveller.email.toLowerCase().trim() } });
        if (existing) {
          linkedUserId = existing.id;
        } else {
          const newUser = await tx.user.create({
            data: {
              email: primaryTraveller.email.toLowerCase().trim(),
              name: primaryTraveller.fullName,
              phone: primaryTraveller.phone,
              role: 'TRAVELLER',
            },
          });
          linkedUserId = newUser.id;
        }
      }

      const booking = await tx.booking.create({
        data: {
          bookingId,
          tripId: trip.id,
          packageId: selectedPackage.id,
          userId: linkedUserId,
          primaryTravellerName: primaryTraveller.fullName,
          primaryEmail: primaryTraveller.email.toLowerCase().trim(),
          primaryPhone: primaryTraveller.phone,
          gender: primaryTraveller.gender || 'NOT_SPECIFIED',
          emergencyContactName: emergencyContactName || primaryTraveller.emergencyContactName || primaryTraveller.fullName,
          emergencyContactPhone: emergencyContactPhone || primaryTraveller.emergencyContactPhone || primaryTraveller.phone,
          sittingPreference,
          travellersCount: travellers.length,
          totalAmount: pricing.totalAmount,
          reservationAmount: pricing.reservationAmount,
          discountAmount: 0,
          finalAmount: pricing.finalAmount,
          remainingBalance: pricing.remainingBalance,
          paymentStatus: 'PENDING',
          bookingStatus: 'PENDING',
          busId,
        },
      });

      // Create travellers
      for (let i = 0; i < travellers.length; i++) {
        const t = travellers[i];
        const assignedSeat = selectedSeats[i];

        await tx.traveller.create({
          data: {
            bookingId: booking.id,
            fullName: t.fullName,
            phone: t.phone,
            email: t.email,
            gender: t.gender,
            emergencyContactName: t.emergencyContactName || emergencyContactName,
            emergencyContactPhone: t.emergencyContactPhone || emergencyContactPhone,
            assignedSeatNumber: assignedSeat,
          },
        });
      }

      // Record pending payment
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          razorpayOrderId: orderResult.orderId,
          amount: pricing.reservationAmount,
          currency: 'INR',
          paymentType: 'RESERVATION',
          status: 'PENDING',
        },
      });

      return {
        bookingDbId: booking.id,
      };
    }, { timeout: 15000, maxWait: 10000 });

    // Asynchronously log outside transaction
    createAuditLog({
      action: 'BOOKING_INITIATED',
      entityType: 'BOOKING',
      entityId: txResult.bookingDbId,
      bookingId,
      performedBy: primaryTraveller.fullName,
      metadata: {
        seats: selectedSeats,
        amount: pricing.reservationAmount,
        orderId: orderResult.orderId,
      },
    }).catch((e) => console.error('Audit log error:', e));

    return NextResponse.json({
      success: true,
      bookingId,
      razorpayOrderId: orderResult.orderId,
      amount: pricing.reservationAmount,
      amountInPaise: Math.round(pricing.reservationAmount * 100),
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      isMock: orderResult.isMock,
      pricing,
    });
  } catch (error: unknown) {
    console.error('Error creating booking order:', error);
    const message = error instanceof Error ? error.message : 'Failed to create booking order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
