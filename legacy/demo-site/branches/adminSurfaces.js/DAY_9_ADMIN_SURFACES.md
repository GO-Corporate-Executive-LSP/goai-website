# Sprint Day 9 — Admin Surfaces, Operational Visibility & Control

**Date**: January 8, 2026  
**Status**: ✅ Complete  
**Deliverable**: Complete admin operational framework for trip management

---

## 🎯 Day 9 Goal

**"Make sure operators can see what's happening, understand why, and act decisively—without guessing."**

This day answers:
- ✅ What does an admin see when something needs attention?
- ✅ How do admins know why a trip is blocked or failed?
- ✅ What actions are available at each moment?
- ✅ How do we avoid ops chaos as volume grows?

**This protects execution quality and response time.**

---

## 📝 What We're NOT Doing

❌ No frontend UI build  
❌ No backend wiring  
✅ Operational surface definitions only

**We're defining what must exist, not building it yet.**

---

## 🎫 Admin-Relevant Trip States

### States that require admin awareness (not all states need admin visibility)

| State | Priority | Requires Action | Description |
|-------|----------|-----------------|-------------|
| **failed** | 🔴 Critical | ✅ Yes | Something went wrong, needs intervention |
| **pending_review** | 🟠 High | ✅ Yes | Awaiting human decision |
| **escalated** | 🔴 Critical | ✅ Yes | Requires special handling |
| **needs_adjustment** | 🟡 Medium | ⏸️ Waiting | Returned to user for changes |
| **submitted** | 🟢 Low | 👁️ Monitor | Being processed (optional monitoring) |
| **approved** | 🟢 Low | 👁️ Monitor | Approved, awaiting execution |
| **booked** | 🟢 Low | 👁️ Monitor | Successfully booked |
| **completed** | ⚪ Archive | ℹ️ Info | Trip completed |
| **cancelled** | ⚪ Archive | ℹ️ Info | Trip cancelled |

### Priority Levels

| Priority | Color | When Used | Response Time |
|----------|-------|-----------|---------------|
| **Critical** | 🔴 Red | Blocking user, immediate action needed | < 15 minutes |
| **High** | 🟠 Orange | Requires attention soon | < 1 hour |
| **Medium** | 🟡 Yellow | Should review when available | < 4 hours |
| **Low** | 🟢 Green | Informational only | As needed |
| **Archive** | ⚪ Gray | Historical reference | N/A |

---

## 📋 Admin Queue Concept

### Definition

**"A prioritized list of trips that require human attention or monitoring."**

**Purpose**: Provide operational backbone for trip management as volume grows

### Ordering Strategy

Trips are sorted by:
1. **Priority** — Critical → High → Medium → Low
2. **Time in State** — Longest waiting first
3. **Retry Count** — Most retries first (within same priority)
4. **Created Date** — Oldest first (tiebreaker)

### Grouping Strategy

- **Primary Group**: By state (pending_review, failed, escalated, etc)
- **Secondary Group**: By failure type (within failed state)

### Queue Sections

```
┌─────────────────────────────────────────────┐
│  NEEDS ACTION (🔴 Critical/🟠 High)         │
│  ├─ pending_review (5 trips)                │
│  ├─ failed (3 trips)                        │
│  └─ escalated (2 trips)                     │
├─────────────────────────────────────────────┤
│  MONITORING (🟡 Medium/🟢 Low)              │
│  ├─ submitted (12 trips)                    │
│  ├─ needs_adjustment (4 trips)              │
│  └─ approved (8 trips)                      │
├─────────────────────────────────────────────┤
│  ACTIVE (🟢 Low)                            │
│  └─ booked (15 trips)                       │
├─────────────────────────────────────────────┤
│  ARCHIVE (⚪ Archive)                        │
│  ├─ completed (last 7 days)                 │
│  └─ cancelled (last 7 days)                 │
└─────────────────────────────────────────────┘
```

### Visibility Rules

- **Auto-archive**: Completed/cancelled after 7 days
- **Page Size**: 50 trips per page
- **Auto-refresh**: Every 30 seconds
- **New Item Badge**: Show when new trips enter queue

### Filter Options

