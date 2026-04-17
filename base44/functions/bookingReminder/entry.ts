import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    const LIFF_ID = Deno.env.get('LIFF_ID') || '';
    const appUrl = `https://liff.line.me/${LIFF_ID}`;

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      return Response.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not set' }, { status: 500 });
    }

    // Get current time in Bangkok (UTC+7)
    const now = new Date();
    const bangkokOffset = 7 * 60;
    const bangkokNow = new Date(now.getTime() + bangkokOffset * 60 * 1000);

    const todayStr = bangkokNow.toISOString().slice(0, 10); // yyyy-MM-dd

    // Fetch all bookings for today that are pending or confirmed
    const allBookings = await base44.asServiceRole.entities.Booking.filter({
      booking_date: todayStr,
    });

    const activeBookings = allBookings.filter(b =>
      b.status === 'pending' || b.status === 'confirmed'
    );

    const nowHour = bangkokNow.getUTCHours();
    const nowMin = bangkokNow.getUTCMinutes();
    const nowTotal = nowHour * 60 + nowMin;

    const reminders = [];

    for (const booking of activeBookings) {
      if (!booking.line_user_id || !booking.start_time) continue;

      const [bh, bm] = booking.start_time.split(':').map(Number);
      const bookingTotal = bh * 60 + bm;
      const diff = bookingTotal - nowTotal;

      // Send reminder if appointment is 55–75 min away (1hr window) or 115–135 min away (2hr window)
      const is1hrWindow = diff >= 55 && diff <= 75;
      const is2hrWindow = diff >= 115 && diff <= 135;

      if (!is1hrWindow && !is2hrWindow) continue;

      const reminderLabel = is1hrWindow ? '1 ชั่วโมง' : '2 ชั่วโมง';

      const flexMessage = {
        type: 'flex',
        altText: `⏰ แจ้งเตือน: นัดหมายของคุณอีก ${reminderLabel}`,
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
                text: `⏰ เตือนความจำ`,
                color: '#ffffff',
                size: 'xl',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `นัดหมายของคุณอีก ${reminderLabel}`,
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
                      { type: 'text', text: booking.service_name || '-', color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, wrap: true, align: 'end' },
                    ],
                  },
                  { type: 'separator', color: '#e0e8f0' },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      { type: 'text', text: '🕐 เวลา', color: '#666688', size: 'sm', flex: 2 },
                      { type: 'text', text: `${booking.start_time} - ${booking.end_time || ''}`, color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, align: 'end' },
                    ],
                  },
                  ...(booking.therapist_name ? [
                    { type: 'separator', color: '#e0e8f0' },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        { type: 'text', text: '👤 นักบำบัด', color: '#666688', size: 'sm', flex: 2 },
                        { type: 'text', text: booking.therapist_name, color: '#1a1a2e', size: 'sm', weight: 'bold', flex: 3, align: 'end' },
                      ],
                    },
                  ] : []),
                ],
              },
              {
                type: 'text',
                text: 'กรุณามาถึงก่อนเวลาอย่างน้อย 10 นาที 🙏',
                color: '#888899',
                size: 'xs',
                wrap: true,
                align: 'center',
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
                  uri: `${appUrl}/bookings`,
                },
              },
            ],
          },
        },
      };

      const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: booking.line_user_id,
          messages: [flexMessage],
        }),
      });

      const resJson = await res.json().catch(() => ({}));
      reminders.push({
        bookingId: booking.id,
        lineUserId: booking.line_user_id,
        reminderLabel,
        status: res.ok ? 'sent' : 'failed',
        detail: resJson,
      });
    }

    console.log(`Reminder check: ${activeBookings.length} bookings today, ${reminders.length} reminders sent`);
    return Response.json({ success: true, sent: reminders.length, reminders });

  } catch (error) {
    console.error('bookingReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});