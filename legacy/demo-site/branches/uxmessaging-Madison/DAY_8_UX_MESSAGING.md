# Sprint Day 8 — UX Messaging & Status Surfaces

**Date**: January 6, 2026  
**Status**: ✅ Complete  
**Deliverable**: Complete messaging contracts for user and admin experiences

---

## 🎯 Day 8 Goal

**"At every moment, the user and admin should understand what's happening, why it's happening, and what (if anything) they need to do next."**

This day answers:
- ✅ What does the user see in each trip state?
- ✅ How do we communicate failures without panic?
- ✅ How do we avoid technical or scary language?
- ✅ How do we maintain a premium, calm experience?

**This protects trust, conversion, and brand.**

---

## 📝 What We're NOT Doing

❌ No UI build  
❌ No frontend wiring  
✅ Messaging definitions & contracts only

**We're defining what is said, not how it looks.**

---

## 🗂️ User-Visible Trip States

### States a user can experience (from their perspective)

| State | Description | User Awareness |
|-------|-------------|----------------|
| **draft** | Building trip request | "I'm working on it" |
| **booking_ready** | Ready to submit | "Looks good, ready to go" |
| **submitted** | Confirming details | "They're checking it" |
| **pending_review** | Being reviewed | "They're making sure it's right" |
| **approved** | Confirmed, ready | "All set, waiting for booking" |
| **needs_adjustment** | Requires changes | "I need to fix something" |
| **escalated** | Special attention needed | "Team is handling it personally" |
| **booked** | Fully scheduled | "My trip is confirmed" |
| **in_progress** | Currently happening | "I'm on my trip now" |
| **completed** | Finished | "All done" |
| **cancelled** | Cancelled | "No longer happening" |
| **failed** | Didn't complete | "Something went wrong, but they're on it" |

---

## 🧠 User Mental Model Per State

### For each state: belief, actions, don't worry

#### draft
**Belief**: "I'm building my trip request."  
**Actions**: Edit details, Select tier, Submit when ready  
**Don't Worry**: Nothing has been charged or committed yet.

#### booking_ready
**Belief**: "My trip is ready to submit."  
**Actions**: Review details, Submit, Make changes  
**Don't Worry**: You can still adjust anything before submitting.

#### submitted
**Belief**: "My trip is being confirmed."  
**Actions**: Wait, View status, Cancel if needed  
**Don't Worry**: We're checking details. This is normal and quick.

#### pending_review
**Belief**: "My trip is being reviewed to make sure everything is set."  
**Actions**: Wait, View status, Contact support if urgent  
**Don't Worry**: This is routine. Nothing has gone wrong.

#### approved
**Belief**: "My trip is confirmed and ready."  
**Actions**: View trip details, Make changes if needed, Wait for booking  
**Don't Worry**: Everything is confirmed. We'll handle the logistics.

#### needs_adjustment
**Belief**: "I need to update something in my trip."  
**Actions**: Review feedback, Make changes, Resubmit  
**Don't Worry**: This is normal. Just small adjustments needed.

#### escalated
**Belief**: "My trip needs special attention from the team."  
**Actions**: Wait for contact, Check messages, Respond when reached out  
**Don't Worry**: Our team is on it. They'll reach out soon.

#### booked
**Belief**: "My trip is fully booked and scheduled."  
**Actions**: View booking details, Contact driver (when available), Cancel if emergency  
**Don't Worry**: Everything is set. You'll receive updates as trip approaches.

#### in_progress
**Belief**: "My trip is happening right now."  
**Actions**: Track location, Contact driver, Report issues if needed  
**Don't Worry**: Enjoy your ride. All logistics are handled.

#### completed
**Belief**: "My trip is complete."  
**Actions**: View receipt, Rate experience, Book another trip  
**Don't Worry**: All done. Thank you for riding with us.

#### cancelled
**Belief**: "My trip was cancelled."  
**Actions**: View cancellation details, Book a new trip if needed, Contact support if questions  
**Don't Worry**: Cancellation is processed. No unexpected charges.

#### failed
**Belief**: "Something didn't go through with my trip."  
**Actions**: Check status, Try again, Contact support for help  
**Don't Worry**: Our team will follow up. No charges if booking didn't complete.

---

## 💬 Neutral, Premium Status Messages

### Rules:
- ✅ 1-2 sentences max
- ✅ No technical terms (API, validation, error, etc)
- ✅ No blame ("you didn't", "you forgot")
- ✅ No urgency unless required
- ✅ No internal language
- ✅ Premium, calm tone

