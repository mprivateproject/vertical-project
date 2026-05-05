import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

async function syncCustomer(base44, lineUserId, profile) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('customers')
    .upsert({ base44_id: base44, line_user_id: lineUserId, ...profile }, { onConflict: 'base44_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

const ACTIONS = new Set([
  'getServices',
  'getTherapists',
  'getBookings',
  'createBooking',
  'cancelBooking',
  'syncCustomer',
]);

Deno.serve(async (req) => {
  try {
    let action, bookingData;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
      const rawData = url.searchParams.get('bookingData');
      bookingData = rawData ? JSON.parse(rawData) : undefined;
    } else {
      const body = await req.json();
      action = body.action;
      bookingData = body.bookingData;
    }

    console.log('LIFF SYNC action:', action);

    // no token verification needed

    if (!ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabase();
    let result;

    if (action === 'getServices') {
      const { data, error } = await supabase.from('services').select('*').eq('active', true);
      if (error) throw error;
      result = data;
    } else if (action === 'getTherapists') {
      const { data, error } = await supabase.from('therapists').select('*').eq('active', true);
      if (error) throw error;
      result = data;
    } else if (action === 'getBookings') {
      const customerId = bookingData && bookingData.customerId;
      const { data, error } = await supabase.from('bookings').select('*').eq('customer_id', customerId);
      if (error) throw error;
      result = data;
    } else if (action === 'createBooking') {
      const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
      if (error) throw error;
      result = data;
    } else if (action === 'cancelBooking') {
      const { data, error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingData.id).select().single();
      if (error) throw error;
      result = data;
    } else if (action === 'syncCustomer') {
      result = await syncCustomer(bookingData.base44, bookingData.lineUserId, bookingData.profile || {});
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('liffSync error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
