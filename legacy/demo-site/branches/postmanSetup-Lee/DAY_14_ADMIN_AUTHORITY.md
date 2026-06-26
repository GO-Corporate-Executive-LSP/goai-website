
# Day 14 — Admin Decision Paths & Human Authority

**Document Date**: January 21, 2026  
**Sprint**: V1 Day 14 — Governance & Human Authority  
**Purpose**: Lock when, how, and why humans intervene in trip decisions  
**Status**: ✅ Complete

---

## 🎯 Purpose of This Document

This document defines **exactly when human approval is required** and **exactly what humans are allowed to do** in the ETAS system.

**Core Principles:**
- ✅ Human review is **conditional**, not default
- ✅ Admin authority is **bounded** and **explicit**
- ✅ Every decision is **auditable** and **immutable**
- ✅ No informal trip changes allowed

**Key Question Answered:**
> "When does a human step in, what are they allowed to do, and how is that decision enforced and recorded by the system?"

---

## 🚦 Admin Review Entry Conditions

### When a Trip Requires Human Review

Human review is **triggered by deterministic conditions**. These are not vague rules—they are explicit, testable triggers.

#### Trigger Categories

| Trigger Category | Specific Condition | Example | Priority |
|------------------|-------------------|---------|----------|
| **SENTINEL Risk Flag** | `risk_level === "orange"` OR `risk_level === "red"` | New user + unusual destination + high tier | HIGH |
| **SENTINEL Confidence** | `confidence < 0.70` (below trust threshold) | SENTINEL uncertain about risk assessment | MEDIUM |
| **Multiple Anomalies** | `anomalies.length >= 3` | Late night + new user + high value + unusual location | HIGH |
| **Validation Blocked** | `validation.status === "BLOCKED"` | Restricted destination, policy violation | CRITICAL |
| **Tier Capacity Override** | Passenger count exceeds tier, user requests exception | 7 passengers on BASIC tier | MEDIUM |
| **High-Value Transaction** | `estimated_cost > $500` (configurable threshold) | Executive tier long-distance trip | MEDIUM |
| **Policy Exception Request** | User explicitly requests same-day booking (normally 2hr minimum) | Pickup in 30 minutes | HIGH |
| **Payment Anomaly** | Multiple payment failures, suspicious payment method | Card declined 3 times, different billing address | HIGH |
| **SENTINEL Unavailable** | SENTINEL API timeout or error | External API failure, fallback to manual review | MEDIUM |
| **Execution Failure** | Max retries exhausted, manual intervention needed | Payment failed 3 times | HIGH |
| **Tier-Mandated Review** | EXECUTIVE tier requires approval (tier policy) | All EXECUTIVE trips require oversight | LOW |
| **New User (First Trip)** | `user.trip_count === 0` AND `user.account_age_days < 7` | Account created yesterday, first booking | MEDIUM |
| **Return Trip Logic Error** | Return pickup time before initial dropoff | Impossible timeline detected | MEDIUM |

#### Trigger Logic (Deterministic)

