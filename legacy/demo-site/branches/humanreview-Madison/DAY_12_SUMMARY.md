# DAY 12 — TIER-AWARE BEHAVIOR & ESCALATION LOGIC

## 🎯 Overview

Day 12 introduces **tier-aware behavior** to the ETAS system without branching the codebase, duplicating logic, or hard-coding future assumptions. The system now understands user tiers (BASIC, CORPORATE, EXECUTIVE) and applies different approval, automation, and security behaviors based on tier capabilities.

## ✅ What Was Completed

### 1. Tier Definitions (Single Source of Truth)
**File:** `tierDefinitions.js`

Created a formalized tier system with three tiers:
- **BASIC**: Standard consumer tier
- **CORPORATE**: Business account tier  
- **EXECUTIVE**: High-value / protected tier

Each tier is descriptive (not aspirational) to prevent marketing logic from bleeding into execution logic.

### 2. Tier Capability Rules (Permissions, Not Behavior)
**File:** `tierDefinitions.js`

Each tier defines **what it can do**, not **how it does it**:

```javascript
BASIC:
  - sentinelDepth: "lite"
  - autoExecutionAllowed: true
  - requiresAdminApproval: true
  - autoEscalateOnRisk: false
  - auditLevel: "standard"

CORPORATE:
  - sentinelDepth: "expanded"
  - autoExecutionAllowed: true
  - requiresAdminApproval: false
  - autoEscalateOnRisk: true
  - auditLevel: "enhanced"

EXECUTIVE:
  - sentinelDepth: "full"
  - autoExecutionAllowed: false (manual only)
  - requiresAdminApproval: true
  - autoEscalateOnRisk: true
  - auditLevel: "maximum"
```

### 3. Trip Schema Extension
**File:** `tripSchema.v1.js`

Updated trip schema to include comprehensive tier information:

```javascript
tier: {
  name: "",              // "basic" | "corporate" | "executive"
  source: "",            // Where tier was resolved (e.g., "user_profile")
  locked: true,          // Tier cannot change mid-trip
  vehicle_class: ""      // Optional: specific vehicle tier
}
```

**Key Design Decision:** `locked: true` ensures tier is a **fact**, not a suggestion. Once set, tier cannot change during trip lifecycle.

### 4. Integration with Existing Logic (No New Branches)

#### **processTrip.js**
- Resolves tier before validation (tier affects downstream behavior)
- Logs tier evaluation for audit trail
- Passes tier context to SENTINEL with appropriate depth level
- No new code paths - tier is just additional context

#### **automationEligibility.js**
- Updated `canAutoExecute()` to check tier capabilities instead of hard-coded tier names
- Uses `getTierCapabilities()` to determine if auto-execution is allowed
- Maintains backward compatibility with old tier names
- Single decision path - tier is just another rule in the chain

#### **approveTrip.js**
- Logs tier context alongside SENTINEL context for audit trail
- Logs tier capabilities applied during approval
- `assessApprovalUrgency()` now considers tier:
  - Executive tier always requires elevated approval
  - Tier-aware auto-escalation based on `autoEscalateOnRisk` capability

### 5. SENTINEL Integration with Tier Context
**File:** `sentinelLite.js`

Updated SENTINEL to accept tier context:

```javascript
sentinelLite(trip, {
  tier: "basic",
  requestedDepth: "lite"
})
```

SENTINEL now:
- Receives tier and requested depth level
- Logs tier context for transparency
- Includes tier context in evaluation result
- Provides tier-specific guidance (e.g., executive tier recommendations)
- Returns tier context for downstream consumers

**Important:** SENTINEL doesn't need to know about UI or execution details - it just receives context and responds appropriately.

### 6. Tier Resolution Logic
**File:** `tierDefinitions.js` - `resolveTierForTrip()`

