export type PackageType = 'SINGLE' | 'COUPLE' | 'GROUP';

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'HELD' | 'BOOKED' | 'UNAVAILABLE' | 'DRIVER' | 'CONDUCTOR';

export type SeatPosition = 'WINDOW' | 'AISLE' | 'REAR' | 'CABIN';
export type SeatSide = 'LEFT' | 'RIGHT' | 'REAR' | 'FRONT';
export type SittingPreference = 'WINDOW' | 'AISLE' | 'FRONT' | 'BACK' | 'NO_PREFERENCE';

export interface SeatInfo {
  id: string;
  busId: string;
  seatNumber: string; // "L1" - "L9", "R1" - "R9", "B1" - "B5", "DRIVER", "CONDUCTOR"
  seatType: 'DRIVER' | 'CONDUCTOR' | 'PASSENGER';
  rowNumber: number;
  side: SeatSide;
  position: SeatPosition;
  isBookable: boolean;
  isAvailable: boolean;
  status: SeatStatus;
  heldUntil?: string | null;
  heldBySession?: string | null;
  bookedByTravellerName?: string | null;
}

export interface BusWithSeats {
  id: string;
  tripId: string;
  busNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  physicalCapacity: number;
  passengerCapacity: number;
  driverSeats: number;
  conductorSeats: number;
  driverName?: string | null;
  driverPhone?: string | null;
  conductorName?: string | null;
  conductorPhone?: string | null;
  status: string;
  seats: SeatInfo[];
  stats: {
    totalPassengerSeats: number;
    bookedCount: number;
    heldCount: number;
    availableCount: number;
  };
}

export interface TravellerInput {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedSeatNumber?: string;
  isFreeGroupTraveller?: boolean;
}

export interface BookingPricing {
  packageType: PackageType;
  travellersCount: number;
  baseAmount: number;
  referralCode?: string;
  referralDiscountPercent: number;
  referralDiscountAmount: number;
  groupDiscountAmount: number;
  finalAmount: number;
  reservationAmount: number;
  remainingBalance: number;
  isGroupOffer: boolean;
  paidTravellersCount: number;
  freeTravellersCount: number;
}

export interface PublicTripDetails {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  origin: string;
  destination: string;
  capacity: number;
  totalBooked: number;
  totalHeld: number;
  totalAvailable: number;
  singlePrice: number;
  couplePrice: number;
  reservationAmount: number;
  groupOffer: string;
  referralOffer: string;
  coordinatorPhone1: string;
  coordinatorPhone2: string;
  buses: {
    busNumber: string;
    booked: number;
    capacity: number;
  }[];
}
