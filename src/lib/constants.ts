// Brand, Trip and Business Constants for HIMALAYAN ESCAPE — CHRISTMAS SPECIAL 2026

export const TRIP_METADATA = {
  name: 'Himalayan Escape',
  title: 'HIMALAYAN ESCAPE',
  duration: '6 DAYS • 5 NIGHTS',
  tagline: 'Manali × Kasol Student Mountain Expedition',
  origin: 'GLA University, Mathura',
  destination: 'Kasol & Manali, Himachal Pradesh',
  capacity: 50,
  dates: 'December 23 - December 28, 2026',
  reportingLocation: 'GLA University, Mathura',
  disclaimer: 'Independent student-organized expedition. Not an officially sponsored university event. Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions, local conditions, or safety requirements. Weather-dependent and road-dependent activities (such as Atal Tunnel / Sissu snow trails, Rohtang Pass, and adventure activities) are subject to official clearances and cannot be guaranteed.',
};

export const PRICING_DEFAULTS = {
  pricePerTraveller: 6199, // ₹6,199 flat package rate
  duoPricePerTraveller: 6199,
  squadPricePerTraveller: 6199,
  groupPricePerTraveller: 6199,
  groupDiscountAmount: 600, // ₹600 off total booking for 5+ travellers
  groupThreshold: 5,
  singlePrice: 6199,
  reservationAmountPerTraveller: 1000, // ₹1,000 reservation deposit per traveller
  reservationAmount: 1000,
  remainingBalancePerTraveller: 5199, // ₹5,199 remaining balance per traveller
  seatHoldMinutes: 10, // 10-minute hold duration
};