| Filter | Description | Example |
|--------|-------------|---------|
| **state** | Filter by trip state | `state=failed` |
| **failure_type** | Filter by failure category | `failure_type=PAYMENT_FAILURE` |
| **tier** | Filter by service tier | `tier=CORPORATE` |
| **priority** | Filter by priority level | `priority=critical` |
| **retry_count_gt** | Trips with more than N retries | `retry_count_gt=2` |
| **time_in_state_gt** | Trips waiting longer than duration | `time_in_state_gt=1h` |
| **sentinel_flag** | Filter by SENTINEL flag | `sentinel_flag=red` |

---

## 🔍 Admin Context Per Trip

### CRITICAL: Admins should never have to infer what happened

### Context Fields (by Display Level)

#### Prominent Display (Always Visible)
| Field | Type | Description |
|-------|------|-------------|
| **trip_id** | string | Trip identifier |
| **current_state** | enum | Current trip state (color-coded) |
| **failure_type** | enum | Failure category (if failed) |
| **escalation_reason** | text | Why escalated (if applicable) |
| **time_in_state** | duration | How long in current state |

#### Standard Display (Card/List View)
| Field | Type | Description |
|-------|------|-------------|
| **user_id** | string | User identifier |
| **user_email** | email | User contact |
| **tier** | enum | Service tier (BASIC/CORPORATE/EXECUTIVE) |
| **passengers** | number | Number of passengers |
| **luggage** | number | Number of luggage pieces |
| **pickup_time** | timestamp | When pickup is scheduled |
| **destination** | string | Trip destination |
| **retry_count** | number | How many retries attempted |
| **sentinel_flag** | enum | SENTINEL risk flag (green/yellow/orange/red) |
| **created_at** | timestamp | When trip was created |
| **updated_at** | timestamp | Last update time |

#### Detail Display (Expanded View)
| Field | Type | Description |
|-------|------|-------------|
| **previous_state** | enum | State before current |
| **failure_reason** | text | Technical failure reason |
| **last_retry_at** | timestamp | When last retry occurred |
| **user_notes** | text | Notes from user |
| **sentinel_confidence** | percentage | SENTINEL confidence level |
| **sentinel_notes** | text | SENTINEL context |
| **admin_notes** | text | Admin notes (editable) |
| **last_admin_action** | text | Last action taken |
| **last_admin_user** | string | Admin who last acted |

### Example Admin Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 TRIP #TRP_45678 — FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: john.doe@example.com
Tier: Corporate | 4 passengers | 2 luggage

Failure: PAYMENT_FAILURE
Reason: Stripe returned 402: card_declined
Retry Count: 2 (last: 14:34:15)
Time in State: 45 minutes

SENTINEL: 🟢 Green (confidence: 95%)

Pickup: Jan 10, 2026 @ 14:00
Destination: LAX Airport

User Saw: "We're having trouble processing payment.
           Our team will reach out shortly."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIONS:
  [Retry Manually]  [Approve Override]  [Contact User]
  [Escalate]        [Cancel]            [Add Note]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚡ Allowed Admin Actions per State

### No ambiguous actions — every state has explicit allowed actions

| State | Primary Actions | Secondary Actions | Dangerous Actions |
|-------|----------------|-------------------|-------------------|
| **pending_review** | Approve, Request Adjustment | Escalate, Reject, Annotate | Force Cancel |
| **failed** | Retry Manually, Approve Override | Escalate, Cancel, Annotate | Force Cancel |
| **escalated** | Resolve Escalation, Contact User | Approve Override, Annotate | Force Cancel |
| **submitted** | Monitor | Annotate, Contact User | Force Cancel |
| **needs_adjustment** | Monitor, Contact User | Approve Override, Annotate | Force Cancel |
| **approved** | Monitor, Execute Manually | Annotate, Contact User | Force Cancel |
| **booked** | Monitor, View Booking | Annotate, Contact User | Force Cancel |
| **completed** | View Details | Annotate | — |
| **cancelled** | View Details | Annotate | — |

### Action Definitions

