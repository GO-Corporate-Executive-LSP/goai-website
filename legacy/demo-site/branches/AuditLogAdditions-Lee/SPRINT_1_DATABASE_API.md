# Trip Booking API Documentation

**Module**: `tripBookingApi.js`  
**Purpose**: Core API endpoints for trip lifecycle management  
**Status**: ✅ Active  
**Aligned with**: Sprint Days 3, 5, 6, 9

---

## 🎯 API Overview

**"The operational interface between users, admins, and the trip management system."**

This API provides:
- ✅ Trip creation and validation
- ✅ Submission and review routing
- ✅ Status checking with role-based permissions
- ✅ Cancellation handling

**These endpoints enforce business rules while maintaining operational transparency.**

---

## 📋 Available Endpoints

### Summary Table

| Endpoint | Method | Purpose | Who Can Use | State Changes |
|----------|--------|---------|-------------|---------------|
| **createTrip** | POST | Create new trip in draft | Users | → draft |
| **validateTripEndpoint** | POST | Validate trip data | Users, Admins | (no change) |
| **submitTrip** | POST | Submit for booking | Users | draft/needs_adjustment → submitted/pending_approval |
| **getTripStatus** | GET | Get trip details + actions | Users (own), Admins (all) | (no change) |
| **cancelTrip** | POST | Cancel trip | Users (own), Admins (all) | * → cancelled |
| **getUserTrips** | GET | List user's trips | Users (own), Admins (all) | (no change) |

---

## 🔌 Endpoint Details

### ENDPOINT 1: Create Trip

**Function**: `createTrip(tripData)`

**Purpose**: Initialize a new trip in draft state with complete tracking structure

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tripData.user_id** | string | ✅ Yes | User creating the trip |
| **tripData.user_email** | string | ❌ No | User email for notifications |
| **tripData.pickup.address** | string | ❌ No | Pickup location |
| **tripData.pickup.datetime** | string | ❌ No | Pickup time (ISO 8601) |
| **tripData.pickup.timezone** | string | ❌ No | Timezone (default: America/New_York) |
| **tripData.dropoff.address** | string | ❌ No | Destination address |
| **tripData.return.pickup_datetime** | string | ❌ No | Return trip pickup time |
| **tripData.passengers** | number | ❌ No | Number of passengers (default: 1) |
| **tripData.luggage** | number | ❌ No | Number of luggage pieces (default: 0) |
| **tripData.tier.name** | string | ❌ No | Service tier (BASIC/CORPORATE/EXECUTIVE) |
| **tripData.user_notes** | string | ❌ No | User-provided notes |

#### Response Structure

```javascript
{
  success: true,
  trip: {
    trip_id: "TRP_abc123",
    user_id: "user_456",
    state: {
      current_state: "draft",
      previous_state: null,
      time_in_state: null,
      state_changed_at: "2026-01-18T14:30:00Z"
    },
    pickup: { address: "123 Main St", datetime: "...", timezone: "..." },
    dropoff: { address: "456 Oak Ave" },
    passengers: 2,
    luggage: 1,
    admin_context: {
      approval: { status: "", decided_by: "human", ... },
      automation: { eligible: false, ... },
      execution: { status: "", ... },
      failure: { failure_type: "", failure_reason: "" },
      retries: { retry_count: "", last_retry_at: "" },
      created_at: "2026-01-18T14:30:00Z",
      updated_at: "2026-01-18T14:30:00Z"
    }
  },
  message: "Trip created in draft state"
}
```

#### Error Response

```javascript
{
  success: false,
  error: "user_id is required"
}
```

#### Side Effects

- ✅ Generates unique trip_id
- ✅ Initializes admin_context structure (aligned with DAY_9)
- ✅ Saves trip to database

#### Example Usage

```javascript
const result = await createTrip({
  user_id: "user_123",
  user_email: "john@example.com",
  pickup: {
    address: "123 Main St, Los Angeles, CA",
    datetime: "2026-01-20T14:00:00Z",
    timezone: "America/Los_Angeles"
  },
  dropoff: {
    address: "LAX Airport"
  },
  passengers: 2,
  luggage: 2
});
```

---

### ENDPOINT 2: Validate Trip

**Function**: `validateTripEndpoint(tripId, context)`

**Purpose**: Run validation checks without changing trip state

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tripId** | string | ✅ Yes | Trip to validate |
| **context** | object | ❌ No | Additional validation context |
| **context.failureCount** | number | ❌ No | Number of previous failures (for retry logic) |

