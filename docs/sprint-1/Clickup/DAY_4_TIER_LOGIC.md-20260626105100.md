# DAY_4_TIER_LOGIC.md

# Sprint Day 4 — Tier Logic & Capacity Rules

**Date**: January 3, 2026
**Status**: ✅ Complete
**Deliverable**: Complete tier business logic with capacity constraints, recommendation rules, and enforcement
* * *

## 🎯 Day 4 Goal

**"Make sure the system always recommends, enforces, and understands the correct service tier based on the trip."**

This day answers:

*   ✅ Which tier is allowed for which trip?
*   ✅ When do we recommend vs require a tier?
*   ✅ How does tier choice affect validation and booking readiness?
*   ✅ How do we prevent overbooking or mismatch?
* * *

## 🏗️ Tier Architecture

### Canonical Tier Set (Internal Vocabulary)

```javascript
export const TIERS = {
  BASIC: "basic",
  CORPORATE: "corporate",
  EXECUTIVE: "executive"
};
```

**Important Rule**: Internal names stay stable — display names can change later

### Marketing Names (Examples)

*   `BASIC` → "GO Basic"
*   `CORPORATE` → "GO Bizz"
*   `EXECUTIVE` → "G-Klub"

This prevents renaming chaos in the codebase.
* * *

## 📦 Tier Capacity Constraints

### Operational Guardrails (Not Vehicle Locks)

```javascript
TIER_CAPACITY = {
  BASIC: {
    maxPassengers: 4,
    maxLuggage: 2,
    description: "Standard sedan or equivalent"
  },

  CORPORATE: {
    maxPassengers: 6,
    maxLuggage: 4,
    description: "SUV or premium vehicle"
  },

  EXECUTIVE: {
    maxPassengers: 8,
    maxLuggage: 6,
    description: "Luxury SUV or executive vehicle"
  }
}
```

### Capacity Matrix

| Tier | Max Passengers | Max Luggage | Vehicle Class |
| ---| ---| ---| --- |
| BASIC | 4 | 2 | Standard Sedan |
| CORPORATE | 6 | 4 | SUV/Premium |
| EXECUTIVE | 8 | 6 | Luxury SUV |

These are **guardrails**, not absolute vehicle specifications. They protect operational feasibility.
* * *

## 💡 Tier Recommendation Rules

### `recommendTier(trip)` Function

**CRITICAL**: Recommendation ≠ Requirement

The system suggests optimal tier, but user can choose differently (subject to enforcement rules).

### Rule Priority

1. **Passengers > 6** → EXECUTIVE (required)

```javascript
{
  tier: "executive",
  reason: "PASSENGER_CAPACITY",
  message: "8+ passengers require Executive tier",
  required: true
}
```

2. **Passengers > 4** → CORPORATE (recommended)

```javascript
{
  tier: "corporate",
  reason: "PASSENGER_CAPACITY",
  message: "5-6 passengers work best with Corporate tier",
  required: false
}
```

3. **Luggage > 4** → CORPORATE (recommended)

```javascript
{
  tier: "corporate",
  reason: "LUGGAGE_CAPACITY",
  message: "Heavy luggage requires Corporate or Executive tier",
  required: false
}
```

4. **Passengers + Luggage > 5** → CORPORATE (recommended)

```javascript
{
  tier: "corporate",
  reason: "COMBINED_CAPACITY",
  message: "Combined passenger and luggage count suggests Corporate tier",
  required: false
}
```

5. **Default** → BASIC (acceptable)

```javascript
{
  tier: "basic",
  reason: "STANDARD_TRIP",
  message: "Basic tier is suitable for this trip",
  required: false
}
```

### Future Rules (Placeholders)

*   Late-night trips → recommend CORPORATE
*   Long-distance → recommend EXECUTIVE
*   Airport runs with luggage → recommend CORPORATE
* * *

## 🚨 Tier Enforcement Rules

