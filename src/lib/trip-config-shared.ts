export interface TripConfigData {
  id: string;
  tripTitle: string;
  subtitle: string;
  totalCapacity: number;
  packagePrice: number; // Standard individual price (₹6,500)
  groupPackagePrice: number; // Discounted price for groups (₹6,200)
  groupSizeThreshold: number; // Min travelers for group rate (5)
  depositPrice: number; // Advance reservation deposit (₹1,000)
  departureDate: string;
  returnDate: string;
  reportingTime: string;
  pickupLocation: string;
  emergencyHelplines: string[];
  announcementBanner?: string | null;
  announcementActive: boolean;
}

export const DEFAULT_TRIP_CONFIG: TripConfigData = {
  id: 'global',
  tripTitle: 'Himalayan Escape 2026',
  subtitle: 'Six days from the plains to the peaks. Find snow trails in Manali, pine-scented evenings in Kasol, and a new crew for the journey.',
  totalCapacity: 75,
  packagePrice: 6500,
  groupPackagePrice: 6200,
  groupSizeThreshold: 5,
  depositPrice: 1000,
  departureDate: '2026-10-24',
  returnDate: '2026-10-29',
  reportingTime: '07:00 PM',
  pickupLocation: 'Near Main Gate (NH-2), Mathura',
  emergencyHelplines: ['6398412828', '8126854850'],
  announcementBanner: 'Reporting time updated: Buses will depart from NH-2 gate at 8:00 PM sharp.',
  announcementActive: false,
};
