require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncAllPricing() {
  console.log('Synchronizing pricing across TripConfig, Trip, and Settings...');

  // 1. Update TripConfig
  await prisma.tripConfig.upsert({
    where: { id: 'global' },
    update: {
      packagePrice: 6200,
      groupPackagePrice: 5800,
      groupSizeThreshold: 3,
      depositPrice: 1000,
      totalCapacity: 75,
      departureDate: '2026-12-24',
      returnDate: '2026-12-29',
      reportingTime: '07:00 PM',
      pickupLocation: 'Near Main Gate (NH-2), Mathura',
    },
    create: {
      id: 'global',
      tripTitle: 'Himalayan Escape 2026',
      subtitle: 'Five days from the plains to the peaks. Find snow trails in Manali, pine-scented evenings in Kasol, and a new crew for the journey.',
      packagePrice: 6200,
      groupPackagePrice: 5800,
      groupSizeThreshold: 3,
      depositPrice: 1000,
      totalCapacity: 75,
      departureDate: '2026-12-24',
      returnDate: '2026-12-29',
      reportingTime: '07:00 PM',
      pickupLocation: 'Near Main Gate (NH-2), Mathura',
      emergencyHelplines: ['6398412828', '8126854850'],
      announcementActive: false,
    },
  });
  console.log('TripConfig updated to 6200 / 5800 / 1000 / 75.');

  // 2. Update master Trip
  const trip = await prisma.trip.findFirst();
  if (trip) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        packagePrice: 6200,
        packagePricePerTraveller: 6200,
        capacity: 75,
        duration: '5 Days / 4 Nights',
        startDate: new Date('2026-12-24T16:30:00.000Z'),
        endDate: new Date('2026-12-29T10:00:00.000Z'),
      },
    });
    console.log('Master trip updated to 6200, 75 capacity, 5 Days / 4 Nights.');
  }

  // 3. Update legacy settings keys
  const settingsToUpdate = [
    { key: 'price_single', value: '6200' },
    { key: 'price_group', value: '5800' },
    { key: 'group_size_threshold', value: '3' },
    { key: 'price_reservation', value: '1000' },
    { key: 'trip_capacity', value: '75' },
    { key: 'departure_date', value: '2026-10-24' },
    { key: 'return_date', value: '2026-10-28' },
  ];

  for (const s of settingsToUpdate) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, category: 'PRICING' },
    });
  }
  console.log('Legacy settings keys updated.');

  // 4. Update globalSettings
  await prisma.globalSettings.upsert({
    where: { id: 'global_default' },
    update: { tripCapacity: 75 },
    create: { id: 'global_default', tripCapacity: 75 },
  });
  console.log('GlobalSettings capacity updated to 75.');

  console.log('Pricing sync complete!');
}

syncAllPricing().catch(console.error).finally(() => prisma.$disconnect());
