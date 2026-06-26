/**
 * ETAS ADMIN SURFACES & OPERATIONAL VISIBILITY
 * Sprint Day 9
 * 
 * CRITICAL PHILOSOPHY:
 * - Admins see what's happening, why, and what they can do
 * - No guessing, no inferring, no chaos
 * - Operational efficiency as volume grows
 * - Clear audit trails for accountability
 * 
 * This module defines:
 * - Admin-relevant trip states
 * - Admin queue concept & prioritization
 * - Admin context per trip
 * - Allowed actions per state
 * - Admin decision outcomes
 * - Audit expectations
 * - Admin vs user messaging separation
 */

// ============================================================================
// ADMIN-RELEVANT TRIP STATES
// ============================================================================

/**
 * States that require admin awareness or action
 * (Not all trip states need admin visibility)
 */
export const ADMIN_RELEVANT_STATES = {
  // HIGH PRIORITY - Requires immediate attention
  PENDING_REVIEW: 'pending_approval',      // Awaiting human decision
  FAILED: 'failed',                        // Something went wrong
  ESCALATED: 'escalated',                  // Requires special handling
  
  // MEDIUM PRIORITY - Monitoring required
  SUBMITTED: 'submitted',                  // Being processed (optional monitoring)
  NEEDS_ADJUSTMENT: 'needs_adjustment',    // Returned to user for changes
  
  // LOW PRIORITY - Informational only
  APPROVED: 'approved',                    // Approved, awaiting execution
  BOOKED: 'booked',                        // Successfully booked
  
  // FINAL STATES - Historical reference
  COMPLETED: 'completed',                  // Trip completed
  CANCELLED: 'cancelled'                   // Trip cancelled
};

/**
 * Priority levels for admin queue
 */
export const ADMIN_PRIORITY = {
  CRITICAL: 'critical',    // Blocking user, needs immediate action
  HIGH: 'high',           // Requires attention soon
  MEDIUM: 'medium',       // Should review when available
  LOW: 'low',            // Informational only
  ARCHIVE: 'archive'     // Historical, no action needed
};

/**
 * Map states to priority levels
 */
export const STATE_PRIORITY_MAPPING = {
  [ADMIN_RELEVANT_STATES.PENDING_REVIEW]: ADMIN_PRIORITY.HIGH,
  [ADMIN_RELEVANT_STATES.FAILED]: ADMIN_PRIORITY.CRITICAL,
  [ADMIN_RELEVANT_STATES.ESCALATED]: ADMIN_PRIORITY.CRITICAL,
  [ADMIN_RELEVANT_STATES.SUBMITTED]: ADMIN_PRIORITY.LOW,
  [ADMIN_RELEVANT_STATES.NEEDS_ADJUSTMENT]: ADMIN_PRIORITY.MEDIUM,
  [ADMIN_RELEVANT_STATES.APPROVED]: ADMIN_PRIORITY.LOW,
  [ADMIN_RELEVANT_STATES.BOOKED]: ADMIN_PRIORITY.LOW,
  [ADMIN_RELEVANT_STATES.COMPLETED]: ADMIN_PRIORITY.ARCHIVE,
  [ADMIN_RELEVANT_STATES.CANCELLED]: ADMIN_PRIORITY.ARCHIVE
};

// ============================================================================
// ADMIN QUEUE CONCEPT
// ============================================================================

/**
 * Admin Queue Definition
 * 
 * "A prioritized list of trips that require human attention or monitoring."
 * 
 * Purpose: Provide operational backbone for trip management
 */