### Hard Constraints (Validation Fails if Violated)

```javascript
validateTierCapacity(trip) → { valid, errors[] }
```

#### Enforcement Logic

1. **Unknown Tier**

```javascript
{
  type: "INVALID",
  code: "UNKNOWN_TIER",
  message: "Please select a valid service tier."
}
```

2. **Passenger Capacity Exceeded**

```javascript
{
  type: "INVALID",
  code: "TIER_CAPACITY_EXCEEDED",
  message: "The basic tier supports up to 4 passengers.
           Please select a higher tier or reduce passengers."
}
```

3. **Luggage Capacity Exceeded**

```javascript
{
  type: "INVALID",
  code: "LUGGAGE_CAPACITY_EXCEEDED",
  message: "The basic tier supports up to 2 pieces of luggage.
           Please select a higher tier or reduce luggage."
}
```

### Helper Functions

```javascript
// Check if a tier can accommodate requirements
canTierAccommodate(tierName, passengers, luggage)
→ true/false

// Get list of valid tiers for requirements
getValidTiers(passengers, luggage)
→ ["basic", "corporate", "executive"]

// Get capacity info for a tier
getTierCapacity(tierName)
→ { maxPassengers, maxLuggage, description }
```

* * *

## 🔄 Tier → Validation Interaction

### When is Tier Required?

```javascript
isTierRequired(tripState)
```

**Rule**: Tier is optional in `"draft"`, required in `"booking_ready"` and beyond

#### States Requiring Tier

*   ✅ `booking_ready`
*   ✅ `pending_approval`
*   ✅ `approved`
*   ✅ `booked`
*   ✅ `in_progress`
*   ✅ `completed`

#### States Where Tier is Optional

*   ❌ `draft`
*   ❌ `cancelled`

### State-Based Validation

```javascript
validateTierForState(trip)
```

**Examples**:

```javascript
// ✅ Valid: draft without tier
{ state: "draft", tier: null }
→ { valid: true, errors: [] }

// ❌ Invalid: booking_ready without tier
{ state: "booking_ready", tier: null }
→ {
  valid: false,
  errors: [{
    code: "MISSING_TIER",
    message: "A service tier must be selected before booking."
  }]
}

// ❌ Invalid: booking_ready with invalid tier
{ state: "booking_ready", tier: { name: "platinum" } }
→ {
  valid: false,
  errors: [{
    code: "INVALID_TIER",
    message: "Please select a valid service tier."
  }]
}
```

* * *

## 🛡️ Tier → SENTINEL Interaction

### Rule: Tier Gates Intelligence Depth, Not Booking Permission

**SENTINEL NEVER blocks booking** — tier only affects visibility and detail level.

### SENTINEL Depth by Tier

```javascript
getSentinelDepth(tierName)
```

| Tier | Depth | Features |
| ---| ---| --- |
| BASIC | `lite` | Basic risk indicator only |
| CORPORATE | `expanded` | Risk + route analysis + context |
| EXECUTIVE | `full` | Maximum intelligence depth |

### Detailed Configuration

```javascript
getSentinelConfig("basic")
→ {
  depth: "lite",
  features: {
    basicRiskCheck: true,
    routeAnalysis: false,
    historicalPatterns: false,
    predictiveInsights: false,
    realTimeMonitoring: false
  },
  displayLevel: "risk_indicator_only"
}

getSentinelConfig("corporate")
→ {
  depth: "expanded",
  features: {
    basicRiskCheck: true,
    routeAnalysis: true,
    historicalPatterns: false,
    predictiveInsights: false,
    realTimeMonitoring: false
  },
  displayLevel: "risk_plus_context"
}

getSentinelConfig("executive")
→ {
  depth: "full",
  features: {
    basicRiskCheck: true,
    routeAnalysis: true,
    historicalPatterns: true,
    predictiveInsights: true,
    realTimeMonitoring: true
  },
  displayLevel: "full_intelligence_module"
}
```