| Action | Description | Requires Notes | Requires Confirmation | Button Style |
|--------|-------------|----------------|----------------------|--------------|
| **Approve** | Approve trip for execution | ❌ No | ❌ No | Primary |
| **Request Adjustment** | Return to user for changes | ✅ Yes | ❌ No | Secondary |
| **Retry Manually** | Manually retry failed operation | ❌ No | ✅ Yes | Primary |
| **Approve Override** | Override system checks and approve | ✅ Yes | ✅ Yes | Warning ⚠️ |
| **Escalate** | Escalate to senior admin/concierge | ✅ Yes | ❌ No | Secondary |
| **Reject** | Reject trip permanently | ✅ Yes | ✅ Yes | Danger ❌ |
| **Cancel** | Cancel trip | ✅ Yes | ✅ Yes | Danger ❌ |
| **Resolve Escalation** | Mark escalation as resolved | ✅ Yes | ❌ No | Primary |
| **Execute Manually** | Manually trigger execution | ❌ No | ✅ Yes | Primary |
| **Monitor** | Watch trip progress | ❌ No | ❌ No | Ghost |
| **Annotate** | Add admin notes | ✅ Yes | ❌ No | Ghost |
| **Contact User** | Reach out to user | ✅ Yes | ❌ No | Ghost |
| **View Details** | View full trip details | ❌ No | ❌ No | Ghost |
| **View Booking** | View booking confirmation | ❌ No | ❌ No | Ghost |
| **Force Cancel** | Force cancel (emergency only) | ✅ Yes | ✅ Yes | Danger Outlined ⛔ |

---

## ✅ Admin Decision Outcomes

### CRITICAL: Each action results in predictable state change

| Admin Action | From States | To State | User Notified | Special Handling |
|--------------|-------------|----------|---------------|------------------|
| **Approve** | pending_review | approved | ✅ Yes | Audit required |
| **Request Adjustment** | pending_review, failed | needs_adjustment | ✅ Yes | Requires revalidation |
| **Retry Manually** | failed | submitted | ❌ No | Keep retry history |
| **Approve Override** | pending_review, failed, needs_adjustment | approved | ✅ Yes | Flag override, supervisor review |
| **Escalate** | pending_review, failed | escalated | ✅ Yes | Audit required |
| **Reject** | pending_review, escalated | cancelled | ✅ Yes | Refund required |
| **Cancel** | failed, needs_adjustment | cancelled | ✅ Yes | Refund required |
| **Resolve Escalation** | escalated | approved | ✅ Yes | Audit required |
| **Execute Manually** | approved | booked | ✅ Yes | Audit required |
| **Annotate** | * (any state) | (no change) | ❌ No | Audit required |
| **Contact User** | * (any state) | (no change) | ❌ No | Audit required |
| **Force Cancel** | * (any state) | cancelled | ✅ Yes | Flag emergency, supervisor review, refund |

### User Notification Messages

| Action | User Sees |
|--------|-----------|
| **Approve** | "Your trip has been approved" |
| **Request Adjustment** | "Please review and update your trip" |
| **Approve Override** | "Your trip has been approved" |
| **Escalate** | "Our team is reviewing your trip" |
| **Reject** | "We were unable to complete your booking" |
| **Cancel** | "Your trip has been cancelled" |
| **Resolve Escalation** | "Your trip has been confirmed" |
| **Execute Manually** | "Your trip is confirmed" |
| **Force Cancel** | "Your trip has been cancelled" |

### Example Outcome Flow

```
Admin Action: Approve Override
  ↓
Current State: failed
  ↓
Validations:
  ✓ Admin has permission
  ✓ Notes provided (reason for override)
  ✓ Confirmation received
  ↓
State Change: failed → approved
  ↓
Side Effects:
  ✓ Flag trip as "admin_override"
  ✓ Create audit record
  ✓ Send user notification
  ✓ Schedule supervisor review
  ↓
User Sees: "Your trip has been approved"
Admin Sees: Override logged, supervisor notified
```

---

## 📝 Audit Expectations

### What MUST be logged for every admin action

#### Required Fields (No Exceptions)

