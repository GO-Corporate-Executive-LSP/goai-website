// src/backend/etas/processTrip.js

import { validateTrip } from './validateTrip.js';
import { sentinelLite } from '../sentinel/sentinelLite.js';
import { resolveTierForTrip, logTierEvaluation, getSentinelDepth } from './tierDefinitions.js';

/**
 * ETAS Lite — Process Trip
 * Milestone 1 entry point
 * Day 12: Tier-aware behavior
 *
 * This function represents the boundary between
 * conversational logic and execution logic.
 */
export function processTrip(tripObject) {
  // Day 12: Resolve tier before validation (tier affects downstream behavior)
  if (!tripObject.tier || !tripObject.tier.name || !tripObject.tier.locked) {
    tripObject.tier = resolveTierForTrip({
      user_id: tripObject.user_id,
      tier: tripObject.tier
    });
  }
  
  // Log tier evaluation for audit trail
  logTierEvaluation(tripObject);

  const validationResult = validateTrip(tripObject);

  if (validationResult.status !== 'valid') {
    return {
      status: 'invalid',
      errors: validationResult.errors,
      nextState: 'HUMAN_OVERRIDE'
    };
  }

  const normalizedTrip = validationResult.payload;

  // Day 12: Pass tier context to SENTINEL (tier determines depth)
  const sentinelDepth = getSentinelDepth(normalizedTrip.tier.name);
  const sentinelTimeoutMs = 1500;
  let sentinelData = null;

  // Ensure SENTINEL never mutates trip state by passing a defensive clone
  const sentinelTripInput = JSON.parse(JSON.stringify(normalizedTrip));

  try {
    const startTime = Date.now();
    sentinelData = sentinelLite(sentinelTripInput, {
      tier: normalizedTrip.tier.name,
      requestedDepth: sentinelDepth
    });

    const durationMs = Date.now() - startTime;
    if (durationMs > sentinelTimeoutMs) {
      sentinelData = null;
    }
  } catch (error) {
    sentinelData = null;
  }

  const enrichedTrip = {
    ...normalizedTrip,
    state: 'review'
  };

  // Only add sentinel if evaluation succeeded
  if (sentinelData) {
    enrichedTrip.sentinel = sentinelData;
  }

  return {
    status: 'valid',
    trip: enrichedTrip,
    nextState: 'READY_FOR_CONFIRMATION'
  };
}
