const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trip = await prisma.trip.findFirst();
  if (trip) {
    console.log(`Current trip packagePrice: ${trip.packagePrice}, reservationAmount: ${trip.reservationAmount}`);
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        packagePrice: 6200,
        packagePricePerTraveller: 6200,
        reservationAmount: 1000,
        reservationAmountPerTraveller: 1000,
      },
    });
    console.log('✓ Updated trip packagePrice to 6200, reservationAmount to 1000 in DB');
  }

  // Update Settings table if price_single exists
  const singleSetting = await prisma.settings.findUnique({ where: { key: 'price_single' } });
  if (singleSetting) {
    await prisma.settings.update({
      where: { key: 'price_single' },
      data: { value: '6200' },
    });
    console.log('✓ Updated Settings price_single to 6200');
  } else {
    await prisma.settings.create({
      data: { key: 'price_single', value: '6200', description: 'Standard Single Person Package Price' },
    });
    console.log('✓ Created Settings price_single as 6200');
  }

  const depositSetting = await prisma.settings.findUnique({ where: { key: 'price_reservation' } });
  if (depositSetting) {
    await prisma.settings.update({
      where: { key: 'price_reservation' },
      data: { value: '1000' },
    });
    console.log('✓ Updated Settings price_reservation to 1000');
  } else {
    await prisma.settings.create({
      data: { key: 'price_reservation', value: '1000', description: 'Advance Reservation Deposit' },
    });
    console.log('✓ Created Settings price_reservation as 1000');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
