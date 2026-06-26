# Sprint Day 7 — Failure, Retry & Recovery Scenarios

**Date**: January 5, 2026  
**Status**: ✅ Complete  
**Deliverable**: Complete failure handling framework with safe retry logic and recovery paths

---

## 🎯 Day 7 Goal

**"When something fails, the system should fail safely, visibly, and recoverably — without confusing the user or creating operational chaos."**

This day answers:
- ✅ What does "failure" mean in this system?
- ✅ When do we retry automatically?
- ✅ When do we stop and escalate to a human?
- ✅ How do we avoid duplicate bookings or payments?

**This supports pre-beta reliability and trust.**

---

## 🚨 Failure Categories

### Each failure type has a predictable response

| Failure Type | Description | Severity | Retryable | Max Retries | Cooldown |
|--------------|-------------|----------|-----------|-------------|----------|
| **VALIDATION_FAILURE** | Trip data failed validation | Medium | ✅ Yes (user-driven) | 0 (auto) | N/A |
| **PAYMENT_FAILURE** | Payment processing failed | High | ✅ Yes | 2 | 30s |
| **DISPATCH_FAILURE** | Failed to dispatch to provider | High | ✅ Yes | 3 | 1m |
| **SYSTEM_TIMEOUT** | Operation timed out | Medium | ✅ Yes | 2 | 15s |
| **EXTERNAL_API_ERROR** | External API error | High | ✅ Yes | 3 | 45s |
| **ADMIN_REJECTION** | Admin rejected trip | Low | ❌ No | 0 | N/A |
| **TIER_MISMATCH** | Tier requirements not met | Medium | ❌ No | 0 | N/A |
| **CAPACITY_UNAVAILABLE** | No vehicles available | High | ✅ Yes | 2 | 2m |
| **STATE_TRANSITION_ERROR** | Invalid state transition | Critical | ❌ No | 0 | N/A |
| **DUPLICATE_REQUEST** | Request already processed | Low | ❌ No | 0 | N/A |

### Severity Levels

- **Low**: Minor issue, user can resolve
- **Medium**: Requires attention, may need retry
- **High**: Urgent, affects booking success
- **Critical**: System integrity issue, immediate escalation

---

## 🔄 Failure → State Mapping

### Every failure has a destination — no ambiguity

| Failure Type | Target State | User Can Retry | Preserve Data |
|--------------|--------------|----------------|---------------|
| **VALIDATION_FAILURE** | `draft` | ✅ Yes | ✅ Yes |
| **PAYMENT_FAILURE** | `failed` | ✅ Yes | ✅ Yes |
| **DISPATCH_FAILURE** | `failed` | ❌ No (admin) | ✅ Yes |
| **SYSTEM_TIMEOUT** | `failed` | ✅ Yes | ✅ Yes |
| **EXTERNAL_API_ERROR** | `failed` | ❌ No (admin) | ✅ Yes |
| **ADMIN_REJECTION** | `cancelled` | ❌ No | ✅ Yes |
| **TIER_MISMATCH** | `draft` | ✅ Yes | ✅ Yes |
| **CAPACITY_UNAVAILABLE** | `failed` | ✅ Yes | ✅ Yes |
| **STATE_TRANSITION_ERROR** | `pending_approval` | ❌ No | ✅ Yes |
| **DUPLICATE_REQUEST** | (keep current) | ❌ No | ✅ Yes |

### State Flow Examples

```
VALIDATION_FAILURE
booking_ready → draft
User sees: "Please review the highlighted fields"
User action: Fix and resubmit

PAYMENT_FAILURE (after retries)
approved → failed
User sees: "We couldn't process your payment"
User action: Update payment method

DISPATCH_FAILURE (escalated)
approved → pending_approval
User sees: "We're working on your booking"
Admin action: Manual dispatch or alternative

ADMIN_REJECTION
pending_approval → cancelled
User sees: "We couldn't complete your booking as requested"
User action: Contact support
```

---

## 🔁 Retry Rules

### **CRITICAL: Retries are system-driven, not user-triggered**

### Retry Strategies