### SENTINEL UX by Tier

*   **BASIC**: Simple color indicator (green/yellow/orange/red)
*   **CORPORATE**: Color + brief context + route notes
*   **EXECUTIVE**: Full intelligence dashboard with historical data
* * *

## 🧪 Example Flows

### ✅ Successful Flow: BASIC Tier

```javascript
const trip = {
  state: "draft",
  passengers: 2,
  luggage: 1
};

recommendTier(trip)
→ {
  tier: "basic",
  reason: "STANDARD_TRIP",
  required: false
}

validateTierCapacity({ ...trip, tier: { name: "basic" } })
→ { valid: true, errors: [] }
```

### ✅ Successful Flow: CORPORATE Tier

```javascript
const trip = {
  state: "booking_ready",
  passengers: 5,
  luggage: 3,
  tier: { name: "corporate" }
};

recommendTier(trip)
→ {
  tier: "corporate",
  reason: "PASSENGER_CAPACITY",
  message: "5-6 passengers work best with Corporate tier",
  required: false
}

validateTierCapacity(trip)
→ { valid: true, errors: [] }

validateTierForState(trip)
→ { valid: true, errors: [] }
```

### ❌ Enforcement Flow: Capacity Exceeded

```javascript
const trip = {
  state: "booking_ready",
  passengers: 6,
  luggage: 3,
  tier: { name: "basic" }  // Wrong tier!
};

validateTierCapacity(trip)
→ {
  valid: false,
  errors: [{
    type: "INVALID",
    code: "TIER_CAPACITY_EXCEEDED",
    message: "The basic tier supports up to 4 passengers.
             Please select a higher tier or reduce passengers."
  }]
}

// System suggests:
getValidTiers(6, 3)
→ ["corporate", "executive"]
```

### ❌ Validation Flow: Missing Tier

```javascript
const trip = {
  state: "booking_ready",
  passengers: 2,
  luggage: 1
  // No tier selected!
};

validateTierForState(trip)
→ {
  valid: false,
  errors: [{
    type: "INVALID",
    code: "MISSING_TIER",
    message: "A service tier must be selected before booking."
  }]
}
```

* * *

## 📊 Tier Capabilities (Full Matrix)

```javascript
TIER_CAPABILITIES = {
  basic: {
    // Capacity
    maxPassengers: 4,
    maxLuggage: 2,

    // SENTINEL
    sentinelDepth: "lite",

    // Automation
    autoExecutionAllowed: true,
    requiresAdminApproval: true,
    autoEscalateOnRisk: false,

    // Logging
    auditLevel: "standard"
  },

  corporate: {
    // Capacity
    maxPassengers: 6,
    maxLuggage: 4,

    // SENTINEL
    sentinelDepth: "expanded",

    // Automation
    autoExecutionAllowed: true,
    requiresAdminApproval: false,  // Can auto-approve if low risk
    autoEscalateOnRisk: true,

    // Logging
    auditLevel: "enhanced"
  },

  executive: {
    // Capacity
    maxPassengers: 8,
    maxLuggage: 6,

    // SENTINEL
    sentinelDepth: "full",

    // Automation
    autoExecutionAllowed: false,  // Never auto-execute (manual only)
    requiresAdminApproval: true,
    autoEscalateOnRisk: true,

    // Logging
    auditLevel: "maximum"
  }
}
```

* * *

## 🛠️ Implementation: Key Functions

### Created in `tierDefinitions.js`