- Resolves tier from user profile or context
- Defaults to BASIC tier if unknown (safe fallback)
- Sets `source` field to track where tier came from
- Sets `locked: true` to prevent mid-trip tier changes
- Placeholder for production user profile query

### 7. Comprehensive Logging

Tier-related logging throughout the flow:

**`logTierEvaluation(trip)`** - Called in `processTrip.js`:
```
🎯 TIER EVALUATION
   Tier: CORPORATE
   Source: user_profile
   Locked: true
   
   Capabilities Applied:
   • SENTINEL Depth: expanded
   • Auto-Execution: ✅ Allowed
   • Admin Approval: ❌ Not Required
   • Auto-Escalate on Risk: ✅ Yes
   • Audit Level: enhanced
```

**Approval logging** - Enhanced in `approveTrip.js`:
- Logs tier alongside SENTINEL context
- Logs tier capabilities applied
- Tracks tier in approval urgency assessment

**SENTINEL logging** - Enhanced in `sentinelLite.js`:
- Logs tier and depth for each evaluation
- Includes tier context in results

### 8. Testing & Verification
**File:** `__tests__/runDay12Test.js`

Comprehensive test suite that verifies:
- ✅ All three tiers have proper capabilities defined
- ✅ Each tier behaves according to its capabilities
- ✅ Tier is properly attached to trip objects
- ✅ Tier affects SENTINEL depth
- ✅ Tier influences automation eligibility
- ✅ Tier remains locked after being set
- ✅ Default tier resolution works (defaults to BASIC)
- ✅ No new code branches introduced

## 🎯 Key Design Principles Followed

### 1. **No Branching Logic**
Tier doesn't create `if (tier === "executive")` branches throughout the codebase. Instead:
- Tier defines **capabilities** (permissions)
- Existing logic **queries** those capabilities
- Single execution path with capability-based decisions

### 2. **Descriptive, Not Aspirational**
Tier names describe what they **are**, not what they **could be**:
- ✅ BASIC, CORPORATE, EXECUTIVE (clear, functional)
- ❌ SILVER, GOLD, PLATINUM (aspirational, marketing)

This prevents marketing logic from leaking into execution logic.

### 3. **Tier as a Fact**
Once tier is set on a trip:
- `locked: true` prevents changes
- `source` field tracks provenance
- Tier becomes part of the audit trail

### 4. **Non-Blocking Intelligence**
SENTINEL receives tier context but doesn't **require** it:
- Gracefully handles missing tier
- Tier enhances intelligence, doesn't block it
- SENTINEL remains optional and non-blocking

### 5. **Forward Compatible**
Adding new tiers is trivial:
1. Add new tier constant to `TIERS`
2. Define capabilities in `TIER_CAPABILITIES`
3. No code changes anywhere else

## 📁 Files Created/Modified

### Created:
- `src/backend/etas/tierDefinitions.js` - Tier constants, capabilities, resolution, utilities
- `src/backend/etas/__tests__/runDay12Test.js` - Comprehensive tier behavior verification

### Modified:
- `src/backend/etas/tripSchema.v1.js` - Enhanced tier field with source and locked flag
- `src/backend/etas/processTrip.js` - Tier resolution and SENTINEL integration
- `src/backend/etas/automationEligibility.js` - Tier capability-based automation rules
- `src/backend/etas/approveTrip.js` - Tier-aware approval and escalation logic
- `src/backend/sentinel/sentinelLite.js` - Accept and use tier context

## 🧪 How to Test

Run the Day 12 test suite:

```bash
node src/backend/etas/__tests__/runDay12Test.js
```

This will:
1. Verify all tier definitions and capabilities
2. Test each tier (BASIC, CORPORATE, EXECUTIVE)
3. Verify tier affects SENTINEL depth
4. Verify tier affects automation eligibility
5. Verify tier immutability (locked flag)
6. Verify default tier resolution

## 🎓 Usage Examples

