import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_NOTIFY_TOKEN = Deno.env.get('LINE_NOTIFY_TOKEN');

async function sendLineMessage(lineUserId, message) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !lineUserId) return false;
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: 'text', text: message }],
    }),
  });
  if (!res.ok) console.error('sendLineMessage error:', await res.text());
  return res.ok;
}

async function sendLineNotify(message) {
  if (!LINE_NOTIFY_TOKEN) return false;
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
    },
    body: new URLSearchParams({ message }),
  });
  if (!res.ok) console.error('sendLineNotify error:', await res.text());
  return res.ok;
}

const STATUS_LABELS = {
  confirmed: '✅ ยืนยันแล้ว',
  checked_in: '🏠 เช็คอินแล้ว',
  in_progress: '💆 กำลังรับบริการ',
  completed: '⭐ เสร็จสิ้น ขอบคุณที่ใช้บริการ!',
  cancelled: '❌ ยกเลิกการจอง',
  no_show: '⚠️ ไม่มาตามนัด',
};

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Support both: entity automation payload and direct invocation
    const booking = payload.data || payload.booking || payload;
    const oldBooking = payload.old_data || null;
    const changedFields = payload.changed_fields || [];

    if (!booking || !booking.status) {
      return Response.json({ skipped: 'no booking data' });
    }

    // For entity automation: only act if status actually changed
    if (oldBooking && !changedFields.includes('status')) {
      return Response.json({ skipped: 'status not changed' });
    }

    // Skip sending notify for 'pending' status (handled by createBooking flow)
    if (booking.status === 'pending') {
      return Response.json({ skipped: 'pending status handled by createBooking' });
    }

    const label = STATUS_LABELS[booking.status] || booking.status;
    const lineUserId = booking.line_user_id;
    const serviceName = booking.service_name || '-';
    const bookingDate = booking.booking_date || '-';
    const startTime = booking.start_time || '-';
    const customerName = booking.customer_name || '-';

    const promises = [];

    if (lineUserId) {
      const customerMsg = `${label}\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}`;
      promises.push(sendLineMessage(lineUserId, customerMsg));
    }

    const adminMsg = `\n🔄 สถานะการจองเปลี่ยน: ${label}\nลูกค้า: ${customerName}\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}`;
    promises.push(sendLineNotify(adminMsg));

    const results = await Promise.allSettled(promises);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Notify #${i} failed:`, r.reason);
    });

    return Response.json({ success: true, status: booking.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});