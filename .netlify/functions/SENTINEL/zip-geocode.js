// netlify/functions/zip-geocode.js
// GET /.netlify/functions/zip-geocode?zip=28202
// Returns: { zip, city, state, lat, lon }

exports.handler = async (event) => {
  try {
    const zip = (event.queryStringParameters?.zip || "").trim();

    if (!/^\d{5}$/.test(zip)) {
      return json(400, { error: "Enter a valid 5-digit ZIP." });
    }

    // Node 18+ (Netlify) supports global fetch
    const resp = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      headers: { "accept": "application/json" },
    });

    if (!resp.ok) {
      return json(404, { error: "ZIP not found." });
    }

    const data = await resp.json();
    const place = data?.places?.[0];

    if (!place) {
      return json(404, { error: "No place data for ZIP." });
    }

    const lat = parseFloat(place.latitude);
    const lon = parseFloat(place.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return json(500, { error: "Invalid lat/lon from upstream." });
    }

    return json(200, {
      zip,
      city: place["place name"],
      state: place["state abbreviation"],
      lat,
      lon,
      source: "zippopotam.us",
    });
  } catch (err) {
    return json(500, { error: "Geocode failed.", details: String(err?.message || err) });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Optional: cache successes for 1 day at the edge
      "cache-control": statusCode === 200 ? "public, max-age=86400" : "no-store",
    },
    body: JSON.stringify(body),
  };
}
