/**
 * ETAS UX MESSAGING & STATUS SURFACES
 * Sprint Day 8
 * 
 * CRITICAL PHILOSOPHY:
 * - At every moment, users understand what's happening
 * - No technical language, no blame, no panic
 * - Premium, calm, clear experience
 * - Messaging is a contract, not final copy
 * 
 * This module defines:
 * - User-visible trip states
 * - Mental models per state
 * - Status messages (neutral, premium tone)
 * - Message types (status, action, info)
 * - Validation outcome messaging
 * - Admin-facing messages
 * - UI exclusions (what we never show)
 */

// ============================================================================
// USER-VISIBLE TRIP STATES
// ============================================================================

/**
 * States a user can experience from their perspective
 * (Internal states are abstracted to user-friendly concepts)
 */
export const USER_VISIBLE_STATES = {
  DRAFT: 'draft',
  BOOKING_READY: 'booking_ready',
  SUBMITTED: 'submitted',
  PENDING_REVIEW: 'pending_approval',
  APPROVED: 'approved',
  NEEDS_ADJUSTMENT: 'needs_adjustment',
  ESCALATED: 'escalated',
  BOOKED: 'booked',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};

// ============================================================================
// USER MENTAL MODEL PER STATE
// ============================================================================

/**
 * For each state, define:
 * - belief: What user thinks is happening
 * - actions: What they can do right now
 * - dontWorry: What they shouldn't be concerned about
 */
export const USER_MENTAL_MODEL = {
  [USER_VISIBLE_STATES.DRAFT]: {
    belief: "I'm building my trip request.",
    actions: ['Edit details', 'Select tier', 'Submit when ready'],
    dontWorry: "Nothing has been charged or committed yet."
  },

  [USER_VISIBLE_STATES.BOOKING_READY]: {
    belief: "My trip is ready to submit.",
    actions: ['Review details', 'Submit', 'Make changes'],
    dontWorry: "You can still adjust anything before submitting."
  },

  [USER_VISIBLE_STATES.SUBMITTED]: {
    belief: "My trip is being confirmed.",
    actions: ['Wait', 'View status', 'Cancel if needed'],
    dontWorry: "We're checking details. This is normal and quick."
  },

  [USER_VISIBLE_STATES.PENDING_REVIEW]: {
    belief: "My trip is being reviewed to make sure everything is set.",
    actions: ['Wait', 'View status', 'Contact support if urgent'],
    dontWorry: "This is routine. Nothing has gone wrong."
  },

  [USER_VISIBLE_STATES.APPROVED]: {
    belief: "My trip is confirmed and ready.",
    actions: ['View trip details', 'Make changes if needed', 'Wait for booking'],
    dontWorry: "Everything is confirmed. We'll handle the logistics."
  },

  [USER_VISIBLE_STATES.NEEDS_ADJUSTMENT]: {
    belief: "I need to update something in my trip.",
    actions: ['Review feedback', 'Make changes', 'Resubmit'],
    dontWorry: "This is normal. Just small adjustments needed."
  },

  [USER_VISIBLE_STATES.ESCALATED]: {
    belief: "My trip needs special attention from the team.",
    actions: ['Wait for contact', 'Check messages', 'Respond when reached out'],
    dontWorry: "Our team is on it. They'll reach out soon."
  },

  [USER_VISIBLE_STATES.BOOKED]: {
    belief: "My trip is fully booked and scheduled.",
    actions: ['View booking details', 'Contact driver (when available)', 'Cancel if emergency'],
    dontWorry: "Everything is set. You'll receive updates as trip approaches."
  },

  [USER_VISIBLE_STATES.IN_PROGRESS]: {
    belief: "My trip is happening right now.",
    actions: ['Track location', 'Contact driver', 'Report issues if needed'],
    dontWorry: "Enjoy your ride. All logistics are handled."
  },

  [USER_VISIBLE_STATES.COMPLETED]: {
    belief: "My trip is complete.",
    actions: ['View receipt', 'Rate experience', 'Book another trip'],
    dontWorry: "All done. Thank you for riding with us."
  },

  [USER_VISIBLE_STATES.CANCELLED]: {
    belief: "My trip was cancelled.",
    actions: ['View cancellation details', 'Book a new trip if needed', 'Contact support if questions'],
    dontWorry: "Cancellation is processed. No unexpected charges."
  },

  [USER_VISIBLE_STATES.FAILED]: {
    belief: "Something didn't go through with my trip.",
    actions: ['Check status', 'Try again', 'Contact support for help'],
    dontWorry: "Our team will follow up. No charges if booking didn't complete."
  }
};

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export const MESSAGE_TYPES = {
  STATUS: 'status',         // Explains what's happening (passive, calm)
  ACTION: 'action',         // Asks user to do something (one clear action)
  INFO: 'informational'     // Suggestions or context (never blocking)
};