export const CONTACT_INFO = {
  organizerName: 'Himalayan Escape Expedition Team',
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
  instagram: 'https://www.instagram.com/himalayan.escape_/',
  office: 'GLA University, 17km Stone, NH-2, Mathura, UP 281406',
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
    title: 'DAY 1 — 23 DECEMBER: MATHURA TO KASOL',
    subtitle: 'The Journey Begins • Reporting at GLA University & Overnight Journey',
    stayLocation: 'Overnight AC Traveller Bus Journey',
    mealsConfig: 'No meals served during transit (Self-paid en route)',
    description: 'Reporting and pickup at GLA University, Mathura. Board the AC Traveller Bus and begin the overnight mountain road journey toward Himachal Pradesh. Coordinator travel briefing and route instructions en route.',
    items: [
      { time: '12:00 PM – 01:00 PM', location: 'GLA University, Mathura', activity: 'Reporting & Verification', description: 'Assembly, luggage loading, and digital QR ticket verification at GLA University pickup point.', isOptional: false },
      { time: '01:30 PM', location: 'GLA University Gate, Mathura', activity: 'Boarding & Departure', description: 'Board the AC Traveller Bus and begin the scenic mountain journey.', isOptional: false },
      { time: '05:30 PM', location: 'Highway Transit Plaza', activity: 'Tea & Refreshment Halt', description: 'Short comfort stop (self-paid refreshments).', isOptional: false },
      { time: '09:30 PM', location: 'Highway Food Court (Murthal / Karnal)', activity: 'Dinner Halt (Self-Paid)', description: 'Sanitized dinner halt en route. No meals served from organizer side during transit.', isOptional: false },
      { time: '11:00 PM', location: 'En Route Western Himalayas', activity: 'Overnight Road Journey', description: 'Restful overnight highway journey toward Parvati Valley.', isOptional: false },
    ],
  },
  {
    dayNumber: 2,
    title: 'DAY 2 — 24 DECEMBER: KASOL RIVERSIDE CAMPING',
    subtitle: 'Kasol Arrival, Riverside Camping, Manikaran Sahib & Evening Bonfire',
    stayLocation: 'Riverside Camps in Kasol',
    mealsConfig: 'Dinner Included (Veg)',
    description: 'Arrival in Kasol and check-in at riverside camping accommodation. Visit the sacred Manikaran Sahib Gurudwara and Shiva Temple. Explore Kasol Market, relax along the Parvati River, and enjoy an evening bonfire, DJ, and hot dinner.',
    items: [
      { time: '09:30 AM – 11:00 AM', location: 'Kasol, Parvati Valley', activity: 'Arrival & Camp Check-in', description: 'Arrive in picturesque Kasol, allot riverside camps, and freshen up after the road journey.', isOptional: false },
      { time: '12:30 PM', location: 'Manikaran Sahib', activity: 'Shri Manikaran Sahib & Hot Springs', description: 'Visit sacred Shri Manikaran Sahib Gurudwara and Lord Shiva temple with natural hot sulphur springs.', isOptional: false },
      { time: '03:30 PM', location: 'Kasol Market', activity: 'Explore Kasol Market', description: 'Stroll through vibrant Kasol flea markets, local cafes, and scenic riverside pine trails.', isOptional: false },
      { time: '05:30 PM', location: 'Riverside Campsite', activity: 'Riverside Relaxation', description: 'Unwind along the scenic Parvati River bank.', isOptional: false },
      { time: '07:30 PM – 10:00 PM', location: 'Camp Grounds', activity: 'Bonfire, DJ & Dinner', description: 'Evening mountain campfire, music, community gathering, and delicious hot dinner.', isOptional: false },
    ],
  },
  {
    dayNumber: 3,
    title: 'DAY 3 — 25 DECEMBER: MANALI MOUNTAIN TOWN',
    subtitle: 'Scenic Drive to Manali, 4-Star Riverside Hotel & Heritage Sightseeing',
    stayLocation: '4-Star Riverside Hotel in Manali',
    mealsConfig: 'Breakfast & Dinner Included',
    description: 'After morning breakfast at Kasol camps, travel toward Manali. Check in to the 4-star riverside hotel. Visit Hadimba Temple, Mall Road, Old Manali Café Street, Vashisht Temple, and Van Vihar (subject to schedule). Warm dinner and overnight hotel stay.',
    items: [
      { time: '08:00 AM – 09:00 AM', location: 'Kasol Campsite', activity: 'Breakfast & Camp Check-out', description: 'Wholesome breakfast at camp and checkout.', isOptional: false },
      { time: '09:30 AM', location: 'Kasol to Manali Route', activity: 'Scenic Drive to Manali', description: 'Picturesque mountain drive along Beas River gorge.', isOptional: false },
      { time: '12:30 PM', location: 'Manali Hotel', activity: 'Hotel Check-in & Freshen Up', description: 'Check in to the 4-star riverside hotel in Manali.', isOptional: false },
      { time: '02:00 PM', location: 'Dhungri Pine Forest', activity: 'Hadimba Temple Visit', description: 'Explore the 16th-century wooden pagoda temple amidst towering cedar forests.', isOptional: false },
      { time: '04:00 PM', location: 'Old Manali & Vashisht', activity: 'Old Manali & Vashisht Temple', description: 'Visit historic Old Manali cafes and Vashisht hot springs.', isOptional: false },
      { time: '06:00 PM', location: 'Manali Mall Road', activity: 'Mall Road Stroll & Van Vihar', description: 'Evening leisure on Mall Road and Van Vihar nature park (subject to schedule).', isOptional: false },
      { time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Dinner & Overnight Stay', description: 'Hot buffet dinner and restful night stay at the hotel.', isOptional: false },
    ],
  },
  {
    dayNumber: 4,
    title: 'DAY 4 — 26 DECEMBER: SOLANG VALLEY, ATAL TUNNEL & SISSU',
    subtitle: 'Solang Valley Snow Point, Atal Tunnel & Sissu Excursion (Conditional) • Evening Bonfire',
    stayLocation: '4-Star Riverside Hotel in Manali',
    mealsConfig: 'Breakfast & Dinner Included',
    description: 'After breakfast at the hotel, head to Solang Valley for breathtaking snow-covered mountain landscapes. Continue toward the high-altitude engineering marvel Atal Tunnel (subject to weather, road conditions & BRO clearance) and visit Sissu & frozen waterfall in Lahaul Valley if conditions permit. Return to Manali for leisure along Mall Road, followed by an evening bonfire, group gathering, dinner, and hotel stay.',
    items: [
      { time: '08:00 AM', location: 'Hotel Dining Hall', activity: 'Breakfast', description: 'Fresh morning breakfast at hotel dining hall.', isOptional: false },
      { time: '09:30 AM', location: 'Solang Valley', activity: 'Solang Valley Snow Point', description: 'Explore snow slopes and high-altitude alpine views of Solang Valley.', isOptional: false },
      { time: '11:30 AM', location: 'Atal Tunnel (9.02 km)', activity: 'Atal Tunnel Excursion (Conditional)', description: 'Drive through the high-altitude engineering marvel (strictly subject to weather, road conditions & BRO clearance).', isOptional: false },
      { time: '01:00 PM', location: 'Sissu, Lahaul Valley', activity: 'Sissu & Waterfall (If Open)', description: 'Trans-Himalayan snow landscapes and frozen Sissu waterfall (strictly subject to conditions; not guaranteed).', isOptional: true },
      { time: '04:30 PM', location: 'Manali Mall Road', activity: 'Mall Road Stroll & Old Manali Cafes', description: 'Return to Manali for evening leisure, shopping on Mall Road, and visiting local cafes.', isOptional: false },
      { time: '07:30 PM', location: 'Hotel Grounds', activity: 'Evening Bonfire & Group Gathering', description: 'Cozy winter bonfire, music, and group gathering.', isOptional: false },
      { time: '08:30 PM', location: 'Hotel Dining Hall', activity: 'Dinner & Overnight Stay', description: 'Delicious dinner and comfortable overnight stay at hotel in Manali.', isOptional: false },
    ],
  },
  {
    dayNumber: 5,
    title: 'DAY 5 — 27 DECEMBER: ADVENTURE DAY & RETURN JOURNEY',
    subtitle: 'River Rafting & Paragliding in Kullu (Optional) • Return Departure to Mathura',
    stayLocation: 'Overnight AC Traveller Bus Journey',
    mealsConfig: 'Breakfast Included • No meals during transit',
    description: 'Start with morning breakfast at the hotel and luggage checkout. Head toward Kullu Valley for high-adrenaline adventure activities including River Rafting in the Beas River and Paragliding (optional activities at traveller’s own expense, paid directly to certified local operators, subject to weather conditions). Explore local craft centers, and begin the return journey toward Mathura in the afternoon (~3:30 PM – 4:00 PM).',
    items: [
      { time: '08:00 AM', location: 'Hotel Dining Hall', activity: 'Breakfast & Hotel Checkout', description: 'Wholesome breakfast at hotel, complete room checkout, and load luggage onto coaches.', isOptional: false },
      { time: '09:30 AM', location: 'Manali to Kullu Route', activity: 'Scenic Drive along Beas River', description: 'Picturesque valley drive down to Kullu adventure hub.', isOptional: false },
      { time: '10:30 AM – 01:30 PM', location: 'Kullu Adventure Arena', activity: 'River Rafting & Paragliding (Optional)', description: 'Optional high-adrenaline activities (River Rafting, Paragliding) at own expense, paid directly to certified operators. Subject to weather & safety clearances.', isOptional: true },
      { time: '01:30 PM – 02:30 PM', location: 'Kullu Valley', activity: 'Handicraft & Shawl Center Exploration', description: 'Visit renowned Kullu handloom and shawl centers, brief lunch halt (self-paid).', isOptional: false },
      { time: '03:30 PM – 04:00 PM', location: 'Coach Assembly Point', activity: 'Return Departure for Mathura', description: 'Assembly and return departure from Himachal toward Mathura in AC Traveller bus.', isOptional: false },
      { time: '08:30 PM', location: 'Highway Food Plaza', activity: 'Dinner Halt (Self-Paid)', description: 'Comfort and dinner stop on highway (self-paid). No meals served from organizer side during transit.', isOptional: false },
      { time: '10:30 PM', location: 'Chandigarh / Delhi Expressway', activity: 'Overnight Highway Journey', description: 'Comfortable overnight coach drive back to Mathura.', isOptional: false },
    ],
  },
  {
    dayNumber: 6,
    title: 'DAY 6 — 28 DECEMBER: RETURN TO MATHURA',
    subtitle: 'Morning Arrival at GLA University, Mathura & Tour Concludes',
    stayLocation: 'GLA University, Mathura',
    mealsConfig: 'Tour Concludes',
    description: 'Continue the overnight journey and arrive safely at GLA University, Mathura. Bid farewell to fellow travellers with unforgettable Himalayan memories and lifelong friendships.',
    items: [
      { time: '08:00 AM – 10:00 AM', location: 'GLA University, Mathura', activity: 'Arrival & Tour Concludes', description: 'Safe arrival at GLA University, Mathura. Drop-off and completion of the 6D/5N Himalayan Escape expedition.', isOptional: false },
    ],
  },
];

