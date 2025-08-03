const { google } = require('googleapis');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    const bidData = JSON.parse(event.body);
    
    // Parse the credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    
    // Set up Google Sheets API
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Append the bid to the sheet with payment intent ID
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'A:F', // Extended to include payment intent ID
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          bidData.name,
          bidData.amount,
          bidData.email || '',
          bidData.payment_intent_id || '', // Save payment intent ID
          'AUTHORIZED' // Status
        ]]
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Bid saved successfully' 
      })
    };
    
  } catch (error) {
    console.error('Error saving to sheets:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save bid',
        details: error.message 
      })
    };
  }
};
