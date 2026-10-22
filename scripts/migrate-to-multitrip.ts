/**
 * Non-destructive Multi-Trip Migration Script
 * 
 * Objectives:
 * 1. Seed the default "Standard Tourist Coach (25 Seats)" BusTemplate.
 * 2. Upsert primary Trip: slug "manali-kasol", Name "GLA Himalayan Escape (Manali × Kasol)", capacity 75, package price 6200, reservation deposit 1000.
 * 3. Associate all 4 buses (Bus 01 to 04) with the "manali-kasol" trip and link to the BusTemplate.
 * 4. Associate all 12 existing bookings, 18 travellers, and tickets with the "manali-kasol" trip.
 * 5. Synchronize SeatHolds with tripId, busId, and seatId.
 * 6. Populate/verify inclusions, exclusions, and all 6 itinerary days and items under the trip.
 * 7. Seed default HotelAllocation records for Manali & Kasol.
 * 8. Comprehensive verification and assertion checks ensuring zero data loss.
 */

import { PrismaClient } from '@prisma/client';
import {
  ITINERARY_DAYS,
  INCLUSIONS_LIST,
  EXCLUSIONS_LIST,
  BUS_25_SEATS_LAYOUT,
  TRIP_METADATA,
  PRICING_DEFAULTS,
} from '../src/lib/constants';

const prisma = new PrismaClient();

