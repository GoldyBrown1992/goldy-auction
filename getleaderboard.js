exports.handler = async (event) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Demo leaderboard data
    const leaderboardData = {
      bids: [
        { name: 'John Doe', amount: 1000 },
        { name: 'Jane Smith', amount: 750 },
        { name: 'Demo User', amount: 500 },
        { name: 'Test Bidder', amount: 250 },
        { name: 'Mike Ross', amount: 100 }
      ],
      currentHighBid: 1000
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(leaderboardData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard' })
    };
  }
};