// ============================================================================
// NEUTRAL, PREMIUM STATUS MESSAGES
// ============================================================================

/**
 * User-facing status messages per state
 * 
 * RULES:
 * - 1-2 sentences max
 * - No technical terms (API, validation, error, etc)
 * - No blame ("you didn't", "you forgot")
 * - No urgency unless required
 * - No internal language
 * - Premium, calm tone
 */
export const STATUS_MESSAGES = {
  [USER_VISIBLE_STATES.DRAFT]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Building your trip',
    message: "You're putting together your trip details. Take your time.",
    tone: 'neutral',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.BOOKING_READY]: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Ready to submit',
    message: "Your trip looks good. Review and submit when ready.",
    tone: 'encouraging',
    urgency: 'low'
  },

  [USER_VISIBLE_STATES.SUBMITTED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Confirming details',
    message: "We're confirming the details of your trip. This usually takes a moment.",
    tone: 'calm',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.PENDING_REVIEW]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Reviewing your trip',
    message: "We're reviewing your trip to ensure everything is set. You'll hear from us shortly.",
    tone: 'reassuring',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.APPROVED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Trip confirmed',
    message: "Your trip is confirmed and ready. We'll handle the booking details.",
    tone: 'positive',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.NEEDS_ADJUSTMENT]: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Quick update needed',
    message: "We need a small adjustment to your trip. Please review and update.",
    tone: 'helpful',
    urgency: 'medium'
  },

  [USER_VISIBLE_STATES.ESCALATED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Our team is reviewing',
    message: "Your trip needs special attention. Our team will reach out shortly.",
    tone: 'reassuring',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.BOOKED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'All set',
    message: "Your trip is booked and scheduled. You'll receive updates as your trip approaches.",
    tone: 'positive',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.IN_PROGRESS]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'In progress',
    message: "Your trip is underway. Enjoy your ride.",
    tone: 'calm',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.COMPLETED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Trip complete',
    message: "Thank you for riding with us. We hope you had a great experience.",
    tone: 'positive',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.CANCELLED]: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Cancelled',
    message: "Your trip has been cancelled. No charges will apply if booking hadn't completed.",
    tone: 'neutral',
    urgency: 'none'
  },

  [USER_VISIBLE_STATES.FAILED]: {
    type: MESSAGE_TYPES.STATUS,
    title: "We're on it",
    message: "We weren't able to complete your request. Our team will follow up shortly.",
    tone: 'reassuring',
    urgency: 'low'
  }
};

// ============================================================================
// VALIDATION OUTCOME MESSAGING
// ============================================================================

/**
 * Maps Day 3 validation outcomes to user messages
 * 
 * VALIDATION OUTCOMES:
 * - VALID: Trip passes validation
 * - INVALID: User can fix issues
 * - BLOCKED: Requires admin intervention
 */
export const VALIDATION_MESSAGES = {
  VALID: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Looking good',
    message: "Your trip details check out. Ready to proceed.",
    tone: 'positive',
    progression: true
  },

  INVALID: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Quick check needed',
    message: "Please review the highlighted fields and try again.",
    tone: 'helpful',
    userFixable: true,
    progression: false
  },

  BLOCKED: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Reviewing your request',
    message: "We're reviewing your trip details. You'll hear from us shortly.",
    tone: 'neutral',
    userFixable: false,
    progression: false,
    escalated: true
  }
};

// ============================================================================
// ERROR/FAILURE MESSAGING (Day 7 Integration)
// ============================================================================

/**
 * Failure type messaging for user-facing errors
 * (Integrates with Day 7 failure handling)
 * 
 * PRINCIPLE: Never expose technical details
 */
