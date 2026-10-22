const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trips = await prisma.trip.findMany();
  const busCount = await prisma.bus.count();
  const seatCount = await prisma.busSeat.count();
  const bookingCount = await prisma.booking.count();
  const travellerCount = await prisma.traveller.count();
  const userCount = await prisma.user.count();
  const itineraryDayCount = await prisma.itineraryDay.count();
  console.log('Trips in DB:', trips);
  console.log({ busCount, seatCount, bookingCount, travellerCount, userCount, itineraryDayCount });
}

main().catch(console.error).finally(() => prisma.$disconnect());