export const ADMIN_QUEUE_CONFIG = {
  // Primary ordering strategy
  orderBy: [
    'priority',           // Critical → High → Medium → Low
    'time_in_state',      // Longest waiting first
    'retry_count',        // Most retries first (within same priority)
    'created_at'          // Oldest first (tiebreaker)
  ],
  
  // Grouping strategy
  groupBy: 'state',       // Group by trip state for clarity
  
  // Secondary grouping (optional)
  subGroupBy: 'failure_type',  // Within failed state, group by failure type
  
  // Visibility rules
  visibility: {
    // Auto-hide completed/cancelled after this period
    archiveAfter: '7_days',
    
    // Show max items per page
    pageSize: 50,
    
    // Filter options available to admin
    filters: [
      'state',
      'failure_type',
      'tier',
      'priority',
      'retry_count_gt',
      'time_in_state_gt',
      'sentinel_flag'
    ]
  },
  
  // Refresh behavior
  refresh: {
    autoRefresh: true,
    refreshInterval: 30000,  // 30 seconds
    showNewItemBadge: true
  }
};

/**
 * Queue sections for UI organization
 */
export const QUEUE_SECTIONS = {
  NEEDS_ACTION: {
    title: 'Needs Action',
    states: [
      ADMIN_RELEVANT_STATES.PENDING_REVIEW,
      ADMIN_RELEVANT_STATES.FAILED,
      ADMIN_RELEVANT_STATES.ESCALATED
    ],
    priority: ADMIN_PRIORITY.CRITICAL
  },
  
  MONITORING: {
    title: 'Monitoring',
    states: [
      ADMIN_RELEVANT_STATES.SUBMITTED,
      ADMIN_RELEVANT_STATES.NEEDS_ADJUSTMENT,
      ADMIN_RELEVANT_STATES.APPROVED
    ],
    priority: ADMIN_PRIORITY.MEDIUM
  },
  
  ACTIVE: {
    title: 'Active Trips',
    states: [
      ADMIN_RELEVANT_STATES.BOOKED
    ],
    priority: ADMIN_PRIORITY.LOW
  },
  
  ARCHIVE: {
    title: 'Archive',
    states: [
      ADMIN_RELEVANT_STATES.COMPLETED,
      ADMIN_RELEVANT_STATES.CANCELLED
    ],
    priority: ADMIN_PRIORITY.ARCHIVE
  }
};

// ============================================================================
// ADMIN CONTEXT PER TRIP
// ============================================================================

/**
 * Context fields visible to admin for each trip
 * 
 * CRITICAL: Admins should never have to infer what happened
 */
