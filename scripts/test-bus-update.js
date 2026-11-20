require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateBusSeatLayout } = require('../src/lib/bus-layout');

async function testBusUpdate() {
  const bus = await prisma.bus.findFirst({ where: { busNumber: 'Bus 01' } });
  console.log('Testing bus update for:', bus.busNumber, bus.id);

  // Check how many seats it has
  const seats = await prisma.busSeat.findMany({ where: { busId: bus.id } });
  console.log('Current seats count:', seats.length);

  // Generate 5 rows, 5 rear = 25 passenger + 2 crew = 27
  const desired = generateBusSeatLayout(5, 5);
  console.log('Generated seats count:', desired.length);
}

testBusUpdate().catch(console.error).finally(() => prisma.$disconnect());
