import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { serviceName, price, bookingData, successUrl, cancelUrl } = body;

    if (!price || !serviceName) {
      return Response.json({ error: 'Missing required fields: serviceName, price' }, { status: 400 });
    }

    // Price is in THB (integer baht), Stripe needs smallest currency unit
    // THB is a zero-decimal currency in Stripe (no subunits)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: serviceName,
              description: bookingData?.therapist_name
                ? `Therapist: ${bookingData.therapist_name} | ${bookingData.booking_date} ${bookingData.start_time}`
                : `${bookingData?.booking_date || ''} ${bookingData?.start_time || ''}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects smallest unit (satang for THB)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        service_name: serviceName,
        booking_date: bookingData?.booking_date || '',
        start_time: bookingData?.start_time || '',
        therapist_name: bookingData?.therapist_name || '',
      },
    });

    console.log('✅ Stripe session created:', session.id);
    return Response.json({ url: session.url, sessionId: session.id });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});