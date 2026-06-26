/**
 * Human Review Rules — Sprint Day 5
 * 
 * Defines when humans intervene, their authority boundaries, and how the system
 * behaves before, during, and after human intervention.
 * 
 * Day 5 Goal: "Define exactly when a human steps in, why they step in, 
 *              what authority they have, and how the system behaves before 
 *              and after that intervention."
 * 
 * This is trust infrastructure.
 */

// ═══════════════════════════════════════════════════════════════════════════
// HUMAN-INTERVENTION TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Conditions that require human review
 * 
 * Rule: Humans intervene only when the system cannot safely decide
 */
export const INTERVENTION_TRIGGERS = {
  // Validation failures
  VALIDATION_BLOCKED: {
    code: "VALIDATION_BLOCKED",
    description: "Validation returned BLOCKED outcome (system constraint violated)",
    severity: "high",
    requiresReview: true,
    autoEscalate: true
  },
  
  VALIDATION_FAILED_REPEATEDLY: {
    code: "VALIDATION_FAILED_REPEATEDLY",
    description: "User failed validation 5+ times (throttling triggered)",
    severity: "medium",
    requiresReview: true,
    autoEscalate: false
  },
  
  // Tier issues
  TIER_MISMATCH_UNRESOLVABLE: {
    code: "TIER_MISMATCH_UNRESOLVABLE",
    description: "Tier capacity exceeded and user cannot/will not adjust",
    severity: "medium",
    requiresReview: true,
    autoEscalate: false
  },
  
  TIER_LOCKED_CHANGE_ATTEMPT: {
    code: "TIER_LOCKED_CHANGE_ATTEMPT",
    description: "Attempted to change tier after it was locked",
    severity: "high",
    requiresReview: true,
    autoEscalate: true
  },
  
  // SENTINEL context (informational only)
  SENTINEL_ELEVATED_RISK: {
    code: "SENTINEL_ELEVATED_RISK",
    description: "SENTINEL flagged elevated risk (yellow/orange)",
    severity: "info",
    requiresReview: false,  // Informational context only
    autoEscalate: false
  },
  
  SENTINEL_HIGH_RISK: {
    code: "SENTINEL_HIGH_RISK",
    description: "SENTINEL flagged high risk (red)",
    severity: "warning",
    requiresReview: false,  // Still not blocking, but adds context
    autoEscalate: false
  },
  
  // Payment anomalies (future)
  PAYMENT_ANOMALY: {
    code: "PAYMENT_ANOMALY",
    description: "Payment verification failed or flagged",
    severity: "high",
    requiresReview: true,
    autoEscalate: true
  },
  
  // Edge cases
  SPECIAL_REQUEST: {
    code: "SPECIAL_REQUEST",
    description: "User submitted special request or unusual requirements",
    severity: "low",
    requiresReview: true,
    autoEscalate: false
  },
  
  USER_REQUESTED_HELP: {
    code: "USER_REQUESTED_HELP",
    description: "User explicitly requested human assistance",
    severity: "medium",
    requiresReview: true,
    autoEscalate: false
  },
  
  EXECUTIVE_TIER_BOOKING: {
    code: "EXECUTIVE_TIER_BOOKING",
    description: "Executive tier always requires human approval",
    severity: "info",
    requiresReview: true,
    autoEscalate: false
  }
};

/**
 * Check if trip requires human review
 * @param {Object} trip - Trip object
 * @param {Object} validationResult - Result from validateTrip()
 * @returns {Object} Review requirement
 */