| Field | Type | Description |
|-------|------|-------------|
| **audit_id** | uuid | Unique audit record ID |
| **admin_id** | string | Who performed action |
| **admin_email** | string | Admin email for contact |
| **action** | string | What action was taken |
| **trip_id** | string | Which trip was affected |
| **timestamp** | datetime | When action occurred |
| **from_state** | string | State before action |
| **to_state** | string | State after action (null if no change) |
| **ip_address** | string | Where action originated |
| **user_agent** | string | Browser/device info |

#### Optional (But Encouraged)

| Field | Type | Description |
|-------|------|-------------|
| **notes** | text | Admin reasoning/notes |
| **override_reason** | text | Why override was necessary |
| **user_contacted** | boolean | Was user notified |
| **escalation_target** | string | Who was escalated to |
| **resolution_notes** | text | How issue was resolved |

#### System-Generated

| Field | Type | Description |
|-------|------|-------------|
| **session_id** | string | Admin session identifier |
| **environment** | string | production/staging/dev |
| **version** | string | System version at time of action |

### Audit Event Types

| Event | When Logged | Retention |
|-------|-------------|-----------|
| **ADMIN_LOGIN** | Admin signs in | 2 years |
| **ADMIN_LOGOUT** | Admin signs out | 2 years |
| **TRIP_APPROVED** | Trip approved | 2 years |
| **TRIP_REJECTED** | Trip rejected | 7 years (sensitive) |
| **TRIP_CANCELLED** | Trip cancelled | 7 years (sensitive) |
| **TRIP_ESCALATED** | Trip escalated | 2 years |
| **TRIP_RETRIED** | Manual retry | 2 years |
| **OVERRIDE_APPLIED** | System checks overridden | 7 years (sensitive) |
| **NOTE_ADDED** | Admin note added | 2 years |
| **USER_CONTACTED** | User contacted | 2 years |
| **EMERGENCY_CANCEL** | Force cancel used | Indefinite |
| **STATE_CHANGED** | Any state change | 2 years |

### Retention Policy

| Action Type | Retention Period | Reason |
|-------------|------------------|--------|
| **Standard Actions** | 2 years | Normal operations |
| **Sensitive Actions** | 7 years | Overrides, cancellations, rejections |
| **Emergency Actions** | Indefinite | Force cancels, critical incidents |

### Example Audit Record

```json
{
  "audit_id": "aud_8a7f6b5c4d3e2f1a",
  "admin_id": "adm_12345",
  "admin_email": "admin@example.com",
  "action": "OVERRIDE_APPLIED",
  "trip_id": "TRP_45678",
  "timestamp": "2026-01-08T14:45:30Z",
  "from_state": "failed",
  "to_state": "approved",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "notes": "User has valid payment method on file. Card issuer confirmed temporary decline. Approved for booking.",
  "override_reason": "Confirmed with payment processor that card is valid",
  "user_contacted": false,
  "session_id": "sess_abc123",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 👥 Admin vs User Messaging Separation

### CRITICAL: Clear separation prevents confusion and security risks

### What Admins See (Explicit, Technical)

✅ Failure types (VALIDATION_FAILURE, PAYMENT_FAILURE, etc)  
✅ Failure reasons (technical error messages)  
✅ Retry counts (how many times retried)  
✅ System notes (internal context)  
✅ SENTINEL scores (full risk assessment data)  
✅ API errors (external API error details)  
✅ State names (internal state names)  
✅ Validation errors (field-level failures)  
✅ User data (full user context)  
❌ Stack traces (NEVER - security risk)

### What Users See (Calm, Non-Technical)

❌ Failure types  
❌ Failure reasons  
❌ Retry counts  
❌ System notes  
❌ SENTINEL scores  
❌ API errors  
❌ Internal state names  
❌ Stack traces  
✅ Validation errors (only user-fixable field errors)  
✅ Status messages (calm, premium messaging only)

### Example: Payment Failure Scenario

#### Scenario
Payment fails after 2 automatic retries, escalated to admin

#### Admin Sees
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATE: failed
FAILURE TYPE: PAYMENT_FAILURE
FAILURE REASON: Stripe API returned 402: card_declined
RETRY COUNT: 2
RETRY HISTORY:
  - Attempt 1: 14:30:15 (waited 30s)
  - Attempt 2: 14:30:45 (waited 45s)
  - Escalated: 14:31:30
SYSTEM NOTES: Attempted retry with exponential 
backoff. Escalated after max retries.
SENTINEL: Green (95% confidence)
NEXT ACTION: Contact user to update payment or 
approve alternative
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### User Sees
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We're reviewing your trip

We're having trouble processing your payment.
Our team will reach out shortly.

What you can do:
  • Wait for our team to contact you
  • Update your payment method
  • Contact support if urgent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Message Transformation Rules

| Admin Context | User Message |
|---------------|--------------|
| "PAYMENT_FAILURE: Stripe 402" | "Payment issue" |
| "DISPATCH_FAILURE: Lyft API 503" | "Booking in progress" |
| "VALIDATION_FAILURE: tier_mismatch" | "Service tier adjustment needed" |
| "Retry count: 3, escalated" | "Our team is reviewing" |
| "SENTINEL: Orange (65%)" | (Not shown to user) |
| "State: pending_review" | "Reviewing your trip" |

---

## 📊 Complete Admin Scenarios

### Scenario 1: Failed Payment (Admin Intervention)

```
1. Trip enters failed state
   Failure: PAYMENT_FAILURE
   Reason: Stripe declined card
   
