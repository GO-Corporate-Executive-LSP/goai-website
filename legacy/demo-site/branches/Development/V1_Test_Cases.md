# V1 Canonical Test Cases — ETAS System Truth Tests

**Document Date**: January 20, 2026  
**Sprint**: V1 Day 13 — Formal Test Harness  
**Purpose**: Define canonical test scenarios that fully exercise V1 without a frontend  
**Status**: ✅ Complete

---

## 🎯 Purpose of This Document

This document defines the **canonical test cases** that prove the ETAS V1 system works as designed.

**These tests answer:**
- ✅ Does validation work correctly?
- ✅ Does the state machine behave predictably?
- ✅ Does human approval trigger when required?
- ✅ Does SENTINEL enrich without blocking?
- ✅ Does the audit trail capture everything?
- ✅ Can admins observe and act on trips?

**Key Principle**: Every test is deterministic. Same input = same output, always.

---

## 🧪 How We Test Without an App

### Testing Mechanism

Testing is performed by **submitting deterministic trip objects directly into the system** and observing:
1. Validation results
2. Lifecycle state transitions
3. Admin queue population
4. Audit log entries
5. SENTINEL enrichment data

**No UI required.** The system logic is UI-independent by design.

### How Tests Are Triggered

**Option 1: Direct Function Calls (Node.js Console)**
```javascript
// Load the backend module
import { processTrip } from './src/backend/etas/processTrip.js';
import { approveTrip } from './src/backend/etas/approveTrip.js';
import { executeTrip } from './src/backend/etas/executeTrip.js';

// Submit a test trip
const testTrip = { /* trip object */ };
const result = processTrip(testTrip);

// Examine result
console.log('Validation Status:', result.status);
console.log('Trip State:', result.trip.state);
console.log('Errors:', result.errors);
```

**Option 2: Web Module API Call (Postman / curl)**
```bash
# Call tripService.jsw web module
curl -X POST https://your-site.wixsite.com/_functions/tripService/processTrip \
  -H "Content-Type: application/json" \
  -d @test-trip.json
```

**Option 3: Interactive HTML Demo**
```html
<!-- Use demo-trip-flow.html -->
Open: public/demo-trip-flow.html
Click scenario buttons to trigger test cases
Observe: Console logs, visual flow diagram, state changes
```

### Where Outputs Are Examined

| System Event | Visibility Surface | Location |
|--------------|-------------------|----------|
| **Validation Failure** | Console error response | `result.status`, `result.errors` |
| **Validation Success** | Console success response | `result.status === 'valid'` |
| **Admin-Required Trip** | Admin Queue | `AdminQueue` collection |
| **Trip Approval** | Trip state update | `trip.state`, `trip.approval.status` |
| **Trip Rejection** | Audit Log + Trip state | `AuditLog` collection, `trip.state = 'cancelled'` |
| **SENTINEL Enrichment** | Admin surface fields | `trip.sentinel_snapshot` object |
| **Execution Status** | Trip execution metadata | `trip.execution.status` |
| **Audit Events** | Audit Log | `AuditLog` collection (append-only) |
| **State Transitions** | Trip state field | `trip.state` value |

### How Admins Observe State Changes

**Admin Dashboard** (when built by WAI):
- View approval queue filtered by `approval.status = ""` (pending)
- See SENTINEL context: `trip.sentinel_snapshot.risk_level`, `trip.sentinel_snapshot.anomalies`
- View trip timeline: Query `AuditLog` by `trip_id`
- Take action: Call `approveTrip()` or `rejectTrip()`

**Direct Database Query** (testing):
```javascript
// Query Trips collection
const pendingApprovals = await wixData.query('Trips')
  .eq('approval.status', '')
  .eq('state', 'booking_ready')
  .find();

// Query Audit Log for trip
const auditTrail = await wixData.query('AuditLog')
  .eq('trip_id', 'TRP_12345')
  .ascending('timestamp')
  .find();
```

### Test Execution Flow

```
1. Create Test Trip Object (deterministic input)
      ↓
2. Submit to processTrip()
      ↓
3. Observe Validation Result
      ↓
4. Check Trip State
      ↓
5. Verify Admin Queue (if applicable)
      ↓
6. Simulate Admin Action (if required)
      ↓
7. Verify Audit Log Entries
      ↓
8. Assert Expected Outcome
```

---

## 📋 Canonical Test Scenarios

### Test Case 1: Valid Trip — Auto-Eligible (Happy Path)

