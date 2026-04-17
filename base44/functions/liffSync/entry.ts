import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, lineUserId, displayName, pictureUrl, email } = body;

    if (!lineUserId) {
      return Response.json({ error: 'lineUserId required' }, { status: 400 });
    }

    if (action === 'syncCustomer') {
      const existing = await base44.asServiceRole.entities.Customer.filter({ line_user_id: lineUserId });

      let customer;
      if (existing.length > 0) {
        customer = await base44.asServiceRole.entities.Customer.update(existing[0].id, {
          display_name: displayName,
          picture_url: pictureUrl,
          ...(email ? { email } : {}),
        });
      } else {
        customer = await base44.asServiceRole.entities.Customer.create({
          line_user_id: lineUserId,
          display_name: displayName,
          email: email || '',
          picture_url: pictureUrl || '',
          preferred_language: 'th',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          membership_tier: 'none',
        });
      }
      return Response.json({ customer });
    }

    if (action === 'createBooking') {
      const { bookingData } = body;
      if (!bookingData) {
        return Response.json({ error: 'bookingData required' }, { status: 400 });
      }
      const booking = await base44.asServiceRole.entities.Booking.create(bookingData);

      // Send LINE notifications (non-blocking)
      const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
      const LINE_NOTIFY_TOKEN = Deno.env.get('LINE_NOTIFY_TOKEN');

      const notifyPromises = [];

      if (LINE_CHANNEL_ACCESS_TOKEN && lineUserId) {
        const customerMsg = `✅ ยืนยันการจอง\n\nบริการ: ${bookingData.service_name || '-'}\nวันที่: ${bookingData.booking_date || '-'}\nเวลา: ${bookingData.start_time || '-'}\nราคา: ฿${Number(bookingData.price || 0).toLocaleString()}\n\nขอบคุณที่ใช้บริการครับ 🙏`;
        notifyPromises.push(
          fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
            body: JSON.stringify({ to: lineUserId, messages: [{ type: 'text', text: customerMsg }] }),
          }).catch(e => console.error('Customer notify error:', e))
        );
      }

      if (LINE_NOTIFY_TOKEN) {
        const adminMsg = `\n📅 มีการจองใหม่!\nลูกค้า: ${bookingData.customer_name || '-'}\nบริการ: ${bookingData.service_name || '-'}\nวันที่: ${bookingData.booking_date || '-'} เวลา: ${bookingData.start_time || '-'}\nราคา: ฿${Number(bookingData.price || 0).toLocaleString()}`;
        notifyPromises.push(
          fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}` },
            body: new URLSearchParams({ message: adminMsg }),
          }).catch(e => console.error('Admin notify error:', e))
        );
      }

      await Promise.all(notifyPromises);

      return Response.json({ booking });
    }

    if (action === 'getBookings') {
      const bookings = await base44.asServiceRole.entities.Booking.filter({ line_user_id: lineUserId });
      return Response.json({ bookings });
    }

    if (action === 'getBookingsByDate') {
      const { bookingDate } = body;
      const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: bookingDate });
      return Response.json({ bookings });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});