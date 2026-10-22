// Brand, Trip and Business Constants for HIMALAYAN ESCAPE — STUDENT MOUNTAIN EXPEDITION

export const TRIP_METADATA = {
  name: 'Himalayan Escape — Student Mountain Expedition',
  title: 'HIMALAYAN ESCAPE (MANALI × KASOL)',
  duration: '6 DAYS • 5 NIGHTS',
  tagline: 'Mountains. Friends. Adventure. Memories.',
  origin: 'Pickup & Reporting: Near GLA Main Gate, Mathura',
  destination: 'Manali & Kasol, Himachal Pradesh',
  capacity: 75,
  dates: 'November 15 - November 20, 2026',
  reportingLocation: 'Pickup & Reporting: Near GLA Main Gate, Mathura',
  disclaimer: 'Independent student-organized expedition. Not an officially sponsored university event. Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions, local conditions, or safety requirements. Weather-dependent and road-dependent activities (such as Atal Tunnel / Sissu snow trails and river rafting) are subject to official clearances and cannot be guaranteed.',
};

export const PRICING_DEFAULTS = {
  pricePerTraveller: 6200, // ₹6,200 PER TRAVELLER - single source of truth
  singlePrice: 6200,
  reservationAmountPerTraveller: 1000, // ₹1,000 reservation deposit per traveller
  reservationAmount: 1000,
  remainingBalancePerTraveller: 5200, // ₹5,200 remaining balance per traveller
  seatHoldMinutes: 10, // 10-minute hold duration
};

export const CONTACT_INFO = {
  coordinatorPhone1: '7017936338',
  coordinatorPhone2: '9368287947',
  whatsapp1: '917017936338',
  whatsapp2: '919368287947',
  emergencyCoordinator: '7017936338',
  emergencySupport: '9368287947',
  police: '100',
  ambulance: '108',
  email: 'trips@glaescape.in',
  office: 'GLA University, 17km Stone, NH-2, Mathura-Delhi Road, Mathura, UP 281406',
};

// 25-seat Bus Configuration
// 1 Driver + 1 Conductor + 23 passenger seats
// Pairs: L1/L2, L3/L4, L5/L6, L7/L8, L9 (Left)
// Pairs: R1/R2, R3/R4, R5/R6, R7/R8, R9 (Right)
// Rear row: B1, B2, B3, B4, B5
export interface SeatTemplate {
  seatNumber: string;
  seatType: 'DRIVER' | 'CONDUCTOR' | 'PASSENGER';
  rowNumber: number;
  side: 'LEFT' | 'RIGHT' | 'REAR' | 'FRONT';
  position: 'WINDOW' | 'AISLE' | 'REAR' | 'CABIN';
  isBookable: boolean;
}

