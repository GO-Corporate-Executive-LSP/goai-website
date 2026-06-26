/**
 * SENTINEL™ Lite — Lightweight Trip Enrichment
 * Day 8: Non-blocking intelligence layer
 * 
 * Purpose: Add contextual risk awareness without blocking execution
 * Policy: Optional, informational, never required
 */

export function sentinelLite(trip) {
  try {
    // VERY lightweight heuristics (temporary)
    const hour = new Date(trip.pickup.datetime).getHours();

    let riskScore = "LOW";
    if (hour < 5 || hour > 22) {
      riskScore = "MEDIUM";
    }

    const guidance = [];
    if (riskScore === "MEDIUM") {
      guidance.push("Consider allowing extra travel time");
    }

    console.log(`[SENTINEL Lite] Trip evaluated: ${riskScore} risk at ${hour}:00`);

    return {
      riskScore,
      flags: [],
      guidance,
      evaluatedAt: new Date().toISOString()
    };
  } catch (error) {
    // Non-blocking: log and return null on failure
    console.error("[SENTINEL Lite] Evaluation failed (non-blocking):", error.message);
    return null;
  }
}
