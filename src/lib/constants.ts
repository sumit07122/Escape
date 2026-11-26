// Brand, Trip and Business Constants for HIMALAYAN ESCAPE – CHRISTMAS SPECIAL 2026

export const TRIP_METADATA = {
  name: 'Himalayan Escape – Christmas Special 2026',
  title: 'HIMALAYAN ESCAPE – CHRISTMAS SPECIAL 2026',
  duration: '6 DAYS • 5 NIGHTS',
  tagline: 'Escape the Ordinary. Experience the Himalayas.',
  origin: 'GLA University, Mathura (Departure: 12:00 PM)',
  destination: 'Kasol, Manikaran, Manali, Solang Valley, Sissu & Jogini Waterfall',
  capacity: 50,
  dates: 'December 24 - December 29, 2026',
  departureTime: '12:00 PM',
  returnDepartureTime: '4:00 PM (from Manali on Day 5)',
  reportingLocation: 'GLA University, Mathura',
  disclaimer: 'Independent student-organized expedition. Not an officially sponsored university event. Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions, local conditions, or safety requirements. High-altitude crossings like Atal Tunnel & Sissu, and adventure sports are subject to official clearances. Rohtang Pass is an alternative subject strictly to seasonal opening, permits, and accessibility.',
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
  organizerName: 'Saurabh Pandey',
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
    title: 'DAY 1 — THE JOURNEY BEGINS',
    subtitle: 'Mathura to Himachal | Departure 12:00 PM',
    stayLocation: 'Overnight AC Traveller Bus Journey',
    mealsConfig: 'No meals served from our side during travel (Self-paid en route)',
    description: 'Assemble at GLA University, Mathura. Board the luxury AC Traveller coach. Kick off the expedition with music, group games, interactive activities, and entertainment as we begin our overnight road journey towards the serene valleys of Himachal.',
    items: [
      { time: '11:30 AM – 12:00 PM', location: 'GLA University, Mathura', activity: 'Assembly & QR Verification', description: 'Student arrival, luggage check-in, seat confirmation, and digital QR ticket verification.', isOptional: false },
      { time: '12:00 PM', location: 'GLA University Campus Gate', activity: 'Departure towards Himachal', description: 'Flag-off in luxury AC Traveller coach. Group music, games, icebreakers, and road trip vibes.', isOptional: false },
      { time: '05:30 PM', location: 'Highway Transit Plaza (Murthal)', activity: 'Tea & Refreshment Halt', description: 'Comfort break and evening snacks (self-paid).', isOptional: false },
      { time: '09:30 PM', location: 'Highway Food Court (Karnal / Ambala)', activity: 'Dinner Halt (Self-Paid)', description: 'Sanitized dinner stop en route (self-paid). No meals served during transit from organizer side.', isOptional: false },
      { time: '11:00 PM', location: 'Entering Himalayan Foothills', activity: 'Overnight Mountain Drive', description: 'Smooth overnight journey across Himalayan highways with reclining pushback seats.', isOptional: false },
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
      { time: '09:30 AM – 11:00 AM', location: 'Kasol, Parvati Valley', activity: 'Arrival & Riverside Camp Check-In', description: 'Arrive in Kasol, tent allotment, freshen up, and unwind beside the roaring turquoise Parvati River.', isOptional: false },
      { time: '12:30 PM', location: 'Manikaran', activity: 'Shri Manikaran Sahib & Shiva Temple', description: 'Visit the revered Sikh Gurudwara, ancient Lord Shiva temple, and natural therapeutic hot sulphur springs.', isOptional: false },
      { time: '03:30 PM', location: 'Kasol Market & Riverside Cafés', activity: 'Market Stroll & Café Hopping', description: 'Explore colorful bohemian street markets, handmade souvenirs, German bakeries, and riverside spots.', isOptional: false },
      { time: '07:30 PM', location: 'Kasol Campsite Grounds', activity: 'Bonfire, Music & DJ Night', description: 'Starlit evening campfire, DJ music, dance, community group games, and mountain stories.', isOptional: false },
      { time: '09:00 PM', location: 'Campsite Dining Area', activity: 'Buffet Dinner & Overnight Camping', description: 'Delicious hot vegetarian dinner buffet and overnight camping under the Himalayan stars.', isOptional: false },
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
      { time: '08:30 AM', location: 'Kasol Campsite', activity: 'Riverside Breakfast & Check-Out', description: 'Wholesome morning breakfast and camp check-out with luggage loaded into coaches.', isOptional: false },
      { time: '10:00 AM', location: 'Parvati to Kullu Valley Drive', activity: 'Scenic Mountain Drive to Manali', description: 'Picturesque valley journey along the Beas River toward Manali.', isOptional: false },
      { time: '01:00 PM', location: 'Manali Riverside Hotel', activity: 'Hotel Check-In & Garden Relaxation', description: 'Check in to our riverside hotel with three beautiful gardens. Freshen up and relax.', isOptional: false },
      { time: '02:30 PM', location: 'Dhungri Forest & Mall Road', activity: 'Hadimba Temple & Van Vihar', description: 'Visit the historic 16th-century wooden Hadimba Temple surrounded by cedar woods and stroll through Van Vihar.', isOptional: false },
      { time: '04:30 PM', location: 'Old Manali & Vashisht Temple', activity: 'Old Manali Café Street & Vashisht Hot Springs', description: 'Explore iconic hippie café lanes of Old Manali and the hot sulphur baths of Vashisht Temple.', isOptional: false },
      { time: '06:30 PM', location: 'Manali Mall Road', activity: 'Mall Road Stroll & Shopping', description: 'Free time for local handicrafts, Tibetan woollens, winter shopping, and street photography.', isOptional: false },
      { time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Buffet Dinner & Overnight Stay', description: 'Hot vegetarian dinner buffet and comfortable overnight hotel stay in Manali.', isOptional: false },
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
      { time: '08:00 AM', location: 'Hotel Restaurant', activity: 'Breakfast Buffet', description: 'Wholesome breakfast buffet before heading to high altitudes.', isOptional: false },
      { time: '09:30 AM', location: 'Solang Valley (8,400 ft)', activity: 'Solang Snow Slopes & Adventures', description: 'Experience the famous mountain bowl. Paragliding, skiing, and ATV rides available at additional personal cost.', isOptional: false },
      { time: '01:00 PM', location: 'Atal Tunnel (9.02 km)', activity: 'Atal Tunnel Highway Crossing', description: 'Drive through the world-record high-altitude tunnel beneath the Rohtang Ridge into Lahaul Valley.', isOptional: false },
      { time: '02:00 PM', location: 'Sissu / Koksar, Lahaul Valley', activity: 'Sissu Waterfall & Alpine Landscapes', description: 'Breathtaking trans-Himalayan vistas and frozen Sissu waterfall (subject to road & weather clearances; Rohtang Pass alternative if opened by BRO).', isOptional: false },
      { time: '06:30 PM', location: 'Hotel Manali', activity: 'Return to Hotel & Evening Bonfire', description: 'Campfire warmth, music, group games, and dance session.', isOptional: false },
      { time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Dinner Buffet & Overnight Hotel Stay', description: 'Wholesome hot vegetarian dinner and restful night stay.', isOptional: false },
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
      { time: '08:00 AM', location: 'Hotel Restaurant', activity: 'Riverside Breakfast & Hotel Check-Out', description: 'Morning breakfast with mountain views. Check out with luggage placed safely into coaches.', isOptional: false },
      { time: '09:30 AM', location: 'Vashisht to Jogini Trail', activity: 'Jogini Waterfall Nature Trek', description: 'Scenic pine forest and apple orchard walk to the cascading Jogini Waterfall. Spectacular photography.', isOptional: false },
      { time: '01:00 PM', location: 'Manali Mall Road', activity: 'Christmas Celebrations, Cafés & Final Memories', description: 'Experience Christmas decorations, festive mountain carols, shopping, and final café hopping on Mall Road.', isOptional: false },
      { time: '04:00 PM', location: 'Manali Bus Boarding Point', activity: 'Departure for Mathura (Sharp 4:00 PM)', description: 'Board the AC Traveller bus on time and begin the overnight return journey toward Mathura.', isOptional: false },
      { time: '09:00 PM', location: 'Highway Food Court (Sundernagar / Bilaspur)', activity: 'Dinner Halt (Self-Paid)', description: 'Highway comfort halt. No food served from organizer side during travel time.', isOptional: false },
      { time: '11:00 PM', location: 'Expressway', activity: 'Overnight Road Journey', description: 'Overnight highway travel back to Uttar Pradesh.', isOptional: false },
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
      { time: '06:00 AM – 08:00 AM', location: 'GLA University, Mathura', activity: 'Arrival & Luggage De-boarding', description: 'Safe arrival at GLA University campus. Collection of luggage and completion of the 6D/5N Christmas Special expedition.', isOptional: false },
    ],
  },
];

export const INCLUSIONS_LIST = [
  'Round-trip luxury AC Traveller coach transport from GLA University, Mathura to Kasol, Manali & back',
  '1 Night accommodation in scenic riverside camps in Kasol with bonfire',
  '2 Nights accommodation in a 3-star riverside hotel in Manali featuring three beautiful gardens',
  'Total 3 Dinners (Pure Veg Buffet) at campsite & hotel',
  'Total 3 Breakfasts at campsite & hotel with mountain views',
  'Visit to Manikaran Sahib Gurudwara, natural hot springs & holy Lord Shiva temple',
  'Manali local sightseeing: Hadimba Temple, Mall Road, Old Manali Café Street, Vashisht Temple & Van Vihar',
  'High-altitude excursion to Solang Valley snow points, Atal Tunnel (9.02 km) & Sissu (Lahaul Valley)',
  'Picturesque nature trek to Jogini Waterfall & Christmas celebrations along Manali Mall Road',
  'Evening mountain campfire, music, DJ night & community group activities',
  'Guaranteed reserved coach seat with interactive BookMyShow-style seat map',
  'Dedicated 24/7 Student Trip Organizers & experienced mountain chauffeurs',
  'Digital QR boarding pass & verified baggage luggage tags',
];

export const EXCLUSIONS_LIST = [
  'No meals served during travel/transit time (Day 1 departure from Mathura & Day 5 return journey from Manali)',
  'No Snow / Adventure / Sports activities included (Paragliding, skiing, and ATV rides in Solang Valley are optional and at additional personal cost)',
  'No drinks (soft drinks, alcohol, extra beverages) from our side',
  'Personal expenses: shopping on Mall Road / Kasol market, laundry, room service, extra snacks, tips',
  'Room heater charges at hotels or special individual room service requests',
  'Monument / temple entry fees or photography tokens if applicable',
  'Emergency medical evacuation or unforeseen costs due to weather, roadblocks or landslides',
  'Anything not specifically listed under Inclusions',
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
