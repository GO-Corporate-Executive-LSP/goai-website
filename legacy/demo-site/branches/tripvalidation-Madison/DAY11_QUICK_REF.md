# DAY 11 — QUICK REFERENCE

## 🚀 Quick Start

### Check Current Configuration
```javascript
import { logAutomationStatus } from './automationConfig.js';
logAutomationStatus();
```

### Approve a Trip (Automatically Evaluates Automation)
```javascript
import { approveTrip } from './approveTrip.js';

const result = approveTrip(trip, "APPROVED", "Looks good");
console.log(result.trip.automation);
// Output:
// {
//   eligible: true/false,
//   reason: "LOW_RISK_STANDARD_TIER",
//   evaluatedAt: "2025-12-28T...",
//   evaluatedBy: "system"
// }
```

### Execute a Trip (Smart Path Decision)
```javascript
import { decideExecutionPath } from './executeTrip.js';

const result = decideExecutionPath(trip);
// Automatically chooses manual or auto based on:
// - Kill-switch state
// - Trip eligibility
// - System configuration
```

### Manual Execution (Always Available)
```javascript
import { executeTrip } from './executeTrip.js';

const result = executeTrip(trip, "SEND_BOOKING_REQUEST", "human");
```

### Automatic Execution (When Enabled)
```javascript
import { executeAutomatically } from './executeTrip.js';

const result = executeAutomatically(trip);
// Will check kill-switch and eligibility
```

---

## 🎛️ Toggle Automation

### Enable Automation
Edit [automationConfig.js](automationConfig.js):
```javascript
export const AUTOMATION_ENABLED = true; // Change to true
```

### Disable Automation (Kill-Switch)
Edit [automationConfig.js](automationConfig.js):
```javascript
export const AUTOMATION_ENABLED = false; // Change to false
```

**No restart required!** Next execution will respect the new setting.

---

## 🔍 Check Eligibility Manually

```javascript
import { canAutoExecute } from './automationEligibility.js';

const result = canAutoExecute(trip);
console.log(result);
// Output:
// {
//   eligible: true,
//   reason: "LOW_RISK_STANDARD_TIER",
//   explanation: "Trip meets all criteria for automated execution"
// }
```

---

## 📋 Eligibility Checklist

A trip is eligible for automation when **ALL** of these are true:

- ✅ State = `approved`
- ✅ Approval status = `APPROVED`
- ✅ Tier ≠ `executive_protection`
- ✅ SENTINEL risk ≠ `elevated` or `high`
- ✅ No SENTINEL flags (if medium risk)
- ✅ Payment status = `confirmed` (if present)
- ✅ Not already executed
- ✅ Not escalated

**Any single failure → Manual execution required**

---

## 🧪 Run Tests

```bash
# Full test suite
node src/backend/etas/__tests__/testDay11Automation.js

# Individual test
import { testEligibilityRules } from './__tests__/testDay11Automation.js';
testEligibilityRules();
```

---

## 📊 Key Functions Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `canAutoExecute(trip)` | Check if trip qualifies | `{ eligible, reason, explanation }` |
| `evaluateAutomationEligibility(trip)` | Generate automation metadata | `{ eligible, evaluatedAt, evaluatedBy, reason }` |
| `approveTrip(trip, decision, notes)` | Approve + evaluate automation | `{ success, trip, nextAction }` |
| `executeTrip(trip, action, executedBy)` | Manual execution | `{ success, trip, executionResult }` |
| `executeAutomatically(trip, action)` | Auto execution (checks kill-switch) | `{ success, trip, automatedExecution }` |
| `decideExecutionPath(trip, action)` | Smart router (manual/auto) | `{ success, trip, ... }` |
| `isAutomationEnabled()` | Check kill-switch state | `true/false` |

---

## 🔐 Security Notes

1. **Kill-switch location**: Should be controlled outside UI in production
2. **Audit trail**: All decisions logged to console (extend to database in production)
3. **Human override**: Always available, regardless of automation state
4. **No silent execution**: Every action logged with reason and executor

---

## 🎯 Common Scenarios

### Scenario: Test Automation Logic Without Executing
```javascript
const trip = { /* approved trip */ };
const eligibility = canAutoExecute(trip);

if (eligibility.eligible) {
  console.log("Would auto-execute:", eligibility.reason);
} else {
  console.log("Would require manual:", eligibility.reason);
}
```

### Scenario: Force Manual Execution
```javascript
// Even if trip is eligible, force manual execution
const result = executeTrip(trip, "SEND_BOOKING_REQUEST", "operator-123");
```

### Scenario: Check Why Trip Not Eligible
```javascript
const trip = { /* your trip */ };
const check = canAutoExecute(trip);
console.log(check.explanation); // Human-readable reason
```

---

## 🚨 Troubleshooting

### Problem: Automation not working
**Check:**
1. Is `AUTOMATION_ENABLED = true` in config?
2. Does trip have `automation.eligible = true`?
3. Is trip in `approved` state?
4. Check console logs for block reason

### Problem: Trip always requires manual execution
**Check:**
1. Run eligibility check: `canAutoExecute(trip)`
2. Look at `reason` field
3. Common causes:
   - Executive tier
   - SENTINEL elevated risk
   - Missing approval metadata

### Problem: Can't find execution logs
**Check:**
- Console output (all events logged)
- Look for patterns: `[AUTOMATION]`, `[APPROVAL]`, `[EXECUTION]`
- Automation events have 📊 prefix

---

## 💾 Trip Object Structure (Post-Day 11)

```javascript
{
  trip_id: "trip-001",
  state: "approved",
  
  // ... existing fields ...
  
  approval: {
    status: "APPROVED",
    decidedBy: "human",
    decidedAt: "2025-12-28T10:00:00Z",
    notes: "Standard trip"
  },
  
  automation: {              // ← NEW IN DAY 11
    eligible: true,
    evaluatedAt: "2025-12-28T10:00:00Z",
    evaluatedBy: "system",
    reason: "LOW_RISK_STANDARD_TIER",
    explanation: "Trip meets all criteria"
  },
  
  execution: {
    status: "EXECUTED",
    action: "SEND_BOOKING_REQUEST",
    executedBy: "human",     // or "system" for auto
    executedAt: "2025-12-28T10:05:00Z",
    result: "Booking request email sent"
  }
}
```

---

## 📞 Need Help?

1. Check [README_DAY11.md](README_DAY11.md) for full documentation
2. Run test suite to verify setup
3. Check console logs for detailed execution traces
4. Review eligibility rules in [automationEligibility.js](automationEligibility.js)

---

**Remember**: Automation is OFF by default. Enable it only when you're ready to scale! 🚀