2. Admin queue updates
   Section: NEEDS ACTION
   Priority: 🔴 Critical
   Notification: New failed trip badge
   
3. Admin opens trip card
   Sees: Full failure context, retry history, user info
   SENTINEL: Green (no fraud concerns)
   
4. Admin reviews context
   Decision: Retry with same payment method
   (Card issuer confirmed temporary decline)
   
5. Admin clicks "Retry Manually"
   Confirmation: "Are you sure?"
   Notes: Optional
   
6. System processes retry
   State: failed → submitted
   Audit: Logged with admin ID, timestamp, reason
   User: Not notified (silent retry)
   
7. Retry succeeds
   State: submitted → approved → booked
   User: Notified "Your trip is confirmed"
   Admin: Trip moves to ACTIVE section
```

---

### Scenario 2: Escalated Trip (Complex Request)

```
1. Trip enters escalated state
   Reason: User requested custom pickup location
   
2. Admin queue updates
   Section: NEEDS ACTION
   Priority: 🔴 Critical
   
3. Admin opens trip card
   Sees: User request, trip context, SENTINEL data
   Escalation: Custom location not in system
   
4. Admin contacts user
   Action: "Contact User"
   Notes: "Confirmed custom location via phone"
   Audit: Logged
   
5. Admin resolves escalation
   Action: "Approve Override"
   Notes: "Verified location with dispatch partner"
   Confirmation: Required (override)
   
6. System processes approval
   State: escalated → approved
   Flag: admin_override = true
   Supervisor: Notified for review
   User: "Your trip has been confirmed"
   Audit: Full override record created
```

---

### Scenario 3: Monitoring Approved Trip

```
1. Admin views MONITORING section
   Finds: 8 trips in approved state
   Filters: tier=EXECUTIVE
   Result: 2 executive trips
   
2. Admin clicks on trip
   Sees: Approved 2 hours ago, awaiting execution
   Context: Executive tier, 6 passengers
   SENTINEL: Green
   
3. Admin checks execution eligibility
   System: All checks passed
   Status: Ready for execution
   
4. Admin decides to execute manually
   Reason: Executive client, ensure immediate booking
   Action: "Execute Manually"
   Confirmation: Required
   
5. System executes trip
   State: approved → booked
   Provider: Dispatched to preferred vendor
   User: "Your trip is confirmed"
   Audit: Manual execution logged
