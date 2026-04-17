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
      // 1. Find User where line_user_id = lineUserId
      const existingUsers = await base44.asServiceRole.entities.User.filter({ line_user_id: lineUserId });
      
      // 2. IF NOT FOUND → CREATE User; IF FOUND → UPDATE
      let user;
      if (existingUsers.length > 0) {
        user = await base44.asServiceRole.entities.User.update(existingUsers[0].id, {
          name: displayName,
          picture_url: pictureUrl || '',
        });
      } else {
        user = await base44.asServiceRole.entities.User.create({
          line_user_id: lineUserId,
          name: displayName,
          picture_url: pictureUrl || '',
          role: 'customer',
        });
      }

      // 3. Find Customer where user_id = User.id
      const existingCustomers = await base44.asServiceRole.entities.Customer.filter({ user_id: user.id });
      
      // 4. IF NOT FOUND → CREATE Customer
      let customer;
      if (existingCustomers.length > 0) {
        customer = await base44.asServiceRole.entities.Customer.update(existingCustomers[0].id, {
          display_name: displayName,
          email: email || '',
        });
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

      // 5. RETURN { user, customer }
      return Response.json({ user, customer });
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
      const customerLineUserId = bookingData.line_user_id || lineUserId;

      if (LINE_CHANNEL_ACCESS_TOKEN && customerLineUserId) {
        const appUrl = 'https://mprivateproject.com/';
        const flexMessage = {
          type: 'flex',
          altText: `✅ ยืนยันการจอง: ${bookingData.service_name || '-'}`,
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#1a3a5c',
              paddingAll: '20px',
              contents: [
                {
                  type: 'text',
                  text: '✅ ยืนยันการจองแล้ว',
                  color: '#ffffff',
                  size: 'xl',
                  weight: 'bold',
                },
                {
                  type: 'text',
                  text: 'Booking Confirmed',
                  color: '#aac4e0',
                  size: 'sm',
                  margin: 'xs',
                },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              paddingAll: '20px',
              spacing: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#f4f8ff',
                  cornerRadius: '12px',
                  paddingAll: '16px',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        { type: 'text', text: '💆 บริการ', color: '#666688', size: 'sm', flex: 2 },
                        { type: 'text', text: bookingData.service_name || '-', color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, wrap: true, align: 'end' },
                      ],
                    },
                    { type: 'separator', color: '#e0e8f0' },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        { type: 'text', text: '📅 วันที่', color: '#666688', size: 'sm', flex: 2 },
                        { type: 'text', text: bookingData.booking_date || '-', color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, align: 'end' },
                      ],
                    },
                    { type: 'separator', color: '#e0e8f0' },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        { type: 'text', text: '🕐 เวลา', color: '#666688', size: 'sm', flex: 2 },
                        { type: 'text', text: `${bookingData.start_time || '-'} - ${bookingData.end_time || '-'}`, color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, align: 'end' },
                      ],
                    },
                    ...(bookingData.therapist_name ? [
                      { type: 'separator', color: '#e0e8f0' },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          { type: 'text', text: '👤 นักบำบัด', color: '#666688', size: 'sm', flex: 2 },
                          { type: 'text', text: bookingData.therapist_name, color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, align: 'end' },
                        ],
                      },
                    ] : []),
                  ],
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    { type: 'text', text: 'ยอดชำระ', color: '#444466', size: 'md', weight: 'bold' },
                    { type: 'text', text: `฿${Number(bookingData.price || 0).toLocaleString()}`, color: '#1a3a5c', size: 'xl', weight: 'bold', align: 'end' },
                  ],
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              paddingAll: '16px',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  color: '#1a3a5c',
                  height: 'sm',
                  action: {
                    type: 'uri',
                    label: '📋 ดูรายละเอียดการจอง',
                    uri: `${appUrl}bookings`,
                  },
                },
                {
                  type: 'text',
                  text: 'ขอบคุณที่ใช้บริการครับ 🙏',
                  color: '#999999',
                  size: 'xs',
                  align: 'center',
                  margin: 'sm',
                },
              ],
            },
          },
        };

        notifyPromises.push(
          fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
            body: JSON.stringify({ to: customerLineUserId, messages: [flexMessage] }),
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
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const bookings = await base44.entities.Booking.filter({ user_id: user.id });
      return Response.json({ bookings });
    }

    if (action === 'getBookingsByDate') {
      const { bookingDate } = body;
      const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: bookingDate });
      return Response.json({ bookings });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('liffSync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});