| Strategy | Cooldown | Max Retries | Backoff | Use Case |
|----------|----------|-------------|---------|----------|
| **IMMEDIATE** | 0s | 1 | ❌ No | Quick retries |
| **SHORT_BACKOFF** | 15s | 2 | ✅ Yes (1.5x) | Network issues |
| **LONG_BACKOFF** | 1m | 3 | ✅ Yes (2x) | API failures |
| **USER_DRIVEN** | 0s | 0 | ❌ No | User fixes required |

### Retry Strategy Mapping

| Failure Type | Strategy | Rationale |
|--------------|----------|-----------|
| **VALIDATION_FAILURE** | USER_DRIVEN | User must fix data |
| **PAYMENT_FAILURE** | SHORT_BACKOFF | Network glitches common |
| **DISPATCH_FAILURE** | LONG_BACKOFF | API recovery time |
| **SYSTEM_TIMEOUT** | SHORT_BACKOFF | Quick retry appropriate |
| **EXTERNAL_API_ERROR** | LONG_BACKOFF | Give API time to recover |
| **CAPACITY_UNAVAILABLE** | LONG_BACKOFF | Capacity may free up |

### Exponential Backoff

```javascript
Attempt 1: 15 seconds
Attempt 2: 22.5 seconds (15 × 1.5)
Attempt 3: 33.75 seconds (22.5 × 1.5)

// Long backoff (2x multiplier)
Attempt 1: 60 seconds
Attempt 2: 120 seconds (60 × 2)
Attempt 3: 240 seconds (120 × 2)
```

### Retry Decision Flow

```
Failure occurs
    ↓
Is failure retryable? → No → Move to failed state
    ↓ Yes
Retry count < max? → No → Escalate to admin
    ↓ Yes
Cooldown elapsed? → No → Wait and check again
    ↓ Yes
Calculate backoff delay
    ↓
Schedule retry
    ↓
Increment retry counter
    ↓
Execute retry
```

---

## ⬆️ Escalation Conditions

### When automation must stop and escalate to humans

| Condition | Trigger | Action | Notify Admin | Freeze Execution |
|-----------|---------|--------|--------------|------------------|
| **RETRY_LIMIT_EXCEEDED** | Retry count ≥ max | Move to `pending_approval` | ✅ Yes | ✅ Yes |
| **REPEATED_PAYMENT_FAILURES** | Payment failed 2+ times | Move to `pending_approval` | ✅ Yes | ✅ Yes |
| **DISPATCH_UNAVAILABLE** | Provider unavailable/rejected | Move to `pending_approval` | ✅ Yes | ✅ Yes |
| **CONFLICTING_SIGNALS** | System state conflicts | Move to `pending_approval` | ✅ Yes | ✅ Yes |
| **CRITICAL_ERROR** | System integrity issue | Move to `pending_approval` | ✅ Yes | ✅ Yes |
| **VALIDATION_THRESHOLD** | User failed validation 5+ times | Throttle + notify | ✅ Yes | ❌ No |

### Escalation Flow

```
Failure occurs
    ↓
Check escalation conditions
    ↓
Should escalate? → No → Attempt retry or move to failed state
    ↓ Yes
Freeze execution
    ↓
Move to pending_approval
    ↓
Notify admin with context
    ↓
Show user reassuring message
    ↓
Admin reviews and decides
```

### User Messages on Escalation

| Condition | User Sees |
|-----------|-----------|
| **RETRY_LIMIT_EXCEEDED** | "We're reviewing your trip and will follow up shortly." |
| **REPEATED_PAYMENT_FAILURES** | "We're having trouble processing payment. Our team will reach out." |
| **DISPATCH_UNAVAILABLE** | "We're working on your booking. You'll hear from us soon." |
| **CONFLICTING_SIGNALS** | "We're reviewing your trip details to ensure accuracy." |
| **CRITICAL_ERROR** | "We're reviewing your trip request. Our team will contact you." |

---

## 🔒 Idempotency Rules (Prevent Duplicate Actions)

### **Protects against: double charges, double dispatch, panic clicks**