```javascript
// Recommendation
recommendTier(trip)
→ { tier, reason, message, required }

// Enforcement
validateTierCapacity(trip)
→ { valid, errors[] }

canTierAccommodate(tierName, passengers, luggage)
→ boolean

getValidTiers(passengers, luggage)
→ ["basic", "corporate", ...]

getTierCapacity(tierName)
→ { maxPassengers, maxLuggage, description }

// Validation Interaction
isTierRequired(tripState)
→ boolean

validateTierForState(trip)
→ { valid, errors[] }

// SENTINEL Interaction
getSentinelDepth(tierName)
→ "lite" | "expanded" | "full"

getSentinelConfig(tierName)
→ { depth, features, displayLevel }

// Capabilities
getTierCapabilities(tierName)
→ { maxPassengers, sentinelDepth, ... }

requiresManualApproval(tierName)
→ boolean

allowsAutoExecution(tierName)
→ boolean
```

### Integration with Day 3 Validation

Updated [tripValidation.js](http://../src/backend/etas/tripValidation.js) to:

*   Import tier functions from `tierDefinitions.js`
*   Use `validateTierCapacity()` for capacity checks
*   Use `isTierRequired()` for state-based validation
*   Remove duplicate logic (now centralized in tier module)
* * *

## ✅ Day 4 Completion Checklist

Can you answer these questions?

*   ✅ **Which tier fits this trip?**

→ Use `recommendTier()` for suggestion, `getValidTiers()` for valid options

*   ✅ **When does the system suggest vs block?**

→ Suggests based on capacity/luggage, blocks if enforcement rules violated

*   ✅ **What happens if the user picks the wrong tier?**

→ Validation returns INVALID with clear message, suggests alternatives

*   ✅ **How does tier affect SENTINEL visibility?**

→ Gates intelligence depth (lite/expanded/full), never blocks booking

* * *

## 📂 Files Modified

1. [**tierDefinitions.js**](http://../src/backend/etas/tierDefinitions.js) — Enhanced with:
    *   `TIER_CAPACITY` constants
    *   `recommendTier()` function
    *   `validateTierCapacity()` enforcement
    *   `isTierRequired()` state logic
    *   `getSentinelConfig()` integration
    *   Complete helper function library
2. [**tripValidation.js**](http://../src/backend/etas/tripValidation.js) — Updated to:
    *   Import tier functions
    *   Use centralized tier validation
    *   Remove duplicate logic
3. **`DAY_4_TIER_LOGIC.md`** — This documentation
* * *

## 🚀 What's Protected

### Revenue

*   ✅ Prevents underbooking (wrong tier for requirements)
*   ✅ Enables upsell (recommendations without force)
*   ✅ Protects premium tiers (EXECUTIVE gets manual attention)

### UX

*   ✅ Recommendations, not authoritarian blocking
*   ✅ Clear messaging ("works best with" vs "you must")
*   ✅ Tier mismatch caught before booking frustration

### Operations

*   ✅ No capacity mismatches
*   ✅ No overbooking promises
*   ✅ Vehicle feasibility guaranteed

### Trust

*   ✅ SENTINEL depth scales with tier
*   ✅ Executive clients get maximum intelligence
*   ✅ Basic users don't feel "less safe"
* * *

## 🔜 Next Steps

**Day 5**: Human-in-the-Loop & Admin Override Logic

Where:

*   Manual review enters the system
*   Safety nets are formalized
*   Trust > automation
* * *

## 📝 Commit Message

```diff
Define tier capacity, recommendation, and enforcement rules (Sprint Day 4)

- Added TIER_CAPACITY constraints (passengers, luggage)
- Implemented recommendTier() with suggestion vs requirement logic
- Created validateTierCapacity() enforcement with clear errors
- Defined tier-state interaction (optional in draft, required in booking_ready)
- Integrated tier-SENTINEL depth gating (lite/expanded/full)
- Updated tripValidation.js to use centralized tier logic
- Created comprehensive helper function library
```

* * *

## 📊 ClickUp Update

**Sprint Day 4 complete**: Formalized tier capabilities, recommendation logic, and validation rules to ensure correct service selection and prevent capacity mismatches. System now recommends optimal tiers without being authoritarian, enforces hard capacity constraints, and gates SENTINEL intelligence depth by tier level. Revenue, UX, and operational feasibility protected.