```

---

## ✅ Day 9 Completion Checklist

Can you answer these questions?

- ✅ **What does an admin see when something needs attention?**  
  → Check ADMIN_CONTEXT_FIELDS for full context per trip  
  → Check QUEUE_SECTIONS for organizational structure

- ✅ **How do admins know why a trip is blocked or failed?**  
  → failure_type, failure_reason, retry_count, system_notes all visible  
  → SENTINEL context provides additional risk assessment

- ✅ **What actions are available at each moment?**  
  → Check ADMIN_ACTIONS_BY_STATE for allowed actions per state  
  → Check ADMIN_ACTIONS for action definitions

- ✅ **How do we avoid ops chaos as volume grows?**  
  → Prioritized queue (critical → high → medium → low)  
  → Smart sorting (priority → time → retries → age)  
  → Filtering and grouping  
  → Auto-archiving completed trips

---

## 📂 Files Created

1. **[adminSurfaces.js](../src/backend/etas/adminSurfaces.js)** — Complete admin operational framework:
   - `ADMIN_RELEVANT_STATES` — 9 states requiring admin awareness
   - `ADMIN_PRIORITY` — Priority levels (critical/high/medium/low/archive)
   - `STATE_PRIORITY_MAPPING` — Map states to priorities
   - `ADMIN_QUEUE_CONFIG` — Queue ordering, grouping, visibility rules
   - `QUEUE_SECTIONS` — Needs Action, Monitoring, Active, Archive
   - `ADMIN_CONTEXT_FIELDS` — 30+ context fields per trip
   - `ADMIN_ACTIONS_BY_STATE` — Allowed actions per state
   - `ADMIN_ACTIONS` — 15 action definitions
   - `ADMIN_ACTION_OUTCOMES` — Deterministic state changes
   - `AUDIT_REQUIREMENTS` — Required/optional/system audit fields
   - `AUDIT_EVENTS` — 12 audit event types
   - `AUDIT_RETENTION` — Retention policies
   - `MESSAGING_SEPARATION` — Admin vs user visibility rules
   - Helper functions: `getAllowedActionsForState()`, `getAdminContext()`, `getPriorityForState()`, `getActionOutcome()`, `createAuditRecord()`, `filterTripsForQueue()`, `sortTripsForQueue()`, `canAdminPerformAction()`

2. **`DAY_9_ADMIN_SURFACES.md`** — This documentation

---

## 🛡️ What's Protected

### Operational Efficiency
- ✅ Prioritized queue (never guess what's urgent)
- ✅ Clear context (never infer what happened)
- ✅ Explicit actions (never wonder what's allowed)
- ✅ Smart sorting (work on what matters most)

### Accountability
- ✅ Complete audit trail (know who did what, when, why)
- ✅ Required notes on sensitive actions (force reasoning)
- ✅ Confirmation on dangerous actions (prevent accidents)
- ✅ Supervisor review on overrides (oversight built in)

### User Trust
- ✅ Separation of concerns (admins see technical, users see calm)
- ✅ Consistent user messaging (never expose internals)
- ✅ Timely responses (priority-based response times)
- ✅ Professional handling (clear escalation paths)

### Scale Readiness
- ✅ Filtering and grouping (handle high volume)
- ✅ Auto-archiving (prevent clutter)
- ✅ Auto-refresh (stay current)
- ✅ Section-based organization (mental model clarity)

---

## 🔜 Next Steps

**Day 10+**: Build execution logic, provider integrations, and monitoring while using the admin surfaces defined today.

The system now knows:
- What admins see and when
- What actions admins can take
- What happens when admins act
- What gets logged for accountability
- How to separate admin and user contexts

**Key Integration Points**:
- Day 6 roles/permissions → Use for `canAdminPerformAction()`
- Day 7 failure handling → Display in admin context
- Day 8 UX messaging → Transform for admin vs user
- State machine → Map admin actions to state transitions

---

## 📝 Commit Message

```
Define admin operational surfaces and control flows (Sprint Day 9)

- Defined 9 admin-relevant trip states with priorities
- Created admin queue concept with smart sorting and filtering
- Defined 30+ admin context fields per trip (no inferring)
- Mapped allowed actions to each state (15 actions total)
- Defined deterministic outcomes for each admin action
- Created complete audit requirements and retention policies
- Separated admin vs user messaging (security & clarity)
- Implemented helper functions for queue management
```

---

## 📊 ClickUp Update

**Sprint Day 9 complete**: Defined admin visibility, action surfaces, and audit expectations to support safe, efficient trip operations. Admins can now see what's happening, understand why, and act decisively without guessing.
