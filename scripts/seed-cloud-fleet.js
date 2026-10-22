const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

const BUS_25_SEATS_LAYOUT = [
  { seatNumber: 'DRIVER', seatType: 'DRIVER', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  { seatNumber: 'CONDUCTOR', seatType: 'CONDUCTOR', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  { seatNumber: 'L1', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L2', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R1', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R2', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L3', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L4', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R3', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R4', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L5', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L6', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R5', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R6', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L7', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L8', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R7', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R8', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L9', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'R9', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'B1', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
  { seatNumber: 'B2', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B3', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B4', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B5', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
];

const INITIAL_BUSES = [
  { busNumber: 'Bus 01', vehicleName: 'Himalayan Eagle (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-001', driverName: 'Rajesh Sharma', conductorName: 'Amit Verma' },
  { busNumber: 'Bus 02', vehicleName: 'Parvati Cruiser (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-002', driverName: 'Sunil Kumar', conductorName: 'Manoj Singh' },
  { busNumber: 'Bus 03', vehicleName: 'Solang Glider (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-003', driverName: 'Virender Rawat', conductorName: 'Rakesh Negi' },
  { busNumber: 'Bus 04', vehicleName: 'Rohtang Explorer (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-004', driverName: 'Kuldeep Thakur', conductorName: 'Deepak Dogra' },
];

const ITINERARY_DAYS = [
  {
    dayNumber: 1,
    title: 'Departure & The Highway Ascent',
    subtitle: 'Mathura to Manali via Chandigarh & Bilaspur',
    stayLocation: 'Overnight in Luxury Tourist Coach',
    mealsConfig: 'Dinner stop en-route (self-sponsored)',
    description: 'Assemble near GLA Main Gate, Mathura at 04:30 PM. Board assigned luxury 2x2 AC tourist coach after contactless QR check-in and luggage tagging. Overnight scenic transit through North India towards Himachal Pradesh.',
    items: [
      { time: '04:30 PM', location: 'GLA Main Gate, NH-2 Mathura', activity: 'Reporting, verification & boarding pass validation', description: 'Coordinators verify IDs, collect remaining balance, and grant coach boarding tokens.' },
      { time: '05:30 PM', location: 'Mathura Highway', activity: 'Expedition Departure', description: 'Fleet leaves Mathura in convoy formation towards Delhi Western Peripheral Expressway.' },
      { time: '09:30 PM', location: 'Murthal / Highway Food Plaza', activity: 'Dinner & Refreshment Halt', description: '45-minute hygienic dinner stop.' },
    ]
  },
  {
    dayNumber: 2,
    title: 'Arrival in Manali & Old Manali Exploration',
    subtitle: 'Check-in, Rest & Mall Road Evening',
    stayLocation: 'Snow Valley Pine Resort, Manali',
    mealsConfig: 'Buffet Dinner Included',
    description: 'Morning arrival in Manali valley. Check in at resort, acclimatize with warm tea, and spend the evening strolling through the vibrant Old Manali market and Mall Road.',
    items: [
      { time: '09:00 AM', location: 'Manali Foothills', activity: 'Hotel Check-In & Welcome Drink', description: 'Room allocations, refreshing showers, and rest after overnight journey.' },
      { time: '02:30 PM', location: 'Hidimba Devi & Manu Temple', activity: 'Cedar Forest & Heritage Walk', description: 'Visit historic wood-and-stone pagodas surrounded by giant deodar pines.' },
      { time: '05:30 PM', location: 'Manali Mall Road & Tibetan Market', activity: 'Evening Leisure & Café Culture', description: 'Explore local handicrafts, cafes, and scenic viewpoints.' },
      { time: '08:30 PM', location: 'Resort Dining Hall', activity: 'Grand Buffet Dinner', description: 'Lavish hot North Indian dinner buffet.' },
    ]
  },
  {
    dayNumber: 3,
    title: 'Solang Valley & High Altitude Mountain Trails',
    subtitle: 'Snow Excursion & Rohtang Foothills',
    stayLocation: 'Snow Valley Pine Resort, Manali',
    mealsConfig: 'Buffet Breakfast & Dinner Included',
    description: 'Full-day mountain adventure to Solang Valley and the Atal Tunnel entryway (subject to weather clearances). Enjoy snow views and alpine breezes.',
    items: [
      { time: '08:00 AM', location: 'Resort Dining Hall', activity: 'Buffet Breakfast', description: 'Nutritious morning spread before mountain departure.' },
      { time: '09:30 AM', location: 'Solang Valley', activity: 'Snow View & Adventure Arena', description: 'Optional paragliding, ATV rides, and snow trail exploration.' },
      { time: '02:00 PM', location: 'Atal Tunnel (South Portal)', activity: 'Engineering Marvel & Sissu Vista', description: 'Scenic drive through the Himalayan highway pass (clearance permitting).' },
      { time: '08:00 PM', location: 'Resort Lawn', activity: 'Music, Bonfire & Buffet Dinner', description: 'Group bonding, folk music, and warm dinner.' },
    ]
  },
  {
    dayNumber: 4,
    title: 'Transit to Parvati Valley & Kasol Riverside',
    subtitle: 'Kullu Shawl Weavers & Riverside Check-In',
    stayLocation: 'Parvati Riverside Alpine Retreat, Kasol',
    mealsConfig: 'Buffet Breakfast & Dinner Included',
    description: 'Scenic transit from Manali down along the Beas River and up into the steep green cliffs of Parvati Valley. Check in at riverside property in Kasol.',
    items: [
      { time: '08:30 AM', location: 'Manali Resort', activity: 'Breakfast & Checkout', description: 'Board coaches for transit to Parvati Valley.' },
      { time: '11:30 AM', location: 'Kullu Valley', activity: 'Kullu Riverbanks & Shawl Emporium', description: 'Brief stop along the river for photos and local woolens.' },
      { time: '03:30 PM', location: 'Kasol Riverside Retreat', activity: 'Check-in & River Trail Walk', description: 'Settle in riverside rooms, listen to the roaring Parvati river, and walk to Chalal village bridge.' },
      { time: '08:30 PM', location: 'Kasol Campfire Lawn', activity: 'Acoustic Bonfire & Dinner', description: 'Fireside gathering under starlit Himalayan sky.' },
    ]
  },
  {
    dayNumber: 5,
    title: 'Manikaran Sahib Springs & Kasol Café Trail',
    subtitle: 'Natural Hot Springs & Evening Return Transit',
    stayLocation: 'Overnight in Luxury Tourist Coach',
    mealsConfig: 'Buffet Breakfast Included',
    description: 'Visit the revered Manikaran Sahib Gurudwara and natural boiling sulfur springs. Leisure afternoon in Kasol market before overnight return journey.',
    items: [
      { time: '08:30 AM', location: 'Kasol Resort', activity: 'Breakfast & Luggage Check', description: 'Morning breakfast buffet by the river.' },
      { time: '10:00 AM', location: 'Manikaran Sahib', activity: 'Gurudwara & Healing Springs', description: 'Visit historic hot springs and Langar hall.' },
      { time: '02:00 PM', location: 'Kasol Market & German Bakeries', activity: 'Free Leisure & Cafe Hopping', description: 'Last-minute souvenirs and wood-fired pizzas.' },
      { time: '05:30 PM', location: 'Kasol Parking Bay', activity: 'Fleet Boarding & Homeward Departure', description: 'Convoys begin overnight highway descent towards Punjab and UP.' },
    ]
  },
  {
    dayNumber: 6,
    title: 'Homeward Arrival in Mathura',
    subtitle: 'Near GLA Main Gate Arrival',
    stayLocation: 'Home',
    mealsConfig: 'Breakfast stop en-route (self-sponsored)',
    description: 'Morning return to Mathura. Deboard safely near the GLA University Main Gate with indelible mountain memories, new friendships, and unforgettable stories.',
    items: [
      { time: '08:00 AM', location: 'Delhi-NCR Peripheral', activity: 'Morning Highway Tea Halt', description: 'Refreshment break.' },
      { time: '11:00 AM', location: 'GLA Main Gate, Mathura', activity: 'Arrival & Safe Expedition Conclusion', description: 'Luggage retrieval and farewell.' },
    ]
  }
];

async function seedCloudDatabase() {
  console.log('======================================================');
  console.log('⚡ SEEDING SUPABASE POSTGRESQL DATABASE');
  console.log('======================================================\n');

  // 1. Seed or Upsert Admin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@glaescape.in';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'GLAAdmin@2026#Secure';
  const passwordHash = hashPassword(adminPassword);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Expedition Lead Coordinator', role: 'SUPER_ADMIN' },
    create: { email: adminEmail, passwordHash, name: 'Expedition Lead Coordinator', role: 'SUPER_ADMIN' },
  });
  console.log(`✓ Admin user confirmed: ${admin.email}`);

  // 2. GlobalSettings (Dynamic Capacity Control)
  const globalSettings = await prisma.globalSettings.upsert({
    where: { id: 'global_default' },
    update: { tripCapacity: 75, siteName: 'Himalayan Escape — Student Mountain Expedition' },
    create: { id: 'global_default', tripCapacity: 75, siteName: 'Himalayan Escape — Student Mountain Expedition' },
  });
  console.log(`✓ GlobalSettings initialized with tripCapacity = ${globalSettings.tripCapacity}`);

  // 3. BusTemplate (25 Seats Standard 2x2)
  const busTemplate = await prisma.busTemplate.upsert({
    where: { slug: 'standard-coach-25' },
    update: {
      name: 'Standard Tourist Coach (25 Seats)',
      layoutType: '2x2_STANDARD',
      totalSeats: 25,
      passengerCapacity: 23,
      driverSeats: 1,
      conductorSeats: 1,
      description: 'Standard 2x2 luxury AC coach with 23 passenger seats, 1 driver, and 1 conductor seat.',
      seatLayoutJson: JSON.stringify(BUS_25_SEATS_LAYOUT),
    },
    create: {
      slug: 'standard-coach-25',
      name: 'Standard Tourist Coach (25 Seats)',
      layoutType: '2x2_STANDARD',
      totalSeats: 25,
      passengerCapacity: 23,
      driverSeats: 1,
      conductorSeats: 1,
      description: 'Standard 2x2 luxury AC coach with 23 passenger seats, 1 driver, and 1 conductor seat.',
      seatLayoutJson: JSON.stringify(BUS_25_SEATS_LAYOUT),
    },
  });
  console.log(`✓ BusTemplate confirmed: ${busTemplate.name}`);

  // 4. Primary Trip (Manali × Kasol)
  const inclusions = JSON.stringify([
    "Roundtrip Luxury 2x2 AC Tourist Bus transport from Near GLA Main Gate, Mathura to Manali, Kasol & back",
    "2 Nights accommodation in 3-star resort in Manali",
    "2 Nights accommodation in premium riverside resort/camp in Kasol",
    "Configured meals: Daily Breakfast & Dinner at hotels as specified in itinerary",
    "Complete Manali sightseeing: Hidimba Devi, Manu Temple, Van Vihar, Old Manali, Mall Road",
    "Solang Valley & Atal Tunnel excursion (subject to road & weather clearance)",
    "Kasol & Manikaran Sahib Gurudwara with natural hot spring visit",
    "Evening campfire & group bonding session in Kasol",
    "Dedicated 24/7 student trip coordinators & experienced mountain chauffeurs",
    "Interactive seat booking with guaranteed reserved bus seat",
    "Digital QR ticket & live verification pass for hassle-free boarding",
    "First aid kit & primary emergency coordination assistance"
  ]);

  const exclusions = JSON.stringify([
    "Optional adventure activities: Paragliding, River Rafting, ATV ride, Cable Car, Zorbing",
    "Any personal expenses: Shopping, room service, laundry, extra beverages, tips",
    "Meals and snacks during highway transit stops (unless specifically stated)",
    "Heater charges at hotels or special room service requests",
    "Monument entry fees, camera charges or temple donation tokens",
    "Emergency medical evacuation or costs incurred due to natural calamities, landslides or road blockages",
    "Anything not specifically listed under inclusions"
  ]);

  const importantInfo = JSON.stringify({
    reportingInstructions: "Pickup & Reporting: Near GLA Main Gate (Pickup Bay area), NH-2, Mathura at 04:30 PM. Digital QR pass scanning begins 1 hour prior to departure.",
    luggageRules: "1 main bag (up to 15kg) to be loaded into bus luggage hold, plus 1 small cabin backpack.",
    idRequirements: "Student ID Card / College ID + Government ID (Aadhaar / Driving License / Voter ID) mandatory.",
    safetyNotes: "Follow coordinator instructions. Alcohol/drugs strictly prohibited on student excursions.",
    weatherInfo: "Manali and Kasol temperatures can drop to 2°C at night. Carry heavy thermals, jacket, gloves, and comfortable walking shoes."
  });

  const trip = await prisma.trip.upsert({
    where: { slug: 'manali-kasol' },
    update: {
      name: 'Himalayan Escape — Student Mountain Expedition',
      title: 'HIMALAYAN ESCAPE (MANALI × KASOL)',
      shortName: 'Manali + Kasol',
      subtitle: 'Mountains. Friends. Adventure. Memories.',
      description: 'Experience 6 days of pure mountain freedom across snow-capped Himalayan peaks, Rohtang foothills, pine forests, and Parvati riverbanks with fellow students.',
      duration: '6 DAYS • 5 NIGHTS',
      origin: 'Pickup & Reporting: Near GLA Main Gate, Mathura',
      destination: 'Manali & Kasol, Himachal Pradesh',
      startingLocation: 'Near GLA Main Gate, Mathura',
      category: 'Himalayan',
      capacity: 75,
      featured: true,
      heroImage: '/images/hero-himalayas.jpg',
      thumbnailImage: '/images/solang-valley.jpg',
      galleryImages: JSON.stringify(['/images/hero-himalayas.jpg', '/images/solang-valley.jpg', '/images/kasol-river.jpg']),
      packagePricePerTraveller: 6200,
      reservationAmountPerTraveller: 1000,
      packagePrice: 6200,
      reservationAmount: 1000,
      balanceDueDatePolicy: 'BEFORE_BOARDING',
      balanceDueType: 'BEFORE_BOARDING',
      balanceDueDaysBefore: 2,
      minTravellersPerBooking: 1,
      maxTravellersPerBooking: 6,
      seatSelectionEnabled: true,
      seatHoldDurationMinutes: 10,
      seatHoldMinutes: 10,
      seatAssignmentMode: 'MANUAL_SELECTION',
      inclusions,
      exclusions,
      importantInfo,
      startDate: new Date('2026-11-15T16:00:00Z'),
      endDate: new Date('2026-11-20T23:00:00Z'),
      status: 'OPEN_FOR_BOOKING',
    },
    create: {
      slug: 'manali-kasol',
      name: 'Himalayan Escape — Student Mountain Expedition',
      title: 'HIMALAYAN ESCAPE (MANALI × KASOL)',
      shortName: 'Manali + Kasol',
      subtitle: 'Mountains. Friends. Adventure. Memories.',
      description: 'Experience 6 days of pure mountain freedom across snow-capped Himalayan peaks, Rohtang foothills, pine forests, and Parvati riverbanks with fellow students.',
      duration: '6 DAYS • 5 NIGHTS',
      origin: 'Pickup & Reporting: Near GLA Main Gate, Mathura',
      destination: 'Manali & Kasol, Himachal Pradesh',
      startingLocation: 'Near GLA Main Gate, Mathura',
      category: 'Himalayan',
      capacity: 75,
      featured: true,
      heroImage: '/images/hero-himalayas.jpg',
      thumbnailImage: '/images/solang-valley.jpg',
      galleryImages: JSON.stringify(['/images/hero-himalayas.jpg', '/images/solang-valley.jpg', '/images/kasol-river.jpg']),
      packagePricePerTraveller: 6200,
      reservationAmountPerTraveller: 1000,
      packagePrice: 6200,
      reservationAmount: 1000,
      balanceDueDatePolicy: 'BEFORE_BOARDING',
      balanceDueType: 'BEFORE_BOARDING',
      balanceDueDaysBefore: 2,
      minTravellersPerBooking: 1,
      maxTravellersPerBooking: 6,
      seatSelectionEnabled: true,
      seatHoldDurationMinutes: 10,
      seatHoldMinutes: 10,
      seatAssignmentMode: 'MANUAL_SELECTION',
      inclusions,
      exclusions,
      importantInfo,
      startDate: new Date('2026-11-15T16:00:00Z'),
      endDate: new Date('2026-11-20T23:00:00Z'),
      status: 'OPEN_FOR_BOOKING',
    },
  });
  console.log(`✓ Master Trip confirmed: ${trip.title} (${trip.id})`);

  // 5. Seed Packages (Single ₹6,200, Group ₹6,200)
  const packages = [
    {
      tripId: trip.id,
      name: 'SINGLE',
      slug: 'single',
      price: 6200,
      reservationAmount: 1000,
      travellersCount: 1,
      description: 'Single traveller seat with roundtrip luxury 2x2 AC transport, 3-star resort stay, daily breakfast & dinner, sightseeing and coordinator support.',
      features: JSON.stringify(['1 Dedicated Bus Seat', 'Manali & Kasol Hotel Stay', 'Breakfast & Dinner Included', 'Digital QR Boarding Pass', 'Trip Coordinator Support']),
    },
    {
      tripId: trip.id,
      name: 'GROUP',
      slug: 'group',
      price: 6200,
      reservationAmount: 1000,
      travellersCount: 1,
      description: 'Group booking for friends travelling together. ₹6,200 per traveller with adjacent seat recommendation, unified dashboard, and individual QR passes.',
      features: JSON.stringify(['Same Bus Allocation', 'Adjacent Seat Recommendations', 'Shared Booking Dashboard', 'All Hotel Stays & Meals Included', 'Individual Digital Passes']),
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: { price: pkg.price, reservationAmount: pkg.reservationAmount, description: pkg.description, features: pkg.features },
      create: pkg,
    });
  }
  console.log(`✓ Seeded ${packages.length} Packages (Single ₹6,200, Group ₹6,200)`);

  // 6. Seed 4 Buses and 100 Seats (25 per bus: 23 Passenger + 1 Driver + 1 Conductor)
  let totalSeatsCreated = 0;
  for (let i = 0; i < INITIAL_BUSES.length; i++) {
    const busDef = INITIAL_BUSES[i];
    let bus = await prisma.bus.findFirst({
      where: { busNumber: busDef.busNumber, tripId: trip.id },
    });

    if (!bus) {
      bus = await prisma.bus.create({
        data: {
          tripId: trip.id,
          templateId: busTemplate.id,
          busNumber: busDef.busNumber,
          vehicleName: busDef.vehicleName,
          vehicleNumber: busDef.vehicleNumber,
          physicalCapacity: 25,
          passengerCapacity: 23,
          driverSeats: 1,
          conductorSeats: 1,
          driverName: busDef.driverName,
          conductorName: busDef.conductorName,
          orderIndex: i + 1,
          status: 'ACTIVE',
        },
      });
    }

    // Seed 25 seats for this bus
    for (const seatDef of BUS_25_SEATS_LAYOUT) {
      await prisma.busSeat.upsert({
        where: {
          busId_seatNumber: {
            busId: bus.id,
            seatNumber: seatDef.seatNumber,
          },
        },
        update: {
          seatType: seatDef.seatType,
          rowNumber: seatDef.rowNumber,
          side: seatDef.side,
          position: seatDef.position,
          isBookable: seatDef.isBookable,
        },
        create: {
          busId: bus.id,
          seatNumber: seatDef.seatNumber,
          seatType: seatDef.seatType,
          rowNumber: seatDef.rowNumber,
          side: seatDef.side,
          position: seatDef.position,
          isBookable: seatDef.isBookable,
          isAvailable: seatDef.isBookable,
          status: seatDef.isBookable ? 'AVAILABLE' : (seatDef.seatType === 'DRIVER' ? 'DRIVER' : 'CONDUCTOR'),
        },
      });
      totalSeatsCreated++;
    }

    // Upsert transport record
    const existingTransport = await prisma.transport.findFirst({ where: { busId: bus.id } });
    if (!existingTransport) {
      await prisma.transport.create({
        data: {
          tripId: trip.id,
          busId: bus.id,
          vehicleType: 'Luxury 2x2 AC Tourist Coach',
          vehicleNumber: busDef.vehicleNumber,
          driverName: busDef.driverName || 'Chauffeur',
          driverPhone: '7017936338',
          conductorName: busDef.conductorName || 'Conductor',
          conductorPhone: '9368287947',
          route: 'Near GLA Main Gate Mathura -> Manali -> Kasol -> Mathura',
          status: 'READY',
        },
      });
    }
  }
  console.log(`✓ Seeded ${INITIAL_BUSES.length} Buses with 100 configured BusSeats (92 passenger + 4 driver + 4 conductor)`);

  // 7. Seed Complete 6-Day Itinerary
  for (const dayDef of ITINERARY_DAYS) {
    const day = await prisma.itineraryDay.upsert({
      where: {
        tripId_dayNumber: {
          tripId: trip.id,
          dayNumber: dayDef.dayNumber,
        },
      },
      update: {
        title: dayDef.title,
        subtitle: dayDef.subtitle,
        stayLocation: dayDef.stayLocation,
        mealsConfig: dayDef.mealsConfig,
        description: dayDef.description,
      },
      create: {
        tripId: trip.id,
        dayNumber: dayDef.dayNumber,
        title: dayDef.title,
        subtitle: dayDef.subtitle,
        stayLocation: dayDef.stayLocation,
        mealsConfig: dayDef.mealsConfig,
        description: dayDef.description,
        isPublic: true,
      },
    });

    for (let idx = 0; idx < dayDef.items.length; idx++) {
      const itemDef = dayDef.items[idx];
      const existingItem = await prisma.itineraryItem.findFirst({
        where: { dayId: day.id, activity: itemDef.activity },
      });

      if (!existingItem) {
        await prisma.itineraryItem.create({
          data: {
            dayId: day.id,
            time: itemDef.time,
            location: itemDef.location,
            activity: itemDef.activity,
            description: itemDef.description,
            isOptional: false,
            orderIndex: idx + 1,
          },
        });
      }
    }
  }
  console.log(`✓ Seeded all 6 Itinerary Days with activities and schedules`);

  // 8. Hotels
  let manaliHotel = await prisma.hotel.findFirst({ where: { location: 'Manali', tripId: trip.id } });
  if (!manaliHotel) {
    manaliHotel = await prisma.hotel.create({
      data: {
        tripId: trip.id,
        name: 'Snow Valley Pine Resort & Spa',
        location: 'Manali',
        address: 'Log Huts Area, Old Manali Road, Manali, HP',
        contactPerson: 'Vikram Negi',
        contactPhone: '7017936338',
      },
    });
  }

  let kasolHotel = await prisma.hotel.findFirst({ where: { location: 'Kasol', tripId: trip.id } });
  if (!kasolHotel) {
    kasolHotel = await prisma.hotel.create({
      data: {
        tripId: trip.id,
        name: 'Parvati Riverside Alpine Retreat',
        location: 'Kasol',
        address: 'Riverside Road, Near Old Bridge, Kasol, HP',
        contactPerson: 'Mohit Sharma',
        contactPhone: '9368287947',
      },
    });
  }
  console.log(`✓ Seeded Manali & Kasol Hotels`);

  // Final Summary Check
  const [trips, buses, seats, packagesCount, daysCount, settingsCount] = await Promise.all([
    prisma.trip.count(),
    prisma.bus.count(),
    prisma.busSeat.count(),
    prisma.package.count(),
    prisma.itineraryDay.count(),
    prisma.globalSettings.count(),
  ]);

  console.log('\n📊 SUPABASE CLOUD DATABASE SNAPSHOT:');
  console.log({
    trips,
    buses,
    seats,
    packages: packagesCount,
    itineraryDays: daysCount,
    globalSettings: settingsCount,
  });

  console.log('\n🎉 Supabase PostgreSQL database seeding completed with 100% success!\n');
}

seedCloudDatabase()
  .catch((err) => {
    console.error('❌ Error seeding Supabase PostgreSQL:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
