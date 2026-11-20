require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tripConfig = await prisma.tripConfig.findUnique({ where: { id: 'global' } });
  console.log('tripConfig in DB:', tripConfig);

  const trip = await prisma.trip.findFirst();
  console.log('trip in DB:', trip ? { id: trip.id, packagePrice: trip.packagePrice, packagePricePerTraveller: trip.packagePricePerTraveller, reservationPrice: trip.reservationPrice, capacity: trip.capacity } : null);

  const settings = await prisma.settings.findMany();
  console.log('settings in DB:', settings.map(s => `${s.key}: ${s.value}`));

  const globalSettings = await prisma.globalSettings.findUnique({ where: { id: 'global_default' } });
  console.log('globalSettings in DB:', globalSettings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
