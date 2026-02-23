// netlify/functions/tsa-wait.js

exports.handler = async (event) => {
  try {
    const airport = (event.queryStringParameters?.airport || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(airport)) {
      return json(400, { error: "Invalid airport code. Use 3 letters (e.g., CLT)." });
    }

    const url = `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx?ap=${encodeURIComponent(
      airport
    )}&output=json`;

    // If Node runtime doesn't have fetch, this will throw and you'll see it in the error message.
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "goai-netlify-function/1.0",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    const raw = await res.text();

    // If TSA returns non-200, bubble up something meaningful
    if (!res.ok) {
      return json(res.status, {
        error: `TSA upstream error (${res.status})`,
        details: raw.slice(0, 200), // small snippet so you can see if it's HTML/blocked
        airport,
      });
    }

    // TSA should be JSON, but we parse safely
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return json(502, {
        error: "TSA response was not valid JSON",
        airport,
        details: raw.slice(0, 200),
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        // optional, but helpful if you ever call this from a different origin
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return json(500, { error: err?.message || "TSA fetch failed" });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(obj),
  };
}