| Action | Rule | Check | Error Code |
|--------|------|-------|------------|
| **SUBMISSION** | Cannot submit if already submitted | State in `[draft, needs_adjustment]` | `ALREADY_SUBMITTED` |
| **BOOKING** | Cannot book if already booked | State not in `[booked, in_progress, completed]` | `ALREADY_BOOKED` |
| **PAYMENT** | Cannot charge if already paid | `paymentConfirmed !== true` | `ALREADY_PAID` |
| **APPROVAL** | Cannot approve if already approved | `approval.status !== "APPROVED"` | `ALREADY_APPROVED` |
| **CANCELLATION** | Cannot cancel if already cancelled | `state !== "cancelled"` | `ALREADY_CANCELLED` |
| **RETRY** | Must reset before retry | `state === "failed" && !retryLock` | `RETRY_IN_PROGRESS` |

### Example Scenarios

#### ✅ Safe: User submits draft trip
```javascript
Trip state: "draft"
Action: SUBMIT
Check: state in ["draft", "needs_adjustment"] → ✅ Pass
Result: Submission proceeds
```

#### ❌ Blocked: User clicks submit twice
```javascript
Trip state: "booking_ready" (after first submit)
Action: SUBMIT (second click)
Check: state in ["draft", "needs_adjustment"] → ❌ Fail
Result: { safe: false, errorCode: "ALREADY_SUBMITTED" }
Message: "This trip has already been submitted."
```

#### ❌ Blocked: Double booking attempt
```javascript
Trip state: "booked"
Action: BOOKING
Check: state not in ["booked", "in_progress", "completed"] → ❌ Fail
Result: { safe: false, errorCode: "ALREADY_BOOKED" }
Message: "This trip is already booked."
```

#### ✅ Safe: Retry after failure
```javascript
Trip state: "failed"
Retry lock: false
Action: RETRY
Check: state === "failed" && !retryLock → ✅ Pass
Result: Retry proceeds
```

---

## 💬 User Messaging Contract

### **Rules**:
- ❌ Never expose technical errors
- ❌ Never blame the user
- ✅ Always explain next steps

| Failure Type | Title | Message | Tone | Next Action |
|--------------|-------|---------|------|-------------|
| **VALIDATION_FAILURE** | Quick check needed | Please review the highlighted fields and try again. | Neutral | Fix and resubmit |
| **PAYMENT_FAILURE** | Payment issue | We couldn't process your payment. Please check your payment method or try again. | Helpful | Update payment |
| **DISPATCH_FAILURE** | Booking in progress | We're working on your booking. You'll receive an update shortly. | Reassuring | Wait for update |
| **SYSTEM_TIMEOUT** | Taking longer than expected | We're still processing your request. Please check back in a moment. | Neutral | Check back soon |
| **EXTERNAL_API_ERROR** | Connection issue | We're having trouble connecting to our booking partner. Our team is on it. | Reassuring | We'll follow up |
| **ADMIN_REJECTION** | Trip update | We couldn't complete your booking as requested. Please contact support for details. | Neutral | Contact support |
| **TIER_MISMATCH** | Service tier adjustment needed | The selected tier doesn't match your trip requirements. Please select a different tier. | Helpful | Select different tier |
| **CAPACITY_UNAVAILABLE** | Limited availability | No vehicles are currently available for your requested time. Try a different time or we'll reach out with options. | Helpful | Try different time |
| **STATE_TRANSITION_ERROR** | Reviewing your trip | We're reviewing your trip details to ensure everything is correct. You'll hear from us soon. | Reassuring | Wait for contact |
| **DUPLICATE_REQUEST** | Request already received | We've already received your request and are processing it. | Informative | No action needed |
| **GENERIC_FAILURE** | We're on it | Something didn't go through. Our team is reviewing your trip and will follow up. | Reassuring | Wait for update |

### What Users NEVER See

❌ "Error 500: Internal Server Error"  
❌ "DISPATCH_FAILURE: API returned 503"  
❌ "Validation constraint violated"  
❌ "Payment gateway timeout exception"  
❌ "State transition guard failed"

### What Users DO See

✅ "Quick check needed"  
✅ "We're working on your booking"  
✅ "Please check your payment method"  
✅ "We'll follow up shortly"  
✅ "Our team is on it"

---

## 👁️ Admin Visibility & Actions

### **Admins should never guess why something failed**

### Admin View Fields

