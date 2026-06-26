# DAY_6_ROLES_PERMISSIONS.md

# Sprint Day 6 — Roles, Permissions & Approval Authority

**Date**: January 5, 2026
**Status**: ✅ Complete
**Deliverable**: Complete role-based permission system with clear authority boundaries and state-aware access control
* * *

## 🎯 Day 6 Goal

**"Make it unmistakably clear who can do what, when, and why — and make sure the system enforces it."**

This day answers:

*   ✅ Who is allowed to act at each trip state?
*   ✅ What actions are user-only vs admin-only?
*   ✅ When is approval human vs system?
*   ✅ How do we prevent accidental or unauthorized actions?

**This protects security, trust, and operational discipline.**
* * *

## 👥 System Roles (Canonical)

### Roles are about authority, not UI

```javascript
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SYSTEM: "system"
};
```

### Role Definitions

| Role | Purpose | Examples |
| ---| ---| --- |
| USER | Trip requester/customer | Creates, edits, submits, cancels own trips |
| ADMIN | Human decision-maker | Approves, rejects, modifies, escalates trips |
| SYSTEM | Automated enforcement | Validates, transitions, logs, enforces rules |

### Future Roles (Not Implemented)

*   `OPERATOR` — Day-to-day operations (less than admin)
*   `SUPER_ADMIN` — Full system access
*   `CONCIERGE` — Premium customer service
* * *

## 🎬 Actions (Permission Vocabulary)

### Every meaningful action in the trip lifecycle

```javascript
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
  MODIFY_TRIP: "modify_trip",
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
```

* * *

## 📊 Role → Action Matrix (Core Permission Table)

### **This table is gold**

| Action | USER | ADMIN | SYSTEM |
| ---| ---| ---| --- |
| Trip Lifecycle |
| `create_trip` | ✅ | ❌ | ❌ |
| `edit_trip` | ✅ (draft only) | ❌ | ❌ |
| `submit_trip` | ✅ | ❌ | ❌ |
| `cancel_trip` | ✅ (own trips) | ✅ (any trip) | ❌ |
| `view_trip` | ✅ (own trips) | ✅ (all trips) | ✅ |
| Admin Actions |
| `approve_trip` | ❌ | ✅ | ❌ |
| `reject_trip` | ❌ | ✅ | ❌ |
| `modify_trip` | ❌ | ✅ | ❌ |
| `escalate_trip` | ❌ | ✅ | ❌ |
| `annotate_trip` | ❌ | ✅ | ❌ |
| `request_changes` | ❌ | ✅ | ❌ |
| System Actions |
| `auto_validate` | ❌ | ❌ | ✅ |
| `auto_transition` | ❌ | ❌ | ✅ |
| `auto_execute` | ❌ | ❌ | ✅ |
| `log_audit` | ❌ | ❌ | ✅ |
| `enforce_rules` | ❌ | ❌ | ✅ |
| Advanced |
| `override_validation` | ❌ | ✅ | ❌ |
| `bypass_approval` | ❌ | ❌ | ❌ |
| `access_audit_trail` | ❌ | ✅ | ❌ |
| `view_all_trips` | ❌ | ✅ | ❌ |
| `modify_tier` | ❌ | ✅ | ❌ |
| `retry_trip` | ✅ | ❌ | ❌ |
| `restore_trip` | ❌ | ✅ | ❌ |

### Key Principles

✅ **Users own their trip creation**
✅ **Admins own decision-making**
✅ **System owns enforcement**
❌ **No role can do another's primary function**
* * *

## 🔄 State-Aware Permissions

### **Permissions are conditional on trip state**

This prevents actions at inappropriate times.

### `draft` State

| Role | Allowed Actions |
| ---| --- |
| USER | `edit_trip`, `submit_trip`, `cancel_trip`, `view_trip` |
| ADMIN | `view_trip`, `annotate_trip` |
| SYSTEM | `auto_validate`, `log_audit` |

### `booking_ready` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip`, `cancel_trip` |
| ADMIN | `view_trip`, `modify_trip`, `cancel_trip`, `annotate_trip` |
| SYSTEM | `auto_validate`, `auto_transition`, `log_audit`, `enforce_rules` |

### `pending_approval` State (Critical)

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip`, `cancel_trip` |
| ADMIN | `approve_trip`, `reject_trip`, `request_changes`, `escalate_trip`, `modify_trip`, `annotate_trip`, `view_trip`, `access_audit_trail` |
| SYSTEM | `log_audit`, `enforce_rules` (timeout) |

**Note**: This is where admin authority is strongest.

### `approved` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip`, `cancel_trip` (can still cancel before execution) |
| ADMIN | `view_trip`, `annotate_trip`, `cancel_trip`, `access_audit_trail` |
| SYSTEM | `auto_execute` (if eligible), `auto_transition`, `log_audit` |

