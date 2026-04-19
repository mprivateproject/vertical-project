import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automations (no auth header) or admin users only
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const LINE_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!LINE_TOKEN) return Response.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not set' }, { status: 500 });

    // Bangkok time (UTC+7)
    const now = new Date();
    const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStr = bangkokNow.toISOString().slice(0, 10);
    const nowTotal = bangkokNow.getUTCHours() * 60 + bangkokNow.getUTCMinutes();

    const bookings = await base44.asServiceRole.entities.Booking.filter({ booking_date: todayStr });
    const active = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

    const results = [];

    for (const booking of active) {
      if (!booking.customer_id || !booking.start_time) continue;

      const [bh, bm] = booking.start_time.split(':').map(Number);
      const diff = (bh * 60 + bm) - nowTotal;

      // 2-hour window: 115–135 min before
      if (diff < 115 || diff > 135) continue;

      const customer = await base44.asServiceRole.entities.Customer.get(booking.customer_id);
      if (!customer?.line_user_id) continue;

      const msg = `⏰ แจ้งเตือนนัดหมาย\n\nนัดหมายของคุณอีก 2 ชั่วโมง\n\n💆 บริการ: ${booking.service_name}\n🕐 เวลา: ${booking.start_time}${booking.end_time ? ' - ' + booking.end_time : ''}\n${booking.therapist_name ? '👤 นักบำบัด: ' + booking.therapist_name + '\n' : ''}\nกรุณามาถึงก่อนเวลาอย่างน้อย 10 นาที 🙏`;

      const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_TOKEN}`,
        },
        body: JSON.stringify({
          to: customer.line_user_id,
          messages: [{ type: 'text', text: msg }],
        }),
      });

      const status = res.ok ? 'sent' : 'failed';
      console.log(`Reminder ${status} to ${customer.line_user_id} for booking ${booking.id}`);
      results.push({ bookingId: booking.id, status });
    }

    return Response.json({ success: true, checked: active.length, sent: results.filter(r => r.status === 'sent').length, results });
  } catch (error) {
    console.error('bookingReminder2hr error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});