| State | Title | Message | Tone | Urgency |
|-------|-------|---------|------|---------|
| **draft** | Building your trip | You're putting together your trip details. Take your time. | Neutral | None |
| **booking_ready** | Ready to submit | Your trip looks good. Review and submit when ready. | Encouraging | Low |
| **submitted** | Confirming details | We're confirming the details of your trip. This usually takes a moment. | Calm | None |
| **pending_review** | Reviewing your trip | We're reviewing your trip to ensure everything is set. You'll hear from us shortly. | Reassuring | None |
| **approved** | Trip confirmed | Your trip is confirmed and ready. We'll handle the booking details. | Positive | None |
| **needs_adjustment** | Quick update needed | We need a small adjustment to your trip. Please review and update. | Helpful | Medium |
| **escalated** | Our team is reviewing | Your trip needs special attention. Our team will reach out shortly. | Reassuring | None |
| **booked** | All set | Your trip is booked and scheduled. You'll receive updates as your trip approaches. | Positive | None |
| **in_progress** | In progress | Your trip is underway. Enjoy your ride. | Calm | None |
| **completed** | Trip complete | Thank you for riding with us. We hope you had a great experience. | Positive | None |
| **cancelled** | Cancelled | Your trip has been cancelled. No charges will apply if booking hadn't completed. | Neutral | None |
| **failed** | We're on it | We weren't able to complete your request. Our team will follow up shortly. | Reassuring | Low |

---

## 📊 Message Types

### Classification for UI rendering

| Type | Purpose | Characteristics | Examples |
|------|---------|-----------------|----------|
| **STATUS** | Explains what's happening | Passive, calm tone. User just observes. | "Confirming details", "Trip confirmed" |
| **ACTION** | Asks user to do something | One clear action. User must respond. | "Quick update needed", "Ready to submit" |
| **INFO** | Suggestions or context | Never blocking. Optional awareness. | "Taking longer than expected" |

### Message Type Distribution

| State | Type |
|-------|------|
| draft | STATUS |
| booking_ready | ACTION |
| submitted | STATUS |
| pending_review | STATUS |
| approved | STATUS |
| needs_adjustment | ACTION |
| escalated | STATUS |
| booked | STATUS |
| in_progress | STATUS |
| completed | STATUS |
| cancelled | STATUS |
| failed | STATUS |

**Key Insight**: Most messages are STATUS (passive). Only 2 are ACTION (requiring user response). This maintains a calm, low-pressure experience.

---

## ✅ Validation Outcome Messaging

### Integrates with Day 3 validation framework

| Outcome | Title | Message | Tone | User Can Fix | Progression |
|---------|-------|---------|------|--------------|-------------|
| **VALID** | Looking good | Your trip details check out. Ready to proceed. | Positive | N/A | ✅ Yes |
| **INVALID** | Quick check needed | Please review the highlighted fields and try again. | Helpful | ✅ Yes | ❌ No |
| **BLOCKED** | Reviewing your request | We're reviewing your trip details. You'll hear from us shortly. | Neutral | ❌ No | ❌ No |

### Validation Flow Examples

#### Valid Trip
```
User submits trip
  ↓
Validation: VALID
  ↓
User sees: "Looking good. Your trip details check out. 
            Ready to proceed."
  ↓
State: submitted → approved
```

#### Invalid Trip (User-Fixable)
```
User submits trip with missing/invalid data
  ↓
Validation: INVALID
  ↓
User sees: "Quick check needed. Please review the 
            highlighted fields and try again."
  ↓
State: draft (returned)
Fields: Highlighted with specific errors
Action: User fixes and resubmits
```

#### Blocked Trip (Admin Intervention)
```
User submits trip with policy violations
  ↓
Validation: BLOCKED
  ↓
User sees: "Reviewing your request. We're reviewing your 
            trip details. You'll hear from us shortly."
  ↓
State: pending_review
Admin: Notified with full context
```

---

## 🚨 Error/Failure Messaging (Day 7 Integration)

### User-facing messages for failures (never technical)

