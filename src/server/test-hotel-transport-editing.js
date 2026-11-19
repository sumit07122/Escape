const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 TESTING EDITABLE HOTELS & TRANSPORT BACKEND LOGIC');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const trip = await prisma.trip.findFirst();
    if (!trip) throw new Error('Trip not found');

    // 1. Test Hotel Creation
    console.log('--- 1. Hotel Creation & Updates ---');
    const testHotel = await prisma.hotel.create({
      data: {
        tripId: trip.id,
        name: 'Test Pine Sanctuary',
        location: 'Manali',
        address: 'Old Manali High Trail',
        contactPerson: 'Dev Singh',
        contactPhone: '9876543210',
      },
    });
    assert(testHotel && testHotel.id, 'Hotel created successfully');

    // 2. Test Hotel Update
    const updatedHotel = await prisma.hotel.update({
      where: { id: testHotel.id },
      data: {
        name: 'Snow Valley Updated Lodge',
        contactPerson: 'Vikram Negi Updated',
        contactPhone: '7017936338',
      },
    });
    assert(updatedHotel.name === 'Snow Valley Updated Lodge', 'Hotel name updated to "Snow Valley Updated Lodge"');
    assert(updatedHotel.contactPerson === 'Vikram Negi Updated', 'Contact person updated');

    // 3. Test Room Creation & Update
    console.log('\n--- 2. Room Creation & Updates ---');
    const testRoom = await prisma.room.create({
      data: {
        hotelId: testHotel.id,
        roomNumber: '999',
        roomType: 'Triple Sharing',
        capacity: 3,
        notes: 'Top floor river view',
      },
    });
    assert(testRoom && testRoom.capacity === 3, 'Room created with 3-bed capacity');

    const updatedRoom = await prisma.room.update({
      where: { id: testRoom.id },
      data: {
        roomNumber: '999-A',
        roomType: 'Quad Sharing Deluxe',
        capacity: 4,
      },
    });
    assert(updatedRoom.roomNumber === '999-A', 'Room number updated to 999-A');
    assert(updatedRoom.capacity === 4, 'Room capacity increased to 4 beds');

    // 4. Test Transport / Bus Update
    console.log('\n--- 3. Transport / Bus Chauffeur Updates ---');
    const firstBus = await prisma.bus.findFirst({ orderBy: { orderIndex: 'asc' } });
    if (firstBus) {
      const originalDriver = firstBus.driverName;
      const updatedBus = await prisma.bus.update({
        where: { id: firstBus.id },
        data: {
          driverName: 'Rajesh Mountain Master',
          driverPhone: '7017936338',
          conductorName: 'Amit Conductor Lead',
          conductorPhone: '9368287947',
        },
      });
      assert(updatedBus.driverName === 'Rajesh Mountain Master', 'Bus chauffeur name updated');
      assert(updatedBus.conductorName === 'Amit Conductor Lead', 'Bus conductor name updated');

      // Revert bus driver back cleanly
      await prisma.bus.update({
        where: { id: firstBus.id },
        data: {
          driverName: originalDriver || 'Rajesh Sharma',
        },
      });
    }

    // 5. Cleanup test hotel & room
    console.log('\n--- 4. Cleanup & Deletion Safety ---');
    await prisma.room.delete({ where: { id: testRoom.id } });
    const checkRoom = await prisma.room.findUnique({ where: { id: testRoom.id } });
    assert(!checkRoom, 'Room deleted cleanly');

    await prisma.hotel.delete({ where: { id: testHotel.id } });
    const checkHotel = await prisma.hotel.findUnique({ where: { id: testHotel.id } });
    assert(!checkHotel, 'Hotel deleted cleanly');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    console.log(`\n======================================================`);
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
