// Constants
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_NOTIFY_TOKEN = Deno.env.get('LINE_NOTIFY_TOKEN');
const FETCH_TIMEOUT_MS = 10000; // 10 วินาที
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 วินาที

// Types
interface SendLineMessageResult {
  success: boolean;
  error?: string;
}

interface BookingData {
  serviceName: string;
  bookingDate: string;
  startTime: string;
  price?: string | number;
  customerName?: string;
  lineUserId?: string;
  status?: string;
}

interface RequestPayload {
  type: 'booking_confirmation' | 'status_changed';
  lineUserId?: string;
  bookingData?: BookingData;
}

// Helper: Create AbortSignal with timeout
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

// Helper: Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const signal = createTimeoutSignal(FETCH_TIMEOUT_MS);
    const res = await fetch(url, { ...options, signal });
    return res;
  } catch (error) {
    if (retries > 0 && (error instanceof Error && error.name === 'AbortError')) {
      // Timeout หรือ network error ให้ retry
      const delay = RETRY_DELAY_MS * (MAX_RETRIES - retries + 1); // exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Send message to LINE user via Messaging API
export async function sendLineMessage(
  lineUserId: string,
  message: string
): Promise<SendLineMessageResult> {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !lineUserId) {
    return { success: false, error: 'Missing LINE_CHANNEL_ACCESS_TOKEN or lineUserId' };
  }

  try {
    const res = await fetchWithRetry('https://api.line.me/v2/bot/message/push', {
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
      console.error('sendLineMessage error:', {
        status: res.status,
        statusText: res.statusText,
        error: err,
        lineUserId,
      });
      return { success: false, error: `LINE API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('sendLineMessage exception:', {
      error: errorMsg,
      lineUserId,
    });
    return { success: false, error: errorMsg };
  }
}

// Send admin alert via LINE Notify
export async function sendLineNotify(message: string): Promise<SendLineMessageResult> {
  if (!LINE_NOTIFY_TOKEN) {
    return { success: false, error: 'Missing LINE_NOTIFY_TOKEN' };
  }

  try {
    const res = await fetchWithRetry('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
      body: new URLSearchParams({ message }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('sendLineNotify error:', {
        status: res.status,
        statusText: res.statusText,
        error: err,
      });
      return { success: false, error: `LINE Notify API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('sendLineNotify exception:', { error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

// Status labels mapping
const STATUS_LABELS: Record<string, string> = {
  confirmed: '✅ ยืนยันแล้ว',
  checked_in: '🏠 เช็คอินแล้ว',
  in_progress: '💆 กำลังรับบริการ',
  completed: '⭐ เสร็จสิ้น ขอบคุณที่ใช้บริการ!',
  cancelled: '❌ ยกเลิกการจอง',
  no_show: '⚠️ ไม่มาตามนัด',
};

// Handle booking confirmation
async function handleBookingConfirmation(
  lineUserId: string,
  bookingData: BookingData
): Promise<{ success: boolean; customerOk: boolean; adminOk: boolean; errors?: string[] }> {
  const { serviceName, bookingDate, startTime, price, customerName } = bookingData;

  const customerMsg = `✅ ยืนยันการจอง\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate}\nเวลา: ${startTime}\nราคา: ${price || '-'}`;
  const adminMsg = `📅 มีการจองใหม่!\nลูกค้า: ${customerName || '-'}\nบริการ: ${serviceName}\nวันที่: ${bookingDate}\nเวลา: ${startTime}`;

  const results = await Promise.allSettled([
    sendLineMessage(lineUserId, customerMsg),
    sendLineNotify(adminMsg),
  ]);

  const customerOk = results[0].status === 'fulfilled' && results[0].value.success;
  const adminOk = results[1].status === 'fulfilled' && results[1].value.success;

  const errors: string[] = [];
  if (results[0].status === 'rejected') errors.push(`Customer message failed: ${results[0].reason}`);
  if (results[0].status === 'fulfilled' && !results[0].value.success) {
    errors.push(`Customer message failed: ${results[0].value.error}`);
  }
  if (results[1].status === 'rejected') errors.push(`Admin message failed: ${results[1].reason}`);
  if (results[1].status === 'fulfilled' && !results[1].value.success) {
    errors.push(`Admin message failed: ${results[1].value.error}`);
  }

  return { success: customerOk && adminOk, customerOk, adminOk, errors };
}

// Handle status change
async function handleStatusChanged(
  bookingData: BookingData
): Promise<{ success: boolean; errors?: string[] }> {
  const { lineUserId: uid, serviceName, bookingDate, startTime, status, customerName } = bookingData;

  const label = STATUS_LABELS[status || ''] || status || 'ไม่ทราบสถานะ';

  const promises: Promise<SendLineMessageResult>[] = [];

  if (uid) {
    const customerMsg = `${label}\n\nบริการ: ${serviceName}\nวันที่: ${bookingDate} เวลา: ${startTime}`;
    promises.push(sendLineMessage(uid, customerMsg));
  }

  const adminMsg = `🔄 สถานะการจองเปลี่ยน: ${label}\nลูกค้า: ${customerName || '-'}\nบริการ: ${serviceName}\nวันที่: ${bookingDate}`;
  promises.push(sendLineNotify(adminMsg));

  const results = await Promise.allSettled(promises);

  const errors: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      errors.push(`Message ${index} failed: ${result.reason}`);
    } else if (!result.value.success) {
      errors.push(`Message ${index} failed: ${result.value.error}`);
    }
  });

  const success = results.every(
    r => r.status === 'fulfilled' && r.value.success
  );

  return { success, errors };
}

// Main handler
Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Parse request body
    let payload: RequestPayload;
    try {
      payload = await req.json();
    } catch (error) {
      const parseError = error instanceof Error ? error.message : String(error);
      return Response.json(
        {
          error: 'Invalid JSON payload: expected a valid JSON object body',
          expected: {
            type: 'booking_confirmation | status_changed',
            lineUserId: 'string (required for booking_confirmation)',
            bookingData: 'object (required)',
          },
          details: parseError,
        },
        { status: 400 }
      );
    }

    const { type, lineUserId, bookingData } = payload;

    // Handle booking confirmation
    if (type === 'booking_confirmation') {
      if (!lineUserId || !bookingData) {
        return Response.json(
          { error: 'Missing lineUserId or bookingData' },
          { status: 400 }
        );
      }
      const result = await handleBookingConfirmation(lineUserId, bookingData);
      return Response.json(result);
    }

    // Handle status change
    if (type === 'status_changed') {
      if (!bookingData) {
        return Response.json({ error: 'Missing bookingData' }, { status: 400 });
      }
      const result = await handleStatusChanged(bookingData);
      return Response.json(result);
    }

    // Invalid type
    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const duration = Date.now() - startTime;

    console.error('lineNotify handler error:', {
      error: errorMsg,
      duration,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      { error: 'Internal server error', message: errorMsg },
      { status: 500 }
    );
  }
});