| Failure Type | Title | Message | Tone | Can Retry |
|--------------|-------|---------|------|-----------|
| **VALIDATION_FAILURE** | Quick check needed | Please review the highlighted fields and try again. | Helpful | ✅ Yes |
| **PAYMENT_FAILURE** | Payment issue | We couldn't process your payment. Please check your payment method or try again. | Helpful | ✅ Yes |
| **DISPATCH_FAILURE** | Booking in progress | We're working on your booking. You'll receive an update shortly. | Reassuring | ❌ No |
| **SYSTEM_TIMEOUT** | Taking longer than expected | We're still processing your request. Please check back in a moment. | Neutral | ✅ Yes |
| **EXTERNAL_API_ERROR** | Connection issue | We're having trouble connecting to our booking partner. Our team is on it. | Reassuring | ❌ No |
| **ADMIN_REJECTION** | Trip update | We couldn't complete your booking as requested. Please contact support for details. | Neutral | ❌ No |
| **TIER_MISMATCH** | Service tier adjustment needed | The selected tier doesn't match your trip requirements. Please select a different tier. | Helpful | ✅ Yes |
| **CAPACITY_UNAVAILABLE** | Limited availability | No vehicles are currently available for your requested time. Try a different time or we'll reach out with options. | Helpful | ✅ Yes |
| **STATE_TRANSITION_ERROR** | Reviewing your trip | We're reviewing your trip details to ensure everything is correct. You'll hear from us soon. | Reassuring | ❌ No |
| **DUPLICATE_REQUEST** | Request already received | We've already received your request and are processing it. | Informative | ❌ No |
| **GENERIC_FAILURE** | We're on it | Something didn't go through. Our team is reviewing your trip and will follow up. | Reassuring | ❌ No |

### What Users NEVER See

❌ "Error 500: Internal Server Error"  
❌ "DISPATCH_FAILURE: API returned 503"  
❌ "Validation constraint violated"  
❌ "Payment gateway timeout exception"  
❌ "State transition guard failed"

### What Users DO See

✅ "Quick check needed"  
✅ "Booking in progress"  
✅ "Payment issue"  
✅ "We're on it"  
✅ "Our team is reviewing"

---

## 👁️ Admin-Facing Messaging

### Admins get more context (but still structured)

#### Scenario 1: Trip Failed

**Severity**: 🟠 High  
**Title**: Trip Failed

**Fields Shown**:
- `failure_type` — Technical failure category
- `failure_reason` — What actually happened
- `retry_count` — How many times system tried
- `last_retry_at` — When last retry occurred
- `user_message_shown` — What user saw
- `trip_state` — Current state
- `escalation_reason` — Why it escalated

**Available Actions**:
- Retry Manually
- Approve Override
- Reject with Reason
- Contact User

**Notes**: Show full technical context including error messages

---

#### Scenario 2: Pending Review

**Severity**: 🟡 Medium  
**Title**: Trip Pending Review

**Fields Shown**:
- `review_reason` — Why review triggered
- `intervention_trigger` — Specific trigger from Day 5
- `validation_issues` — Any validation concerns
- `sentinel_context` — SENTINEL data (if available)
- `user_message_shown` — What user saw
- `trip_state` — Current state
- `time_in_review` — How long in review

**Available Actions**:
- Approve
- Request Adjustment
- Escalate Higher
- Contact User

**Notes**: Show validation context and SENTINEL data if available

---

#### Scenario 3: Retries Exhausted

**Severity**: 🟠 High  
**Title**: Retries Exhausted

**Fields Shown**:
- `failure_type` — What kept failing
- `retry_count` — Total attempts
- `retry_strategy` — Strategy used (SHORT_BACKOFF, etc)
- `retry_history` — Timeline of attempts
- `escalation_condition` — Why it stopped
- `user_message_shown` — What user saw
- `trip_state` — Current state

**Available Actions**:
- Retry Manually
- Approve Override
- Escalate Higher
- Contact User

**Notes**: Show full retry timeline and escalation conditions

---

#### Scenario 4: Validation Blocked

**Severity**: 🟡 Medium  
**Title**: Validation Blocked

**Fields Shown**:
- `validation_outcome` — BLOCKED
- `blocking_reason` — Why blocked
- `field_errors` — Specific field issues
- `system_constraints` — What constraints violated
- `user_message_shown` — What user saw
- `trip_state` — Current state

**Available Actions**:
- Approve Override
- Request Adjustment
- Reject with Reason

**Notes**: Show all validation failures and system constraints

---

#### Scenario 5: Escalated to Concierge

**Severity**: 🔵 Low  
**Title**: Escalated to Concierge

