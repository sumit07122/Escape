const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trip = await prisma.trip.findFirst();
  if (trip) {
    const inclusions = JSON.stringify([
      "Luxury AC Tourist Coach transit from GLA University Mathura and back",
      "3 Nights hotel accommodation (Deluxe room on triple sharing basis)",
      "Daily Breakfast & Dinner buffet spread at hotels",
      "Guided sightseeing in Manali, Solang Valley, and Kasol riverside",
      "Parvati Valley & Manikaran Sahib Gurudwara excursion",
      "Bonfire evening with music in Kasol riverside camp/hotel",
      "Dedicated GLA University student tour coordinators & 24/7 assistance"
    ]);

    const exclusions = JSON.stringify([
      "Lunch & highway meal stops during transit",
      "Personal adventure sports (Paragliding, River Rafting, Zorbing, Skiing)",
      "Local union taxi or permit costs where tourist buses cannot go",
      "Personal expenses, room service, laundry, and shopping"
    ]);

    const importantInfo = JSON.stringify({
      reportingInstructions: "Reporting at GLA University Main Gate at 07:30 PM. Digital QR pass scanning begins 1 hour prior to departure.",
      luggageRules: "1 main bag (up to 15kg) to be loaded into bus luggage hold, plus 1 small cabin backpack.",
      idRequirements: "Original GLA University Student ID Card + Government ID (Aadhaar / Driving License / Voter ID) mandatory.",
      safetyNotes: "Follow coordinator instructions. Alcohol/drugs strictly prohibited on GLA official university excursions.",
      weatherInfo: "Manali and Kasol temperatures can drop to 2°C at night. Carry heavy thermals, jacket, gloves, and comfortable walking shoes."
    });

    const pickupPoints = JSON.stringify([
      { location: "GLA University Main Gate", time: "07:30 PM", instructions: "Primary reporting & QR check-in desk" },
      { location: "GLA Hostel Complex (Back Gate)", time: "08:15 PM", instructions: "Luggage loading and secondary boarding" }
    ]);

    const sittingPreferences = JSON.stringify([
      "WINDOW", "AISLE", "FRONT", "BACK", "NO_PREFERENCE"
    ]);

    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        slug: trip.slug || 'manali-kasol',
        name: 'GLA HIMALAYAN ESCAPE',
        title: 'GLA HIMALAYAN ESCAPE',
        shortName: 'Manali + Kasol',
        subtitle: 'MANALI × KASOL',
        description: 'Experience 6 days of pure mountain freedom across snow-capped Himalayan peaks, Rohtang foothills, pine forests, and Parvati riverbanks with fellow GLA students.',
        category: 'Himalayan',
        capacity: 75,
        packagePrice: 6200,
        reservationAmount: 1000,
        seatHoldMinutes: 10,
        minTravellersPerBooking: 1,
        maxTravellersPerBooking: 6,
        seatSelectionEnabled: true,
        featured: true,
        status: 'OPEN_FOR_BOOKING',
        heroImage: '/images/hero-himalayas.jpg',
        thumbnailImage: '/images/solang-valley.jpg',
        inclusions,
        exclusions,
        importantInfo,
        pickupPoints,
        sittingPreferences
      }
    });

    // Populate ticket.tripId from ticket.booking.tripId
    const tickets = await prisma.ticket.findMany({
      include: { booking: true }
    });
    for (const t of tickets) {
      if (!t.tripId && t.booking?.tripId) {
        await prisma.ticket.update({
          where: { id: t.id },
          data: { tripId: t.booking.tripId }
        });
      }
    }

    console.log('✅ Phase 5 trip defaults migrated successfully for Trip:', trip.id);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