### `needs_adjustment` State

| Role | Allowed Actions |
| ---| --- |
| USER | `edit_trip`, `submit_trip`, `cancel_trip`, `view_trip` |
| ADMIN | `view_trip`, `annotate_trip` |
| SYSTEM | `auto_validate`, `log_audit` |

**Note**: Returns to user control, similar to draft.

### `escalated` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip` (only) |
| ADMIN | `approve_trip`, `reject_trip`, `modify_trip`, `annotate_trip`, `view_trip`, `access_audit_trail` |
| SYSTEM | `log_audit` |

**Note**: Admin has full control, user can only observe.

### `booked` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip`, `cancel_trip` (with penalties) |
| ADMIN | `view_trip`, `annotate_trip`, `modify_trip` (emergency), `cancel_trip`, `access_audit_trail` |
| SYSTEM | `auto_transition`, `log_audit` |

### `in_progress` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip` |
| ADMIN | `view_trip`, `annotate_trip`, `access_audit_trail` |
| SYSTEM | `auto_transition`, `log_audit` |

**Note**: Very limited actions during active trip.

### `completed` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip` |
| ADMIN | `view_trip`, `annotate_trip`, `access_audit_trail` |
| SYSTEM | `log_audit` |

**Note**: Read-only for everyone.

### `cancelled` State

| Role | Allowed Actions |
| ---| --- |
| USER | `view_trip` |
| ADMIN | `view_trip`, `annotate_trip`, `restore_trip`, `access_audit_trail` |
| SYSTEM | `log_audit` |

**Note**: Only admin can restore if needed.
* * *

## 🎯 Approval Authority (Explicit Definition)

### **This clears confusion fast**

```javascript
APPROVAL_AUTHORITY = {
  REQUEST: {
    role: "USER",
    description: "Users request trips",
    cannot: "Users cannot approve their own trips"
  },

  APPROVE: {
    role: "ADMIN",
    description: "Admins approve or reject trips",
    conditions: [
      "Trip must be in pending_approval or escalated state",
      "Admin must provide notes for rejection/changes",
      "Approval is immutable once recorded"
    ]
  },

  ENFORCE: {
    role: "SYSTEM",
    description: "System enforces rules and validates",
    cannot: "System cannot approve trips or override admin decisions"
  }
}
```

### Critical Distinctions

#### 1\. **Approval ≠ Confirmation**

*   **Approval**: Admin decision to allow trip to proceed
*   **Confirmation**: User agreement to trip details
*   **Note**: These are different steps

#### 2\. **Approval ≠ Execution**

*   **Approval**: Human permission to proceed
*   **Execution**: System action to create booking
*   **Note**: Approval does not equal booking

#### 3\. **Validation ≠ Approval**

*   **Validation**: System checks for correctness
*   **Approval**: Human checks for appropriateness
*   **Note**: Both required, neither replaces the other

### No Role Overlap

| Rule | Description | Enforcement |
| ---| ---| --- |
| No Self-Approval | Users cannot approve their own trips | `user_id ≠ admin_id` on approval |
| No System Approval | System cannot approve without human | `approval.decidedBy` must be admin |
| No Silent Admin Edits | Admin edits must be annotated | `modification_log` required |
| No Admin as User | Admins don't create trips as users | Separate interfaces |

* * *

## 📝 Audit Expectations (Not Implementation)

### What should be logged for future compliance

#### 1\. **Admin Actions**

**Requirement**: All admin actions must be annotated

**Includes**:

*   Action type
*   Admin ID
*   Timestamp
*   Reason/notes
*   Trip state before and after

**Immutable**: ✅ Yes

#### 2\. **Approval Decisions**

**Requirement**: Approval decisions are immutable

**Includes**:

*   Decision (approve/reject/escalate/changes)
*   Decided by (admin ID)
*   Decided at (timestamp)
*   Notes/reason
*   SENTINEL context (if available)

**Immutable**: ✅ Yes

#### 3\. **State Changes**

**Requirement**: State changes are traceable

**Includes**:

*   From state
*   To state
*   Triggered by (user/admin/system)
*   Timestamp
*   Reason

**Immutable**: ✅ Yes

#### 4\. **Permission Violations**

**Requirement**: Permission violations are logged

**Includes**:

*   Attempted action
*   Role
*   User ID
*   Trip ID
*   Denial reason
*   Timestamp

**Immutable**: ✅ Yes
* * *

## 👁️ UX Contract by Role

### **What each role sees (not how it looks)**

This avoids accidental exposure later.

### USER Can See

*   ✅ Their own trip details
*   ✅ Trip status
*   ✅ Public status messages
*   ✅ Next actions available to them
*   ✅ SENTINEL context (basic, filtered by tier)

### USER Cannot See

*   ❌ Admin controls
*   ❌ Other users' trips
*   ❌ Internal admin notes
*   ❌ Full audit trail
*   ❌ System validation details
*   ❌ Admin decision reasoning (unless shared)

### ADMIN Can See

*   ✅ All trip details
*   ✅ Full SENTINEL context
*   ✅ Audit trail
*   ✅ Decision history
*   ✅ Internal notes
*   ✅ System validation results
*   ✅ Permission to act on trips

### ADMIN Cannot See

*   ❌ User passwords/auth tokens
*   ❌ Payment details (PCI compliance)
*   ❌ Other admin's private notes (optional)

### SYSTEM Can See

*   ✅ Trip data needed for processing
*   ✅ Validation results
*   ✅ State machine context

### SYSTEM Cannot See

*   ❌ Admin decision reasoning (just enforces)
*   ❌ User personal information (unless needed)

**Note**: System actions are invisible to users
* * *

## 🔒 Permission Checker Functions

### `hasPermission(role, action, tripState)`

Check if a role can perform an action (optionally in a specific state).

```javascript
hasPermission("user", "edit_trip", "draft")
→ true

hasPermission("user", "approve_trip", "pending_approval")
→ false

hasPermission("admin", "approve_trip", "pending_approval")
→ true

hasPermission("system", "auto_validate", "draft")
→ true
```

### `canPerformAction(role, action, trip, userId)`

Check if a specific user can perform an action on a specific trip.

```javascript
// User tries to edit their own trip in draft
canPerformAction("user", "edit_trip", trip, "user_123")
→ { allowed: true, reason: "Permission granted", code: "OK" }

// User tries to edit someone else's trip
canPerformAction("user", "edit_trip", trip, "user_456")
→ { allowed: false, reason: "Users can only act on their own trips", code: "NOT_OWNER" }

// User tries to edit trip in pending_approval
canPerformAction("user", "edit_trip", trip_pending, "user_123")
→ { allowed: false, reason: "Cannot edit trip in pending_approval state", code: "STATE_NOT_EDITABLE" }

// Admin approves trip in pending_approval
canPerformAction("admin", "approve_trip", trip_pending, "admin_789")
→ { allowed: true, reason: "Permission granted", code: "OK" }
```

### `getAllowedActions(role, tripState)`

Get list of all allowed actions for a role in a specific state.

```javascript
getAllowedActions("user", "draft")
→ ["edit_trip", "submit_trip", "cancel_trip", "view_trip"]

getAllowedActions("admin", "pending_approval")
→ ["approve_trip", "reject_trip", "request_changes", "escalate_trip",
   "modify_trip", "annotate_trip", "view_trip", "access_audit_trail"]

getAllowedActions("system", "booking_ready")
→ ["auto_validate", "auto_transition", "log_audit", "enforce_rules"]
```

* * *

## 🛡️ Security Scenarios

### ✅ Scenario 1: User Edits Own Draft Trip

```javascript
Role: USER
Action: EDIT_TRIP
Trip State: draft
User ID: user_123
Trip Owner: user_123

canPerformAction("user", "edit_trip", trip, "user_123")
→ { allowed: true }

✅ Permitted: User can edit their own draft
```

### ❌ Scenario 2: User Tries to Approve Own Trip

```javascript
Role: USER
Action: APPROVE_TRIP
Trip State: pending_approval
User ID: user_123

hasPermission("user", "approve_trip")
→ false

❌ Denied: Users cannot approve trips
```

### ❌ Scenario 3: User Tries to Edit Trip in Review

```javascript
Role: USER
Action: EDIT_TRIP
Trip State: pending_approval
User ID: user_123
Trip Owner: user_123

canPerformAction("user", "edit_trip", trip, "user_123")
→ {
  allowed: false,
  reason: "Cannot edit trip in pending_approval state",
  code: "STATE_NOT_EDITABLE"
}

❌ Denied: Trip is frozen during review
```

### ✅ Scenario 4: Admin Approves Trip

```javascript
Role: ADMIN
Action: APPROVE_TRIP
Trip State: pending_approval
Admin ID: admin_789

canPerformAction("admin", "approve_trip", trip, "admin_789")
→ { allowed: true }

✅ Permitted: Admin can approve in pending_approval state
```