#### Response Structure

```javascript
{
  success: true,
  validation: {
    status: "VALID" | "INVALID" | "BLOCKED",
    errors: [
      {
        code: "MISSING_PICKUP",
        field: "pickup.address",
        message: "Pickup address is required",
        severity: "ERROR"
      }
    ],
    warnings: [
      {
        code: "SHORT_NOTICE",
        message: "Trip is less than 24 hours away",
        severity: "WARNING"
      }
    ]
  },
  trip: { /* trip object */ }
}
```

#### Validation Statuses

| Status | Description | Can Submit |
|--------|-------------|------------|
| **VALID** | All checks passed | ✅ Yes |
| **INVALID** | Has errors but not blocking | ⚠️ With warnings |
| **BLOCKED** | Has blocking errors | ❌ No |

#### Side Effects

- ✅ Logs validation outcome (VALIDATION_PASSED/FAILED/BLOCKED)
- ❌ Does NOT change trip state

#### Example Usage

```javascript
const result = await validateTripEndpoint("TRP_abc123", {
  failureCount: 0
});

if (result.validation.status === "VALID") {
  console.log("✅ Trip is ready to submit");
} else {
  console.log("❌ Errors:", result.validation.errors);
}
```

---

### ENDPOINT 3: Submit Trip

**Function**: `submitTrip(tripId)`

**Purpose**: Submit validated trip for booking, routing to human review if needed

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tripId** | string | ✅ Yes | Trip to submit |

#### State Requirements

- **Allowed from**: draft, needs_adjustment
- **Blocked from**: All other states

#### Response Structure

```javascript
{
  success: true,
  trip: { /* updated trip */ },
  needsReview: false,
  nextState: "submitted",
  nextAction: "READY_FOR_BOOKING",
  message: "Your trip is ready for booking"
}
```

#### When Human Review Required

```javascript
{
  success: true,
  trip: { /* updated trip */ },
  needsReview: true,
  nextState: "pending_approval",
  nextAction: "WAIT_FOR_APPROVAL",
  message: "Your trip is being reviewed"
}
```

#### State Transition Logic

```
┌─────────────────────────────────────────────────┐
│  SUBMIT TRIP                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Validate trip is in draft/needs_adjustment  │
│  2. Run final validation checks                 │
│  3. Check if human review required              │
│     │                                            │
│     ├─ Review Required                          │
│     │  └─> pending_approval                     │
│     │      ├─ Add to admin queue                │
│     │      ├─ Set escalation_reason             │
│     │      └─ Log ADDED_TO_REVIEW_QUEUE         │
│     │                                            │
│     └─ No Review                                │
│        └─> submitted                            │
│            └─ Ready for booking                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Human Review Triggers (Day 5)

Common triggers that route to pending_approval:
- High-value trips (tier-dependent thresholds)
- Multiple passengers beyond tier limit
- Short notice bookings
- Unusual routes or requests
- SENTINEL risk flags (yellow/orange/red)
- First-time user patterns

#### Side Effects

- ✅ Updates trip state (draft/needs_adjustment → submitted/pending_approval)
- ✅ Adds to admin queue if review needed (aligned with DAY_9)
- ✅ Updates admin_context timestamps
- ✅ Logs STATE_CHANGED event
- ✅ Logs ADDED_TO_REVIEW_QUEUE if applicable
- ✅ Sets escalation_reason if auto-escalated

#### Error Response

```javascript
{
  success: false,
  error: "Cannot submit trip in completed state. Trip must be in draft or needs_adjustment state."
}
```

#### Example Usage

```javascript
const result = await submitTrip("TRP_abc123");

