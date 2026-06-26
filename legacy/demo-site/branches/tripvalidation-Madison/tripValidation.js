/**
 * Trip Validation — Sprint Day 3 + Day 4 Integration
 * 
 * Defines validation layers, error boundaries, and failure handling
 * for the ETAS trip booking system.
 * 
 * Day 4 Integration: Now uses tierDefinitions.js for capacity validation
 * 
 * VALIDATION LAYERS:
 * 1. Field-level: Is the value shaped correctly?
 * 2. Trip-level: Does the trip make sense as a whole?
 * 3. System-level: Is the system allowed to proceed?
 * 
 * VALIDATION OUTCOMES:
 * - VALID: Trip passes all checks, can proceed
 * - INVALID: User-fixable issue, return to draft
 * - BLOCKED: System/admin intervention required
 * 
 * SENTINEL RULE:
 * SENTINEL validation NEVER blocks booking.
 * SENTINEL may return warnings or context only.
 */

// Import tier logic from Day 4
import { 
  validateTierCapacity, 
  validateTierForState,
  isTierRequired,
  TIERS 
} from './tierDefinitions.js';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION OUTCOMES & ERROR CODES
// ═══════════════════════════════════════════════════════════════════════════

export const ValidationOutcome = {
  VALID: "VALID",
  INVALID: "INVALID",
  BLOCKED: "BLOCKED"
};

export const ErrorCode = {
  // Field-level errors (INVALID - user fixable)
  MISSING_PICKUP_ADDRESS: "MISSING_PICKUP_ADDRESS",
  MISSING_PICKUP_TIME: "MISSING_PICKUP_TIME",
  MISSING_DROPOFF_ADDRESS: "MISSING_DROPOFF_ADDRESS",
  INVALID_PICKUP_TIME: "INVALID_PICKUP_TIME",
  PICKUP_TIME_IN_PAST: "PICKUP_TIME_IN_PAST",
  INVALID_PASSENGERS: "INVALID_PASSENGERS",
  INVALID_TIER: "INVALID_TIER",
  MISSING_TIER: "MISSING_TIER",
  
  // Trip-level errors (INVALID - user fixable)
  RETURN_BEFORE_PICKUP: "RETURN_BEFORE_PICKUP",
  TIER_CAPACITY_EXCEEDED: "TIER_CAPACITY_EXCEEDED",
  MISSING_RETURN_DETAILS: "MISSING_RETURN_DETAILS",
  
  // System-level errors (BLOCKED - admin intervention)
  INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",
  MISSING_USER_ID: "MISSING_USER_ID",
  MISSING_TRIP_ID: "MISSING_TRIP_ID",
  TIER_LOCKED_CHANGE_ATTEMPT: "TIER_LOCKED_CHANGE_ATTEMPT"
};

// ═══════════════════════════════════════════════════════════════════════════
// FIELD-LEVEL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates individual field correctness
 * @param {Object} trip - Trip object to validate
 * @returns {Array} Array of validation errors
 */
