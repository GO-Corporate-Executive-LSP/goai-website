# DAY_5_HUMAN_REVIEW.md

# Sprint Day 5 — Human-in-the-Loop & Admin Override Logic

**Date**: January 4, 2026
**Status**: ✅ Complete
**Deliverable**: Complete human review framework with intervention triggers, authority boundaries, and safe resume logic
* * *

## 🎯 Day 5 Goal

**"Define exactly when a human steps in, why they step in, what authority they have, and how the system behaves before and after that intervention."**

This day answers:

*   ✅ When does automation pause?
*   ✅ Who is allowed to approve or override?
*   ✅ What happens to the trip while waiting?
*   ✅ How do we resume cleanly after a decision?

**This is trust infrastructure.**
* * *

## 🚨 Human-Intervention Triggers

### Rule: Humans intervene only when the system cannot safely decide

### Trigger Categories

#### 1\. **Validation Failures** (High Priority)

| Trigger | Description | Severity | Auto-Escalate |
| ---| ---| ---| --- |
| `VALIDATION_BLOCKED` | Validation returned BLOCKED (system constraint violated) | High | ✅ Yes |
| `VALIDATION_FAILED_REPEATEDLY` | User failed validation 5+ times (throttling) | Medium | ❌ No |

**Example**:

```javascript
// Validation returns BLOCKED → immediate human review
{
  status: "BLOCKED",
  code: "TIER_LOCKED_CHANGE_ATTEMPT"
}
→ Trigger: VALIDATION_BLOCKED
→ Action: Transition to pending_approval + notify admin
```

#### 2\. **Tier Issues** (Capacity/Business Logic)

| Trigger | Description | Severity | Auto-Escalate |
| ---| ---| ---| --- |
| `TIER_MISMATCH_UNRESOLVABLE` | Capacity exceeded, user won't adjust | Medium | ❌ No |
| `TIER_LOCKED_CHANGE_ATTEMPT` | Attempted tier change after lock | High | ✅ Yes |
| `EXECUTIVE_TIER_BOOKING` | Executive tier always needs approval | Info | ❌ No |

**Example**:

```javascript
// User tries to book 7 passengers on Basic tier
passengers: 7, tier: "basic"
→ System suggests: "Please select Corporate or Executive"
→ User ignores: requiresHumanReview = true
```

#### 3\. **SENTINEL Context** (Informational Only)

| Trigger | Description | Severity | Blocks? |
| ---| ---| ---| --- |
| `SENTINEL_ELEVATED_RISK` | Yellow/Orange risk level | Info/Warning | ❌ Never |
| `SENTINEL_HIGH_RISK` | Red risk level | Warning | ❌ Never |

**CRITICAL RULE**: SENTINEL NEVER blocks booking, only provides context

**Example**:

```javascript
sentinel_snapshot: {
  risk_level: "red",
  risk_note: "Route requires special attention"
}
→ Adds context to admin review
→ Does NOT block booking
→ Admin decides based on full picture
```

#### 4\. **Edge Cases & Special Requests**

| Trigger | Description | Severity |
| ---| ---| --- |
| `SPECIAL_REQUEST` | User added special notes/requirements | Low |
| `USER_REQUESTED_HELP` | User explicitly asked for assistance | Medium |
| `PAYMENT_ANOMALY` | Payment verification flagged (future) | High |

* * *

## 🔒 Pending Review State

### State Definition: `pending_approval`

**This is a controlled pause state.**

```javascript
PENDING_REVIEW_STATE = {
  name: "pending_approval",

  behavior: {
    frozen: true,              // Trip cannot be modified
    executionBlocked: true,    // No booking execution
    userNotified: true,        // User sees neutral waiting message
    adminActionRequired: true  // Admin must act to proceed
  },

  allowedActions: {
    user: ["cancel", "wait"],
    admin: ["approve", "request_changes", "reject", "escalate", "annotate"],
    system: []  // System CANNOT auto-advance
  },

  timeout: {
    duration: 24 hours,
    action: "AUTO_ESCALATE",
    message: "Trip review timed out - escalated to priority queue"
  }
}
```

### State Behavior

**While in** **`pending_approval`**:

*   ✅ Trip data is frozen (no edits)
*   ✅ User sees: "Your trip is being reviewed"
*   ✅ Admin sees: Full context + SENTINEL + approval options
*   ❌ No booking execution
*   ❌ No auto-progression
*   ❌ No state changes without admin decision

### Purpose

This state prevents:

*   ❌ Duplicate bookings
*   ❌ Stale data execution
*   ❌ Race conditions
*   ❌ Confusion about trip status
* * *

## 👥 Authority Boundaries (Critical)

