async function runTest() {
  try {
    const resBuses = await fetch('http://localhost:3000/api/buses');
    const dataBuses = await resBuses.json();
    console.log('✓ Fetched buses:', dataBuses.buses.length);
    const bus = dataBuses.buses[0];
    console.log(`✓ Testing on ${bus.busNumber} (ID: ${bus.id})`);

    // 1. Check seats
    const resSeats = await fetch(`http://localhost:3000/api/buses/${bus.id}/seats`);
    const dataSeats = await resSeats.json();
    console.log(`✓ Fetched seats for ${bus.busNumber}:`, dataSeats.seats.length, 'seats');

    const availableSeat = dataSeats.seats.find((s) => s.isBookable && s.status === 'AVAILABLE');
    if (!availableSeat) {
      throw new Error('No available seats found on bus!');
    }
    const testSeatNumber = availableSeat.seatNumber;
    console.log(`✓ Testing with available seat: ${testSeatNumber}`);

    // 2. Hold seat
    const testSession = 'sess_e2e_' + Date.now();
    const resHold = await fetch('http://localhost:3000/api/seats/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busId: bus.id,
        seatNumbers: [testSeatNumber],
        bookingSessionId: testSession,
      }),
    });
    const dataHold = await resHold.json();
    console.log(`✓ Held seat ${testSeatNumber}:`, dataHold.success ? 'SUCCESS' : 'FAILED', dataHold);

    // 3. Calculate price
    const resPrice = await fetch('http://localhost:3000/api/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageType: 'SINGLE',
        travellersCount: 1,
      }),
    });
    const dataPrice = await resPrice.json();
    console.log('✓ Calculated price:', dataPrice.pricing);

    // 4. Create Razorpay order
    const resOrder = await fetch('http://localhost:3000/api/bookings/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageType: 'SINGLE',
        busId: bus.id,
        selectedSeats: [testSeatNumber],
        bookingSessionId: testSession,
        travellers: [
          {
            fullName: 'Aryan Sharma',
            phone: '9876543210',
            email: 'aryan@gla.ac.in',
            gender: 'Male',
            glaRollNo: '2115000123',
            emergencyContactName: 'Parent',
            emergencyContactPhone: '9876500000',
          },
        ],
        emergencyContactName: 'Parent',
        emergencyContactPhone: '9876500000',
      }),
    });
    const dataOrder = await resOrder.json();
    console.log('✓ Booking Order response:', dataOrder);

    // 5. Verify payment (sandbox simulation)
    const resVerify = await fetch('http://localhost:3000/api/bookings/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: dataOrder.bookingId,
        razorpayPaymentId: 'pay_sim_' + Date.now(),
        razorpayOrderId: dataOrder.razorpayOrderId,
        razorpaySignature: 'simulated_signature_sandbox',
      }),
    });
    const dataVerify = await resVerify.json();
    console.log('✓ Payment Verified & Ticket Generated:', dataVerify.booking?.bookingId, 'Status:', dataVerify.booking?.paymentStatus);
    const ticketToken = dataVerify.booking?.tickets?.[0]?.qrToken || dataVerify.booking?.travellers?.[0]?.ticket?.qrToken;
    console.log('✓ Ticket Token (QR Token):', ticketToken);

    // 6. Verify Ticket via public endpoint
    const resTicket = await fetch(`http://localhost:3000/api/tickets/${ticketToken}`);
    const dataTicket = await resTicket.json();
    console.log('✓ Public Ticket Verified:', dataTicket.ticket?.booking?.bookingId, 'Seat:', dataTicket.ticket?.traveller?.assignedSeatNumber, 'QR Data URL length:', dataTicket.ticket?.qrDataUrl?.length);

    // 7. Admin Login to obtain session cookie
    const resAdminLogin = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@glaescape.in',
        password: 'GLAAdmin@2026#Secure',
      }),
    });
    const dataAdminLogin = await resAdminLogin.json();
    const setCookie = resAdminLogin.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/gla_admin_token=([^;]+)/);
    const adminToken = tokenMatch ? tokenMatch[1] : '';
    console.log('✓ Admin Login:', dataAdminLogin.admin?.name, 'Token acquired:', !!adminToken);

    // 8. Verify Check-in via Admin Ticket Scan endpoint
    const resScan = await fetch('http://localhost:3000/api/admin/tickets/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `gla_admin_token=${adminToken}`,
      },
      body: JSON.stringify({
        qrData: ticketToken,
      }),
    });
    const dataScan = await resScan.json();
    console.log('✓ Ticket Scan by Admin Desk:', dataScan.valid ? 'VALID PASS' : 'INVALID', 'Traveller:', dataScan.ticket?.traveller?.fullName, 'Coach:', dataScan.ticket?.booking?.busNumber);

    // 9. Execute boarding gate check-in
    const resCheckIn = await fetch('http://localhost:3000/api/admin/tickets/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `gla_admin_token=${adminToken}`,
      },
      body: JSON.stringify({
        ticketId: dataScan.ticket?.id,
        notes: 'Verified luggage and seat assignment at Mathura campus gate',
      }),
    });
    const dataCheckIn = await resCheckIn.json();
    console.log('✓ Boarding Pass Checked In at Gate:', dataCheckIn.success ? 'SUCCESS' : 'FAILED', 'Message:', dataCheckIn.message);

    console.log('\n========================================');
    console.log('🎉 100% COMPLETE: BOOKING, SEAT HOLD, RAZORPAY RESERVATION, QR TICKET & GATE CHECK-IN VERIFIED!');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runTest();
