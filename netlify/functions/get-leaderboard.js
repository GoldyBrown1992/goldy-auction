// Store bids in memory (resets when function cold starts)
let bids = [];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Handle POST requests to add new bids
  if (event.httpMethod === 'POST') {
    try {
      const bidData = JSON.parse(event.body);
      
      // Add timestamp and push to bids array
      bids.push({
        name: bidData.name,
        amount: parseFloat(bidData.amount),
        timestamp: new Date().toISOString()
      });
      
      // Sort by amount (highest first)
      bids.sort((a, b) => b.amount - a.amount);
      
      // Keep only top 10
      bids = bids.slice(0, 10);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, bids })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to add bid' })
      };
    }
  }

  // Handle GET requests to return leaderboard
  if (event.httpMethod === 'GET') {
    // If no bids yet, return sample data
    const leaderboardData = bids.length > 0 ? bids : [
      { name: 'John Doe', amount: 250 },
      { name: 'Jane Smith', amount: 200 },
      { name: 'Bob Johnson', amount: 150 }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(leaderboardData)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