export const INCLUSIONS_LIST = [
  'Round-trip luxury AC Traveller Bus transport from GLA University, Mathura to Kasol, Manali & back',
  '1 Night accommodation in scenic riverside camping in Kasol',
  '2 Nights accommodation in a 4-star riverside hotel in Manali',
  'Total 3 Dinners at camp & hotel',
  'Total 3 Breakfasts at camp & hotel',
  'Manikaran Sahib Gurudwara & Holy Lord Shiva Temple visit with hot springs',
  'Kasol Market exploration & Parvati riverside relaxation',
  'Sightseeing in Manali: Hadimba Temple, Mall Road, Old Manali, Vashisht Temple & Van Vihar',
  'Solang Valley high-altitude snow mountain exploration (Day 4)',
  'Atal Tunnel & Sissu excursion (Day 4, strictly subject to weather & road clearance)',
  'Kullu Adventure Day: River Rafting & Paragliding in Beas Valley (Day 5, optional)',
  'Evening mountain campfire & DJ night at Kasol campsite',
  'Interactive seat booking with guaranteed reserved seat on bus',
  'Dedicated 24/7 Student Trip Coordinators & experienced mountain chauffeurs',
  'Digital QR boarding pass & verified luggage tags',
];

export const EXCLUSIONS_LIST = [
  'No meals served during transit / highway travel (Day 1 departure & Day 5 return journey)',
  'No Snow / Sports / Adventure activities included (River Rafting, Paragliding, Skiing, ATV rides are optional at own expense paid directly to certified operators)',
  'No drinks (soft drinks, alcohol, extra beverages) from our side',
  'Any personal expenses: Shopping, room service, laundry, extra snacks, tips',
  'Room heater charges at hotel or individual personal requests',
  'Monument / temple entry fees or camera tokens if applicable',
  'Emergency medical evacuation or unforeseen costs due to landslides or roadblocks',
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
    a: 'Package price is ₹6,199 per traveller with a ₹1,000 reservation deposit per person (remaining ₹5,199 balance payable before boarding at GLA University). When booking for 5 or more travellers together, a flat ₹600 group discount is automatically applied to your booking.',
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
