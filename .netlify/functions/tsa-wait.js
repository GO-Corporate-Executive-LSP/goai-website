// netlify/functions/tsa-wait.js
// Simulated TSA wait times for ANY valid 3-letter airport code.
// Returns JSON in the same shape your product-demo.html expects (WaitTimes array).

function randInt(min, max) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtRange(min, max) {
  return `${min}–${max} min`;
}

function nowStamp() {
  // Lightweight "live" stamp (no timezone complexities)
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Simulated • ${hh}:${mm}`;
}

function buildSimulatedWaitTimes(airport) {
  // PreCheck: typically shorter
  const preLo = randInt(3, 12);
  const preHi = preLo + randInt(3, 12);

  // Checkpoint A: moderate
  const aLo = randInt(8, 25);
  const aHi = aLo + randInt(5, 18);

  // Checkpoint B: sometimes heavier
  const bLo = randInt(12, 35);
  const bHi = bLo + randInt(6, 22);

  const created = nowStamp();

  return {
    airport,
    source: "simulated",
    WaitTimes: [
      {
        Checkpoint: "Main Checkpoint",
        Lane: "PreCheck",
        WaitTime: fmtRange(preLo, preHi),
        Created: created,
      },
      {
        Checkpoint: "Security Checkpoint A",
        Lane: "Standard",
        WaitTime: fmtRange(aLo, aHi),
        Created: created,
      },
      {
        Checkpoint: "Security Checkpoint B",
        Lane: "Standard",
        WaitTime: fmtRange(bLo, bHi),
        Created: created,
      },
    ],
  };
}

exports.handler = async (event) => {
  try {
    const airportRaw = event.queryStringParameters?.airport || "";
    const airport = airportRaw.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(airport)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ error: "Invalid airport code. Use 3 letters (e.g., CLT)." }),
      };
    }

    // Always return simulated data for now (so the UI works reliably).
    // Later, you can swap in a real provider and keep this as fallback.
    const payload = buildSimulatedWaitTimes(airport);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(payload),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: err?.message || "Unhandled error" }),
    };
  }
};
