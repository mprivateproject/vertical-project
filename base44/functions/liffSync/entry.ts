import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─────────────────────────────────────────────────────────
// SANDBOX MODE — all booking actions public (no LINE token)
// Set to false when ready to go live
// ─────────────────────────────────────────────────────────
const SANDBOX_MODE = false;

// Actions that do NOT require LINE identity verification
const PUBLIC_ACTIONS = new Set([
  'getServices',
  'getTherapists',
  'getServiceById',
  'getBookingsByDate',
  'getBookingsByDateRange',
  'getLoyaltyTierByKey',
  // Sandbox: booking actions open without LINE auth
  ...(SANDBOX_MODE ? ['getBookings', 'createBooking', 'cancelBooking', 'updateBookingStatus', 'updateCustomerPreferences', 'syncCustomer'] : []),
]);

// Actions that require admin role (Base44 authenticated user)
const ADMIN_ACTIONS = new Set([
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
  'adminSendReminder',
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
    await base44.asServiceRole.entities.Customer.update(existing[0].id, updates);
    // Re-fetch to get ALL fields including loyalty_tier, is_invited_member, etc.
    const refreshed = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
    customer = refreshed[0];
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

      if (action === 'getBookingsByDateRange') {
        const { startDate, endDate } = body;
        const bookings = await base44.asServiceRole.entities.Booking.list('booking_date', 500);
        const filtered = bookings.filter(b => b.booking_date >= startDate && b.booking_date <= endDate);
        return Response.json({ bookings: filtered });
      }

      if (action === 'getLoyaltyTierByKey') {
        const { tier_key } = body;
        const tiers = await base44.asServiceRole.entities.LoyaltyTier.filter({ tier_key });
        return Response.json({ tier: tiers[0] || null });
      }

    }

    // ─────────────────────────────────────────────────────
    // ADMIN ACTIONS — require Base44 admin role
    // ─────────────────────────────────────────────────────
    if (ADMIN_ACTIONS.has(action)) {
      let user = null;
      try { user = await base44.auth.me(); } catch (_) { /* no Base44 session */ }
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
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

      if (action === 'adminSendReminder') {
        const { bookingId, customMessage } = body;
        const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
        if (!bookings.length) return Response.json({ error: 'Booking not found' }, { status: 404 });
        const booking = bookings[0];

        // Get customer's LINE user ID
        const customers = await base44.asServiceRole.entities.Customer.filter({ id: booking.customer_id });
        if (!customers.length) return Response.json({ error: 'Customer not found' }, { status: 404 });
        const customer = customers[0];

        if (!customer.line_user_id) {
          return Response.json({ error: 'Customer has no LINE account linked' }, { status: 400 });
        }

        const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
        if (!token) return Response.json({ error: 'LINE token not configured' }, { status: 500 });

        const defaultMsg = `📌 แจ้งเตือนนัดหมาย\n\nสวัสดีครับ คุณ${customer.display_name}\nขอแจ้งเตือนนัดหมายของคุณ\n\n📅 วันที่: ${booking.booking_date}\n⏰ เวลา: ${booking.start_time}${booking.end_time ? ' - ' + booking.end_time : ''}\n💆 บริการ: ${booking.service_name}\n\nหากมีข้อสงสัยกรุณาติดต่อเราผ่าน LINE: @mprivateproject`;
        const msg = customMessage || defaultMsg;

        const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ to: customer.line_user_id, messages: [{ type: 'text', text: msg }] }),
        });

        if (!lineRes.ok) {
          const err = await lineRes.text();
          console.error('❌ LINE reminder push failed:', err);
          return Response.json({ error: 'Failed to send LINE message', detail: err }, { status: 500 });
        }

        console.log('✅ Reminder sent to:', customer.line_user_id, 'for booking:', bookingId);
        return Response.json({ success: true, sentTo: customer.display_name });
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

      // Sandbox: create booking with placeholder customer
      let bookingUserId = bookingData.user_id || 'sandbox_user';
      let bookingCustomerId = bookingData.customer_id || 'sandbox_customer';
      let bookingCustomerName = bookingData.customer_name || 'Guest';

      if (!SANDBOX_MODE) {
        const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
        if (!customers.length) {
          return Response.json({ error: 'Customer not found — sync customer first' }, { status: 400 });
        }
        const verifiedCustomer = customers[0];
        bookingUserId = verifiedCustomer.id;
        bookingCustomerId = verifiedCustomer.id;
        bookingCustomerName = verifiedCustomer.display_name || bookingData.customer_name || '';
      }

      const booking = await base44.asServiceRole.entities.Booking.create({
        ...bookingData,
        user_id: bookingUserId,
        customer_id: bookingCustomerId,
        customer_name: bookingCustomerName,
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
      if (SANDBOX_MODE) {
        // Return all non-admin bookings in sandbox mode
        const bookings = await base44.asServiceRole.entities.Booking.list('-booking_date', 200);
        return Response.json({ bookings });
      }
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

      // ── SEND LINE CANCELLATION NOTIFICATION ────────────
      try {
        const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
        if (token && lineUserId) {
          const { service_name, booking_date, start_time } = booking;
          const msg = `การจองของคุณถูกยกเลิกแล้ว\n\nวันที่: ${booking_date}\nเวลา: ${start_time}\nบริการ: ${service_name}\n\nหากต้องการจองใหม่ กรุณาทำรายการอีกครั้งครับ`;
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
            console.error('❌ LINE cancel notification failed:', err);
          } else {
            console.log('✅ LINE cancel notification sent to:', lineUserId);
          }
        }
      } catch (notifyErr) {
        console.error('⚠️ LINE cancel notify error (non-fatal):', notifyErr.message);
      }

      return Response.json({ booking });
    }

    // ── UPDATE BOOKING STATUS ──────────────────────────
    if (action === 'updateBookingStatus') {
      const { bookingId, status, healthForm } = body;
      const updateData = { status };
      if (healthForm) {
        const { signature, ...formSummary } = healthForm;
        const summary = `[Health Form] items: ${(formSummary.checked_items || []).join(', ')} | notes: ${JSON.stringify(formSummary.notes || {})}`;
        updateData.staff_notes = summary.slice(0, 500);
      }
      const booking = await base44.asServiceRole.entities.Booking.update(bookingId, updateData);
      console.log('✅ Booking status updated:', bookingId, '->', status);
      return Response.json({ booking });
    }

    // ── UPDATE CUSTOMER PREFERENCES ────────────────────
    if (action === 'updateCustomerPreferences') {
      const { tags, notes } = body;
      const customers = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });
      if (!customers.length) return Response.json({ error: 'Customer not found' }, { status: 404 });
      const customer = await base44.asServiceRole.entities.Customer.update(customers[0].id, { tags, notes });
      return Response.json({ customer });
    }

    console.error('❌ Unknown action:', action);
    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('❌ LIFF SYNC ERROR', { message: error.message, stack: error.stack });
    return Response.json({ error: error.message }, { status: 500 });
  }
});