```javascript
// src/backend/etas/humanReviewRules.js

/**
 * Determine if a trip requires human review
 * @param {Object} trip - Trip object with validation and SENTINEL data
 * @returns {Object} Review decision with reason and priority
 */
export function requiresHumanReview(trip) {
  const reasons = [];
  let priority = "LOW";
  
  // Trigger 1: SENTINEL risk flag
  if (trip.sentinel_snapshot?.risk_level === "orange") {
    reasons.push("sentinel_orange_flag");
    priority = "HIGH";
  }
  if (trip.sentinel_snapshot?.risk_level === "red") {
    reasons.push("sentinel_red_flag");
    priority = "CRITICAL";
  }
  
  // Trigger 2: Low SENTINEL confidence
  if (trip.sentinel_snapshot?.confidence < 0.70) {
    reasons.push("sentinel_low_confidence");
    priority = priority === "LOW" ? "MEDIUM" : priority;
  }
  
  // Trigger 3: Multiple anomalies
  if (trip.sentinel_snapshot?.anomalies?.length >= 3) {
    reasons.push("multiple_anomalies");
    priority = "HIGH";
  }
  
  // Trigger 4: Validation blocked
  if (trip.validation?.status === "BLOCKED") {
    reasons.push("validation_blocked");
    priority = "CRITICAL";
  }
  
  // Trigger 5: Tier capacity override request
  if (trip.override_requested?.tier_capacity === true) {
    reasons.push("tier_capacity_override");
    priority = "MEDIUM";
  }
  
  // Trigger 6: High-value transaction
  if (trip.estimated_cost > 500) {
    reasons.push("high_value_transaction");
    priority = priority === "LOW" ? "MEDIUM" : priority;
  }
  
  // Trigger 7: Policy exception
  if (trip.policy_exception_requested === true) {
    reasons.push("policy_exception");
    priority = "HIGH";
  }
  
  // Trigger 8: Payment anomaly
  if (trip.payment?.failure_count >= 3) {
    reasons.push("payment_anomaly");
    priority = "HIGH";
  }
  
  // Trigger 9: SENTINEL unavailable
  if (trip.sentinel_snapshot?.evaluation_status === "FAILED") {
    reasons.push("sentinel_unavailable");
    priority = priority === "LOW" ? "MEDIUM" : priority;
  }
  
  // Trigger 10: Execution failure escalation
  if (trip.execution?.retry_count >= 3 && trip.execution?.status === "FAILED") {
    reasons.push("execution_max_retries");
    priority = "HIGH";
  }
  
  // Trigger 11: Tier-mandated review (EXECUTIVE)
  if (trip.tier?.name === "executive") {
    reasons.push("tier_mandated_review");
    priority = priority === "LOW" ? "LOW" : priority;
  }
  
  // Trigger 12: New user first trip
  if (trip.user_context?.trip_count === 0 && trip.user_context?.account_age_days < 7) {
    reasons.push("new_user_first_trip");
    priority = priority === "LOW" ? "MEDIUM" : priority;
  }
  
  return {
    requires_review: reasons.length > 0,
    reasons: reasons,
    priority: priority,
    auto_approve_eligible: reasons.length === 0
  };
}
```

#### Decision Flow

```
Trip Submitted
      ↓
Validation Passes
      ↓
SENTINEL Evaluation
      ↓
Check Review Triggers
      ↓
   Any Triggers?
      ↓
    ┌─Yes──────────────No─┐
    ↓                     ↓
Add to Admin Queue    Auto-Approve
(Human Review)        (Continue)
    ↓                     ↓
Await Admin Action    Execute Trip
```

### Non-Triggers (Explicit Exclusions)

These do **NOT** trigger human review:

- ❌ SENTINEL `risk_level === "green"` (high confidence)
- ❌ SENTINEL `risk_level === "yellow"` (moderate confidence, no other flags)
- ❌ Standard booking window (≥2 hours advance)
- ❌ Tier capacity within limits
- ❌ Established user with clean history
- ❌ Payment success on first attempt
- ❌ No policy exceptions requested

**Principle**: If validation passes and no triggers fire, the trip auto-approves.

---

## 🔐 Admin Actions (Authority Boundaries)

### What Admins Can Do

Admins have **exactly three actions** available when reviewing a trip:

| Admin Action | Symbol | Effect on Trip | Execution Allowed | Required Fields | Logged |
|--------------|--------|----------------|-------------------|-----------------|--------|
| **Approve** | ✅ | `state` → `approved`, `approval.status` → `APPROVED` | ✅ Yes (proceeds to execution) | Admin ID, timestamp, optional notes | ✅ Yes (`ADMIN_APPROVED`) |
| **Reject** | ❌ | `state` → `cancelled`, `approval.status` → `REJECTED` | ❌ No (trip terminated) | Admin ID, timestamp, **required reason/notes** | ✅ Yes (`ADMIN_REJECTED`) |
| **Request Clarification** | 🔁 | `state` → `draft`, `approval.status` → `NEEDS_ADJUSTMENT` | ❌ No (returns to user) | Admin ID, timestamp, **required clarification request** | ✅ Yes (`ADMIN_REQUESTED_CHANGES`) |

### Action Details

#### 1. Approve ✅

**When Used**: Admin reviews trip context and determines it is safe to proceed.

**System Behavior**:
```javascript
// Before
trip.state = "pending_approval"
trip.approval.status = ""

// After Admin Approval
trip.state = "approved"
trip.approval.status = "APPROVED"
trip.approval.decided_by = "admin@example.com"
trip.approval.decided_at = "2026-01-21T10:30:00Z"
trip.approval.notes = "Verified user identity via phone. Legitimate booking."
```

