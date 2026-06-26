// src/backend/etas/processTrip.js

import { validateTrip } from './validateTrip.js';

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

  return {
    status: 'valid',
    trip: {
      ...tripObject,
      state: 'review'
    },
    nextState: 'READY_FOR_CONFIRMATION'
  };
}