### **Explicit definition of who can do what**

This clarity prevents liability issues later.

### 1\. **USER Authority**

**Can**:

*   ✅ Cancel trip
*   ✅ Wait for review
*   ✅ Respond to clarification requests
*   ✅ View status

**Cannot**:

*   ❌ Approve trip (no self-approval)
*   ❌ Modify trip during review
*   ❌ Bypass validation
*   ❌ Override system decisions

### 2\. **ADMIN Authority**

**Can**:

*   ✅ Approve trip → move to `approved`
*   ✅ Modify trip fields (with caution)
*   ✅ Reject trip → move to `cancelled`
*   ✅ Request changes → return to `draft`
*   ✅ Escalate trip → move to `escalated`
*   ✅ Annotate decisions (audit trail)
*   ✅ Override validation (if safe)
*   ✅ View full context (trip + SENTINEL + history)
*   ✅ Access audit trail

**Cannot**:

*   ❌ Auto-book without following approval flow
*   ❌ Bypass payment validation
*   ❌ Hide audit trail

### 3\. **SYSTEM Authority**

**Can**:

*   ✅ Validate trip
*   ✅ Provide SENTINEL context
*   ✅ Enforce state transitions
*   ✅ Log all actions
*   ✅ Timeout stale reviews (auto-escalate after 24h)

**Cannot**:

*   ❌ Auto-advance from `pending_approval`
*   ❌ Auto-book without approval
*   ❌ Auto-cancel
*   ❌ Modify approval decisions
*   ❌ Hide SENTINEL data

### Authority Check Function

```javascript
isAuthorized(actor, action)

Examples:
isAuthorized("user", "approve_trip") → false
isAuthorized("admin", "approve_trip") → true
isAuthorized("system", "auto_advance_pending") → false
```

* * *

## 📋 Admin Decisions & Outcomes

### No Ambiguous Outcomes Allowed

| Admin Action | Decision Code | Resulting State | Requires Reason | Requires Notes | Resumable |
| ---| ---| ---| ---| ---| --- |
| Approve | `APPROVED` | `approved` | ❌ No | ❌ No | ✅ Yes |
| Request Changes | `NEEDS_ADJUSTMENT` | `draft` | ✅ Yes | ✅ Yes | ✅ Yes |
| Reject | `REJECTED` | `cancelled` | ✅ Yes | ✅ Yes | ❌ No |
| Escalate | `ESCALATED` | `escalated` | ✅ Yes | ❌ No | ✅ Yes |

### Decision Flow Examples

#### ✅ APPROVED

```javascript
Admin Action: Approve
↓
Trip State: approved
↓
Next Step: Trip proceeds to booking execution
↓
User Sees: "Great news! Your trip has been approved."
```

#### 🔄 REQUEST\_CHANGES

```javascript
Admin Action: Request changes (with notes)
↓
Trip State: draft
↓
Next Step: Trip returns to user for modifications
↓
User Sees: "Quick adjustment needed. Please review the notes below."
↓
System Action: Re-validate on resubmission
```

#### ❌ REJECT

```javascript
Admin Action: Reject (with reason)
↓
Trip State: cancelled
↓
Next Step: Trip is terminated
↓
User Sees: "Your trip request could not be completed.
            Please contact support for details."
```

#### ⬆️ ESCALATE

```javascript
Admin Action: Escalate (with reason)
↓
Trip State: escalated
↓
Next Step: Higher authority reviews
↓
User Sees: "Our concierge team is personally handling your trip.
            We'll reach out shortly."
```

* * *

## 🔄 Resume Logic (After Review)

### Rules for Clean Resumption

```javascript
RESUME_RULES = {
  AFTER_APPROVAL: {
    action: "RESUME_AUTOMATION",
    nextState: "booked",
    revalidate: false,     // Already validated
    notifyUser: true
  },

  AFTER_CHANGES: {
    action: "REQUIRE_REVALIDATION",
    nextState: "draft",
    revalidate: true,      // MUST re-validate
    notifyUser: true
  },

  AFTER_REJECTION: {
    action: "END_FLOW",
    nextState: "cancelled",
    revalidate: false,
    notifyUser: true
  },

  AFTER_ESCALATION: {
    action: "WAIT_FOR_HIGHER_AUTHORITY",
    nextState: "escalated",
    revalidate: false,
    notifyUser: true
  }
}
```

### Resume Process

#### After Approval ✅

1. Trip state → `approved`
2. System resumes normal flow
3. No re-validation needed (already validated)
4. User notified: "Trip approved"
5. Proceed to booking execution (future milestone)

#### After Changes 🔄

