# Sprint Day 3 — Validation Rules & Error Boundaries

**Date**: January 2, 2026  
**Status**: ✅ Complete  
**Deliverable**: Trip validation framework with clear error boundaries and failure handling

---

## 🎯 Day 3 Goal

**"Make sure the system never accepts bad data, never fails silently, and always knows what to do when something goes wrong."**

This day answers:
- ✅ What does "valid" actually mean?
- ✅ When do we stop a flow?
- ✅ When do we ask the user to fix something?
- ✅ When do we escalate to an admin?

---

## 🏗️ Validation Architecture

### Three-Layer Validation System

```
┌─────────────────────────────────────────────┐
│  Layer 1: Field-Level Validation           │
│  → Is the value shaped correctly?          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Layer 2: Trip-Level Validation            │
│  → Does the trip make sense as a whole?    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Layer 3: System-Level Validation          │
│  → Is the system allowed to proceed?       │
└─────────────────────────────────────────────┘
```

---

## ✅ Validation Outcomes

Every validation returns one of three outcomes:

### 1. **VALID**
- All checks pass
- Trip can proceed to next state
- No user action required

### 2. **INVALID** (User-Fixable)
- One or more fields need correction
- User is returned to draft state
- Clear, actionable error messages provided
- Examples:
  - Missing pickup time
  - Pickup time in the past
  - Invalid passenger count
  - Tier capacity exceeded

### 3. **BLOCKED** (System/Admin Intervention)
- System constraint violated
- State is frozen
- Admin is notified
- User sees: "This booking requires administrator assistance"
- Examples:
  - Invalid state transition
  - Tier locked but change attempted
  - Missing critical system IDs

---

## 📋 Field-Level Validation Rules

### Pickup Address (`pickup.address`)
- ✅ Must exist
- ✅ Must not be empty string
- ❌ Error: "Where would you like to be picked up?"

### Pickup Time (`pickup.datetime`)
- ✅ Must exist
- ✅ Must be valid datetime format
- ✅ Must be in the future
- ❌ Errors:
  - "What time would you like to be picked up?"
  - "Please provide a valid pickup time."
  - "Pickup time must be in the future."

### Dropoff Address (`dropoff.address`)
- ✅ Must exist
- ✅ Must not be empty string
- ❌ Error: "Where would you like to go?"

### Passengers (`passengers`)
- ✅ Must be ≥ 1
- ❌ Error: "Please specify at least 1 passenger."

### Tier (`tier.name`)
- ✅ Required when `state` is `booking_ready` or `booked`
- ✅ Must be one of: `"basic"`, `"corporate"`, `"executive"`
- ❌ Errors:
  - "A service tier must be selected before booking."
  - "Please select a valid service tier."

---

## 🧩 Trip-Level Validation Rules

### Return Trip Logic
- ✅ If return trip exists: `return.pickup_datetime` > `pickup.datetime`
- ❌ Error: "Return pickup time must be after your initial pickup."

### Tier Capacity
- ✅ Passengers must not exceed tier capacity
  - **Basic**: 4 passengers max
  - **Corporate**: 6 passengers max
  - **Executive**: 8 passengers max
- ❌ Error: "The [tier] tier supports up to [N] passengers. Please select a higher tier or reduce passengers."

---

## ⚙️ System-Level Validation Rules

### Trip ID
- ✅ Required for all non-draft states
- ❌ Error (BLOCKED): "System error: Trip ID missing. Contact support."

### User ID
- ✅ Always required
- ❌ Error (BLOCKED): "System error: User ID missing. Contact support."

### Tier Lock
- ✅ Once `tier.locked = true`, tier cannot change
- ❌ Error (BLOCKED): "Tier cannot be changed after booking confirmation."

### State Transitions
- ✅ Must follow state machine from Day 2
- ❌ Error (BLOCKED): "Cannot transition from [state] to [state]."

**Valid transitions**:
```javascript
draft → booking_ready, cancelled
booking_ready → pending_approval, booked, cancelled
pending_approval → approved, needs_adjustment, escalated, cancelled
approved → booked, cancelled
needs_adjustment → draft, cancelled
escalated → approved, cancelled
booked → in_progress, cancelled
in_progress → completed, cancelled
completed → (terminal)
cancelled → (terminal)
```

---

## 🛡️ SENTINEL Integration Rule

### **CRITICAL: SENTINEL NEVER BLOCKS BOOKING**

SENTINEL validation returns **warnings only**, never errors.

```javascript
// ✅ Correct: Warning only
{
  type: "WARNING",
  code: "SENTINEL_ELEVATED_RISK",
  message: "Route requires additional attention.",
  severity: "info"
}

// ❌ Wrong: Never block
{
  type: "INVALID",  // Never do this
  message: "Route blocked due to risk"
}
```

### SENTINEL Risk Levels
- **Green**: No warning
- **Yellow/Orange**: Informational warning
- **Red**: Warning with increased severity (but still not blocking)

This protects MVP flow and avoids fear-based UX.

---

## ⚠️ Error Message Contract

Every error follows this structure:

```javascript
{
  type: "VALID" | "INVALID" | "BLOCKED",
  code: "ERROR_CODE_CONSTANT",
  field: "field.path",
  message: "User-friendly, actionable message"
}
```

### Message Rules
- ✅ No technical jargon
- ✅ One issue per message
- ✅ Always actionable
- ✅ Conversational tone
- ❌ Never: "Validation failed"
- ✅ Instead: "What time would you like to be picked up?"