**Fields Shown**:
- `escalation_reason` — Why escalated
- `user_request` — What user asked for
- `trip_context` — Trip details
- `sentinel_context` — SENTINEL data
- `user_contact_info` — How to reach user
- `trip_state` — Current state

**Available Actions**:
- Contact User
- Create Custom Trip
- Annotate

**Notes**: Route to concierge workflow (Calendly/SMS)

---

### Admin Severity Indicators

| Severity | Color | Icon | When Used |
|----------|-------|------|-----------|
| **Low** | 🔵 Blue | ℹ️ | Informational, routine escalation |
| **Medium** | 🟡 Yellow | ⚠️ | Attention needed, review required |
| **High** | 🟠 Orange | 🚨 | Urgent, affects booking success |
| **Critical** | 🔴 Red | ❌ | System integrity issue, immediate action |

---

## 🚫 UI Exclusions (What We NEVER Show)

### Protects UX, security, and brand

#### Technical Errors
❌ Stack traces  
❌ Error codes (500, 503, etc)  
❌ Exception messages  
❌ Database errors  
❌ API error responses  
❌ Console logs  
❌ Debug information

#### System Internals
❌ Internal state names (draft, booking_ready, etc)  
❌ Validation rule names  
❌ Retry counters  
❌ Backoff calculations  
❌ System timeouts  
❌ API endpoint names  
❌ Database IDs  
❌ Internal field names

#### Risk Assessment
❌ SENTINEL risk scores  
❌ SENTINEL confidence levels  
❌ Risk flags (green/yellow/orange/red)  
❌ Anomaly detection results  
❌ Fraud detection scores  
❌ Any risk-related terminology

#### Operations
❌ Provider names (Lyft, Uber, etc) before booking  
❌ Dispatch status  
❌ Provider rejection reasons  
❌ Pricing calculations  
❌ Commission splits  
❌ Internal notes  
❌ Admin annotations

#### Permissions
❌ User role names (USER, ADMIN, SYSTEM)  
❌ Permission checks  
❌ Authorization failures  
❌ Access control rules

#### Development
❌ TODO comments  
❌ Feature flags  
❌ A/B test assignments  
❌ Development mode indicators  
❌ Mock data labels

---

## 📋 Complete Messaging Examples

### Example 1: Normal Booking Flow

```
State: draft
User sees: "Building your trip"
Message: "You're putting together your trip details. Take your time."
Actions: [Edit, Select Tier, Cancel]

↓ User submits

State: submitted
User sees: "Confirming details"
Message: "We're confirming the details of your trip. This usually takes a moment."
Actions: [View Status, Cancel]

↓ Validation passes

State: approved
User sees: "Trip confirmed"
Message: "Your trip is confirmed and ready. We'll handle the booking details."
Actions: [View Details, Make Changes]

↓ Booking completes

State: booked
User sees: "All set"
Message: "Your trip is booked and scheduled. You'll receive updates as your trip approaches."
Actions: [View Booking, Contact Driver, Cancel if Emergency]
```

---

### Example 2: Validation Failure (User-Fixable)

```
State: draft
User submits with invalid data

↓ Validation: INVALID

User sees: "Quick check needed"
Message: "Please review the highlighted fields and try again."
State: draft (returned)
Fields: 
  - Pickup time: "Must be at least 2 hours in advance"
  - Passengers: "Must select a tier that fits 7 passengers"
Actions: [Fix Fields, Submit Again]

↓ User fixes and resubmits

State: submitted
Proceeds normally
```

---

### Example 3: Payment Failure with Retry

```
State: approved
Payment processing starts

↓ Payment fails

System retries automatically (user doesn't see retries)

↓ Retries exhausted

State: pending_review
User sees: "We're on it"
Message: "We weren't able to complete your request. Our team will follow up shortly."
Actions: [Check Status, Update Payment Method]

Admin sees:
  - Failure Type: PAYMENT_FAILURE
  - Retry Count: 2
  - Escalation Reason: REPEATED_PAYMENT_FAILURES
  - User Message: "We're on it"
Admin actions: [Retry Manually, Contact User, Reject]
```

---

### Example 4: Escalation to Concierge

```
State: pending_review
User has complex request

Admin reviews: "This needs concierge attention"

↓ Admin escalates

State: escalated
User sees: "Our team is reviewing"
Message: "Your trip needs special attention. Our team will reach out shortly."
Actions: [Wait for Contact, Check Messages]

Admin sees:
  - Escalation Reason: Complex custom request
  - User Contact: phone, email
  - Trip Context: [full details]
Admin routes to: Calendly/SMS workflow
```

