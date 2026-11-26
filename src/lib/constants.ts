// Brand, Trip and Business Constants for HIMALAYAN ESCAPE — STUDENT MOUNTAIN EXPEDITION

export const TRIP_METADATA = {
  name: 'Himalayan Escape — Student Mountain Expedition',
  title: 'HIMALAYAN ESCAPE (MANALI × KASOL)',
  duration: '6 DAYS • 5 NIGHTS',
  tagline: 'Campus Off. Mountains On.',
  origin: 'Pickup & Reporting: Near Main Gate (NH-2), Mathura',
  destination: 'Manali & Kasol, Himachal Pradesh',
  capacity: 50,
  dates: 'December 24 - December 29, 2026',
  reportingLocation: 'Pickup & Reporting: Near Main Gate (NH-2), Mathura',
  disclaimer: 'Independent student-organized expedition. Not an officially sponsored university event. Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions, local conditions, or safety requirements. Weather-dependent and road-dependent activities (such as Atal Tunnel / Sissu snow trails, Rohtang Pass, and river rafting) are subject to official clearances and cannot be guaranteed.',
};

export const PRICING_DEFAULTS = {
  pricePerTraveller: 6200, // ₹6,200 flat student rate
  duoPricePerTraveller: 5999, // ₹5,999 Duo Explorer rate
  squadPricePerTraveller: 5800, // ₹5,800 Squad Cabin rate (3+ travellers)
  groupPricePerTraveller: 5800, // ₹5,800 group rate
  groupThreshold: 3,
  singlePrice: 6200,
  reservationAmountPerTraveller: 1000, // ₹1,000 reservation deposit per traveller
  reservationAmount: 1000,
  remainingBalancePerTraveller: 5200, // ₹5,200 remaining balance per traveller
  seatHoldMinutes: 10, // 10-minute hold duration
};

export const CONTACT_INFO = {
  organizerName: 'Lead Trip Coordinator',
  organizerPhone: '8126854850',
  coordinatorPhone1: '8126854850',
  coordinatorPhone2: '6398412828',
  whatsapp1: '918126854850',
  whatsapp2: '916398412828',
  emergencyCoordinator: '8126854850',
  emergencySupport: '6398412828',
  police: '100',
  ambulance: '108',
  email: 'trips@glaescape.in',
  office: '17km Stone, NH-2, Mathura-Delhi Road, Mathura, UP 281406',
};

// 25-seat Bus Configuration
// 1 Driver + 1 Conductor + 25 passenger seats
// Pairs: L1/L2, L3/L4, L5/L6, L7/L8, L9/L10 (Left)
// Pairs: R1/R2, R3/R4, R5/R6, R7/R8, R9/R10 (Right)
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

  // Row 5: Pair L9 (Window), L10 (Aisle) | Pair R9 (Aisle), R10 (Window)
  { seatNumber: 'L9', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'WINDOW', isBookable: true },
  { seatNumber: 'L10', seatType: 'PASSENGER', rowNumber: 5, side: 'LEFT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R9', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'AISLE', isBookable: true },
  { seatNumber: 'R10', seatType: 'PASSENGER', rowNumber: 5, side: 'RIGHT', position: 'WINDOW', isBookable: true },

  // Row 6: Rear 5 Seats B1-B5
  { seatNumber: 'B1', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
  { seatNumber: 'B2', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B3', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B4', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'REAR', isBookable: true },
  { seatNumber: 'B5', seatType: 'PASSENGER', rowNumber: 6, side: 'REAR', position: 'WINDOW', isBookable: true },
];

export const INITIAL_BUSES = [
  { busNumber: 'Bus 01', vehicleName: 'Himalayan Eagle', vehicleNumber: 'UP-85-GLA-001', driverName: 'Rajesh Sharma', conductorName: 'Amit Verma' },
  { busNumber: 'Bus 02', vehicleName: 'Parvati Cruiser', vehicleNumber: 'UP-85-GLA-002', driverName: 'Sunil Kumar', conductorName: 'Manoj Singh' },
  { busNumber: 'Bus 03', vehicleName: 'Solang Glider', vehicleNumber: 'UP-85-GLA-003', driverName: 'Virender Rawat', conductorName: 'Rakesh Negi' },
  { busNumber: 'Bus 04', vehicleName: 'Rohtang Explorer', vehicleNumber: 'UP-85-GLA-004', driverName: 'Kuldeep Thakur', conductorName: 'Deepak Dogra' },
];

