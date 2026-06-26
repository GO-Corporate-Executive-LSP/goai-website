# DAY 11 — VISUAL FLOW DIAGRAMS

## 🔄 Complete Automation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TRIP SUBMISSION                              │
│                         State: "review"                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SENTINEL EVALUATION                              │
│                  (Risk assessment: LOW/MEDIUM/HIGH)                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HUMAN APPROVAL                                  │
│                   approveTrip(trip, decision)                        │
│                                                                      │
│  Decision Options:                                                   │
│  ├─ APPROVED      → State: "approved"     ┬─► Continue below       │
│  ├─ NEEDS_ADJUST  → State: "draft"        └─► Back to conversation │
│  └─ ESCALATED     → State: "escalated"    └─► Manual handling      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │   APPROVED ONLY   │
                   └─────────┬─────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                AUTOMATION ELIGIBILITY EVALUATION                     │
│                   evaluateAutomationEligibility()                    │
│                                                                      │
│  Rule Checks:                                          Result:       │
│  ✓ State = "approved"?                      ┌─► eligible: true     │
│  ✓ Approval = "APPROVED"?                   │   reason: "..."      │
│  ✓ Tier ≠ executive_protection?             │   evaluatedAt: "..." │
│  ✓ SENTINEL risk ≠ elevated/high?           │                      │
│  ✓ No SENTINEL flags?                       └─► eligible: false    │
│  ✓ Payment confirmed?                           reason: "..."      │
│  ✓ Not executed?                                evaluatedAt: "..."  │
│  ✓ Not escalated?                                                   │
│                                                                      │
│  Automation data added to trip object                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIP NOW IN "approved" STATE                      │
│                    WITH AUTOMATION METADATA                          │
│                                                                      │
│  trip.automation = {                                                │
│    eligible: true/false,                                            │
│    reason: "LOW_RISK_STANDARD_TIER",                               │
│    evaluatedAt: "2025-12-28T...",                                  │
│    evaluatedBy: "system"                                            │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │  EXECUTION TIME   │
                   └─────────┬─────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXECUTION PATH DECISION                           │
│                    decideExecutionPath(trip)                         │
│                                                                      │
│  Step 1: Check automation data exists                               │
│  ├─ No  → Manual execution required                                │
│  └─ Yes → Continue                                                  │
│                                                                      │
│  Step 2: Check AUTOMATION_ENABLED flag                             │
│  ├─ OFF → Manual execution required                                │
│  └─ ON  → Continue                                                  │
│                                                                      │
│  Step 3: Check trip.automation.eligible                            │
│  ├─ false → Manual execution required                              │
│  └─ true  → Automatic execution possible                           │
└─────────────┬───────────────────────────┬───────────────────────────┘
              │                           │
              ▼                           ▼
    ┌──────────────────┐       ┌──────────────────┐
    │ MANUAL EXECUTION │       │ AUTO EXECUTION   │
    │                  │       │                  │
    │ executeTrip()    │       │ executeAuto...() │
    │                  │       │                  │
    │ executedBy:      │       │ executedBy:      │
    │   "human"        │       │   "system"       │
    └────────┬─────────┘       └────────┬─────────┘
             │                          │
             └──────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   CORE EXECUTION HANDLER      │
        │   (Same logic for both paths) │
        │                               │
        │   • Validate guardrails       │
        │   • Execute action            │
        │   • Log result                │
        │   • Update trip state         │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   TRIP STATE: "executed"      │
        │                               │
        │   execution: {                │
        │     status: "EXECUTED",       │
        │     executedBy: "human/system"│
        │     executedAt: "...",        │
        │     result: "..."             │
        │   }                           │
        └───────────────────────────────┘
```

---

## 🚦 Eligibility Decision Tree

```
                    Trip in "approved" state
                            │
                            ▼
            ┌───────────────────────────┐
            │  Check Approval Status    │
            │  approval.status === ?    │
            └───────────┬───────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
        "APPROVED"              Not "APPROVED"
            │                       │
            ▼                       ▼
    Continue checks          ❌ NOT ELIGIBLE
            │                   "MISSING_APPROVAL"
            ▼
    ┌─────────────────┐
    │  Check Tier     │
    │  tier.name === ?│
    └────────┬────────┘
             │
      ┌──────┴──────────────┐
      │                     │
  Standard/Premium    Executive Protection
      │                     │
      ▼                     ▼
  Continue           ❌ NOT ELIGIBLE
      │              "EXECUTIVE_TIER_MANUAL"
      ▼
  ┌──────────────────────┐
  │  Check SENTINEL Risk │
  │  risk_level === ?    │
  └──────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
   GREEN/LOW    ELEVATED/HIGH
      │             │
      ▼             ▼
  Continue    ❌ NOT ELIGIBLE
      │       "SENTINEL_ELEVATED_RISK"
      ▼
  ┌──────────────────────┐
  │  Check SENTINEL Flags│
  │  (if MEDIUM risk)    │
  └──────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
   No Flags     Has Flags
      │             │
      ▼             ▼
  Continue    ❌ NOT ELIGIBLE
      │       "SENTINEL_FLAGGED_REVIEW"
      ▼
  ┌──────────────────────┐
  │  Check Payment       │
  │  (if field exists)   │
  └──────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
  Confirmed    Not Confirmed
      │             │
      ▼             ▼
  Continue    ❌ NOT ELIGIBLE
      │       "PAYMENT_NOT_CONFIRMED"
      ▼
  ┌──────────────────────┐
  │  Check Executed      │
  │  execution.status=== │
  └──────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
  Not Executed   Executed
      │             │
      ▼             ▼
  Continue    ❌ NOT ELIGIBLE
      │       "ALREADY_EXECUTED"
      ▼
  ┌──────────────────────┐
  │  All Checks Passed   │
  └──────────┬───────────┘
             │
             ▼
      ✅ ELIGIBLE
      "LOW_RISK_STANDARD_TIER"
```

---

## 🔐 Kill-Switch Enforcement

```
                    executeAutomatically(trip)
                            │
                            ▼
            ┌───────────────────────────┐
            │  Check AUTOMATION_ENABLED │
            │  getAutomationConfig()    │
            └───────────┬───────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
        enabled: true           enabled: false
            │                       │
            ▼                       ▼
    Continue checks          ❌ AUTOMATION BLOCKED
            │                   return {
            │                     automationBlocked: true,
            ▼                     reason: "AUTOMATION_DISABLED_GLOBALLY",
    ┌─────────────────┐           requiresManualExecution: true
    │  Check trip     │         }
    │  eligibility    │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      │             │
  eligible: true  eligible: false
      │             │
      ▼             ▼
  ✅ PROCEED   ❌ BLOCKED
  to execution    Manual required
      │
      ▼
  executeTrip(trip, action, "system")
      │
      ▼
  Log automation event
  (auto_execution_triggered)
      │
      ▼
  Return result with
  automatedExecution: true
```

---

## 📊 State Transitions

```
┌─────────┐
│  draft  │  Initial state
└────┬────┘
     │
     ▼
┌─────────┐
│ review  │  Sent for approval
└────┬────┘
     │
     ├─► APPROVED ───────┐
     │                   ▼
     │              ┌──────────┐
     │              │ approved │  Ready for execution
     │              └────┬─────┘
     │                   │
     │                   ├─► Manual execution
     │                   │    └─► ┌──────────┐
     │                   │        │ executed │
     │                   │        └──────────┘
     │                   │
     │                   └─► Auto execution (if eligible + enabled)
     │                        └─► ┌──────────┐
     │                            │ executed │
     │                            └──────────┘
     │
     ├─► NEEDS_ADJUSTMENT
     │   └─► Back to ┌─────────┐
     │               │  draft  │
     │               └─────────┘
     │
     └─► ESCALATED
         └─► ┌───────────┐
             │ escalated │  Manual handling required
             └───────────┘
```

---

## 🎯 Integration Points

```
┌────────────────────────────────────────────────────────────┐
│                      FRONTEND / UI                         │
│                                                            │
│  • Display automation eligibility badge                    │
│  • Show execution options (manual/auto)                   │
│  • Display automation block reasons                       │
│  • Admin toggle for kill-switch (future)                 │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼───────────────────────────────────┐
│                   BACKEND SERVICES                         │
│                                                            │
│  processTrip()         Validates & enriches with SENTINEL  │
│  approveTrip()         Approval + automation evaluation    │
│  decideExecutionPath() Smart execution routing            │
│  executeTrip()         Manual execution                    │
│  executeAutomatically()Auto execution with safety         │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ Reads/Writes
                         │
┌────────────────────────▼───────────────────────────────────┐
│                    DATA LAYER                              │
│                                                            │
│  • Trip objects with automation metadata                   │
│  • Audit logs (automation events)                         │
│  • Configuration (kill-switch state)                      │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Error Handling & Fallbacks

```
                    Execution Request
                            │
                            ▼
            ┌───────────────────────────┐
            │  Try decideExecutionPath()│
            └───────────┬───────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
        Success                  Error/Block
            │                       │
            ▼                       ▼
    ┌─────────────┐        ┌──────────────────┐
    │  Execution  │        │  Graceful Fallback│
    │  Proceeds   │        │                   │
    │             │        │  • Log error      │
    │  Log event  │        │  • Return reason  │
    │  Update trip│        │  • Require manual │
    │  Return     │        │  • Preserve state │
    │  success    │        └──────────────────┘
    └─────────────┘
```

---

## 📈 Monitoring & Observability

```
Every automation decision creates logs:

┌──────────────────────────────────────────────────┐
│  Event: automation_evaluated                     │
│  Trip ID: trip-123                              │
│  Timestamp: 2025-12-28T10:00:00Z                │
│  Eligible: true                                 │
│  Reason: LOW_RISK_STANDARD_TIER                 │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Event: auto_execution_triggered                 │
│  Trip ID: trip-123                              │
│  Timestamp: 2025-12-28T10:05:00Z                │
│  Action: SEND_BOOKING_REQUEST                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Event: auto_execution_blocked                   │
│  Trip ID: trip-456                              │
│  Timestamp: 2025-12-28T10:10:00Z                │
│  Reason: SENTINEL_ELEVATED_RISK                 │
│  Explanation: High traffic alert                │
└──────────────────────────────────────────────────┘

Future: Export to monitoring dashboard
```

---

## 🎨 UI Components (Suggested)

```
Trip Card with Automation Status:
┌─────────────────────────────────────────────┐
│  Trip #12345 - JFK to Manhattan            │
│  Passenger: John Doe                        │
│  Status: Approved                           │
│  ┌─────────────────────────────────────┐   │
│  │ 🤖 Auto-Eligible                    │   │
│  │ Low risk, standard tier             │   │
│  └─────────────────────────────────────┘   │
│  [Execute Trip] [View Details]             │
└─────────────────────────────────────────────┘

Trip Card requiring manual review:
┌─────────────────────────────────────────────┐
│  Trip #12346 - Manhattan to Hamptons       │
│  Passenger: Jane Smith                      │
│  Status: Approved                           │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ Manual Review Required           │   │
│  │ SENTINEL flagged weather alert      │   │
│  └─────────────────────────────────────┘   │
│  [Review & Execute] [View Details]         │
└─────────────────────────────────────────────┘
```

---

These diagrams provide a visual reference for understanding Day 11's automation flow!