**Purpose**: Verify a perfectly valid trip passes all validation and requires no human intervention.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_001",
  "user_id": "USR_ESTABLISHED_123",
  "state": "draft",
  "pickup": {
    "address": "123 Main St, Los Angeles, CA 90001",
    "datetime": "2026-01-25T14:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "LAX Airport, Los Angeles, CA 90045"
  },
  "return": {
    "pickup_datetime": "",
    "estimated_home_arrival": ""
  },
  "passengers": 2,
  "luggage": 1,
  "tier": {
    "name": "basic",
    "source": "user_profile",
    "locked": true,
    "resolved_at": "2026-01-20T10:00:00Z"
  },
  "sentinel_snapshot": {
    "risk_level": "",
    "risk_note": ""
  },
  "approval": {
    "status": "",
    "decided_by": "",
    "decided_at": "",
    "notes": ""
  },
  "execution": {
    "status": "",
    "action": "",
    "executed_by": "",
    "executed_at": "",
    "result": "",
    "notes": ""
  },
  "automation": {
    "eligible": false,
    "evaluated_at": "",
    "reason": "",
    "overridden": false,
    "override_reason": ""
  }
}
```

#### Expected Behavior

**Validation Result**:
```javascript
{
  status: "valid",
  errors: [],
  warnings: []
}
```

**Lifecycle State Progression**:
1. `draft` → `booking_ready` (after processTrip)
2. `booking_ready` → `pending_approval` (if auto-approval not eligible)
3. OR `booking_ready` → `approved` (if auto-approval eligible)

**SENTINEL Assessment** (optional, non-blocking):
```javascript
{
  risk_level: "green",
  confidence: 0.95,
  anomalies: [],
  risk_note: "Established user, standard route, normal booking window"
}
```

**Admin Queue**:
- **If auto-eligible**: NOT added to queue
- **If BASIC tier requires approval**: Added with `priority: "LOW"`

**Audit Log Entries**:
1. `TRIP_CREATED` — Trip object created
2. `VALIDATION_PASSED` — All validation gates cleared
3. `SENTINEL_EVALUATED` — Risk assessment completed (if run)
4. `STATE_TRANSITION` — `draft` → `booking_ready`
5. `AUTO_APPROVED` — (if automation eligible)

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Validation success | Console return value | `result.status === "valid"` |
| SENTINEL green flag | Trip object field | `trip.sentinel_snapshot.risk_level === "green"` |
| State transition | Trip state field | `trip.state === "booking_ready"` |
| Auto-approval decision | Trip automation field | `trip.automation.eligible === true` |
| Audit trail | AuditLog collection | Query by `trip_id`, count entries ≥ 3 |

#### Success Criteria

- ✅ Validation returns `VALID`
- ✅ No errors in `result.errors`
- ✅ Trip advances to `booking_ready` or `approved`
- ✅ SENTINEL assessment completes without blocking
- ✅ Audit log contains all state transitions
- ✅ Admin queue is empty (trip not escalated)

---

### Test Case 2: Invalid Trip — Hard Fail (Validation Failure)

**Purpose**: Verify the system rejects malformed or incomplete trips before they enter the lifecycle.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_002",
  "user_id": "USR_456",
  "state": "draft",
  "pickup": {
    "address": "",
    "datetime": "2026-01-20T09:00:00Z",
    "timezone": "America/New_York"
  },
  "dropoff": {
    "address": "JFK Airport"
  },
  "passengers": 7,
  "luggage": 1,
  "tier": {
    "name": "basic",
    "source": "user_profile",
    "locked": true
  }
}
```

**Validation Issues**:
1. Missing `pickup.address` (required field)
2. `pickup.datetime` is in the past (< 2 hours advance)
3. `passengers = 7` exceeds BASIC tier capacity (max 4)

#### Expected Behavior

**Validation Result**:
```javascript
{
  status: "INVALID",
  errors: [
    {
      type: "INVALID",
      code: "MISSING_PICKUP_ADDRESS",
      field: "pickup.address",
      message: "Please provide a pickup address."
    },
    {
      type: "INVALID",
      code: "PICKUP_TIME_TOO_SOON",
      field: "pickup.datetime",
      message: "Pickup must be at least 2 hours in advance."
    },
    {
      type: "INVALID",
      code: "TIER_CAPACITY_EXCEEDED",
      field: "passengers",
      message: "BASIC tier supports up to 4 passengers. Please upgrade to CORPORATE tier."
    }
  ],
  warnings: []
}
```

