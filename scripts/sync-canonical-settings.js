const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Syncing Canonical Settings in Database ---');

  // Update Settings table
  const updates = [
    { key: 'price_single', value: '6200' },
    { key: 'price_group', value: '6200' },
    { key: 'price_reservation', value: '1000' },
    { key: 'group_size_threshold', value: '1' },
    { key: 'trip_capacity', value: '75' },
  ];

  for (const { key, value } of updates) {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value, category: 'PRICING' },
    });
    console.log(`Updated Setting: ${key} = ${value}`);
  }

  // Update GlobalSettings
  await prisma.globalSettings.upsert({
    where: { id: 'global_default' },
    update: { tripCapacity: 75 },
    create: { id: 'global_default', tripCapacity: 75, siteName: 'Himalayan Escape — Student Mountain Expedition' },
  });
  console.log('Updated GlobalSettings: tripCapacity = 75');

  // Also check Trip model
  const trip = await prisma.trip.findFirst();
  if (trip) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        capacity: 75,
        packagePrice: 6200,
        packagePricePerTraveller: 6200,
        reservationAmount: 1000,
        reservationAmountPerTraveller: 1000,
      },
    });
    console.log(`Updated Trip: ${trip.name} -> 75 capacity, ₹6,200 package price`);
  }
}

main()
  .then(() => {
    console.log('✅ Canonical settings synchronized successfully.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error syncing settings:', e);
    process.exit(1);
  });