### Example 1: Process a Basic Tier Trip
```javascript
import { processTrip } from './processTrip.js';

const trip = {
  trip_id: "trip-001",
  user_id: "user-123",
  tier: {
    name: "basic",
    source: "user_profile",
    locked: true
  },
  // ... other fields
};

const result = processTrip(trip);
// Tier is resolved, SENTINEL runs with "lite" depth
// Trip requires admin approval
// Auto-execution allowed if eligible
```

### Example 2: Query Tier Capabilities
```javascript
import { getTierCapabilities } from './tierDefinitions.js';

const caps = getTierCapabilities("corporate");
console.log(caps.autoExecutionAllowed);  // true
console.log(caps.requiresAdminApproval); // false
console.log(caps.sentinelDepth);         // "expanded"
```

### Example 3: Check if Tier Requires Manual Approval
```javascript
import { requiresManualApproval } from './tierDefinitions.js';

if (requiresManualApproval(trip.tier.name)) {
  // Force admin review
}
```

## 📊 Tier Capability Matrix

| Capability | BASIC | CORPORATE | EXECUTIVE |
|-----------|-------|-----------|-----------|
| SENTINEL Depth | lite | expanded | full |
| Auto-Execution | ✅ Yes | ✅ Yes | ❌ No |
| Admin Approval | ✅ Required | ❌ Optional | ✅ Required |
| Auto-Escalate on Risk | ❌ No | ✅ Yes | ✅ Yes |
| Audit Level | standard | enhanced | maximum |

## 🔒 Security & Audit Considerations

### Immutability
- Tier is locked once set (`locked: true`)
- Prevents tier manipulation during trip lifecycle
- Ensures consistent behavior throughout trip

### Audit Trail
Every tier evaluation is logged with:
- Tier name
- Source (where tier came from)
- Capabilities applied
- Timestamp
- Integration with SENTINEL and approval logs

### Traceability
Tier decisions are:
- Deterministic (same input = same output)
- Logged (full audit trail)
- Explainable (reason codes provided)
- Reversible (can fall back to manual)

## 🚀 Future Enhancements (Not in Day 12)

### Production Tier Resolution
Currently `resolveTierForTrip()` is a placeholder. In production:
- Query user profile/subscription API
- Cache tier lookups
- Handle tier upgrade scenarios
- Support tier overrides for special cases

### Enhanced SENTINEL Integration
Future SENTINEL versions could:
- Use tier to adjust risk thresholds
- Provide tier-specific risk scoring
- Support tier-specific flag rules

### UI Tier Badges
Minimal UI changes to show tier:
- Optional tier badge in trip card
- Tier-aware status messages:
  - "Additional review required" (executive)
  - "Auto-finalizing" (corporate/basic)
- No new flows or buttons

## ✅ Definition of "Day 12 Complete"

You can confidently say:

> **"The system now understands user tiers and applies different approval, automation, and security behaviors without branching logic or redesign."**

Specifically:
- ✅ Tier definitions formalized (BASIC, CORPORATE, EXECUTIVE)
- ✅ Tier capabilities defined (permissions, not behavior)
- ✅ Tier attached to trip object (source, locked)
- ✅ Tier integrated into all decision points (approval, automation, SENTINEL)
- ✅ Tier passed to SENTINEL with depth control
- ✅ Comprehensive logging for audit trail
- ✅ No new code branches introduced
- ✅ Forward compatible (easy to add new tiers)

## 📚 Related Documentation

- `DAY_11_SUMMARY.md` - Automation eligibility foundation
- `DAY_10_SUMMARY.md` - Manual execution and logging
- `DAY_9_SUMMARY.md` - Human approval system
- `DAY_8_SUMMARY.md` - SENTINEL integration

---

**Day 12 Status:** ✅ **COMPLETE**  
**Date Completed:** December 30, 2025  
**Next Steps:** Day 13 (TBD - potential areas: tier-based pricing, advanced SENTINEL rules, or UI tier indicators)
