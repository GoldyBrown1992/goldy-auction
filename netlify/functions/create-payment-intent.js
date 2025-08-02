const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { amount, payment_method, customer_email, bidder_name } = JSON.parse(event.body);
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      payment_method: payment_method,
      confirm: true,
      description: `Auction bid by ${bidder_name}`,
      receipt_email: customer_email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret
      })
    };
    
  } catch (error) {
    console.error('Payment intent error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        type: error.type 
      })
    };
  }
};
