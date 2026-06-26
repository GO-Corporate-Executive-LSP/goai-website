# Schema Update Note for Existing Documentation

**Date:** January 2025  
**Status:** ⚠️ IMPORTANT - READ BEFORE USING OLDER DOCS  
**Applies To:** V1_Test_Cases.md, DAY_14_ADMIN_AUTHORITY.md (old version)

---

## 🎯 TL;DR

**If you see this in documentation:**
```javascript
trip.approval.status
trip.execution.action
trip.automation.eligible
```

**Lee's actual implementation uses:**
```javascript
trip.admin_context.approval.status
trip.admin_context.execution.action
trip.admin_context.automation.eligible
```

---

## 📊 What Changed

### Documentation Schema (Aspirational - DO NOT USE)

```javascript
{
  trip_id: "...",
  state: {...},
  
  // WRONG - These are NOT separate root-level objects
  approval: {
    status: "APPROVED",
    decided_by: "admin_123"
  },
  execution: {
    status: "COMPLETED",
    action: "approve"
  },
  automation: {
    eligible: false,
    reason: "sentinel_flag"
  }
}
```

### Lee's Actual Implementation (CORRECT - USE THIS)

```javascript
{
  trip_id: "...",
  state: {...},
  
  // CORRECT - All admin data nested under admin_context
  admin_context: {
    approval: {
      status: "APPROVED",
      decided_by: "admin_123",
      decided_at: "2025-01-20T18:00:00Z",
      notes: "",
      decision_reason: "manual_approval"
    },
    execution: {
      status: "COMPLETED",
      action: "approve",
      executed_by: "admin_123",
      executed_at: "2025-01-20T18:00:00Z",
      result: {}
    },
    automation: {
      eligible: false,
      reason: "sentinel_flag_present",
      checked_at: "2025-01-20T17:00:00Z"
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
  }
}
```

---

## 🔄 Field Mapping Guide

### Quick Reference Table

| Old Documentation Path | Lee's Actual Path | Example Value |
|------------------------|-------------------|---------------|
| `trip.approval.status` | `trip.admin_context.approval.status` | `"APPROVED"` |
| `trip.approval.decided_by` | `trip.admin_context.approval.decided_by` | `"admin_123"` |
| `trip.approval.decided_at` | `trip.admin_context.approval.decided_at` | `"2025-01-20T18:00:00Z"` |
| `trip.approval.notes` | `trip.admin_context.approval.notes` | `"Low risk"` |
| `trip.approval.decision_reason` | `trip.admin_context.approval.decision_reason` | `"manual_approval"` |
| `trip.execution.status` | `trip.admin_context.execution.status` | `"COMPLETED"` |
| `trip.execution.action` | `trip.admin_context.execution.action` | `"approve"` |
| `trip.execution.executed_by` | `trip.admin_context.execution.executed_by` | `"admin_123"` |
| `trip.execution.executed_at` | `trip.admin_context.execution.executed_at` | `"2025-01-20T18:00:00Z"` |
| `trip.execution.result` | `trip.admin_context.execution.result` | `{}` |
| `trip.automation.eligible` | `trip.admin_context.automation.eligible` | `false` |
| `trip.automation.reason` | `trip.admin_context.automation.reason` | `"sentinel_flag_present"` |
| `trip.automation.checked_at` | `trip.admin_context.automation.checked_at` | `"2025-01-20T17:00:00Z"` |
| *N/A (not in docs)* | `trip.admin_context.failure.count` | `0` |
| *N/A (not in docs)* | `trip.admin_context.failure.failure_type` | `"payment"` |
| *N/A (not in docs)* | `trip.admin_context.retries.count` | `0` |

---

## 📚 Updated Documentation

**Use these documents for CORRECT schema:**

1. ✅ **[DAY_14_GOVERNANCE_ALIGNED.md](DAY_14_GOVERNANCE_ALIGNED.md)** - Complete admin governance using Lee's schema
2. ✅ **[SCHEMA_RECONCILIATION.md](SCHEMA_RECONCILIATION.md)** - Detailed schema conflict analysis
3. ✅ **[SPRINT_1_DATABASE_API.md](SPRINT_1_DATABASE_API.md)** - Lee's database API documentation
4. ✅ **[SPRINT_1_WIX_DATABASES.md](SPRINT_1_WIX_DATABASES.md)** - Lee's database schema documentation
5. ✅ **[WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md](WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md)** - UPDATED with correct schema

**Legacy documents (use with caution, apply mapping):**

1. ⚠️ **[V1_Test_Cases.md](V1_Test_Cases.md)** - Uses old schema, apply field mapping from this document
2. ⚠️ **[DAY_14_ADMIN_AUTHORITY.md](DAY_14_ADMIN_AUTHORITY.md)** - OLD VERSION, use DAY_14_GOVERNANCE_ALIGNED.md instead

---

## 🔍 Audit Log Schema Changes

### Old Documentation (DO NOT USE)

```javascript
{
  audit_id: "...",
  trip_id: "...",
  timestamp: "...",
  event_type: "ADMIN_APPROVE_TRIP",
  actor_id: "admin_123",
  actor_role: "ADMIN",
  previous_state: {},  // Full state snapshot
  new_state: {},       // Full state snapshot
  action: "approve",
  outcome: "SUCCESS"
}
```

### Lee's Actual Implementation (CORRECT)

