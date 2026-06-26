# ETAS V1 - DAY 15: SENTINEL LITE FINALIZATION & ENRICHMENT CONTRACT

**Created:** January 31, 2026  
**Status:** ✅ LOCKED - Single Source of Truth  
**Purpose:** Define what SENTINEL does in V1, what it returns, and how it integrates (non-blocking)

---

## 🎯 DAY 15 GOAL

**By the end of today, everyone should clearly understand:**

> "What SENTINEL does in V1, what data it returns, what it does not do, and how it plugs into the trip lifecycle without blocking anything."

This day is about **clarity and constraint, not expansion.**

---

## 🔒 TASK 1: SENTINEL LITE V1 FIELD DEFINITIONS (LOCKED)

### Authoritative V1 Enrichment Contract

**SENTINEL Lite returns these fields and ONLY these fields in V1:**

```javascript
// SENTINEL enrichment object structure
sentinel_snapshot: {
  // PRIMARY METRIC - Risk assessment
  risk_score: 25,                      // Number (0-100 scale)
  risk_level: "LOW",                   // String: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  
  // CONTEXT - Why this risk level
  flags: [],                           // Array of flag objects (see below)
  context_summary: "Standard trip profile, no anomalies detected",
  
  // METADATA - Enrichment source quality
  source: "lite",                      // String: "lite" | "partial" | "unavailable"
  timestamp: "2026-01-31T10:00:00Z",   // ISO 8601 timestamp
  version: "1.0.0"                     // SENTINEL version used
}
```

### Field Definitions

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `risk_score` | Number | ✅ Yes | Numeric risk score on 0-100 scale | `0` (no risk) to `100` (critical risk) |
| `risk_level` | String | ✅ Yes | Human-readable risk category | `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"CRITICAL"` |
| `flags` | Array | ✅ Yes | Risk factors detected (empty if none) | Array of flag objects (see below) |
| `context_summary` | String | ✅ Yes | Short explanatory text for admins | Max 200 chars, human-readable |
| `source` | String | ✅ Yes | Data quality indicator | `"lite"`, `"partial"`, `"unavailable"` |
| `timestamp` | String | ✅ Yes | When assessment was performed | ISO 8601 format |
| `version` | String | ✅ Yes | SENTINEL version identifier | Semantic version (e.g., `"1.0.0"`) |

### Risk Score to Risk Level Mapping

**V1 Standard Thresholds:**

```javascript
function getRiskLevel(risk_score) {
  if (risk_score >= 75) return "CRITICAL";
  if (risk_score >= 50) return "HIGH";
  if (risk_score >= 25) return "MEDIUM";
  return "LOW";
}
```

| Risk Score | Risk Level | Admin Action Required |
|------------|------------|----------------------|
| 0-24 | LOW | ❌ No (auto-approval eligible) |
| 25-49 | MEDIUM | ⚠️ Optional (monitoring) |
| 50-74 | HIGH | ✅ Yes (manual approval required) |
| 75-100 | CRITICAL | 🚨 Yes (immediate escalation) |

### Flag Object Structure

When SENTINEL detects specific risk factors, it returns flag objects:

```javascript
{
  flag: "unusual_route",               // Flag identifier (snake_case)
  severity: "MEDIUM",                  // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  explanation: "Route deviates from typical pattern for this user",
  context: {                           // Optional additional context
    baseline_distance: 15.2,
    actual_distance: 42.7,
    deviation_percent: 181
  }
}
```

**V1 Flag Types (Exhaustive List):**

| Flag ID | Description | Typical Severity |
|---------|-------------|------------------|
| `unusual_route` | Route differs significantly from user's history | MEDIUM |
| `unusual_time` | Pickup time is atypical (e.g., 3 AM) | LOW-MEDIUM |
| `high_value_destination` | Destination is high-value location (airport VIP, etc.) | LOW |
| `new_user` | User has limited trip history | LOW |
| `unusual_passenger_count` | Passenger count exceeds typical | LOW |
| `executive_tier_first_trip` | First trip on executive tier | MEDIUM |
| `payment_history_concern` | User has payment failure history | HIGH |
| `multiple_bookings_short_time` | Multiple trips requested in short period | MEDIUM |

