export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';
import { generateBookingId } from '@/lib/qr';
import { cleanExpiredHolds, createAuditLog } from '@/lib/server-utils';
import { TravellerInput } from '@/types';
import { getUserSessionFromRequest } from '@/lib/auth';
import { getTripConfig } from '@/lib/trip-config';
import { calculateDynamicBookingPricing } from '@/lib/pricing';
import { findBestAdjacentSeats, calculateHoldExpiration } from '@/lib/bus-seating';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      travellers,
      sittingPreference = 'NO_PREFERENCE',
      busId,
      selectedSeats,
      bookingSessionId,
      couponCode,
    } = body;

    if (!travellers || !Array.isArray(travellers) || travellers.length === 0) {
      return NextResponse.json({ error: 'Traveller details are required' }, { status: 400 });
    }

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is missing' }, { status: 400 });
    }

    // Auto-allocate seats if not explicitly provided
    if (!busId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      const activeBuses = await db.bus.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { busNumber: 'asc' },
        include: {
          seats: {
            where: { isBookable: true },
            include: { seatHold: true, seatBooking: true },
          },
        },
      });

      const now = new Date();
      let assignedBusId: string | null = null;
      let assignedSeats: string[] = [];

      for (const b of activeBuses) {
        const avail = b.seats
          .filter(
            (s) =>
              !s.seatBooking &&
              s.status !== 'BOOKED' &&
              s.status !== 'BLOCKED' &&
              (!s.seatHold ||
                s.seatHold.status !== 'ACTIVE' ||
                s.seatHold.expiresAt <= now ||
                s.seatHold.bookingSessionId === bookingSessionId)
          )
          .map((s) => s.seatNumber);

        if (avail.length >= travellers.length) {
          const target = findBestAdjacentSeats(avail, travellers.length, sittingPreference);
          if (target.length === travellers.length) {
            assignedBusId = b.id;
            assignedSeats = target;

            // Atomically create hold for these seats
            const expiresAt = calculateHoldExpiration(10);
            for (const seatNumber of target) {
              const busSeat = await db.busSeat.findUnique({
                where: { busId_seatNumber: { busId: b.id, seatNumber } },
              });
              if (busSeat) {
                await db.seatHold.upsert({
                  where: { busSeatId: busSeat.id },
                  update: { bookingSessionId, status: 'ACTIVE', expiresAt },
                  create: { busSeatId: busSeat.id, bookingSessionId, status: 'ACTIVE', expiresAt },
                });
                await db.busSeat.update({
                  where: { id: busSeat.id },
                  data: { status: 'HELD', isAvailable: false },
                });
              }
            }
            break;
          }
        }
      }

      if (!assignedBusId || assignedSeats.length < travellers.length) {
        return NextResponse.json(
          { error: 'Could not automatically allocate seats. Please select seats from the seat map.' },
          { status: 409 }
        );
      }

      busId = assignedBusId;
      selectedSeats = assignedSeats;
    }

    // Number of seats must equal number of travellers
    if (selectedSeats.length !== travellers.length) {
      return NextResponse.json({
        error: `Seat selection mismatch: ${selectedSeats.length} seats selected for ${travellers.length} travellers`,
      }, { status: 400 });
    }

    for (const [index, traveller] of travellers.entries()) {
      const contactName = typeof traveller?.emergencyContactName === 'string' ? traveller.emergencyContactName.trim() : '';
      const contactPhone = typeof traveller?.emergencyContactPhone === 'string' ? traveller.emergencyContactPhone.trim() : '';
      if (!contactName || contactPhone.replace(/\D/g, '').length < 10) {
        return NextResponse.json({
          error: `A valid emergency contact name and 10-digit phone number are required for Traveller #${index + 1}.`,
        }, { status: 400 });
      }
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

    const primaryTraveller = travellers[0];

    // 3. Atomically verify and refresh seat availability & holds for this booking session
    const now = new Date();
    const targetBusSeats = await db.busSeat.findMany({
      where: {
        busId,
        seatNumber: { in: selectedSeats },
      },
      include: { seatHold: true, seatBooking: true },
    });

    if (targetBusSeats.length !== selectedSeats.length) {
      return NextResponse.json({
        error: 'One or more selected seats could not be found on this coach. Please re-select your seats.',
      }, { status: 404 });
    }

    // Check for conflicting holds or confirmed bookings by other users
    const occupiedByOthers = targetBusSeats.filter((seat) => {
      const isConfirmed = seat.seatBooking?.status === 'CONFIRMED' || seat.status === 'BOOKED';
      const isHeldByAnother =
        seat.seatHold &&
        seat.seatHold.bookingSessionId !== bookingSessionId &&
        seat.seatHold.status === 'ACTIVE' &&
        seat.seatHold.expiresAt > now;
      return isConfirmed || isHeldByAnother;
    });

    if (occupiedByOthers.length > 0) {
      const conflictSeatNames = occupiedByOthers.map((s) => s.seatNumber).join(', ');
      return NextResponse.json({
        error: `Seats [${conflictSeatNames}] were just reserved by another student. Please pick alternative seats.`,
      }, { status: 409 });
    }

    // Ensure all target seats have active holds for this bookingSessionId
    const holdExpiresAt = calculateHoldExpiration(10);
    for (const seat of targetBusSeats) {
      await db.seatHold.upsert({
        where: { busSeatId: seat.id },
        update: {
          bookingSessionId,
          status: 'ACTIVE',
          expiresAt: holdExpiresAt,
          travellerName: primaryTraveller.fullName,
        },
        create: {
          busSeatId: seat.id,
          bookingSessionId,
          status: 'ACTIVE',
          expiresAt: holdExpiresAt,
          travellerName: primaryTraveller.fullName,
        },
      });
      await db.busSeat.update({
        where: { id: seat.id },
        data: { status: 'HELD', isAvailable: false },
      });
    }

    const heldSeats = await db.busSeat.findMany({
      where: {
        busId,
        seatNumber: { in: selectedSeats },
      },
      include: { seatHold: true },
    });

    // 4. Strict Server-Side Tiered Squad Calculation
    const travellersCount = travellers.length;
    const calculatedPricing = await calculateDynamicBookingPricing({
      travellersCount,
      couponCode,
    });
    const depositAmount = calculatedPricing.reservationAmount;
    const totalPackage = calculatedPricing.totalAmount;
    const baseTotal = calculatedPricing.baseAmount;
    const balanceDue = calculatedPricing.remainingBalance;
    const discountAmount = calculatedPricing.discountAmount;

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
        emergencyContactName: primaryTraveller.emergencyContactName.trim(),
        emergencyContactPhone: primaryTraveller.emergencyContactPhone.trim(),
        sittingPreference: sittingPreference || 'NO_PREFERENCE',
        travellersCount,
        totalAmount: baseTotal,
        reservationAmount: depositAmount,
        discountAmount: discountAmount,
        finalAmount: totalPackage,
        remainingBalance: balanceDue,
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        busId,
        notes: calculatedPricing.couponCode ? `Coupon applied: ${calculatedPricing.couponCode}` : undefined,
        travellers: {
          create: travellers.map((t: TravellerInput, index: number) => ({
            fullName: t.fullName || `Student ${index + 1}`,
            phone: t.phone || primaryTraveller.phone || '',
            email: t.email || primaryTraveller.email || '',
            gender: t.gender || 'NOT_SPECIFIED',
            collegeId: t.collegeId || (t as any).rollNumber || null,
            rollNumber: (t as any).rollNumber || t.collegeId || null,
            emergencyContactName: t.emergencyContactName!.trim(),
            emergencyContactPhone: t.emergencyContactPhone!.trim(),
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
        pricePerTraveller: calculatedPricing.pricePerTraveller,
        totalAmount: totalPackage,
        totalPackage,
        depositAmount,
        reservationAmount: depositAmount,
        balanceDue,
        remainingBalance: balanceDue,
        discount: discountAmount,
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