**Audit Log Entry**:
```javascript
{
  event_type: "ADMIN_APPROVED",
  trip_id: "TRP_12345",
  actor_id: "admin@example.com",
  actor_role: "ADMIN",
  timestamp: "2026-01-21T10:30:00Z",
  previous_state: { state: "pending_approval", approval: { status: "" } },
  new_state: { state: "approved", approval: { status: "APPROVED" } },
  context: {
    review_reason: "sentinel_orange_flag",
    decision_rationale: "Verified user identity via phone",
    sentinel_flag: "orange",
    sentinel_confidence: 0.55
  }
}
```

**Execution Eligibility**: ✅ Trip proceeds to execution queue

**Reversibility**: ❌ Approval is final (cannot be undone without creating new trip)

---

#### 2. Reject ❌

**When Used**: Admin determines trip cannot be serviced (policy violation, safety concern, restricted destination, etc.)

**System Behavior**:
```javascript
// Before
trip.state = "pending_approval"
trip.approval.status = ""

// After Admin Rejection
trip.state = "cancelled"
trip.approval.status = "REJECTED"
trip.approval.decided_by = "admin@example.com"
trip.approval.decided_at = "2026-01-21T10:35:00Z"
trip.approval.notes = "Cannot service this destination per company policy. Please contact support."
```

**Required Fields**:
- ✅ `decided_by` (admin ID) — **required**
- ✅ `decided_at` (timestamp) — **required**
- ✅ `notes` (rejection reason) — **required** (cannot reject without explanation)

**Audit Log Entry**:
```javascript
{
  event_type: "ADMIN_REJECTED",
  trip_id: "TRP_12345",
  actor_id: "admin@example.com",
  actor_role: "ADMIN",
  timestamp: "2026-01-21T10:35:00Z",
  previous_state: { state: "pending_approval" },
  new_state: { state: "cancelled", approval: { status: "REJECTED" } },
  context: {
    rejection_reason: "restricted_destination",
    admin_notes: "Cannot service this destination per company policy",
    sentinel_flag: "yellow",
    policy_reference: "RESTRICTED_LOCATIONS_V1"
  }
}
```

**Execution Eligibility**: ❌ Trip does NOT proceed to execution (terminated)

**Reversibility**: ❌ Rejection is final (user must submit new trip)

**User Notification**: Calm, professional message (no technical details)
> "We couldn't complete your booking. Please contact support for assistance."

---

#### 3. Request Clarification 🔁

**When Used**: Admin needs more information from user before making a decision.

**System Behavior**:
```javascript
// Before
trip.state = "pending_approval"
trip.approval.status = ""

// After Clarification Request
trip.state = "draft"
trip.approval.status = "NEEDS_ADJUSTMENT"
trip.approval.decided_by = "admin@example.com"
trip.approval.decided_at = "2026-01-21T10:40:00Z"
trip.approval.notes = "Please provide a more specific pickup address. Current address is too vague for routing."
```

**Required Fields**:
- ✅ `decided_by` (admin ID) — **required**
- ✅ `decided_at` (timestamp) — **required**
- ✅ `notes` (clarification request) — **required** (must explain what user needs to fix)

**Audit Log Entry**:
```javascript
{
  event_type: "ADMIN_REQUESTED_CHANGES",
  trip_id: "TRP_12345",
  actor_id: "admin@example.com",
  actor_role: "ADMIN",
  timestamp: "2026-01-21T10:40:00Z",
  previous_state: { state: "pending_approval" },
  new_state: { state: "draft", approval: { status: "NEEDS_ADJUSTMENT" } },
  context: {
    clarification_needed: "pickup_address_vague",
    admin_notes: "Please provide a more specific pickup address",
    user_notified: true
  }
}
```

**Execution Eligibility**: ❌ Trip returns to draft (user must resubmit after changes)

**Reversibility**: ✅ User can edit and resubmit (trip re-enters approval queue)

**User Notification**: Actionable guidance
> "Your trip request needs a few updates. Please provide a more specific pickup address."

---

### What Admins CANNOT Do

**Admins are explicitly prohibited from:**