```javascript
{
  auditId: "...",
  tripId: "...",
  timestamp: "...",
  fromState: "pending_approval",  // Just the state string
  toState: "approved",            // Just the state string
  
  // Event metadata object
  event: {
    event_type: "ADMIN_APPROVE_TRIP",      // From eventTypes.js
    event_category: "ADMIN_ACTION",        // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
    outcome: "SUCCESS"                     // SUCCESS | FAILURE | PARTIAL | PENDING
  },
  
  // Actor information object
  actor: {
    actor_id: "admin_123",                 // Who did it
    actor_role: "ADMIN",                   // USER | ADMIN | SENIOR_ADMIN | SYSTEM
    actor_email: "admin@example.com",      // Email (null for SYSTEM)
    ipAddress: "192.168.1.1"               // IP address
  },
  
  // Admin context (optional, for admin actions only)
  adminContext: {
    notes: "Approved based on low risk",
    override_reason: null,
    user_contacted: false,
    escalation_target: null,
    resolution_notes: null,
    session_id: "sess_1737398400000_abc123",
    environment: "production",
    version: "1.0.0"
  },
  
  retentionPolicy: "STANDARD",
  complianceTags: [],
  immutable: true
}
```

### Audit Log Field Mapping

| Old Documentation | Lee's Actual | Notes |
|-------------------|--------------|-------|
| `audit_id` | `auditId` | Wix camelCase |
| `trip_id` | `tripId` | Wix camelCase |
| `event_type` | `event.event_type` | Nested in event object |
| `actor_id` | `actor.actor_id` | Nested in actor object |
| `actor_role` | `actor.actor_role` | Nested in actor object |
| `previous_state` | `fromState` | Just state string, not full object |
| `new_state` | `toState` | Just state string, not full object |
| `action` | `event.event_type` | Action is the event type |
| `outcome` | `event.outcome` | Nested in event object |
| *N/A* | `event.event_category` | NEW: USER_ACTION, ADMIN_ACTION, SYSTEM_ACTION |
| *N/A* | `actor.actor_email` | NEW: Actor email |
| *N/A* | `actor.ipAddress` | NEW: IP address |
| `context.*` | `adminContext.*` | Admin-specific context fields |

---

## 🛠️ Code Migration Examples

### Example 1: Check Approval Status

**Old (from documentation):**
```javascript
if (trip.approval.status === "APPROVED") {
  // ...
}
```

**Correct (Lee's implementation):**
```javascript
if (trip.admin_context.approval.status === "APPROVED") {
  // ...
}
```

### Example 2: Set Execution Status

**Old (from documentation):**
```javascript
trip.execution.status = "COMPLETED";
trip.execution.action = "approve";
trip.execution.executed_by = adminId;
```

**Correct (Lee's implementation):**
```javascript
trip.admin_context.execution.status = "COMPLETED";
trip.admin_context.execution.action = "approve";
trip.admin_context.execution.executed_by = adminId;
trip.admin_context.execution.executed_at = new Date().toISOString();
trip.admin_context.execution.result = {};
```

### Example 3: Check Automation Eligibility

**Old (from documentation):**
```javascript
if (trip.automation.eligible) {
  // Auto-approve
}
```

**Correct (Lee's implementation):**
```javascript
if (trip.admin_context.automation.eligible) {
  // Auto-approve
}
```

### Example 4: Query Pending Approvals

**Old (from documentation):**
```javascript
const pending = await wixData.query('Trips')
  .eq('approval.status', 'PENDING')
  .find();
```

**Correct (Lee's implementation):**
```javascript
const pending = await wixData.query('Trips')
  .eq('admin_context.approval.status', 'PENDING')
  .find();
```

### Example 5: Log Admin Action

**Old (from documentation):**
```javascript
await logAuditEvent({
  trip_id: tripId,
  event_type: "ADMIN_APPROVE_TRIP",
  actor_id: adminId,
  actor_role: "ADMIN",
  action: "approve",
  outcome: "SUCCESS"
});
```

**Correct (Lee's implementation):**
```javascript
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
    ipAddress: ""
  },
  admin_context: {
    notes: "...",
    session_id: generateSessionId(),
    environment: "production",
    version: "1.0.0"
  }
});
```

---

## ✅ When Reading Legacy Docs

**Apply this mental model:**

1. Wherever you see `trip.approval.*`, think `trip.admin_context.approval.*`
2. Wherever you see `trip.execution.*`, think `trip.admin_context.execution.*`
3. Wherever you see `trip.automation.*`, think `trip.admin_context.automation.*`
4. For audit logs, remember `event{}` and `actor{}` are objects, not flat fields
5. State transitions are `fromState` and `toState` strings, not full state snapshots

**When in doubt, check:**
- [src/backend/etas/tripDatabase.js](../src/backend/etas/tripDatabase.js) - Lines 1-100 for trip structure
- [src/backend/etas/tripDatabase.js](../src/backend/etas/tripDatabase.js) - Lines 350-429 for audit log structure
- [docs/SPRINT_1_DATABASE_API.md](SPRINT_1_DATABASE_API.md) - Lee's API documentation
- [docs/DAY_14_GOVERNANCE_ALIGNED.md](DAY_14_GOVERNANCE_ALIGNED.md) - Current governance doc

---

## 📝 Summary

**Bottom Line:**
- Early documentation was **aspirational** (what we thought we'd build)
- Lee's implementation is **actual** (what was built)
- Lee's schema is **authoritative**
- Use `admin_context{}` for ALL admin-related data
- Use `event{}` and `actor{}` for audit log events

**For New Code:**
Always use Lee's actual schema from:
- tripDatabase.js (lines 1-429)
- eventTypes.js
- SPRINT_1_DATABASE_API.md
- DAY_14_GOVERNANCE_ALIGNED.md

---

**Status:** ✅ Schema alignment documented and clarified  
**Next Steps:** Update remaining legacy documentation as time permits