export const FAILURE_MESSAGES = {
  VALIDATION_FAILURE: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Quick check needed',
    message: "Please review the highlighted fields and try again.",
    tone: 'helpful',
    canRetry: true
  },

  PAYMENT_FAILURE: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Payment issue',
    message: "We couldn't process your payment. Please check your payment method or try again.",
    tone: 'helpful',
    canRetry: true
  },

  DISPATCH_FAILURE: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Booking in progress',
    message: "We're working on your booking. You'll receive an update shortly.",
    tone: 'reassuring',
    canRetry: false
  },

  SYSTEM_TIMEOUT: {
    type: MESSAGE_TYPES.INFO,
    title: 'Taking longer than expected',
    message: "We're still processing your request. Please check back in a moment.",
    tone: 'neutral',
    canRetry: true
  },

  EXTERNAL_API_ERROR: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Connection issue',
    message: "We're having trouble connecting to our booking partner. Our team is on it.",
    tone: 'reassuring',
    canRetry: false
  },

  ADMIN_REJECTION: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Trip update',
    message: "We couldn't complete your booking as requested. Please contact support for details.",
    tone: 'neutral',
    canRetry: false
  },

  TIER_MISMATCH: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Service tier adjustment needed',
    message: "The selected tier doesn't match your trip requirements. Please select a different tier.",
    tone: 'helpful',
    canRetry: true
  },

  CAPACITY_UNAVAILABLE: {
    type: MESSAGE_TYPES.ACTION,
    title: 'Limited availability',
    message: "No vehicles are currently available for your requested time. Try a different time or we'll reach out with options.",
    tone: 'helpful',
    canRetry: true
  },

  STATE_TRANSITION_ERROR: {
    type: MESSAGE_TYPES.STATUS,
    title: 'Reviewing your trip',
    message: "We're reviewing your trip details to ensure everything is correct. You'll hear from us soon.",
    tone: 'reassuring',
    canRetry: false
  },

  DUPLICATE_REQUEST: {
    type: MESSAGE_TYPES.INFO,
    title: 'Request already received',
    message: "We've already received your request and are processing it.",
    tone: 'informative',
    canRetry: false
  },

  GENERIC_FAILURE: {
    type: MESSAGE_TYPES.STATUS,
    title: "We're on it",
    message: "Something didn't go through. Our team is reviewing your trip and will follow up.",
    tone: 'reassuring',
    canRetry: false
  }
};

// ============================================================================
// ADMIN-FACING MESSAGING
// ============================================================================

/**
 * What admins see (can be more explicit than user messages)
 * 
 * Structured for:
 * - Trip failures
 * - Pending review
 * - Exhausted retries
 */
export const ADMIN_MESSAGES = {
  TRIP_FAILED: {
    severity: 'high',
    title: 'Trip Failed',
    fields: [
      'failure_type',
      'failure_reason',
      'retry_count',
      'last_retry_at',
      'user_message_shown',
      'trip_state',
      'escalation_reason'
    ],
    actions: ['retry_manually', 'approve_override', 'reject_with_reason', 'contact_user'],
    notes: 'Show full technical context including error messages'
  },

  PENDING_REVIEW: {
    severity: 'medium',
    title: 'Trip Pending Review',
    fields: [
      'review_reason',
      'intervention_trigger',
      'validation_issues',
      'sentinel_context',
      'user_message_shown',
      'trip_state',
      'time_in_review'
    ],
    actions: ['approve', 'request_adjustment', 'escalate_higher', 'contact_user'],
    notes: 'Show validation context and SENTINEL data if available'
  },

  RETRIES_EXHAUSTED: {
    severity: 'high',
    title: 'Retries Exhausted',
    fields: [
      'failure_type',
      'retry_count',
      'retry_strategy',
      'retry_history',
      'escalation_condition',
      'user_message_shown',
      'trip_state'
    ],
    actions: ['retry_manually', 'approve_override', 'escalate_higher', 'contact_user'],
    notes: 'Show full retry timeline and escalation conditions'
  },

  VALIDATION_BLOCKED: {
    severity: 'medium',
    title: 'Validation Blocked',
    fields: [
      'validation_outcome',
      'blocking_reason',
      'field_errors',
      'system_constraints',
      'user_message_shown',
      'trip_state'
    ],
    actions: ['approve_override', 'request_adjustment', 'reject_with_reason'],
    notes: 'Show all validation failures and system constraints'
  },

  ESCALATED_TO_CONCIERGE: {
    severity: 'low',
    title: 'Escalated to Concierge',
    fields: [
      'escalation_reason',
      'user_request',
      'trip_context',
      'sentinel_context',
      'user_contact_info',
      'trip_state'
    ],
    actions: ['contact_user', 'create_custom_trip', 'annotate'],
    notes: 'Route to concierge workflow (Calendly/SMS)'
  }
};

// ============================================================================
// UI EXCLUSIONS (What We NEVER Show)
// ============================================================================

/**
 * CRITICAL: Explicit list of what UI must never display
 * (Protects UX, security, and brand)
 */