1. Trip state → `draft`
2. User can modify fields
3. **Must re-validate before resubmission**
4. System checks: Did user fix the issues?
5. If valid → back to approval queue
6. If invalid → show errors again

#### After Rejection ❌

1. Trip state → `cancelled`
2. Flow terminates cleanly
3. No resumption possible
4. Audit trail preserved
5. User directed to support if needed

#### After Escalation ⬆️

1. Trip state → `escalated`
2. Wait for higher authority
3. Concierge team takes over
4. System pauses automation
5. Manual handling from this point
* * *

## 🛡️ SENTINEL's Role (Explicitly Limited)

### **CRITICAL RULE**: SENTINEL may inform human review but NEVER decides approval

```javascript
SENTINEL_REVIEW_ROLE = {
  purpose: "Provide intelligence context to human decision-makers",

  canProvide: [
    "risk_assessment",       // Color-coded risk level
    "route_analysis",        // Route safety/sensitivity
    "historical_patterns",   // Past trip data
    "contextual_notes"       // Additional intelligence
  ],

  cannotDo: [
    "block_booking",         // NEVER blocks
    "approve_trip",          // NEVER approves
    "force_escalation",      // NEVER forces admin decision
    "override_admin",        // NEVER overrides human judgment
    "hide_from_admin"        // Admin ALWAYS sees full context
  ],

  influence: "INFORMATIONAL_ONLY"
}
```

### SENTINEL in Admin Review

| Risk Level | Interpretation | Recommendation | Blocking? |
| ---| ---| ---| --- |
| Green | No elevated concerns | APPROVE | ❌ Never |
| Yellow | Minor context noted | REVIEW | ❌ Never |
| Orange | Elevated context | REVIEW\_CAREFULLY | ❌ Never |
| Red | Significant context | REVIEW\_CAREFULLY | ❌ Never |

**Example Admin View**:

```javascript
SENTINEL Context:
  Risk Level: Orange
  Note: "Route includes high-traffic area during event weekend"
  Interpretation: "Elevated context - additional verification suggested"
  Recommendation: REVIEW_CAREFULLY

  ⚠️ This is a suggestion only
  ✅ Final decision authority: ADMIN_ONLY
```

### SENTINEL Display by Tier

*   **Basic**: Simple color indicator
*   **Corporate**: Color + brief context notes
*   **Executive**: Full intelligence dashboard
* * *

## 💬 UX Contract (No UI Yet)

### User-Facing Message Definitions

**Rules**:

*   ❌ No error language
*   ❌ No risk language
*   ✅ Premium, neutral tone
*   ✅ Always actionable or reassuring

### Message Templates

#### 1\. **Pending Review**

```javascript
Title: "Your trip is being reviewed"
Message: "We're reviewing your trip details to ensure everything
         is perfect. You'll receive a notification shortly."
Tone: Neutral
Action: "Wait or cancel"
```

#### 2\. **Approved**

```javascript
Title: "Trip approved"
Message: "Great news! Your trip has been approved and we're
         processing your booking."
Tone: Positive
Action: "No action needed"
```

#### 3\. **Needs Changes**

```javascript
Title: "Quick adjustment needed"
Message: "We need a small update to your trip details.
         Please review the notes below."
Tone: Neutral (not error)
Action: "Review and update"
```

#### 4\. **Escalated**

```javascript
Title: "Concierge assistance"
Message: "Our concierge team is personally handling your trip
         request. We'll reach out shortly."
Tone: Premium
Action: "Wait for contact"
```

#### 5\. **Timeout** (After 24h)

```javascript
Title: "Priority escalation"
Message: "Your trip review is being prioritized. Our team
         will contact you soon."
Tone: Neutral
Action: "Wait for contact"
```

### What Users NEVER See

❌ "Validation error: BLOCKED"
❌ "SENTINEL flagged risk"
❌ "System constraint violated"
❌ "Admin override required"
❌ "Payment anomaly detected"

### What Users DO See

✅ "Being reviewed"
✅ "Quick adjustment needed"
✅ "Concierge assistance"
✅ "We're on it"
* * *

## 📊 Complete Flow Example

### Scenario: Executive Tier Booking with SENTINEL Context