❌ **Editing trip details directly** (pickup address, time, passengers, etc.)
- Reason: Prevents unauthorized modifications
- If changes needed: Admin requests clarification → user edits → resubmits

❌ **Bypassing validation** (approving invalid trips)
- Reason: Validation is a hard gate
- If validation blocked: Admin can only reject or escalate to Senior Admin for override

❌ **Modifying audit logs** (editing past decisions)
- Reason: Audit trail must be immutable
- Audit entries are append-only

❌ **Changing trip tier** (upgrading/downgrading service level)
- Reason: Tier is locked once resolved
- If tier change needed: User must cancel and create new trip

❌ **Approving without reviewing context** (rubber-stamping)
- Reason: Admin decisions must be informed
- System presents full context (SENTINEL data, user history, anomalies)

❌ **Reversing their own decisions** (changing approve → reject after submission)
- Reason: Decisions are final
- If mistake: Requires new trip or Senior Admin intervention

**Principle**: Admins approve or deny **states**, not data. They do not edit trips.

---

## 🏛️ Approval Authority Rules (V1)

### Who Can Approve

**Role-Based Authority**:

| Role | Approval Authority | Constraints |
|------|-------------------|-------------|
| **USER** | ❌ Cannot approve trips | Can only submit and cancel own trips |
| **ADMIN** | ✅ Can approve/reject trips in queue | Must be trained, active account, audit trail required |
| **SENIOR ADMIN** | ✅ Can approve + override validation blocks | Overrides require written justification |
| **SYSTEM** | ✅ Can auto-approve (when eligible) | Bound by automation rules, no override capability |

### Approval Model (V1)

**Single-Party Approval**:
- ✅ One admin approval is sufficient
- ✅ No multi-party sign-off required (V1 simplification)
- ✅ Admin assumes full responsibility for decision

**Future Consideration** (Post-V1):
- Multi-party approval for high-value transactions (>$1000)
- Escalation paths for Senior Admin review
- Regional admin specialization (location-based routing)

### Approval Finality

**Decisions Are Final**:
- ✅ Once approved, trip proceeds to execution (cannot be un-approved)
- ✅ Once rejected, trip is cancelled (cannot be un-rejected)
- ✅ No "pending reconsideration" state in V1

**Reversal Requires**:
1. Trip cancellation (if approved but not executed)
2. User submits new trip
3. New trip goes through full approval process

**Exception**: Senior Admin can override in extraordinary circumstances with full audit justification.

### Approval Conflicts

**Conflict Scenarios** (V1 Handling):

| Scenario | V1 Behavior |
|----------|-------------|
| Two admins review same trip simultaneously | First decision wins (timestamp-based) |
| Admin approves, then user cancels before execution | User cancellation takes precedence (logged) |
| Admin rejects, user disputes | User must contact support (no in-app dispute mechanism in V1) |

**Concurrency Protection**:
```javascript
// Optimistic locking on approval decision
if (trip.approval.decided_at !== null) {
  throw new Error("Trip already reviewed by another admin");
}
```

### Admin Assignment (Optional Enhancement)

**V1**: Trips in queue are unassigned (first-come, first-served)

**Future** (Post-V1):
- Trips can be assigned to specific admins
- SLA tracking per admin
- Load balancing across admin team

---

## 📋 Audit Requirements for Human Decisions

### Audit Event Definitions

Every human decision produces an **immutable audit log entry** with the following structure:

#### 1. Admin Approval Event

```javascript
{
  // Audit Entry Metadata
  "_id": "aud_20260121_103000_xyz",
  "timestamp": "2026-01-21T10:30:00Z",
  "event_type": "ADMIN_APPROVED",
  
  // Trip Context
  "trip_id": "TRP_12345",
  "user_id": "USR_789",
  
  // Actor Information
  "actor_id": "admin@example.com",
  "actor_role": "ADMIN",
  "actor_ip": "192.168.1.100",
  "actor_session": "sess_xyz789",
  
  // State Transition
  "previous_state": {
    "state": "pending_approval",
    "approval": { "status": "" }
  },
  "new_state": {
    "state": "approved",
    "approval": {
      "status": "APPROVED",
      "decided_by": "admin@example.com",
      "decided_at": "2026-01-21T10:30:00Z"
    }
  },
  
  // Decision Context
  "context": {
    "review_reason": "sentinel_orange_flag",
    "sentinel_flag": "orange",
    "sentinel_confidence": 0.55,
    "sentinel_anomalies": ["new_user", "unusual_destination"],
    "admin_notes": "Verified user identity via phone. Legitimate booking.",
    "review_duration_seconds": 480
  },
  
  // Compliance
  "retention_policy": "STANDARD",
  "compliance_tags": ["SOC2", "GDPR"],
  "immutable": true
}
```

