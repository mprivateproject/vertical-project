import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_NOTIFY_TOKEN = Deno.env.get('LINE_NOTIFY_TOKEN');

// Send message to LINE user via Messaging API
export async function sendLineMessage(lineUserId, message) {
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
  if (!res.ok) {
    const err = await res.text();
    console.error('sendLineMessage error:', err);
  }
  return res.ok;
}

// Send admin alert via LINE Notify
export async function sendLineNotify(message) {
  if (!LINE_NOTIFY_TOKEN) return false;
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
    },
    body: new URLSearchParams({ message }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('sendLineNotify error:', err);
  }
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, lineUserId, bookingData } = await req.json();

    if (type === 'booking_confirmation' && lineUserId && bookingData) {
      const { serviceName, bookingDate, startTime, price, customerName } = bookingData;

      const customerMsg = `✅ ยืนยันการจอง\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate}\nเวลา: ${startTime}\nราคา: ฿${Number(price).toLocaleString()}\n\nขอบคุณที่ใช้บริการครับ 🙏`;
      const adminMsg = `\n📅 มีการจองใหม่!\nลูกค้า: ${customerName || '-'}\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}\nราคา: ฿${Number(price).toLocaleString()}`;

      const [customerOk, adminOk] = await Promise.all([
        sendLineMessage(lineUserId, customerMsg),
        sendLineNotify(adminMsg),
      ]);

      return Response.json({ success: true, customerOk, adminOk });
    }

    if (type === 'status_changed' && bookingData) {
      const { lineUserId: uid, serviceName, bookingDate, startTime, status, customerName } = bookingData;

      const statusLabels = {
        confirmed: '✅ ยืนยันแล้ว',
        checked_in: '🏠 เช็คอินแล้ว',
        in_progress: '💆 กำลังรับบริการ',
        completed: '⭐ เสร็จสิ้น ขอบคุณที่ใช้บริการ!',
        cancelled: '❌ ยกเลิกการจอง',
        no_show: '⚠️ ไม่มาตามนัด',
      };

      const label = statusLabels[status] || status;

      const promises = [];

      if (uid) {
        const customerMsg = `${label}\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}`;
        promises.push(sendLineMessage(uid, customerMsg));
      }

      const adminMsg = `\n🔄 สถานะการจองเปลี่ยน: ${label}\nลูกค้า: ${customerName || '-'}\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}`;
      promises.push(sendLineNotify(adminMsg));

      await Promise.all(promises);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});