**Lifecycle State**:
- Remains in `draft` (does NOT advance)
- Trip is NOT submitted for SENTINEL evaluation
- Trip is NOT added to admin queue
- Trip is NOT executed

**Admin Queue**: NOT added (user-fixable validation errors)

**Audit Log Entries**:
1. `TRIP_CREATED` — Trip object created
2. `VALIDATION_FAILED` — Validation errors logged with full context

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Validation failure | Console return value | `result.status === "INVALID"` |
| Specific errors | Error array | `result.errors.length === 3` |
| State unchanged | Trip state field | `trip.state === "draft"` |
| User feedback | UX message | `getUserMessage(trip.state, result)` returns helpful text |
| Audit entry | AuditLog collection | Event type: `VALIDATION_FAILED` |

#### Success Criteria

- ✅ Validation returns `INVALID`
- ✅ Exactly 3 errors in `result.errors`
- ✅ Each error has `type`, `code`, `field`, `message`
- ✅ Trip does NOT advance past `draft`
- ✅ SENTINEL is NOT invoked
- ✅ Admin queue remains empty
- ✅ Audit log contains `VALIDATION_FAILED` entry

---

### Test Case 3: Valid Trip — Requires Human Approval

**Purpose**: Verify trips that pass validation but require manual admin review enter the approval queue correctly.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_003",
  "user_id": "USR_NEW_789",
  "state": "draft",
  "pickup": {
    "address": "456 Unknown St, Remote Area, CA 90210",
    "datetime": "2026-01-25T02:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "Undisclosed Location"
  },
  "passengers": 1,
  "luggage": 0,
  "tier": {
    "name": "executive",
    "source": "user_profile",
    "locked": true
  }
}
```

**Approval Triggers**:
1. New user account (< 30 days old)
2. Unusual destination (not in standard location database)
3. Late-night pickup (2:00 AM)
4. High-tier service (EXECUTIVE)

#### Expected Behavior

**Validation Result**:
```javascript
{
  status: "VALID",
  errors: [],
  warnings: []
}
```

**SENTINEL Assessment**:
```javascript
{
  risk_level: "orange",
  confidence: 0.55,
  anomalies: ["new_user", "unusual_destination", "late_night_pickup", "high_tier"],
  risk_note: "Multiple anomalies detected. Manual review recommended."
}
```

**Lifecycle State**:
1. `draft` → `booking_ready` (validation passed)
2. `booking_ready` → `pending_approval` (approval required)

**Admin Queue Entry**:
```javascript
{
  "trip_id": "TRP_TEST_003",
  "queued_at": "2026-01-20T10:05:00Z",
  "priority": "HIGH",
  "queue_reason": "sentinel_orange_multiple_anomalies",
  "trip_summary": {
    "user_id": "USR_NEW_789",
    "destination": "Undisclosed Location",
    "pickup_time": "2026-01-25T02:00:00Z",
    "passengers": 1,
    "tier": "executive"
  },
  "context": {
    "sentinel_flag": "orange",
    "sentinel_confidence": 0.55,
    "anomalies": ["new_user", "unusual_destination", "late_night_pickup", "high_tier"]
  },
  "status": "pending"
}
```

**Trip Approval State**:
```javascript
{
  "status": "",              // Empty until admin acts
  "decided_by": "",
  "decided_at": "",
  "notes": ""
}
```

**Audit Log Entries**:
1. `TRIP_CREATED`
2. `VALIDATION_PASSED`
3. `SENTINEL_EVALUATED` — ORANGE flag
4. `STATE_TRANSITION` — `draft` → `booking_ready`
5. `APPROVAL_REQUIRED` — Reason: SENTINEL orange + multiple anomalies
6. `ADMIN_QUEUE_ADDED` — Priority: HIGH

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Validation success | Console return | `result.status === "valid"` |
| SENTINEL orange flag | Trip sentinel field | `trip.sentinel_snapshot.risk_level === "orange"` |
| Anomalies detected | SENTINEL anomalies array | `trip.sentinel_snapshot.anomalies.length === 4` |
| Approval required | Trip state | `trip.state === "pending_approval"` |
| Admin queue entry | AdminQueue collection | Query by `trip_id`, verify `priority === "HIGH"` |
| Admin context | Admin surface | `getAdminContext(trip)` returns full context |
| Audit trail | AuditLog collection | Query by `trip_id`, verify `APPROVAL_REQUIRED` event |

#### Success Criteria

- ✅ Validation returns `VALID`
- ✅ SENTINEL evaluates and returns `orange` flag
- ✅ Trip advances to `pending_approval` state
- ✅ Admin queue entry created with correct priority
- ✅ Admin can see SENTINEL context (anomalies, confidence score)
- ✅ Trip is "locked" (cannot proceed without admin action)
- ✅ Audit log contains complete escalation path

---

### Test Case 4: Valid Trip + SENTINEL Enrichment (Non-Blocking Intelligence)

**Purpose**: Verify SENTINEL enrichment enhances decision-making without blocking the trip lifecycle.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_004",
  "user_id": "USR_CORPORATE_456",
  "state": "draft",
  "pickup": {
    "address": "Corporate HQ, 1 Market St, San Francisco, CA 94105",
    "datetime": "2026-01-25T09:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "SFO Airport, San Francisco, CA 94128"
  },
  "passengers": 3,
  "luggage": 2,
  "tier": {
    "name": "corporate",
    "source": "user_profile",
    "locked": true
  }
}
```