if (result.needsReview) {
  console.log("⏳ Waiting for admin approval");
  console.log("Next action:", result.nextAction); // "WAIT_FOR_APPROVAL"
} else {
  console.log("✅ Ready for booking");
  console.log("Next action:", result.nextAction); // "READY_FOR_BOOKING"
}
```

---

### ENDPOINT 4: Get Trip Status

**Function**: `getTripStatus(tripId, userId, userRole)`

**Purpose**: Retrieve trip details with role-appropriate context and allowed actions

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tripId** | string | ✅ Yes | Trip to retrieve |
| **userId** | string | ✅ Yes | User requesting status |
| **userRole** | string | ❌ No | Role (user/admin/system), default: "user" |

#### Authorization Rules

| Role | Can View | Restrictions |
|------|----------|--------------|
| **user** | Own trips only | Must match trip.user_id |
| **admin** | All trips | No restrictions |
| **system** | All trips | No restrictions |

#### Response Structure

```javascript
{
  success: true,
  trip: { /* full trip object */ },
  allowedActions: ["view_trip", "cancel_trip", "update_trip"],
  requiresAction: false,
  message: "Your trip is ready for booking",
  messageTitle: "Trip Submitted"
}
```

#### User-Friendly Messages (Day 5 Integration)

Messages vary by state and context:

| State | Message Example |
|-------|-----------------|
| **draft** | "Complete your trip details to continue" |
| **submitted** | "Your trip is being processed" |
| **pending_approval** | "Our team is reviewing your trip" |
| **needs_adjustment** | "Please review and update your trip details" |
| **approved** | "Your trip has been approved" |
| **booked** | "Your trip is confirmed" |
| **cancelled** | "This trip has been cancelled" |

#### Allowed Actions by Role (Day 6 Integration)

Actions returned are filtered based on:
1. User's role (user/admin/system)
2. Current trip state
3. Ownership (users can only act on own trips)

Example for user role, draft state:
```javascript
allowedActions: [
  "view_trip",
  "update_trip",
  "submit_trip",
  "cancel_trip"
]
```

Example for admin role, pending_approval state:
```javascript
allowedActions: [
  "view_trip",
  "approve_trip",
  "request_adjustment",
  "escalate",
  "cancel_trip"
]
```

#### Side Effects

- ✅ Logs PERMISSION_DENIED if unauthorized access attempted
- ❌ Does NOT change trip state
- ❌ Does NOT modify trip data

#### Error Response - Not Found

```javascript
{
  success: false,
  error: "Trip not found"
}
```

#### Error Response - Unauthorized

```javascript
{
  success: false,
  error: "Not authorized to view this trip"
}
```

#### Example Usage

```javascript
// User checking their own trip
const result = await getTripStatus(
  "TRP_abc123", 
  "user_456", 
  "user"
);

console.log("State:", result.trip.state.current_state);
console.log("Can do:", result.allowedActions);
console.log("Message:", result.message);

// Admin checking any trip
const adminResult = await getTripStatus(
  "TRP_abc123",
  "admin_789",
  "admin"
);
```

---

### ENDPOINT 5: Cancel Trip

**Function**: `cancelTrip(tripId, userId, userRole, reason)`

**Purpose**: Cancel a trip with proper authorization

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tripId** | string | ✅ Yes | Trip to cancel |
| **userId** | string | ✅ Yes | User cancelling trip |
| **userRole** | string | ❌ No | Role (user/admin), default: "user" |
| **reason** | string | ❌ No | Cancellation reason |

#### Authorization Rules (Day 6)

| Role | Can Cancel | When | Restrictions |
|------|------------|------|--------------|
| **user** | Own trips | Before completion | Must own trip |
| **admin** | All trips | Anytime | Reason recommended |

#### Permission Check Flow

```
┌─────────────────────────────────────┐
│  Check Permission to Cancel         │
├─────────────────────────────────────┤
│                                     │
│  canPerformAction(                  │
│    userRole,                        │
│    "cancel_trip",                   │
│    trip,                            │
│    userId                           │
│  )                                  │
│     │                               │
│     ├─ Allowed                      │
│     │  └─> Proceed with cancel      │
│     │                               │
│     └─ Denied                       │
│        └─> Return error             │
│            └─> Log PERMISSION_DENIED│
│                                     │
└─────────────────────────────────────┘
```

#### Response Structure

```javascript
{
  success: true,
  trip: { 
    /* trip with state.current_state = "cancelled" */ 
  },
  message: "Trip cancelled successfully"
}
```

#### State Changes

| From State | To State | Notes |
|------------|----------|-------|
| draft | cancelled | ✅ Allowed |
| submitted | cancelled | ✅ Allowed |
| pending_approval | cancelled | ✅ Allowed |
| needs_adjustment | cancelled | ✅ Allowed |
| approved | cancelled | ✅ Allowed |
| booked | cancelled | ✅ Allowed (may require refund) |
| completed | cancelled | ❌ Blocked |
| cancelled | cancelled | ❌ Already cancelled |

#### Admin Context Updates (Day 9)

When admin cancels:
```javascript
admin_context: {
  last_admin_action: "cancel",
  last_admin_user: "admin_789",
  admin_notes: "Customer requested cancellation due to flight delay",
  updated_at: "2026-01-18T15:45:00Z"
}
```

#### Side Effects

- ✅ Updates state to cancelled
- ✅ Updates admin_context if admin cancelled

#### Error Response - Permission Denied

```javascript
{
  success: false,
  error: "You do not have permission to cancel this trip"
}
```

#### Error Response - Invalid State

```javascript
{
  success: false,
  error: "Cannot cancel completed trips"
}
```

#### Example Usage

```javascript
// User cancelling their own trip
const result = await cancelTrip(
  "TRP_abc123",
  "user_456",
  "user",
  "Plans changed"
);