export function requiresHumanReview(trip, validationResult = null) {
  const triggers = [];
  
  // Check validation outcomes
  if (validationResult) {
    if (validationResult.status === "BLOCKED") {
      triggers.push(INTERVENTION_TRIGGERS.VALIDATION_BLOCKED);
    }
  }
  
  // Check tier requirements
  if (trip.tier && trip.tier.name === "executive") {
    triggers.push(INTERVENTION_TRIGGERS.EXECUTIVE_TIER_BOOKING);
  }
  
  // Check SENTINEL (informational only)
  if (trip.sentinel_snapshot && trip.sentinel_snapshot.risk_level) {
    const riskLevel = trip.sentinel_snapshot.risk_level.toLowerCase();
    if (riskLevel === "red") {
      triggers.push(INTERVENTION_TRIGGERS.SENTINEL_HIGH_RISK);
    } else if (riskLevel === "yellow" || riskLevel === "orange") {
      triggers.push(INTERVENTION_TRIGGERS.SENTINEL_ELEVATED_RISK);
    }
  }
  
  // Check for special notes/requests
  if (trip.notes && trip.notes.trim() !== "") {
    triggers.push(INTERVENTION_TRIGGERS.SPECIAL_REQUEST);
  }
  
  return {
    requiresReview: triggers.some(t => t.requiresReview),
    triggers,
    autoEscalate: triggers.some(t => t.autoEscalate)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING REVIEW STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pending Review State Definition
 * 
 * This is a controlled pause state where:
 * - Trip is frozen (no modifications allowed)
 * - No booking execution occurs
 * - User is informed neutrally
 * - Admin review is required
 * 
 * This prevents chaos and duplicate actions
 */
export const PENDING_REVIEW_STATE = {
  name: "pending_approval",
  
  description: "Trip is awaiting human review and decision",
  
  behavior: {
    frozen: true,              // Trip cannot be modified
    executionBlocked: true,    // No booking execution
    userNotified: true,        // User sees neutral waiting message
    adminActionRequired: true  // Admin must take action to proceed
  },
  
  allowedActions: {
    user: ["cancel", "wait"],
    admin: ["approve", "request_changes", "reject", "escalate", "annotate"],
    system: []  // System cannot auto-advance
  },
  
  timeout: {
    duration: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
    action: "AUTO_ESCALATE",
    message: "Trip review timed out - escalated to priority queue"
  }
};

/**
 * Transition trip to pending review state
 * @param {Object} trip - Trip object
 * @param {string} reason - Reason for review
 * @param {Object} context - Additional context
 * @returns {Object} Updated trip
 */
export function transitionToPendingReview(trip, reason, context = {}) {
  return {
    ...trip,
    state: "pending_approval",
    approval: {
      status: "",  // No decision yet
      decidedBy: "",
      decidedAt: "",
      notes: context.notes || "",
      reason: reason,
      submittedAt: new Date().toISOString()
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORITY BOUNDARIES (Critical)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Authority matrix defining who can do what
 * 
 * This clarity prevents liability issues later
 */
export const AUTHORITY_BOUNDARIES = {
  USER: {
    can: [
      "cancel_trip",           // Cancel their own trip
      "wait_for_review",       // Wait for admin decision
      "respond_to_clarification",  // Answer admin questions
      "view_status"            // See current trip status
    ],
    cannot: [
      "approve_trip",          // Cannot self-approve
      "modify_during_review",  // Cannot edit while in review
      "bypass_validation",     // Cannot skip validation
      "override_system"        // Cannot override system decisions
    ]
  },
  
  ADMIN: {
    can: [
      "approve_trip",          // Approve and move to booking_ready
      "modify_trip_fields",    // Edit trip details
      "reject_trip",           // Reject and move to cancelled
      "request_changes",       // Send back to draft with notes
      "escalate_trip",         // Escalate to higher authority
      "annotate_decision",     // Add decision notes
      "override_validation",   // Bypass validation if safe
      "view_full_context",     // See all trip data + SENTINEL
      "access_audit_trail"     // View decision history
    ],
    cannot: [
      "auto_book",             // Cannot trigger booking without approval
      "bypass_payment",        // Cannot skip payment validation
      "hide_audit_trail"       // Cannot hide decisions
    ]
  },
  
  SYSTEM: {
    can: [
      "validate_trip",         // Run validation checks
      "provide_sentinel_context",  // Show SENTINEL data
      "enforce_state_transitions",  // Follow state machine
      "log_all_actions",       // Record everything
      "timeout_stale_reviews"  // Auto-escalate if review takes too long
    ],
    cannot: [
      "auto_advance_pending",  // Cannot skip pending_approval
      "auto_book_without_approval",  // Cannot execute without human OK
      "auto_cancel",           // Cannot cancel without reason
      "modify_approval_decision",  // Cannot change admin decisions
      "hide_sentinel_data"     // Cannot suppress SENTINEL context
    ]
  }
};

/**
 * Check if an action is authorized
 * @param {string} actor - "user" | "admin" | "system"
 * @param {string} action - Action to check
 * @returns {boolean} True if authorized
 */
export function isAuthorized(actor, action) {
  const actorUpper = actor.toUpperCase();
  const authority = AUTHORITY_BOUNDARIES[actorUpper];
  
  if (!authority) return false;
  
  return authority.can.includes(action) && !authority.cannot.includes(action);
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DECISIONS & OUTCOMES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Admin decision outcomes
 * 
 * No ambiguous outcomes allowed
 */
export const ADMIN_DECISIONS = {
  APPROVED: {
    decision: "APPROVED",
    resultingState: "approved",
    nextStep: "Trip proceeds to booking execution",
    requiresReason: false,
    requiresNotes: false,
    resumable: true
  },
  
  REQUEST_CHANGES: {
    decision: "NEEDS_ADJUSTMENT",
    resultingState: "draft",
    nextStep: "Trip returns to user for modifications",
    requiresReason: true,
    requiresNotes: true,
    resumable: true
  },
  
  REJECT: {
    decision: "REJECTED",
    resultingState: "cancelled",
    nextStep: "Trip is terminated",
    requiresReason: true,
    requiresNotes: true,
    resumable: false
  },
  
  ESCALATE: {
    decision: "ESCALATED",
    resultingState: "escalated",
    nextStep: "Trip escalated to higher authority",
    requiresReason: true,
    requiresNotes: false,
    resumable: true
  }
};

/**
 * Apply admin decision to trip
 * @param {Object} trip - Trip object
 * @param {string} decision - Admin decision
 * @param {string} adminId - Admin making decision
 * @param {string} notes - Decision notes
 * @returns {Object} Updated trip
 */
export function applyAdminDecision(trip, decision, adminId, notes = "") {
  const decisionConfig = Object.values(ADMIN_DECISIONS).find(d => d.decision === decision);
  
  if (!decisionConfig) {
    throw new Error(`Invalid admin decision: ${decision}`);
  }
  
  // Validate required fields
  if (decisionConfig.requiresReason && (!notes || notes.trim() === "")) {
    throw new Error(`Decision "${decision}" requires notes/reason`);
  }
  
  return {
    ...trip,
    state: decisionConfig.resultingState,
    approval: {
      status: decision,
      decidedBy: adminId,
      decidedAt: new Date().toISOString(),
      notes: notes
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUME LOGIC (After Review)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resume logic after human decision
 * 
 * Rules:
 * - Approval → resume normal automation
 * - Rejection → end flow cleanly
 * - Changes → require re-validation
 */
export const RESUME_RULES = {
  AFTER_APPROVAL: {
    action: "RESUME_AUTOMATION",
    nextState: "booked",  // Or "booking_ready" depending on payment
    revalidate: false,     // Already validated
    notifyUser: true,
    message: "Your trip has been approved and is being processed."
  },
  
  AFTER_CHANGES: {
    action: "REQUIRE_REVALIDATION",
    nextState: "draft",
    revalidate: true,      // Must re-validate after changes
    notifyUser: true,
    message: "Please review the requested changes to your trip."
  },
  
  AFTER_REJECTION: {
    action: "END_FLOW",
    nextState: "cancelled",
    revalidate: false,
    notifyUser: true,
    message: "Your trip request could not be completed. Please contact support for details."
  },
  
  AFTER_ESCALATION: {
    action: "WAIT_FOR_HIGHER_AUTHORITY",
    nextState: "escalated",
    revalidate: false,
    notifyUser: true,
    message: "Your trip is being reviewed by our concierge team. We'll be in touch shortly."
  }
};

/**
 * Determine resume action based on admin decision
 * @param {string} decision - Admin decision
 * @returns {Object} Resume configuration
 */
export function getResumeAction(decision) {
  const resumeMap = {
    "APPROVED": RESUME_RULES.AFTER_APPROVAL,
    "NEEDS_ADJUSTMENT": RESUME_RULES.AFTER_CHANGES,
    "REJECTED": RESUME_RULES.AFTER_REJECTION,
    "ESCALATED": RESUME_RULES.AFTER_ESCALATION
  };
  
  return resumeMap[decision] || RESUME_RULES.AFTER_ESCALATION;
}

/**
 * Execute resume logic
 * @param {Object} trip - Trip object with admin decision
 * @param {Function} validateFn - Validation function (if revalidation needed)
 * @returns {Object} Result with next state and actions
 */
export function resumeAfterReview(trip, validateFn = null) {
  const decision = trip.approval?.status;
  const resumeConfig = getResumeAction(decision);
  
  let validationResult = null;
  
  // Re-validate if required
  if (resumeConfig.revalidate && validateFn) {
    validationResult = validateFn(trip);
    
    if (validationResult.status !== "VALID") {
      // Validation failed again - stay in draft
      return {
        success: false,
        state: "draft",
        message: "Please correct the validation errors before proceeding.",
        validationErrors: validationResult.errors
      };
    }
  }
  
  return {
    success: true,
    state: resumeConfig.nextState,
    action: resumeConfig.action,
    message: resumeConfig.message,
    notifyUser: resumeConfig.notifyUser,
    validationResult
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SENTINEL'S ROLE (Explicitly Limited)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SENTINEL Integration with Human Review
 * 
 * CRITICAL RULE:
 * SENTINEL may inform human review but NEVER decides approval
 * 
 * SENTINEL:
 * - Adds context
 * - Adds risk indicators
 * - NEVER blocks
 * - NEVER approves
 * - NEVER requires escalation (admin decides that)
 */
export const SENTINEL_REVIEW_ROLE = {
  purpose: "Provide intelligence context to human decision-makers",
  
  capabilities: {
    canProvide: [
      "risk_assessment",       // Color-coded risk level
      "route_analysis",        // Route safety/sensitivity context
      "historical_patterns",   // Past trip data (if available)
      "contextual_notes"       // Additional intelligence
    ],
    
    cannotDo: [
      "block_booking",         // NEVER blocks
      "approve_trip",          // NEVER approves
      "force_escalation",      // NEVER forces admin decision
      "override_admin",        // NEVER overrides human judgment
      "hide_from_admin"        // Admin always sees full context
    ]
  },
  
  displayInReview: {
    basic: "risk_indicator",       // Simple color
    corporate: "risk_with_context",  // Color + brief notes
    executive: "full_intelligence"   // Complete SENTINEL dashboard
  },
  
  influence: "INFORMATIONAL_ONLY"  // SENTINEL informs, humans decide
};

/**
 * Get SENTINEL context for admin review
 * @param {Object} trip - Trip object
 * @returns {Object} SENTINEL review context
 */
export function getSentinelReviewContext(trip) {
  if (!trip.sentinel_snapshot) {
    return {
      available: false,
      message: "No SENTINEL data available for this trip"
    };
  }
  
  const riskLevel = trip.sentinel_snapshot.risk_level?.toLowerCase() || "green";
  const riskNote = trip.sentinel_snapshot.risk_note || "";
  
  return {
    available: true,
    riskLevel,
    riskNote,
    interpretation: {
      green: "No elevated concerns - standard processing recommended",
      yellow: "Minor context noted - review details before approval",
      orange: "Elevated context - additional verification suggested",
      red: "Significant context - careful review recommended"
    }[riskLevel] || "No interpretation available",
    
    recommendation: {
      green: "APPROVE",
      yellow: "REVIEW",
      orange: "REVIEW_CAREFULLY",
      red: "REVIEW_CAREFULLY"
    }[riskLevel] || "REVIEW",
    
    // CRITICAL: This is a suggestion only
    blocking: false,
    decisionAuthority: "ADMIN_ONLY"
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UX CONTRACT (No UI Yet)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User-facing message contract
 * 
 * Defines what user sees (not how it looks)
 * 
 * Rules:
 * - No error language
 * - No risk language
 * - Premium, neutral tone
 */
export const UX_MESSAGES = {
  PENDING_REVIEW: {
    title: "Your trip is being reviewed",
    message: "We're reviewing your trip details to ensure everything is perfect. You'll receive a notification shortly.",
    tone: "neutral",
    action: "Wait or cancel",
    noErrorLanguage: true
  },
  
  APPROVED: {
    title: "Trip approved",
    message: "Great news! Your trip has been approved and we're processing your booking.",
    tone: "positive",
    action: "No action needed"
  },
  
  NEEDS_CHANGES: {
    title: "Quick adjustment needed",
    message: "We need a small update to your trip details. Please review the notes below.",
    tone: "neutral",
    action: "Review and update"
  },
  
  ESCALATED: {
    title: "Concierge assistance",
    message: "Our concierge team is personally handling your trip request. We'll reach out shortly.",
    tone: "premium",
    action: "Wait for contact"
  },
  
  TIMEOUT: {
    title: "Priority escalation",
    message: "Your trip review is being prioritized. Our team will contact you soon.",
    tone: "neutral",
    action: "Wait for contact"
  }
};

/**
 * Get user-facing message for current state
 * @param {string} state - Current trip state
 * @param {Object} approval - Approval metadata
 * @returns {Object} UX message configuration
 */
export function getUserMessage(state, approval = {}) {
  if (state === "pending_approval") {
    return UX_MESSAGES.PENDING_REVIEW;
  }
  
  if (state === "approved" || approval.status === "APPROVED") {
    return UX_MESSAGES.APPROVED;
  }
  
  if (state === "draft" && approval.status === "NEEDS_ADJUSTMENT") {
    return UX_MESSAGES.NEEDS_CHANGES;
  }
  
  if (state === "escalated" || approval.status === "ESCALATED") {
    return UX_MESSAGES.ESCALATED;
  }
  
  return {
    title: "Trip in progress",
    message: "Your trip is being processed.",
    tone: "neutral",
    action: "Check back soon"
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Triggers
  INTERVENTION_TRIGGERS,
  requiresHumanReview,
  
  // Pending review
  PENDING_REVIEW_STATE,
  transitionToPendingReview,
  
  // Authority
  AUTHORITY_BOUNDARIES,
  isAuthorized,
  
  // Decisions
  ADMIN_DECISIONS,
  applyAdminDecision,
  
  // Resume
  RESUME_RULES,
  getResumeAction,
  resumeAfterReview,
  
  // SENTINEL
  SENTINEL_REVIEW_ROLE,
  getSentinelReviewContext,
  
  // UX
  UX_MESSAGES,
  getUserMessage
};