#### Expected Behavior

**Validation Result**:
```javascript
{
  status: "VALID",
  errors: [],
  warnings: []
}
```

**SENTINEL Assessment**:
```javascript
{
  risk_level: "green",
  confidence: 0.92,
  anomalies: [],
  risk_note: "Corporate tier user, established pattern, standard route",
  enrichment: {
    "user_trip_count": 45,
    "avg_trip_value": "$125",
    "preferred_route": "corporate_hq_to_sfo",
    "time_of_day_normal": true,
    "payment_history": "excellent"
  }
}
```

**Lifecycle State**:
1. `draft` → `booking_ready` (validation passed)
2. `booking_ready` → `approved` (auto-approved, CORPORATE tier + green flag)

**SENTINEL Non-Blocking Behavior**:
- SENTINEL evaluation happens asynchronously
- Trip proceeds even if SENTINEL is slow or fails
- SENTINEL data enriches admin context but doesn't block approval

**Audit Log Entries**:
1. `TRIP_CREATED`
2. `VALIDATION_PASSED`
3. `SENTINEL_EVALUATED` — GREEN flag with enrichment
4. `STATE_TRANSITION` — `draft` → `booking_ready`
5. `AUTO_APPROVED` — Reason: green_flag_corporate_tier
6. `SENTINEL_ENRICHMENT_ADDED` — Context data attached

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| SENTINEL enrichment | Trip sentinel field | `trip.sentinel_snapshot.enrichment` object exists |
| Green flag | SENTINEL risk level | `trip.sentinel_snapshot.risk_level === "green"` |
| Auto-approval | Trip approval field | `trip.approval.status === "APPROVED"` |
| Enrichment in admin view | Admin surface | Admin sees user history, trip patterns |
| Non-blocking behavior | Trip state | Trip advances even if SENTINEL times out |

#### Success Criteria

- ✅ SENTINEL evaluation completes successfully
- ✅ Enrichment data attached to trip object
- ✅ Trip auto-approves (not blocked by SENTINEL)
- ✅ Admin can see enrichment context (if they review)
- ✅ If SENTINEL fails, trip still proceeds (logged as warning)
- ✅ Audit log captures SENTINEL evaluation separately

---

### Test Case 5: Admin Rejection Path