export const ADMIN_CONTEXT_FIELDS = {
  // Core identification
  trip_id: {
    label: 'Trip ID',
    type: 'string',
    required: true,
    display: 'prominent'
  },
  
  user_id: {
    label: 'User ID',
    type: 'string',
    required: true,
    display: 'standard'
  },
  
  user_email: {
    label: 'User Email',
    type: 'email',
    required: false,
    display: 'standard'
  },
  
  // State & status
  current_state: {
    label: 'Current State',
    type: 'enum',
    required: true,
    display: 'prominent',
    colorCoded: true
  },
  
  previous_state: {
    label: 'Previous State',
    type: 'enum',
    required: false,
    display: 'detail'
  },
  
  time_in_state: {
    label: 'Time in State',
    type: 'duration',
    required: true,
    display: 'standard',
    format: 'human_readable'  // "2 hours ago"
  },
  
  // Failure context
  failure_type: {
    label: 'Failure Type',
    type: 'enum',
    required: false,  // Only if failed
    display: 'prominent',
    showWhen: 'state === "failed"'
  },
  
  failure_reason: {
    label: 'Failure Reason',
    type: 'text',
    required: false,
    display: 'detail',
    technical: true  // Can show technical details
  },
  
  retry_count: {
    label: 'Retry Count',
    type: 'number',
    required: false,
    display: 'standard',
    showWhen: 'retry_count > 0'
  },
  
  last_retry_at: {
    label: 'Last Retry',
    type: 'timestamp',
    required: false,
    display: 'detail',
    showWhen: 'retry_count > 0'
  },
  
  escalation_reason: {
    label: 'Escalation Reason',
    type: 'text',
    required: false,
    display: 'prominent',
    showWhen: 'state === "escalated" || state === "pending_approval"'
  },
  
  // Trip details
  tier: {
    label: 'Service Tier',
    type: 'enum',
    required: true,
    display: 'standard'
  },
  
  passengers: {
    label: 'Passengers',
    type: 'number',
    required: true,
    display: 'standard'
  },
  
  luggage: {
    label: 'Luggage',
    type: 'number',
    required: true,
    display: 'standard'
  },
  
  pickup_time: {
    label: 'Pickup Time',
    type: 'timestamp',
    required: true,
    display: 'standard',
    format: 'datetime'
  },
  
  destination: {
    label: 'Destination',
    type: 'string',
    required: true,
    display: 'standard'
  },
  
  // User notes & context
  user_notes: {
    label: 'User Notes',
    type: 'text',
    required: false,
    display: 'detail'
  },
  
  // SENTINEL context (summary only)
  sentinel_flag: {
    label: 'SENTINEL Flag',
    type: 'enum',
    required: false,
    display: 'standard',
    values: ['green', 'yellow', 'orange', 'red'],
    colorCoded: true
  },
  
  sentinel_confidence: {
    label: 'SENTINEL Confidence',
    type: 'percentage',
    required: false,
    display: 'detail'
  },
  
  sentinel_notes: {
    label: 'SENTINEL Notes',
    type: 'text',
    required: false,
    display: 'detail',
    informational: true  // Never blocks, just context
  },
  
  // System context
  created_at: {
    label: 'Created',
    type: 'timestamp',
    required: true,
    display: 'standard',
    format: 'datetime'
  },
  
  updated_at: {
    label: 'Last Updated',
    type: 'timestamp',
    required: true,
    display: 'standard',
    format: 'datetime'
  },
  
  // Admin history
  admin_notes: {
    label: 'Admin Notes',
    type: 'text',
    required: false,
    display: 'detail',
    editable: true
  },
  
  last_admin_action: {
    label: 'Last Admin Action',
    type: 'text',
    required: false,
    display: 'detail'
  },
  
  last_admin_user: {
    label: 'Last Admin',
    type: 'string',
    required: false,
    display: 'detail'
  }
};

// ============================================================================
// ALLOWED ADMIN ACTIONS PER STATE
// ============================================================================

/**
 * Map states to allowed admin actions
 * 
 * CRITICAL: No ambiguous actions
 */
export const ADMIN_ACTIONS_BY_STATE = {
  [ADMIN_RELEVANT_STATES.PENDING_REVIEW]: {
    primary: ['approve', 'request_adjustment'],
    secondary: ['escalate', 'reject', 'annotate'],
    dangerous: ['force_cancel'],
    description: 'Trip awaiting human review and decision'
  },
  
  [ADMIN_RELEVANT_STATES.FAILED]: {
    primary: ['retry_manually', 'approve_override'],
    secondary: ['escalate', 'cancel', 'annotate'],
    dangerous: ['force_cancel'],
    description: 'Trip failed and needs admin intervention'
  },
  
  [ADMIN_RELEVANT_STATES.ESCALATED]: {
    primary: ['resolve_escalation', 'contact_user'],
    secondary: ['approve_override', 'annotate'],
    dangerous: ['force_cancel'],
    description: 'Trip escalated for special handling'
  },
  
  [ADMIN_RELEVANT_STATES.SUBMITTED]: {
    primary: ['monitor'],
    secondary: ['annotate', 'contact_user'],
    dangerous: ['force_cancel'],
    description: 'Trip being processed, monitoring only'
  },
  
  [ADMIN_RELEVANT_STATES.NEEDS_ADJUSTMENT]: {
    primary: ['monitor', 'contact_user'],
    secondary: ['approve_override', 'annotate'],
    dangerous: ['force_cancel'],
    description: 'Trip returned to user for changes'
  },
  
  [ADMIN_RELEVANT_STATES.APPROVED]: {
    primary: ['monitor', 'execute_manually'],
    secondary: ['annotate', 'contact_user'],
    dangerous: ['force_cancel'],
    description: 'Trip approved, awaiting execution'
  },
  
  [ADMIN_RELEVANT_STATES.BOOKED]: {
    primary: ['monitor', 'view_booking'],
    secondary: ['annotate', 'contact_user'],
    dangerous: ['force_cancel'],
    description: 'Trip booked, monitoring only'
  },
  
  [ADMIN_RELEVANT_STATES.COMPLETED]: {
    primary: ['view_details'],
    secondary: ['annotate'],
    dangerous: [],
    description: 'Trip completed, historical record'
  },
  
  [ADMIN_RELEVANT_STATES.CANCELLED]: {
    primary: ['view_details'],
    secondary: ['annotate'],
    dangerous: [],
    description: 'Trip cancelled, historical record'
  }
};