### Source Quality Indicators

| Source Value | Meaning | Impact on Confidence |
|--------------|---------|---------------------|
| `lite` | Full SENTINEL Lite assessment completed | ✅ High confidence |
| `partial` | SENTINEL ran but with limited data | ⚠️ Medium confidence |
| `unavailable` | SENTINEL could not assess (timeout, error) | ❌ Low confidence (default to manual review) |

---

## 🔍 TASK 2: RISK VS CONFIDENCE (V1 DECISION - LOCKED)

### The Question

> "Should SENTINEL return both `risk_score` and `confidence_score`, or just one metric?"

### V1 Decision: ✅ **Risk Score Only, Confidence is Implicit**

**Rationale:**

1. **Simplicity**: Admins interpret risk, not model certainty
2. **Implicit Confidence**: The `source` field indicates data quality
3. **Avoid Confusion**: Two scores could contradict or confuse decision-making
4. **Future-Proof**: Confidence can be added later without breaking V1

### How Confidence is Represented in V1

```javascript
// Confidence is implicit in the source field
{
  risk_score: 65,
  risk_level: "HIGH",
  source: "lite",        // ← High confidence: full assessment
  // ...
}

{
  risk_score: 40,
  risk_level: "MEDIUM",
  source: "partial",     // ← Medium confidence: limited data
  // ...
}

{
  risk_score: 0,
  risk_level: "LOW",
  source: "unavailable", // ← No confidence: default to safe
  // ...
}
```

### Decision Logic

```javascript
// Admin decision logic considers both risk and source
function requiresManualReview(sentinel_snapshot) {
  // HIGH or CRITICAL risk always requires review
  if (sentinel_snapshot.risk_level === "HIGH" || 
      sentinel_snapshot.risk_level === "CRITICAL") {
    return true;
  }
  
  // If SENTINEL couldn't assess, default to manual review
  if (sentinel_snapshot.source === "unavailable") {
    return true;
  }
  
  // MEDIUM risk with partial data → manual review
  if (sentinel_snapshot.risk_level === "MEDIUM" && 
      sentinel_snapshot.source === "partial") {
    return true;
  }
  
  // Otherwise, auto-approval eligible
  return false;
}
```

### V2 Consideration (Not for V1)

If confidence becomes necessary in future:

```javascript
// Possible V2 addition (DO NOT implement in V1)
sentinel_snapshot: {
  risk_score: 65,
  risk_level: "HIGH",
  confidence_score: 0.85,  // ← Could be added later
  source: "expanded",
  // ...
}
```

**V1 Commitment:** No `confidence_score` field. Use `source` for quality indication.

---

## 🔄 TASK 3: SENTINEL'S POSITION IN THE LIFECYCLE (NON-BLOCKING)

### Core Principle

> **SENTINEL enrichment may enhance a trip, but may never block it.**

### When SENTINEL is Called

```javascript
// From processTrip.js flow
async function processTrip(trip) {
  // 1. Validate trip
  const validation = validateTrip(trip);
  if (!validation.valid) {
    return { status: "invalid", errors: validation.errors };
  }
  
  // 2. Call SENTINEL asynchronously (non-blocking)
  let sentinelResult = null;
  try {
    sentinelResult = await sentinelLite(trip, { 
      tier: trip.tier.name,
      requestedDepth: "lite" 
    });
  } catch (error) {
    console.warn("[SENTINEL] Assessment failed, continuing without enrichment:", error);
    sentinelResult = null; // Continue without SENTINEL
  }
  
  // 3. Attach SENTINEL snapshot to trip (if available)
  if (sentinelResult) {
    trip.sentinel_snapshot = {
      risk_score: sentinelResult.risk_score || 0,
      risk_level: sentinelResult.risk_level || "LOW",
      flags: sentinelResult.flags || [],
      context_summary: sentinelResult.context_summary || "Assessment completed",
      source: sentinelResult.source || "lite",
      timestamp: sentinelResult.timestamp || new Date().toISOString(),
      version: sentinelResult.version || "1.0.0"
    };
  } else {
    // SENTINEL unavailable: use safe defaults
    trip.sentinel_snapshot = {
      risk_score: 0,
      risk_level: "LOW",
      flags: [],
      context_summary: "SENTINEL assessment unavailable",
      source: "unavailable",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };
  }
  
  // 4. Continue with approval logic (uses SENTINEL data if available)
  const approvalNeeded = requiresManualApproval(trip);
  // ...
}
```

