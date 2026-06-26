# SCHEMA RECONCILIATION — Lee + Madison Alignment

**Document Date**: January 23, 2026  
**Purpose**: Reconcile schema discrepancies between documentation and implementation  
**Status**: 🔧 Active Alignment  
**Context**: Lee identified mismatches between WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md, DAY_14_ADMIN_AUTHORITY.md, and adminSurfaces.js

---

## 🎯 Issue Summary

**Problem**: Documentation contains schema definitions that don't align with the existing Sprint 1 implementation in `adminSurfaces.js`.

**Specific Conflicts**:
1. **AuditLog schema** in docs vs. `AUDIT_REQUIREMENTS` in adminSurfaces.js
2. **New variables** added in docs that may not exist in implementation
3. **AuditLog scope**: Docs focused on admin actions only, but Lee needs to audit ALL user and system actions

**Resolution Goal**: Define the **authoritative schema** that both code and documentation will follow.

---

## 📋 Current State Analysis

### What EXISTS in Sprint 1 Code (adminSurfaces.js)

**AUDIT_REQUIREMENTS (Lines 717-747)**:
```javascript
{
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
}
```

**AUDIT_EVENTS (Lines 752-765)**:
```javascript
{
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
}
```

### What Was DOCUMENTED (WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md)

**AuditLog Schema (Lines 350-375)**:
```javascript
{
  "_id": "string",
  "timestamp": "date",
  "event_type": "string",       // TRIP_CREATED | STATE_TRANSITION | APPROVAL | EXECUTION | etc.
  "trip_id": "string",
  "user_id": "string",
  "actor_id": "string",         // Who performed action
  "actor_role": "string",       // USER | ADMIN | SYSTEM
  
  "previous_state": "object",   // Snapshot before action
  "new_state": "object",        // Snapshot after action
  "action": "string",           // Specific action taken
  "outcome": "string",          // SUCCESS | FAILURE | PARTIAL
  
  "context": {
    "ip_address": "string",
    "user_agent": "string",
    "session_id": "string",
    "metadata": "object"
  },
  
  "retention_policy": "string", // STANDARD | EXTENDED | PERMANENT
  "compliance_tags": "array"    // GDPR | CCPA | SOC2 | etc.
}
```

### Key Differences Identified

| Field | adminSurfaces.js | WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md | Notes |
|-------|------------------|---------------------------------------|-------|
| `admin_id` | ✅ Required | ❌ Missing (uses `actor_id` instead) | **Conflict** |
| `admin_email` | ✅ Required | ❌ Missing | **Conflict** |
| `action` | ✅ Required | ✅ Present | ✅ Aligned |
| `trip_id` | ✅ Required | ✅ Present | ✅ Aligned |
| `timestamp` | ✅ Required | ✅ Present | ✅ Aligned |
| `from_state` | ✅ Required | ❌ Missing (uses `previous_state` object) | **Conflict** |
| `to_state` | ✅ Required | ❌ Missing (uses `new_state` object) | **Conflict** |
| `ip_address` | ✅ Required | ✅ Present (in context) | ⚠️ Different location |
| `user_agent` | ✅ Required | ✅ Present (in context) | ⚠️ Different location |
| `actor_id` | ❌ Missing | ✅ Present | **Conflict** |
| `actor_role` | ❌ Missing | ✅ Present | **Conflict** |
| `user_id` | ❌ Missing | ✅ Present | **Conflict** |
| `event_type` | ❌ Missing | ✅ Present | **Conflict** |
| `previous_state` (object) | ❌ Missing | ✅ Present | **Conflict** |
| `new_state` (object) | ❌ Missing | ✅ Present | **Conflict** |
| `outcome` | ❌ Missing | ✅ Present | **Conflict** |
| `retention_policy` | ✅ Present (separate constant) | ✅ Present (in schema) | ⚠️ Different approach |
| `compliance_tags` | ❌ Missing | ✅ Present | **Conflict** |

---

## 🔧 AUTHORITATIVE SCHEMA — Reconciled Version

### AuditLog Collection (Final Schema)

