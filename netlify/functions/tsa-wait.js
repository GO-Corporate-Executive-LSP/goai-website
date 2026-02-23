exports.handler = async (event) => {
  const airport = event.queryStringParameters?.airport?.toUpperCase();

  if (!airport || !/^[A-Z]{3}$/.test(airport)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Valid 3-letter airport code required" })
    };
  }

  try {
    const res = await fetch(
      `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx?ap=${airport}&output=json`
    );

    if (!res.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "TSA service unavailable" })
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "TSA fetch failed" })
    };
  }
};
