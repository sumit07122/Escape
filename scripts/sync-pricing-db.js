require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncAllPricing() {
  console.log('Synchronizing pricing across TripConfig, Trip, and Settings...');

  // 1. Update TripConfig
  await prisma.tripConfig.upsert({
    where: { id: 'global' },
    update: {
      tripTitle: 'Himalayan Escape – Christmas Special 2026',
      subtitle: 'Six days away from routine. A lifetime of stories. From pine-scented riverside camping in Kasol to snow peaks in Manali.',
      packagePrice: 6199,
      groupPackagePrice: 6199,
      groupDiscountAmount: 600,
      groupSizeThreshold: 5,
      depositPrice: 1000,
      totalCapacity: 50,
      departureDate: '2026-12-23',
      returnDate: '2026-12-28',
      reportingTime: '12:00 PM',
      pickupLocation: 'GLA University, Mathura',
      emergencyHelplines: ['8126854850', '6398412828'],
    },
    create: {
      id: 'global',
      tripTitle: 'Himalayan Escape – Christmas Special 2026',
      subtitle: 'Six days away from routine. A lifetime of stories. From pine-scented riverside camping in Kasol to snow peaks in Manali.',
      packagePrice: 6199,
      groupPackagePrice: 6199,
      groupDiscountAmount: 600,
      groupSizeThreshold: 5,
      depositPrice: 1000,
      totalCapacity: 50,
      departureDate: '2026-12-23',
      returnDate: '2026-12-28',
      reportingTime: '12:00 PM',
      pickupLocation: 'GLA University, Mathura',
      emergencyHelplines: ['8126854850', '6398412828'],
      announcementActive: false,
    },
  });
  console.log('TripConfig updated to 6199 / 600 group disc / 1000 deposit / 50 capacity.');

  // 2. Update master Trip
  const trip = await prisma.trip.findFirst();
  if (trip) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        title: 'Himalayan Escape – Christmas Special 2026',
        packagePrice: 6199,
        packagePricePerTraveller: 6199,
        capacity: 50,
        duration: '6 Days / 5 Nights',
        startDate: new Date('2026-12-23T12:00:00.000Z'),
        endDate: new Date('2026-12-28T10:00:00.000Z'),
      },
    });
    console.log('Master trip updated to 6199, 50 capacity, 6 Days / 5 Nights (23-28 Dec).');
  }

  // 3. Update legacy settings keys
  const settingsToUpdate = [
    { key: 'price_single', value: '6199' },
    { key: 'price_group', value: '6199' },
    { key: 'group_discount_amount', value: '600' },
    { key: 'group_size_threshold', value: '5' },
    { key: 'price_reservation', value: '1000' },
    { key: 'trip_capacity', value: '50' },
    { key: 'departure_date', value: '2026-12-23' },
    { key: 'return_date', value: '2026-12-28' },
    { key: 'pickup_location', value: 'GLA University, Mathura' },
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
    update: { tripCapacity: 50 },
    create: { id: 'global_default', tripCapacity: 50 },
  });
  console.log('GlobalSettings capacity updated to 50.');

  console.log('Pricing sync complete!');
}

syncAllPricing().catch(console.error).finally(() => prisma.$disconnect());