---

## 🚨 Failure Boundaries

### What Happens When Validation Fails?

```javascript
┌─────────────────────────────────────────────────────┐
│  INVALID Errors                                     │
│  → Return user to draft                             │
│  → Show clear error messages                        │
│  → Allow retry                                      │
│  → After 5 failures: throttle + notify admin        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BLOCKED Errors                                     │
│  → Freeze state (no retries)                        │
│  → Notify admin immediately                         │
│  → Show: "Requires administrator assistance"       │
└─────────────────────────────────────────────────────┘
```

### Repeated Failures (Throttling)
- After **5 validation failures** in a row:
  - Action: `THROTTLE`
  - User sees: "We're having trouble processing this booking. A team member will reach out shortly."
  - Throttle duration: 15 minutes
  - Admin is notified

This prevents:
- Infinite retry loops
- User frustration
- System abuse

---

## 📦 Implementation: `validateTrip()` Function

### Function Signature

```javascript
validateTrip(trip, context = {})
```

### Input
```javascript
trip = {
  // Trip object from tripSchema.v1.js
}

context = {
  previousTrip: {...},      // For tier lock checks
  previousState: "draft",   // For transition checks
  failureCount: 0           // For throttling
}
```

### Output
```javascript
{
  status: "VALID" | "INVALID" | "BLOCKED",
  errors: [
    {
      type: "INVALID",
      code: "MISSING_PICKUP_TIME",
      field: "pickup.datetime",
      message: "What time would you like to be picked up?"
    }
  ],
  warnings: [
    {
      type: "WARNING",
      code: "SENTINEL_ELEVATED_RISK",
      field: "sentinel_snapshot.risk_level",
      message: "Route requires additional attention.",
      severity: "info"
    }
  ]
}
```

### No Side Effects
- ✅ Pure function
- ✅ No database writes
- ✅ No API calls
- ✅ No state mutations
- Only returns validation result

---

## 🧪 Example Validation Flows

### ✅ Success Flow
```javascript
const trip = {
  user_id: "user_123",
  state: "draft",
  pickup: {
    address: "123 Main St",
    datetime: "2026-01-05T10:00:00Z"
  },
  dropoff: {
    address: "456 Oak Ave"
  },
  passengers: 2
};

const result = validateTrip(trip);
// → { status: "VALID", errors: [], warnings: [] }
```

### ❌ INVALID Flow (User-Fixable)
```javascript
const trip = {
  user_id: "user_123",
  state: "draft",
  pickup: {
    address: "",  // Missing!
    datetime: "2025-12-01T10:00:00Z"  // In the past!
  },
  dropoff: {
    address: "456 Oak Ave"
  },
  passengers: 0  // Invalid!
};

const result = validateTrip(trip);
// → {
//   status: "INVALID",
//   errors: [
//     { type: "INVALID", code: "MISSING_PICKUP_ADDRESS", ... },
//     { type: "INVALID", code: "PICKUP_TIME_IN_PAST", ... },
//     { type: "INVALID", code: "INVALID_PASSENGERS", ... }
//   ]
// }
```

### 🚫 BLOCKED Flow (Admin Intervention)
```javascript
const trip = {
  user_id: "user_123",
  state: "booked",
  tier: {
    name: "corporate",
    locked: true
  },
  // ... other fields
};

const context = {
  previousTrip: {
    tier: { name: "basic", locked: true }
  }
};

const result = validateTrip(trip, context);
// → {
//   status: "BLOCKED",
//   errors: [
//     { type: "BLOCKED", code: "TIER_LOCKED_CHANGE_ATTEMPT", ... }
//   ]
// }
```

---

## ✅ Day 3 Completion Checklist

Can you answer these questions?

- ✅ **What makes a trip valid?**  
  → Passes all field-level, trip-level, and system-level checks

- ✅ **What happens when it's not?**  
  → INVALID: User fixes it | BLOCKED: Admin intervenes

- ✅ **Who fixes it?**  
  → User for INVALID | Admin for BLOCKED

- ✅ **Does failure ever go unnoticed?**  
  → No. All failures return errors, admins are notified for BLOCKED, throttling prevents infinite loops

---

## 📂 Files Created

1. **`tripValidation.js`** — Complete validation framework with:
   - Field-level validation
   - Trip-level validation
   - System-level validation
   - SENTINEL integration (warnings only)
   - `validateTrip()` function
   - `determineFailureAction()` function
   - Error codes & outcome enums

2. **`DAY_3_VALIDATION.md`** — This documentation

---

## 🚀 Next Steps

**Day 4**: Business Rules & Tier Logic  
Define what each tier gets, approval thresholds, and automation eligibility rules.

---

## 📝 Commit Message

```
Define trip validation rules and error boundaries (Sprint Day 3)

- Implemented three-layer validation (field, trip, system)
- Created VALID/INVALID/BLOCKED outcome system
- Added SENTINEL integration (warnings only, never blocks)
- Defined failure boundaries and throttling logic
- Implemented validateTrip() with clear contract
- Zero side effects, fully testable
```

---

## 📊 ClickUp Update

**Sprint Day 3 complete**: Implemented validation layers, error outcomes, and failure boundaries to ensure predictable, recoverable trip flows. System now validates at field, trip, and system levels with clear user-fixable vs admin-intervention paths. SENTINEL integrated as warning-only to protect MVP UX.