// Admin cancelling any trip
const adminResult = await cancelTrip(
  "TRP_abc123",
  "admin_789",
  "admin",
  "Customer requested cancellation due to flight delay"
);
```

---

### ENDPOINT 6: Get User Trips

**Function**: `getUserTrips(userId, limit)`

**Purpose**: Retrieve all trips for a specific user

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **userId** | string | ✅ Yes | User whose trips to retrieve |
| **limit** | number | ❌ No | Max trips to return (default: 50) |

#### Response Structure

```javascript
{
  success: true,
  trips: [
    { trip_id: "TRP_abc123", state: "booked", ... },
    { trip_id: "TRP_def456", state: "draft", ... },
    { trip_id: "TRP_ghi789", state: "completed", ... }
  ],
  count: 3
}
```

#### Sorting

Trips are returned in reverse chronological order (newest first) based on `created_at` timestamp.

#### Side Effects

- ❌ Does NOT change any trip states
- ❌ Does NOT log audit events (read-only operation)

#### Example Usage

```javascript
// Get last 50 trips for user
const result = await getUserTrips("user_456");

console.log(`User has ${result.count} trips`);
result.trips.forEach(trip => {
  console.log(`${trip.trip_id}: ${trip.state.current_state}`);
});

// Get last 10 trips only
const recentResult = await getUserTrips("user_456", 10);
```

---

## 🔐 Permission Integration (Day 6)

### How Endpoints Use Permissions

All endpoints integrate with `rolesPermissions.js`:

| Endpoint | Permission Check | Using |
|----------|------------------|-------|
| **getTripStatus** | Ownership verification | Manual check |
| **cancelTrip** | Action authorization | `canPerformAction()` |
| **submitTrip** | State validation | Implicit in state machine |

### Permission Check Example

```javascript
// Inside cancelTrip endpoint
const permission = canPerformAction(
  userRole,      // "user" or "admin"
  "cancel_trip", // action being attempted
  trip,          // trip object
  userId         // who is trying
);

if (!permission.allowed) {
  
  return { 
    success: false, 
    error: permission.reason 
  };
}
```

---

## 🔄 State Transition Summary

### Valid Transitions by Endpoint

```
createTrip:
  (none) → draft

submitTrip:
  draft → submitted (no review needed)
  draft → pending_approval (review needed)
  needs_adjustment → submitted (no review needed)
  needs_adjustment → pending_approval (review needed)

cancelTrip:
  draft → cancelled
  submitted → cancelled
  pending_approval → cancelled
  needs_adjustment → cancelled
  approved → cancelled
  booked → cancelled
```

### States That Block Submission

- ❌ submitted (already submitted)
- ❌ pending_approval (waiting for review)
- ❌ approved (already approved)
- ❌ booked (already booked)
- ❌ completed (trip finished)
- ❌ cancelled (trip cancelled)

---

## 🎯 Integration Points

### Dependencies (Sprint Days)

| Day | Integration | How Used |
|-----|-------------|----------|
| **Day 3** | Validation Rules | `validateTrip()` checks |
| **Day 5** | Human Review | `requiresHumanReview()` routing |
| **Day 6** | Permissions | `canPerformAction()` authorization |
| **Day 9** | Admin Surfaces | `admin_context` structure, audit logging |

### Required Imports

```javascript
import { saveTrip, loadTrip, loadUserTrips, generateTripId, 
         addToAdminQueue } from 'tripDatabase.js';