| Field | Description |
|-------|-------------|
| `failure_type` | Failure category code |
| `failure_reason` | Technical reason |
| `retry_count` | Number of retries attempted |
| `last_retry_at` | When last retry occurred |
| `escalation_reason` | Why it escalated |
| `system_notes` | Technical notes |
| `user_message` | What user saw |
| `error_stack` | Technical error (optional) |
| `trip_state` | Current state |
| `previous_state` | State before failure |
| `timestamp` | When failure occurred |

### Admin Actions

| Action | Description | When Available |
|--------|-------------|----------------|
| `retry_manually` | Admin triggers retry | When retry allowed |
| `approve_override` | Approve despite issues | Always |
| `reject_with_reason` | Reject and explain | Always |
| `escalate_higher` | Send to senior admin | Always |
| `reset_retry_count` | Reset and allow retry | When retry count > 0 |
| `annotate` | Add notes | Always |
| `contact_user` | Reach out directly | Always |

### Severity Indicators (Admin UI)

| Severity | Color | Label | Example |
|----------|-------|-------|---------|
| **Low** | Blue | Minor | Duplicate request |
| **Medium** | Yellow | Attention Needed | Validation failure |
| **High** | Orange | Urgent | Payment failure |
| **Critical** | Red | Critical | State transition error |

### Admin Dashboard Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAILED TRIP: #TRP_12345
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Failure: DISPATCH_FAILURE (🟠 High)
Reason: External API returned 503 Service Unavailable
Status: Escalated to review

Retry History:
  Attempt 1: Failed at 14:30:15 (waited 60s)
  Attempt 2: Failed at 14:31:45 (waited 120s)
  Attempt 3: Failed at 14:34:15 (escalated)

User Saw: "We're working on your booking. 
           You'll receive an update shortly."

System Notes:
  - Lyft API unavailable
  - No other providers configured
  - User tier: Corporate
  - SENTINEL: Green (no issues)

Available Actions:
  ✓ Retry Manually
  ✓ Approve Override (book alternative)
  ✓ Reject with Reason
  ✓ Contact User

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Complete Failure Scenarios

### Scenario 1: Payment Failure with Auto-Retry

```
1. User submits trip, payment processing starts
   State: approved
   
2. Payment fails (network timeout)
   Failure: PAYMENT_FAILURE
   Retry count: 0
   
3. System auto-retries after 30s (SHORT_BACKOFF)
   User sees: "We're retrying your request"
   Retry count: 1
   
4. Payment fails again
   Retry count: 2
   
5. System auto-retries after 45s (backoff)
   Retry count: 2
   
6. Max retries reached → Escalate
   State: pending_approval
   User sees: "We're having trouble processing payment. 
               Our team will reach out."
   Admin notified: "REPEATED_PAYMENT_FAILURES"
   
7. Admin reviews, identifies issue, manually retries
   State: approved → booked
   User notified: "Your trip is confirmed"
```

### Scenario 2: Validation Failure (User-Driven)

```
1. User submits trip with invalid data
   Validation: INVALID
   
2. System returns to draft
   State: draft
   User sees: "Quick check needed. Please review 
               the highlighted fields and try again."
   Errors displayed: [field-level errors]
   
3. User fixes and resubmits
   Validation: VALID
   State: booking_ready
   
4. Proceeds normally
```

### Scenario 3: Dispatch Failure with Escalation

```
1. Trip approved, dispatch starts
   State: approved
   Action: Dispatch to Lyft
   
2. Lyft API returns error
   Failure: DISPATCH_FAILURE
   Retry count: 0
   
3. System retries after 1m (LONG_BACKOFF)
   Retry count: 1
   Still fails
   
4. System retries after 2m (exponential)
   Retry count: 2
   Still fails
   
5. System retries after 4m
   Retry count: 3
   Still fails
   
6. Max retries → Escalate
   State: pending_approval
   User sees: "We're working on your booking. 
               You'll hear from us soon."
   Admin notified with full context
   
7. Admin sees:
   - 3 retry attempts
   - Lyft API unavailable
   - Can manually dispatch or approve alternative
```

### Scenario 4: Duplicate Request (Idempotency)