export const ITINERARY_DAYS = [
  {
    dayNumber: 1,
    title: 'DAY 1 — MATHURA TO MANALI',
    subtitle: 'Noon Pickup & Overnight Mountain Road Journey',
    stayLocation: 'Overnight Tourist Coach Journey',
    mealsConfig: 'No meals served from our side during travel (Self-paid en route)',
    description: 'Assemble and pick up from Mathura in the afternoon / noon. Board the comfortable AC tourist coach towards Manali. Enjoy the scenic transition from the plains into the Himalayan foothills with sanitized highway refreshment stops. Please note: No food will be served from our side during travel time.',
    items: [
      { time: '12:00 PM – 01:00 PM', location: 'Mathura Pickup Point (NH-2)', activity: 'Assembly & QR Verification', description: 'Student arrival, luggage loading, and digital QR ticket verification.', isOptional: false },
      { time: '01:30 PM', location: 'Mathura (NH-2)', activity: 'Departure towards Manali', description: 'Flag-off and departure for Manali in luxury AC coach.', isOptional: false },
      { time: '05:30 PM', location: 'Highway Transit Plaza', activity: 'Tea & Refreshment Halt', description: 'Brief comfort stop (self-paid refreshments).', isOptional: false },
      { time: '09:30 PM', location: 'Highway Food Court (Murthal / Karnal)', activity: 'Dinner Halt (Self-Paid)', description: 'Sanitized dinner stop en route (self-paid). No meals served from organizer side during transit.', isOptional: false },
      { time: '11:00 PM', location: 'En Route Western Himalayas', activity: 'Overnight Road Journey', description: 'Restful overnight highway journey with comfortable reclining seats.', isOptional: false },
    ],
  },
  {
    dayNumber: 2,
    title: 'DAY 2 — MANALI ARRIVAL & LOCAL SIGHTSEEING',
    subtitle: 'Hadimba Temple, Tibetan Monastery, Van Vihar & Mall Road',
    stayLocation: '3-Star Hotel in Manali',
    mealsConfig: 'Dinner Included (Pure Veg)',
    description: 'Reach Manali in the morning and check in to the 3-star hotel. After freshening up, head out to explore Hadimba Temple (by walking from Mall Road), the peaceful Tibetan Monastery, Van Vihar nature park, and bustling Mall Road for evening leisure. Night stay & vegetarian dinner at the hotel.',
    items: [
      { time: '09:00 AM – 10:30 AM', location: 'Manali', activity: 'Hotel Check-in & Freshen Up', description: 'Reach Manali, hotel check-in, room allotment and freshening up after the road journey.', isOptional: false },
      { time: '12:30 PM', location: 'Manali Mall Road & Dhungri', activity: 'Hadimba Temple Visit', description: 'Walk from Mall Road to the iconic 16th-century wooden pagoda temple in Dhungri pine forest.', isOptional: false },
      { time: '03:00 PM', location: 'Mall Road Area', activity: 'Tibetan Monastery & Van Vihar', description: 'Visit Himalayan Nyinmapa Tibetan Buddhist Monastery and scenic cedar-lined Van Vihar park.', isOptional: false },
      { time: '05:30 PM', location: 'Mall Road', activity: 'Mall Road Stroll & Shopping', description: 'Evening exploration, local cafes, street photography, and shopping.', isOptional: false },
      { time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Night Stay & Dinner (Veg)', description: 'Delicious hot vegetarian dinner buffet and comfortable overnight hotel stay.', isOptional: false },
    ],
  },
  {
    dayNumber: 3,
    title: 'DAY 3 — ATAL TUNNEL, SISSU, SOLANG VALLEY & ROHTANG PASS',
    subtitle: 'Snow Foothills, Engineering Marvel & Lahaul Valley Excursion',
    stayLocation: '3-Star Hotel in Manali',
    mealsConfig: 'Breakfast & Dinner Included (Pure Veg)',
    description: 'After a wholesome breakfast, embark on an epic high-altitude mountain excursion. Travel through the world-famous Atal Tunnel (9.02 km) into Sissu (Lahaul Valley), experience Solang Valley snow points, and visit Rohtang Pass (subject to opening and weather clearances). Return to hotel for night stay and vegetarian dinner.',
    items: [
      { time: '08:00 AM', location: 'Hotel', activity: 'Breakfast', description: 'Wholesome morning breakfast at the hotel.', isOptional: false },
      { time: '09:00 AM', location: 'Atal Tunnel (9.02 km)', activity: 'Atal Tunnel Crossing', description: 'Drive through the high-altitude engineering marvel connecting Kullu and Lahaul valleys.', isOptional: false },
      { time: '10:30 AM', location: 'Sissu, Lahaul Valley', activity: 'Sissu Valley & Waterfall View', description: 'Spectacular snow-covered trans-Himalayan landscapes and Sissu waterfall exploration.', isOptional: false },
      { time: '01:30 PM', location: 'Solang Valley', activity: 'Solang Valley Snow Exploration', description: 'Famous mountain bowl for snow slopes and mountain views. Optional activities self-paid.', isOptional: false },
      { time: '03:30 PM', location: 'Rohtang Pass Corridor', activity: 'Rohtang Pass Excursion (If Open)', description: 'Visit Rohtang Pass (strictly subject to snow conditions, BRO opening & permit clearances).', isOptional: true },
      { time: '08:00 PM', location: 'Hotel', activity: 'Night Stay & Dinner (Veg)', description: 'Warm vegetarian dinner buffet and overnight hotel stay in Manali.', isOptional: false },
    ],
  },
  {
    dayNumber: 4,
    title: 'DAY 4 — MANALI TO KASOL VIA KULLU',
    subtitle: 'River Rafting, Paragliding, Kasol Riverside Camps & Bonfire',
    stayLocation: 'Kasol Riverside Camps',
    mealsConfig: 'Breakfast & Dinner Included (Pure Veg)',
    description: 'After breakfast, check out of Manali hotel and board coaches toward Parvati Valley. En route, halt at Kullu for thrilling Beas River Rafting and Paragliding. Arrive in Kasol, check in to picturesque riverside camps, enjoy evening bonfire, music, and delicious dinner.',
    items: [
      { time: '08:30 AM', location: 'Hotel', activity: 'Breakfast & Check-Out', description: 'Breakfast at hotel and check-out with luggage loaded onto coaches.', isOptional: false },
      { time: '11:00 AM', location: 'Kullu (Babeli / Pirdi)', activity: 'Kullu River Rafting & Paragliding Halt', description: 'Exciting white-water river rafting and tandem paragliding in Kullu (optional adventure activities, self-paid).', isOptional: true },
      { time: '02:30 PM', location: 'Parvati Valley Highway', activity: 'Scenic Drive to Kasol', description: 'Picturesque mountain canyon drive following the turquoise waters of Parvati River.', isOptional: false },
      { time: '05:00 PM', location: 'Kasol Campsite', activity: 'Check-in to Kasol Camps', description: 'Camp allotment, freshen up, and riverside relaxation in Parvati Valley.', isOptional: false },
      { time: '07:30 PM', location: 'Camp Grounds', activity: 'Bonfire, DJ Night & Dinner (Veg)', description: 'Evening mountain campfire, music, community vibes, and hot vegetarian dinner.', isOptional: false },
    ],
  },
  {
    dayNumber: 5,
    title: 'DAY 5 — KASOL, MANIKARAN SAHIB & DEPARTURE TOWARDS MATHURA',
    subtitle: 'Shri Manikaran Sahib, Shiva Temple, Kasol Market & Return Journey',
    stayLocation: 'Overnight Tourist Coach Journey',
    mealsConfig: 'Breakfast Included • No meals during return travel',
    description: 'After breakfast, check out of Kasol camps. Visit the sacred Shri Manikaran Sahib Gurudwara and holy Lord Shiva temple with natural hot springs. Explore the vibrant Kasol market for shopping, souvenirs, and cafe hopping. Around 2:00 – 3:00 PM, begin the return journey toward Mathura. No food will be served from our side during transit.',
    items: [
      { time: '08:30 AM', location: 'Kasol Camps', activity: 'Breakfast & Camp Check-Out', description: 'Morning breakfast and check-out from Kasol camps.', isOptional: false },
      { time: '10:00 AM', location: 'Manikaran', activity: 'Shri Manikaran Sahib & Lord Shiva Temple', description: 'Visit revered Sikh Gurudwara, ancient Lord Shiva temple, and natural therapeutic sulphur hot springs.', isOptional: false },
      { time: '12:30 PM', location: 'Kasol Market', activity: 'Kasol Market Shopping & Cafe Hopping', description: 'Free time to explore flea markets, unique handicrafts, and chill cafes.', isOptional: false },
      { time: '02:30 PM', location: 'Kasol Boarding Point', activity: 'Start Return Journey for Mathura', description: 'Board coaches and start the return road journey toward Mathura (approx. 2:00 - 3:00 PM).', isOptional: false },
      { time: '08:30 PM', location: 'Highway Food Plaza', activity: 'Dinner Halt (Self-Paid)', description: 'Highway comfort halt. No food served from organizer side during travel.', isOptional: false },
      { time: '10:30 PM', location: 'Chandigarh / Delhi Expressway', activity: 'Overnight Road Journey', description: 'Comfortable overnight coach drive back to Mathura.', isOptional: false },
    ],
  },
  {
    dayNumber: 6,
    title: 'DAY 6 — EARLY MORNING ARRIVAL AT MATHURA',
    subtitle: 'Safe Drop at Mathura & Expedition Completion',
    stayLocation: 'Home / GLA University, Mathura',
    mealsConfig: 'Expedition Complete',
    description: 'Early morning arrival and drop at Mathura (Near Main Gate, NH-2). Bid goodbye to fellow travellers with unforgettable Himalayan memories and stories for a lifetime.',
    items: [
      { time: '06:00 AM – 08:00 AM', location: 'Mathura (Near Main Gate NH-2)', activity: 'Early Morning Drop at Mathura', description: 'Safe arrival and drop at Mathura. End of the 6D/5N Himalayan Escape with a lifetime of memories!', isOptional: false },
    ],
  },
];

export const INCLUSIONS_LIST = [
  'Round-trip luxury AC tourist coach transport from Mathura to Manali, Kasol & back',
  '2 Nights accommodation in 3-star mountain hotel in Manali',
  '1 Night accommodation in scenic riverside camps in Kasol',
  'Total 3 Dinners (Pure Veg) at hotel & Kasol campsite',
  'Total 3 Breakfasts at hotel & Kasol campsite',
  'Sightseeing in Manali: Hadimba Devi Temple, Tibetan Monastery, Van Vihar, Mall Road',
  'Excursion to Atal Tunnel, Sissu (Lahaul Valley) & Solang Valley (Rohtang Pass if open)',
  'Kasol exploration & visit to sacred Shri Manikaran Sahib Gurudwara & Lord Shiva Temple',
  'Evening mountain campfire, music / DJ night at Kasol campsite',
  'Trekking & scenic nature walks along Beas and Parvati rivers',
  'Interactive seat booking with guaranteed reserved seat on coach',
  'Dedicated 24/7 Student Trip Organizers & experienced mountain chauffeurs',
  'Digital QR boarding pass & verified luggage tags',
];

export const EXCLUSIONS_LIST = [
  'No meals served during travel / transit time (Day 1 departure & Day 5 return journey)',
  'No Snow / Sports / Adventure activities included (River Rafting, Paragliding, ATV rides in Kullu/Solang are self-paid)',
  'No drinks (soft drinks, alcohol, extra beverages) from our side',
  'Any personal expenses: Shopping, room service, laundry, extra snacks, tips',
  'Heater charges at hotels or special room service requests',
  'Monument / temple entry fees or camera tokens if applicable',
  'Emergency medical evacuation or unforeseen costs due to natural landslides or roadblocks',
  'Anything not specifically mentioned under inclusions',
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
  { item: 'Valid College / Govt ID & Digital QR Ticket', essential: true, note: 'Required at pickup point (Near Main Gate, NH-2 Mathura)' },
];

export const FAQ_ITEMS = [
  {
    q: 'How much is the reservation amount to lock my seat?',
    a: 'You pay a ₹1,000 deposit per traveller to confirm your reservation and lock your bus seat. The remaining balance depends on your booking rate: ₹5,200 per traveller (solo), ₹4,999 per traveller (duo), or ₹4,800 per traveller (squad of 3+). Coordinators will confirm when it is due.',
  },
  {
    q: 'Can I select my exact bus seat like BookMyShow?',
    a: 'Yes! Our platform features an interactive seat map. You can choose your preferred window or aisle seat in real time, and the seat is held for you during checkout.',
  },
  {
    q: 'How does seat holding work?',
    a: 'When you tap a seat, our server places a temporary 10-minute hold. A countdown timer displays on your screen. Complete the ₹1,000 reservation payment per traveller within 10 minutes to make it permanently BOOKED. If payment is abandoned, the seat automatically becomes available again for other travellers.',
  },
  {
    q: 'What is the pricing per traveller?',
    a: 'Pricing is tiered: ₹6,200 for solo travellers, ₹5,999 per head for duos (2 travellers), and ₹5,800 per head for squads of 3 or more. A ₹1,000 deposit per traveller is due to reserve seats.',
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
