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

  const endpoint =
    `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx` +
    `?ap=${encodeURIComponent(airport)}&output=json`;

  // Fallback so the UI always works (investor-safe demo)
  const demo = {
    source: "demo_fallback",
    airport,
    WaitTimes: [
      { Checkpoint: "Main Checkpoint", Lane: "PreCheck", WaitTime: "5–10 min", Created: "Demo" },
      { Checkpoint: "Main Checkpoint", Lane: "Standard", WaitTime: "15–25 min", Created: "Demo" },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Referer": "https://www.tsa.gov/",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const text = await res.text();

    // If we got redirected to tsa.gov (HTML), fall back
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const looksLikeHtml =
      contentType.includes("text/html") ||
      text.trim().startsWith("<!DOCTYPE html") ||
      text.trim().startsWith("<html");

    // This is exactly what you're seeing: status 200 but HTML from tsa.gov
    if (looksLikeHtml) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          ...demo,
          note: "TSA endpoint returned HTML (likely redirect/block). Using demo fallback.",
          final_url: res.url,
          status: res.status,
        }),
      };
    }

    // Try JSON parse
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          ...demo,
          note: "TSA response not valid JSON. Using demo fallback.",
          final_url: res.url,
          status: res.status,
        }),
      };
    }

    // Successful real payload
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ source: "tsa_endpoint", airport, ...data }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        ...demo,
        note: "TSA fetch failed. Using demo fallback.",
        details: err?.message || String(err),
      }),
    };
  }
};
