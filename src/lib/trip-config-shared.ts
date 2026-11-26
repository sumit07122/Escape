export interface TripConfigData {
  id: string;
  tripTitle: string;
  subtitle: string;
  totalCapacity: number;
  packagePrice: number; // Standard individual price (₹6,200)
  duoPackagePrice?: number; // Duo explorer price per head (₹5,999)
  groupPackagePrice: number; // Squad / group price per head (₹5,800)
  groupSizeThreshold: number; // Min travelers for group rate (3)
  depositPrice: number; // Advance reservation deposit (₹1,000)
  departureDate: string;
  returnDate: string;
  reportingTime: string;
  pickupLocation: string;
  emergencyHelplines: string[];
  announcementBanner?: string | null;
  announcementActive: boolean;
  customSeatsDisplayEnabled?: boolean; // When true, overrides displayed available seat count on public site
  customAvailableSeats?: number; // Custom available seats number to display (e.g. 17 or 23)
  customTotalCapacity?: number; // Custom total capacity number to display (e.g. 75 or 25)
}

export const DEFAULT_TRIP_CONFIG: TripConfigData = {
  id: 'global',
  tripTitle: 'Himalayan Escape – Christmas Special 2026',
  subtitle: '6 Days. 5 Nights. Endless Memories. Celebrate Christmas in the Himalayas.',
  totalCapacity: 50,
  packagePrice: 6200,
  duoPackagePrice: 5999,
  groupPackagePrice: 5800,
  groupSizeThreshold: 3,
  depositPrice: 1000,
  departureDate: '2026-12-24',
  returnDate: '2026-12-29',
  reportingTime: '12:00 PM',
  pickupLocation: 'GLA University, Mathura',
  emergencyHelplines: ['8126854850', '6398412828'],
  announcementBanner: 'Christmas Special bookings are live! Departure from GLA University at 12:00 PM.',
  announcementActive: false,
  customSeatsDisplayEnabled: false,
  customAvailableSeats: 42,
  customTotalCapacity: 50,
};
