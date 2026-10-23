export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    // 1. Auto-purge expired holds before checking availability
    await cleanExpiredHolds();

    // 2. Fetch master trip and check dynamic capacity limit from GlobalSettings
    const [trip, globalSettings] = await Promise.all([
      db.trip.findFirst({
        include: {
          packages: true,
        },
      }),
      db.globalSettings.findFirst(),
    ]);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const capacityLimit = globalSettings?.tripCapacity ?? trip.capacity ?? 75;

    // Capacity ceiling: confirmed travellers count across trip
    const confirmedCount = await db.seatBooking.count({
      where: {
        status: 'CONFIRMED',
      },
    });

    if (confirmedCount + travellers.length > capacityLimit) {
      return NextResponse.json({
        error: 'Booking limit reached for this expedition. Please contact trip leads.',
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

    // 4. Strict Server-Side Calculation (Never trust client pricing)
    // depositAmount = travellers.length * 1000
    // totalPackage = travellers.length * 6200
    // balanceDue = totalPackage - depositAmount
    const travellersCount = travellers.length;
    const depositAmount = travellersCount * 1000;
    const totalPackage = travellersCount * 6200;
    const balanceDue = totalPackage - depositAmount;

    // 5. Generate unique booking ID
    const bookingId = generateBookingId();

    // 6. Create Razorpay order strictly for (depositAmount * 100) paise
    const orderResult = await createRazorpayOrder({
      amountInRupees: depositAmount,
      receipt: `RCPT-${bookingId}`,
      notes: {
        bookingId,
        travellersCount: String(travellersCount),
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

    // 8. Create booking record in database
    const booking = await db.booking.create({
      data: {
        bookingId,
        tripId: trip.id,
        packageId: selectedPackage.id,
        userId: customerUser?.id || null,
        primaryTravellerName: primaryTraveller.fullName || 'Primary Student',
        primaryEmail: primaryTraveller.email || customerUser?.email || 'student@gla.ac.in',
        primaryPhone: primaryTraveller.phone || '0000000000',
        gender: primaryTraveller.gender || 'NOT_SPECIFIED',
        emergencyContactName: emergencyContactName || primaryTraveller.emergencyContactName || 'University Coordinator',
        emergencyContactPhone: emergencyContactPhone || primaryTraveller.emergencyContactPhone || '7017936338',
        sittingPreference: sittingPreference || 'NO_PREFERENCE',
        travellersCount,
        totalAmount: totalPackage,
        reservationAmount: depositAmount,
        discountAmount: 0, // Profit-safe: Zero discounts
        finalAmount: totalPackage,
        remainingBalance: balanceDue,
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        busId,
        travellers: {
          create: travellers.map((t: TravellerInput, index: number) => ({
            fullName: t.fullName || `Student ${index + 1}`,
            phone: t.phone || primaryTraveller.phone || '',
            email: t.email || primaryTraveller.email || '',
            gender: t.gender || 'NOT_SPECIFIED',
            collegeId: t.collegeId || (t as any).rollNumber || null,
            rollNumber: (t as any).rollNumber || t.collegeId || null,
            emergencyContactName: emergencyContactName || t.emergencyContactName || primaryTraveller.emergencyContactName || '',
            emergencyContactPhone: emergencyContactPhone || t.emergencyContactPhone || primaryTraveller.emergencyContactPhone || '',
            assignedSeatNumber: selectedSeats[index],
            assignedBusNumber: heldSeats[0]?.busId === busId ? 'Assigned' : null,
          })),
        },
        payments: {
          create: {
            razorpayOrderId: orderResult.orderId,
            amount: depositAmount,
            currency: 'INR',
            paymentType: 'RESERVATION',
            status: 'PENDING',
          },
        },
      },
      include: {
        travellers: true,
        bus: true,
        package: true,
      },
    });

    // 9. Link seat holds to this newly created booking
    for (const seat of heldSeats) {
      if (seat.seatHold) {
        await db.seatHold.update({
          where: { id: seat.seatHold.id },
          data: { travellerName: primaryTraveller.fullName },
        });
      }
    }

    // 10. Audit log
    await createAuditLog({
      action: 'BOOKING_INITIATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      bookingId: booking.bookingId,
      performedBy: primaryTraveller.email || customerUser?.email || 'STUDENT',
      newValue: `Reservation Order created for ${travellersCount} travellers. Deposit: ₹${depositAmount}`,
      metadata: { orderId: orderResult.orderId, seats: selectedSeats },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.bookingId,
      razorpayOrderId: orderResult.orderId,
      amount: depositAmount,
      amountInPaise: Math.round(depositAmount * 100),
      currency: orderResult.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      isMock: orderResult.isMock,
      pricing: {
        travellersCount,
        pricePerTraveller: 6200,
        totalAmount: totalPackage,
        totalPackage,
        depositAmount,
        reservationAmount: depositAmount,
        balanceDue,
        remainingBalance: balanceDue,
        discount: 0,
      },
      booking: {
        id: booking.id,
        bookingId: booking.bookingId,
        primaryTravellerName: booking.primaryTravellerName,
        primaryEmail: booking.primaryEmail,
        primaryPhone: booking.primaryPhone,
        travellersCount: booking.travellersCount,
        busId: booking.busId,
        selectedSeats,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating booking order:', error);
    const message = error instanceof Error ? error.message : 'Internal server error while creating booking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
