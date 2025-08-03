// netlify/functions/capture-payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { payment_intent_id, winner_email } = JSON.parse(event.body);
    
    // Capture the payment (actually charge the card)
    const paymentIntent = await stripe.paymentIntents.capture(payment_intent_id);
    
    // Send confirmation email (optional)
    console.log(`Payment captured for ${winner_email}: ${paymentIntent.id}`);
    
    // Update Google Sheets to mark as paid
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Add payment capture record
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Payments!A:E', // Create a "Payments" tab in your sheet
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          payment_intent_id,
          paymentIntent.amount / 100,
          winner_email,
          'CAPTURED'
        ]]
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment captured successfully',
        amount: paymentIntent.amount / 100,
        payment_id: paymentIntent.id
      })
    };
    
  } catch (error) {
    console.error('Payment capture error:', error);
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