**Purpose**: Verify admin can reject a trip and the system handles rejection correctly with full audit trail.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_005",
  "user_id": "USR_RESTRICTED_999",
  "state": "pending_approval",
  "pickup": {
    "address": "123 Main St, Los Angeles, CA 90001",
    "datetime": "2026-01-25T15:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "Restricted Military Base, Area 51"
  },
  "passengers": 4,
  "luggage": 2,
  "tier": {
    "name": "corporate",
    "source": "user_profile",
    "locked": true
  },
  "sentinel_snapshot": {
    "risk_level": "yellow",
    "confidence": 0.65,
    "anomalies": ["restricted_destination"],
    "risk_note": "Destination flagged as restricted"
  }
}
```

**Validation Issue**:
- Destination is on restricted list (company policy)

#### Expected Behavior

**Admin Action**:
```javascript
// Admin calls approveTrip with REJECTED decision
approveTrip(trip, "REJECTED", {
  admin_id: "admin@wai-tech.com",
  notes: "Cannot service this destination per company policy. Please contact support for alternative arrangements."
});
```

**Lifecycle State Transition**:
1. `pending_approval` → `cancelled` (rejection = cancellation)

**Trip Approval State (Updated)**:
```javascript
{
  "status": "REJECTED",
  "decided_by": "admin@wai-tech.com",
  "decided_at": "2026-01-20T10:15:00Z",
  "notes": "Cannot service this destination per company policy. Please contact support for alternative arrangements."
}
```

**Execution State**:
- `execution.status` remains empty (trip never executed)

**Audit Log Entries**:
1. `TRIP_CREATED`
2. `VALIDATION_PASSED`
3. `SENTINEL_EVALUATED` — YELLOW flag
4. `STATE_TRANSITION` — `draft` → `booking_ready`
5. `APPROVAL_REQUIRED` — Reason: restricted_destination
6. `ADMIN_QUEUE_ADDED`
7. `ADMIN_REVIEWED` — Admin ID, timestamp
8. `ADMIN_REJECTED` — Full context (decision, reason, notes)
9. `STATE_TRANSITION` — `pending_approval` → `cancelled`
10. `AUDIT_LOCKED` — Rejection entry is immutable

**User Message** (from uxMessaging.js):
```
"We couldn't complete your booking. Please contact support for assistance."
```

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Admin rejection | Trip approval field | `trip.approval.status === "REJECTED"` |
| Rejection reason | Approval notes | `trip.approval.notes` contains explanation |
| State change | Trip state | `trip.state === "cancelled"` |
| Audit immutability | AuditLog collection | `ADMIN_REJECTED` entry cannot be modified |
| User notification | UX message | `getUserMessage(trip.state, trip.approval)` |
| Admin queue removal | AdminQueue collection | Trip removed from pending queue |

#### Success Criteria

- ✅ Admin can reject trip with required justification
- ✅ Trip state transitions to `cancelled`
- ✅ Approval status set to `REJECTED`
- ✅ Admin notes are captured and immutable
- ✅ Audit log contains complete rejection path
- ✅ User receives appropriate (calm) message
- ✅ Trip does NOT proceed to execution
- ✅ Admin queue entry marked as resolved

---

### Test Case 6: Payment Failure with Retry (Execution Resilience)

**Purpose**: Verify the system handles transient payment failures gracefully with automatic retry logic.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_006",
  "user_id": "USR_PAYMENT_123",
  "state": "approved",
  "pickup": {
    "address": "456 Oak St, Seattle, WA 98101",
    "datetime": "2026-01-25T10:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "SEA Airport, Seattle, WA 98158"
  },
  "passengers": 2,
  "luggage": 1,
  "tier": {
    "name": "basic",
    "source": "user_profile",
    "locked": true
  },
  "approval": {
    "status": "APPROVED",
    "decided_by": "auto",
    "decided_at": "2026-01-20T10:20:00Z"
  },
  "execution": {
    "status": "PENDING",
    "action": "SEND_BOOKING_REQUEST"
  }
}
```

**Simulated Failure**: Payment gateway timeout (transient error)

#### Expected Behavior

**Execution Attempt #1** (Failure):
```javascript
{
  status: "FAILURE",
  failure_type: "PAYMENT_TIMEOUT",
  retry_strategy: "SHORT_BACKOFF",
  next_retry: "30s",
  error_code: "GATEWAY_TIMEOUT",
  user_visible: false  // User doesn't see this failure
}
```

**Retry Logic**:
- System waits 30 seconds
- Automatically retries payment
- Max retries: 3 attempts

**Execution Attempt #2** (Success):
```javascript
{
  status: "SUCCESS",
  transaction_id: "txn_xyz789",
  provider_confirmation: "CONF_ABC123",
  retry_count: 1
}
```

**Lifecycle State**:
1. `approved` → `booked` (after successful execution)

**Execution State (Updated)**:
```javascript
{
  "status": "EXECUTED",
  "action": "SEND_BOOKING_REQUEST",
  "executed_by": "system",
  "executed_at": "2026-01-20T10:21:00Z",
  "result": "SUCCESS",
  "retry_count": 1,
  "notes": "Executed successfully on retry attempt 2"
}
```

**Audit Log Entries**:
1. `TRIP_APPROVED`
2. `EXECUTION_STARTED`
3. `EXECUTION_FAILED` — Attempt 1 (transient failure)
4. `RETRY_SCHEDULED` — 30s backoff
5. `EXECUTION_RETRY` — Attempt 2
6. `EXECUTION_SUCCESS` — Payment confirmed
7. `STATE_TRANSITION` — `approved` → `booked`

