/**
 * stateMachineGuard.js
 * 
 * Centralized state machine guard for lifecycle transitions.
 * Single source of truth for allowed transitions.
 */

export const allowedTransitions = {
  draft: ["booking_ready", "cancelled"],
  booking_ready: ["pending_approval", "booked", "cancelled"],
  pending_approval: ["approved", "needs_adjustment", "escalated", "cancelled"],
  approved: ["booked", "cancelled"],
  needs_adjustment: ["draft", "cancelled"],
  escalated: ["approved", "cancelled"],
  booked: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};

export function getAllowedTransitions(fromState) {
  if (!fromState) {
    return [];
  }

  return allowedTransitions[fromState] || [];
}

export function canTransition(fromState, toState) {
  if (!fromState || !toState) {
    return false;
  }

  return getAllowedTransitions(fromState).includes(toState);
}

export function assertCanTransition(fromState, toState) {
  if (!canTransition(fromState, toState)) {
    throw new Error(`Invalid state transition: ${fromState} -> ${toState}`);
  }
}

export default {
  allowedTransitions,
  getAllowedTransitions,
  canTransition,
  assertCanTransition
};
