exports.handler = async (event) => {
  const airport = event.queryStringParameters?.airport?.toUpperCase();

  // Validate input
  if (!airport || !/^[A-Z]{3}$/.test(airport)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Valid 3-letter airport code required" })
    };
  }

  try {
    const response = await fetch(
      `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx?ap=${airport}&output=json`
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "TSA service unavailable" })
      };
    }

    const data = await response.json();

    // If TSA returns empty or unexpected structure
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ WaitTimes: [] })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "TSA fetch failed" })
    };
  }
};
