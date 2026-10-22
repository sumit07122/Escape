import { PrismaClient } from '@prisma/client';
import { BUS_25_SEATS_LAYOUT, INITIAL_BUSES, ITINERARY_DAYS, PRICING_DEFAULTS, TRIP_METADATA, CONTACT_INFO } from '../lib/constants';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🏔️ Starting GLA Himalayan Escape database seed...');

  // 1. Seed or Upsert Admin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@glaescape.in';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'GLAAdmin@2026#Secure';
  const passwordHash = hashPassword(adminPassword);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'GLA Trip Lead Coordinator',
      role: 'SUPER_ADMIN',
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'GLA Trip Lead Coordinator',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✓ Admin user created/updated: ${admin.email}`);

  // 2. Seed Default Settings
  const defaultSettings = [
    { key: 'trip_name', value: TRIP_METADATA.name, category: 'GENERAL', description: 'Main expedition title' },
    { key: 'trip_subtitle', value: TRIP_METADATA.title, category: 'GENERAL', description: 'Expedition destination route' },
    { key: 'trip_duration', value: TRIP_METADATA.duration, category: 'GENERAL', description: 'Duration in days/nights' },
    { key: 'trip_capacity', value: String(TRIP_METADATA.capacity), category: 'PRICING', description: 'Total passenger capacity' },
    { key: 'price_single', value: String(PRICING_DEFAULTS.pricePerTraveller), category: 'PRICING', description: 'Price per traveller in INR (Single source of truth)' },
    { key: 'price_reservation', value: String(PRICING_DEFAULTS.reservationAmountPerTraveller), category: 'PRICING', description: 'Reservation amount per traveller in INR' },
    { key: 'price_remaining', value: String(PRICING_DEFAULTS.remainingBalancePerTraveller), category: 'PRICING', description: 'Remaining balance per traveller in INR' },
    { key: 'seat_hold_minutes', value: String(PRICING_DEFAULTS.seatHoldMinutes), category: 'BUS', description: 'Temporary seat hold duration in minutes' },
    { key: 'contact_phone_1', value: CONTACT_INFO.coordinatorPhone1, category: 'CONTACTS', description: 'Primary coordinator phone' },
    { key: 'contact_phone_2', value: CONTACT_INFO.coordinatorPhone2, category: 'CONTACTS', description: 'Secondary coordinator phone' },
    { key: 'itinerary_disclaimer', value: TRIP_METADATA.disclaimer, category: 'POLICIES', description: 'Weather and road conditions disclaimer' },
  ];

  for (const s of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value, category: s.category, description: s.description },
      create: s,
    });
  }
  console.log(`✓ Seeded ${defaultSettings.length} system settings`);

  // 3. Seed Master Trip
  let trip = await prisma.trip.findFirst();
  if (!trip) {
    trip = await prisma.trip.create({
      data: {
        title: TRIP_METADATA.name,
        subtitle: TRIP_METADATA.title,
        duration: TRIP_METADATA.duration,
        origin: TRIP_METADATA.origin,
        destination: TRIP_METADATA.destination,
        capacity: TRIP_METADATA.capacity,
        startDate: new Date('2026-11-15T16:00:00Z'),
        endDate: new Date('2026-11-20T23:00:00Z'),
        status: 'OPEN',
      },
    });
  }
  console.log(`✓ Master Trip confirmed: ${trip.title} (ID: ${trip.id})`);

  // 4. Seed Packages (Standard single source of truth: ₹6,200 per traveller)
  const packages = [
    {
      tripId: trip.id,
      name: 'SINGLE',
      slug: 'single',
      price: PRICING_DEFAULTS.pricePerTraveller,
      reservationAmount: PRICING_DEFAULTS.reservationAmountPerTraveller,
      travellersCount: 1,
      description: 'Single traveller seat with roundtrip luxury 2x2 AC transport, 3-star resort stay, daily breakfast & dinner, sightseeing and coordinator support.',
      features: JSON.stringify(['1 Dedicated Bus Seat', 'Manali & Kasol Hotel Stay', 'Breakfast & Dinner Included', 'Digital QR Boarding Pass', 'Trip Coordinator Support']),
    },
    {
      tripId: trip.id,
      name: 'GROUP',
      slug: 'group',
      price: PRICING_DEFAULTS.pricePerTraveller,
      reservationAmount: PRICING_DEFAULTS.reservationAmountPerTraveller,
      travellersCount: 1,
      description: 'Group booking for friends travelling together. ₹6,200 per traveller with adjacent seat recommendation, unified dashboard, and individual QR passes.',
      features: JSON.stringify(['Same Bus Allocation', 'Adjacent Seat Recommendations', 'Shared Booking Dashboard', 'All Hotel Stays & Meals Included', 'Individual Digital Passes']),
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: { price: pkg.price, travellersCount: pkg.travellersCount, description: pkg.description, features: pkg.features },
      create: pkg,
    });
  }
  console.log(`✓ Seeded ${packages.length} Packages (Single ₹6,200, Couple ₹6,500, Group 5+1 Free)`);

  // 5. Seed Buses and Exact 25-Position Layouts
  for (let i = 0; i < INITIAL_BUSES.length; i++) {
    const busDef = INITIAL_BUSES[i];
    let bus = await prisma.bus.findFirst({
      where: { busNumber: busDef.busNumber, tripId: trip.id },
    });

    if (!bus) {
      bus = await prisma.bus.create({
        data: {
          tripId: trip.id,
          busNumber: busDef.busNumber,
          vehicleName: busDef.vehicleName,
          vehicleNumber: busDef.vehicleNumber,
          physicalCapacity: 25,
          passengerCapacity: 23,
          driverSeats: 1,
          conductorSeats: 1,
          driverName: busDef.driverName,
          conductorName: busDef.conductorName,
          orderIndex: i + 1,
          status: 'ACTIVE',
        },
      });
    }

    // Seed 25 seats for this bus
    for (const seatDef of BUS_25_SEATS_LAYOUT) {
      await prisma.busSeat.upsert({
        where: {
          busId_seatNumber: {
            busId: bus.id,
            seatNumber: seatDef.seatNumber,
          },
        },
        update: {
          seatType: seatDef.seatType,
          rowNumber: seatDef.rowNumber,
          side: seatDef.side,
          position: seatDef.position,
          isBookable: seatDef.isBookable,
        },
        create: {
          busId: bus.id,
          seatNumber: seatDef.seatNumber,
          seatType: seatDef.seatType,
          rowNumber: seatDef.rowNumber,
          side: seatDef.side,
          position: seatDef.position,
          isBookable: seatDef.isBookable,
          isAvailable: seatDef.isBookable,
          status: seatDef.isBookable ? 'AVAILABLE' : (seatDef.seatType === 'DRIVER' ? 'DRIVER' : 'CONDUCTOR'),
        },
      });
    }

    // Seed Transport entry
    const existingTransport = await prisma.transport.findFirst({ where: { busId: bus.id } });
    if (!existingTransport) {
      await prisma.transport.create({
        data: {
          busId: bus.id,
          vehicleType: 'Luxury 2x2 AC Tourist Coach',
          vehicleNumber: busDef.vehicleNumber,
          driverName: busDef.driverName || 'Chauffeur',
          driverPhone: '7017936338',
          conductorName: busDef.conductorName || 'Conductor',
          conductorPhone: '9368287947',
          route: 'GLA University -> Manali -> Kasol -> GLA University',
          status: 'READY',
        },
      });
    }
  }
  console.log(`✓ Seeded ${INITIAL_BUSES.length} Buses with 25-seat layouts (1 Driver, 1 Conductor, 23 Bookable Passenger Seats each)`);

  // 6. Seed Complete 6-Day Itinerary
  for (const dayDef of ITINERARY_DAYS) {
    const day = await prisma.itineraryDay.upsert({
      where: {
        tripId_dayNumber: {
          tripId: trip.id,
          dayNumber: dayDef.dayNumber,
        },
      },
      update: {
        title: dayDef.title,
        subtitle: dayDef.subtitle,
        stayLocation: dayDef.stayLocation,
        mealsConfig: dayDef.mealsConfig,
        description: dayDef.description,
      },
      create: {
        tripId: trip.id,
        dayNumber: dayDef.dayNumber,
        title: dayDef.title,
        subtitle: dayDef.subtitle,
        stayLocation: dayDef.stayLocation,
        mealsConfig: dayDef.mealsConfig,
        description: dayDef.description,
        isPublic: true,
      },
    });

    // Seed itinerary items
    for (let idx = 0; idx < dayDef.items.length; idx++) {
      const itemDef = dayDef.items[idx];
      const existingItem = await prisma.itineraryItem.findFirst({
        where: { dayId: day.id, activity: itemDef.activity },
      });

      if (!existingItem) {
        await prisma.itineraryItem.create({
          data: {
            dayId: day.id,
            time: itemDef.time,
            location: itemDef.location,
            activity: itemDef.activity,
            description: itemDef.description,
            isOptional: itemDef.isOptional,
            orderIndex: idx,
          },
        });
      }
    }
  }
  console.log(`✓ Seeded all 6 Itinerary Days with activities and schedules`);

  // 7. Seed Hotels and Rooms
  let manaliHotel = await prisma.hotel.findFirst({ where: { location: 'Manali', tripId: trip.id } });
  if (!manaliHotel) {
    manaliHotel = await prisma.hotel.create({
      data: {
        tripId: trip.id,
        name: 'Snow Valley Pine Resort & Spa',
        location: 'Manali',
        address: 'Log Huts Area, Old Manali Road, Manali, HP',
        contactPerson: 'Vikram Negi',
        contactPhone: '7017936338',
      },
    });

    for (let r = 101; r <= 115; r++) {
      await prisma.room.create({
        data: {
          hotelId: manaliHotel.id,
          roomNumber: `M-${r}`,
          roomType: r % 4 === 0 ? 'Deluxe Double' : 'Triple Sharing Deluxe',
          capacity: r % 4 === 0 ? 2 : 3,
        },
      });
    }
  }

  let kasolHotel = await prisma.hotel.findFirst({ where: { location: 'Kasol', tripId: trip.id } });
  if (!kasolHotel) {
    kasolHotel = await prisma.hotel.create({
      data: {
        tripId: trip.id,
        name: 'Parvati Riverside Alpine Retreat',
        location: 'Kasol',
        address: 'Riverside Road, Near Old Bridge, Kasol, HP',
        contactPerson: 'Mohit Sharma',
        contactPhone: '9368287947',
      },
    });

    for (let r = 201; r <= 215; r++) {
      await prisma.room.create({
        data: {
          hotelId: kasolHotel.id,
          roomNumber: `K-${r}`,
          roomType: r % 4 === 0 ? 'Deluxe Double' : 'Triple Sharing Alpine',
          capacity: r % 4 === 0 ? 2 : 3,
        },
      });
    }
  }
  console.log(`✓ Seeded Manali & Kasol Hotels and Room Inventory`);


  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
