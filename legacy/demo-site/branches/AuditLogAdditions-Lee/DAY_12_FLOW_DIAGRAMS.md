# DAY 12 — TIER SYSTEM FLOW DIAGRAM

## 🔄 Tier Resolution & Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. TRIP CREATION                                           │
│  User creates trip with basic info                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. TIER RESOLUTION (processTrip.js)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  if (!trip.tier.name || !trip.tier.locked)         │    │
│  │    tier = resolveTierForTrip(context)              │    │
│  │                                                     │    │
│  │  Resolved Tier:                                    │    │
│  │    { name, source, locked: true }                  │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. TIER EVALUATION LOGGING                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  🎯 TIER EVALUATION                                │    │
│  │  Tier: CORPORATE                                   │    │
│  │  Source: user_profile                              │    │
│  │  Locked: true                                      │    │
│  │                                                     │    │
│  │  Capabilities Applied:                             │    │
│  │  • SENTINEL Depth: expanded                        │    │
│  │  • Auto-Execution: ✅ Allowed                       │    │
│  │  • Admin Approval: ❌ Not Required                  │    │
│  │  • Auto-Escalate on Risk: ✅ Yes                    │    │
│  │  • Audit Level: enhanced                           │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SENTINEL EVALUATION (tier-aware)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  depth = getSentinelDepth(trip.tier.name)          │    │
│  │  sentinelLite(trip, {                              │    │
│  │    tier: trip.tier.name,                           │    │
│  │    requestedDepth: depth                           │    │
│  │  })                                                 │    │
│  │                                                     │    │
│  │  BASIC → "lite" depth                              │    │
│  │  CORPORATE → "expanded" depth                      │    │
│  │  EXECUTIVE → "full" depth                          │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. VALIDATION                                              │
│  validateTrip(trip) → check all required fields             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. HUMAN APPROVAL (tier-aware)                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  approveTrip(trip, "APPROVED")                     │    │
│  │                                                     │    │
│  │  Logs:                                             │    │
│  │  [APPROVAL] Tier: CORPORATE                        │    │
│  │  [APPROVAL] SENTINEL Risk: LOW                     │    │
│  │  [APPROVAL] Tier capabilities applied              │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. AUTOMATION ELIGIBILITY (tier-aware)                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  canAutoExecute(trip)                              │    │
│  │                                                     │    │
│  │  Check tier capabilities:                          │    │
│  │  caps = getTierCapabilities(trip.tier.name)        │    │
│  │                                                     │    │
│  │  if (!caps.autoExecutionAllowed)                   │    │
│  │    return { eligible: false }                      │    │
│  │                                                     │    │
│  │  BASIC → Auto-exec allowed                         │    │
│  │  CORPORATE → Auto-exec allowed                     │    │
│  │  EXECUTIVE → Auto-exec BLOCKED                     │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8. EXECUTION PATH DECISION                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  if (automation.eligible)                          │    │
│  │    → AUTO-EXECUTION PATH                           │    │
│  │  else                                               │    │
│  │    → MANUAL EXECUTION PATH                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Tier Decision Points

```
                    ┌──────────────┐
                    │  TRIP TIER   │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐     ┌────▼────┐    ┌────▼────┐
      │  BASIC  │     │CORPORATE│    │EXECUTIVE│
      └────┬────┘     └────┬────┘    └────┬────┘
           │               │               │
           │               │               │
    ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │ SENTINEL    │  │ SENTINEL  │  │ SENTINEL  │
    │ Depth: LITE │  │ Depth:    │  │ Depth:    │
    │             │  │ EXPANDED  │  │ FULL      │
    └──────┬──────┘  └─────┬─────┘  └─────┬─────┘
           │               │               │
    ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │ Admin       │  │ Admin     │  │ Admin     │
    │ Approval:   │  │ Approval: │  │ Approval: │
    │ REQUIRED    │  │ OPTIONAL  │  │ REQUIRED  │
    └──────┬──────┘  └─────┬─────┘  └─────┬─────┘
           │               │               │
    ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │ Auto-Exec:  │  │ Auto-Exec:│  │ Auto-Exec:│
    │ ALLOWED     │  │ ALLOWED   │  │ BLOCKED   │
    │ (if low     │  │ (if low   │  │ (always   │
    │ risk)       │  │ risk)     │  │ manual)   │
    └─────────────┘  └───────────┘  └───────────┘
```

## 🔄 Tier Capability Flow

```
┌─────────────────────────────────────────────────────┐
│  getTierCapabilities(tierName)                      │
│  ↓                                                   │
│  Returns capabilities object:                       │
│  {                                                   │
│    sentinelDepth,                                   │
│    autoExecutionAllowed,                            │
│    requiresAdminApproval,                           │
│    autoEscalateOnRisk,                              │
│    auditLevel                                       │
│  }                                                   │
└───────────────┬─────────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│SENTINEL │ │APPROVAL │ │AUTOMATION│
│uses     │ │uses     │ │uses      │
│depth    │ │approval │ │execution │
│         │ │flag     │ │flag      │
└─────────┘ └─────────┘ └─────────┘
```

## ✅ Key Design Achievements

### No Branching Logic
```
❌ BEFORE (branching):
if (tier === "basic") {
  basicLogic();
} else if (tier === "corporate") {
  corporateLogic();
} else if (tier === "executive") {
  executiveLogic();
}

✅ AFTER (capability-based):
const caps = getTierCapabilities(tier);
if (caps.autoExecutionAllowed) {
  checkEligibility();
}
```

### Single Source of Truth
```
tierDefinitions.js
├─ TIERS (constants)
├─ TIER_CAPABILITIES (rules)
└─ Helper functions
   ├─ getTierCapabilities()
   ├─ resolveTierForTrip()
   ├─ requiresManualApproval()
   ├─ allowsAutoExecution()
   └─ getSentinelDepth()
```

### Integration Points
```
processTrip.js ──────────► Tier Resolution
                          Tier Logging
                          SENTINEL Context
                                │
automationEligibility.js ──────► Tier Capabilities Check
                                │
approveTrip.js ──────────────► Tier-Aware Approval
                          Tier-Aware Escalation
                                │
sentinelLite.js ─────────────► Tier-Aware Intelligence
```

## 📊 Test Results Summary

```
✓ Test 1: Tier Definitions .................... PASS
  ├─ BASIC tier capabilities .................. PASS
  ├─ CORPORATE tier capabilities .............. PASS
  └─ EXECUTIVE tier capabilities .............. PASS

✓ Test 2: Tier Behavior ........................ PASS
  ├─ BASIC → Auto-exec allowed ................ PASS
  ├─ CORPORATE → Auto-exec allowed ............ PASS
  └─ EXECUTIVE → Auto-exec blocked ............ PASS

✓ Test 3: Tier Resolution ...................... PASS
  └─ Defaults to BASIC ........................ PASS

✓ Test 4: Tier Immutability .................... PASS
  └─ Tier remains locked ...................... PASS
```

---

**Status:** ✅ Day 12 Complete  
**Date:** December 30, 2025  
**Next:** Ready for Day 13 or production deployment