**Purpose**: Log ALL user, admin, and system actions for complete audit trail.

**Schema**:

```javascript
{
  // ============================================================================
  // PRIMARY IDENTIFIERS
  // ============================================================================
  "_id": "string",                // Wix auto-generated unique ID
  "audit_id": "string",           // Human-readable audit ID (e.g., "aud_20260123_103000_xyz")
  "timestamp": "date",            // ISO 8601 datetime (when action occurred)
  
  // ============================================================================
  // EVENT CLASSIFICATION
  // ============================================================================
  "event_type": "string",         // Event category (see AUDIT_EVENT_TYPES below)
  "event_category": "string",     // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
  "action": "string",             // Specific action taken (e.g., "trip_created", "trip_approved")
  "outcome": "string",            // SUCCESS | FAILURE | PARTIAL | PENDING
  
  // ============================================================================
  // ACTOR INFORMATION (Who performed the action)
  // ============================================================================
  "actor_id": "string",           // User ID, Admin ID, or "SYSTEM"
  "actor_role": "string",         // USER | ADMIN | SENIOR_ADMIN | SYSTEM
  "actor_email": "string",        // Actor email (if applicable, null for SYSTEM)
  
  // For backward compatibility with adminSurfaces.js
  "admin_id": "string",           // DEPRECATED: Use actor_id instead (kept for Sprint 1 code)
  "admin_email": "string",        // DEPRECATED: Use actor_email instead (kept for Sprint 1 code)
  
  // ============================================================================
  // TRIP CONTEXT (What was affected)
  // ============================================================================
  "trip_id": "string",            // Trip ID (if applicable, null for non-trip events)
  "user_id": "string",            // User who owns the trip (if applicable)
  
  // ============================================================================
  // STATE TRANSITION (What changed)
  // ============================================================================
  // Option 1: Simple string fields (Sprint 1 approach)
  "from_state": "string",         // State before action (e.g., "draft")
  "to_state": "string",           // State after action (e.g., "approved")
  
  // Option 2: Full object snapshots (recommended for complete audit)
  "previous_state": "object",     // Full trip object before action (optional, for detailed audit)
  "new_state": "object",          // Full trip object after action (optional, for detailed audit)
  
  // ============================================================================
  // ACTION CONTEXT (Why and how)
  // ============================================================================
  "context": {
    "ip_address": "string",       // Where action originated
    "user_agent": "string",       // Browser/device info
    "session_id": "string",       // Session identifier
    "environment": "string",      // production | staging | dev
    "version": "string",          // System version at time of action
    "metadata": "object"          // Additional context (flexible)
  },
  
  // ============================================================================
  // ADMIN-SPECIFIC FIELDS (Optional, for admin actions only)
  // ============================================================================
  "notes": "text",                // Admin reasoning/notes
  "override_reason": "text",      // Why override was necessary
  "user_contacted": "boolean",    // Was user notified
  "escalation_target": "string",  // Who was escalated to (if applicable)
  "resolution_notes": "text",     // How issue was resolved
  
  // ============================================================================
  // COMPLIANCE & RETENTION
  // ============================================================================
  "retention_policy": "string",   // STANDARD | EXTENDED | PERMANENT | LEGAL_HOLD
  "compliance_tags": "array",     // ["SOC2", "GDPR", "CCPA", "PCI", etc.]
  "immutable": "boolean",         // true (audit logs cannot be modified)
  
  // ============================================================================
  // METADATA
  // ============================================================================
  "created_at": "date",           // When audit entry was created
  "system_version": "string",     // ETAS version (e.g., "v1.0.0")
  "data_version": "number"        // Schema version (for future migrations)
}
```

### AUDIT_EVENT_TYPES (Comprehensive List)

**Expand beyond admin-only events to include ALL actions**:

