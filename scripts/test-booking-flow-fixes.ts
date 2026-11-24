import { calculateDynamicBookingPricing } from '../src/lib/pricing';
import { generateBusSeatLayout } from '../src/lib/bus-layout';

async function testBookingFlowFixes() {
  console.log('--- Testing Booking Pricing Calculation ---');
  const soloPricing = await calculateDynamicBookingPricing({ travellersCount: 1 });
  console.log('Solo pricing:', {
    travellersCount: soloPricing.travellersCount,
    pricePerTraveller: soloPricing.pricePerTraveller,
    totalAmount: soloPricing.totalAmount,
    reservationAmount: soloPricing.reservationAmount,
    remainingBalance: soloPricing.remainingBalance,
  });

  if (soloPricing.pricePerTraveller !== 6200 || soloPricing.reservationAmount !== 1000 || soloPricing.remainingBalance !== 5200) {
    throw new Error('Solo pricing discrepancy detected!');
  }

  const duoPricing = await calculateDynamicBookingPricing({ travellersCount: 2 });
  console.log('Duo pricing:', {
    travellersCount: duoPricing.travellersCount,
    pricePerTraveller: duoPricing.pricePerTraveller,
    totalAmount: duoPricing.totalAmount,
    reservationAmount: duoPricing.reservationAmount,
  });

  if (duoPricing.pricePerTraveller !== 5999 || duoPricing.reservationAmount !== 2000) {
    throw new Error('Duo pricing discrepancy detected!');
  }

  console.log('--- Testing 25 Passenger Seat Model ---');
  const layout = generateBusSeatLayout(5, 5);
  const passengerSeats = layout.filter(s => s.seatType === 'PASSENGER');
  const crewSeats = layout.filter(s => s.seatType !== 'PASSENGER');

  console.log(`Passenger seats: ${passengerSeats.length}, Crew seats: ${crewSeats.length}`);
  if (passengerSeats.length !== 25) {
    throw new Error(`Expected 25 passenger seats, got ${passengerSeats.length}`);
  }

  console.log('✓ All booking flow & pricing checks PASSED successfully!');
}

testBookingFlowFixes().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