/**
 * Admin action definitions
 */
export const ADMIN_ACTIONS = {
  // Primary actions
  approve: {
    label: 'Approve',
    description: 'Approve trip for execution',
    requiresNotes: false,
    requiresConfirmation: false,
    icon: '✅',
    buttonStyle: 'primary'
  },
  
  request_adjustment: {
    label: 'Request Adjustment',
    description: 'Return to user for changes',
    requiresNotes: true,
    requiresConfirmation: false,
    icon: '✏️',
    buttonStyle: 'secondary'
  },
  
  retry_manually: {
    label: 'Retry Manually',
    description: 'Manually retry failed operation',
    requiresNotes: false,
    requiresConfirmation: true,
    icon: '🔄',
    buttonStyle: 'primary'
  },
  
  approve_override: {
    label: 'Approve Override',
    description: 'Override system checks and approve',
    requiresNotes: true,
    requiresConfirmation: true,
    icon: '⚠️',
    buttonStyle: 'warning'
  },
  
  escalate: {
    label: 'Escalate',
    description: 'Escalate to senior admin or concierge',
    requiresNotes: true,
    requiresConfirmation: false,
    icon: '⬆️',
    buttonStyle: 'secondary'
  },
  
  reject: {
    label: 'Reject',
    description: 'Reject trip permanently',
    requiresNotes: true,
    requiresConfirmation: true,
    icon: '❌',
    buttonStyle: 'danger'
  },
  
  cancel: {
    label: 'Cancel',
    description: 'Cancel trip',
    requiresNotes: true,
    requiresConfirmation: true,
    icon: '🚫',
    buttonStyle: 'danger'
  },
  
  resolve_escalation: {
    label: 'Resolve Escalation',
    description: 'Mark escalation as resolved',
    requiresNotes: true,
    requiresConfirmation: false,
    icon: '✅',
    buttonStyle: 'primary'
  },
  
  execute_manually: {
    label: 'Execute Manually',
    description: 'Manually trigger trip execution',
    requiresNotes: false,
    requiresConfirmation: true,
    icon: '🚀',
    buttonStyle: 'primary'
  },
  
  // Secondary actions
  monitor: {
    label: 'Monitor',
    description: 'Watch trip progress',
    requiresNotes: false,
    requiresConfirmation: false,
    icon: '👁️',
    buttonStyle: 'ghost'
  },
  
  annotate: {
    label: 'Add Note',
    description: 'Add admin notes to trip',
    requiresNotes: true,
    requiresConfirmation: false,
    icon: '📝',
    buttonStyle: 'ghost'
  },
  
  contact_user: {
    label: 'Contact User',
    description: 'Reach out to user',
    requiresNotes: true,
    requiresConfirmation: false,
    icon: '📞',
    buttonStyle: 'ghost'
  },
  
  view_details: {
    label: 'View Details',
    description: 'View full trip details',
    requiresNotes: false,
    requiresConfirmation: false,
    icon: '👁️',
    buttonStyle: 'ghost'
  },
  
  view_booking: {
    label: 'View Booking',
    description: 'View booking confirmation',
    requiresNotes: false,
    requiresConfirmation: false,
    icon: '📋',
    buttonStyle: 'ghost'
  },
  
  // Dangerous actions
  force_cancel: {
    label: 'Force Cancel',
    description: 'Force cancel trip (emergency only)',
    requiresNotes: true,
    requiresConfirmation: true,
    icon: '⛔',
    buttonStyle: 'danger-outlined'
  }
};