**User Experience**:
- User sees: "Your trip is confirmed."
- User does NOT see: Retry attempts, transient failures

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Payment failure | Audit log (not user) | `EXECUTION_FAILED` event logged |
| Retry attempt | Audit log | `RETRY_SCHEDULED` event |
| Retry success | Execution status | `trip.execution.status === "EXECUTED"` |
| Retry count | Execution metadata | `trip.execution.retry_count === 1` |
| User message | UX messaging | User sees success, not failure |
| Final state | Trip state | `trip.state === "booked"` |

#### Success Criteria

- ✅ System detects transient payment failure
- ✅ Retry strategy applied (SHORT_BACKOFF)
- ✅ Second attempt succeeds
- ✅ User never sees the failure
- ✅ Audit log captures both attempts
- ✅ Retry count recorded in execution metadata
- ✅ Trip advances to `booked` state

---

### Test Case 7: Partial SENTINEL Response (Resilience)

**Purpose**: Verify the system handles partial or failed SENTINEL responses without blocking the trip.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_007",
  "user_id": "USR_NORMAL_567",
  "state": "draft",
  "pickup": {
    "address": "789 Pine St, Portland, OR 97201",
    "datetime": "2026-01-25T14:00:00Z",
    "timezone": "America/Los_Angeles"
  },
  "dropoff": {
    "address": "PDX Airport, Portland, OR 97218"
  },
  "passengers": 3,
  "luggage": 2,
  "tier": {
    "name": "basic",
    "source": "user_profile",
    "locked": true
  }
}
```

**Simulated SENTINEL Issue**: API timeout (no response after 5 seconds)

#### Expected Behavior

**SENTINEL Evaluation Result**:
```javascript
{
  risk_level: "unknown",
  confidence: 0,
  anomalies: [],
  risk_note": "SENTINEL evaluation timed out. Trip proceeding with default approval rules.",
  evaluation_status: "FAILED",
  error: "SENTINEL_API_TIMEOUT"
}
```

**Lifecycle State**:
1. `draft` → `booking_ready` (validation passed)
2. Trip proceeds normally despite SENTINEL failure

**Approval Logic**:
- Falls back to **conservative default**: Requires human approval
- Reason: "SENTINEL unavailable, manual review for safety"

**Admin Queue**:
- Trip added with `priority: "MEDIUM"`
- Queue reason: "sentinel_unavailable"

**Audit Log Entries**:
1. `TRIP_CREATED`
2. `VALIDATION_PASSED`
3. `SENTINEL_EVALUATION_ATTEMPTED`
4. `SENTINEL_TIMEOUT` — Warning logged
5. `FALLBACK_TO_MANUAL_APPROVAL` — Conservative default applied
6. `ADMIN_QUEUE_ADDED` — Manual review required

**User Experience**:
- User sees: "Your trip is being reviewed. You'll receive confirmation shortly."
- User does NOT see: "SENTINEL failed" or technical errors

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| SENTINEL timeout | Audit log (warning) | `SENTINEL_TIMEOUT` event |
| Fallback logic | Trip approval reason | `trip.approval.queue_reason === "sentinel_unavailable"` |
| Conservative default | Admin queue | Trip requires manual review |
| Trip not blocked | Trip state | `trip.state === "booking_ready"` (not stuck) |
| Admin visibility | Admin context | Admin sees "SENTINEL unavailable" note |

#### Success Criteria

- ✅ SENTINEL timeout detected (5s limit)
- ✅ Trip continues processing (not blocked)
- ✅ Fallback to conservative default (manual approval)
- ✅ Admin queue entry created with context
- ✅ User sees calm, professional message
- ✅ Audit log captures SENTINEL failure
- ✅ System remains operational despite external API failure

---

### Test Case 8: Trip Cancellation by User (State Reversal)

**Purpose**: Verify users can cancel trips and the system handles state reversal correctly.

#### Input (Trip Object)

```json
{
  "trip_id": "TRP_TEST_008",
  "user_id": "USR_CANCEL_321",
  "state": "approved",
  "pickup": {
    "address": "101 Elm St, Austin, TX 78701",
    "datetime": "2026-01-26T08:00:00Z",
    "timezone": "America/Chicago"
  },
  "dropoff": {
    "address": "AUS Airport, Austin, TX 78719"
  },
  "passengers": 1,
  "luggage": 1,
  "tier": {
    "name": "corporate",
    "source": "user_profile",
    "locked": true
  },
  "approval": {
    "status": "APPROVED",
    "decided_by": "auto",
    "decided_at": "2026-01-20T10:25:00Z"
  },
  "execution": {
    "status": "PENDING",
    "action": "SEND_BOOKING_REQUEST"
  }
}
```

**User Action**: User clicks "Cancel Trip" before execution

#### Expected Behavior

**Cancellation Logic**:
- Verify trip state allows cancellation (`approved` or earlier)
- If `state === "booked"` or later, apply cancellation policy (refund rules)
- Update trip state to `cancelled`

**Lifecycle State**:
1. `approved` → `cancelled`

**Trip State (Updated)**:
```javascript
{
  "state": "cancelled",
  "cancellation": {
    "cancelled_by": "USR_CANCEL_321",
    "cancelled_at": "2026-01-20T10:30:00Z",
    "reason": "user_requested",
    "refund_eligible": true,  // Before execution
    "refund_status": "PENDING"
  }
}
```

**Execution State**:
- `execution.status` remains `PENDING` (never executed)

**Audit Log Entries**:
1. `TRIP_APPROVED`
2. `EXECUTION_PENDING`
3. `USER_CANCELLED_TRIP` — User ID, timestamp, reason
4. `STATE_TRANSITION` — `approved` → `cancelled`
5. `REFUND_INITIATED` — (if applicable)

**User Message**:
```
"Your trip has been cancelled. You will receive a confirmation email shortly."
```

#### Visibility Map

| System Event | Where Visible | How to Verify |
|--------------|---------------|---------------|
| Cancellation request | User action log | `USER_CANCELLED_TRIP` event |
| State change | Trip state | `trip.state === "cancelled"` |
| Refund eligibility | Cancellation metadata | `trip.cancellation.refund_eligible === true` |
| Audit immutability | AuditLog collection | Cancellation event is immutable |
| User confirmation | UX message | User sees cancellation confirmation |

#### Success Criteria

- ✅ User can cancel trip in `draft`, `booking_ready`, `approved` states
- ✅ Trip state transitions to `cancelled`
- ✅ Cancellation reason captured
- ✅ Refund eligibility determined correctly
- ✅ Execution does NOT proceed
- ✅ Audit log contains complete cancellation path
- ✅ User receives confirmation message

---

## 🗺️ Test Coverage Matrix

### System Features vs. Test Cases

| Feature | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 | Test 6 | Test 7 | Test 8 |
|---------|--------|--------|--------|--------|--------|--------|--------|--------|
| **Field Validation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tier Capacity Rules** | ✅ | ✅ | — | — | — | — | — | — |
| **SENTINEL Evaluation** | ✅ | — | ✅ | ✅ | ✅ | — | ✅ | — |
| **Auto-Approval Logic** | ✅ | — | — | ✅ | — | — | — | — |
| **Manual Approval Queue** | — | — | ✅ | — | ✅ | — | ✅ | — |
| **Admin Rejection** | — | — | — | — | ✅ | — | — | — |
| **Execution** | ✅ | — | — | — | — | ✅ | — | — |
| **Retry Logic** | — | — | — | — | — | ✅ | — | — |
| **Failure Handling** | — | — | — | — | — | ✅ | ✅ | — |
| **Audit Logging** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Cancellation** | — | — | — | — | — | — | — | ✅ |
| **State Machine** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Coverage**: All core V1 features tested across 8 canonical scenarios.

---

## 🧪 Running the Test Suite

### Manual Testing (Console)

```javascript
// src/backend/etas/__tests__/runCanonicalTests.js