import { validateTrip } from 'tripValidation.js';
import { requiresHumanReview, getUserMessage } from 'humanReviewRules.js';
import { canPerformAction, getAllowedActions } from 'rolesPermissions.js';
```

---

## ⚠️ Error Handling Patterns

### Consistent Error Responses

All endpoints return:
```javascript
{
  success: false,
  error: "Human-readable error message"
}
```

### Common Error Scenarios

| Error | Status | When |
|-------|--------|------|
| **Trip not found** | 404 | Invalid tripId |
| **Not authorized** | 403 | User doesn't own trip |
| **Permission denied** | 403 | Role can't perform action |
| **Invalid state** | 400 | Wrong state for action |
| **Validation failed** | 400 | Trip data invalid |
| **Missing required field** | 400 | Required param missing |

### Example Error Handling

```javascript
try {
  const result = await submitTrip("TRP_abc123");
  
  if (!result.success) {
    console.error("Submit failed:", result.error);
    // Show error to user
  } else {
    console.log("Success:", result.message);
    // Continue workflow
  }
  
} catch (error) {
  console.error("Unexpected error:", error);
  // Handle system failure
}
```

---

## 📝 Example Workflows

###Workflow 1: User Creates and Submits Trip

```javascript
// 1. Create trip
const created = await createTrip({
  user_id: "user_123",
  pickup: { address: "123 Main St", datetime: "2026-01-20T14:00:00Z" },
  dropoff: { address: "LAX Airport" },
  passengers: 2
});

const tripId = created.trip.trip_id;

// 2. Validate trip
const validated = await validateTripEndpoint(tripId);

if (validated.validation.status !== "VALID") {
  console.log("Errors:", validated.validation.errors);
  // User fixes errors...
}

// 3. Submit trip
const submitted = await submitTrip(tripId);

if (submitted.needsReview) {
  console.log("⏳", submitted.message); // "Your trip is being reviewed"
} else {
  console.log("✅", submitted.message); // "Your trip is ready for booking"
}
```

### Workflow 2: Admin Reviews Pending Trip

```javascript
// 1. Get trip status (admin view)
const status = await getTripStatus("TRP_abc123", "admin_789", "admin");

console.log("State:", status.trip.state.current_state); // "pending_approval"
console.log("Actions:", status.allowedActions); 
// ["approve_trip", "request_adjustment", "escalate", "cancel_trip"]

// 2. Admin reviews and approves (would be in separate admin endpoint)
// This API doesn't include admin action endpoints yet
```

### Workflow 3: User Cancels Trip

```javascript
// 1. Check status
const status = await getTripStatus("TRP_abc123", "user_456", "user");

if (status.allowedActions.includes("cancel_trip")) {
  // 2. Cancel trip
  const cancelled = await cancelTrip(
    "TRP_abc123",
    "user_456",
    "user",
    "Plans changed"
  );
  
  console.log(cancelled.message); // "Trip cancelled successfully"
}
```

---

## ✅ API Completion Checklist

Can you answer these questions?

- ✅ **How do users create trips?**  
  → `createTrip()` with user_id and trip details

- ✅ **How do we validate trip data?**  
  → `validateTripEndpoint()` runs Day 3 validation rules

- ✅ **How do trips get routed for review?**  
  → `submitTrip()` checks Day 5 rules and routes to pending_approval if needed

- ✅ **How do we enforce permissions?**  
  → All endpoints check Day 6 roles and use `canPerformAction()`

- ✅ **What can users see about their trips?**  
  → `getTripStatus()` returns allowed actions and user-friendly messages

---

## 🛡️ What's Protected

### Data Integrity
- ✅ State transitions validated (no invalid jumps)
- ✅ Required fields enforced
- ✅ Trip ownership verified
- ✅ Unique trip IDs generated

### Authorization
- ✅ Users can only access own trips
- ✅ Admins can access all trips
- ✅ Actions gated by role + state
- ✅ Permission denials logged

### User Experience
- ✅ Clear error messages
- ✅ User-friendly status messages (Day 5)
- ✅ Allowed actions exposed
- ✅ Consistent response format

---

## 📦 File Location

**Path**: `src/backend/etas/tripBookingApi.js`

**Related Files:**
- `tripDatabase.js` - Data persistence
- `tripValidation.js` - Day 3 validation
- `humanReviewRules.js` - Day 5 review routing
- `rolesPermissions.js` - Day 6 authorization
- `adminSurfaces.js` - Day 9 admin context
- `tripSchema.v1.js` - Data structure

---