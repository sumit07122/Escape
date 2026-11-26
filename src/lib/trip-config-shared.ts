export interface TripConfigData {
  id: string;
  tripTitle: string;
  subtitle: string;
  totalCapacity: number;
  packagePrice: number; // Standard individual price (₹6,199)
  duoPackagePrice?: number; // Duo explorer price per head (₹6,199)
  groupPackagePrice: number; // Group price per head (₹6,199)
  groupDiscountAmount?: number; // Flat group discount on booking total for 5+ travellers (₹600)
  groupSizeThreshold: number; // Min travelers for group rate (5)
  depositPrice: number; // Advance reservation deposit per head (₹1,000)
  departureDate: string;
  returnDate: string;
  reportingTime: string;
  pickupLocation: string;
  emergencyHelplines: string[];
  announcementBanner?: string | null;
  announcementActive: boolean;
  customSeatsDisplayEnabled?: boolean; // When true, overrides displayed available seat count on public site
  customAvailableSeats?: number; // Custom available seats number to display
  customTotalCapacity?: number; // Custom total capacity number to display
}

export const DEFAULT_TRIP_CONFIG: TripConfigData = {
  id: 'global',
  tripTitle: 'Himalayan Escape',
  subtitle: 'Six days away from routine. A lifetime of stories. From pine-scented riverside camping in Kasol to snow peaks in Manali.',
  totalCapacity: 50,
  packagePrice: 6199,
  duoPackagePrice: 6199,
  groupPackagePrice: 6199,
  groupDiscountAmount: 600,
  groupSizeThreshold: 5,
  depositPrice: 1000,
  departureDate: '2026-12-23',
  returnDate: '2026-12-28',
  reportingTime: '12:00 PM',
  pickupLocation: 'GLA University, Mathura',
  emergencyHelplines: ['8126854850', '6398412828'],
  announcementBanner: 'Himalayan Escape: Pick up from GLA University, Mathura on 23rd December.',
  announcementActive: false,
  customSeatsDisplayEnabled: false,
  customAvailableSeats: 17,
  customTotalCapacity: 50,
};