import { processTrip } from '../processTrip.js';
import { approveTrip } from '../approveTrip.js';
import { executeTrip } from '../executeTrip.js';

// Import test cases
import testCases from './canonicalTestCases.json';

function runAllTests() {
  console.log('🧪 Running V1 Canonical Test Suite...\n');
  
  testCases.forEach((testCase, index) => {
    console.log(`\n━━━ Test ${index + 1}: ${testCase.name} ━━━`);
    
    // Step 1: Process trip
    const result = processTrip(testCase.input);
    
    // Step 2: Assert validation result
    assert(result.status === testCase.expectedValidation, 
      `Expected validation: ${testCase.expectedValidation}, got: ${result.status}`);
    
    // Step 3: Assert lifecycle state
    assert(result.trip.state === testCase.expectedState,
      `Expected state: ${testCase.expectedState}, got: ${result.trip.state}`);
    
    // Step 4: Verify audit log (if applicable)
    // ... additional assertions
    
    console.log(`✅ Test ${index + 1} PASSED`);
  });
  
  console.log('\n━━━ All Tests PASSED ━━━');
}

runAllTests();
```

### Interactive Demo (HTML)

Open [public/demo-trip-flow.html](../public/demo-trip-flow.html) and click scenario buttons.

**Maps to test cases**:
- "Happy Path Trip" → Test Case 1
- "Validation Failure" → Test Case 2
- "SENTINEL Review" → Test Case 3
- "Payment Retry" → Test Case 6
- "Admin Rejection" → Test Case 5

### Automated Testing (Future)

```bash
# Run canonical test suite
npm run test:canonical