### ❌ Scenario 5: System Tries to Approve Trip

```javascript
Role: SYSTEM
Action: APPROVE_TRIP
Trip State: pending_approval

hasPermission("system", "approve_trip")
→ false

❌ Denied: System cannot approve trips (human required)
```

### ❌ Scenario 6: User Tries to Edit Someone Else's Trip

```javascript
Role: USER
Action: EDIT_TRIP
Trip State: draft
User ID: user_456
Trip Owner: user_123

canPerformAction("user", "edit_trip", trip, "user_456")
→ {
  allowed: false,
  reason: "Users can only act on their own trips",
  code: "NOT_OWNER"
}

❌ Denied: Users can only edit their own trips
```

### ✅ Scenario 7: Admin Modifies Tier

```javascript
Role: ADMIN
Action: MODIFY_TIER
Trip State: pending_approval
Admin ID: admin_789

canPerformAction("admin", "modify_tier", trip, "admin_789")
→ { allowed: true }

✅ Permitted: Admin can adjust tier during review
```

* * *

## ✅ Day 6 Completion Checklist

Can you answer these questions?

*   ✅ **Who can do this action?**

→ Check PERMISSION\_MATRIX for role, STATE\_PERMISSIONS for state-specific rules

*   ✅ **In which state?**

→ Check STATE\_PERMISSIONS for allowed actions per state per role

*   ✅ **What happens if they try anyway?**

→ `canPerformAction()` returns `{ allowed: false, reason, code }`

*   ✅ **Who has final authority?**

→ APPROVAL\_AUTHORITY: Users REQUEST, Admins APPROVE, System ENFORCES

* * *

## 📂 Files Created

1. [**rolesPermissions.js**](http://../src/backend/etas/rolesPermissions.js) — Complete permission system:
    *   `ROLES` — Canonical role definitions
    *   `ACTIONS` — Permission vocabulary
    *   `PERMISSION_MATRIX` — Role → Action mapping
    *   `STATE_PERMISSIONS` — State-aware permissions
    *   `APPROVAL_AUTHORITY` — Explicit authority definitions
    *   `APPROVAL_DISTINCTIONS` — Critical clarifications
    *   `AUDIT_EXPECTATIONS` — Logging requirements
    *   `ROLE_UX_CONTRACT` — What each role sees
    *   `ROLE_OVERLAP_RULES` — Preventing conflicts
    *   `hasPermission()` — Base permission checker
    *   `canPerformAction()` — Full permission checker
    *   `getAllowedActions()` — Get available actions
2. **`DAY_6_ROLES_PERMISSIONS.md`** — This documentation
* * *

## 🛡️ What's Protected

### Security

*   ✅ No self-approval
*   ✅ No unauthorized edits
*   ✅ No role confusion
*   ✅ State-based access control

### Trust

*   ✅ Clear authority boundaries
*   ✅ Immutable audit trail expectations
*   ✅ Human oversight preserved
*   ✅ System cannot override humans

### Operations

*   ✅ No accidental actions
*   ✅ State transitions enforced
*   ✅ Permission violations logged
*   ✅ Clear escalation paths

### Compliance

*   ✅ Audit trail defined
*   ✅ Permission checks enforced
*   ✅ Role separation maintained
*   ✅ Immutable decision records
* * *

## 🔜 Next Steps

**Day 7+**: Continue building execution logic, integrations, and UI while respecting the permission framework established today.

The system now knows:

*   Who can act (roles)
*   What they can do (actions)
*   When they can do it (state-aware)
*   Why it's allowed (authority)
* * *

## 📝 Commit Message

```diff
Define role-based permissions and approval authority (Sprint Day 6)

- Established canonical roles (USER, ADMIN, SYSTEM)
- Defined 20+ actions as permission vocabulary
- Created comprehensive role-action permission matrix
- Implemented state-aware permissions for all trip states
- Explicitly defined approval authority (request/approve/enforce)
- Clarified critical distinctions (approval vs confirmation vs execution)
- Defined audit trail expectations (admin actions, decisions, state changes)
- Created role-based UX contract (what each role sees/cannot see)
- Implemented permission checker functions with state awareness
- Prevented role overlap with explicit rules
```

* * *

## 📊 ClickUp Update

**Sprint Day 6 complete**: Formalized roles, permissions, and approval authority to ensure secure, predictable trip handling. System now enforces who can do what, when, and why with state-aware access control, explicit approval authority, and comprehensive audit expectations.
