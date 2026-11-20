const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const buses = await prisma.bus.findMany({
    include: { seats: true },
    orderBy: { busNumber: 'asc' }
  });
  console.log('Total buses in DB:', buses.length);
  for (const b of buses) {
    const passengerSeats = b.seats.filter(s => s.seatType === 'PASSENGER');
    console.log(`\nBus: ${b.busNumber} | ${b.vehicleName} | ID: ${b.id} | Status: ${b.status}`);
    console.log(`Capacity: ${b.passengerCapacity} passenger, ${b.physicalCapacity} physical | DB seats: ${b.seats.length} total (${passengerSeats.length} passenger)`);
    console.log(`Seat numbers: ${b.seats.map(s => s.seatNumber).join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
