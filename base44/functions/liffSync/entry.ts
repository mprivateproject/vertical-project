import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // =========================
    // 🔐 1. READ TOKEN FROM HEADER
    // =========================
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ LIFF SYNC: Missing Authorization header');
      return Response.json({ error: 'idToken required' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '').trim();
    console.log('🔐 LIFF token received:', idToken.slice(0, 10));

    const body = await req.json();
    const { action, bookingData } = body;

    // =========================
    // 🔐 2. VERIFY TOKEN WITH LINE
    // =========================
    console.log('🔐 LIFF SYNC: Verifying token with LINE API...');
    const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: Deno.env.get('sso_client_id'),
      }),
    });

    if (!verifyRes.ok) {
      const errBody = await verifyRes.text();
      console.error('❌ LIFF SYNC: Token verification failed', { status: verifyRes.status, body: errBody });
      return Response.json({ error: 'Invalid or expired token', detail: errBody }, { status: 401 });
    }

    const payload = await verifyRes.json();
    console.log('✅ LIFF SYNC: Token verified', { sub: payload.sub, iss: payload.iss, aud: payload.aud });

    // ✅ LINE user identity (เชื่ออันนี้เท่านั้น)
    const lineUserId = payload.sub;
    console.log('✅ LIFF SYNC: Extracted lineUserId:', lineUserId);

    // =========================
    // 👤 3. SYNC USER / CUSTOMER
    // =========================
    async function syncCustomer(profile = {}) {
      const { displayName = '', pictureUrl = '', email = '' } = profile;

      console.log('🔍 syncCustomer: looking for line_user_id:', lineUserId);

      const existingCustomers = await base44.asServiceRole.entities.Customer.filter({
        line_user_id: lineUserId,
      });

      let customer;

      if (existingCustomers.length > 0) {
        const updates = {};
        if (displayName) updates.display_name = displayName;
        if (pictureUrl) updates.picture_url = pictureUrl;
        if (email) updates.email = email;
        customer = await base44.asServiceRole.entities.Customer.update(existingCustomers[0].id, updates);
        console.log('✅ syncCustomer: updated existing customer:', customer.id);
      } else {
        customer = await base44.asServiceRole.entities.Customer.create({
          line_user_id: lineUserId,
          display_name: displayName,
          picture_url: pictureUrl || '',
          email: email || '',
          preferred_language: 'th',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          membership_tier: 'none',
        });
        console.log('✅ syncCustomer: created new customer:', customer.id);
      }

      return { customer };
    }

    // =========================
    // 🎯 ACTION HANDLER
    // =========================

    // 1️⃣ SYNC CUSTOMER
    if (action === 'syncCustomer') {
      console.log('🔄 LIFF SYNC: Syncing customer...');
      const { profile } = body;
      const result = await syncCustomer(profile);
      console.log('✅ LIFF SYNC: Customer synced:', { customerId: result.customer.id });
      return Response.json(result);
    }

    // 2️⃣ CREATE BOOKING
    if (action === 'createBooking') {
      console.log('🔄 LIFF SYNC: Creating booking...');
      if (!bookingData) {
        return Response.json({ error: 'bookingData required' }, { status: 400 });
      }

      // Lookup customer by line_user_id (single source of truth)
      console.log('🔍 createBooking: looking for line_user_id:', lineUserId);
      const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
      console.log('🔍 createBooking: customer found:', customers[0] || null);

      if (!customers.length) {
        return Response.json({ error: 'Customer not found — sync customer first' }, { status: 400 });
      }
      const verifiedCustomer = customers[0];

      const booking = await base44.asServiceRole.entities.Booking.create({
        ...bookingData,
        user_id: verifiedCustomer.id,
        customer_id: verifiedCustomer.id,
        customer_name: verifiedCustomer.display_name || bookingData.customer_name || '',
      });

      console.log('✅ LIFF SYNC: Booking created:', { bookingId: booking.id, customerId: verifiedCustomer.id });
      return Response.json({ booking });
    }

    // 3️⃣ GET BOOKINGS (ของ user นี้เท่านั้น)
    if (action === 'getBookings') {
      console.log('🔄 LIFF SYNC: Fetching bookings for lineUserId:', lineUserId);
      const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
      const customerId = customers[0]?.id;
      const bookings = customerId
        ? await base44.asServiceRole.entities.Booking.filter({ customer_id: customerId })
        : [];
      console.log('✅ LIFF SYNC: Bookings retrieved:', { count: bookings.length });
      return Response.json({ bookings });
    }

    // 4️⃣ GET BOOKINGS BY DATE (admin use)
    if (action === 'getBookingsByDate') {
      console.log('🔄 LIFF SYNC: Fetching bookings for date:', body.bookingDate);
      const { bookingDate } = body;

      const bookings = await base44.asServiceRole.entities.Booking.filter({
        booking_date: bookingDate,
      });

      console.log('✅ LIFF SYNC: Bookings retrieved:', { count: bookings.length, date: bookingDate });
      return Response.json({ bookings });
    }

    // 5️⃣ GET SERVICES
    if (action === 'getServices') {
      const services = await base44.asServiceRole.entities.Service.filter({ is_active: true }, 'sort_order', 100);
      return Response.json({ services });
    }

    // 6️⃣ GET THERAPISTS
    if (action === 'getTherapists') {
      const therapists = await base44.asServiceRole.entities.Therapist.filter({ is_active: true });
      return Response.json({ therapists });
    }

    // 7️⃣ GET SERVICE BY ID
    if (action === 'getServiceById') {
      const { serviceId } = body;
      const services = await base44.asServiceRole.entities.Service.filter({ id: serviceId });
      return Response.json({ service: services[0] || null });
    }

    // 8️⃣ CANCEL BOOKING
    if (action === 'cancelBooking') {
      const { bookingId } = body;
      const booking = await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'cancelled' });
      return Response.json({ booking });
    }

    // 9️⃣ ADMIN: GET BOOKINGS BY DATE (staff/admin)
    if (action === 'adminGetBookingsByDate') {
      const { bookingDate } = body;
      const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: bookingDate }, 'start_time', 200);
      return Response.json({ bookings });
    }

    // 🔟 ADMIN: UPDATE BOOKING STATUS
    if (action === 'adminUpdateBooking') {
      const { bookingId, data: updateData } = body;
      const booking = await base44.asServiceRole.entities.Booking.update(bookingId, updateData);
      return Response.json({ booking });
    }

    // 1️⃣1️⃣ ADMIN: GET ALL BOOKINGS
    if (action === 'adminGetAllBookings') {
      const { sort = '-booking_date', limit = 1000 } = body;
      const bookings = await base44.asServiceRole.entities.Booking.list(sort, limit);
      return Response.json({ bookings });
    }

    // 1️⃣2️⃣ ADMIN: GET CUSTOMERS
    if (action === 'adminGetCustomers') {
      const customers = await base44.asServiceRole.entities.Customer.list('-created_date', 200);
      return Response.json({ customers });
    }

    // 1️⃣3️⃣ ADMIN: SERVICES CRUD
    if (action === 'adminGetServices') {
      const services = await base44.asServiceRole.entities.Service.list('sort_order', 100);
      return Response.json({ services });
    }
    if (action === 'adminSaveService') {
      const { serviceData } = body;
      let service;
      if (serviceData.id) {
        const { id, ...rest } = serviceData;
        service = await base44.asServiceRole.entities.Service.update(id, rest);
      } else {
        service = await base44.asServiceRole.entities.Service.create(serviceData);
      }
      return Response.json({ service });
    }
    if (action === 'adminDeleteService') {
      const { serviceId } = body;
      await base44.asServiceRole.entities.Service.delete(serviceId);
      return Response.json({ success: true });
    }

    // 1️⃣4️⃣ ADMIN: PROMOTIONS CRUD
    if (action === 'adminGetPromotions') {
      const promotions = await base44.asServiceRole.entities.Promotion.list('-created_date', 50);
      return Response.json({ promotions });
    }
    if (action === 'adminSavePromotion') {
      const { promoData } = body;
      let promotion;
      if (promoData.id) {
        const { id, ...rest } = promoData;
        promotion = await base44.asServiceRole.entities.Promotion.update(id, rest);
      } else {
        promotion = await base44.asServiceRole.entities.Promotion.create(promoData);
      }
      return Response.json({ promotion });
    }
    if (action === 'adminDeletePromotion') {
      const { promoId } = body;
      await base44.asServiceRole.entities.Promotion.delete(promoId);
      return Response.json({ success: true });
    }

    console.error('❌ LIFF SYNC: Unknown action:', action);
    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('❌ LIFF SYNC ERROR', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});