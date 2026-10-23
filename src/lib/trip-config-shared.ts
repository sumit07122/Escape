export interface TripConfigData {
  id: string;
  tripTitle: string;
  subtitle: string;
  totalCapacity: number;
  packagePrice: number;
  depositPrice: number;
  pickupLocation: string;
  reportingTime: string;
  departureDate: string;
  emergencyHelplines: string[];
  announcementBanner?: string | null;
  announcementActive: boolean;
}

export const DEFAULT_TRIP_CONFIG: TripConfigData = {
  id: 'global',
  tripTitle: 'Himalayan Escape 2026',
  subtitle: 'Manali × Kasol Student Expedition',
  totalCapacity: 75,
  packagePrice: 6200,
  depositPrice: 1000,
  pickupLocation: 'Near Main Gate (NH-2), Mathura',
  reportingTime: '07:00 PM',
  departureDate: '2026-10-24',
  emergencyHelplines: ['7017936338', '9368287947'],
  announcementBanner: 'Reporting time updated: Buses will depart from NH-2 gate at 8:00 PM sharp.',
  announcementActive: false,
};
