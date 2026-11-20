require('dotenv').config();
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
    console.log(`\n=== Bus: ${b.busNumber} | ${b.vehicleName} | ID: ${b.id} ===`);
    console.log(`Capacity: ${b.passengerCapacity} passenger, ${b.physicalCapacity} physical | DB seats: ${b.seats.length} total (${passengerSeats.length} passenger)`);
    const left = passengerSeats.filter(s => s.side === 'LEFT').sort((a,b) => a.rowNumber !== b.rowNumber ? a.rowNumber - b.rowNumber : (a.position === 'WINDOW' ? -1 : 1));
    const right = passengerSeats.filter(s => s.side === 'RIGHT').sort((a,b) => a.rowNumber !== b.rowNumber ? a.rowNumber - b.rowNumber : (a.position === 'AISLE' ? -1 : 1));
    const rear = passengerSeats.filter(s => s.side === 'REAR').sort((a,b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));
    console.log('LEFT:', left.map(s => `${s.seatNumber} (r${s.rowNumber},${s.position})`).join(' | '));
    console.log('RIGHT:', right.map(s => `${s.seatNumber} (r${s.rowNumber},${s.position})`).join(' | '));
    console.log('REAR:', rear.map(s => `${s.seatNumber} (r${s.rowNumber},${s.position})`).join(' | '));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
