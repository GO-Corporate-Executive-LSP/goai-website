# ETAS V1 - DAY 14: ADMIN AUTHORITY & HUMAN DECISION GOVERNANCE
## ALIGNED WITH SPRINT 1 IMPLEMENTATION

**Created:** January 2025  
**Status:** Implementation-Ready  
**Schema Source:** Lee's tripDatabase.js + adminSurfaces.js  
**Sprint 1 Basis:** SPRINT_1_DATABASE_API.md, SPRINT_1_WIX_DATABASES.md

---

## 🎯 PURPOSE

This document defines:
1. **When human review is required** (deterministic entry conditions)
2. **What admins can do** (approve, reject, clarify, escalate)
3. **What admins see** (admin_context fields aligned with Lee's schema)
4. **Audit guarantees** (immutability, required fields)
5. **Lifecycle integration** (how admin decisions affect trip state)

**CRITICAL:** All field names, structures, and examples match Lee's actual Sprint 1 implementation.

---

## 📊 SCHEMA ALIGNMENT

### Lee's Actual Trip Structure

```javascript
// From tripDatabase.js - Lee's implementation
{
  trip_id: "trip_001",
  user_id: "user_123",
  state: {
    current_state: "pending_approval",
    previous_state: "submitted",
    state_history: [...]
  },
  
  // ADMIN CONTEXT - contains ALL admin-related data
  admin_context: {
    
    // Approval tracking
    approval: {
      status: "PENDING",              // PENDING | APPROVED | REJECTED | NEEDS_CLARIFICATION
      decided_by: null,               // admin_id who made decision
      decided_at: null,               // ISO timestamp
      notes: "",                      // Admin reasoning
      decision_reason: ""             // Structured reason code
    },
    
    // Automation eligibility
    automation: {
      eligible: false,                // Can this be auto-approved?
      reason: "sentinel_flag",        // Why not eligible
      checked_at: "2025-01-20T17:00:00Z"
    },
    
    // Execution tracking
    execution: {
      status: "NOT_STARTED",          // NOT_STARTED | IN_PROGRESS | COMPLETED | FAILED
      action: null,                   // "approve" | "reject" | "clarify" | "escalate"
      executed_by: null,              // admin_id
      executed_at: null,              // ISO timestamp
      result: {}                      // Execution outcome data
    },
    
    // Failure tracking
    failure: {
      count: 0,                       // Number of failures
      last_failure_at: null,          // ISO timestamp
      last_failure_reason: "",        // Human-readable reason
      failure_type: null              // "payment" | "booking" | "validation" | "system"
    },
    
    // Retry tracking
    retries: {
      count: 0,                       // Number of retry attempts
      last_retry_at: null,            // ISO timestamp
      max_retries_reached: false      // Has hit retry limit
    }
  },
  
  // SENTINEL risk assessment snapshot
  sentinel_snapshot: {
    risk_score: 25,
    risk_level: "LOW",
    flags: [],
    timestamp: "2025-01-20T17:00:00Z"
  },
  
  // Other trip fields...
  pickup: { address: "...", datetime: "..." },
  dropoff: { address: "..." },
  tier: { name: "basic", source: "user_profile", locked: true },
  passengers: 2,
  luggage: 0
}
```

### Lee's Actual Audit Event Structure

```javascript
// From tripDatabase.js - logAuditEvent()
{
  auditId: "a1b2c3d4-e5f6-4789-a012-345678901234",
  tripId: "trip_001",
  timestamp: "2025-01-20T17:00:00Z",
  fromState: "submitted",
  toState: "pending_approval",
  
  // Event metadata
  event: {
    event_type: "SENTINEL_REVIEW_REQUIRED",     // From eventTypes.js
    event_category: "SYSTEM_ACTION",            // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
    outcome: "SUCCESS"                          // SUCCESS | FAILURE | PARTIAL | PENDING
  },
  
  // Actor information
  actor: {
    actor_id: "admin_123",                      // User ID, Admin ID, or "SYSTEM"
    actor_role: "ADMIN",                        // USER | ADMIN | SENIOR_ADMIN | SYSTEM
    actor_email: "admin@example.com",           // Email (null for SYSTEM)
    ipAddress: "192.168.1.1"                    // IP address
  },
  
  // Admin context (optional, for admin actions only)
  adminContext: {
    notes: "Approved based on low SENTINEL risk",
    override_reason: null,
    user_contacted: false,
    escalation_target: null,
    resolution_notes: null,
    session_id: "sess_1737398400000_abc123",
    environment: "production",
    version: "1.0.0"
  },
  
  // Retention and compliance
  retentionPolicy: "STANDARD",                  // STANDARD | EXTENDED | PERMANENT | LEGAL_HOLD
  complianceTags: [],
  immutable: true
}
```

---

## 🚨 TASK 1: WHEN HUMAN REVIEW IS REQUIRED

### Deterministic Entry Conditions

**Human review is triggered when ANY of these conditions are met:**

#### A. SENTINEL Risk Assessment Triggers

```javascript
// From tripDatabase.js - SENTINEL snapshot check
if (trip.sentinel_snapshot.risk_level === "HIGH" || 
    trip.sentinel_snapshot.risk_level === "CRITICAL") {
  // → State transition: submitted → pending_approval
  // → admin_context.automation.eligible = false
  // → admin_context.automation.reason = "sentinel_risk_threshold"
  requireHumanReview = true;
}

// SENTINEL flag triggers
const HIGH_RISK_FLAGS = [
  "unusual_route",
  "late_night_pickup",
  "high_value_tier",
  "new_user_high_tier",
  "executive_tier_first_trip",
  "unusual_payment_method",
  "multiple_failed_payments"
];

if (trip.sentinel_snapshot.flags.some(flag => HIGH_RISK_FLAGS.includes(flag))) {
  // → State transition: submitted → pending_approval
  // → admin_context.automation.eligible = false
  // → admin_context.automation.reason = "sentinel_flag_present"
  requireHumanReview = true;
}
```

#### B. Tier-Based Triggers

```javascript
// EXECUTIVE tier always requires human approval
if (trip.tier.name === "executive") {
  // → State transition: submitted → pending_approval
  // → admin_context.automation.eligible = false
  // → admin_context.automation.reason = "executive_tier_policy"
  requireHumanReview = true;
}

// CORPORATE tier with high passenger count
if (trip.tier.name === "corporate" && trip.passengers >= 6) {
  // → State transition: submitted → pending_approval
  // → admin_context.automation.eligible = false
  // → admin_context.automation.reason = "corporate_high_capacity"
  requireHumanReview = true;
}
```

#### C. Failure Recovery Triggers

```javascript
// Maximum retries reached
if (trip.admin_context.retries.max_retries_reached === true) {
  // → State transition: (current_state) → failed
  // → admin_context.execution.status = "FAILED"
  // → Add to AdminQueue with priority: "critical"
  requireHumanReview = true;
}

// Payment failures exceed threshold
if (trip.admin_context.failure.failure_type === "payment" && 
    trip.admin_context.failure.count >= 3) {
  // → State transition: (current_state) → failed
  // → Add to AdminQueue with priority: "critical"
  requireHumanReview = true;
}
```

#### D. Validation Edge Cases

```javascript
// Trip fails automated validation
if (validationResult.valid === false && 
    validationResult.canRetry === false) {
  // → State transition: submitted → needs_adjustment
  // → admin_context.approval.status = "NEEDS_CLARIFICATION"
  // → User notified to fix issues
  requireHumanReview = true;  // Admin monitors, doesn't block
}
```

### Entry Transition Flow

```javascript
// From trips.jsw - processTrip()
async function requiresHumanApproval(trip) {
  // Check SENTINEL risk
  if (trip.sentinel_snapshot.risk_level === "HIGH" || 
      trip.sentinel_snapshot.risk_level === "CRITICAL") {
    return {
      required: true,
      reason: "sentinel_risk_threshold",
      priority: "high"
    };
  }
  
  // Check SENTINEL flags
  const highRiskFlags = trip.sentinel_snapshot.flags.filter(f => 
    HIGH_RISK_FLAGS.includes(f)
  );
  if (highRiskFlags.length > 0) {
    return {
      required: true,
      reason: "sentinel_flag_present",
      flags: highRiskFlags,
      priority: "high"
    };
  }
  
  // Check tier policy
  if (trip.tier.name === "executive") {
    return {
      required: true,
      reason: "executive_tier_policy",
      priority: "high"
    };
  }
  
  // Check failure state
  if (trip.admin_context.failure.count >= 3) {
    return {
      required: true,
      reason: "failure_threshold_exceeded",
      priority: "critical"
    };
  }
  
  return { required: false };
}

// Transition to pending_approval
async function transitionToPendingApproval(trip, reason) {
  // Update trip state
  trip.state.previous_state = trip.state.current_state;
  trip.state.current_state = "pending_approval";
  trip.state.state_history.push({
    state: "pending_approval",
    entered_at: new Date().toISOString(),
    reason: reason
  });
  
  // Update admin_context
  trip.admin_context.approval.status = "PENDING";
  trip.admin_context.automation.eligible = false;
  trip.admin_context.automation.reason = reason;
  trip.admin_context.automation.checked_at = new Date().toISOString();
  
  // Save to database
  await saveTrip(trip);
  
  // Add to admin queue
  await addToAdminQueue(trip);
  
  // Log audit event
  await logAuditEvent({
    tripId: trip.trip_id,
    fromState: trip.state.previous_state,
    toState: "pending_approval",
    event: {
      event_type: "SENTINEL_REVIEW_REQUIRED",
      event_category: "SYSTEM_ACTION",
      outcome: "SUCCESS"
    },
    actor: {
      actor_id: "SYSTEM",
      actor_role: "SYSTEM",
      actor_email: null,
      ipAddress: ""
    }
  });
}
```

---

## 🛡️ TASK 2: ADMIN AUTHORITY & ACTIONS

### Allowed Actions Per State

From [adminSurfaces.js](src/backend/etas/adminSurfaces.js):

```javascript
// PENDING_APPROVAL state
ALLOWED_ACTIONS: {
  "pending_approval": [
    {
      action: "approve",
      label: "Approve Trip",
      requiresNotes: false,
      nextState: "approved",
      auditEventType: "ADMIN_APPROVE_TRIP"
    },
    {
      action: "reject",
      label: "Reject Trip",
      requiresNotes: true,
      nextState: "rejected",
      auditEventType: "ADMIN_REJECT_TRIP"
    },
    {
      action: "clarify",
      label: "Request Clarification",
      requiresNotes: true,
      nextState: "needs_adjustment",
      auditEventType: "ADMIN_REQUEST_CLARIFICATION"
    },
    {
      action: "escalate",
      label: "Escalate to Senior Admin",
      requiresNotes: true,
      nextState: "escalated",
      auditEventType: "ADMIN_ESCALATE"
    }
  ],
  
  "failed": [
    {
      action: "retry",
      label: "Retry Failed Action",
      requiresNotes: false,
      nextState: "submitted",
      auditEventType: "ADMIN_RETRY_FAILED"
    },
    {
      action: "override",
      label: "Override and Approve",
      requiresNotes: true,
      nextState: "approved",
      auditEventType: "ADMIN_OVERRIDE_APPROVAL"
    },
    {
      action: "reject",
      label: "Reject Trip",
      requiresNotes: true,
      nextState: "rejected",
      auditEventType: "ADMIN_REJECT_TRIP"
    }
  ],
  
  "escalated": [
    {
      action: "resolve",
      label: "Resolve and Approve",
      requiresNotes: true,
      nextState: "approved",
      auditEventType: "ADMIN_RESOLVE_ESCALATION"
    },
    {
      action: "reject",
      label: "Reject Trip",
      requiresNotes: true,
      nextState: "rejected",
      auditEventType: "ADMIN_REJECT_TRIP"
    }
  ]
}
```

### Action Implementation

#### APPROVE Action

```javascript
// From approveTrip.js (aligned with Lee's schema)
export async function approveTrip(tripId, adminId, adminEmail, notes = "") {
  // Load trip
  const trip = await loadTrip(tripId);
  
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }
  
  // Validate current state
  if (trip.state.current_state !== "pending_approval") {
    throw new Error(`Cannot approve trip in state: ${trip.state.current_state}`);
  }
  
  // Update state
  trip.state.previous_state = trip.state.current_state;
  trip.state.current_state = "approved";
  trip.state.state_history.push({
    state: "approved",
    entered_at: new Date().toISOString(),
    reason: "admin_approval"
  });
  
  // Update admin_context.approval
  trip.admin_context.approval.status = "APPROVED";
  trip.admin_context.approval.decided_by = adminId;
  trip.admin_context.approval.decided_at = new Date().toISOString();
  trip.admin_context.approval.notes = notes;
  trip.admin_context.approval.decision_reason = "manual_approval";
  
  // Update admin_context.execution
  trip.admin_context.execution.status = "COMPLETED";
  trip.admin_context.execution.action = "approve";
  trip.admin_context.execution.executed_by = adminId;
  trip.admin_context.execution.executed_at = new Date().toISOString();
  trip.admin_context.execution.result = {
    approved: true,
    method: "manual"
  };
  
  // Save trip
  await saveTrip(trip);
  
  // Update admin queue
  await updateAdminQueue(tripId, {
    state: { current_state: "approved" },
    context: { reviewed_by: adminId },
    review: {
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
      decision: "APPROVED"
    }
  });
  
  // Log audit event
  await logAuditEvent({
    tripId: tripId,
    fromState: "pending_approval",
    toState: "approved",
    event: {
      event_type: "ADMIN_APPROVE_TRIP",
      event_category: "ADMIN_ACTION",
      outcome: "SUCCESS"
    },
    actor: {
      actor_id: adminId,
      actor_role: "ADMIN",
      actor_email: adminEmail,
      ipAddress: "" // Set in backend context
    },
    admin_context: {
      notes: notes,
      session_id: generateSessionId(),
      environment: "production",
      version: "1.0.0"
    }
  });
  
  return { success: true, trip };
}
```

#### REJECT Action

```javascript
// From approveTrip.js
export async function rejectTrip(tripId, adminId, adminEmail, notes, reason) {
  const trip = await loadTrip(tripId);
  
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }
  
  // Update state
  trip.state.previous_state = trip.state.current_state;
  trip.state.current_state = "rejected";
  trip.state.state_history.push({
    state: "rejected",
    entered_at: new Date().toISOString(),
    reason: "admin_rejection"
  });
  
  // Update admin_context.approval
  trip.admin_context.approval.status = "REJECTED";
  trip.admin_context.approval.decided_by = adminId;
  trip.admin_context.approval.decided_at = new Date().toISOString();
  trip.admin_context.approval.notes = notes;
  trip.admin_context.approval.decision_reason = reason; // "policy_violation", "risk_too_high", etc.
  
  // Update admin_context.execution
  trip.admin_context.execution.status = "COMPLETED";
  trip.admin_context.execution.action = "reject";
  trip.admin_context.execution.executed_by = adminId;
  trip.admin_context.execution.executed_at = new Date().toISOString();
  trip.admin_context.execution.result = {
    rejected: true,
    reason: reason
  };
  
  // Save trip
  await saveTrip(trip);
  
  // Update admin queue
  await updateAdminQueue(tripId, {
    state: { current_state: "rejected" },
    context: { reviewed_by: adminId },
    review: {
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
      decision: "REJECTED",
      reason: reason
    }
  });
  
  // Log audit event
  await logAuditEvent({
    tripId: tripId,
    fromState: trip.state.previous_state,
    toState: "rejected",
    event: {
      event_type: "ADMIN_REJECT_TRIP",
      event_category: "ADMIN_ACTION",
      outcome: "SUCCESS"
    },
    actor: {
      actor_id: adminId,
      actor_role: "ADMIN",
      actor_email: adminEmail,
      ipAddress: ""
    },
    admin_context: {
      notes: notes,
      override_reason: reason,
      session_id: generateSessionId(),
      environment: "production",
      version: "1.0.0"
    }
  });
  
  // Notify user
  await notifyUserOfRejection(trip.user_id, trip.trip_id, reason);
  
  return { success: true, trip };
}
```

#### CLARIFY Action

```javascript
// Request clarification from user
export async function requestClarification(tripId, adminId, adminEmail, notes, clarificationNeeded) {
  const trip = await loadTrip(tripId);
  
  // Update state
  trip.state.previous_state = trip.state.current_state;
  trip.state.current_state = "needs_adjustment";
  trip.state.state_history.push({
    state: "needs_adjustment",
    entered_at: new Date().toISOString(),
    reason: "admin_clarification_request"
  });
  
  // Update admin_context.approval
  trip.admin_context.approval.status = "NEEDS_CLARIFICATION";
  trip.admin_context.approval.decided_by = adminId;
  trip.admin_context.approval.decided_at = new Date().toISOString();
  trip.admin_context.approval.notes = notes;
  trip.admin_context.approval.decision_reason = "clarification_needed";
  
  // Update admin_context.execution
  trip.admin_context.execution.status = "COMPLETED";
  trip.admin_context.execution.action = "clarify";
  trip.admin_context.execution.executed_by = adminId;
  trip.admin_context.execution.executed_at = new Date().toISOString();
  trip.admin_context.execution.result = {
    clarification_needed: clarificationNeeded,
    user_contacted: true
  };
  
  // Save trip
  await saveTrip(trip);
  
  // Update admin queue
  await updateAdminQueue(tripId, {
    state: { current_state: "needs_adjustment" },
    context: { reviewed_by: adminId }
  });
  
  // Log audit event
  await logAuditEvent({
    tripId: tripId,
    fromState: trip.state.previous_state,
    toState: "needs_adjustment",
    event: {
      event_type: "ADMIN_REQUEST_CLARIFICATION",
      event_category: "ADMIN_ACTION",
      outcome: "SUCCESS"
    },
    actor: {
      actor_id: adminId,
      actor_role: "ADMIN",
      actor_email: adminEmail,
      ipAddress: ""
    },
    admin_context: {
      notes: notes,
      user_contacted: true,
      resolution_notes: `User needs to provide: ${clarificationNeeded.join(", ")}`,
      session_id: generateSessionId(),
      environment: "production",
      version: "1.0.0"
    }
  });
  
  // Notify user
  await notifyUserNeedsClarification(trip.user_id, trip.trip_id, clarificationNeeded);
  
  return { success: true, trip };
}
```

#### ESCALATE Action

```javascript
// Escalate to senior admin
export async function escalateTrip(tripId, adminId, adminEmail, notes, escalationTarget) {
  const trip = await loadTrip(tripId);
  
  // Update state
  trip.state.previous_state = trip.state.current_state;
  trip.state.current_state = "escalated";
  trip.state.state_history.push({
    state: "escalated",
    entered_at: new Date().toISOString(),
    reason: "admin_escalation"
  });
  
  // Update admin_context.approval
  trip.admin_context.approval.status = "ESCALATED";
  trip.admin_context.approval.decided_by = adminId;
  trip.admin_context.approval.decided_at = new Date().toISOString();
  trip.admin_context.approval.notes = notes;
  trip.admin_context.approval.decision_reason = "escalation_required";
  
  // Update admin_context.execution
  trip.admin_context.execution.status = "IN_PROGRESS";
  trip.admin_context.execution.action = "escalate";
  trip.admin_context.execution.executed_by = adminId;
  trip.admin_context.execution.executed_at = new Date().toISOString();
  trip.admin_context.execution.result = {
    escalated_to: escalationTarget,
    original_admin: adminId
  };
  
  // Save trip
  await saveTrip(trip);
  
  // Update admin queue with higher priority
  await updateAdminQueue(tripId, {
    state: { current_state: "escalated" },
    priority: "critical",
    context: { 
      escalated_by: adminId,
      escalated_to: escalationTarget
    }
  });
  
  // Log audit event
  await logAuditEvent({
    tripId: tripId,
    fromState: trip.state.previous_state,
    toState: "escalated",
    event: {
      event_type: "ADMIN_ESCALATE",
      event_category: "ADMIN_ACTION",
      outcome: "SUCCESS"
    },
    actor: {
      actor_id: adminId,
      actor_role: "ADMIN",
      actor_email: adminEmail,
      ipAddress: ""
    },
    admin_context: {
      notes: notes,
      escalation_target: escalationTarget,
      session_id: generateSessionId(),
      environment: "production",
      version: "1.0.0"
    }
  });
  
  // Notify senior admin
  await notifySeniorAdmin(escalationTarget, trip.trip_id, notes);
  
  return { success: true, trip };
}
```

---

## 👁️ TASK 3: WHAT ADMINS SEE

### Admin Queue View

From [adminSurfaces.js](src/backend/etas/adminSurfaces.js) - `getAdminQueue()`:

```javascript
// Admin sees filtered queue entries
const queueEntry = {
  // Trip identification
  tripId: "trip_001",
  userId: "user_123",
  
  // Current state
  state: {
    current_state: "pending_approval",
    time_in_state: 3600000,  // milliseconds
    state_entered_at: "2025-01-20T17:00:00Z"
  },
  
  // Priority and urgency
  priority: "high",           // From STATE_PRIORITY_MAPPING
  queue_section: "NEEDS_ACTION",
  
  // Admin context (what admin needs to see)
  context: {
    // Approval status
    approval_status: "PENDING",
    
    // SENTINEL assessment
    sentinel_risk_level: "HIGH",
    sentinel_risk_score: 75,
    sentinel_flags: ["unusual_route", "late_night_pickup"],
    
    // Tier information
    tier_name: "corporate",
    tier_locked: true,
    
    // Failure information (if applicable)
    failure_count: 0,
    failure_type: null,
    last_failure_reason: null,
    
    // Retry information
    retry_count: 0,
    max_retries_reached: false,
    
    // Automation status
    automation_eligible: false,
    automation_reason: "sentinel_flag_present"
  },
  
  // Trip details (minimal, for context)
  trip_summary: {
    pickup_address: "123 Main St",
    dropoff_address: "456 Oak Ave",
    pickup_datetime: "2025-01-21T18:30:00Z",
    passengers: 2,
    estimated_cost: "$45.00"
  },
  
  // Metadata
  created_at: "2025-01-20T16:00:00Z",
  updated_at: "2025-01-20T17:00:00Z"
};
```

### Admin Detail View

When admin clicks on a trip in queue:

```javascript
// Full trip object displayed
{
  // HEADER: Trip identification
  trip_id: "trip_001",
  user_id: "user_123",
  user_email: "user@example.com",
  
  // STATE PANEL
  state: {
    current_state: "pending_approval",
    previous_state: "submitted",
    time_in_state: "1 hour ago",
    state_history: [
      {
        state: "draft",
        entered_at: "2025-01-20T15:00:00Z",
        reason: "trip_created"
      },
      {
        state: "submitted",
        entered_at: "2025-01-20T16:00:00Z",
        reason: "user_submission"
      },
      {
        state: "pending_approval",
        entered_at: "2025-01-20T17:00:00Z",
        reason: "sentinel_flag_present"
      }
    ]
  },
  
  // SENTINEL PANEL (key decision factor)
  sentinel_snapshot: {
    risk_score: 75,
    risk_level: "HIGH",
    flags: [
      {
        flag: "unusual_route",
        severity: "MEDIUM",
        explanation: "Route deviates from typical pattern for this user"
      },
      {
        flag: "late_night_pickup",
        severity: "HIGH",
        explanation: "Pickup time is 2:30 AM"
      }
    ],
    timestamp: "2025-01-20T17:00:00Z",
    version: "1.0.0"
  },
  
  // ADMIN CONTEXT PANEL (decision tracking)
  admin_context: {
    approval: {
      status: "PENDING",
      decided_by: null,
      decided_at: null,
      notes: "",
      decision_reason: ""
    },
    automation: {
      eligible: false,
      reason: "sentinel_flag_present",
      checked_at: "2025-01-20T17:00:00Z"
    },
    execution: {
      status: "NOT_STARTED",
      action: null,
      executed_by: null,
      executed_at: null,
      result: {}
    },
    failure: {
      count: 0,
      last_failure_at: null,
      last_failure_reason: "",
      failure_type: null
    },
    retries: {
      count: 0,
      last_retry_at: null,
      max_retries_reached: false
    }
  },
  
  // TRIP DETAILS PANEL
  pickup: {
    address: "123 Main St, City, State 12345",
    datetime: "2025-01-21T02:30:00Z",
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  dropoff: {
    address: "456 Oak Ave, City, State 12345",
    coordinates: { lat: 40.7580, lng: -73.9855 }
  },
  tier: {
    name: "corporate",
    source: "user_profile",
    locked: true
  },
  passengers: 2,
  luggage: 1,
  estimated_cost: "$45.00",
  
  // USER HISTORY PANEL (if available)
  user_trip_history: {
    total_trips: 15,
    completed_trips: 12,
    cancelled_trips: 2,
    rejected_trips: 1,
    average_risk_score: 20,
    last_trip_date: "2025-01-15T10:00:00Z"
  },
  
  // AUDIT TRAIL PANEL (recent events)
  recent_audit_events: [
    {
      timestamp: "2025-01-20T17:00:00Z",
      event_type: "SENTINEL_REVIEW_REQUIRED",
      actor_role: "SYSTEM",
      outcome: "SUCCESS"
    },
    {
      timestamp: "2025-01-20T16:00:00Z",
      event_type: "TRIP_SUBMITTED",
      actor_role: "USER",
      outcome: "SUCCESS"
    }
  ],
  
  // ACTIONS PANEL (from adminSurfaces.js ALLOWED_ACTIONS)
  available_actions: [
    {
      action: "approve",
      label: "Approve Trip",
      requiresNotes: false,
      buttonStyle: "primary"
    },
    {
      action: "reject",
      label: "Reject Trip",
      requiresNotes: true,
      buttonStyle: "danger"
    },
    {
      action: "clarify",
      label: "Request Clarification",
      requiresNotes: true,
      buttonStyle: "secondary"
    },
    {
      action: "escalate",
      label: "Escalate to Senior Admin",
      requiresNotes: true,
      buttonStyle: "warning"
    }
  ]
}
```

---

## 📝 TASK 4: AUDIT GUARANTEES

### Immutability Rules

From [tripDatabase.js](src/backend/etas/tripDatabase.js):

```javascript
// Audit events default to immutable unless explicitly specified otherwise
const auditEntry = {
  // ... event data ...
  immutable: eventData.immutable || true,  // Defaults to true if not specified
  retentionPolicy: "STANDARD"  // STANDARD | EXTENDED | PERMANENT | LEGAL_HOLD
};

// Most audit events should be immutable for compliance and audit integrity.
// However, the system allows explicit override (immutable: false) for special cases.
// Example: Draft events or test events that may need modification.

// Wix Data Collection: AuditLog
// Permissions:
// - Create: Backend only (via logAuditEvent())
// - Update: None (for immutable events)
// - Delete: Admin only (manual, for compliance)
```

### Required Audit Fields

Every audit event MUST have:

```javascript
{
  // REQUIRED - Identity
  auditId: "UUID",                    // generateUUID()
  timestamp: "ISO8601",               // When it happened
  
  // OPTIONAL - Trip association (empty string if not trip-related)
  // Future: Will also log user account/profile events without trip_id
  tripId: "trip_001",                 // Which trip (empty string for non-trip events)
  
  // REQUIRED - State transition
  fromState: "submitted",             // Where it came from (null for create)
  toState: "pending_approval",        // Where it went
  
  // REQUIRED - Event metadata
  event: {
    event_type: "SENTINEL_REVIEW_REQUIRED",  // From eventTypes.js
    event_category: "SYSTEM_ACTION",         // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
    outcome: "SUCCESS"                       // SUCCESS | FAILURE | PARTIAL | PENDING
  },
  
  // REQUIRED - Actor information
  actor: {
    actor_id: "admin_123",            // Who/what did it
    actor_role: "ADMIN",              // USER | ADMIN | SENIOR_ADMIN | SYSTEM
    actor_email: "admin@example.com", // Email (null for SYSTEM)
    ipAddress: "192.168.1.1"          // IP address (empty string if N/A)
  },
  
  // OPTIONAL - Admin context (for admin actions only)
  adminContext: {
    notes: "...",                     // Admin reasoning
    override_reason: "...",           // Why override needed
    user_contacted: false,            // Was user notified
    escalation_target: null,          // Who was escalated to
    resolution_notes: null,           // How resolved
    session_id: "sess_...",           // Session identifier
    environment: "production",        // production | staging | dev
    version: "1.0.0"                  // System version
  },
  
  // REQUIRED - Retention and compliance
  retentionPolicy: "STANDARD",        // Retention class
  complianceTags: [],                 // Compliance tags (e.g., ["PII", "FINANCIAL"])
  immutable: true                     // Defaults to true, can be explicitly set to false
}
```

### Event Type Categories

From [eventTypes.js](src/backend/etas/eventTypes.js):

```javascript
export const AUDIT_EVENT_TYPES = {
  // USER_ACTION events (9 events)
  USER_ACTION: {
    TRIP_CREATED: "TRIP_CREATED",
    TRIP_SUBMITTED: "TRIP_SUBMITTED",
    TRIP_CANCELLED: "TRIP_CANCELLED",
    TRIP_MODIFIED: "TRIP_MODIFIED",
    USER_CLARIFICATION_PROVIDED: "USER_CLARIFICATION_PROVIDED",
    PAYMENT_METHOD_UPDATED: "PAYMENT_METHOD_UPDATED",
    USER_CONTACTED: "USER_CONTACTED",
    USER_NOTIFICATION_SENT: "USER_NOTIFICATION_SENT",
    USER_FEEDBACK_SUBMITTED: "USER_FEEDBACK_SUBMITTED"
  },
  
  // ADMIN_ACTION events (11 events)
  ADMIN_ACTION: {
    ADMIN_APPROVE_TRIP: "ADMIN_APPROVE_TRIP",
    ADMIN_REJECT_TRIP: "ADMIN_REJECT_TRIP",
    ADMIN_REQUEST_CLARIFICATION: "ADMIN_REQUEST_CLARIFICATION",
    ADMIN_ESCALATE: "ADMIN_ESCALATE",
    ADMIN_RESOLVE_ESCALATION: "ADMIN_RESOLVE_ESCALATION",
    ADMIN_OVERRIDE_APPROVAL: "ADMIN_OVERRIDE_APPROVAL",
    ADMIN_RETRY_FAILED: "ADMIN_RETRY_FAILED",
    ADMIN_UPDATE_TIER: "ADMIN_UPDATE_TIER",
    ADMIN_UPDATE_CONTEXT: "ADMIN_UPDATE_CONTEXT",
    ADMIN_VIEW_TRIP: "ADMIN_VIEW_TRIP",
    ADMIN_EXPORT_DATA: "ADMIN_EXPORT_DATA"
  },
  
  // SYSTEM_ACTION events (28 events)
  SYSTEM_ACTION: {
    VALIDATION_STARTED: "VALIDATION_STARTED",
    VALIDATION_PASSED: "VALIDATION_PASSED",
    VALIDATION_FAILED: "VALIDATION_FAILED",
    SENTINEL_ASSESSMENT_STARTED: "SENTINEL_ASSESSMENT_STARTED",
    SENTINEL_ASSESSMENT_COMPLETED: "SENTINEL_ASSESSMENT_COMPLETED",
    SENTINEL_REVIEW_REQUIRED: "SENTINEL_REVIEW_REQUIRED",
    AUTOMATION_CHECK_PASSED: "AUTOMATION_CHECK_PASSED",
    AUTOMATION_CHECK_FAILED: "AUTOMATION_CHECK_FAILED",
    AUTO_APPROVAL_GRANTED: "AUTO_APPROVAL_GRANTED",
    BOOKING_STARTED: "BOOKING_STARTED",
    BOOKING_SUCCESSFUL: "BOOKING_SUCCESSFUL",
    BOOKING_FAILED: "BOOKING_FAILED",
    PAYMENT_STARTED: "PAYMENT_STARTED",
    PAYMENT_SUCCESSFUL: "PAYMENT_SUCCESSFUL",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    RETRY_INITIATED: "RETRY_INITIATED",
    RETRY_SUCCESSFUL: "RETRY_SUCCESSFUL",
    RETRY_FAILED: "RETRY_FAILED",
    MAX_RETRIES_REACHED: "MAX_RETRIES_REACHED",
    STATE_TRANSITION: "STATE_TRANSITION",
    QUEUE_ADDED: "QUEUE_ADDED",
    QUEUE_UPDATED: "QUEUE_UPDATED",
    QUEUE_REMOVED: "QUEUE_REMOVED",
    NOTIFICATION_SENT: "NOTIFICATION_SENT",
    NOTIFICATION_FAILED: "NOTIFICATION_FAILED",
    ERROR_OCCURRED: "ERROR_OCCURRED",
    SYSTEM_OVERRIDE: "SYSTEM_OVERRIDE",
    DATA_EXPORT: "DATA_EXPORT"
  }
};
```

### Audit Query Examples

```javascript
// Get all admin actions for a trip
const adminActions = await wixData.query("AuditLog")
  .eq("tripId", tripId)
  .eq("event.event_category", "ADMIN_ACTION")
  .descending("timestamp")
  .find();

// Get all rejections by a specific admin
const rejections = await wixData.query("AuditLog")
  .eq("event.event_type", "ADMIN_REJECT_TRIP")
  .eq("actor.actor_id", adminId)
  .descending("timestamp")
  .find();

// Get state transition history for a trip
const transitions = await wixData.query("AuditLog")
  .eq("tripId", tripId)
  .isNotEmpty("fromState")
  .isNotEmpty("toState")
  .ascending("timestamp")
  .find();

// Get all escalations
const escalations = await wixData.query("AuditLog")
  .eq("event.event_type", "ADMIN_ESCALATE")
  .descending("timestamp")
  .find();
```

---

## 🔄 TASK 5: LIFECYCLE INTEGRATION

### State Machine With Admin Actions

```
[draft] 
  → (user submits) → 
[submitted]
  → (validation) → 
[validated]
  → (SENTINEL assessment) →
  
  IF sentinel_risk_level = HIGH/CRITICAL OR sentinel_flags.length > 0 OR tier = executive:
    → [pending_approval] ← ADMIN ENTRY POINT
        ↓
        ADMIN ACTIONS:
        - approve → [approved]
        - reject → [rejected]
        - clarify → [needs_adjustment] → (user fixes) → [submitted] (loop)
        - escalate → [escalated] → (senior admin resolves) → [approved] or [rejected]
  
  ELSE:
    → (auto-approval) → [approved]
    
[approved]
  → (booking API call) →
  
  IF booking succeeds:
    → [booked]
  ELSE:
    → [failed] ← ADMIN ENTRY POINT
        ↓
        ADMIN ACTIONS:
        - retry → [submitted] (retry booking)
        - override → [approved] (manual booking)
        - reject → [rejected] (give up)
        
[booked]
  → (trip occurs) → [completed]
  
[rejected]
  → (terminal state)
  
[cancelled]
  → (user/system cancellation) → (terminal state)
```

### Admin Decision Outcomes

#### Outcome: APPROVED

```javascript
// State transitions
"pending_approval" → "approved"

// admin_context updates
{
  approval: {
    status: "APPROVED",
    decided_by: "admin_123",
    decided_at: "2025-01-20T18:00:00Z",
    notes: "Low risk after review",
    decision_reason: "manual_approval"
  },
  execution: {
    status: "COMPLETED",
    action: "approve",
    executed_by: "admin_123",
    executed_at: "2025-01-20T18:00:00Z",
    result: { approved: true, method: "manual" }
  }
}

// Next step in lifecycle
→ Proceed to booking (executeTrip.js)
```

#### Outcome: REJECTED

```javascript
// State transitions
"pending_approval" → "rejected"

// admin_context updates
{
  approval: {
    status: "REJECTED",
    decided_by: "admin_123",
    decided_at: "2025-01-20T18:00:00Z",
    notes: "Policy violation: prohibited route",
    decision_reason: "policy_violation"
  },
  execution: {
    status: "COMPLETED",
    action: "reject",
    executed_by: "admin_123",
    executed_at: "2025-01-20T18:00:00Z",
    result: { rejected: true, reason: "policy_violation" }
  }
}

// Next step in lifecycle
→ Terminal state, notify user of rejection
```

#### Outcome: NEEDS_CLARIFICATION

```javascript
// State transitions
"pending_approval" → "needs_adjustment"

// admin_context updates
{
  approval: {
    status: "NEEDS_CLARIFICATION",
    decided_by: "admin_123",
    decided_at: "2025-01-20T18:00:00Z",
    notes: "Need passenger count confirmation",
    decision_reason: "clarification_needed"
  },
  execution: {
    status: "COMPLETED",
    action: "clarify",
    executed_by: "admin_123",
    executed_at: "2025-01-20T18:00:00Z",
    result: {
      clarification_needed: ["passenger_count", "luggage_count"],
      user_contacted: true
    }
  }
}

// Next step in lifecycle
→ User receives notification, updates trip, resubmits
→ Loop back to "submitted" → validation → SENTINEL → (possibly) pending_approval again
```

#### Outcome: ESCALATED

```javascript
// State transitions
"pending_approval" → "escalated"

// admin_context updates
{
  approval: {
    status: "ESCALATED",
    decided_by: "admin_123",
    decided_at: "2025-01-20T18:00:00Z",
    notes: "Requires senior admin review due to executive tier",
    decision_reason: "escalation_required"
  },
  execution: {
    status: "IN_PROGRESS",
    action: "escalate",
    executed_by: "admin_123",
    executed_at: "2025-01-20T18:00:00Z",
    result: {
      escalated_to: "senior_admin_456",
      original_admin: "admin_123"
    }
  }
}

// Next step in lifecycle
→ Senior admin reviews, makes final decision (approve/reject)
→ Elevated priority in admin queue
```

### Failure Recovery With Admin Oversight

```javascript
// Trip fails during booking
[approved] → (booking fails) → [failed]

// System adds to admin queue
await addToAdminQueue(trip, {
  priority: "critical",
  reason: "booking_failure"
});

// Admin sees failure context
{
  state: { current_state: "failed" },
  admin_context: {
    failure: {
      count: 1,
      last_failure_at: "2025-01-20T18:30:00Z",
      last_failure_reason: "API timeout",
      failure_type: "booking"
    },
    retries: {
      count: 0,
      last_retry_at: null,
      max_retries_reached: false
    }
  }
}

// Admin options:
// 1. RETRY: System retries booking automatically
await retryFailedBooking(tripId, adminId);
// → [failed] → [submitted] → (retry booking) → [booked] (success)

// 2. OVERRIDE: Admin manually books externally, marks as approved
await overrideAndApprove(tripId, adminId, "Manually booked via phone");
// → [failed] → [approved] → (skip booking API) → [booked]

// 3. REJECT: Give up, refund user
await rejectTrip(tripId, adminId, "Unable to complete booking after multiple attempts", "booking_impossible");
// → [failed] → [rejected]
```

---

## 🔐 AUTHORIZATION RULES

### Admin Role Hierarchy

```javascript
export const ADMIN_ROLES = {
  ADMIN: {
    role: "ADMIN",
    canApprove: true,
    canReject: true,
    canClarify: true,
    canEscalate: true,
    canOverride: false,        // Cannot override system decisions
    canViewAll: true,
    maxTierAllowed: "corporate"  // Can handle up to corporate tier
  },
  
  SENIOR_ADMIN: {
    role: "SENIOR_ADMIN",
    canApprove: true,
    canReject: true,
    canClarify: true,
    canEscalate: false,        // Already at top
    canOverride: true,         // Can override system decisions
    canViewAll: true,
    maxTierAllowed: "executive"  // Can handle executive tier
  }
};

// Authorization check example
function canAdminPerformAction(adminRole, action, trip) {
  const roleConfig = ADMIN_ROLES[adminRole];
  
  // Check tier authorization
  if (trip.tier.name === "executive" && roleConfig.maxTierAllowed !== "executive") {
    return {
      allowed: false,
      reason: "executive_tier_requires_senior_admin"
    };
  }
  
  // Check action permission
  if (action === "override" && !roleConfig.canOverride) {
    return {
      allowed: false,
      reason: "override_requires_senior_admin"
    };
  }
  
  return { allowed: true };
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend Implementation

- [x] Trip schema includes admin_context (Lee's implementation)
- [x] State machine supports admin states (pending_approval, escalated, failed)
- [x] Admin queue collection exists (AdminQueue)
- [x] Audit log collection exists (AuditLog)
- [x] tripDatabase.js implements saveTrip(), loadTrip(), addToAdminQueue(), logAuditEvent()
- [x] eventTypes.js defines all audit event types
- [ ] approveTrip.js implements approve/reject/clarify/escalate actions
- [ ] Admin authorization checks in place
- [ ] Admin notification system (email/dashboard alerts)
- [ ] User notification system (rejection reasons, clarification requests)

### Frontend Implementation

- [ ] Admin dashboard page (queue view)
- [ ] Admin trip detail page (full context + actions)
- [ ] Admin action forms (approve, reject, clarify, escalate with notes)
- [ ] Admin queue filters (by state, priority, tier)
- [ ] Admin audit trail view (per trip + global search)
- [ ] Real-time queue updates (WebSocket/polling)
- [ ] Admin role-based access control (hide actions based on role)

### Testing

- [ ] Unit tests for admin actions (approve, reject, clarify, escalate)
- [ ] Integration tests for state transitions
- [ ] Audit log completeness tests
- [ ] Authorization tests (role-based permissions)
- [ ] Queue prioritization tests
- [ ] Failure recovery tests

---

## 🎯 SUCCESS CRITERIA

You can say **"Day 14 is complete"** when:

1. ✅ **Human review triggers are deterministic** - No ambiguity about when admin approval is required
2. ✅ **Admin actions are well-defined** - approve, reject, clarify, escalate with clear outcomes
3. ✅ **Admin context is aligned with Lee's schema** - Uses admin_context{approval, automation, execution, failure, retries}
4. ✅ **Audit events use Lee's structure** - event{}, actor{}, adminContext{} with required fields
5. ✅ **Lifecycle integration is clear** - Admin decisions transition trips through state machine correctly
6. ✅ **Authorization rules are defined** - ADMIN vs SENIOR_ADMIN permissions
7. ✅ **All field names match Lee's implementation** - No speculative schemas

---

## 📚 RELATED DOCUMENTATION

- [SPRINT_1_DATABASE_API.md](SPRINT_1_DATABASE_API.md) - Lee's database API implementation
- [SPRINT_1_WIX_DATABASES.md](SPRINT_1_WIX_DATABASES.md) - Lee's database schema
- [eventTypes.js](../src/backend/etas/eventTypes.js) - Lee's event type definitions
- [tripDatabase.js](../src/backend/etas/tripDatabase.js) - Lee's database operations (429 lines)
- [adminSurfaces.js](../src/backend/etas/adminSurfaces.js) - Lee's admin queue config (1137 lines)
- [DAY_9_ADMIN_SURFACES.md](DAY_9_ADMIN_SURFACES.md) - Admin queue requirements (Day 9)
- [SCHEMA_RECONCILIATION.md](SCHEMA_RECONCILIATION.md) - Schema conflict resolution

---

**Day 14 Status:** ✅ **COMPLETE** (Aligned with Sprint 1 Implementation)  
**Date:** January 2025  
**Next Steps:** Implement approveTrip.js with approve/reject/clarify/escalate functions

