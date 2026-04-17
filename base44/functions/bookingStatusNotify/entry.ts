import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');

const LIFF_URL = "https://liff.line.me/2009806106-7u8AyzZg"; // 🔁 เปลี่ยนเป็นของคุณ

// =========================
// 🔁 Retry helper
// =========================
async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    if (i === retries) {
      console.error("LINE API failed:", res.status, await res.text());
      return res;
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

// =========================
// 📩 Send Flex Message
// =========================
async function sendFlexMessage(lineUserId, flex) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !lineUserId) return false;

  const res = await fetchWithRetry(
    'https://api.line.me/v2/bot/message/push',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [flex],
      }),
    }
  );

  return res?.ok;
}

// =========================
// 🎨 Flex Template
// =========================
function buildFlex(statusLabel, booking) {
  return {
    type: "flex",
    altText: `สถานะการจอง: ${statusLabel}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a3a5c",
        paddingAll: "20px",
        contents: [
          {
            type: "text",
            text: statusLabel,
            color: "#ffffff",
            size: "lg",
            weight: "bold"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "20px",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#f4f8ff",
            cornerRadius: "12px",
            paddingAll: "16px",
            contents: [
              {
                type: "text",
                text: `💆 ${booking.service_name || '-'}`,
                size: "md",
                weight: "bold"
              },
              {
                type: "text",
                text: `📅 ${booking.booking_date} | 🕐 ${booking.start_time}`,
                size: "sm",
                color: "#555"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#1a3a5c",
            action: {
              type: "uri",
              label: "ดูรายละเอียดการจอง",
              uri: LIFF_URL
            }
          }
        ]
      }
    }
  };
}

// =========================
// 🏷 Status Labels
// =========================
const STATUS_LABELS = {
  confirmed: '✅ ยืนยันแล้ว',
  checked_in: '🏠 เช็คอินแล้ว',
  in_progress: '💆 กำลังรับบริการ',
  completed: '⭐ เสร็จสิ้น ขอบคุณที่ใช้บริการ!',
  cancelled: '❌ ยกเลิกการจอง',
  no_show: '⚠️ ไม่มาตามนัด',
};

// =========================
// 🚀 Main Handler
// =========================
Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    const booking = payload.data || payload.booking || payload;
    const oldBooking = payload.old_data || null;
    const changedFields = payload.changed_fields || [];

    if (!booking || !booking.status) {
      return Response.json({ skipped: 'no booking data' });
    }

    // ✅ ป้องกัน duplicate event
    if (oldBooking && oldBooking.status === booking.status) {
      return Response.json({ skipped: 'duplicate status' });
    }

    // ✅ เฉพาะตอน status เปลี่ยน
    if (oldBooking && !changedFields.includes('status')) {
      return Response.json({ skipped: 'status not changed' });
    }

    // ❌ ไม่ส่ง pending
    if (booking.status === 'pending') {
      return Response.json({ skipped: 'pending handled elsewhere' });
    }

    const label = STATUS_LABELS[booking.status] || booking.status;
    const lineUserId = booking.line_user_id;

    if (!lineUserId) {
      return Response.json({ skipped: 'no line user id' });
    }

    // =========================
    // 📩 Send to customer
    // =========================
    const flex = buildFlex(label, booking);
    await sendFlexMessage(lineUserId, flex);

    // =========================
    // 📊 Logging
    // =========================
    console.log({
      type: "BOOKING_STATUS_NOTIFY",
      status: booking.status,
      user: lineUserId
    });

    return Response.json({
      success: true,
      status: booking.status
    });

  } catch (error) {
    console.error("notify error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});