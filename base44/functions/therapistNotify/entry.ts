import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * therapistNotify — runs every hour via scheduled automation.
 * Finds bookings starting in the next 2 hours (±5 min window)
 * and sends a LINE push message to the LINE_NOTIFY_TOKEN group
 * (or a dedicated therapist LINE user ID) with full session details.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only guard if called manually
    const body = await req.json().catch(() => ({}));

    const now = new Date();
    // Bangkok time offset: UTC+7
    const bangkokOffset = 7 * 60;
    const bangkokNow = new Date(now.getTime() + bangkokOffset * 60 * 1000);

    const todayStr = bangkokNow.toISOString().slice(0, 10);
    const currentMinutes = bangkokNow.getUTCHours() * 60 + bangkokNow.getUTCMinutes();

    console.log(`🕐 therapistNotify running. Bangkok time: ${bangkokNow.toISOString()}, date: ${todayStr}, minutes from midnight: ${currentMinutes}`);

    // Fetch today's active bookings
    const bookings = await base44.asServiceRole.entities.Booking.filter(
      { booking_date: todayStr },
      'start_time',
      100
    );

    const upcoming = bookings.filter(b => {
      if (b.status === 'cancelled' || b.status === 'completed' || b.status === 'no_show') return false;
      const [h, m] = b.start_time.split(':').map(Number);
      const bookingMinutes = h * 60 + m;
      // Notify when session is 110–130 min away (~2 hours before)
      const diff = bookingMinutes - currentMinutes;
      return diff >= 110 && diff <= 130;
    });

    console.log(`📋 Found ${upcoming.length} upcoming bookings to notify about.`);

    if (upcoming.length === 0) {
      return Response.json({ notified: 0, message: 'No upcoming bookings in the 2-hour window.' });
    }

    const lineToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    const lineNotifyToken = Deno.env.get('LINE_NOTIFY_TOKEN');
    let notified = 0;

    for (const booking of upcoming) {
      const {
        customer_name,
        service_name,
        therapist_name,
        booking_date,
        start_time,
        end_time,
        duration_minutes,
        price,
        payment_status,
        customer_notes,
        staff_notes,
      } = booking;

      // Build preparation advice based on service
      let prepNotes = '';
      const svcLower = (service_name || '').toLowerCase();
      if (svcLower.includes('signature') || svcLower.includes('massage')) {
        prepNotes = '• เตรียมน้ำมันนวด Aromatherapy\n• ตั้งอุณหภูมิห้องให้พอดี (25–26°C)\n• เตรียมผ้าร้อนสำหรับ warm-up\n• ตรวจสอบ pressure preference ของลูกค้า';
      } else if (svcLower.includes('facial')) {
        prepNotes = '• เตรียมผลิตภัณฑ์ Facial ตามผิวลูกค้า\n• ทดสอบอุณหภูมิ steamer\n• เตรียม mask และ serum';
      } else if (svcLower.includes('body')) {
        prepNotes = '• เตรียม body scrub และ wrap materials\n• ตั้งอุณหภูมิ treatment table\n• เตรียมผ้าขนหนูอุ่น';
      } else {
        prepNotes = '• ตรวจสอบห้องและอุปกรณ์ให้พร้อม\n• เตรียมน้ำดื่มและผ้าเช็ดตัว';
      }

      const paymentNote = payment_status === 'paid' ? '✅ ชำระแล้ว' : '⚠️ ยังไม่ชำระ';

      const msg = [
        `🌿 แจ้งเตือนนัดหมายที่กำลังจะมาถึง`,
        ``,
        `👤 ลูกค้า: ${customer_name || 'ไม่ระบุ'}`,
        `💆 บริการ: ${service_name || 'ไม่ระบุ'}`,
        `⏱ ระยะเวลา: ${duration_minutes || '-'} นาที`,
        `🕐 เวลา: ${start_time}${end_time ? ' – ' + end_time : ''}`,
        `👩‍⚕️ นักบำบัด: ${therapist_name || 'M'}`,
        `💳 การชำระเงิน: ${paymentNote}`,
        `💰 ราคา: ฿${Number(price || 0).toLocaleString()}`,
        customer_notes ? `📝 หมายเหตุลูกค้า: ${customer_notes}` : null,
        staff_notes ? `🗒 Staff Notes: ${staff_notes}` : null,
        ``,
        `📋 การเตรียมตัว:`,
        prepNotes,
      ].filter(l => l !== null).join('\n');

      // Send via LINE Notify (group notification)
      if (lineNotifyToken) {
        const notifyRes = await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lineNotifyToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ message: '\n' + msg }),
        });
        if (!notifyRes.ok) {
          const err = await notifyRes.text();
          console.error(`❌ LINE Notify failed for booking ${booking.id}:`, err);
        } else {
          console.log(`✅ LINE Notify sent for booking ${booking.id}`);
          notified++;
        }
      } else {
        console.warn('⚠️ LINE_NOTIFY_TOKEN not set — skipping notification');
      }
    }

    return Response.json({ notified, bookingsChecked: upcoming.length });

  } catch (error) {
    console.error('❌ therapistNotify error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});