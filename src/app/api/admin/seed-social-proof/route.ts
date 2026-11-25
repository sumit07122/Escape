export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    const adminSecretHeader = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'Trip@2026';

    const isAuthorized = !!admin || (adminSecretHeader && adminSecretHeader === expectedSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Master Trip
    const trip = await db.trip.findFirst();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // 2. Fetch Packages
    let packageSingle = await db.package.findFirst({ where: { tripId: trip.id, slug: 'single-traveller' } });
    if (!packageSingle) {
      packageSingle = await db.package.findFirst({ where: { tripId: trip.id } });
    }
    if (!packageSingle) {
      packageSingle = await db.package.create({
        data: {
          tripId: trip.id,
          name: 'Single Explorer',
          slug: 'single-traveller',
          price: 6200,
          reservationAmount: 1000,
          travellersCount: 1,
        },
      });
    }

    let packageDuo = await db.package.findFirst({ where: { tripId: trip.id, slug: 'duo-package' } });
    if (!packageDuo) {
      packageDuo = await db.package.create({
        data: {
          tripId: trip.id,
          name: 'Duo Travellers',
          slug: 'duo-package',
          price: 11998,
          reservationAmount: 2000,
          travellersCount: 2,
        },
      });
    }

    // 3. Find Bus 01
    const bus1 = await db.bus.findFirst({
      where: { tripId: trip.id, busNumber: 'BUS-01' },
      include: { seats: true },
    });

    if (!bus1) {
      return NextResponse.json({ error: 'Bus 01 not found' }, { status: 404 });
    }

    // Define initial bookings for social proof
    const sampleGroups = [
      {
        bookingId: 'HE-GLA-0102',
        packageId: packageDuo.id,
        travellersCount: 2,
        totalAmount: 11998,
        reservationAmount: 2000,
        remainingBalance: 9998,
        primaryName: 'Aarav Sharma',
        primaryEmail: 'aarav.sharma@gla.ac.in',
        primaryPhone: '+91 98765 43210',
        seatNumbers: ['L1', 'L2'],
        travellers: [
          { fullName: 'Aarav Sharma', phone: '+91 98765 43210', email: 'aarav.sharma@gla.ac.in', collegeId: 'GLA-CS-22', rollNumber: '2215000184', seat: 'L1', gender: 'MALE' },
          { fullName: 'Rohan Verma', phone: '+91 98765 43211', email: 'rohan.verma@gla.ac.in', collegeId: 'GLA-CS-22', rollNumber: '2215000219', seat: 'L2', gender: 'MALE' },
        ],
      },
      {
        bookingId: 'HE-GLA-0104',
        packageId: packageDuo.id,
        travellersCount: 2,
        totalAmount: 11998,
        reservationAmount: 2000,
        remainingBalance: 9998,
        primaryName: 'Priya Patel',
        primaryEmail: 'priya.patel@gla.ac.in',
        primaryPhone: '+91 98765 43212',
        seatNumbers: ['R3', 'R4'],
        travellers: [
          { fullName: 'Priya Patel', phone: '+91 98765 43212', email: 'priya.patel@gla.ac.in', collegeId: 'GLA-BT-22', rollNumber: '2215000412', seat: 'R3', gender: 'FEMALE' },
          { fullName: 'Sneha Gupta', phone: '+91 98765 43213', email: 'sneha.gupta@gla.ac.in', collegeId: 'GLA-BT-22', rollNumber: '2215000455', seat: 'R4', gender: 'FEMALE' },
        ],
      },
      {
        bookingId: 'HE-GLA-0105',
        packageId: packageSingle.id,
        travellersCount: 1,
        totalAmount: 6200,
        reservationAmount: 1000,
        remainingBalance: 5200,
        primaryName: 'Kavya Mishra',
        primaryEmail: 'kavya.mishra@gla.ac.in',
        primaryPhone: '+91 98765 43214',
        seatNumbers: ['L5'],
        travellers: [
          { fullName: 'Kavya Mishra', phone: '+91 98765 43214', email: 'kavya.mishra@gla.ac.in', collegeId: 'GLA-BBA-23', rollNumber: '2315000112', seat: 'L5', gender: 'FEMALE' },
        ],
      },
      {
        bookingId: 'HE-GLA-0107',
        packageId: packageSingle.id,
        travellersCount: 1,
        totalAmount: 6200,
        reservationAmount: 1000,
        remainingBalance: 5200,
        primaryName: 'Aditya Singh',
        primaryEmail: 'aditya.singh@gla.ac.in',
        primaryPhone: '+91 98765 43215',
        seatNumbers: ['R7'],
        travellers: [
          { fullName: 'Aditya Singh', phone: '+91 98765 43215', email: 'aditya.singh@gla.ac.in', collegeId: 'GLA-ME-22', rollNumber: '2215000670', seat: 'R7', gender: 'MALE' },
        ],
      },
      {
        bookingId: 'HE-GLA-0110',
        packageId: packageDuo.id,
        travellersCount: 2,
        totalAmount: 11998,
        reservationAmount: 2000,
        remainingBalance: 9998,
        primaryName: 'Aryan Verma',
        primaryEmail: 'aryan.verma@gla.ac.in',
        primaryPhone: '+91 98765 43216',
        seatNumbers: ['B1', 'B2'],
        travellers: [
          { fullName: 'Aryan Verma', phone: '+91 98765 43216', email: 'aryan.verma@gla.ac.in', collegeId: 'GLA-BCA-23', rollNumber: '2315000305', seat: 'B1', gender: 'MALE' },
          { fullName: 'Harshit Agrawal', phone: '+91 98765 43217', email: 'harshit.agrawal@gla.ac.in', collegeId: 'GLA-BCA-23', rollNumber: '2315000342', seat: 'B2', gender: 'MALE' },
        ],
      },
    ];

    let createdBookingsCount = 0;
    let bookedSeatsCount = 0;

    for (const group of sampleGroups) {
      // Check if booking already exists
      let booking = await db.booking.findUnique({
        where: { bookingId: group.bookingId },
      });

      if (!booking) {
        booking = await db.booking.create({
          data: {
            bookingId: group.bookingId,
            tripId: trip.id,
            packageId: group.packageId,
            primaryTravellerName: group.primaryName,
            primaryEmail: group.primaryEmail,
            primaryPhone: group.primaryPhone,
            emergencyContactName: 'Campus Guardian',
            emergencyContactPhone: '+91 98765 00000',
            travellersCount: group.travellersCount,
            totalAmount: group.totalAmount,
            reservationAmount: group.reservationAmount,
            finalAmount: group.totalAmount,
            remainingBalance: group.remainingBalance,
            paymentStatus: 'PAID',
            bookingStatus: 'CONFIRMED',
            busId: bus1.id,
          },
        });
        createdBookingsCount++;
      }

      for (const t of group.travellers) {
        // Create or find traveller
        let traveller = await db.traveller.findFirst({
          where: { bookingId: booking.id, email: t.email },
        });

        if (!traveller) {
          traveller = await db.traveller.create({
            data: {
              bookingId: booking.id,
              fullName: t.fullName,
              phone: t.phone,
              email: t.email,
              gender: t.gender,
              assignedSeatNumber: t.seat,
              assignedBusNumber: 'BUS-01',
              collegeId: t.collegeId,
              rollNumber: t.rollNumber,
            },
          });
        }

        // Find the bus seat
        const seat = bus1.seats.find((s) => s.seatNumber === t.seat);
        if (seat) {
          // Check if seatBooking exists
          const existingSeatBooking = await db.seatBooking.findUnique({
            where: { busSeatId: seat.id },
          });

          if (!existingSeatBooking) {
            await db.seatBooking.create({
              data: {
                busSeatId: seat.id,
                bookingId: booking.id,
                travellerId: traveller.id,
                status: 'CONFIRMED',
              },
            });
          }

          // Mark seat as BOOKED
          await db.busSeat.update({
            where: { id: seat.id },
            data: {
              status: 'BOOKED',
              isAvailable: false,
              isBookable: true,
            },
          });
          bookedSeatsCount++;
        }
      }
    }

    revalidatePath('/book');
    revalidatePath('/api/buses');
    revalidatePath('/api/seats/status');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Seeded ${bookedSeatsCount} initial student seats on Bus 01 (${createdBookingsCount} bookings created)`,
      busNumber: 'BUS-01',
      bookedSeats: ['L1', 'L2', 'R3', 'R4', 'L5', 'R7', 'B1', 'B2'],
      remainingAvailableOnBus01: 25 - 8,
    });
  } catch (error: any) {
    console.error('Error seeding social proof:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed social proof' }, { status: 500 });
  }
}