```javascript
export const AUDIT_EVENT_TYPES = {
  // ============================================================================
  // USER ACTIONS (event_category: "USER_ACTION")
  // ============================================================================
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  TRIP_CREATED: 'trip_created',
  TRIP_SUBMITTED: 'trip_submitted',
  TRIP_EDITED: 'trip_edited',
  TRIP_CANCELLED_BY_USER: 'trip_cancelled_by_user',
  PAYMENT_METHOD_UPDATED: 'payment_method_updated',
  PROFILE_UPDATED: 'profile_updated',
  
  // ============================================================================
  // ADMIN ACTIONS (event_category: "ADMIN_ACTION")
  // ============================================================================
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  ADMIN_APPROVED: 'admin_approved',
  ADMIN_REJECTED: 'admin_rejected',
  ADMIN_REQUESTED_CHANGES: 'admin_requested_changes',
  ADMIN_ESCALATED: 'admin_escalated',
  ADMIN_NOTE_ADDED: 'admin_note_added',
  ADMIN_OVERRIDE_APPLIED: 'admin_override_applied',
  ADMIN_USER_CONTACTED: 'admin_user_contacted',
  ADMIN_EMERGENCY_CANCEL: 'admin_emergency_cancel',
  ADMIN_RETRY_TRIGGERED: 'admin_retry_triggered',
  
  // ============================================================================
  // SYSTEM ACTIONS (event_category: "SYSTEM_ACTION")
  // ============================================================================
  VALIDATION_PASSED: 'validation_passed',
  VALIDATION_FAILED: 'validation_failed',
  VALIDATION_BLOCKED: 'validation_blocked',
  SENTINEL_EVALUATED: 'sentinel_evaluated',
  SENTINEL_TIMEOUT: 'sentinel_timeout',
  STATE_TRANSITION: 'state_transition',
  AUTO_APPROVED: 'auto_approved',
  APPROVAL_REQUIRED: 'approval_required',
  ADMIN_QUEUE_ADDED: 'admin_queue_added',
  ADMIN_QUEUE_REMOVED: 'admin_queue_removed',
  EXECUTION_STARTED: 'execution_started',
  EXECUTION_SUCCESS: 'execution_success',
  EXECUTION_FAILED: 'execution_failed',
  EXECUTION_RETRY: 'execution_retry',
  RETRY_SCHEDULED: 'retry_scheduled',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  TRIP_COMPLETED: 'trip_completed',
  SENTINEL_ENRICHMENT_ADDED: 'sentinel_enrichment_added',
  AUTOMATION_EVALUATED: 'automation_evaluated',
  FALLBACK_TO_MANUAL_APPROVAL: 'fallback_to_manual_approval',
  ERROR_LOGGED: 'error_logged',
  SYSTEM_ALERT: 'system_alert'
};
```

### Retention Policies

```javascript
export const AUDIT_RETENTION_POLICIES = {
  STANDARD: {
    period: '7_years',
    description: 'Standard business record retention (SOC2)',
    applies_to: [
      'TRIP_CREATED', 'TRIP_SUBMITTED', 'VALIDATION_PASSED',
      'ADMIN_APPROVED', 'EXECUTION_SUCCESS', 'TRIP_COMPLETED'
    ]
  },
  EXTENDED: {
    period: '10_years',
    description: 'Legal liability protection',
    applies_to: [
      'ADMIN_REJECTED', 'VALIDATION_BLOCKED', 'ADMIN_OVERRIDE_APPLIED',
      'ADMIN_EMERGENCY_CANCEL', 'PAYMENT_FAILED'
    ]
  },
  PERMANENT: {
    period: 'indefinite',
    description: 'Critical security/compliance events',
    applies_to: [
      'USER_REGISTERED', 'ADMIN_LOGIN', 'SYSTEM_ALERT', 'ERROR_LOGGED'
    ]
  },
  LEGAL_HOLD: {
    period: 'until_released',
    description: 'Legal proceeding preservation',
    applies_to: [] // Applied case-by-case
  }
};
```

---

## 🔄 Migration Strategy

### Phase 1: Add Missing Fields (Backward Compatible)

**Lee's Tasks**:
1. Add new fields to AuditLog collection schema:
   - `event_type` (required)
   - `event_category` (required)
   - `actor_id` (required, copy from `admin_id` if admin action)
   - `actor_role` (required)
   - `user_id` (optional, for trip-related events)
   - `outcome` (required)
   - `previous_state` (optional, for detailed audit)
   - `new_state` (optional, for detailed audit)
   - `compliance_tags` (array)
   - `immutable` (boolean, always true)

