# DAY 12 — QUICK REFERENCE

## 🎯 Tier System at a Glance

### Three Tiers
```javascript
BASIC      → Consumer tier (standard service)
CORPORATE  → Business tier (enhanced service)
EXECUTIVE  → Protected tier (maximum oversight)
```

### Import Tier Functions
```javascript
import { 
  TIERS, 
  getTierCapabilities, 
  resolveTierForTrip,
  requiresManualApproval,
  allowsAutoExecution,
  getSentinelDepth 
} from './tierDefinitions.js';
```

## 📋 Common Usage Patterns

### Check if Auto-Execution is Allowed
```javascript
const caps = getTierCapabilities(trip.tier.name);
if (caps.autoExecutionAllowed) {
  // Proceed with automation check
}
```

### Check if Admin Approval Required
```javascript
if (requiresManualApproval(trip.tier.name)) {
  // Force admin review
}
```

### Get SENTINEL Depth for Tier
```javascript
const depth = getSentinelDepth(trip.tier.name);
// Returns: "lite" | "expanded" | "full"
```

### Resolve Tier for New Trip
```javascript
const tier = resolveTierForTrip({
  user_id: trip.user_id,
  tier: trip.tier
});
// Returns: { name, source, locked }
```

## 🔍 Tier Capabilities Quick Lookup

| Check | BASIC | CORPORATE | EXECUTIVE |
|-------|-------|-----------|-----------|
| SENTINEL Depth | lite | expanded | full |
| Auto-Execute? | ✅ | ✅ | ❌ |
| Admin Approval? | ✅ | ❌ | ✅ |
| Auto-Escalate? | ❌ | ✅ | ✅ |
| Audit Level | standard | enhanced | maximum |

## 🧪 Testing

### Run Day 12 Tests
```bash
node src/backend/etas/__tests__/runDay12Test.js
```

### Run All Tests (Days 10-12)
```bash
node src/backend/etas/__tests__/testAllScenarios.js
```

## 📝 Tier Field Structure

```javascript
tier: {
  name: "basic" | "corporate" | "executive",
  source: "user_profile" | "manual" | "api",
  locked: true,  // Always true - tier cannot change
  vehicle_class: "sedan" | "suv" | "luxury"  // Optional
}
```

## 🔒 Key Rules

1. **Tier is immutable** - Once set, `locked: true` prevents changes
2. **Tier is a fact** - Not a suggestion, not negotiable
3. **No branching** - Tier defines capabilities, not code paths
4. **Default to BASIC** - Unknown tiers fall back to BASIC tier
5. **Log everything** - Tier decisions are fully auditable

## 📊 Integration Points

### processTrip.js
- Resolves tier if not set
- Logs tier evaluation
- Passes tier to SENTINEL

### automationEligibility.js
- Checks `autoExecutionAllowed` capability
- Blocks executive tier from auto-execution

### approveTrip.js
- Logs tier with approval
- Uses tier for escalation decisions
- Tracks tier in urgency assessment

### sentinelLite.js
- Receives tier and depth context
- Adjusts evaluation based on tier
- Returns tier context in results

## 🚨 Common Pitfalls to Avoid

❌ **Don't** hard-code tier names in logic:
```javascript
// BAD
if (tier === "executive") { ... }
```

✅ **Do** use capability functions:
```javascript
// GOOD
if (!allowsAutoExecution(tier)) { ... }
```

❌ **Don't** create tier-specific code paths:
```javascript
// BAD
if (tier === "basic") {
  basicLogic();
} else if (tier === "corporate") {
  corporateLogic();
}
```

✅ **Do** use tier capabilities:
```javascript
// GOOD
const caps = getTierCapabilities(tier);
if (caps.requiresAdminApproval) {
  forceApproval();
}
```

## 📚 Related Files

- `tierDefinitions.js` - Tier constants and capabilities
- `tripSchema.v1.js` - Trip object structure
- `processTrip.js` - Tier resolution
- `automationEligibility.js` - Tier-aware automation
- `approveTrip.js` - Tier-aware approval
- `sentinelLite.js` - Tier-aware intelligence

---

**Quick Start:** Import `tierDefinitions.js` and use `getTierCapabilities(tierName)` to access tier rules.