### SENTINEL Failure Scenarios

| Scenario | System Behavior | User Impact |
|----------|----------------|-------------|
| **SENTINEL responds normally** | Enrichment attached to trip | Full context available to admins |
| **SENTINEL responds late (>5s timeout)** | Continue without enrichment, use defaults | Trip proceeds, admin sees `source: "unavailable"` |
| **SENTINEL responds with partial data** | Attach partial enrichment | Trip proceeds, admin sees `source: "partial"` |
| **SENTINEL throws error** | Log error, continue with defaults | Trip proceeds, admin sees `source: "unavailable"` |
| **SENTINEL service down** | Skip enrichment entirely | Trip proceeds, auto-fallback to manual review |

### Non-Blocking Guarantees

```javascript
// ✅ CORRECT: SENTINEL is optional enrichment
try {
  const enrichment = await sentinelLite(trip);
  trip.sentinel_snapshot = enrichment;
} catch (error) {
  console.warn("SENTINEL unavailable, continuing");
  trip.sentinel_snapshot = { source: "unavailable", risk_level: "LOW", risk_score: 0 };
}
// Trip processing continues regardless

// ❌ WRONG: Never make SENTINEL required
const enrichment = await sentinelLite(trip);
if (!enrichment) {
  throw new Error("SENTINEL required"); // ← NEVER DO THIS
}
```

### SENTINEL Invocation Rules (V1)

1. **Async Call**: SENTINEL is called asynchronously after validation
2. **Timeout**: 5-second timeout (configurable)
3. **Retry**: No retries in V1 (fail fast)
4. **Default**: If SENTINEL unavailable, use safe defaults (`risk_level: "LOW"`, `source: "unavailable"`)
5. **Logging**: All SENTINEL calls logged to audit trail
6. **Audit Event**: SENTINEL assessment completion logged as `SYSTEM_ACTION` event

### Lifecycle State Transitions

```
[draft] 
  → (user submits) → 
[submitted]
  → (validation) → 
[validated]
  → (SENTINEL assessment - ASYNC, NON-BLOCKING) →
      ↓
      If SENTINEL unavailable: Continue with source="unavailable"
      If SENTINEL returns HIGH/CRITICAL: Require manual approval
      If SENTINEL returns LOW/MEDIUM: Check other criteria
  → (approval decision) →
  
  [pending_approval] (if manual review required)
    OR
  [approved] (if auto-approval eligible)
```

---

## 👁️ TASK 4: SENTINEL FIELDS IN ADMIN & AUDIT SURFACES

### Admin Queue View

**What Admins See in Queue List:**

```javascript
// Admin queue entry - SENTINEL summary
{
  tripId: "trip_001",
  priority: "high",
  
  // SENTINEL summary for quick triage
  sentinel_summary: {
    risk_level: "HIGH",          // ← Color-coded badge in UI
    risk_score: 65,              // ← Numeric indicator
    flag_count: 2,               // ← Number of flags
    source: "lite"               // ← Data quality indicator
  },
  
  // Other queue fields...
  state: { current_state: "pending_approval" },
  trip_summary: { pickup_address: "...", dropoff_address: "..." }
}
```

**Admin Queue UI Recommendations:**

| Field | Display Style | Purpose |
|-------|--------------|---------|
| `risk_level` | Color-coded badge (🟢 LOW, 🟡 MEDIUM, 🟠 HIGH, 🔴 CRITICAL) | Quick visual triage |
| `risk_score` | Number badge (e.g., "65") | Precise risk quantification |
| `flag_count` | Icon + count (🚩 2) | Indicates specific concerns |
| `source` | Small text label ("lite" / "partial" / "unavailable") | Data quality awareness |

