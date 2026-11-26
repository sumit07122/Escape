require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ITINERARY_DAYS = [
  {
    dayNumber: 1,
    title: 'DAY 1 — THE JOURNEY BEGINS',
    subtitle: 'Mathura to Himachal | Departure 12:00 PM',
    stayLocation: 'Overnight AC Traveller Bus Journey',
    mealsConfig: 'No meals served from our side during travel (Self-paid en route)',
    description: 'Assemble at GLA University, Mathura. Board the luxury AC Traveller coach. Kick off the expedition with music, group games, interactive activities, and entertainment as we begin our overnight road journey towards the serene valleys of Himachal.',
    items: [
      { orderIndex: 1, time: '11:30 AM – 12:00 PM', location: 'GLA University, Mathura', activity: 'Assembly & QR Verification', description: 'Student arrival, luggage check-in, seat confirmation, and digital QR ticket verification.', isOptional: false },
      { orderIndex: 2, time: '12:00 PM', location: 'GLA University Campus Gate', activity: 'Departure towards Himachal', description: 'Flag-off in luxury AC Traveller coach. Group music, games, icebreakers, and road trip vibes.', isOptional: false },
      { orderIndex: 3, time: '05:30 PM', location: 'Highway Transit Plaza (Murthal)', activity: 'Tea & Refreshment Halt', description: 'Comfort break and evening snacks (self-paid).', isOptional: false },
      { orderIndex: 4, time: '09:30 PM', location: 'Highway Food Court (Karnal / Ambala)', activity: 'Dinner Halt (Self-Paid)', description: 'Sanitized dinner stop en route (self-paid). No meals served during transit from organizer side.', isOptional: false },
      { orderIndex: 5, time: '11:00 PM', location: 'Entering Himalayan Foothills', activity: 'Overnight Mountain Drive', description: 'Smooth overnight journey across Himalayan highways with reclining pushback seats.', isOptional: false },
    ],
  },
  {
    dayNumber: 2,
    title: 'DAY 2 — KASOL RIVERSIDE CAMPING',
    subtitle: 'Manikaran Sahib, Kasol Market, Bonfire & DJ Night',
    stayLocation: 'Riverside Campsite in Kasol',
    mealsConfig: 'Dinner Included (Pure Veg Buffet)',
    description: 'Arrive in picturesque Kasol and check in at the riverside campsite nestled under tall pine trees. Visit the sacred Shri Manikaran Sahib Gurudwara and holy Lord Shiva temple with therapeutic hot springs. Explore vibrant Kasol market and riverside cafés. Enjoy an evening campfire, DJ beats, and hot dinner.',
    items: [
      { orderIndex: 1, time: '09:30 AM – 11:00 AM', location: 'Kasol, Parvati Valley', activity: 'Arrival & Riverside Camp Check-In', description: 'Arrive in Kasol, tent allotment, freshen up, and unwind beside the roaring turquoise Parvati River.', isOptional: false },
      { orderIndex: 2, time: '12:30 PM', location: 'Manikaran', activity: 'Shri Manikaran Sahib & Shiva Temple', description: 'Visit the revered Sikh Gurudwara, ancient Lord Shiva temple, and natural therapeutic hot sulphur springs.', isOptional: false },
      { orderIndex: 3, time: '03:30 PM', location: 'Kasol Market & Riverside Cafés', activity: 'Market Stroll & Café Hopping', description: 'Explore colorful bohemian street markets, handmade souvenirs, German bakeries, and riverside spots.', isOptional: false },
      { orderIndex: 4, time: '07:30 PM', location: 'Kasol Campsite Grounds', activity: 'Bonfire, Music & DJ Night', description: 'Starlit evening campfire, DJ music, dance, community group games, and mountain stories.', isOptional: false },
      { orderIndex: 5, time: '09:00 PM', location: 'Campsite Dining Area', activity: 'Buffet Dinner & Overnight Camping', description: 'Delicious hot vegetarian dinner buffet and overnight camping under the Himalayan stars.', isOptional: false },
    ],
  },
  {
    dayNumber: 3,
    title: 'DAY 3 — MANALI LOCAL EXPLORATION',
    subtitle: 'Kasol to Manali, 3-Garden Riverside Hotel & Old Manali Cafés',
    stayLocation: '3-Star Riverside Hotel in Manali (featuring 3 gardens)',
    mealsConfig: 'Breakfast & Dinner Included (Pure Veg)',
    description: 'Enjoy breakfast with serene river views and check out from Kasol camps. Scenic drive towards Manali and check in at our premium riverside hotel featuring three beautiful landscaped gardens. Explore the ancient Hadimba Temple, Mall Road, Old Manali café street, Vashisht Temple, and Van Vihar before a lavish dinner.',
    items: [
      { orderIndex: 1, time: '08:30 AM', location: 'Kasol Campsite', activity: 'Riverside Breakfast & Check-Out', description: 'Wholesome morning breakfast and camp check-out with luggage loaded into coaches.', isOptional: false },
      { orderIndex: 2, time: '10:00 AM', location: 'Parvati to Kullu Valley Drive', activity: 'Scenic Mountain Drive to Manali', description: 'Picturesque valley journey along the Beas River toward Manali.', isOptional: false },
      { orderIndex: 3, time: '01:00 PM', location: 'Manali Riverside Hotel', activity: 'Hotel Check-In & Garden Relaxation', description: 'Check in to our riverside hotel with three beautiful gardens. Freshen up and relax.', isOptional: false },
      { orderIndex: 4, time: '02:30 PM', location: 'Dhungri Forest & Mall Road', activity: 'Hadimba Temple & Van Vihar', description: 'Visit the historic 16th-century wooden Hadimba Temple surrounded by cedar woods and stroll through Van Vihar.', isOptional: false },
      { orderIndex: 5, time: '04:30 PM', location: 'Old Manali & Vashisht Temple', activity: 'Old Manali Café Street & Vashisht Hot Springs', description: 'Explore iconic hippie café lanes of Old Manali and the hot sulphur baths of Vashisht Temple.', isOptional: false },
      { orderIndex: 6, time: '06:30 PM', location: 'Manali Mall Road', activity: 'Mall Road Stroll & Shopping', description: 'Free time for local handicrafts, Tibetan woollens, winter shopping, and street photography.', isOptional: false },
      { orderIndex: 7, time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Buffet Dinner & Overnight Stay', description: 'Hot vegetarian dinner buffet and comfortable overnight hotel stay in Manali.', isOptional: false },
    ],
  },
  {
    dayNumber: 4,
    title: 'DAY 4 — SOLANG VALLEY & SISSU ADVENTURE',
    subtitle: 'Atal Tunnel, High-Altitude Snow Slopes, Bonfire & Music',
    stayLocation: '3-Star Riverside Hotel in Manali',
    mealsConfig: 'Breakfast & Dinner Included (Pure Veg)',
    description: 'After breakfast, embark on a high-altitude mountain adventure to Solang Valley for snow slopes and adventure activities (paragliding, skiing, ATV rides at additional personal cost). Drive through the world-famous Atal Tunnel (9.02 km) into Sissu/Koksar (subject to weather clearances) to witness frozen waterfalls and trans-Himalayan landscapes. Evening bonfire and music night in Manali.',
    items: [
      { orderIndex: 1, time: '08:00 AM', location: 'Hotel Restaurant', activity: 'Breakfast Buffet', description: 'Wholesome breakfast buffet before heading to high altitudes.', isOptional: false },
      { orderIndex: 2, time: '09:30 AM', location: 'Solang Valley (8,400 ft)', activity: 'Solang Snow Slopes & Adventures', description: 'Experience the famous mountain bowl. Paragliding, skiing, and ATV rides available at additional personal cost.', isOptional: false },
      { orderIndex: 3, time: '01:00 PM', location: 'Atal Tunnel (9.02 km)', activity: 'Atal Tunnel Highway Crossing', description: 'Drive through the world-record high-altitude tunnel beneath the Rohtang Ridge into Lahaul Valley.', isOptional: false },
      { orderIndex: 4, time: '02:00 PM', location: 'Sissu / Koksar, Lahaul Valley', activity: 'Sissu Waterfall & Alpine Landscapes', description: 'Breathtaking trans-Himalayan vistas and frozen Sissu waterfall (subject to road & weather clearances; Rohtang Pass alternative if opened by BRO).', isOptional: false },
      { orderIndex: 5, time: '06:30 PM', location: 'Hotel Manali', activity: 'Return to Hotel & Evening Bonfire', description: 'Campfire warmth, music, group games, and dance session.', isOptional: false },
      { orderIndex: 6, time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Dinner Buffet & Overnight Hotel Stay', description: 'Wholesome hot vegetarian dinner and restful night stay.', isOptional: false },
    ],
  },
  {
    dayNumber: 5,
    title: 'DAY 5 — JOGINI WATERFALL & CHRISTMAS CELEBRATION',
    subtitle: 'Scenic Waterfall Trek, Mall Road Festivities & 4:00 PM Return Departure',
    stayLocation: 'Overnight AC Traveller Bus Journey',
    mealsConfig: 'Breakfast Included • No meals during return travel',
    description: 'Wake up to fresh mountain air and breakfast with riverside views. Check out and embark on the picturesque nature trek to Jogini Waterfall. Stroll through the magical Christmas decorations, tree lights, and festivities along Manali Mall Road. Around 4:00 PM, board coaches for the return journey towards Mathura. No food served during transit.',
    items: [
      { orderIndex: 1, time: '08:00 AM', location: 'Hotel Restaurant', activity: 'Riverside Breakfast & Hotel Check-Out', description: 'Morning breakfast with mountain views. Check out with luggage placed safely into coaches.', isOptional: false },
      { orderIndex: 2, time: '09:30 AM', location: 'Vashisht to Jogini Trail', activity: 'Jogini Waterfall Nature Trek', description: 'Scenic pine forest and apple orchard walk to the cascading Jogini Waterfall. Spectacular photography.', isOptional: false },
      { orderIndex: 3, time: '01:00 PM', location: 'Manali Mall Road', activity: 'Christmas Celebrations, Cafés & Final Memories', description: 'Experience Christmas decorations, festive mountain carols, shopping, and final café hopping on Mall Road.', isOptional: false },
      { orderIndex: 4, time: '04:00 PM', location: 'Manali Bus Boarding Point', activity: 'Departure for Mathura (Sharp 4:00 PM)', description: 'Board the AC Traveller bus on time and begin the overnight return journey toward Mathura.', isOptional: false },
      { orderIndex: 5, time: '09:00 PM', location: 'Highway Food Court (Sundernagar / Bilaspur)', activity: 'Dinner Halt (Self-Paid)', description: 'Highway comfort halt. No food served from organizer side during travel time.', isOptional: false },
      { orderIndex: 6, time: '11:00 PM', location: 'Expressway', activity: 'Overnight Road Journey', description: 'Overnight highway travel back to Uttar Pradesh.', isOptional: false },
    ],
  },
  {
    dayNumber: 6,
    title: 'DAY 6 — ARRIVAL AT MATHURA',
    subtitle: 'Safe Arrival at GLA University Campus & Unforgettable Memories',
    stayLocation: 'GLA University Campus / Home',
    mealsConfig: 'Expedition Completed',
    description: 'Early morning arrival and safe drop at GLA University, Mathura. Bid goodbye to fellow travellers with cameras full of memories, shared campfire stories, and lifelong friendships from the Christmas mountain escape.',
    items: [
      { orderIndex: 1, time: '06:00 AM – 08:00 AM', location: 'GLA University, Mathura', activity: 'Arrival & Luggage De-boarding', description: 'Safe arrival at GLA University campus. Collection of luggage and completion of the 6D/5N Christmas Special expedition.', isOptional: false },
    ],
  },
];

async function syncAllPricing() {
  console.log('Synchronizing pricing across TripConfig, Trip, and Settings...');

  // 1. Update TripConfig
  await prisma.tripConfig.upsert({
    where: { id: 'global' },
    update: {
      tripTitle: 'Himalayan Escape – Christmas Special 2026',
      subtitle: '6 Days. 5 Nights. Endless Memories. Celebrate Christmas in the Himalayas.',
      packagePrice: 6200,
      groupPackagePrice: 5800,
      groupSizeThreshold: 3,
      depositPrice: 1000,
      totalCapacity: 50,
      departureDate: '2026-12-24',
      returnDate: '2026-12-29',
      reportingTime: '12:00 PM',
      pickupLocation: 'GLA University, Mathura',
      emergencyHelplines: ['8126854850', '6398412828'],
      announcementActive: false,
    },
    create: {
      id: 'global',
      tripTitle: 'Himalayan Escape – Christmas Special 2026',
      subtitle: '6 Days. 5 Nights. Endless Memories. Celebrate Christmas in the Himalayas.',
      packagePrice: 6200,
      groupPackagePrice: 5800,
      groupSizeThreshold: 3,
      depositPrice: 1000,
      totalCapacity: 50,
      departureDate: '2026-12-24',
      returnDate: '2026-12-29',
      reportingTime: '12:00 PM',
      pickupLocation: 'GLA University, Mathura',
      emergencyHelplines: ['8126854850', '6398412828'],
      announcementActive: false,
    },
  });
  console.log('TripConfig updated to Himalayan Escape – Christmas Special 2026.');

  // 2. Update master Trip
  const trip = await prisma.trip.findFirst();
  if (trip) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        name: 'Himalayan Escape – Christmas Special 2026',
        title: 'HIMALAYAN ESCAPE – CHRISTMAS SPECIAL 2026',
        subtitle: '6 Days. 5 Nights. Endless Memories.',
        origin: 'GLA University, Mathura (Departure: 12:00 PM)',
        destination: 'Kasol, Manikaran, Manali, Solang Valley, Sissu & Jogini Waterfall',
        packagePrice: 6200,
        packagePricePerTraveller: 6200,
        capacity: 50,
        duration: '6 DAYS • 5 NIGHTS',
        startDate: new Date('2026-12-24T12:00:00.000Z'),
        endDate: new Date('2026-12-29T10:00:00.000Z'),
      },
    });
    console.log('Master trip updated to Christmas Special 2026, 50 capacity, 6 Days / 5 Nights.');
  }

  // 3. Update legacy settings keys
  const settingsToUpdate = [
    { key: 'trip_title', value: 'Himalayan Escape – Christmas Special 2026' },
    { key: 'pickup_location', value: 'GLA University, Mathura' },
    { key: 'reporting_time', value: '12:00 PM' },
    { key: 'price_single', value: '6200' },
    { key: 'price_group', value: '5800' },
    { key: 'group_size_threshold', value: '3' },
    { key: 'price_reservation', value: '1000' },
    { key: 'trip_capacity', value: '50' },
    { key: 'departure_date', value: '2026-12-24' },
    { key: 'return_date', value: '2026-12-29' },
  ];

  for (const s of settingsToUpdate) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, category: 'GENERAL' },
    });
  }
  console.log('Legacy settings keys updated.');

  // 4. Update globalSettings
  await prisma.globalSettings.upsert({
    where: { id: 'global_default' },
    update: { tripCapacity: 50 },
    create: { id: 'global_default', tripCapacity: 50 },
  });
  console.log('GlobalSettings capacity updated to 50.');

  // 5. Synchronize Itinerary in Database
  console.log('Synchronizing ItineraryDay and ItineraryItem tables...');
  await prisma.itineraryItem.deleteMany({});
  await prisma.itineraryDay.deleteMany({});

  for (const day of ITINERARY_DAYS) {
    await prisma.itineraryDay.create({
      data: {
        dayNumber: day.dayNumber,
        title: day.title,
        subtitle: day.subtitle,
        stayLocation: day.stayLocation,
        mealsConfig: day.mealsConfig,
        description: day.description,
        isPublic: true,
        items: {
          create: day.items.map(item => ({
            orderIndex: item.orderIndex,
            time: item.time,
            location: item.location,
            activity: item.activity,
            description: item.description,
            isOptional: item.isOptional,
          })),
        },
      },
    });
  }
  console.log(`Successfully synced ${ITINERARY_DAYS.length} days of Christmas Itinerary into database.`);

  console.log('Pricing and Itinerary sync complete!');
}

syncAllPricing().catch(console.error).finally(() => prisma.$disconnect());
