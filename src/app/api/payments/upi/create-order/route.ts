export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateBookingId } from '@/lib/qr';
import { cleanExpiredHolds, createAuditLog } from '@/lib/server-utils';
import { TravellerInput } from '@/types';
import { getUserSessionFromRequest } from '@/lib/auth';
import { getTripConfig } from '@/lib/trip-config';
import { calculateDynamicBookingPricing } from '@/lib/pricing';
import { findBestAdjacentSeats, calculateHoldExpiration } from '@/lib/bus-seating';
import { createMicroGatewayOrder, generateUpiQrCode } from '@/lib/upi-gateway';

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

    // Pre-booking authentication gate
    const customerUser = await getUserSessionFromRequest(request);
    if (!customerUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or register before booking.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const travellersCount = travellers.length;
    await cleanExpiredHolds();

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

        if (avail.length >= travellersCount) {
          const target = findBestAdjacentSeats(avail, travellersCount, sittingPreference);
          if (target.length === travellersCount) {
            assignedBusId = b.id;
            assignedSeats = target;
            break;
          }
        }
      }

      if (!assignedBusId || assignedSeats.length < travellersCount) {
        return NextResponse.json(
          { error: `Unable to find ${travellersCount} available seats together on any coach.` },
          { status: 400 }
        );
      }

      busId = assignedBusId;
      selectedSeats = assignedSeats;
    }

    // Verify seat holds
    const heldSeats = await db.busSeat.findMany({
      where: {
        busId,
        seatNumber: { in: selectedSeats },
      },
      include: { seatHold: true, seatBooking: true },
    });

    if (heldSeats.length !== selectedSeats.length) {
      return NextResponse.json({ error: 'Some selected seats were not found on this coach.' }, { status: 400 });
    }

    const now = new Date();
    for (const seat of heldSeats) {
      if (seat.seatBooking || seat.status === 'BOOKED' || seat.status === 'BLOCKED') {
        return NextResponse.json(
          { error: `Seat ${seat.seatNumber} is already permanently booked.` },
          { status: 409 }
        );
      }
      if (
        seat.seatHold &&
        seat.seatHold.status === 'ACTIVE' &&
        seat.seatHold.expiresAt > now &&
        seat.seatHold.bookingSessionId !== bookingSessionId
      ) {
        return NextResponse.json(
          { error: `Seat ${seat.seatNumber} is currently held by another traveller.` },
          { status: 409 }
        );
      }
    }

    // Extend or create active holds for this session
    const holdExpiration = calculateHoldExpiration();
    for (const seat of heldSeats) {
      if (seat.seatHold) {
        await db.seatHold.update({
          where: { id: seat.seatHold.id },
          data: {
            bookingSessionId,
            expiresAt: holdExpiration,
            status: 'ACTIVE',
          },
        });
      } else {
        await db.seatHold.create({
          data: {
            busSeatId: seat.id,
            bookingSessionId,
            expiresAt: holdExpiration,
            status: 'ACTIVE',
          },
        });
      }
    }

    // Canonical Pricing Calculation
    const calculatedPricing = await calculateDynamicBookingPricing({
      travellersCount,
      couponCode,
    });

    const depositAmount = calculatedPricing.reservationAmount;
    const totalPackage = calculatedPricing.totalAmount;
    const baseTotal = calculatedPricing.baseAmount;
    const discountAmount = calculatedPricing.discountAmount;
    const balanceDue = calculatedPricing.remainingBalance;

    const primaryTraveller = travellers[0];
    const generatedId = generateBookingId();
    const orderId = `UPI-${generatedId}-${Date.now()}`;

    // Get active trip and default package
    const activeTrip =
      (await db.trip.findFirst({
        where: { status: 'OPEN_FOR_BOOKING' },
        include: { packages: true },
      })) ||
      (await db.trip.findFirst({
        include: { packages: true },
      }));

    if (!activeTrip || !activeTrip.packages || activeTrip.packages.length === 0) {
      return NextResponse.json(
        { error: 'Trip package configuration is currently unavailable. Please contact the coordinator.' },
        { status: 500 }
      );
    }
    const selectedPackage = activeTrip.packages[0];

    // Create Booking and Pending Payment record
    const booking = await db.booking.create({
      data: {
        bookingId: generatedId,
        tripId: activeTrip.id,
        packageId: selectedPackage.id,
        userId: customerUser.id,
        primaryTravellerName: primaryTraveller.fullName || 'Lead Traveller',
        primaryPhone: primaryTraveller.phone || primaryTraveller.emergencyContactPhone || '0000000000',
        primaryEmail: primaryTraveller.email || customerUser.email || `${customerUser.phone}@phone.himalayaescape.invalid`,
        gender: primaryTraveller.gender || 'NOT_SPECIFIED',
        emergencyContactName: primaryTraveller.emergencyContactName?.trim() || 'Parent / Guardian',
        emergencyContactPhone: primaryTraveller.emergencyContactPhone?.trim() || '9999999999',
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
        notes: couponCode ? `Coupon: ${couponCode}` : undefined,
        travellers: {
          create: travellers.map((t: TravellerInput, index: number) => ({
            fullName: t.fullName || `Student ${index + 1}`,
            phone: t.phone || primaryTraveller.phone || '',
            email: t.email || primaryTraveller.email || '',
            gender: t.gender || 'NOT_SPECIFIED',
            collegeId: t.collegeId || (t as any).rollNumber || null,
            rollNumber: (t as any).rollNumber || t.collegeId || null,
            emergencyContactName: t.emergencyContactName?.trim() || 'Parent / Guardian',
            emergencyContactPhone: t.emergencyContactPhone?.trim() || '9999999999',
            assignedSeatNumber: selectedSeats[index],
            assignedBusNumber: heldSeats[0]?.busId === busId ? 'Assigned' : null,
          })),
        },
        payments: {
          create: {
            razorpayOrderId: orderId,
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
        payments: true,
      },
    });

    // Query custom UPI VPA from settings if configured
    let customVpa = process.env.NEXT_PUBLIC_DEFAULT_UPI_VPA || process.env.DEFAULT_UPI_VPA || 'gdark909@okicici';
    try {
      const upiSetting = await db.settings.findUnique({ where: { key: 'upi_vpa' } });
      if (upiSetting?.value?.trim()) {
        customVpa = upiSetting.value.trim();
      }
    } catch {}

    // Generate UPI Payload & dynamic QR Code
    const upiPayload = await createMicroGatewayOrder({
      vpa: customVpa,
      amount: depositAmount,
      bookingId: booking.bookingId,
      orderId,
      customerName: primaryTraveller.fullName,
      customerEmail: primaryTraveller.email || customerUser.email,
      customerPhone: primaryTraveller.phone,
    });

    const qrDataUrl = await generateUpiQrCode(upiPayload.upiString);

    await createAuditLog({
      action: 'UPI_ORDER_CREATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      bookingId: booking.bookingId,
      performedBy: primaryTraveller.email || customerUser.email || 'STUDENT',
      newValue: `Created UPI Order ${orderId} for ₹${depositAmount} deposit across ${travellersCount} travellers.`,
      metadata: { orderId, seats: selectedSeats, vpa: upiPayload.vpa },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.bookingId,
      orderId,
      amount: depositAmount,
      vpa: upiPayload.vpa,
      payeeName: upiPayload.payeeName,
      upiString: upiPayload.upiString,
      qrDataUrl,
      intentLinks: upiPayload.intentLinks,
      expiresAt: holdExpiration.toISOString(),
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
    });
  } catch (error: any) {
    console.error('[API_CREATE_UPI_ORDER_ERROR]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize UPI payment order' },
      { status: 500 }
    );
  }
}