### Admin Detail View

**What Admins See in Trip Detail:**

```javascript
// Full SENTINEL snapshot visible in admin detail page
{
  trip_id: "trip_001",
  state: { current_state: "pending_approval" },
  
  // SENTINEL PANEL - Full enrichment data
  sentinel_snapshot: {
    risk_score: 65,
    risk_level: "HIGH",
    
    // Flags section (expandable)
    flags: [
      {
        flag: "unusual_route",
        severity: "MEDIUM",
        explanation: "Route deviates from typical pattern for this user",
        context: {
          baseline_distance: 15.2,
          actual_distance: 42.7,
          deviation_percent: 181
        }
      },
      {
        flag: "unusual_time",
        severity: "HIGH",
        explanation: "Pickup time is 2:30 AM",
        context: {
          pickup_hour: 2,
          typical_hours: [8, 9, 17, 18]
        }
      }
    ],
    
    // Context summary
    context_summary: "High risk due to unusual route and late-night pickup",
    
    // Metadata
    source: "lite",
    timestamp: "2026-01-31T10:00:00Z",
    version: "1.0.0"
  },
  
  // Other trip fields...
}
```

### Audit Log

**SENTINEL events logged:**

```javascript
// Event: SENTINEL assessment completed
{
  auditId: "audit_001",
  tripId: "trip_001",
  timestamp: "2026-01-31T10:00:00Z",
  fromState: "validated",
  toState: "validated", // SENTINEL doesn't change state
  
  event: {
    event_type: "SENTINEL_ASSESSMENT_COMPLETED",
    event_category: "SYSTEM_ACTION",
    outcome: "SUCCESS"
  },
  
  actor: {
    actor_id: "SYSTEM",
    actor_role: "SYSTEM",
    actor_email: null,
    ipAddress: ""
  },
  
  // SENTINEL result in adminContext
  adminContext: {
    notes: "SENTINEL Lite assessment completed",
    environment: "production",
    version: "1.0.0",
    
    // SENTINEL-specific context
    sentinel_result: {
      risk_score: 65,
      risk_level: "HIGH",
      flags: ["unusual_route", "unusual_time"],
      source: "lite"
    }
  }
}

// Event: SENTINEL assessment failed
{
  auditId: "audit_002",
  tripId: "trip_002",
  timestamp: "2026-01-31T10:05:00Z",
  fromState: "validated",
  toState: "validated",
  
  event: {
    event_type: "SENTINEL_ASSESSMENT_FAILED",
    event_category: "SYSTEM_ACTION",
    outcome: "FAILURE"
  },
  
  actor: {
    actor_id: "SYSTEM",
    actor_role: "SYSTEM",
    actor_email: null,
    ipAddress: ""
  },
  
  adminContext: {
    notes: "SENTINEL assessment failed: timeout after 5s",
    environment: "production",
    version: "1.0.0",
    sentinel_result: {
      risk_score: 0,
      risk_level: "LOW",
      flags: [],
      source: "unavailable"
    }
  }
}
```

### Field Visibility Matrix

| Field | Admin Queue | Admin Detail | Audit Log | User View (V1) |
|-------|-------------|--------------|-----------|----------------|
| `risk_score` | ✅ Summary | ✅ Full | ✅ Logged | ❌ Hidden |
| `risk_level` | ✅ Badge | ✅ Full | ✅ Logged | ❌ Hidden |
| `flags` | ⚠️ Count only | ✅ Full details | ⚠️ Flag IDs only | ❌ Hidden |
| `context_summary` | ❌ Not shown | ✅ Full | ⚠️ Truncated | ❌ Hidden |
| `source` | ✅ Label | ✅ Full | ✅ Logged | ❌ Hidden |
| `timestamp` | ❌ Not shown | ✅ Full | ✅ Logged | ❌ Hidden |
| `version` | ❌ Not shown | ✅ Full | ✅ Logged | ❌ Hidden |

**V1 User Policy:** Users do NOT see SENTINEL data. It is admin-only context for decision-making.