#### 2. Admin Rejection Event

```javascript
{
  "_id": "aud_20260121_103500_abc",
  "timestamp": "2026-01-21T10:35:00Z",
  "event_type": "ADMIN_REJECTED",
  
  "trip_id": "TRP_12345",
  "user_id": "USR_789",
  
  "actor_id": "admin@example.com",
  "actor_role": "ADMIN",
  
  "previous_state": {
    "state": "pending_approval"
  },
  "new_state": {
    "state": "cancelled",
    "approval": {
      "status": "REJECTED",
      "decided_by": "admin@example.com",
      "decided_at": "2026-01-21T10:35:00Z",
      "notes": "Cannot service this destination per company policy"
    }
  },
  
  "context": {
    "rejection_reason": "restricted_destination",
    "rejection_category": "POLICY_VIOLATION",
    "admin_notes": "Cannot service this destination per company policy",
    "policy_reference": "RESTRICTED_LOCATIONS_V1",
    "user_notified": true,
    "notification_method": "email"
  },
  
  "retention_policy": "EXTENDED",
  "compliance_tags": ["SOC2", "GDPR", "LEGAL_HOLD"],
  "immutable": true
}
```

#### 3. Admin Clarification Request Event

```javascript
{
  "_id": "aud_20260121_104000_def",
  "timestamp": "2026-01-21T10:40:00Z",
  "event_type": "ADMIN_REQUESTED_CHANGES",
  
  "trip_id": "TRP_12345",
  "user_id": "USR_789",
  
  "actor_id": "admin@example.com",
  "actor_role": "ADMIN",
  
  "previous_state": {
    "state": "pending_approval"
  },
  "new_state": {
    "state": "draft",
    "approval": {
      "status": "NEEDS_ADJUSTMENT",
      "decided_by": "admin@example.com",
      "decided_at": "2026-01-21T10:40:00Z",
      "notes": "Please provide a more specific pickup address"
    }
  },
  
  "context": {
    "clarification_needed": "pickup_address_vague",
    "clarification_category": "VALIDATION_IMPROVEMENT",
    "admin_notes": "Current address is too vague for routing",
    "user_notified": true,
    "expected_user_action": "EDIT_TRIP"
  },
  
  "retention_policy": "STANDARD",
  "compliance_tags": ["SOC2"],
  "immutable": true
}
```

### Required Audit Fields

**Minimum required fields** for any human decision audit entry:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `timestamp` | ISO 8601 datetime | ✅ Yes | When decision was made |
| `event_type` | String | ✅ Yes | Type of decision (APPROVED, REJECTED, etc.) |
| `trip_id` | String | ✅ Yes | Which trip was affected |
| `actor_id` | String | ✅ Yes | Who made the decision (admin email/ID) |
| `actor_role` | String | ✅ Yes | Role of decision maker (ADMIN, SENIOR_ADMIN) |
| `previous_state` | Object | ✅ Yes | Trip state before decision |
| `new_state` | Object | ✅ Yes | Trip state after decision |
| `context.admin_notes` | String | ⚠️ Conditional* | Why decision was made |
| `immutable` | Boolean | ✅ Yes | Audit entry cannot be modified (always `true`) |

**\*Conditional Requirements**:
- **Rejection**: `admin_notes` is **required** (cannot reject without explanation)
- **Approval**: `admin_notes` is **optional** (but encouraged)
- **Clarification**: `admin_notes` is **required** (must explain what needs fixing)

### Audit Trail Immutability

**Principle**: Audit logs are **append-only**. Once written, they cannot be modified or deleted.

**Technical Enforcement**:
```javascript
// Audit log write operation
export function logAuditEvent(eventData) {
  // Mark as immutable
  eventData.immutable = true;
  eventData.created_at = new Date().toISOString();
  
  // Write to append-only collection
  return wixData.insert("AuditLog", eventData);
}

// Audit log read operation (no update/delete)
export function getAuditTrail(trip_id) {
  return wixData.query("AuditLog")
    .eq("trip_id", trip_id)
    .ascending("timestamp")
    .find();
}

// NO update or delete functions exist for AuditLog
```

