// netlify/functions/tsa-wait.js

exports.handler = async (event) => {
  const airportRaw = event?.queryStringParameters?.airport || "";
  const airport = airportRaw.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(airport)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Invalid airport code. Use 3 letters (e.g., CLT, RDU, JFK)." }),
    };
  }

  // TSA endpoint you referenced
  const url =
    `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx` +
    `?ap=${encodeURIComponent(airport)}&output=json`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        // Sometimes helps if a service is picky
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; GOAI-NetlifyFunction/1.0)",
      },
      redirect: "follow",
    });

    const text = await res.text(); // IMPORTANT: read as text first

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // TSA gave us HTML or non-JSON
      const snippet = text.slice(0, 220);

      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "TSA response was not valid JSON",
          airport,
          status: res.status,
          final_url: res.url,
          details: snippet,
        }),
      };
    }

    // If TSA returns a JSON error payload, bubble it up cleanly
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "TSA request failed",
          airport,
          status: res.status,
          final_url: res.url,
          tsa: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        error: "TSA fetch failed",
        airport,
        details: err?.message || String(err),
      }),
    };
  }
};