---

## 🔒 TASK 5: ALIGNMENT CHECK WITH LEE

### Message Template for Lee

```
Hey Lee,

Day 15 SENTINEL contract finalized. Need your green-light on schema updates:

✅ FINAL FIELD NAMES (LOCKED):
- risk_score (0-100 number)
- risk_level ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
- flags (array of flag objects)
- context_summary (string, max 200 chars)
- source ("lite" | "partial" | "unavailable")
- timestamp (ISO 8601)
- version (semantic version)

✅ CONFIDENCE DECISION:
- NO separate confidence_score field in V1
- Confidence is implicit in "source" field
- Can add confidence_score in V2 if needed

✅ NON-BLOCKING GUARANTEE:
- SENTINEL timeout: 5 seconds
- If SENTINEL fails: continue with source="unavailable"
- Trip never blocked by SENTINEL unavailability

📋 ACTION NEEDED:
1. Update tripDatabase.js sentinel_snapshot schema
2. Update adminSurfaces.js to display risk_level badge
3. Add SENTINEL audit events to eventTypes.js:
   - SENTINEL_ASSESSMENT_COMPLETED
   - SENTINEL_ASSESSMENT_FAILED

👍 Ready to proceed? Let me know if any concerns.

Doc: docs/DAY_15_SENTINEL_LITE_CONTRACT.md
```

### Schema Updates Required

**File: `src/backend/etas/tripSchema.v1.js`**

```javascript
// UPDATE THIS:
sentinel_snapshot: {
  risk_score: 0,
  flag: "green",
  guidance: "",
  evaluated_at: ""
}

// TO THIS:
sentinel_snapshot: {
  risk_score: 0,                // 0-100
  risk_level: "LOW",            // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  flags: [],                    // Array of flag objects
  context_summary: "",          // Max 200 chars
  source: "lite",               // "lite" | "partial" | "unavailable"
  timestamp: "",                // ISO 8601
  version: "1.0.0"              // SENTINEL version
}
```

**File: `src/backend/etas/eventTypes.js`**

```javascript
// ADD THESE EVENTS:
SYSTEM_ACTION: {
  // ... existing events ...
  SENTINEL_ASSESSMENT_STARTED: "SENTINEL_ASSESSMENT_STARTED",
  SENTINEL_ASSESSMENT_COMPLETED: "SENTINEL_ASSESSMENT_COMPLETED",
  SENTINEL_ASSESSMENT_FAILED: "SENTINEL_ASSESSMENT_FAILED",
}
```

**File: `src/backend/sentinel/sentinelLite.js`**

```javascript
// UPDATE RETURN OBJECT:
return {
  risk_score: calculateRiskScore(trip),  // 0-100
  risk_level: getRiskLevel(risk_score),  // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  flags: detectFlags(trip),               // Array of flag objects
  context_summary: generateSummary(flags),// Max 200 chars
  source: "lite",                         // Always "lite" for sentinelLite
  timestamp: new Date().toISOString(),
  version: "1.0.0"
};
```

---

## 🛑 WHAT SENTINEL DOES NOT DO IN V1

### Explicit Non-Features

❌ **SENTINEL does NOT:**

1. **Make decisions** - It provides context, not commands
2. **Block trips** - Trips proceed even if SENTINEL unavailable
3. **Approve or reject** - Only humans/automation logic do that
4. **Modify trip data** - Read-only assessment
5. **Store historical data** - Stateless evaluation (snapshot only)
6. **Learn from outcomes** - No machine learning in V1
7. **Predict user behavior** - No predictive modeling
8. **Score drivers/vehicles** - Trip-level assessment only
9. **Access external APIs** - Self-contained logic in V1
10. **Require user consent** - Backend-only enrichment

### What SENTINEL IS

✅ **SENTINEL is:**

- **Enrichment layer** - Adds context to help decision-making
- **Non-blocking** - Never prevents trip progression
- **Stateless** - Each assessment is independent
- **Deterministic** - Same input = same output (V1)
- **Lightweight** - Fast, simple heuristics only
- **Optional** - System works without it
- **Admin-facing** - Context for human decision-makers
- **Auditable** - All assessments logged

