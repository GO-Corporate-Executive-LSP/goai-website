exports.handler = async function(event, context) {

  const zip = (event.queryStringParameters?.zip || "").trim();

  if (!/^\d{5}$/.test(zip)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Enter a valid 5-digit ZIP." })
    };
  }

  const demo = {
    "28202": { score: 72, tier: "ELEVATED", reasons: [
      "High daytime density near transit corridors",
      "Event footprint within 2 miles",
      "Schedule sensitivity: tight transfer windows"
    ]},
    "94105": { score: 64, tier: "GUARDED", reasons: [
      "Dense business district + congestion risk",
      "Higher pickup friction during peak hours",
      "Route variability elevated"
    ]},
    "33131": { score: 58, tier: "GUARDED", reasons: [
      "Urban density + waterfront event traffic",
      "Higher disruption probability",
      "Recommend buffer time"
    ]}
  };

  const entry = demo[zip] || {
    score: 49,
    tier: "STANDARD",
    reasons: [
      "No high-signal risks detected in demo dataset",
      "Monitor weather + traffic windows",
      "Use predictable pickup points"
    ]
  };

  const briefing = entry.score >= 70
    ? "SENTINEL recommends minimizing stops, using a single pickup point, and adding buffer time."
    : entry.score >= 55
      ? "SENTINEL recommends a modest buffer and avoiding last-minute route changes."
      : "SENTINEL indicates standard conditions. Keep basic buffers and monitor disruptions.";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({
      zip,
      risk_score: entry.score,
      tier: entry.tier,
      reasoning: entry.reasons,
      briefing
    })
  };
};