export const UI_NEVER_SHOWS = {
  TECHNICAL_ERRORS: [
    'Stack traces',
    'Error codes (500, 503, etc)',
    'Exception messages',
    'Database errors',
    'API error responses',
    'Console logs',
    'Debug information'
  ],

  SYSTEM_INTERNALS: [
    'Internal state names (draft, booking_ready, etc)',
    'Validation rule names',
    'Retry counters',
    'Backoff calculations',
    'System timeouts',
    'API endpoint names',
    'Database IDs',
    'Internal field names'
  ],

  RISK_ASSESSMENT: [
    'SENTINEL risk scores',
    'SENTINEL confidence levels',
    'Risk flags (green/yellow/orange/red)',
    'Anomaly detection results',
    'Fraud detection scores',
    'Any risk-related terminology'
  ],

  OPERATIONS: [
    'Provider names (Lyft, Uber, etc) before booking',
    'Dispatch status',
    'Provider rejection reasons',
    'Pricing calculations',
    'Commission splits',
    'Internal notes',
    'Admin annotations'
  ],

  PERMISSIONS: [
    'User role names (USER, ADMIN, SYSTEM)',
    'Permission checks',
    'Authorization failures',
    'Access control rules'
  ],

  DEVELOPMENT: [
    'TODO comments',
    'Feature flags',
    'A/B test assignments',
    'Development mode indicators',
    'Mock data labels'
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user-facing message for a trip state
 * 
 * @param {string} state - Trip state
 * @returns {object} Message object
 */
export function getUserMessage(state) {
  const message = STATUS_MESSAGES[state];
  
  if (!message) {
    return STATUS_MESSAGES[USER_VISIBLE_STATES.FAILED];
  }

  return message;
}

/**
 * Get user-facing message for validation outcome
 * 
 * @param {string} outcome - VALID, INVALID, or BLOCKED
 * @returns {object} Message object
 */
export function getValidationMessage(outcome) {
  const message = VALIDATION_MESSAGES[outcome];
  
  if (!message) {
    return VALIDATION_MESSAGES.BLOCKED;
  }

  return message;
}

/**
 * Get user-facing message for failure type
 * 
 * @param {string} failureType - Failure type from Day 7
 * @returns {object} Message object
 */
export function getFailureMessage(failureType) {
  const message = FAILURE_MESSAGES[failureType];
  
  if (!message) {
    return FAILURE_MESSAGES.GENERIC_FAILURE;
  }

  return message;
}

/**
 * Get admin-facing context for a situation
 * 
 * @param {string} situation - TRIP_FAILED, PENDING_REVIEW, RETRIES_EXHAUSTED, etc
 * @returns {object} Admin message object
 */
export function getAdminContext(situation) {
  const context = ADMIN_MESSAGES[situation];
  
  if (!context) {
    return {
      severity: 'medium',
      title: 'Requires Review',
      fields: ['trip_state', 'timestamp'],
      actions: ['review', 'contact_user'],
      notes: 'General review required'
    };
  }

  return context;
}

/**
 * Get user's mental model for current state
 * 
 * @param {string} state - Trip state
 * @returns {object} Mental model object
 */
export function getUserMentalModel(state) {
  const model = USER_MENTAL_MODEL[state];
  
  if (!model) {
    return USER_MENTAL_MODEL[USER_VISIBLE_STATES.FAILED];
  }

  return model;
}

/**
 * Check if content should be shown in UI
 * 
 * @param {string} content - Content to check
 * @returns {boolean} True if content is forbidden
 */
export function isForbiddenContent(content) {
  const contentLower = content.toLowerCase();
  
  // Check against all exclusion categories
  const allExclusions = [
    ...UI_NEVER_SHOWS.TECHNICAL_ERRORS,
    ...UI_NEVER_SHOWS.SYSTEM_INTERNALS,
    ...UI_NEVER_SHOWS.RISK_ASSESSMENT,
    ...UI_NEVER_SHOWS.OPERATIONS,
    ...UI_NEVER_SHOWS.PERMISSIONS,
    ...UI_NEVER_SHOWS.DEVELOPMENT
  ];

  return allExclusions.some(exclusion => 
    contentLower.includes(exclusion.toLowerCase())
  );
}

/**
 * Sanitize message for user display
 * Removes any technical/forbidden content
 * 
 * @param {string} message - Raw message
 * @returns {string} Sanitized message
 */
export function sanitizeMessage(message) {
  if (isForbiddenContent(message)) {
    return FAILURE_MESSAGES.GENERIC_FAILURE.message;
  }
  
  return message;
}

// ============================================================================
// MESSAGING CONSISTENCY CHECKS
// ============================================================================

/**
 * Validate that all states have messaging defined
 * (Use in tests to ensure coverage)
 */
export function validateMessagingCoverage() {
  const missingStates = [];
  
  Object.values(USER_VISIBLE_STATES).forEach(state => {
    if (!STATUS_MESSAGES[state]) {
      missingStates.push(state);
    }
    if (!USER_MENTAL_MODEL[state]) {
      missingStates.push(state);
    }
  });
  
  return {
    complete: missingStates.length === 0,
    missingStates
  };
}

/**
 * Get message by type
 * Useful for filtering UI display
 * 
 * @param {string} messageType - STATUS, ACTION, or INFO
 * @returns {array} Array of messages matching type
 */
export function getMessagesByType(messageType) {
  return Object.entries(STATUS_MESSAGES)
    .filter(([, message]) => message.type === messageType)
    .map(([state, message]) => ({ state, ...message }));
}
