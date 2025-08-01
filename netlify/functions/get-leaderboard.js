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
    // Parse credentials
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    
    // Set up Google Sheets API
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    if (event.httpMethod === 'POST') {
      // Save new bid
      const bidData = JSON.parse(event.body);
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            new Date().toISOString(),
            bidData.name,
            bidData.amount,
            bidData.email || ''
          ]]
        }
      });

      // Get all bids to return
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'A2:D1000'
      });

      const rows = response.data.values || [];
      const bids = rows.map(row => ({
        name: row[1],
        amount: parseFloat(row[2]),
        timestamp: row[0]
      })).sort((a, b) => b.amount - a.amount);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, bids: bids.slice(0, 10) })
      };
    }

    if (event.httpMethod === 'GET') {
      // Get all bids
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'A2:D1000'
      });

      const rows = response.data.values || [];
      const bids = rows.map(row => ({
        name: row[1],
        amount: parseFloat(row[2]),
        timestamp: row[0]
})).sort((a, b) => b.amount - a.amount);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bids.slice(0, 10))
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to access leaderboard' })
    };
  }
};