async function runMultiTripMigration() {
  console.log('\n======================================================');
  console.log('🏔️ STARTING NON-DESTRUCTIVE MULTI-TRIP MIGRATION');
  console.log('======================================================\n');

  // Baseline Verification
  const initialTripCount = await prisma.trip.count();
  const initialBusCount = await prisma.bus.count();
  const initialSeatCount = await prisma.busSeat.count();
  const initialBookingCount = await prisma.booking.count();
  const initialTravellerCount = await prisma.traveller.count();
  const initialTicketCount = await prisma.ticket.count();
  const initialItineraryDayCount = await prisma.itineraryDay.count();

  console.log('📊 Baseline Snapshot Before Migration:');
  console.log({
    trips: initialTripCount,
    buses: initialBusCount,
    seats: initialSeatCount,
    bookings: initialBookingCount,
    travellers: initialTravellerCount,
    tickets: initialTicketCount,
    itineraryDays: initialItineraryDayCount,
  });

  // -----------------------------------------------------------------
  // STEP 1: Seed / Upsert the Default BusTemplate
  // -----------------------------------------------------------------
  console.log('\n[1/6] Seeding "Standard Tourist Coach (25 Seats)" BusTemplate...');
  const busTemplate = await prisma.busTemplate.upsert({
    where: { slug: 'standard-coach-25' },
    update: {
      name: 'Standard Tourist Coach (25 Seats)',
      layoutType: '2x2_STANDARD',
      totalSeats: 25,
      passengerCapacity: 23,
      driverSeats: 1,
      conductorSeats: 1,
      description: 'Standard 2x2 luxury AC coach with 23 passenger seats, 1 driver, and 1 conductor seat.',
      seatLayoutJson: JSON.stringify(BUS_25_SEATS_LAYOUT),
    },
    create: {
      slug: 'standard-coach-25',
      name: 'Standard Tourist Coach (25 Seats)',
      layoutType: '2x2_STANDARD',
      totalSeats: 25,
      passengerCapacity: 23,
      driverSeats: 1,
      conductorSeats: 1,
      description: 'Standard 2x2 luxury AC coach with 23 passenger seats, 1 driver, and 1 conductor seat.',
      seatLayoutJson: JSON.stringify(BUS_25_SEATS_LAYOUT),
    },
  });
  console.log(`  ✓ BusTemplate ready: ${busTemplate.name} (${busTemplate.id})`);

  // -----------------------------------------------------------------
  // STEP 2: Upsert Primary Trip Record (manali-kasol)
  // -----------------------------------------------------------------
  console.log('\n[2/6] Upserting Primary Trip: "manali-kasol"...');
  const tripData = {
    slug: 'manali-kasol',
    name: 'GLA Himalayan Escape (Manali × Kasol)',
    title: 'GLA HIMALAYAN ESCAPE',
    shortName: 'Manali + Kasol',
    subtitle: 'Mountains. Friends. Adventure. Memories.',
    description: 'Experience 6 days of pure mountain freedom across snow-capped Himalayan peaks, Rohtang foothills, pine forests, and Parvati riverbanks with fellow GLA students.',
    duration: '6 DAYS • 5 NIGHTS',
    origin: 'GLA University, Mathura',
    destination: 'Manali & Kasol, Himachal Pradesh',
    startingLocation: 'GLA University, Mathura',
    category: 'Himalayan',
    capacity: 75,
    featured: true,
    heroImage: '/images/hero-himalayas.jpg',
    thumbnailImage: '/images/solang-valley.jpg',
    galleryImages: JSON.stringify([
      '/images/hero-himalayas.jpg',
      '/images/solang-valley.jpg',
      '/images/kasol-river.jpg',
    ]),
    packagePricePerTraveller: 6200,
    reservationAmountPerTraveller: 1000,
    packagePrice: 6200,
    reservationAmount: 1000,
    balanceDueDatePolicy: 'BEFORE_BOARDING',
    balanceDueType: 'BEFORE_BOARDING',
    balanceDueDaysBefore: 2,
    minTravellersPerBooking: 1,
    maxTravellersPerBooking: 6,
    seatSelectionEnabled: true,
    seatHoldDurationMinutes: 10,
    seatHoldMinutes: 10,
    seatAssignmentMode: 'MANUAL_SELECTION',
    inclusions: JSON.stringify(INCLUSIONS_LIST),
    exclusions: JSON.stringify(EXCLUSIONS_LIST),
    importantNotes: 'Original GLA University Student ID Card + Government ID mandatory. Reporting at GLA University Main Gate. 1 main luggage bag (up to 15kg) + 1 small cabin backpack.',
    importantInfo: JSON.stringify({
      reportingInstructions: 'Reporting at GLA University Main Gate at 07:30 PM. Digital QR pass scanning begins 1 hour prior to departure.',
      luggageRules: '1 main bag (up to 15kg) to be loaded into bus luggage hold, plus 1 small cabin backpack.',
      idRequirements: 'Original GLA University Student ID Card + Government ID (Aadhaar / Driving License / Voter ID) mandatory.',
      safetyNotes: 'Follow coordinator instructions. Alcohol/drugs strictly prohibited on GLA official university excursions.',
      weatherInfo: 'Manali and Kasol temperatures can drop to 2°C at night. Carry heavy thermals, jacket, gloves, and comfortable walking shoes.',
    }),
    cancellationPolicy: 'Full refund if cancelled 15+ days before departure. 50% refund between 7 to 14 days. Non-refundable within 7 days of departure.',
    pickupPoints: JSON.stringify([
      { location: 'GLA University Main Gate', time: '07:30 PM', instructions: 'Primary reporting & QR check-in desk' },
      { location: 'GLA Hostel Complex (Back Gate)', time: '08:15 PM', instructions: 'Luggage loading and secondary boarding' },
    ]),
    sittingPreferences: JSON.stringify(['WINDOW', 'AISLE', 'FRONT', 'BACK', 'NO_PREFERENCE']),
    startDate: new Date('2026-11-15T16:00:00Z'),
    endDate: new Date('2026-11-20T23:00:00Z'),
    status: 'OPEN_FOR_BOOKING',
  };

  const primaryTrip = await prisma.trip.upsert({
    where: { slug: 'manali-kasol' },
    update: tripData,
    create: tripData,
  });
  console.log(`  ✓ Primary Trip ready: ${primaryTrip.name} (${primaryTrip.id})`);

  // -----------------------------------------------------------------
  // STEP 3: Associate all Buses with Trip & Link Template
  // -----------------------------------------------------------------
  console.log('\n[3/6] Associating all existing 4 buses with primary trip & template...');
  const buses = await prisma.bus.findMany();
  for (const bus of buses) {
    await prisma.bus.update({
      where: { id: bus.id },
      data: {
        tripId: primaryTrip.id,
        templateId: busTemplate.id,
      },
    });
  }
  const updatedBuses = await prisma.bus.findMany({ where: { tripId: primaryTrip.id } });
  console.log(`  ✓ All ${updatedBuses.length} buses linked to trip: ${updatedBuses.map((b) => b.busNumber).join(', ')}`);

  // -----------------------------------------------------------------
  // STEP 4: Associate Bookings, Travellers, Tickets & SeatHolds
  // -----------------------------------------------------------------
  console.log('\n[4/6] Associating bookings, travellers, tickets, and seat holds with trip...');
  
  // 4a. Bookings
  const bookingUpdateResult = await prisma.booking.updateMany({
    data: { tripId: primaryTrip.id },
  });
  console.log(`  ✓ Updated ${bookingUpdateResult.count} bookings to tripId: ${primaryTrip.id}`);

  // 4b. Tickets
  const ticketUpdateResult = await prisma.ticket.updateMany({
    data: { tripId: primaryTrip.id },
  });
  console.log(`  ✓ Updated ${ticketUpdateResult.count} tickets to tripId: ${primaryTrip.id}`);

  // 4c. SeatHolds synchronization (busId, seatId, tripId)
  const seatHolds = await prisma.seatHold.findMany({
    include: { busSeat: true },
  });
  let updatedHoldsCount = 0;
  for (const hold of seatHolds) {
    await prisma.seatHold.update({
      where: { id: hold.id },
      data: {
        tripId: primaryTrip.id,
        busId: hold.busSeat?.busId || null,
        seatId: hold.busSeatId,
      },
    });
    updatedHoldsCount++;
  }
  console.log(`  ✓ Synchronized ${updatedHoldsCount} seat holds with tripId, busId, and seatId`);

  // -----------------------------------------------------------------
  // STEP 5: Itinerary Days & Items Population
  // -----------------------------------------------------------------
  console.log('\n[5/6] Populating / verifying 6-Day itinerary and schedule items...');
  for (const day of ITINERARY_DAYS) {
    const itineraryDay = await prisma.itineraryDay.upsert({
      where: {
        tripId_dayNumber: {
          tripId: primaryTrip.id,
          dayNumber: day.dayNumber,
        },
      },
      update: {
        title: day.title,
        subtitle: day.subtitle,
        stayLocation: day.stayLocation,
        mealsConfig: day.mealsConfig,
        description: day.description,
        isPublic: true,
      },
      create: {
        tripId: primaryTrip.id,
        dayNumber: day.dayNumber,
        title: day.title,
        subtitle: day.subtitle,
        stayLocation: day.stayLocation,
        mealsConfig: day.mealsConfig,
        description: day.description,
        isPublic: true,
      },
    });

    // Populate / update items for this day
    if (day.items && day.items.length > 0) {
      // Check existing items
      const existingItems = await prisma.itineraryItem.findMany({
        where: { dayId: itineraryDay.id },
      });

      if (existingItems.length === 0) {
        for (let i = 0; i < day.items.length; i++) {
          const item = day.items[i];
          await prisma.itineraryItem.create({
            data: {
              dayId: itineraryDay.id,
              time: item.time,
              location: item.location,
              activity: item.activity,
              description: item.description,
              isOptional: item.isOptional || false,
              orderIndex: i + 1,
            },
          });
        }
      }
    }
  }
  const totalDays = await prisma.itineraryDay.count({ where: { tripId: primaryTrip.id } });
  const totalItems = await prisma.itineraryItem.count();
  console.log(`  ✓ ${totalDays} Itinerary days and ${totalItems} items verified under trip.`);

  // -----------------------------------------------------------------
  // STEP 6: HotelAllocations Seeding
  // -----------------------------------------------------------------
  console.log('\n[6/6] Checking / seeding default HotelAllocations...');
  const existingHotelAllocations = await prisma.hotelAllocation.count({
    where: { tripId: primaryTrip.id },
  });

  if (existingHotelAllocations === 0) {
    await prisma.hotelAllocation.createMany({
      data: [
        {
          tripId: primaryTrip.id,
          hotelName: 'Snow Valley Resort Manali',
          location: 'Log Huts Area, Manali',
          roomType: 'Deluxe Triple Sharing',
          allocatedRooms: 20,
          capacity: 3,
          notes: 'Premium 3-star property with mountain valley views and buffet dining hall.',
        },
        {
          tripId: primaryTrip.id,
          hotelName: 'Parvati Kuteer Riverside Camps',
          location: 'Kasol, Parvati Valley',
          roomType: 'Riverside Triple Tents / Cottages',
          allocatedRooms: 15,
          capacity: 3,
          notes: 'Scenic camp/cottage setup along Parvati riverbank with private bonfire ground.',
        },
      ],
    });
    console.log('  ✓ Created 2 default HotelAllocation records (Manali & Kasol)');
  } else {
    console.log(`  ✓ ${existingHotelAllocations} HotelAllocation records already exist.`);
  }

  // -----------------------------------------------------------------
  // FINAL VERIFICATION & DATA INTEGRITY ASSERTIONS
  // -----------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🔍 RUNNING COMPREHENSIVE DATA INTEGRITY VERIFICATION');
  console.log('======================================================\n');

  const finalTrips = await prisma.trip.findMany({
    include: {
      buses: { include: { seats: true } },
      bookings: { include: { travellers: true, tickets: true } },
      itineraryDays: { include: { items: true } },
      hotelAllocations: true,
    },
  });

  const finalTrip = finalTrips.find((t) => t.slug === 'manali-kasol')!;
  const finalBusCount = await prisma.bus.count({ where: { tripId: finalTrip.id } });
  const finalSeatCount = await prisma.busSeat.count();
  const finalBookingCount = await prisma.booking.count({ where: { tripId: finalTrip.id } });
  const finalTravellerCount = await prisma.traveller.count();
  const finalTicketCount = await prisma.ticket.count({ where: { tripId: finalTrip.id } });
  const finalItineraryDayCount = await prisma.itineraryDay.count({ where: { tripId: finalTrip.id } });
  const finalTemplateCount = await prisma.busTemplate.count();
  const finalHotelAllocationCount = await prisma.hotelAllocation.count({ where: { tripId: finalTrip.id } });

  console.log('📊 Post-Migration Verification Counts:');
  console.log({
    tripsCount: finalTrips.length,
    busTemplates: finalTemplateCount,
    busesUnderTrip: finalBusCount,
    totalSeatsAcrossBuses: finalSeatCount,
    bookingsUnderTrip: finalBookingCount,
    totalTravellers: finalTravellerCount,
    ticketsUnderTrip: finalTicketCount,
    itineraryDaysUnderTrip: finalItineraryDayCount,
    hotelAllocationsUnderTrip: finalHotelAllocationCount,
  });

  // Strict Assertions
  let failed = false;
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed = true;
    }
  }

  assert(finalBusCount === 4, 'All 4 buses are associated with manali-kasol trip');
  assert(finalSeatCount === 100, 'All 100 seats remain intact across 4 buses');
  assert(finalBookingCount === initialBookingCount, `Zero bookings lost (${finalBookingCount} bookings intact)`);
  assert(finalTravellerCount === initialTravellerCount, `Zero travellers lost (${finalTravellerCount} travellers intact)`);
  assert(finalTicketCount === initialTicketCount, `Zero tickets lost (${finalTicketCount} tickets intact)`);
  assert(finalItineraryDayCount === 6, 'All 6 itinerary days are registered under manali-kasol trip');
  assert(finalTemplateCount >= 1, 'Standard Tourist Coach (25 Seats) BusTemplate exists');
  assert(finalTrip.packagePricePerTraveller === 6200, 'Trip package price per traveller is ₹6,200');
  assert(finalTrip.reservationAmountPerTraveller === 1000, 'Trip reservation deposit is ₹1,000');
  assert(finalTrip.capacity === 75, 'Trip capacity is 75');
  assert(finalTrip.seatSelectionEnabled === true, 'Seat selection is enabled');
  assert(finalTrip.seatHoldDurationMinutes === 10, 'Seat hold duration is 10 minutes');

  if (failed) {
    console.error('\n❌ MIGRATION COMPLETED WITH WARNINGS / FAILURES!');
    process.exit(1);
  } else {
    console.log('\n🎉 SUCCESS: Multi-trip architecture migration completed with 100% data integrity!');
  }
}

runMultiTripMigration()
  .catch((err) => {
    console.error('Fatal error during migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