---

## 📊 EXAMPLE SCENARIOS

### Scenario 1: Normal Trip (Auto-Approval)

**Input Trip:**
- Pickup: 2:00 PM, standard route
- User: Established, no payment issues
- Tier: Basic

**SENTINEL Output:**
```javascript
sentinel_snapshot: {
  risk_score: 10,
  risk_level: "LOW",
  flags: [],
  context_summary: "Standard trip profile, no anomalies detected",
  source: "lite",
  timestamp: "2026-01-31T14:00:00Z",
  version: "1.0.0"
}
```

**System Decision:** ✅ Auto-approve (no manual review required)

---

### Scenario 2: High-Risk Trip (Manual Review)

**Input Trip:**
- Pickup: 2:30 AM, unusual route
- User: New user, executive tier
- Tier: Executive

**SENTINEL Output:**
```javascript
sentinel_snapshot: {
  risk_score: 68,
  risk_level: "HIGH",
  flags: [
    {
      flag: "unusual_time",
      severity: "HIGH",
      explanation: "Pickup time is 2:30 AM"
    },
    {
      flag: "unusual_route",
      severity: "MEDIUM",
      explanation: "Route not in user's typical pattern"
    },
    {
      flag: "executive_tier_first_trip",
      severity: "MEDIUM",
      explanation: "First trip on executive tier"
    }
  ],
  context_summary: "High risk: late-night pickup, unusual route, new executive customer",
  source: "lite",
  timestamp: "2026-01-31T02:30:00Z",
  version: "1.0.0"
}
```

**System Decision:** 🚨 Manual approval required (added to admin queue)

---

### Scenario 3: SENTINEL Unavailable (Safe Default)

**Input Trip:**
- Pickup: 10:00 AM, standard route
- User: Established
- Tier: Corporate

**SENTINEL Output:** (timeout after 5 seconds)
```javascript
sentinel_snapshot: {
  risk_score: 0,
  risk_level: "LOW",
  flags: [],
  context_summary: "SENTINEL assessment unavailable",
  source: "unavailable",
  timestamp: "2026-01-31T10:00:00Z",
  version: "1.0.0"
}
```

**System Decision:** ⚠️ Default to manual review (safe default when SENTINEL unavailable)

---

## ✅ END-OF-DAY "DONE" DEFINITION

**You are done when:**

1. ✅ **SENTINEL fields are unambiguous** - 7 fields defined, types locked, no ambiguity
2. ✅ **Lee can safely align DB + APIs** - Schema update requirements documented
3. ✅ **WAI can render context cards without guessing** - Field visibility matrix complete
4. ✅ **SENTINEL cannot be mistaken for an approval system** - Non-blocking guarantees explicit

**Day 15 Status:** ✅ **COMPLETE - CONTRACT LOCKED**

---

## 📚 RELATED DOCUMENTATION

- [sentinelLite.js](../src/backend/etas/sentinelLite.js) - Current V1 implementation (needs update)
- [tripSchema.v1.js](../src/backend/etas/tripSchema.v1.js) - Trip schema (needs sentinel_snapshot update)
- [eventTypes.js](../src/backend/etas/eventTypes.js) - Audit event types (needs SENTINEL events)
- [DAY_14_GOVERNANCE_ALIGNED.md](DAY_14_GOVERNANCE_ALIGNED.md) - Admin decision framework
- [DAY_8_SUMMARY.md](DAY_8_SUMMARY.md) - Original SENTINEL Lite design

---

## 🔐 SCHEMA LOCK COMMITMENT

**This document is the authoritative source for:**
- SENTINEL field names
- SENTINEL field types
- SENTINEL integration rules
- SENTINEL non-blocking guarantees

**Any changes to SENTINEL schema require:**
1. Update to this document
2. Team alignment meeting
3. Explicit version increment
4. Migration plan for existing data

---

**Day 15 Complete:** January 31, 2026  
**Next Steps:** Lee implements schema updates, WAI designs SENTINEL context UI

