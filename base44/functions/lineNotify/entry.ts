import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_NOTIFY_TOKEN = Deno.env.get('LINE_NOTIFY_TOKEN');

// Send message to LINE user via Messaging API
async function sendLineMessage(lineUserId, message) {
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
  return res.ok;
}

// Send admin alert via LINE Notify
async function sendLineNotify(message) {
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
    },
    body: new URLSearchParams({ message }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, lineUserId, bookingData } = await req.json();

    if (type === 'booking_confirmation' && lineUserId && bookingData) {
      const { serviceName, bookingDate, startTime, price } = bookingData;

      // Message to customer
      const customerMsg = `✅ ยืนยันการจอง\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate}\nเวลา: ${startTime}\nราคา: ฿${price?.toLocaleString()}\n\nขอบคุณที่ใช้บริการครับ 🙏`;

      // Admin alert
      const adminMsg = `\n📅 มีการจองใหม่!\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}\nราคา: ฿${price?.toLocaleString()}`;

      const [customerOk, adminOk] = await Promise.all([
        sendLineMessage(lineUserId, customerMsg),
        sendLineNotify(adminMsg),
      ]);

      return Response.json({ success: true, customerOk, adminOk });
    }

    if (type === 'admin_notify' && bookingData) {
      const { serviceName, bookingDate, startTime, price } = bookingData;
      const adminMsg = `\n📅 มีการจองใหม่!\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}\nราคา: ฿${price?.toLocaleString()}`;
      const adminOk = await sendLineNotify(adminMsg);
      return Response.json({ success: true, adminOk });
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});