function validateFields(trip) {
  const errors = [];
  
  // pickup_address validation
  if (!trip.pickup || !trip.pickup.address || trip.pickup.address.trim() === "") {
    errors.push({
      type: ValidationOutcome.INVALID,
      code: ErrorCode.MISSING_PICKUP_ADDRESS,
      field: "pickup.address",
      message: "Where would you like to be picked up?"
    });
  }
  
  // pickup_time validation
  if (!trip.pickup || !trip.pickup.datetime || trip.pickup.datetime.trim() === "") {
    errors.push({
      type: ValidationOutcome.INVALID,
      code: ErrorCode.MISSING_PICKUP_TIME,
      field: "pickup.datetime",
      message: "What time would you like to be picked up?"
    });
  } else {
    // Validate datetime format and future time
    const pickupTime = new Date(trip.pickup.datetime);
    
    if (isNaN(pickupTime.getTime())) {
      errors.push({
        type: ValidationOutcome.INVALID,
        code: ErrorCode.INVALID_PICKUP_TIME,
        field: "pickup.datetime",
        message: "Please provide a valid pickup time."
      });
    } else if (pickupTime <= new Date()) {
      errors.push({
        type: ValidationOutcome.INVALID,
        code: ErrorCode.PICKUP_TIME_IN_PAST,
        field: "pickup.datetime",
        message: "Pickup time must be in the future."
      });
    }
  }
  
  // dropoff_address validation
  if (!trip.dropoff || !trip.dropoff.address || trip.dropoff.address.trim() === "") {
    errors.push({
      type: ValidationOutcome.INVALID,
      code: ErrorCode.MISSING_DROPOFF_ADDRESS,
      field: "dropoff.address",
      message: "Where would you like to go?"
    });
  }
  
  // passengers validation
  if (!trip.passengers || trip.passengers < 1) {
    errors.push({
      type: ValidationOutcome.INVALID,
      code: ErrorCode.INVALID_PASSENGERS,
      field: "passengers",
      message: "Please specify at least 1 passenger."
    });
  }
  
  // tier validation (if state requires it)
  if (isTierRequired(trip.state)) {
    // Use Day 4 tier validation
    const tierStateValidation = validateTierForState(trip);
    if (!tierStateValidation.valid) {
      errors.push(...tierStateValidation.errors);
    }
  }
  
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIP-LEVEL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates trip-wide logic and consistency
 * @param {Object} trip - Trip object to validate
 * @returns {Array} Array of validation errors
 */
function validateTripLogic(trip) {
  const errors = [];
  
  // Return trip validation: return pickup must be after initial dropoff
  if (trip.return && trip.return.pickup_datetime && trip.return.pickup_datetime.trim() !== "") {
    const pickupTime = new Date(trip.pickup.datetime);
    const returnTime = new Date(trip.return.pickup_datetime);
    
    if (!isNaN(returnTime.getTime()) && !isNaN(pickupTime.getTime())) {
      if (returnTime <= pickupTime) {
        errors.push({
          type: ValidationOutcome.INVALID,
          code: ErrorCode.RETURN_BEFORE_PICKUP,
          field: "return.pickup_datetime",
          message: "Return pickup time must be after your initial pickup."
        });
      }
    }
  }
  
  // Tier capacity validation (Day 4 integration)
  if (trip.tier && trip.tier.name) {
    const tierValidation = validateTierCapacity(trip);
    if (!tierValidation.valid) {
      errors.push(...tierValidation.errors);
    }
  }
  
  return errors;
}

/**
 * Helper: Get max capacity for a tier
 * DEPRECATED: Use tierDefinitions.js instead
 */
function getTierCapacity(tierName) {
  const capacities = {
    "basic": 4,
    "corporate": 6,
    "executive": 8
  };
  return capacities[tierName.toLowerCase()] || 4;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM-LEVEL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates system-level constraints and invariants
 * @param {Object} trip - Trip object to validate
 * @param {Object} context - Additional context (previous state, etc.)
 * @returns {Array} Array of validation errors
 */
function validateSystemConstraints(trip, context = {}) {
  const errors = [];
  
  // trip_id required for non-draft states
  if (trip.state !== "draft" && (!trip.trip_id || trip.trip_id.trim() === "")) {
    errors.push({
      type: ValidationOutcome.BLOCKED,
      code: ErrorCode.MISSING_TRIP_ID,
      field: "trip_id",
      message: "System error: Trip ID missing. Contact support."
    });
  }
  
  // user_id always required
  if (!trip.user_id || trip.user_id.trim() === "") {
    errors.push({
      type: ValidationOutcome.BLOCKED,
      code: ErrorCode.MISSING_USER_ID,
      field: "user_id",
      message: "System error: User ID missing. Contact support."
    });
  }
  
  // Tier lock validation
  if (context.previousTrip && context.previousTrip.tier && context.previousTrip.tier.locked) {
    if (trip.tier.name !== context.previousTrip.tier.name) {
      errors.push({
        type: ValidationOutcome.BLOCKED,
        code: ErrorCode.TIER_LOCKED_CHANGE_ATTEMPT,
        field: "tier.name",
        message: "Tier cannot be changed after booking confirmation."
      });
    }
  }
  
  // State transition validation (from Day 2)
  if (context.previousState) {
    const validTransitions = getValidStateTransitions(context.previousState);
    if (!validTransitions.includes(trip.state)) {
      errors.push({
        type: ValidationOutcome.BLOCKED,
        code: ErrorCode.INVALID_STATE_TRANSITION,
        field: "state",
        message: `Cannot transition from ${context.previousState} to ${trip.state}.`
      });
    }
  }
  
  return errors;
}

/**
 * Helper: Get valid state transitions (from Day 2 state machine)
 */
function getValidStateTransitions(currentState) {
  const transitions = {
    "draft": ["booking_ready", "cancelled"],
    "booking_ready": ["pending_approval", "booked", "cancelled"],
    "pending_approval": ["approved", "needs_adjustment", "escalated", "cancelled"],
    "approved": ["booked", "cancelled"],
    "needs_adjustment": ["draft", "cancelled"],
    "escalated": ["approved", "cancelled"],
    "booked": ["in_progress", "cancelled"],
    "in_progress": ["completed", "cancelled"],
    "completed": [],
    "cancelled": []
  };
  return transitions[currentState] || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// SENTINEL INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SENTINEL validation - NEVER blocks booking
 * Returns warnings and context only
 * 
 * @param {Object} trip - Trip object to validate
 * @returns {Array} Array of warnings (never errors)
 */
function validateSentinel(trip) {
  const warnings = [];
  
  if (trip.sentinel_snapshot && trip.sentinel_snapshot.risk_level) {
    const riskLevel = trip.sentinel_snapshot.risk_level.toLowerCase();
    
    if (riskLevel === "yellow" || riskLevel === "orange") {
      warnings.push({
        type: "WARNING",
        code: "SENTINEL_ELEVATED_RISK",
        field: "sentinel_snapshot.risk_level",
        message: trip.sentinel_snapshot.risk_note || "Route requires additional attention.",
        severity: "info"
      });
    }
    
    if (riskLevel === "red") {
      warnings.push({
        type: "WARNING",
        code: "SENTINEL_HIGH_RISK",
        field: "sentinel_snapshot.risk_level",
        message: trip.sentinel_snapshot.risk_note || "Route marked for special handling.",
        severity: "warning"
      });
    }
  }
  
  return warnings;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN VALIDATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates a trip across all layers
 * 
 * @param {Object} trip - Trip object to validate
 * @param {Object} context - Optional context (previousTrip, previousState, etc.)
 * @returns {Object} Validation result
 * 
 * Result structure:
 * {
 *   status: "VALID" | "INVALID" | "BLOCKED",
 *   errors: [...],      // Blocking errors
 *   warnings: [...]     // Non-blocking warnings (e.g., SENTINEL)
 * }
 */
export function validateTrip(trip, context = {}) {
  const errors = [];
  const warnings = [];
  
  // Layer 1: Field-level validation
  errors.push(...validateFields(trip));
  
  // Layer 2: Trip-level validation
  errors.push(...validateTripLogic(trip));
  
  // Layer 3: System-level validation
  errors.push(...validateSystemConstraints(trip, context));
  
  // SENTINEL validation (warnings only)
  warnings.push(...validateSentinel(trip));
  
  // Determine overall status
  let status = ValidationOutcome.VALID;
  
  if (errors.some(e => e.type === ValidationOutcome.BLOCKED)) {
    status = ValidationOutcome.BLOCKED;
  } else if (errors.some(e => e.type === ValidationOutcome.INVALID)) {
    status = ValidationOutcome.INVALID;
  }
  
  return {
    status,
    errors,
    warnings
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FAILURE BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determines what happens when validation fails
 * 
 * @param {Object} validationResult - Result from validateTrip()
 * @returns {Object} Action to take
 * 
 * Action structure:
 * {
 *   action: "RETURN_TO_DRAFT" | "FREEZE_STATE" | "THROTTLE" | "ESCALATE",
 *   reason: "...",
 *   notify: ["user", "admin"],
 *   allowRetry: true/false
 * }
 */
export function determineFailureAction(validationResult, failureCount = 0) {
  // BLOCKED errors require admin intervention
  if (validationResult.status === ValidationOutcome.BLOCKED) {
    return {
      action: "FREEZE_STATE",
      reason: "System constraint violated",
      notify: ["admin"],
      allowRetry: false,
      message: "This booking requires administrator assistance. Our team has been notified."
    };
  }
  
  // INVALID errors return user to draft
  if (validationResult.status === ValidationOutcome.INVALID) {
    // Check for repeated failures (throttle after 5 attempts)
    if (failureCount >= 5) {
      return {
        action: "THROTTLE",
        reason: "Repeated validation failures",
        notify: ["user", "admin"],
        allowRetry: true,
        message: "We're having trouble processing this booking. A team member will reach out shortly.",
        throttleMinutes: 15
      };
    }
    
    return {
      action: "RETURN_TO_DRAFT",
      reason: "User-fixable validation errors",
      notify: ["user"],
      allowRetry: true,
      message: "Please review and correct the highlighted fields."
    };
  }
  
  // VALID - no action needed
  return {
    action: "PROCEED",
    reason: "Validation passed",
    notify: [],
    allowRetry: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  validateTrip,
  determineFailureAction,
  ValidationOutcome,
  ErrorCode
};