**Database Constraints**:
- ✅ AuditLog collection has no update permissions (even for SYSTEM role)
- ✅ AuditLog collection has no delete permissions (even for site owner)
- ✅ Only insert operations allowed

### Audit Retention Policy

| Event Type | Retention Period | Reason |
|------------|------------------|--------|
| **ADMIN_APPROVED** | 7 years | Standard business record retention (SOC2) |
| **ADMIN_REJECTED** | 10 years | Legal liability protection (extended) |
| **ADMIN_REQUESTED_CHANGES** | 3 years | Operational improvement tracking |
| **VALIDATION_BLOCKED** | 7 years | Compliance documentation |
| **SENTINEL_EVALUATED** | 3 years | Risk assessment history |

### Compliance Tags

Audit events are tagged for compliance frameworks:

| Tag | Meaning | Triggers |
|-----|---------|----------|
| `SOC2` | SOC 2 Type II audit requirement | All admin decisions |
| `GDPR` | GDPR data processing record | Any user data access |
| `CCPA` | California privacy compliance | California-based users |
| `LEGAL_HOLD` | Legal proceeding preservation | Admin rejection, policy violation |
| `PCI` | Payment Card Industry DSS | Payment-related decisions |

---

## 🖼️ Map Decisions to Future UI Expression

### Admin Dashboard (Future UI Surfaces)

This section maps **system logic** to **future UI elements** (implemented by WAI in Sprint 2+).

**Mapping Principle**: For every admin action, specify where it appears in the UI.

#### 1. Admin Queue (Actionable List)

**System Data**: `AdminQueue` collection

**UI Expression**:

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Admin Queue — Pending Approvals (12)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔴 CRITICAL (1)                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TRP_12345 | Restricted Destination                        │ │
│  │ User: john@example.com | Tier: CORPORATE                  │ │
│  │ Pickup: 2026-01-25 @ 15:00 | To: Restricted Military Base │ │
│  │ Reason: validation_blocked | Queued: 5 min ago            │ │
│  │ [View Details] [Approve] [Reject]                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  🟠 HIGH (5)                                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TRP_12346 | SENTINEL Orange Flag                          │ │
│  │ User: jane@example.com | Tier: EXECUTIVE                  │ │
│  │ Pickup: 2026-01-25 @ 02:00 | To: Unknown Address          │ │
│  │ SENTINEL: Orange (55% confidence) | 4 anomalies            │ │
│  │ [View Details] [Approve] [Reject] [Request Changes]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  🟡 MEDIUM (6)                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TRP_12347 | New User First Trip                           │ │
│  │ ... (collapsed)                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Data Binding**:
- Queue items: `wixData.query("AdminQueue").eq("status", "pending").descending("priority")`
- Priority badge color: `priority === "CRITICAL" ? "red" : "orange" | "yellow"`
- Queued time: `calculateTimeAgo(queued_at)`

#### 2. Trip Detail View (Admin Context)

**System Data**: `trip` object + `trip.sentinel_snapshot` + `trip.approval`

**UI Expression**:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Trip Details — TRP_12345                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📍 Trip Information                                            │
│  User: john@example.com (Tier: CORPORATE)                       │
│  Pickup: 123 Main St, LA → LAX Airport                          │
│  Time: 2026-01-25 @ 14:00 (4 days from now)                     │
│  Passengers: 4 | Luggage: 2                                     │
│                                                                  │
│  🛡️ SENTINEL Assessment                                         │
│  Risk Level: 🟠 ORANGE (55% confidence)                         │
│  Anomalies Detected:                                            │
│    • New user account (< 7 days old)                            │
│    • Unusual destination (not in standard routes)               │
│    • Late-night pickup (2:00 AM)                                │
│    • High-tier service (EXECUTIVE)                              │
│                                                                  │
│  📊 User Context                                                │
│  Account Age: 3 days                                            │
│  Total Trips: 0 (first booking)                                 │
│  Payment History: No history                                    │
│  Verification Level: Email verified                             │
│                                                                  │
│  ⚠️ Review Reason                                               │
│  sentinel_orange_multiple_anomalies                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Admin Decision Required                                │   │
│  │                                                          │   │
│  │  [✅ Approve] [❌ Reject] [🔁 Request Changes]          │   │
│  │                                                          │   │
│  │  Notes (optional for approval, required for rejection): │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ [Text area for admin notes]                        │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Data Binding**:
- Trip info: `trip.pickup.address`, `trip.dropoff.address`, `trip.passengers`, etc.
- SENTINEL data: `trip.sentinel_snapshot.risk_level`, `trip.sentinel_snapshot.anomalies`
- User context: `trip.user_context.trip_count`, `trip.user_context.account_age_days`
- Review reason: `trip.approval.queue_reason`