---

## ✅ Day 8 Completion Checklist

Can you answer these questions?

- ✅ **What does the user see right now?**  
  → Check STATUS_MESSAGES for current trip state

- ✅ **What should they do next (if anything)?**  
  → Check USER_MENTAL_MODEL.actions for available actions

- ✅ **Are we creating panic or clarity?**  
  → All messages use calm, reassuring tone. No urgency unless required.

- ✅ **Is this consistent across web, PWA, and mobile?**  
  → Yes. These are platform-agnostic messaging contracts.

- ✅ **What do admins see?**  
  → Check ADMIN_MESSAGES for structured context and actions

- ✅ **What do we NEVER show users?**  
  → Check UI_NEVER_SHOWS for explicit exclusions

---

## 📂 Files Created

1. **[uxMessaging.js](../src/backend/etas/uxMessaging.js)** — Complete messaging framework:
   - `USER_VISIBLE_STATES` — 12 states users can experience
   - `USER_MENTAL_MODEL` — Belief, actions, don't worry for each state
   - `MESSAGE_TYPES` — STATUS, ACTION, INFO classification
   - `STATUS_MESSAGES` — User-facing messages for all states
   - `VALIDATION_MESSAGES` — Maps to Day 3 validation outcomes
   - `FAILURE_MESSAGES` — Maps to Day 7 failure types
   - `ADMIN_MESSAGES` — Admin-facing context for 5 scenarios
   - `UI_NEVER_SHOWS` — Explicit exclusion list (6 categories)
   - `getUserMessage()` — Get message for state
   - `getValidationMessage()` — Get message for validation outcome
   - `getFailureMessage()` — Get message for failure type
   - `getAdminContext()` — Get admin context for situation
   - `getUserMentalModel()` — Get mental model for state
   - `isForbiddenContent()` — Check if content violates exclusions
   - `sanitizeMessage()` — Remove forbidden content from messages
   - `validateMessagingCoverage()` — Ensure all states have messaging

2. **`DAY_8_UX_MESSAGING.md`** — This documentation

---

## 🛡️ What's Protected

### User Experience
- ✅ Always know what's happening (12 states with clear messaging)
- ✅ Always know what to do next (mental model defines actions)
- ✅ Never see panic or technical errors (calm, premium tone)
- ✅ Never see confusing jargon (plain language only)

### Brand
- ✅ Premium positioning (thoughtful, calm language)
- ✅ Trust-building (reassuring, honest, transparent)
- ✅ Professionalism (no blame, no urgency manipulation)
- ✅ Consistency (same tone across all touchpoints)

### Operations
- ✅ Admin clarity (structured context, not guessing)
- ✅ Actionable information (clear next steps for admins)
- ✅ Severity awareness (color-coded priorities)
- ✅ User communication (know what user was told)

### Security
- ✅ No internal exposure (state names, IDs, etc hidden)
- ✅ No risk data exposure (SENTINEL scores hidden)
- ✅ No technical details (error codes, APIs hidden)
- ✅ Clean separation (user vs admin information)

---

## 🔜 Next Steps

**Day 9+**: Build execution flows, booking logic, and provider integrations while using the messaging contracts established today.

The system now knows:
- What to tell users in every state
- What users think and can do in each state
- What to tell admins when intervention needed
- What to never show in UI (security & UX protection)

**Key Integration Points**:
- Day 3 validation → Use `VALIDATION_MESSAGES`
- Day 7 failures → Use `FAILURE_MESSAGES`
- State transitions → Use `STATUS_MESSAGES`
- Admin reviews → Use `ADMIN_MESSAGES`

---

## 📝 Commit Message

```
Define UX messaging and status contracts for trip lifecycle (Sprint Day 8)

- Defined 12 user-visible trip states with mental models
- Created neutral, premium status messages (no technical language)
- Classified messages into status, action, and info types
- Mapped messaging to Day 3 validation outcomes
- Mapped messaging to Day 7 failure types
- Created admin-facing messaging with structured context
- Defined explicit UI exclusions (what never shows)
- Implemented message helpers and sanitization functions
- Ensured calm, clear communication at every touchpoint
```

---

## 📊 ClickUp Update

**Sprint Day 8 complete**: Defined user- and admin-facing messaging contracts to ensure clear, calm communication across all trip states. Messaging protects trust, conversion, and brand with premium tone and zero technical exposure.
