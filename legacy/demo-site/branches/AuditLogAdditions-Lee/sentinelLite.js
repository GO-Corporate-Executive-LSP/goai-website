/**
 * SENTINEL™ Lite — Lightweight Trip Enrichment
 * Day 8: Non-blocking intelligence layer
 * Day 12: Tier-aware depth control
 * 
 * Purpose: Add contextual risk awareness without blocking execution
 * Policy: Optional, informational, never required
 */

export function sentinelLite(trip, context = {}) {
  try {
    const { tier = "basic", requestedDepth = "lite" } = context;
    
    // Log SENTINEL invocation with tier context
    console.log(`[SENTINEL] Evaluating trip with tier: ${tier}, depth: ${requestedDepth}`);
    
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
    
    // Day 12: Tier-specific guidance
    if (tier === "executive" && riskScore !== "LOW") {
      guidance.push("Executive tier: recommend manual approval");
    }

    console.log(`[SENTINEL Lite] Trip evaluated: ${riskScore} risk at ${hour}:00 (tier: ${tier})`);

    return {
      riskScore,
      flags: [],
      guidance,
      evaluatedAt: new Date().toISOString(),
      // Day 12: Include tier context in result
      tierContext: {
        tier,
        requestedDepth
      }
    };
  } catch (error) {
    // Non-blocking: log and return null on failure
    console.error("[SENTINEL Lite] Evaluation failed (non-blocking):", error.message);
    return null;
  }
}
