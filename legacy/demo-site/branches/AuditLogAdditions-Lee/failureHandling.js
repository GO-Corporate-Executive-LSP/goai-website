/**
 * Failure Handling & Recovery — Sprint Day 7
 * 
 * Defines how the system fails safely, visibly, and recoverably.
 * 
 * Day 7 Goal: "When something fails, the system should fail safely, visibly, 
 *              and recoverably — without confusing the user or creating 
 *              operational chaos."
 * 
 * This supports pre-beta reliability and trust.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FAILURE CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Each failure type has a predictable response
 */
export const FAILURE_CATEGORIES = {
  VALIDATION_FAILURE: {
    code: "VALIDATION_FAILURE",
    description: "Trip data failed validation checks",
    severity: "medium",
    retryable: true,  // User can fix and retry
    maxRetries: 0,    // User-driven, not auto-retry
    cooldown: 0,
    escalateAfter: 5  // After 5 user attempts
  },
  
  PAYMENT_FAILURE: {
    code: "PAYMENT_FAILURE",
    description: "Payment processing failed",
    severity: "high",
    retryable: true,
    maxRetries: 2,    // Auto-retry for network issues
    cooldown: 30000,  // 30 seconds between retries
    escalateAfter: 2
  },
  
  DISPATCH_FAILURE: {
    code: "DISPATCH_FAILURE",
    description: "Failed to dispatch booking to provider (Lyft/etc)",
    severity: "high",
    retryable: true,
    maxRetries: 3,
    cooldown: 60000,  // 1 minute between retries
    escalateAfter: 3
  },
  
  SYSTEM_TIMEOUT: {
    code: "SYSTEM_TIMEOUT",
    description: "Operation timed out waiting for response",
    severity: "medium",
    retryable: true,
    maxRetries: 2,
    cooldown: 15000,  // 15 seconds
    escalateAfter: 2
  },
  
  EXTERNAL_API_ERROR: {
    code: "EXTERNAL_API_ERROR",
    description: "External API (Lyft, payment gateway) returned error",
    severity: "high",
    retryable: true,
    maxRetries: 3,
    cooldown: 45000,  // 45 seconds
    escalateAfter: 3
  },
  
  ADMIN_REJECTION: {
    code: "ADMIN_REJECTION",
    description: "Admin rejected the trip",
    severity: "low",
    retryable: false,  // Not automatically retryable
    maxRetries: 0,
    cooldown: 0,
    escalateAfter: 0
  },
  
  TIER_MISMATCH: {
    code: "TIER_MISMATCH",
    description: "Tier capacity or requirements not met",
    severity: "medium",
    retryable: false,  // User must fix
    maxRetries: 0,
    cooldown: 0,
    escalateAfter: 0
  },
  
  CAPACITY_UNAVAILABLE: {
    code: "CAPACITY_UNAVAILABLE",
    description: "No vehicles available for requested tier/time",
    severity: "high",
    retryable: true,
    maxRetries: 2,
    cooldown: 120000, // 2 minutes
    escalateAfter: 2
  },
  
  STATE_TRANSITION_ERROR: {
    code: "STATE_TRANSITION_ERROR",
    description: "Invalid state transition attempted",
    severity: "critical",
    retryable: false,
    maxRetries: 0,
    cooldown: 0,
    escalateAfter: 0  // Immediate escalation
  },
  
  DUPLICATE_REQUEST: {
    code: "DUPLICATE_REQUEST",
    description: "Request already in progress or completed",
    severity: "low",
    retryable: false,
    maxRetries: 0,
    cooldown: 0,
    escalateAfter: 0
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FAILURE → STATE MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Every failure has a destination state
 * No ambiguity allowed
 */
export const FAILURE_STATE_MAPPING = {
  VALIDATION_FAILURE: {
    targetState: "draft",
    reason: "Validation failed - user must correct issues",
    userCanRetry: true,
    preserveData: true
  },
  
  PAYMENT_FAILURE: {
    targetState: "failed",
    reason: "Payment processing failed",
    userCanRetry: true,
    preserveData: true
  },
  
  DISPATCH_FAILURE: {
    targetState: "failed",
    reason: "Failed to create booking with provider",
    userCanRetry: false,  // Admin intervention needed
    preserveData: true
  },
  
  SYSTEM_TIMEOUT: {
    targetState: "failed",
    reason: "System timeout - operation took too long",
    userCanRetry: true,
    preserveData: true
  },
  
  EXTERNAL_API_ERROR: {
    targetState: "failed",
    reason: "External service error",
    userCanRetry: false,
    preserveData: true
  },
  
  ADMIN_REJECTION: {
    targetState: "cancelled",
    reason: "Trip rejected by administrator",
    userCanRetry: false,
    preserveData: true  // Keep for records
  },
  
  TIER_MISMATCH: {
    targetState: "draft",
    reason: "Tier requirements not met",
    userCanRetry: true,
    preserveData: true
  },
  
  CAPACITY_UNAVAILABLE: {
    targetState: "failed",
    reason: "No vehicles available",
    userCanRetry: true,
    preserveData: true
  },
  
  STATE_TRANSITION_ERROR: {
    targetState: "pending_approval",  // Freeze for admin review
    reason: "Invalid state transition detected",
    userCanRetry: false,
    preserveData: true
  },
  
  DUPLICATE_REQUEST: {
    targetState: null,  // Keep current state
    reason: "Request already processed",
    userCanRetry: false,
    preserveData: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RETRY RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retry configuration and logic
 * 
 * CRITICAL: Retries are system-driven, not user-triggered
 */
export const RETRY_RULES = {
  // What is retryable
  RETRYABLE_FAILURES: [
    "PAYMENT_FAILURE",
    "DISPATCH_FAILURE",
    "SYSTEM_TIMEOUT",
    "EXTERNAL_API_ERROR",
    "CAPACITY_UNAVAILABLE",
    "VALIDATION_FAILURE"  // User-driven retry only
  ],
  
  // What is NOT retryable
  NON_RETRYABLE_FAILURES: [
    "ADMIN_REJECTION",
    "TIER_MISMATCH",
    "STATE_TRANSITION_ERROR",
    "DUPLICATE_REQUEST"
  ],
  
  // Default retry configuration
  DEFAULT_MAX_RETRIES: 2,
  DEFAULT_COOLDOWN: 30000,  // 30 seconds
  DEFAULT_BACKOFF_MULTIPLIER: 1.5,  // Exponential backoff
  
  // Retry strategies
  STRATEGIES: {
    IMMEDIATE: {
      name: "immediate",
      cooldown: 0,
      maxRetries: 1,
      backoff: false
    },
    
    SHORT_BACKOFF: {
      name: "short_backoff",
      cooldown: 15000,   // 15 seconds
      maxRetries: 2,
      backoff: true,
      multiplier: 1.5
    },
    
    LONG_BACKOFF: {
      name: "long_backoff",
      cooldown: 60000,   // 1 minute
      maxRetries: 3,
      backoff: true,
      multiplier: 2
    },
    
    USER_DRIVEN: {
      name: "user_driven",
      cooldown: 0,
      maxRetries: 0,  // No auto-retry
      backoff: false,
      requiresUserAction: true
    }
  }
};

/**
 * Get retry strategy for a failure type
 * @param {string} failureType - Failure category code
 * @returns {Object} Retry strategy
 */
export function getRetryStrategy(failureType) {
  const failure = FAILURE_CATEGORIES[failureType];
  if (!failure || !failure.retryable) {
    return null;  // Not retryable
  }
  
  // Map failure types to strategies
  const strategyMap = {
    VALIDATION_FAILURE: RETRY_RULES.STRATEGIES.USER_DRIVEN,
    PAYMENT_FAILURE: RETRY_RULES.STRATEGIES.SHORT_BACKOFF,
    DISPATCH_FAILURE: RETRY_RULES.STRATEGIES.LONG_BACKOFF,
    SYSTEM_TIMEOUT: RETRY_RULES.STRATEGIES.SHORT_BACKOFF,
    EXTERNAL_API_ERROR: RETRY_RULES.STRATEGIES.LONG_BACKOFF,
    CAPACITY_UNAVAILABLE: RETRY_RULES.STRATEGIES.LONG_BACKOFF
  };
  
  return strategyMap[failureType] || RETRY_RULES.STRATEGIES.SHORT_BACKOFF;
}

/**
 * Calculate next retry time with exponential backoff
 * @param {number} attemptNumber - Current retry attempt (1-based)
 * @param {Object} strategy - Retry strategy
 * @returns {number} Milliseconds to wait
 */
export function calculateRetryDelay(attemptNumber, strategy) {
  if (!strategy.backoff) {
    return strategy.cooldown;
  }
  
  const multiplier = strategy.multiplier || RETRY_RULES.DEFAULT_BACKOFF_MULTIPLIER;
  return strategy.cooldown * Math.pow(multiplier, attemptNumber - 1);
}

/**
 * Check if retry is allowed
 * @param {Object} trip - Trip object
 * @param {string} failureType - Failure category
 * @returns {Object} Retry eligibility
 */
export function canRetry(trip, failureType) {
  const failure = FAILURE_CATEGORIES[failureType];
  
  if (!failure) {
    return {
      allowed: false,
      reason: "Unknown failure type",
      code: "UNKNOWN_FAILURE"
    };
  }
  
  if (!failure.retryable) {
    return {
      allowed: false,
      reason: `${failureType} is not retryable`,
      code: "NOT_RETRYABLE"
    };
  }
  
  // Check retry count
  const retryCount = trip.retryCount || 0;
  if (retryCount >= failure.maxRetries) {
    return {
      allowed: false,
      reason: `Max retries (${failure.maxRetries}) exceeded`,
      code: "MAX_RETRIES_EXCEEDED",
      escalate: true
    };
  }
  
  // Check cooldown period
  if (trip.lastRetryAt) {
    const strategy = getRetryStrategy(failureType);
    const requiredDelay = calculateRetryDelay(retryCount + 1, strategy);
    const timeSinceLastRetry = Date.now() - new Date(trip.lastRetryAt).getTime();
    
    if (timeSinceLastRetry < requiredDelay) {
      return {
        allowed: false,
        reason: "Cooldown period not elapsed",
        code: "COOLDOWN_ACTIVE",
        retryAfter: new Date(new Date(trip.lastRetryAt).getTime() + requiredDelay)
      };
    }
  }
  
  return {
    allowed: true,
    reason: "Retry allowed",
    code: "OK",
    attemptsRemaining: failure.maxRetries - retryCount
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * When automation must stop and escalate to humans
 */
export const ESCALATION_CONDITIONS = {
  RETRY_LIMIT_EXCEEDED: {
    condition: "Retry limit exceeded",
    action: "Move to pending_approval",
    notifyAdmin: true,
    freezeExecution: true,
    message: "We're reviewing your trip and will follow up shortly."
  },
  
  REPEATED_PAYMENT_FAILURES: {
    condition: "Payment failed multiple times",
    action: "Move to pending_approval",
    notifyAdmin: true,
    freezeExecution: true,
    message: "We're having trouble processing payment. Our team will reach out."
  },
  
  DISPATCH_UNAVAILABLE: {
    condition: "Dispatch provider unavailable or rejected",
    action: "Move to pending_approval",
    notifyAdmin: true,
    freezeExecution: true,
    message: "We're working on your booking. You'll hear from us soon."
  },
  
  CONFLICTING_SIGNALS: {
    condition: "System received conflicting state signals",
    action: "Move to pending_approval",
    notifyAdmin: true,
    freezeExecution: true,
    message: "We're reviewing your trip details to ensure accuracy."
  },
  
  CRITICAL_ERROR: {
    condition: "Critical system error detected",
    action: "Move to pending_approval",
    notifyAdmin: true,
    freezeExecution: true,
    message: "We're reviewing your trip request. Our team will contact you."
  },
  
  VALIDATION_FAILURE_THRESHOLD: {
    condition: "User failed validation 5+ times",
    action: "Throttle and notify admin",
    notifyAdmin: true,
    freezeExecution: false,  // User can still try
    message: "We're having trouble processing your booking. A team member will reach out shortly."
  }
};

/**
 * Check if trip should be escalated
 * @param {Object} trip - Trip object
 * @param {string} failureType - Current failure type
 * @returns {Object} Escalation decision
 */
export function shouldEscalate(trip, failureType) {
  const failure = FAILURE_CATEGORIES[failureType];
  
  if (!failure) {
    return {
      escalate: true,
      reason: "Unknown failure type",
      condition: "CRITICAL_ERROR"
    };
  }
  
  // Check retry limit
  const retryCount = trip.retryCount || 0;
  if (retryCount >= failure.escalateAfter) {
    return {
      escalate: true,
      reason: "Retry limit exceeded",
      condition: "RETRY_LIMIT_EXCEEDED",
      action: ESCALATION_CONDITIONS.RETRY_LIMIT_EXCEEDED
    };
  }
  
  // Check specific failure types
  if (failureType === "PAYMENT_FAILURE" && retryCount >= 2) {
    return {
      escalate: true,
      reason: "Repeated payment failures",
      condition: "REPEATED_PAYMENT_FAILURES",
      action: ESCALATION_CONDITIONS.REPEATED_PAYMENT_FAILURES
    };
  }
  
  if (failureType === "DISPATCH_FAILURE" && retryCount >= 2) {
    return {
      escalate: true,
      reason: "Dispatch unavailable",
      condition: "DISPATCH_UNAVAILABLE",
      action: ESCALATION_CONDITIONS.DISPATCH_UNAVAILABLE
    };
  }
  
  if (failureType === "STATE_TRANSITION_ERROR") {
    return {
      escalate: true,
      reason: "State transition error",
      condition: "CRITICAL_ERROR",
      action: ESCALATION_CONDITIONS.CRITICAL_ERROR
    };
  }
  
  return {
    escalate: false,
    reason: "Escalation not required"
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IDEMPOTENCY RULES (Prevent Duplicate Actions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Protects against:
 * - Double charges
 * - Double dispatch
 * - User panic clicks
 */
export const IDEMPOTENCY_RULES = {
  SUBMISSION: {
    rule: "A trip in 'submitted' or beyond cannot submit again",
    check: (trip) => ["draft", "needs_adjustment"].includes(trip.state),
    errorCode: "ALREADY_SUBMITTED",
    message: "This trip has already been submitted."
  },
  
  BOOKING: {
    rule: "A confirmed trip cannot re-book",
    check: (trip) => !["booked", "in_progress", "completed"].includes(trip.state),
    errorCode: "ALREADY_BOOKED",
    message: "This trip is already booked."
  },
  
  PAYMENT: {
    rule: "A paid trip cannot charge again",
    check: (trip) => !trip.paymentConfirmed,
    errorCode: "ALREADY_PAID",
    message: "Payment has already been processed."
  },
  
  APPROVAL: {
    rule: "An approved trip cannot re-approve",
    check: (trip) => trip.approval?.status !== "APPROVED",
    errorCode: "ALREADY_APPROVED",
    message: "This trip has already been approved."
  },
  
  CANCELLATION: {
    rule: "A cancelled trip cannot cancel again",
    check: (trip) => trip.state !== "cancelled",
    errorCode: "ALREADY_CANCELLED",
    message: "This trip has already been cancelled."
  },
  
  RETRY: {
    rule: "A failed trip must be reset before retry",
    check: (trip) => trip.state === "failed" && !trip.retryLock,
    errorCode: "RETRY_IN_PROGRESS",
    message: "Retry already in progress."
  }
};

/**
 * Check if action is idempotent (safe to retry)
 * @param {string} action - Action to check
 * @param {Object} trip - Trip object
 * @returns {Object} Idempotency check result
 */
export function checkIdempotency(action, trip) {
  const actionUpper = action.toUpperCase();
  const rule = IDEMPOTENCY_RULES[actionUpper];
  
  if (!rule) {
    // No specific rule - allow by default
    return {
      safe: true,
      reason: "No idempotency rule defined"
    };
  }
  
  const isSafe = rule.check(trip);
  
  if (!isSafe) {
    return {
      safe: false,
      reason: rule.rule,
      errorCode: rule.errorCode,
      message: rule.message
    };
  }
  
  return {
    safe: true,
    reason: "Action is idempotent"
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// USER MESSAGING CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User-facing messages for failures
 * 
 * Rules:
 * - Never expose technical errors
 * - Never blame the user
 * - Always explain next steps
 */
export const FAILURE_MESSAGES = {
  VALIDATION_FAILURE: {
    title: "Quick check needed",
    message: "Please review the highlighted fields and try again.",
    tone: "neutral",
    action: "Fix and resubmit",
    technical: false
  },
  
  PAYMENT_FAILURE: {
    title: "Payment issue",
    message: "We couldn't process your payment. Please check your payment method or try again.",
    tone: "helpful",
    action: "Update payment method",
    technical: false
  },
  
  DISPATCH_FAILURE: {
    title: "Booking in progress",
    message: "We're working on your booking. You'll receive an update shortly.",
    tone: "reassuring",
    action: "Wait for update",
    technical: false
  },
  
  SYSTEM_TIMEOUT: {
    title: "Taking longer than expected",
    message: "We're still processing your request. Please check back in a moment.",
    tone: "neutral",
    action: "Check back soon",
    technical: false
  },
  
  EXTERNAL_API_ERROR: {
    title: "Connection issue",
    message: "We're having trouble connecting to our booking partner. Our team is on it.",
    tone: "reassuring",
    action: "We'll follow up",
    technical: false
  },
  
  ADMIN_REJECTION: {
    title: "Trip update",
    message: "We couldn't complete your booking as requested. Please contact support for details.",
    tone: "neutral",
    action: "Contact support",
    technical: false
  },
  
  TIER_MISMATCH: {
    title: "Service tier adjustment needed",
    message: "The selected tier doesn't match your trip requirements. Please select a different tier.",
    tone: "helpful",
    action: "Select different tier",
    technical: false
  },
  
  CAPACITY_UNAVAILABLE: {
    title: "Limited availability",
    message: "No vehicles are currently available for your requested time. Try a different time or we'll reach out with options.",
    tone: "helpful",
    action: "Try different time or wait",
    technical: false
  },
  
  STATE_TRANSITION_ERROR: {
    title: "Reviewing your trip",
    message: "We're reviewing your trip details to ensure everything is correct. You'll hear from us soon.",
    tone: "reassuring",
    action: "Wait for contact",
    technical: false
  },
  
  DUPLICATE_REQUEST: {
    title: "Request already received",
    message: "We've already received your request and are processing it.",
    tone: "informative",
    action: "No action needed",
    technical: false
  },
  
  // Generic fallback
  GENERIC_FAILURE: {
    title: "We're on it",
    message: "Something didn't go through. Our team is reviewing your trip and will follow up.",
    tone: "reassuring",
    action: "Wait for update",
    technical: false
  }
};

/**
 * Get user message for failure type
 * @param {string} failureType - Failure category
 * @returns {Object} User message
 */
export function getUserFailureMessage(failureType) {
  return FAILURE_MESSAGES[failureType] || FAILURE_MESSAGES.GENERIC_FAILURE;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN VISIBILITY & ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What admins see when failures occur
 * 
 * Admins should never guess why something failed
 */
export const ADMIN_FAILURE_VISIBILITY = {
  DISPLAY_FIELDS: [
    "failure_type",        // Failure category code
    "failure_reason",      // Technical reason
    "retry_count",         // Number of retries attempted
    "last_retry_at",       // When last retry occurred
    "escalation_reason",   // Why it escalated
    "system_notes",        // Technical notes
    "user_message",        // What user saw
    "error_stack",         // Technical error (optional)
    "trip_state",          // Current state
    "previous_state",      // State before failure
    "timestamp"            // When failure occurred
  ],
  
  ALLOWED_ACTIONS: [
    "retry_manually",      // Admin triggers retry
    "approve_override",    // Approve despite issues
    "reject_with_reason",  // Reject and explain
    "escalate_higher",     // Send to senior admin
    "reset_retry_count",   // Reset and allow retry
    "annotate",            // Add notes
    "contact_user"         // Reach out directly
  ],
  
  SEVERITY_INDICATORS: {
    low: { color: "blue", label: "Minor" },
    medium: { color: "yellow", label: "Attention Needed" },
    high: { color: "orange", label: "Urgent" },
    critical: { color: "red", label: "Critical" }
  }
};

/**
 * Get admin view data for failed trip
 * @param {Object} trip - Trip object
 * @param {string} failureType - Failure category
 * @returns {Object} Admin-facing data
 */
export function getAdminFailureView(trip, failureType) {
  const failure = FAILURE_CATEGORIES[failureType];
  const retryStrategy = getRetryStrategy(failureType);
  const canRetryResult = canRetry(trip, failureType);
  const shouldEscalateResult = shouldEscalate(trip, failureType);
  
  return {
    // Failure details
    failureType,
    severity: failure?.severity || "unknown",
    description: failure?.description || "Unknown failure",
    
    // Retry information
    retryable: failure?.retryable || false,
    retryCount: trip.retryCount || 0,
    maxRetries: failure?.maxRetries || 0,
    retryStrategy: retryStrategy?.name || "none",
    canRetryNow: canRetryResult.allowed,
    retryBlockedReason: canRetryResult.reason,
    
    // Escalation
    shouldEscalate: shouldEscalateResult.escalate,
    escalationReason: shouldEscalateResult.reason,
    escalationCondition: shouldEscalateResult.condition,
    
    // User impact
    userMessage: getUserFailureMessage(failureType),
    
    // Actions available
    allowedActions: ADMIN_FAILURE_VISIBILITY.ALLOWED_ACTIONS.filter(action => {
      if (action === "retry_manually") return canRetryResult.allowed;
      if (action === "reset_retry_count") return trip.retryCount > 0;
      return true;
    }),
    
    // Technical details
    tripState: trip.state,
    lastRetryAt: trip.lastRetryAt || null,
    systemNotes: trip.systemNotes || []
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FAILURE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main failure handling logic
 * @param {Object} trip - Trip object
 * @param {string} failureType - Failure category
 * @param {Object} context - Additional context
 * @returns {Object} Failure handling result
 */
export function handleFailure(trip, failureType, context = {}) {
  const failure = FAILURE_CATEGORIES[failureType];
  
  if (!failure) {
    return {
      success: false,
      error: "Unknown failure type",
      action: "ESCALATE"
    };
  }
  
  // Check if we should escalate
  const escalationCheck = shouldEscalate(trip, failureType);
  if (escalationCheck.escalate) {
    return {
      success: true,
      action: "ESCALATE",
      targetState: "pending_approval",
      reason: escalationCheck.reason,
      notifyAdmin: true,
      userMessage: escalationCheck.action.message
    };
  }
  
  // Check if we can retry
  const retryCheck = canRetry(trip, failureType);
  if (retryCheck.allowed && failure.maxRetries > 0) {
    return {
      success: true,
      action: "RETRY",
      retryCount: (trip.retryCount || 0) + 1,
      retryAfter: calculateRetryDelay((trip.retryCount || 0) + 1, getRetryStrategy(failureType)),
      preserveState: true,
      userMessage: "We're retrying your request."
    };
  }
  
  // Move to failure state
  const failureMapping = FAILURE_STATE_MAPPING[failureType];
  return {
    success: true,
    action: "MOVE_TO_FAILED_STATE",
    targetState: failureMapping.targetState,
    reason: failureMapping.reason,
    userCanRetry: failureMapping.userCanRetry,
    preserveData: failureMapping.preserveData,
    userMessage: getUserFailureMessage(failureType).message
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  FAILURE_CATEGORIES,
  FAILURE_STATE_MAPPING,
  RETRY_RULES,
  ESCALATION_CONDITIONS,
  IDEMPOTENCY_RULES,
  FAILURE_MESSAGES,
  ADMIN_FAILURE_VISIBILITY,
  getRetryStrategy,
  calculateRetryDelay,
  canRetry,
  shouldEscalate,
  checkIdempotency,
  getUserFailureMessage,
  getAdminFailureView,
  handleFailure
};
