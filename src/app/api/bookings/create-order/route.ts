import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateBookingPricing } from '@/lib/pricing';
import { createRazorpayOrder } from '@/lib/razorpay';
import { generateBookingId } from '@/lib/qr';
import { cleanExpiredHolds, createAuditLog } from '@/lib/server-utils';
import { PackageType, TravellerInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageType,
      travellers,
      sittingPreference = 'NO_PREFERENCE',
      busId,
      selectedSeats,
      bookingSessionId,
      referralCode,
      emergencyContactName,
      emergencyContactPhone,
    } = body;

    if (!packageType || !busId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return NextResponse.json({ error: 'Missing package, bus or seat selection' }, { status: 400 });
    }

    if (!travellers || !Array.isArray(travellers) || travellers.length === 0) {
      return NextResponse.json({ error: 'Traveller details are required' }, { status: 400 });
    }

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is missing' }, { status: 400 });
    }

    // Couple booking validation: exactly 2 travellers and 2 seats
    if (packageType === 'COUPLE') {
      if (travellers.length !== 2 || selectedSeats.length !== 2) {
        return NextResponse.json({ error: 'Couple package requires exactly 2 travellers and 2 seats' }, { status: 400 });
      }
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
        packages: { where: { slug: (packageType as string).toLowerCase() } },
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

    // 4. Validate referral code (prevent self-referral)
    const primaryTraveller = travellers[0];
    let validReferralPercent = 0;
    let cleanReferralCode: string | undefined = undefined;

    if (referralCode && typeof referralCode === 'string') {
      const codeUpper = referralCode.trim().toUpperCase();
      const ref = await db.referral.findUnique({ where: { code: codeUpper } });
      if (ref && ref.isActive && ref.ownerPhone !== primaryTraveller.phone.trim()) {
        validReferralPercent = ref.discountPercentage;
        cleanReferralCode = codeUpper;
      }
    }

    // 5. Server-side calculate pricing
    const pricing = calculateBookingPricing({
      packageType: packageType as PackageType,
      travellersCount: travellers.length,
      referralCode: cleanReferralCode,
      validReferralPercent,
    });

    // 6. Generate unique booking ID
    const bookingId = generateBookingId();

    // 7. Create Razorpay order for ₹1,000 reservation amount
    const orderResult = await createRazorpayOrder({
      amountInRupees: pricing.reservationAmount,
      receipt: `RCPT-${bookingId}`,
      notes: {
        bookingId,
        packageType,
        travellersCount: String(travellers.length),
        seats: selectedSeats.join(','),
      },
    });

    // 8. Find matching package ID
    const selectedPackage = trip.packages[0] || (await db.package.findFirst({ where: { tripId: trip.id } }));
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Package not configured' }, { status: 500 });
    }

    // 9. Persist pending Booking and Travellers in database
    await db.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingId,
          tripId: trip.id,
          packageId: selectedPackage.id,
          primaryTravellerName: primaryTraveller.fullName,
          primaryEmail: primaryTraveller.email,
          primaryPhone: primaryTraveller.phone,
          gender: primaryTraveller.gender || 'NOT_SPECIFIED',
          emergencyContactName: emergencyContactName || primaryTraveller.emergencyContactName || primaryTraveller.fullName,
          emergencyContactPhone: emergencyContactPhone || primaryTraveller.emergencyContactPhone || primaryTraveller.phone,
          sittingPreference,
          travellersCount: travellers.length,
          totalAmount: pricing.baseAmount,
          reservationAmount: pricing.reservationAmount,
          discountAmount: pricing.referralDiscountAmount + pricing.groupDiscountAmount,
          finalAmount: pricing.finalAmount,
          remainingBalance: pricing.remainingBalance,
          paymentStatus: 'PENDING',
          bookingStatus: 'PENDING',
          busId,
          referralCodeUsed: cleanReferralCode,
          isGroupOffer: pricing.isGroupOffer,
        },
      });

      // Create travellers
      for (let i = 0; i < travellers.length; i++) {
        const t = travellers[i];
        const assignedSeat = selectedSeats[i];
        const isFree = pricing.isGroupOffer && i >= pricing.paidTravellersCount;

        await tx.traveller.create({
          data: {
            bookingId: booking.id,
            fullName: t.fullName,
            phone: t.phone,
            email: t.email,
            gender: t.gender,
            emergencyContactName: t.emergencyContactName || emergencyContactName,
            emergencyContactPhone: t.emergencyContactPhone || emergencyContactPhone,
            isFreeGroupTraveller: isFree,
            assignedSeatNumber: assignedSeat,
          },
        });
      }

      // If group booking, create group record
      if (pricing.isGroupOffer) {
        await tx.groupBooking.create({
          data: {
            bookingId: booking.id,
            groupName: `${primaryTraveller.fullName}'s Squad`,
            paidTravellers: pricing.paidTravellersCount,
            freeTravellers: pricing.freeTravellersCount,
            totalSeatsOccupied: travellers.length,
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

      await createAuditLog({
        action: 'BOOKING_INITIATED',
        entityType: 'BOOKING',
        entityId: booking.id,
        bookingId,
        performedBy: primaryTraveller.fullName,
        metadata: {
          packageType,
          seats: selectedSeats,
          amount: pricing.reservationAmount,
          orderId: orderResult.orderId,
        },
      });
    });

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
