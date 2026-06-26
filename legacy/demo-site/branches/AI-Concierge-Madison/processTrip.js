// src/backend/etas/processTrip.js

import { validateTrip } from './validateTrip.js';
import { sentinelLite } from '../sentinel/sentinelLite.js';

/**
 * ETAS Lite — Process Trip
 * Milestone 1 entry point
 *
 * This function represents the boundary between
 * conversational logic and execution logic.
 */
export function processTrip(tripObject) {
  const validationResult = validateTrip(tripObject);

  if (validationResult.status !== 'valid') {
    return {
      status: 'invalid',
      errors: validationResult.errors,
      nextState: 'HUMAN_OVERRIDE'
    };
  }

  // Day 8: Enrich trip with SENTINEL Lite (non-blocking, optional)
  const sentinelData = sentinelLite(tripObject);

  const enrichedTrip = {
    ...tripObject,
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
