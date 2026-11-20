const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BUS_25_SEATS_LAYOUT = [
  // Front Cabin
  { seatNumber: 'DRIVER', seatType: 'DRIVER', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  { seatNumber: 'CONDUCTOR', seatType: 'CONDUCTOR', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  
  // Row 1
  { seatNumber: 'L1', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L2', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R1', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R2', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 2
  { seatNumber: 'L3', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L4', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R3', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R4', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 3
  { seatNumber: 'L5', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L6', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R5', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R6', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 4
  { seatNumber: 'L7', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L8', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R7', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R8', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 5
  { seatNumber: 'L9', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L10', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R9', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R10', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 6 (Rear 5-seat bench)
  { seatNumber: 'B1', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
  { seatNumber: 'B2', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B3', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B4', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B5', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
];

const INITIAL_BUSES = [
  { busNumber: 'Bus 01', vehicleName: 'Himalayan Eagle (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-001', driverName: 'Rajesh Sharma', conductorName: 'Amit Conductor Lead', driverPhone: '7017936338', conductorPhone: '9368287947' },
  { busNumber: 'Bus 02', vehicleName: 'Parvati Cruiser (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-002', driverName: 'Sunil Kumar', conductorName: 'Manoj Singh', driverPhone: '7017936338', conductorPhone: '9368287947' },
  { busNumber: 'Bus 03', vehicleName: 'Solang Glider (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-003', driverName: 'Virender Rawat', conductorName: 'Rakesh Negi', driverPhone: '7017936338', conductorPhone: '9368287947' },
];

async function main() {
  const trip = await prisma.trip.findFirst();
  if (!trip) {
    console.error('No trip found in DB');
    return;
  }
  console.log(`Working on trip: ${trip.title} (ID: ${trip.id})`);

  for (let i = 0; i < INITIAL_BUSES.length; i++) {
    const busDef = INITIAL_BUSES[i];
    let bus = await prisma.bus.findFirst({
      where: {
        tripId: trip.id,
        busNumber: busDef.busNumber,
      },
      include: {
        seats: true,
      },
    });

    if (!bus) {
      console.log(`Creating ${busDef.busNumber}...`);
      bus = await prisma.bus.create({
        data: {
          tripId: trip.id,
          busNumber: busDef.busNumber,
          vehicleName: busDef.vehicleName,
          vehicleNumber: busDef.vehicleNumber,
          driverName: busDef.driverName,
          conductorName: busDef.conductorName,
          driverPhone: busDef.driverPhone,
          conductorPhone: busDef.conductorPhone,
          physicalCapacity: 27,
          passengerCapacity: 25,
          driverSeats: 1,
          conductorSeats: 1,
          orderIndex: i + 1,
          status: 'ACTIVE',
        },
        include: { seats: true },
      });
    } else {
      console.log(`Updating ${bus.busNumber} capacity to 25 passenger / 27 physical...`);
      await prisma.bus.update({
        where: { id: bus.id },
        data: {
          physicalCapacity: 27,
          passengerCapacity: 25,
          status: 'ACTIVE',
        },
      });
    }

    const existingSeatsMap = new Map(bus.seats.map((s) => [s.seatNumber, s]));
    const toCreate = [];
    const toUpdate = [];

    for (const seatDef of BUS_25_SEATS_LAYOUT) {
      const existing = existingSeatsMap.get(seatDef.seatNumber);
      if (existing) {
        toUpdate.push(
          prisma.busSeat.update({
            where: { id: existing.id },
            data: {
              seatType: seatDef.seatType,
              rowNumber: seatDef.rowNumber,
              side: seatDef.side,
              position: seatDef.position,
              isBookable: seatDef.isBookable,
            },
          })
        );
      } else {
        toCreate.push({
          busId: bus.id,
          seatNumber: seatDef.seatNumber,
          seatType: seatDef.seatType,
          rowNumber: seatDef.rowNumber,
          side: seatDef.side,
          position: seatDef.position,
          isBookable: seatDef.isBookable,
          isAvailable: seatDef.isBookable,
          status: seatDef.isBookable ? 'AVAILABLE' : seatDef.seatType,
        });
      }
    }

    if (toUpdate.length > 0) {
      await Promise.all(toUpdate);
      console.log(`  Updated ${toUpdate.length} existing seats for ${bus.busNumber}`);
    }

    if (toCreate.length > 0) {
      await prisma.busSeat.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      console.log(`  Created ${toCreate.length} new seats (${toCreate.map((s) => s.seatNumber).join(', ')}) for ${bus.busNumber}`);
    }
  }

  // Update trip capacity to 75
  const totalBuses = await prisma.bus.findMany({
    where: { tripId: trip.id, status: 'ACTIVE' },
  });
  const totalCapacity = totalBuses.reduce((sum, b) => sum + b.passengerCapacity, 0);
  await prisma.trip.update({
    where: { id: trip.id },
    data: { capacity: totalCapacity },
  });

  console.log(`\n✓ SUCCESS! Total active coaches: ${totalBuses.length}, Total passenger capacity: ${totalCapacity}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