export const BUS_25_SEATS_LAYOUT: SeatTemplate[] = [
  // Front Cabin
  { seatNumber: 'DRIVER', seatType: 'DRIVER', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  { seatNumber: 'CONDUCTOR', seatType: 'CONDUCTOR', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  
  // Row 1: Pair L1 (Window), L2 (Aisle) | Pair R1 (Aisle), R2 (Window)
  { seatNumber: 'L1', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L2', seatType: 'PASSENGER', rowNumber: 1, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R1', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R2', seatType: 'PASSENGER', rowNumber: 1, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 2: Pair L3 (Window), L4 (Aisle) | Pair R3 (Aisle), R4 (Window)
  { seatNumber: 'L3', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L4', seatType: 'PASSENGER', rowNumber: 2, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R3', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R4', seatType: 'PASSENGER', rowNumber: 2, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 3: Pair L5 (Window), L6 (Aisle) | Pair R5 (Aisle), R6 (Window)
  { seatNumber: 'L5', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L6', seatType: 'PASSENGER', rowNumber: 3, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R5', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R6', seatType: 'PASSENGER', rowNumber: 3, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 4: Pair L7 (Window), L8 (Aisle) | Pair R7 (Aisle), R8 (Window)
  { seatNumber: 'L7', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L8', seatType: 'PASSENGER', rowNumber: 4, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R7', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R8', seatType: 'PASSENGER', rowNumber: 4, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 5: Single side seats L9 (Left Window) | R9 (Right Window)
  { seatNumber: 'L9', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'R9', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 6: Rear 5 Seats B1-B5
  { seatNumber: 'B1', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
  { seatNumber: 'B2', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B3', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B4', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B5', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
];

export const INITIAL_BUSES = [
  { busNumber: 'Bus 01', vehicleName: 'Himalayan Eagle (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-001', driverName: 'Rajesh Sharma', conductorName: 'Amit Verma' },
  { busNumber: 'Bus 02', vehicleName: 'Parvati Cruiser (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-002', driverName: 'Sunil Kumar', conductorName: 'Manoj Singh' },
  { busNumber: 'Bus 03', vehicleName: 'Solang Glider (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-003', driverName: 'Virender Rawat', conductorName: 'Rakesh Negi' },
  { busNumber: 'Bus 04', vehicleName: 'Rohtang Explorer (2x2 AC Luxury)', vehicleNumber: 'UP-85-GLA-004', driverName: 'Kuldeep Thakur', conductorName: 'Deepak Dogra' },
];

export const ITINERARY_DAYS = [
  {
    dayNumber: 1,
    title: 'DAY 1 — GLA TO MANALI',
    subtitle: 'Reporting, QR Check-in & Departure',
    stayLocation: 'Bus / Overnight journey',
    mealsConfig: 'Dinner halt en route (Self-paid)',
    description: 'Assemble at GLA University Mathura campus. Complete QR digital ticket verification, seat allotment check, luggage loading, and pre-departure safety briefing before boarding our luxury AC coaches.',
    items: [
      { time: '04:30 PM', location: 'GLA University Bus Bay', activity: 'Traveller reporting at GLA University', description: 'Reporting and document/QR verification at GLA campus.', isOptional: false },
      { time: '05:00 PM', location: 'GLA Campus', activity: 'QR & Seat Verification', description: 'Digital QR scanning, luggage loading and tag assignment.', isOptional: false },
      { time: '05:45 PM', location: 'GLA Auditorium Bay', activity: 'Group Briefing & Safety Guidelines', description: 'Coordinator introduction, trip kit distribution and route guidelines.', isOptional: false },
      { time: '06:15 PM', location: 'GLA Main Gate', activity: 'Bus Departure', description: 'Flag-off from Mathura toward Western Himalayan foothills.', isOptional: false },
      { time: '10:30 PM', location: 'Highway Food Plaza (Murthal/Karnal)', activity: 'Dinner Break & Freshen-up', description: 'Sanitized food stop and refreshment break.', isOptional: false },
      { time: '11:45 PM', location: 'En Route Manali', activity: 'Overnight Road Journey', description: 'Comfortable reclining seats, ambient cabin lighting, scenic highway drive.', isOptional: false },
    ],
  },
  {
    dayNumber: 2,
    title: 'DAY 2 — MANALI ARRIVAL + LOCAL SIGHTSEEING',
    subtitle: 'Temples, Old Manali Cafes & Mall Road',
    stayLocation: 'Manali Resort / Hotel',
    mealsConfig: 'Dinner Included at Resort',
    description: 'Wake up to the pine forests and crisp Himalayan morning air of the Beas Valley. Check into the resort, rest, and explore ancient temples, Old Manali lanes, and Mall Road.',
    items: [
      { time: '09:30 AM', location: 'Manali', activity: 'Manali Arrival & Resort Check-in', description: 'Warm welcome drink, room allotment and freshen up.', isOptional: false },
      { time: '11:00 AM', location: 'Manali Resort', activity: 'Breakfast & Rest', description: 'Relax after the overnight road journey.', isOptional: false },
      { time: '02:00 PM', location: 'Dhungri Forest', activity: 'Hidimba Devi Temple & Manu Temple', description: 'Ancient pagoda-style wooden temple dedicated to Goddess Hidimba amidst giant deodars.', isOptional: false },
      { time: '04:30 PM', location: 'Old Manali', activity: 'Old Manali Walk & Van Vihar', description: 'Charming wooden houses, boho cafes, apple orchards and Van Vihar river park.', isOptional: false },
      { time: '06:30 PM', location: 'Manali Mall Road', activity: 'Mall Road & Tibetan Monastery Market', description: 'Evening stroll, handcrafted woollens, hot chocolate and street photography.', isOptional: false },
      { time: '08:30 PM', location: 'Resort Dining Hall', activity: 'Group Dinner & Overnight Manali', description: 'Buffet dinner and overnight stay in Manali.', isOptional: false },
    ],
  },
  {
    dayNumber: 3,
    title: 'DAY 3 — SOLANG VALLEY + ATAL TUNNEL / SISSU',
    subtitle: 'Snow Peaks, Adventure & Lahaul Valley',
    stayLocation: 'Manali Resort / Hotel',
    mealsConfig: 'Breakfast & Dinner Included',
    description: 'A thrilling high-altitude excursion through Solang Valley and the engineering marvel Atal Tunnel into the pristine trans-Himalayan landscape of Sissu in Lahaul Valley.',
    items: [
      { time: '07:30 AM', location: 'Resort', activity: 'Buffet Breakfast', description: 'Hearty breakfast before heading towards high altitude passes.', isOptional: false },
      { time: '08:45 AM', location: 'Solang Valley', activity: 'Solang Valley Snow Point', description: 'Spectacular mountain bowl known for snow slopes, paragliding and zorbing.', isOptional: false },
      { time: '11:00 AM', location: 'Solang Valley', activity: 'Optional Adventure Activities', description: 'Paragliding, ATV rides, and cable car ropeway (optional, payable on-site).', isOptional: true },
      { time: '01:30 PM', location: 'Atal Tunnel (9.02 km)', activity: 'Atal Tunnel Crossing', description: 'Drive through the world-famous high-altitude highway tunnel.', isOptional: false },
      { time: '02:30 PM', location: 'Sissu, Lahaul Valley', activity: 'Sissu Waterfall & Valley Exploration', description: 'Subject to weather, road conditions, permits and local restrictions. Untamed Himalayan beauty across Pir Panjal.', isOptional: false },
      { time: '06:30 PM', location: 'Resort', activity: 'Return to Manali & Dinner', description: 'Hot dinner buffet and musical chill session at resort.', isOptional: false },
    ],
  },
  {
    dayNumber: 4,
    title: 'DAY 4 — MANALI TO KASOL',
    subtitle: 'Rafting at Kullu & Parvati Valley Vibe',
    stayLocation: 'Kasol Riverside Camp / Resort',
    mealsConfig: 'Breakfast & Dinner Included',
    description: 'Descend along the Beas River to Kullu with an optional white-water rafting stop, then branch into the enchanting Parvati Valley toward Kasol.',
    items: [
      { time: '08:00 AM', location: 'Resort', activity: 'Breakfast & Hotel Checkout', description: 'Check-out from Manali and board coaches toward Kullu.', isOptional: false },
      { time: '10:30 AM', location: 'Kullu (Babeli/Pirdi)', activity: 'Optional Beas River Rafting & Shawl Factory', description: 'Exciting river rafting with certified guides (optional) and authentic Kullu weavers visit.', isOptional: true },
      { time: '01:30 PM', location: 'Bhuntar to Jari', activity: 'Drive into Parvati Valley', description: 'Scenic mountain canyon drive following the turquoise Parvati River.', isOptional: false },
      { time: '03:30 PM', location: 'Kasol', activity: 'Kasol Hotel / Riverside Check-in', description: 'Check-in and soak in the tranquil pine and cedar environment.', isOptional: false },
      { time: '05:00 PM', location: 'Kasol Village', activity: 'Kasol Market & Riverside Cafes', description: 'Explore German bakeries, Israeli cuisine, hippie craft shops, and Parvati riverbanks.', isOptional: false },
      { time: '08:30 PM', location: 'Kasol Camp/Hotel', activity: 'Group Dinner & Overnight Kasol', description: 'Dinner and peaceful alpine stay in Kasol.', isOptional: false },
    ],
  },
  {
    dayNumber: 5,
    title: 'DAY 5 — KASOL + MANIKARAN SAHIB',
    subtitle: 'Sacred Hot Springs, Chalal Pine Trails & Campfire',
    stayLocation: 'Kasol Riverside Camp / Resort',
    mealsConfig: 'Breakfast & Dinner Included',
    description: 'Immerse in spirituality at the historic Manikaran Sahib Gurudwara and Shiva Temple natural hot springs, followed by a hike along the Parvati trail to Chalal and an evening campfire.',
    items: [
      { time: '08:00 AM', location: 'Kasol', activity: 'Breakfast with Valley Views', description: 'Fresh morning mountain breakfast.', isOptional: false },
      { time: '09:30 AM', location: 'Manikaran Sahib', activity: 'Manikaran Sahib Gurudwara & Hot Springs', description: 'Visit the revered Sikh shrine, Shiva temple, natural boiling sulphur springs, and Langar.', isOptional: false },
      { time: '01:00 PM', location: 'Manikaran Market', activity: 'Local Market & Handicrafts', description: 'Local bazaar exploration and traditional stone work.', isOptional: false },
      { time: '03:30 PM', location: 'Kasol to Chalal', activity: 'Optional Chalal Trail Walk', description: 'Gentle 1.5 km pine forest suspension bridge walk across Parvati river subject to weather.', isOptional: true },
      { time: '07:00 PM', location: 'Kasol Grounds', activity: 'Campfire, Group Games & Music', description: 'Fun interactive games, photography session, stories, and shared memories.', isOptional: false },
      { time: '08:45 PM', location: 'Kasol Resort', activity: 'Farewell Gala Dinner', description: 'Special mountain feast dinner and overnight stay.', isOptional: false },
    ],
  },
  {
    dayNumber: 6,
    title: 'DAY 6 — KASOL TO GLA',
    subtitle: 'Return Journey & Fond Memories',
    stayLocation: 'Home / GLA Mathura',
    mealsConfig: 'Breakfast Included',
    description: 'After breakfast and group photos, embark on the scenic return journey through Himachal toward Mathura, concluding an unforgettable college expedition.',
    items: [
      { time: '07:30 AM', location: 'Kasol', activity: 'Breakfast & Hotel Checkout', description: 'Farewell breakfast and coach boarding.', isOptional: false },
      { time: '08:30 AM', location: 'Parvati Valley', activity: 'Return Journey toward GLA University', description: 'Scenic drive descending through Mandi and Chandigarh highway.', isOptional: false },
      { time: '02:00 PM', location: 'Highway Restaurant', activity: 'Lunch & Freshen-up Halt', description: 'Group lunch break en route.', isOptional: false },
      { time: '06:00 PM', location: 'En route Delhi-Mathura', activity: 'Trip Feedback & Digital Ticket Archive', description: 'Share photos, submit trip feedback, and swap social handles.', isOptional: false },
      { time: '11:00 PM', location: 'GLA University Mathura', activity: 'Arrival at GLA University & Trip Completion', description: 'Safe arrival back at GLA campus. End of the Himalayan Escape!', isOptional: false },
    ],
  },
];

export const INCLUSIONS_LIST = [
  'Roundtrip Luxury 2x2 AC Tourist Bus transport from GLA University to Manali, Kasol & back',
  '2 Nights accommodation in 3-star resort in Manali',
  '2 Nights accommodation in premium riverside resort/camp in Kasol',
  'Configured meals: Daily Breakfast & Dinner at hotels as specified in itinerary',
  'Complete Manali sightseeing: Hidimba Devi, Manu Temple, Van Vihar, Old Manali, Mall Road',
  'Solang Valley & Atal Tunnel excursion (subject to road & weather clearance)',
  'Kasol & Manikaran Sahib Gurudwara with natural hot spring visit',
  'Evening campfire & group bonding session in Kasol',
  'Dedicated 24/7 Student Trip Organizers / Lead Coordinators & experienced mountain chauffeurs',
  'Interactive seat booking with guaranteed reserved bus seat',
  'Digital QR ticket & live verification pass for hassle-free boarding',
  'First aid kit & primary emergency coordination assistance',
];

export const EXCLUSIONS_LIST = [
  'Optional adventure activities: Paragliding, River Rafting, ATV ride, Cable Car, Zorbing',
  'Any personal expenses: Shopping, room service, laundry, extra beverages, tips',
  'Meals and snacks during highway transit stops (unless specifically stated)',
  'Heater charges at hotels or special room service requests',
  'Monument entry fees, camera charges or temple donation tokens',
  'Emergency medical evacuation or costs incurred due to natural calamities, landslides or road blockages',
  'Anything not specifically listed under inclusions',
];

export const PACKING_LIST = [
  { item: 'Heavy warm jacket / Fleece', essential: true, note: 'Temperatures drop below 5°C in evening' },
  { item: 'Comfortable sports/trekking shoes', essential: true, note: 'Good grip for walking trails & temples' },
  { item: '2-3 pairs extra warm socks', essential: true, note: 'Keep feet warm during Solang & Kasol walks' },
  { item: 'Power bank (10,000+ mAh)', essential: true, note: 'Crucial during overnight journeys & photography' },
  { item: 'Reusable water bottle', essential: true, note: 'Stay hydrated at high altitudes' },
  { item: 'Personal medications & motion sickness tablets', essential: true, note: 'Carry Avomine/Vomitrol if prone to winding mountain roads' },
  { item: 'UV Sunglasses & Sunscreen (SPF 40+)', essential: true, note: 'High altitude UV protection' },
  { item: 'Small daypack backpack (15-20L)', essential: true, note: 'For day trips to Solang and Kasol' },
  { item: 'Rain protection (Foldable umbrella/poncho)', essential: false, note: 'Himalayan weather can be unpredictable' },
  { item: 'Cash & Digital UPI', essential: true, note: 'Some remote Kasol cafes only accept cash' },
  { item: 'Valid College / Govt ID & Digital QR Ticket', essential: true, note: 'Required at pickup point (Near GLA Main Gate, Mathura)' },
];

export const FAQ_ITEMS = [
  {
    q: 'How much is the reservation amount to lock my seat?',
    a: 'You only pay ₹1,000 per traveller today to confirm your reservation and lock your bus seat. The remaining balance (₹5,200 per traveller) can be cleared closer to the departure date as scheduled by the coordinators.',
  },
  {
    q: 'Can I select my exact bus seat like BookMyShow?',
    a: 'Yes! Our platform features an interactive BookMyShow-style 23-passenger seat map for our luxury 2x2 buses. You can choose your preferred window or aisle seat in real-time, which is instantly locked for you upon reservation.',
  },
  {
    q: 'How does seat holding work?',
    a: 'When you tap a seat, our server places a temporary 10-minute hold. A countdown timer displays on your screen. Complete the ₹1,000 reservation payment per traveller within 10 minutes to make it permanently BOOKED. If payment is abandoned, the seat automatically becomes available again for other travellers.',
  },
  {
    q: 'What is the pricing per traveller?',
    a: 'The trip price is ₹6,200 per traveller. Total price is simply the number of travellers × ₹6,200 (e.g. 1 traveller = ₹6,200, 2 travellers = ₹12,400, 6 travellers = ₹37,200).',
  },
  {
    q: 'Can I book for a group of friends?',
    a: 'Yes! You can book for multiple travellers (1 to 6+ people) under a single booking ID. You will be able to select seats for all travellers together on the same bus where available, with a unified dashboard and individual digital QR boarding tickets for everyone.',
  },
  {
    q: 'What happens if weather causes road blockage to Sissu/Atal Tunnel?',
    a: 'Safety is our absolute priority. Excursions to high-altitude passes like Atal Tunnel and Sissu depend strictly on weather, BRO road clearance, and local police administration. If closed, the trip team arranges alternative safe scenic exploration within Manali valley.',
  },
  {
    q: 'What happens immediately after successful payment?',
    a: 'The server verifies the Razorpay payment signature atomically, confirms your booking, locks your seats permanently, and generates your high-security Digital QR Ticket and invoice. You can download your ticket immediately and view it in your dashboard anytime.',
  },
];