// ============================================================================
// ADMIN DECISION OUTCOMES
// ============================================================================

/**
 * Deterministic state changes for each admin action
 * 
 * CRITICAL: Each action results in predictable state change
 */
export const ADMIN_ACTION_OUTCOMES = {
  approve: {
    fromStates: [ADMIN_RELEVANT_STATES.PENDING_REVIEW],
    toState: 'approved',
    userNotification: true,
    userMessage: 'Your trip has been approved',
    auditRequired: true
  },
  
  request_adjustment: {
    fromStates: [ADMIN_RELEVANT_STATES.PENDING_REVIEW, ADMIN_RELEVANT_STATES.FAILED],
    toState: 'needs_adjustment',
    userNotification: true,
    userMessage: 'Please review and update your trip',
    requiresRevalidation: true,
    auditRequired: true
  },
  
  retry_manually: {
    fromStates: [ADMIN_RELEVANT_STATES.FAILED],
    toState: 'submitted',
    userNotification: false,
    resetRetryCount: false,  // Keep retry history
    auditRequired: true
  },
  
  approve_override: {
    fromStates: [ADMIN_RELEVANT_STATES.PENDING_REVIEW, ADMIN_RELEVANT_STATES.FAILED, ADMIN_RELEVANT_STATES.NEEDS_ADJUSTMENT],
    toState: 'approved',
    userNotification: true,
    userMessage: 'Your trip has been approved',
    flagOverride: true,  // Mark as admin override
    auditRequired: true,
    requiresSupervisorReview: true
  },
  
  escalate: {
    fromStates: [ADMIN_RELEVANT_STATES.PENDING_REVIEW, ADMIN_RELEVANT_STATES.FAILED],
    toState: 'escalated',
    userNotification: true,
    userMessage: 'Our team is reviewing your trip',
    auditRequired: true
  },
  
  reject: {
    fromStates: [ADMIN_RELEVANT_STATES.PENDING_REVIEW, ADMIN_RELEVANT_STATES.ESCALATED],
    toState: 'cancelled',
    userNotification: true,
    userMessage: 'We were unable to complete your booking',
    refundRequired: true,
    auditRequired: true
  },
  
  cancel: {
    fromStates: [ADMIN_RELEVANT_STATES.FAILED, ADMIN_RELEVANT_STATES.NEEDS_ADJUSTMENT],
    toState: 'cancelled',
    userNotification: true,
    userMessage: 'Your trip has been cancelled',
    refundRequired: true,
    auditRequired: true
  },
  
  resolve_escalation: {
    fromStates: [ADMIN_RELEVANT_STATES.ESCALATED],
    toState: 'approved',  // Or custom state based on resolution
    userNotification: true,
    userMessage: 'Your trip has been confirmed',
    auditRequired: true
  },
  
  execute_manually: {
    fromStates: [ADMIN_RELEVANT_STATES.APPROVED],
    toState: 'booked',
    userNotification: true,
    userMessage: 'Your trip is confirmed',
    auditRequired: true
  },
  
  annotate: {
    fromStates: '*',  // Available in all states
    toState: null,  // No state change
    userNotification: false,
    auditRequired: true
  },
  
  contact_user: {
    fromStates: '*',
    toState: null,
    userNotification: false,
    auditRequired: true
  },
  
  force_cancel: {
    fromStates: '*',
    toState: 'cancelled',
    userNotification: true,
    userMessage: 'Your trip has been cancelled',
    flagEmergency: true,
    refundRequired: true,
    auditRequired: true,
    requiresSupervisorReview: true
  }
};