#### 3. Approval Confirmation (State Badge)

**System Data**: `trip.state` + `trip.approval.status`

**UI Expression** (User View):

```
┌─────────────────────────────────────────────────────────────────┐
│  Your Trip — TRP_12345                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Status: ✅ APPROVED                                            │
│  Your trip has been confirmed. See details below.               │
│                                                                  │
│  Pickup: 2026-01-25 @ 14:00                                     │
│  From: 123 Main St, LA → To: LAX Airport                        │
│                                                                  │
│  [View Confirmation] [Cancel Trip]                              │
└─────────────────────────────────────────────────────────────────┘
```

**State Badge Colors**:
- `state === "draft"` → 🟦 Blue "Draft"
- `state === "pending_approval"` → 🟡 Yellow "Under Review"
- `state === "approved"` → 🟢 Green "Approved"
- `state === "cancelled"` → 🔴 Red "Cancelled"

#### 4. Rejection Notification (User Message)

**System Data**: `trip.approval.status === "REJECTED"` + `trip.approval.notes`

**UI Expression** (User View):

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Trip Request Update                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  We couldn't complete your booking for Trip TRP_12345.          │
│                                                                  │
│  For assistance, please contact our support team at             │
│  support@example.com or call 1-800-555-0123.                    │
│                                                                  │
│  [Contact Support] [Submit New Trip]                            │
└─────────────────────────────────────────────────────────────────┘
```

**Note**: Admin rejection notes are **NOT shown to user** directly (calm UX). User contacts support if they need details.

#### 5. Audit Timeline (Admin View)

**System Data**: `AuditLog` collection filtered by `trip_id`

**UI Expression** (Admin Dashboard):

```
┌─────────────────────────────────────────────────────────────────┐
│  📜 Audit Trail — TRP_12345                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⏱️  2026-01-20 10:00:00 | TRIP_CREATED                         │
│      User: john@example.com                                     │
│                                                                  │
│  ⏱️  2026-01-20 10:01:00 | VALIDATION_PASSED                    │
│      Status: VALID | No errors                                  │
│                                                                  │
│  ⏱️  2026-01-20 10:02:00 | SENTINEL_EVALUATED                   │
│      Risk Level: ORANGE | Confidence: 55%                       │
│      Anomalies: new_user, unusual_destination                   │
│                                                                  │
│  ⏱️  2026-01-20 10:03:00 | APPROVAL_REQUIRED                    │
│      Reason: sentinel_orange_multiple_anomalies                 │
│                                                                  │
│  ⏱️  2026-01-20 10:05:00 | ADMIN_QUEUE_ADDED                    │
│      Priority: HIGH                                             │
│                                                                  │
│  ⏱️  2026-01-21 10:30:00 | ADMIN_APPROVED                       │
│      Admin: admin@example.com                                   │
│      Notes: "Verified user identity via phone"                  │
│                                                                  │
│  ⏱️  2026-01-21 10:32:00 | STATE_TRANSITION                     │
│      From: pending_approval → To: approved                      │
│                                                                  │
│  ⏱️  2026-01-21 10:35:00 | EXECUTION_STARTED                    │
│      Action: SEND_BOOKING_REQUEST                               │
└─────────────────────────────────────────────────────────────────┘
```

**Data Binding**:
- Timeline entries: `wixData.query("AuditLog").eq("trip_id", "TRP_12345").ascending("timestamp")`
- Event formatting: Map `event_type` to human-readable labels
- Context display: Show relevant fields from `context` object

#### 6. Clarification Request (User Notification)

**System Data**: `trip.approval.status === "NEEDS_ADJUSTMENT"` + `trip.approval.notes`

**UI Expression** (User View):

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 Trip Request Needs Updates — TRP_12345                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your trip request is being reviewed. We need a few updates     │
│  before we can proceed:                                          │
│                                                                  │
│  💬 Admin Feedback:                                             │
│  "Please provide a more specific pickup address. Current        │
│   address is too vague for routing."                            │
│                                                                  │
│  [Edit Trip] [Cancel Request]                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Data Binding**:
- Admin feedback: `trip.approval.notes`
- Edit action: Returns user to trip form with existing data pre-filled

---

## 🎯 Definition of "Done" — V1 Day 14

You are done when you can confidently answer:

✅ **"When does a human step in, what are they allowed to do, and how is that decision enforced and recorded by the system?"**

### Checklist

- ✅ **Admin review entry conditions are explicit**
  - 12 deterministic triggers defined
  - Each trigger has priority and reason
  - Non-triggers explicitly documented
- ✅ **Admin authority is bounded**
  - Exactly 3 actions: Approve, Reject, Request Clarification
  - Each action has defined effects, requirements, and constraints
  - What admins CANNOT do is documented
- ✅ **Approval authority rules locked**
  - Single-party approval model (V1)
  - Decisions are final
  - Role-based authority defined
- ✅ **Every decision produces an audit trail**
  - 3 audit event types defined with full schema
  - Required fields specified
  - Immutability enforced
  - Retention policies documented
- ✅ **UI expression mapped**
  - Admin queue layout specified
  - Trip detail view defined
  - State badges mapped
  - Audit timeline format provided
- ✅ **No informal trip changes possible**
  - Admins cannot edit trips directly
  - All changes go through audit trail
  - Validation bypass is restricted

---

## 📚 Integration with Existing Modules

### Existing ETAS Modules That Implement These Rules

| Module | File | Day 14 Coverage |
|--------|------|-----------------|
| **Human Review Rules** | [humanReviewRules.js](../src/backend/etas/humanReviewRules.js) | Trigger conditions (`requiresHumanReview`) |
| **Approval Logic** | [approveTrip.js](../src/backend/etas/approveTrip.js) | Admin actions (approve/reject) |
| **Admin Surfaces** | [adminSurfaces.js](../src/backend/etas/adminSurfaces.js) | Admin context, audit logging |
| **Automation Eligibility** | [automationEligibility.js](../src/backend/etas/automationEligibility.js) | Auto-approval vs. manual review |
| **Roles & Permissions** | [rolesPermissions.js](../src/backend/etas/rolesPermissions.js) | Role-based authority |

### No Schema Changes Required

Day 14 documentation formalizes governance rules **already implemented** in Sprint 1.

**Existing schema supports**:
- ✅ `trip.approval.status` ("APPROVED" | "REJECTED" | "NEEDS_ADJUSTMENT")
- ✅ `trip.approval.decided_by` (admin ID)
- ✅ `trip.approval.decided_at` (timestamp)
- ✅ `trip.approval.notes` (reason/clarification)

**Existing audit log supports**:
- ✅ Event types: `ADMIN_APPROVED`, `ADMIN_REJECTED`, `ADMIN_REQUESTED_CHANGES`
- ✅ Immutability: AuditLog collection is append-only
- ✅ Required fields: All audit events capture actor, timestamp, state transition

**No changes needed.** Day 14 documents governance, not implementation.

---

## 🔗 References

### Related Documentation
- [V1 Test Cases](V1_Test_Cases.md) — Canonical test scenarios
- [Day 11 Ownership & Governance](DAY_11_OWNERSHIP_GOVERNANCE.md) — Team boundaries
- [Day 9 Admin Surfaces](DAY_9_ADMIN_SURFACES.md) — Admin context & actions
- [Day 6 Roles & Permissions](DAY_6_ROLES_PERMISSIONS.md) — Role-based access control

### System Modules
- [humanReviewRules.js](../src/backend/etas/humanReviewRules.js) — Review trigger logic
- [approveTrip.js](../src/backend/etas/approveTrip.js) — Approval actions
- [adminSurfaces.js](../src/backend/etas/adminSurfaces.js) — Admin operations

---

**End of Day 14 Documentation**  
**Status**: ✅ Complete  
**Next**: V1 finalization & Sprint 2 handoff preparation