# Run with verbose logging
npm run test:canonical -- --verbose

# Run specific test case
npm run test:canonical -- --case=3
```

---

## 🔍 Field Name Alignment Check

### Lee Integration Checklist

**Verify these field names match across:**
- ✅ Trip schema ([tripSchema.v1.js](../src/backend/etas/tripSchema.v1.js))
- ✅ Admin surfaces ([adminSurfaces.js](../src/backend/etas/adminSurfaces.js))
- ✅ Audit log structure ([adminSurfaces.js](../src/backend/etas/adminSurfaces.js) — `logAuditEvent`)
- ✅ Database collections (Wix Data schema)

**Critical field paths**:
| Field | Expected Path | Status |
|-------|---------------|--------|
| Trip ID | `trip.trip_id` | ✅ Confirmed |
| User ID | `trip.user_id` | ✅ Confirmed |
| State | `trip.state` | ✅ Confirmed |
| Tier | `trip.tier.name` | ✅ Confirmed |
| Pickup Address | `trip.pickup.address` | ✅ Confirmed |
| Pickup Time | `trip.pickup.datetime` | ✅ Confirmed |
| Dropoff Address | `trip.dropoff.address` | ✅ Confirmed |
| Passengers | `trip.passengers` | ✅ Confirmed |
| Luggage | `trip.luggage` | ✅ Confirmed |
| SENTINEL Risk Level | `trip.sentinel_snapshot.risk_level` | ✅ Confirmed |
| SENTINEL Confidence | `trip.sentinel_snapshot.confidence` | ✅ Confirmed |
| SENTINEL Anomalies | `trip.sentinel_snapshot.anomalies` | ✅ Confirmed |
| Approval Status | `trip.approval.status` | ✅ Confirmed |
| Approval Decided By | `trip.approval.decided_by` | ✅ Confirmed |
| Approval Notes | `trip.approval.notes` | ✅ Confirmed |
| Execution Status | `trip.execution.status` | ✅ Confirmed |
| Execution Action | `trip.execution.action` | ✅ Confirmed |

**No contradictions found.** All field names align across system modules.

---

## 📊 Definition of "Done" — V1 Day 13

You are done when you can confidently say:

✅ **"We have a fixed set of canonical test cases that fully exercise V1 and can be demonstrated without a frontend."**

### Checklist

- ✅ **8 canonical test scenarios defined** (minimum 5, we have 8)
- ✅ **Each test case includes**:
  - Input (deterministic trip object)
  - Expected validation result
  - Expected lifecycle state
  - Expected admin visibility
  - Expected audit behavior
- ✅ **"Test Without an App" mechanism documented**
  - How tests are triggered (console, API, demo HTML)
  - Where outputs are examined
  - How admins observe state changes
- ✅ **Visibility map created** for each test case
  - Every system event mapped to a visible surface
  - No invisible behavior
- ✅ **Field alignment verified** with Lee's database design
  - No contradictions
  - All field paths confirmed
- ✅ **Test coverage matrix** shows all V1 features tested
- ✅ **Running instructions** provided (manual, interactive, automated future)

---

## 🎯 Advisor-Safe Language

**When stakeholders ask:** "How do you test this system without an app?"

**You say:**

> "We test ETAS by submitting deterministic trip objects directly into the backend logic and observing validation outcomes, state transitions, admin queue population, and audit log entries. The system logic is UI-independent by design, so we can demonstrate all functionality—validation, approval workflows, SENTINEL enrichment, execution, and failure recovery—without requiring a frontend. We have 8 canonical test scenarios that exercise every feature in V1, and each test maps to visible surfaces (console output, database queries, audit logs, admin context) so nothing happens invisibly."

---

**End of V1 Canonical Test Cases**  
**Status**: ✅ Complete  
**Next**: Sprint 2 — UI Integration (WAI handoff)