// ============================================================================
// AUDIT EXPECTATIONS
// ============================================================================

/**
 * What must be logged for every admin action
 * 
 * CRITICAL: Complete audit trail for accountability
 */
export const AUDIT_REQUIREMENTS = {
  // Required fields for every action
  required: {
    admin_id: 'string',           // Who performed action
    admin_email: 'string',        // Admin email for contact
    action: 'string',             // What action was taken
    trip_id: 'string',            // Which trip was affected
    timestamp: 'datetime',        // When action occurred
    from_state: 'string',         // State before action
    to_state: 'string',           // State after action (null if no change)
    ip_address: 'string',         // Where action originated
    user_agent: 'string'          // Browser/device info
  },
  
  // Optional but encouraged fields
  optional: {
    notes: 'text',                // Admin reasoning/notes
    override_reason: 'text',      // Why override was necessary
    user_contacted: 'boolean',    // Was user notified
    escalation_target: 'string',  // Who was escalated to
    resolution_notes: 'text'      // How issue was resolved
  },
  
  // System-generated fields
  system: {
    audit_id: 'uuid',            // Unique audit record ID
    session_id: 'string',        // Admin session identifier
    environment: 'string',       // production/staging/dev
    version: 'string'            // System version at time of action
  }
};

/**
 * Audit event types
 */
export const AUDIT_EVENTS = {
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  TRIP_APPROVED: 'trip_approved',
  TRIP_REJECTED: 'trip_rejected',
  TRIP_CANCELLED: 'trip_cancelled',
  TRIP_ESCALATED: 'trip_escalated',
  TRIP_RETRIED: 'trip_retried',
  OVERRIDE_APPLIED: 'override_applied',
  NOTE_ADDED: 'note_added',
  USER_CONTACTED: 'user_contacted',
  EMERGENCY_CANCEL: 'emergency_cancel',
  STATE_CHANGED: 'state_changed'
};

/**
 * Audit retention policy
 */
export const AUDIT_RETENTION = {
  standard: '2_years',           // Standard actions
  sensitive: '7_years',          // Overrides, cancellations
  emergency: 'indefinite'        // Emergency actions
};

// ============================================================================
// ADMIN VS USER MESSAGING SEPARATION
// ============================================================================

/**
 * Define clear separation between admin and user visibility
 * 
 * CRITICAL: Prevents confusion and security risks
 */
export const MESSAGING_SEPARATION = {
  // What admins see (explicit, technical)
  admin_sees: {
    failure_types: true,          // VALIDATION_FAILURE, PAYMENT_FAILURE, etc
    failure_reasons: true,        // Technical error messages
    retry_counts: true,           // How many times retried
    system_notes: true,           // Internal system context
    sentinel_scores: true,        // Full SENTINEL data
    api_errors: true,             // External API error details
    state_names: true,            // Internal state names
    validation_errors: true,      // Field-level validation failures
    stack_traces: false,          // Never show stack traces (security)
    user_data: true               // Full user context
  },
  
  // What users see (calm, non-technical)
  user_sees: {
    failure_types: false,         // Never show failure codes
    failure_reasons: false,       // Never show technical reasons
    retry_counts: false,          // Never show retry attempts
    system_notes: false,          // Never show internal notes
    sentinel_scores: false,       // Never show risk scores
    api_errors: false,            // Never show API details
    state_names: false,           // Show friendly status only
    validation_errors: true,      // Show field errors (user-fixable)
    stack_traces: false,          // Never
    status_messages: true         // Calm, premium messaging only
  }
};

/**
 * Example message transformations
 */
