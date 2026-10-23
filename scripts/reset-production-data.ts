// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetProductionData() {
  console.log('\n======================================================');
  console.log('🧹 HIMALAYAN ESCAPE: PRODUCTION DATABASE RESET UTILITY');
  console.log('======================================================\n');

  try {
    // 1. Delete all transactional bookings and traveller artifacts in foreign key dependency order
    console.log('[1/4] Purging transactional booking and traveller records...');
    
    // Check-in scan records
    const deletedCheckIns = await prisma.checkIn.deleteMany({});
    console.log(`  ✓ Deleted ${deletedCheckIns.count} CheckIn records`);

    // Boarding pass tickets
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`  ✓ Deleted ${deletedTickets.count} Ticket records`);

    // Seat booking assignments
    const deletedSeatBookings = await prisma.seatBooking.deleteMany({});
    console.log(`  ✓ Deleted ${deletedSeatBookings.count} SeatBooking records`);

    // Temporary / active seat holds
    const deletedSeatHolds = await prisma.seatHold.deleteMany({});
    console.log(`  ✓ Deleted ${deletedSeatHolds.count} SeatHold records`);

    // Room assignments
    const deletedRoomAssignments = await prisma.roomAssignment.deleteMany({});
    console.log(`  ✓ Deleted ${deletedRoomAssignments.count} RoomAssignment records`);

    // Payments
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`  ✓ Deleted ${deletedPayments.count} Payment records`);

    // Travellers
    const deletedTravellers = await prisma.traveller.deleteMany({});
    console.log(`  ✓ Deleted ${deletedTravellers.count} Traveller records`);

    // Bookings
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`  ✓ Deleted ${deletedBookings.count} Booking records`);

    // 2. Reset all 100 BusSeats across all 4 coaches to AVAILABLE
    console.log('\n[2/4] Resetting all bus seats across the fleet...');
    
    // Reset passenger seats
    const resetPassengerSeats = await prisma.busSeat.updateMany({
      where: {
        seatType: 'PASSENGER',
      },
      data: {
        status: 'AVAILABLE',
        isAvailable: true,
        isBookable: true,
      },
    });
    console.log(`  ✓ Reset ${resetPassengerSeats.count} passenger seats to AVAILABLE`);

    // Ensure driver and conductor seats remain non-bookable
    const resetCabinSeats = await prisma.busSeat.updateMany({
      where: {
        seatType: { in: ['DRIVER', 'CONDUCTOR'] },
      },
      data: {
        status: 'UNAVAILABLE',
        isAvailable: false,
        isBookable: false,
      },
    });
    console.log(`  ✓ Ensured ${resetCabinSeats.count} cabin seats (driver/conductor) are UNAVAILABLE`);

    // 3. Verify the 4 buses (Bus 01 to Bus 04)
    console.log('\n[3/4] Verifying 4 expedition coaches (Bus 01 - Bus 04)...');
    const buses = await prisma.bus.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        seats: true,
      },
    });
    console.log(`  ✓ Active fleet count: ${buses.length} buses`);
    for (const bus of buses) {
      const passengerSeats = bus.seats.filter((s) => s.seatType === 'PASSENGER');
      const availableCount = passengerSeats.filter((s) => s.status === 'AVAILABLE').length;
      console.log(`    - ${bus.busNumber} (${bus.vehicleName}): ${availableCount}/${passengerSeats.length} passenger seats available`);
    }

    // 4. Ensure master Trip details (Manali × Kasol) are preserved
    console.log('\n[4/4] Preserving master Trip entity (Manali × Kasol)...');
    const trip = await prisma.trip.findUnique({
      where: { slug: 'manali-kasol' },
    });

    if (trip) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: {
          capacity: 75,
          packagePricePerTraveller: 6200,
          reservationAmountPerTraveller: 1000,
        },
      });
      console.log(`  ✓ Master Trip preserved: "${trip.name}" (Capacity: 75, Deposit: ₹1,000, Total: ₹6,200)`);
    } else {
      console.warn('  ⚠️ Master Trip "manali-kasol" not found; creating...');
      await prisma.trip.create({
        data: {
          slug: 'manali-kasol',
          name: 'Himalayan Escape — Student Mountain Expedition',
          title: 'HIMALAYAN ESCAPE (MANALI × KASOL)',
          duration: '6 DAYS / 5 NIGHTS',
          capacity: 75,
          packagePricePerTraveller: 6200,
          reservationAmountPerTraveller: 1000,
          startDate: new Date('2026-11-15T16:30:00.000Z'),
          endDate: new Date('2026-11-20T22:00:00.000Z'),
        },
      });
      console.log('  ✓ Master Trip created successfully.');
    }

    console.log('\n======================================================');
    console.log('✅ DATABASE RESET COMPLETED SAFELY & SUCCESSFULLY');
    console.log('   All test transactional records purged.');
    console.log('   Fleet restored to pristine 100% availability.');
    console.log('   Master trip & 75-passenger capacity preserved.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error executing database reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetProductionData();