```
1. User submits trip
   State: booking_ready
   
2. User clicks submit again (slow connection)
   Check: IDEMPOTENCY_RULES.SUBMISSION
   State: booking_ready (not draft)
   
3. System blocks duplicate
   Result: { safe: false, errorCode: "ALREADY_SUBMITTED" }
   User sees: "This trip has already been submitted."
   
4. No duplicate booking created ✓
```

---

## ✅ Day 7 Completion Checklist

Can you answer these questions?

- ✅ **What happens if X fails?**  
  → Check FAILURE_CATEGORIES for severity, retry rules, escalation  
  → Check FAILURE_STATE_MAPPING for target state

- ✅ **Does the system retry or stop?**  
  → Check retryable flag, max retries, cooldown  
  → System retries automatically (user-driven for validation)  
  → Stops and escalates after max retries or on critical errors

- ✅ **Who gets notified?**  
  → User: Gets reassuring message (never technical)  
  → Admin: Notified on escalation with full context

- ✅ **Can anything execute twice?**  
  → No. IDEMPOTENCY_RULES prevent duplicate bookings, payments, submissions  
  → State checks block redundant actions

---

## 📂 Files Created

1. **[failureHandling.js](../src/backend/etas/failureHandling.js)** — Complete failure framework:
   - `FAILURE_CATEGORIES` — 10 failure types with retry configs
   - `FAILURE_STATE_MAPPING` — Failure → state destinations
   - `RETRY_RULES` — Strategies, backoff, cooldown
   - `ESCALATION_CONDITIONS` — When to stop and escalate
   - `IDEMPOTENCY_RULES` — Prevent duplicate actions
   - `FAILURE_MESSAGES` — User-facing messages
   - `ADMIN_FAILURE_VISIBILITY` — Admin view and actions
   - `getRetryStrategy()` — Get retry config for failure
   - `calculateRetryDelay()` — Exponential backoff calculation
   - `canRetry()` — Check retry eligibility
   - `shouldEscalate()` — Check escalation conditions
   - `checkIdempotency()` — Prevent duplicate actions
   - `getUserFailureMessage()` — Get user message
   - `getAdminFailureView()` — Get admin-facing data
   - `handleFailure()` — Main failure handler

2. **`DAY_7_FAILURE_RECOVERY.md`** — This documentation

---

## 🛡️ What's Protected

### Reliability
- ✅ Safe failure paths (every failure has a destination)
- ✅ Automatic retries with backoff (smart recovery)
- ✅ Escalation to humans (automation knows its limits)
- ✅ No infinite loops (max retries + escalation)

### User Experience
- ✅ Never see technical errors
- ✅ Reassuring messages (not panic)
- ✅ Clear next steps (always actionable)
- ✅ No confusion (system handles complexity)

### Operations
- ✅ No duplicate bookings (idempotency)
- ✅ No double charges (payment checks)
- ✅ Admin visibility (never guess)
- ✅ Recovery paths (always recoverable)

### Trust
- ✅ Fails visibly (not silently)
- ✅ Fails safely (no data loss)
- ✅ Fails recoverably (always a path forward)
- ✅ Human oversight (when automation can't decide)

---

## 🔜 Next Steps

**Day 8+**: Continue building execution flows, integrations, and monitoring while respecting the failure handling framework established today.

The system now knows:
- How to categorize failures
- When to retry automatically
- When to escalate to humans
- How to prevent duplicate actions
- How to fail safely and recoverably

---

## 📝 Commit Message

```
Define failure handling, retry logic, and recovery paths (Sprint Day 7)

- Defined 10 failure categories with severity and retry configs
- Mapped failures to trip states (no ambiguity)
- Created retry strategies with exponential backoff
- Defined escalation conditions (when automation stops)
- Implemented idempotency rules (prevent duplicates)
- Created user messaging contract (no technical errors)
- Defined admin visibility and actions (never guess)
- Implemented retry eligibility checks and backoff calculations
- Created comprehensive failure handler with safe paths
```

---

## 📊 ClickUp Update

**Sprint Day 7 complete**: Formalized failure categories, retry rules, and escalation paths to ensure safe, recoverable trip execution. System now fails safely, visibly, and recoverably with automatic retry logic, human escalation, duplicate prevention, and reassuring user messaging.
