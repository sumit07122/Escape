import type { SeatTemplate } from './constants';

export function generateBusSeatLayout(rows: number, rearSeats: number): SeatTemplate[] {
  const rowCount = Math.max(1, Math.min(20, Math.floor(rows)));
  const rearCount = Math.max(0, Math.min(8, Math.floor(rearSeats)));
  const seats: SeatTemplate[] = [
    { seatNumber: 'DRIVER', seatType: 'DRIVER', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
    { seatNumber: 'CONDUCTOR', seatType: 'CONDUCTOR', rowNumber: 0, side: 'FRONT', position: 'CABIN', isBookable: false },
  ];
  let leftNumber = 0;
  let rightNumber = 0;

  for (let rowNumber = 1; rowNumber <= rowCount; rowNumber += 1) {
    const seatsPerSide = rowNumber === rowCount ? 1 : 2;
    for (let positionIndex = 0; positionIndex < seatsPerSide; positionIndex += 1) {
      leftNumber += 1;
      seats.push({
        seatNumber: `L${leftNumber}`,
        seatType: 'PASSENGER',
        rowNumber,
        side: 'LEFT',
        position: positionIndex === 0 ? 'WINDOW' : 'AISLE',
        isBookable: true,
      });

      rightNumber += 1;
      seats.push({
        seatNumber: `R${rightNumber}`,
        seatType: 'PASSENGER',
        rowNumber,
        side: 'RIGHT',
        position: positionIndex === 0 ? 'AISLE' : 'WINDOW',
        isBookable: true,
      });
    }
  }

  for (let seatIndex = 1; seatIndex <= rearCount; seatIndex += 1) {
    seats.push({
      seatNumber: `B${seatIndex}`,
      seatType: 'PASSENGER',
      rowNumber: rowCount + 1,
      side: 'REAR',
      position: seatIndex === 1 || seatIndex === rearCount ? 'WINDOW' : 'REAR',
      isBookable: true,
    });
  }

  return seats;
}

export function getBusLayoutSettings(seats: Array<{ seatType: string; side: string; rowNumber: number }>) {
  const sideRows = seats
    .filter((seat) => seat.seatType === 'PASSENGER' && (seat.side === 'LEFT' || seat.side === 'RIGHT'))
    .map((seat) => seat.rowNumber);
  return {
    rows: Math.max(1, ...sideRows),
    rearSeats: seats.filter((seat) => seat.seatType === 'PASSENGER' && seat.side === 'REAR').length,
  };
}

export function getPassengerCapacity(rows: number, rearSeats: number) {
  return Math.max(0, (Math.max(1, Math.floor(rows)) - 1) * 4 + 2 + Math.floor(rearSeats));
}