export const MESSAGE_EXAMPLES = {
  scenario: 'Payment failure after 2 retries',
  
  admin_sees: {
    state: 'failed',
    failure_type: 'PAYMENT_FAILURE',
    failure_reason: 'Stripe API returned 402: card_declined',
    retry_count: 2,
    system_notes: 'Attempted retry with exponential backoff (30s, 45s). Escalated after max retries.',
    next_action: 'Contact user to update payment method or approve alternative'
  },
  
  user_sees: {
    status: "We're reviewing your trip",
    message: "We're having trouble processing your payment. Our team will reach out shortly.",
    next_action: 'Wait for contact or update payment method'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get allowed actions for a trip in a given state
 * 
 * @param {string} state - Current trip state
 * @returns {object} Allowed actions
 */
export function getAllowedActionsForState(state) {
  const actions = ADMIN_ACTIONS_BY_STATE[state];
  
  if (!actions) {
    return {
      primary: [],
      secondary: ['view_details', 'annotate'],
      dangerous: [],
      description: 'Unknown state'
    };
  }
  
  return actions;
}

/**
 * Get admin context for a trip
 * 
 * @param {object} trip - Trip object
 * @returns {object} Admin context
 */
export function getAdminContext(trip) {
  const context = {};
  
  Object.keys(ADMIN_CONTEXT_FIELDS).forEach(field => {
    const config = ADMIN_CONTEXT_FIELDS[field];
    
    // Check if field should be shown
    if (config.showWhen) {
      // Simple evaluation (in real implementation, use proper expression evaluator)
      const shouldShow = evaluateCondition(config.showWhen, trip);
      if (!shouldShow) return;
    }
    
    context[field] = {
      value: trip[field],
      label: config.label,
      display: config.display,
      type: config.type
    };
  });
  
  return context;
}

/**
 * Simple condition evaluator (placeholder)
 */
function evaluateCondition(condition, trip) {
  // In real implementation, use proper expression evaluator
  // For now, simple string check
  if (condition.includes('state === "failed"')) {
    return trip.state === 'failed';
  }
  if (condition.includes('retry_count > 0')) {
    return trip.retry_count > 0;
  }
  if (condition.includes('state === "escalated"') || condition.includes('state === "pending_approval"')) {
    return trip.state === 'escalated' || trip.state === 'pending_approval';
  }
  return true;
}

/**
 * Get priority for a trip state
 * 
 * @param {string} state - Trip state
 * @returns {string} Priority level
 */
export function getPriorityForState(state) {
  return STATE_PRIORITY_MAPPING[state] || ADMIN_PRIORITY.LOW;
}

/**
 * Get outcome for an admin action
 * 
 * @param {string} action - Admin action
 * @param {string} currentState - Current trip state
 * @returns {object} Action outcome
 */
export function getActionOutcome(action, currentState) {
  const outcome = ADMIN_ACTION_OUTCOMES[action];
  
  if (!outcome) {
    return null;
  }
  
  // Check if action is valid for current state
  if (outcome.fromStates !== '*' && !outcome.fromStates.includes(currentState)) {
    return {
      error: 'Action not valid for current state',
      validStates: outcome.fromStates
    };
  }
  
  return outcome;
}

/**
 * Create audit record
 * 
 * @param {object} params - Audit parameters
 * @returns {object} Audit record
 */
export function createAuditRecord(params) {
  const {
    adminId,
    adminEmail,
    action,
    tripId,
    fromState,
    toState,
    notes,
    ipAddress,
    userAgent
  } = params;
  
  return {
    // Required fields
    audit_id: generateUUID(),
    admin_id: adminId,
    admin_email: adminEmail,
    action: action,
    trip_id: tripId,
    timestamp: new Date().toISOString(),
    from_state: fromState,
    to_state: toState,
    ip_address: ipAddress,
    user_agent: userAgent,
    
    // Optional fields
    notes: notes || null,
    
    // System fields
    session_id: getCurrentSessionId(),
    environment: getEnvironment(),
    version: getSystemVersion()
  };
}

/**
 * Placeholder helper functions
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getCurrentSessionId() {
  return 'session_' + Date.now();
}

function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

function getSystemVersion() {
  return '1.0.0';
}

/**
 * Filter trips for admin queue
 * 
 * @param {array} trips - All trips
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered trips
 */
export function filterTripsForQueue(trips, filters = {}) {
  let filtered = trips;
  
  // Filter by state
  if (filters.state) {
    filtered = filtered.filter(trip => trip.state === filters.state);
  }
  
  // Filter by failure type
  if (filters.failure_type) {
    filtered = filtered.filter(trip => trip.failure_type === filters.failure_type);
  }
  
  // Filter by tier
  if (filters.tier) {
    filtered = filtered.filter(trip => trip.tier === filters.tier);
  }
  
  // Filter by priority
  if (filters.priority) {
    filtered = filtered.filter(trip => {
      const priority = getPriorityForState(trip.state);
      return priority === filters.priority;
    });
  }
  
  // Filter by retry count
  if (filters.retry_count_gt !== undefined) {
    filtered = filtered.filter(trip => trip.retry_count > filters.retry_count_gt);
  }
  
  // Filter by time in state
  if (filters.time_in_state_gt) {
    const threshold = Date.now() - filters.time_in_state_gt;
    filtered = filtered.filter(trip => {
      const stateTime = new Date(trip.state_changed_at).getTime();
      return stateTime < threshold;
    });
  }
  
  // Filter by SENTINEL flag
  if (filters.sentinel_flag) {
    filtered = filtered.filter(trip => trip.sentinel_flag === filters.sentinel_flag);
  }
  
  return filtered;
}

/**
 * Sort trips for admin queue
 * 
 * @param {array} trips - Trips to sort
 * @returns {array} Sorted trips
 */
export function sortTripsForQueue(trips) {
  return trips.sort((a, b) => {
    // 1. Sort by priority
    const priorityA = getPriorityForState(a.state);
    const priorityB = getPriorityForState(b.state);
    const priorityOrder = {
      [ADMIN_PRIORITY.CRITICAL]: 0,
      [ADMIN_PRIORITY.HIGH]: 1,
      [ADMIN_PRIORITY.MEDIUM]: 2,
      [ADMIN_PRIORITY.LOW]: 3,
      [ADMIN_PRIORITY.ARCHIVE]: 4
    };
    
    if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    }
    
    // 2. Sort by time in state (longest first)
    const timeA = new Date(a.state_changed_at).getTime();
    const timeB = new Date(b.state_changed_at).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    
    // 3. Sort by retry count (most retries first)
    if (a.retry_count !== b.retry_count) {
      return b.retry_count - a.retry_count;
    }
    
    // 4. Sort by created date (oldest first)
    const createdA = new Date(a.created_at).getTime();
    const createdB = new Date(b.created_at).getTime();
    return createdA - createdB;
  });
}

/**
 * Check if admin can perform action
 * (Integrates with Day 6 roles/permissions)
 * 
 * @param {string} adminRole - Admin role
 * @param {string} action - Action to perform
 * @param {object} trip - Trip object
 * @returns {boolean} Can perform action
 */
export function canAdminPerformAction(adminRole, action, trip) {
  // This would integrate with Day 6 rolesPermissions.js
  // For now, simple check
  
  const actionConfig = ADMIN_ACTIONS[action];
  if (!actionConfig) return false;
  
  // Check if action requires special permission
  if (actionConfig.buttonStyle === 'danger' || actionConfig.buttonStyle === 'danger-outlined') {
    // Dangerous actions require ADMIN role
    return adminRole === 'ADMIN';
  }
  
  if (actionConfig.buttonStyle === 'warning') {
    // Override actions require ADMIN role
    return adminRole === 'ADMIN';
  }
  
  // Other actions available to all admin roles
  return true;
}
