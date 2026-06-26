/**
 * Roles & Permissions — Sprint Day 6
 * 
 * Defines who can do what, when, and why — and enforces it.
 * 
 * Day 6 Goal: "Make it unmistakably clear who can do what, when, and why —
 *              and make sure the system enforces it."
 * 
 * This protects security, trust, and operational discipline.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM ROLES (Canonical)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * System roles define authority, not UI
 * 
 * Keep this small and intentional
 */
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SYSTEM: "system"
};

/**
 * Optional future roles (not implemented yet)
 */
export const FUTURE_ROLES = {
  OPERATOR: "operator",        // Day-to-day operations (less than admin)
  SUPER_ADMIN: "super_admin",  // Full system access
  CONCIERGE: "concierge"       // Premium customer service
};

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS (Permission Vocabulary)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Every meaningful action in the trip lifecycle
 * This becomes the permission vocabulary
 */
export const ACTIONS = {
  // Trip lifecycle
  CREATE_TRIP: "create_trip",
  EDIT_TRIP: "edit_trip",
  SUBMIT_TRIP: "submit_trip",
  CANCEL_TRIP: "cancel_trip",
  VIEW_TRIP: "view_trip",
  
  // Admin actions
  APPROVE_TRIP: "approve_trip",
  REJECT_TRIP: "reject_trip",
  MODIFY_TRIP: "modify_trip",        // Admin edits user trip
  ESCALATE_TRIP: "escalate_trip",
  ANNOTATE_TRIP: "annotate_trip",
  REQUEST_CHANGES: "request_changes",
  
  // System actions
  AUTO_VALIDATE: "auto_validate",
  AUTO_TRANSITION: "auto_transition",
  AUTO_EXECUTE: "auto_execute",
  LOG_AUDIT: "log_audit",
  ENFORCE_RULES: "enforce_rules",
  
  // Advanced
  OVERRIDE_VALIDATION: "override_validation",
  BYPASS_APPROVAL: "bypass_approval",
  ACCESS_AUDIT_TRAIL: "access_audit_trail",
  VIEW_ALL_TRIPS: "view_all_trips",
  MODIFY_TIER: "modify_tier",
  
  // Retry/recovery
  RETRY_TRIP: "retry_trip",
  RESTORE_TRIP: "restore_trip"
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE → ACTION MATRIX (Core Permission Table)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Permission matrix defining what each role can do
 * 
 * This table is gold for understanding system authority
 */
export const PERMISSION_MATRIX = {
  // USER permissions
  [ROLES.USER]: {
    can: [
      ACTIONS.CREATE_TRIP,
      ACTIONS.EDIT_TRIP,          // Only in draft state
      ACTIONS.SUBMIT_TRIP,
      ACTIONS.CANCEL_TRIP,        // Only their own trips
      ACTIONS.VIEW_TRIP,          // Only their own trips
      ACTIONS.RETRY_TRIP          // After failed validation
    ],
    cannot: [
      ACTIONS.APPROVE_TRIP,
      ACTIONS.REJECT_TRIP,
      ACTIONS.MODIFY_TRIP,        // Cannot edit other's trips
      ACTIONS.ESCALATE_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.AUTO_VALIDATE,
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.AUTO_EXECUTE,
      ACTIONS.OVERRIDE_VALIDATION,
      ACTIONS.BYPASS_APPROVAL,
      ACTIONS.ACCESS_AUDIT_TRAIL,
      ACTIONS.VIEW_ALL_TRIPS,
      ACTIONS.MODIFY_TIER         // Cannot change tier mid-booking
    ]
  },
  
  // ADMIN permissions
  [ROLES.ADMIN]: {
    can: [
      ACTIONS.APPROVE_TRIP,
      ACTIONS.REJECT_TRIP,
      ACTIONS.MODIFY_TRIP,        // Can edit any trip in review
      ACTIONS.ESCALATE_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.REQUEST_CHANGES,
      ACTIONS.CANCEL_TRIP,        // Can cancel any trip
      ACTIONS.VIEW_TRIP,          // Can view all trips
      ACTIONS.VIEW_ALL_TRIPS,
      ACTIONS.ACCESS_AUDIT_TRAIL,
      ACTIONS.OVERRIDE_VALIDATION, // With caution
      ACTIONS.MODIFY_TIER,        // Can adjust tier if needed
      ACTIONS.RESTORE_TRIP        // Can restore cancelled trips
    ],
    cannot: [
      ACTIONS.CREATE_TRIP,        // Admins don't create user trips
      ACTIONS.EDIT_TRIP,          // Don't edit as if they're the user
      ACTIONS.SUBMIT_TRIP,        // Don't submit as user
      ACTIONS.AUTO_VALIDATE,      // System-only
      ACTIONS.AUTO_TRANSITION,    // System-only
      ACTIONS.AUTO_EXECUTE,       // System-only
      ACTIONS.BYPASS_APPROVAL     // Cannot skip approval flow entirely
    ]
  },
  
  // SYSTEM permissions
  [ROLES.SYSTEM]: {
    can: [
      ACTIONS.AUTO_VALIDATE,
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.AUTO_EXECUTE,       // When eligible
      ACTIONS.LOG_AUDIT,
      ACTIONS.ENFORCE_RULES,
      ACTIONS.VIEW_TRIP           // For validation/processing
    ],
    cannot: [
      ACTIONS.CREATE_TRIP,
      ACTIONS.EDIT_TRIP,
      ACTIONS.SUBMIT_TRIP,
      ACTIONS.CANCEL_TRIP,
      ACTIONS.APPROVE_TRIP,       // Cannot approve without human
      ACTIONS.REJECT_TRIP,
      ACTIONS.MODIFY_TRIP,
      ACTIONS.ESCALATE_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.REQUEST_CHANGES,
      ACTIONS.OVERRIDE_VALIDATION,
      ACTIONS.BYPASS_APPROVAL,
      ACTIONS.MODIFY_TIER,
      ACTIONS.RETRY_TRIP,
      ACTIONS.RESTORE_TRIP
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE-AWARE PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Permissions are conditional on trip state
 * 
 * This prevents actions at inappropriate times
 */
export const STATE_PERMISSIONS = {
  draft: {
    [ROLES.USER]: [
      ACTIONS.EDIT_TRIP,
      ACTIONS.SUBMIT_TRIP,
      ACTIONS.CANCEL_TRIP,
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_VALIDATE,
      ACTIONS.LOG_AUDIT
    ]
  },
  
  booking_ready: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.CANCEL_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.MODIFY_TRIP,
      ACTIONS.CANCEL_TRIP,
      ACTIONS.ANNOTATE_TRIP
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_VALIDATE,
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.LOG_AUDIT,
      ACTIONS.ENFORCE_RULES
    ]
  },
  
  pending_approval: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.CANCEL_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.APPROVE_TRIP,
      ACTIONS.REJECT_TRIP,
      ACTIONS.REQUEST_CHANGES,
      ACTIONS.ESCALATE_TRIP,
      ACTIONS.MODIFY_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.VIEW_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.LOG_AUDIT,
      ACTIONS.ENFORCE_RULES  // Timeout enforcement
    ]
  },
  
  approved: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.CANCEL_TRIP  // Can still cancel before execution
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.CANCEL_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_EXECUTE,  // If eligible
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.LOG_AUDIT
    ]
  },
  
  needs_adjustment: {
    [ROLES.USER]: [
      ACTIONS.EDIT_TRIP,
      ACTIONS.SUBMIT_TRIP,
      ACTIONS.CANCEL_TRIP,
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_VALIDATE,
      ACTIONS.LOG_AUDIT
    ]
  },
  
  escalated: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.APPROVE_TRIP,
      ACTIONS.REJECT_TRIP,
      ACTIONS.MODIFY_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.VIEW_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.LOG_AUDIT
    ]
  },
  
  booked: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.CANCEL_TRIP  // With penalties
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.MODIFY_TRIP,  // Emergency changes
      ACTIONS.CANCEL_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.LOG_AUDIT
    ]
  },
  
  in_progress: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.AUTO_TRANSITION,
      ACTIONS.LOG_AUDIT
    ]
  },
  
  completed: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.LOG_AUDIT
    ]
  },
  
  cancelled: {
    [ROLES.USER]: [
      ACTIONS.VIEW_TRIP
    ],
    [ROLES.ADMIN]: [
      ACTIONS.VIEW_TRIP,
      ACTIONS.ANNOTATE_TRIP,
      ACTIONS.RESTORE_TRIP,
      ACTIONS.ACCESS_AUDIT_TRAIL
    ],
    [ROLES.SYSTEM]: [
      ACTIONS.LOG_AUDIT
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL AUTHORITY (Explicit Definition)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Approval authority definition
 * 
 * This clears confusion fast
 */
export const APPROVAL_AUTHORITY = {
  REQUEST: {
    role: ROLES.USER,
    description: "Users request trips",
    cannot: "Users cannot approve their own trips"
  },
  
  APPROVE: {
    role: ROLES.ADMIN,
    description: "Admins approve or reject trips",
    conditions: [
      "Trip must be in pending_approval or escalated state",
      "Admin must provide notes for rejection/changes",
      "Approval is immutable once recorded"
    ],
    cannot: "Admins cannot approve without review"
  },
  
  ENFORCE: {
    role: ROLES.SYSTEM,
    description: "System enforces rules and validates",
    conditions: [
      "System validates before allowing state transitions",
      "System cannot override admin decisions",
      "System cannot approve trips"
    ],
    cannot: "System cannot bypass approval requirements"
  }
};

/**
 * Important distinctions
 */
export const APPROVAL_DISTINCTIONS = {
  APPROVAL_VS_CONFIRMATION: {
    approval: "Admin decision to allow trip to proceed",
    confirmation: "User agreement to trip details",
    note: "These are different steps"
  },
  
  APPROVAL_VS_EXECUTION: {
    approval: "Human permission to proceed",
    execution: "System action to create booking",
    note: "Approval does not equal booking"
  },
  
  VALIDATION_VS_APPROVAL: {
    validation: "System checks for correctness",
    approval: "Human checks for appropriateness",
    note: "Both are required, neither replaces the other"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION CHECKER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a role can perform an action
 * @param {string} role - Role to check
 * @param {string} action - Action to perform
 * @param {string} tripState - Optional trip state for state-aware checks
 * @returns {boolean} True if permitted
 */
export function hasPermission(role, action, tripState = null) {
  // Check base permission
  const rolePermissions = PERMISSION_MATRIX[role];
  if (!rolePermissions) return false;
  
  // Check if action is explicitly forbidden
  if (rolePermissions.cannot.includes(action)) return false;
  
  // Check if action is allowed
  if (!rolePermissions.can.includes(action)) return false;
  
  // If state-aware check requested
  if (tripState) {
    const statePerms = STATE_PERMISSIONS[tripState];
    if (!statePerms) return false;
    
    const roleStatePerms = statePerms[role];
    if (!roleStatePerms) return false;
    
    return roleStatePerms.includes(action);
  }
  
  return true;
}

/**
 * Check if a user can perform an action on a specific trip
 * @param {string} role - User's role
 * @param {string} action - Action to perform
 * @param {Object} trip - Trip object
 * @param {string} userId - User attempting action
 * @returns {Object} Permission result
 */
export function canPerformAction(role, action, trip, userId = null) {
  // Check base permission
  if (!hasPermission(role, action, trip.state)) {
    return {
      allowed: false,
      reason: `Role ${role} does not have permission to ${action}`,
      code: "PERMISSION_DENIED"
    };
  }
  
  // Additional checks for USER role
  if (role === ROLES.USER) {
    // Users can only act on their own trips
    if (userId && trip.user_id && trip.user_id !== userId) {
      return {
        allowed: false,
        reason: "Users can only act on their own trips",
        code: "NOT_OWNER"
      };
    }
    
    // Users cannot edit trips in certain states
    if (action === ACTIONS.EDIT_TRIP) {
      const editableStates = ["draft", "needs_adjustment"];
      if (!editableStates.includes(trip.state)) {
        return {
          allowed: false,
          reason: `Cannot edit trip in ${trip.state} state`,
          code: "STATE_NOT_EDITABLE"
        };
      }
    }
  }
  
  // Additional checks for tier modifications
  if (action === ACTIONS.MODIFY_TIER) {
    if (trip.tier && trip.tier.locked && role !== ROLES.ADMIN) {
      return {
        allowed: false,
        reason: "Tier is locked and cannot be modified",
        code: "TIER_LOCKED"
      };
    }
  }
  
  return {
    allowed: true,
    reason: "Permission granted",
    code: "OK"
  };
}

/**
 * Get allowed actions for a role in a specific trip state
 * @param {string} role - Role to check
 * @param {string} tripState - Trip state
 * @returns {Array} List of allowed actions
 */
export function getAllowedActions(role, tripState) {
  const statePerms = STATE_PERMISSIONS[tripState];
  if (!statePerms) return [];
  
  
  return statePerms[role] || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT EXPECTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Audit trail expectations (not implementation)
 * 
 * Defines what should be logged for future compliance
 */
export const AUDIT_EXPECTATIONS = {
  ADMIN_ACTIONS: {
    requirement: "All admin actions must be annotated",
    includes: [
      "Action type",
      "Admin ID",
      "Timestamp",
      "Reason/notes",
      "Trip state before and after"
    ],
    immutable: true
  },
  
  APPROVAL_DECISIONS: {
    requirement: "Approval decisions are immutable",
    includes: [
      "Decision (approve/reject/escalate/changes)",
      "Decided by (admin ID)",
      "Decided at (timestamp)",
      "Notes/reason",
      "SENTINEL context (if available)"
    ],
    immutable: true
  },
  
  STATE_CHANGES: {
    requirement: "State changes are traceable",
    includes: [
      "From state",
      "To state",
      "Triggered by (user/admin/system)",
      "Timestamp",
      "Reason"
    ],
    immutable: true
  },
  
  PERMISSION_VIOLATIONS: {
    requirement: "Permission violations are logged",
    includes: [
      "Attempted action",
      "Role",
      "User ID",
      "Trip ID",
      "Denial reason",
      "Timestamp"
    ],
    immutable: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UX CONTRACT BY ROLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What each role sees (not how it looks)
 * 
 * This avoids accidental exposure later
 */
export const ROLE_UX_CONTRACT = {
  [ROLES.USER]: {
    canSee: [
      "Their own trip details",
      "Trip status",
      "Public status messages",
      "Next actions available to them",
      "SENTINEL context (basic, filtered by tier)"
    ],
    cannotSee: [
      "Admin controls",
      "Other users' trips",
      "Internal admin notes",
      "Full audit trail",
      "System validation details",
      "Admin decision reasoning (unless shared)"
    ]
  },
  
  [ROLES.ADMIN]: {
    canSee: [
      "All trip details",
      "Full SENTINEL context",
      "Audit trail",
      "Decision history",
      "Internal notes",
      "System validation results",
      "Permission to act on trips"
    ],
    cannotSee: [
      "User passwords/auth tokens",
      "Payment details (PCI compliance)",
      "Other admin's private notes (optional)"
    ]
  },
  
  [ROLES.SYSTEM]: {
    canSee: [
      "Trip data needed for processing",
      "Validation results",
      "State machine context"
    ],
    cannotSee: [
      "Admin decision reasoning (system just enforces)",
      "User personal information (unless needed for validation)"
    ],
    note: "System actions are invisible to users"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE OVERLAP RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Preventing accidental authority overlap
 */
export const ROLE_OVERLAP_RULES = {
  NO_SELF_APPROVAL: {
    rule: "Users cannot approve their own trips",
    enforcement: "System checks user_id ≠ admin_id on approval"
  },
  
  NO_SYSTEM_APPROVAL: {
    rule: "System cannot approve without human",
    enforcement: "approval.decidedBy must be admin_id, not 'system'"
  },
  
  NO_SILENT_ADMIN_EDITS: {
    rule: "Admin edits must be annotated",
    enforcement: "modification_log required for admin changes"
  },
  
  NO_ADMIN_AS_USER: {
    rule: "Admins don't create trips as users",
    enforcement: "Admins use admin interface, not user flow"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  ROLES,
  ACTIONS,
  PERMISSION_MATRIX,
  STATE_PERMISSIONS,
  APPROVAL_AUTHORITY,
  APPROVAL_DISTINCTIONS,
  AUDIT_EXPECTATIONS,
  ROLE_UX_CONTRACT,
  ROLE_OVERLAP_RULES,
  hasPermission,
  canPerformAction,
  getAllowedActions
};
