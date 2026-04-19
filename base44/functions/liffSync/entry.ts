import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Actions that do NOT require LINE identity verification
const PUBLIC_ACTIONS = new Set([
  'getServices',
  'getTherapists',
  'getServiceById',
  'getBookingsByDate',
  'adminGetBookingsByDate',
  'adminUpdateBooking',
  'adminGetAllBookings',
  'adminGetCustomers',
  'adminGetServices',
  'adminSaveService',
  'adminDeleteService',
  'adminGetPromotions',
  'adminSavePromotion',
  'adminDeletePromotion',
]);

// Verify LINE idToken — called only for private actions
async function verifyLineToken(idToken) {
  const clientId = Deno.env.get('sso_client_id');
  console.log('🔐 Verifying idToken with LINE, client_id:', clientId, 'token prefix:', idToken.slice(0, 15));

  const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
  });

  const responseText = await verifyRes.text();
  console.log('🔐 LINE verify response:', verifyRes.status, responseText.slice(0, 200));

  if (!verifyRes.ok) {
    const parsed = JSON.parse(responseText);
    const isExpired = parsed?.error_description?.toLowerCase().includes('expired');
    console.error('❌ Token verification failed:', parsed);
    return {
      ok: false,
      expired: isExpired,
      error: parsed?.error_description || 'Verification failed',
    };
  }

  const payload = JSON.parse(responseText);
  console.log('✅ Token verified:', { sub: payload.sub, aud: payload.aud, iss: payload.iss });
  return { ok: true, payload };
}

// Sync or create customer by line_user_id
async function syncCustomer(base44, lineUserId, profile = {}) {
  const { displayName = '', pictureUrl = '', email = '' } = profile;
  console.log('🔍 syncCustomer: lineUserId:', lineUserId);

  const existing = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });

  let customer;
  if (existing.length > 0) {
    const updates = {};
    if (displayName) updates.display_name = displayName;
    if (pictureUrl) updates.picture_url = pictureUrl;
    if (email) updates.email = email;
    customer = await base44.asServiceRole.entities.Customer.update(existing[0].id, updates);
    console.log('✅ syncCustomer: updated:', customer.id);
  } else {
    customer = await base44.asServiceRole.entities.Customer.create({
      line_user_id: lineUserId,
      display_name: displayName || 'LINE User',
      picture_url: pictureUrl || '',
      email: email || '',
      preferred_language: 'th',
      total_visits: 0,
      total_spent: 0,
      loyalty_points: 0,
      membership_tier: 'none',
    });
    console.log('✅ syncCustomer: created:', customer.id);
  }

  return { customer };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, bookingData } = body;

    console.log('📥 LIFF SYNC action:', action);

    // ─────────────────────────────────────────────────────
    // PUBLIC ACTIONS — no token verification needed
    // ─────────────────────────────────────────────────────
    if (PUBLIC_ACTIONS.has(action)) {

      if (action === 'getServices') {
        const services = await base44.asServiceRole.entities.Service.filter({ is_active: true }, 'sort_order', 100);
        return Response.json({ services });
      }

      if (action === 'getTherapists') {
        const therapists = await base44.asServiceRole.entities.Therapist.filter({ is_active: true });
        return Response.json({ therapists });
      }

      if (action === 'getServiceById') {
        const { serviceId } = body;
        const services = await base44.asServiceRole.entities.Service.filter({ id: serviceId });
        return Response.json({ service: services[0] || null });
      }

      if (action === 'getBookingsByDate') {
        const { bookingDate } = body;
        const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: bookingDate });
        return Response.json({ bookings });
      }

      if (action === 'adminGetBookingsByDate') {
        const { bookingDate } = body;
        const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: bookingDate }, 'start_time', 200);
        return Response.json({ bookings });
      }

      if (action === 'adminUpdateBooking') {
        const { bookingId, data: updateData } = body;
        const booking = await base44.asServiceRole.entities.Booking.update(bookingId, updateData);
        return Response.json({ booking });
      }

      if (action === 'adminGetAllBookings') {
        const { sort = '-booking_date', limit = 1000 } = body;
        const bookings = await base44.asServiceRole.entities.Booking.list(sort, limit);
        return Response.json({ bookings });
      }

      if (action === 'adminGetCustomers') {
        const customers = await base44.asServiceRole.entities.Customer.list('-created_date', 200);
        return Response.json({ customers });
      }

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
    }

    // ─────────────────────────────────────────────────────
    // PRIVATE ACTIONS — require valid LINE idToken
    // ─────────────────────────────────────────────────────
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing Authorization header for action:', action);
      return Response.json({ error: 'idToken required', action: 'RELOGIN_REQUIRED' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    console.log('🔐 Token received, length:', idToken.length, 'action:', action);

    const verification = await verifyLineToken(idToken);

    if (!verification.ok) {
      if (verification.expired) {
        return Response.json({ error: 'TOKEN_EXPIRED', action: 'RELOGIN_REQUIRED' }, { status: 401 });
      }
      return Response.json({ error: 'Invalid token', detail: verification.error, action: 'RELOGIN_REQUIRED' }, { status: 401 });
    }

    const lineUserId = verification.payload.sub;
    console.log('✅ lineUserId extracted:', lineUserId);

    // ── SYNC CUSTOMER ──────────────────────────────────
    if (action === 'syncCustomer') {
      const { profile } = body;
      const result = await syncCustomer(base44, lineUserId, profile);
      console.log('✅ Customer synced:', result.customer.id);
      return Response.json(result);
    }

    // ── CREATE BOOKING ─────────────────────────────────
    if (action === 'createBooking') {
      if (!bookingData) {
        return Response.json({ error: 'bookingData required' }, { status: 400 });
      }
      const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
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
      console.log('✅ Booking created:', booking.id, 'for customer:', verifiedCustomer.id);

      // ── SEND LINE CONFIRMATION MESSAGE ──────────────────
      try {
        const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
        if (token && lineUserId) {
          const { service_name, booking_date, start_time, end_time, price, therapist_name } = bookingData;
          const msg = `การจองของคุณได้รับการยืนยันแล้ว\n\nวันที่: ${booking_date}\nเวลา: ${start_time}${end_time ? ' - ' + end_time : ''}\n\nบริการ: ${service_name}\nราคา: ฿${Number(price).toLocaleString()}\n\nเราหวังว่าจะได้ต้อนรับคุณเร็วๆ นี้`;
          const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ to: lineUserId, messages: [{ type: 'text', text: msg }] }),
          });
          if (!lineRes.ok) {
            const err = await lineRes.text();
            console.error('❌ LINE push message failed:', err);
          } else {
            console.log('✅ LINE confirmation sent to:', lineUserId);
          }

          // Admin notification skipped — LINE Notify not available in backend environment
        }
      } catch (notifyErr) {
        console.error('⚠️ LINE notify error (non-fatal):', notifyErr.message);
      }

      return Response.json({ booking });
    }

    // ── GET BOOKINGS (own) ─────────────────────────────
    if (action === 'getBookings') {
      const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
      const customerId = customers[0]?.id;
      const bookings = customerId
        ? await base44.asServiceRole.entities.Booking.filter({ customer_id: customerId })
        : [];
      return Response.json({ bookings });
    }

    // ── CANCEL BOOKING ─────────────────────────────────
    if (action === 'cancelBooking') {
      const { bookingId } = body;
      const booking = await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'cancelled' });
      return Response.json({ booking });
    }

    console.error('❌ Unknown action:', action);
    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('❌ LIFF SYNC ERROR', { message: error.message, stack: error.stack });
    return Response.json({ error: error.message }, { status: 500 });
  }
});