2. Keep existing Sprint 1 fields for backward compatibility:
   - `admin_id` (mark as DEPRECATED, but don't remove yet)
   - `admin_email` (mark as DEPRECATED, but don't remove yet)
   - `from_state` (keep alongside `previous_state`)
   - `to_state` (keep alongside `new_state`)

### Phase 2: Update Logging Functions

**Madison's Tasks**:
1. Create a new `logAuditEvent()` function that uses the reconciled schema:
   ```javascript
   // src/backend/etas/auditLogger.js (NEW FILE)
   
   export function logAuditEvent(eventData) {
     // Validate required fields
     if (!eventData.event_type || !eventData.actor_id || !eventData.actor_role) {
       throw new Error("Audit event missing required fields");
     }
     
     // Build audit entry
     const auditEntry = {
       audit_id: generateAuditId(),
       timestamp: new Date().toISOString(),
       event_type: eventData.event_type,
       event_category: determineEventCategory(eventData.event_type),
       action: eventData.action || eventData.event_type,
       outcome: eventData.outcome || "SUCCESS",
       
       actor_id: eventData.actor_id,
       actor_role: eventData.actor_role,
       actor_email: eventData.actor_email || null,
       
       trip_id: eventData.trip_id || null,
       user_id: eventData.user_id || null,
       
       from_state: eventData.from_state || null,
       to_state: eventData.to_state || null,
       previous_state: eventData.previous_state || null,
       new_state: eventData.new_state || null,
       
       context: {
         ip_address: eventData.ip_address || null,
         user_agent: eventData.user_agent || null,
         session_id: eventData.session_id || null,
         environment: process.env.WIX_ENV || "production",
         version: "v1.0.0",
         metadata: eventData.metadata || {}
       },
       
       notes: eventData.notes || null,
       override_reason: eventData.override_reason || null,
       user_contacted: eventData.user_contacted || false,
       escalation_target: eventData.escalation_target || null,
       resolution_notes: eventData.resolution_notes || null,
       
       retention_policy: determineRetentionPolicy(eventData.event_type),
       compliance_tags: eventData.compliance_tags || ["SOC2"],
       immutable: true,
       
       created_at: new Date().toISOString(),
       system_version: "v1.0.0",
       data_version: 1
     };
     
     // Insert into AuditLog collection
     return wixData.insert("AuditLog", auditEntry);
   }
   ```

2. Update all existing audit logging calls to use new function:
   - In `approveTrip.js`: Use `logAuditEvent()` with full schema
   - In `executeTrip.js`: Log execution attempts with outcome
   - In `processTrip.js`: Log validation and SENTINEL events
   - In `humanReviewRules.js`: Log approval queue additions

### Phase 3: User & System Action Logging

**Lee's Tasks**:
1. Add audit logging to user actions:
   - Trip creation: `TRIP_CREATED`
   - Trip submission: `TRIP_SUBMITTED`
   - Trip cancellation: `TRIP_CANCELLED_BY_USER`
   - Profile updates: `PROFILE_UPDATED`

2. Add audit logging to system actions:
   - State transitions: `STATE_TRANSITION`
   - Auto-approvals: `AUTO_APPROVED`
   - Retry attempts: `EXECUTION_RETRY`
   - SENTINEL evaluations: `SENTINEL_EVALUATED`

3. Ensure all actions capture:
   - `actor_id` (user ID for user actions, "SYSTEM" for system actions)
   - `actor_role` (USER, ADMIN, SYSTEM)
   - `event_category` (USER_ACTION, ADMIN_ACTION, SYSTEM_ACTION)

---

## 🎯 Decision Points for Lee + Madison Call

### Questions to Resolve

1. **State Snapshots**:
   - Should we store full `previous_state` and `new_state` objects, or just `from_state`/`to_state` strings?
   - **Madison's Recommendation**: Start with strings only (`from_state`/`to_state`) for V1. Add full snapshots in V2 if needed for detailed forensics.

2. **Backward Compatibility**:
   - Keep `admin_id` and `admin_email` fields for Sprint 1 code compatibility?
   - **Madison's Recommendation**: Yes, keep them marked as DEPRECATED. Remove in V2 after all code migrated to `actor_id`.

3. **Event Scope**:
   - Which user actions need auditing? All of them, or just critical ones?
   - **Madison's Recommendation**: 
     - **V1**: Audit critical user actions (trip created, submitted, cancelled)
     - **V2**: Expand to all user actions (login, profile updates, etc.)

4. **Performance**:
   - Will logging every action create performance issues?
   - **Lee's Concern**: Need to ensure async logging doesn't block trip processing
   - **Madison's Recommendation**: Make audit logging asynchronous (fire-and-forget) so it doesn't block user experience

5. **Compliance Tags**:
   - Which events need which compliance tags?
   - **Madison's Recommendation**: 
     - Default: `["SOC2"]` for all events
     - Add `["GDPR"]` for events touching user data
     - Add `["PCI"]` for payment-related events
     - Add `["LEGAL_HOLD"]` for rejections and policy violations

---

## 📝 Action Items

### For Lee:
- [ ] Review reconciled AuditLog schema (above)
- [ ] Update Wix Data Collection schema for AuditLog
- [ ] Update Trips collection schema (if any new fields from docs)
- [ ] Update AdminQueue collection schema (if any new fields from docs)
- [ ] Implement `logAuditEvent()` function in new `auditLogger.js` file
- [ ] Add audit logging to user actions (trip created, cancelled, etc.)
- [ ] Add audit logging to system actions (state transitions, retries, etc.)
- [ ] Make audit logging asynchronous (non-blocking)
- [ ] Test audit log performance under load

### For Madison:
- [ ] Update `WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md` with reconciled schema
- [ ] Update `DAY_14_ADMIN_AUTHORITY.md` with reconciled schema
- [ ] Remove or mark as DEPRECATED any speculative fields that don't exist
- [ ] Create `SCHEMA_CHANGELOG.md` documenting all changes from Sprint 1 → V1
- [ ] Update test cases in `V1_Test_Cases.md` to reference correct audit fields
- [ ] Update `adminSurfaces.js` documentation comments if needed

### For Both (Call Discussion):
- [ ] Agree on state snapshot approach (strings vs. objects)
- [ ] Agree on backward compatibility strategy (keep deprecated fields?)
- [ ] Agree on event scope for V1 (which actions to audit)
- [ ] Agree on compliance tagging strategy
- [ ] Agree on performance strategy (async logging, batching?)
- [ ] Set timeline for schema updates (Sprint 2 Week 1?)

---

## 🔗 References

### Sprint 1 Implementation
- [adminSurfaces.js](../src/backend/etas/adminSurfaces.js) — Lines 717-775 (AUDIT_REQUIREMENTS)

### Documentation (Written by Chat)
- [WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md](WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md) — Lines 350-375 (AuditLog schema)
- [DAY_14_ADMIN_AUTHORITY.md](DAY_14_ADMIN_AUTHORITY.md) — Audit event definitions

### Related Modules
- [approveTrip.js](../src/backend/etas/approveTrip.js) — Admin approval logging
- [executeTrip.js](../src/backend/etas/executeTrip.js) — Execution logging
- [processTrip.js](../src/backend/etas/processTrip.js) — Validation logging

---

## 🚨 Critical Note

**Documentation was speculative in some areas.** The Chat-generated schemas in `WAI_ENVIRONMENT_ARCHITECTURE_SETUP.md` and `DAY_14_ADMIN_AUTHORITY.md` were **aspirational** (what a complete system should have), not **descriptive** (what Sprint 1 actually implemented).

**Going forward**:
- This reconciliation document is the **source of truth**
- Code and docs must both align to this schema
- Any future changes require updating this document first

---

**Document Status**: 🔧 Active Alignment  
**Next Step**: Lee + Madison call to finalize decisions  
**Expected Completion**: Sprint 2 Week 1
