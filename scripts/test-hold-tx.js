require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHold() {
  console.log('Testing seat hold transaction...');
  try {
    const bus = await prisma.bus.findFirst();
    console.log('Using bus:', bus.busNumber, bus.id);

    const seat = await prisma.busSeat.findFirst({ where: { busId: bus.id, seatNumber: 'L1' } });
    console.log('Using seat:', seat.seatNumber, seat.id);

    const testSession = 'test_sess_' + Date.now();

    // Try a transaction
    await prisma.$transaction(async (tx) => {
      const b = await tx.bus.findUnique({ where: { id: bus.id } });
      const s = await tx.busSeat.findMany({ where: { busId: bus.id, seatNumber: { in: ['L1'] } } });
      console.log('Inside tx, bus found:', b.busNumber, 'seats found:', s.length);
      await tx.seatHold.upsert({
        where: { busSeatId: seat.id },
        update: { bookingSessionId: testSession, status: 'ACTIVE', expiresAt: new Date(Date.now() + 600000) },
        create: { busSeatId: seat.id, bookingSessionId: testSession, status: 'ACTIVE', expiresAt: new Date(Date.now() + 600000) }
      });
      await tx.busSeat.update({
        where: { id: seat.id },
        data: { status: 'HELD', isAvailable: false }
      });
    });
    console.log('SUCCESS: Transaction completed');

    // Clean up
    await prisma.seatHold.deleteMany({ where: { bookingSessionId: testSession } });
    await prisma.busSeat.update({ where: { id: seat.id }, data: { status: 'AVAILABLE', isAvailable: true } });
    console.log('Cleaned up test hold.');
  } catch (err) {
    console.error('FAILED transaction:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testHold();