```javascript
// 1. User submits trip
Trip: {
  passengers: 4,
  tier: "executive",
  pickup: "Downtown hotel",
  dropoff: "Conference center"
}

// 2. System checks intervention triggers
Triggers:
  - EXECUTIVE_TIER_BOOKING (requires review)
  - SENTINEL_HIGH_RISK (red - informational)

→ requiresHumanReview() returns true

// 3. System transitions to pending_approval
State: pending_approval
User Sees: "Your trip is being reviewed"
Admin Notified: New trip in review queue

// 4. Admin reviews
Admin Sees:
  - Trip details
  - Tier: Executive
  - SENTINEL: Red (route has special event)
  - Recommendation: REVIEW_CAREFULLY
  - Note: "Major conference downtown - high demand"

Admin Authority:
  - Can: approve, request_changes, reject, escalate
  - Cannot: auto-book, bypass validation

// 5. Admin decides: APPROVED (executive tier OK, just busy route)
Decision: APPROVED
Notes: "Confirmed availability, trip approved"

// 6. System resumes
State: approved
Resume Action: RESUME_AUTOMATION
User Notified: "Great news! Your trip has been approved."
Next: Proceed to booking execution (future)

// 7. Audit trail preserved
Approval:
  status: "APPROVED"
  decidedBy: "admin_123"
  decidedAt: "2026-01-04T14:30:00Z"
  notes: "Confirmed availability, trip approved"
  sentinel_context: { risk_level: "red", reviewed: true }
```

* * *

## ✅ Day 5 Completion Checklist

Can you answer these questions?

*   ✅ **When does automation stop?**

→ On BLOCKED validation, executive tier, tier mismatch, special requests, or explicit user help request

*   ✅ **Who decides next?**

→ ADMIN has decision authority. User can cancel. System CANNOT auto-advance.

*   ✅ **What happens to trip while waiting?**

→ State: `pending_approval`. Trip frozen, no execution, user sees neutral message, 24h timeout auto-escalates.

*   ✅ **How does it resume safely?**

→ Based on admin decision: APPROVED → resume automation | CHANGES → require re-validation | REJECTED → end flow | ESCALATED → concierge handles

* * *

## 📂 Files Created

1. [**humanReviewRules.js**](http://../src/backend/etas/humanReviewRules.js) — Complete human review framework:
    *   `INTERVENTION_TRIGGERS` — All conditions requiring review
    *   `requiresHumanReview()` — Check if trip needs review
    *   `PENDING_REVIEW_STATE` — Frozen state definition
    *   `AUTHORITY_BOUNDARIES` — User/Admin/System capabilities
    *   `isAuthorized()` — Permission checker
    *   `ADMIN_DECISIONS` — Decision outcomes matrix
    *   `applyAdminDecision()` — Execute admin decision
    *   `RESUME_RULES` — Post-decision behavior
    *   `resumeAfterReview()` — Safe resumption logic
    *   `SENTINEL_REVIEW_ROLE` — SENTINEL boundaries
    *   `getSentinelReviewContext()` — SENTINEL context for admin
    *   `UX_MESSAGES` — User-facing message templates
    *   `getUserMessage()` — Get appropriate user message
2. **`DAY_5_HUMAN_REVIEW.md`** — This documentation
* * *

## 🛡️ What's Protected

### Trust

*   ✅ Humans decide when system can't
*   ✅ Clear authority boundaries (no confusion)
*   ✅ SENTINEL informs, never decides
*   ✅ Premium UX (no fear language)

### Safety

*   ✅ Frozen state prevents chaos
*   ✅ Audit trail preserved
*   ✅ No silent failures
*   ✅ Timeout protection (24h auto-escalate)

### Operations

*   ✅ No duplicate bookings
*   ✅ No stale data execution
*   ✅ Clean resumption after decisions
*   ✅ Escalation path for edge cases

### User Experience

*   ✅ Neutral, premium messaging
*   ✅ Clear next actions
*   ✅ No technical jargon
*   ✅ Feels like concierge service, not system error
* * *

## 🔜 Next Steps

**Day 6+**: Continue building business logic, approval workflows, and execution paths while respecting the human review framework established today.

The system now knows:

*   When to pause (triggers)
*   Who decides (authority)
*   What happens during wait (frozen state)
*   How to resume (clean paths)
* * *

## 📝 Commit Message

```diff
Define human-in-the-loop review and admin override rules (Sprint Day 5)

- Identified 10 human-intervention triggers (validation, tier, SENTINEL, edge cases)
- Defined pending_approval frozen state with 24h timeout
- Established explicit authority boundaries (user/admin/system)
- Created admin decision matrix (approve/changes/reject/escalate)
- Implemented safe resume logic with re-validation rules
- Explicitly limited SENTINEL to informational role only
- Defined premium UX message contract (no error/risk language)
- Created comprehensive helper functions and audit trail support
```

* * *

## 📊 ClickUp Update

**Sprint Day 5 complete**: Formalized human review triggers, admin authority boundaries, and safe resume logic for trips requiring manual intervention. System now knows exactly when automation pauses, who decides next, what happens during review, and how to resume cleanly. SENTINEL explicitly limited to informational role. Premium UX maintained throughout review process.
