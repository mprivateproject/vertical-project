import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, idToken, bookingData } = body;

    // =========================
    // 🔐 1. REQUIRE ID TOKEN
    // =========================
    if (!idToken) {
      return Response.json({ error: 'idToken required' }, { status: 401 });
    }

    // =========================
    // 🔐 2. VERIFY TOKEN WITH LINE
    // =========================
    const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: Deno.env.get('sso_client_id'),
      }),
    });

    if (!verifyRes.ok) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const payload = await verifyRes.json();

    // ✅ LINE user identity (เชื่ออันนี้เท่านั้น)
    const lineUserId = payload.sub;

    // =========================
    // 👤 3. SYNC USER / CUSTOMER
    // =========================
    async function syncCustomer(profile = {}) {
      const { displayName = '', pictureUrl = '', email = '' } = profile;

      const existingUsers = await base44.asServiceRole.entities.User.filter({
        line_user_id: lineUserId,
      });

      let user;

      if (existingUsers.length > 0) {
        user = await base44.asServiceRole.entities.User.update(existingUsers[0].id, {
          full_name: displayName,
          email: email || `${lineUserId}@line.local`,
          picture_url: pictureUrl || '',
        });
      } else {
        user = await base44.asServiceRole.entities.User.create({
          full_name: displayName,
          email: email || `${lineUserId}@line.local`,
          line_user_id: lineUserId,
          picture_url: pictureUrl || '',
          role: 'customer',
        });
      }

      const existingCustomers = await base44.asServiceRole.entities.Customer.filter({
        user_id: user.id,
      });

      let customer;

      if (existingCustomers.length > 0) {
        customer = await base44.asServiceRole.entities.Customer.update(
          existingCustomers[0].id,
          {
            display_name: displayName,
            email: email || '',
          }
        );
      } else {
        customer = await base44.asServiceRole.entities.Customer.create({
          user_id: user.id,
          display_name: displayName,
          email: email || '',
          preferred_language: 'th',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          membership_tier: 'none',
        });
      }

      return { user, customer };
    }

    // =========================
    // 🎯 ACTION HANDLER
    // =========================

    // 1️⃣ SYNC CUSTOMER
    if (action === 'syncCustomer') {
      const { profile } = body;
      const result = await syncCustomer(profile);
      return Response.json(result);
    }

    // 2️⃣ CREATE BOOKING
    if (action === 'createBooking') {
      if (!bookingData) {
        return Response.json({ error: 'bookingData required' }, { status: 400 });
      }

      // ensure customer exists
      await syncCustomer(bookingData);

      const booking = await base44.asServiceRole.entities.Booking.create({
        ...bookingData,
        line_user_id: lineUserId,
      });

      return Response.json({ booking });
    }

    // 3️⃣ GET BOOKINGS (ของ user นี้เท่านั้น)
    if (action === 'getBookings') {
      const bookings = await base44.asServiceRole.entities.Booking.filter({
        line_user_id: lineUserId,
      });

      return Response.json({ bookings });
    }

    // 4️⃣ GET BOOKINGS BY DATE (admin use)
    if (action === 'getBookingsByDate') {
      const { bookingDate } = body;

      const bookings = await base44.asServiceRole.entities.Booking.filter({
        booking_date: bookingDate,
      });

      return Response.json({ bookings });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('liffSync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});