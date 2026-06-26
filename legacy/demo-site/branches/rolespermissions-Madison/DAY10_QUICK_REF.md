# Day 10 Quick Reference — Manual Execution

## ✅ What's New in Day 10

- **Manual execution trigger** for approved trips
- **Single action**: `SEND_BOOKING_REQUEST` (email to operations)
- **Guardrails**: 3 safety checks before execution
- **Complete audit logging** for every execution
- **No automatic behavior** - requires explicit human trigger

---

## 🎯 Quick Commands

### Check if Trip Can Be Executed
```javascript
import { checkExecutionEligibility } from 'backend/tripService';

const result = await checkExecutionEligibility(trip);
// result.data.canExecute = true/false
```

### Execute Trip Manually
```javascript
import { executeTripManually } from 'backend/tripService';

const result = await executeTripManually(
  tripId,
  trip,
  "SEND_BOOKING_REQUEST",
  "human"
);
```

### Use UI Helpers
```javascript
import { handleExecuteTrip } from 'backend/etas/approvalUI';

handleExecuteTrip(trip, "SEND_BOOKING_REQUEST", "", onSuccess, onError);
```

---

## 🔒 Guardrails (Always Checked)

1. ✅ `approval.status === "APPROVED"`
2. ✅ `state === "approved"`
3. ✅ `execution.status !== "EXECUTED"`

If any fail → execution **BLOCKED**

---

## 📊 Execution States

| State | Meaning |
|-------|---------|
| `PENDING` | Approved, not executed yet |
| `EXECUTED` | Successfully executed |
| `FAILED` | Execution failed, manual recovery needed |

---

## 🧪 Run Tests

```bash
# Quick demo
node src/backend/etas/__tests__/dryTestDay10.js

# Full test suite
node src/backend/etas/__tests__/testDay10Execution.js
```

---

## 📝 Execution Metadata

```javascript
execution: {
  status: "EXECUTED",
  action: "SEND_BOOKING_REQUEST",
  executedBy: "human",
  executedAt: "2025-12-27T...",
  result: "Booking request email sent",
  notes: "Optional notes"
}
```

---

## ⚠️ Failure Handling

On failure:
1. Execution stops immediately
2. Error logged
3. State → `execution_failed`
4. Manual recovery required
5. **NO automatic retries**

---

## 🎨 UI Integration

```javascript
// Show execute button only if eligible
displayExecutionUI(trip, uiElements);

// Button only shows when:
// - Trip is approved
// - Trip not yet executed
// - All guardrails pass
```

---

## 📧 Email Action (Day 10)

**Action**: `SEND_BOOKING_REQUEST`

**Sends to**: operations@example.com

**Includes**:
- Trip details (pickup, dropoff, time)
- Passenger/luggage count
- SENTINEL risk assessment
- Approval metadata
- Additional notes

**Status**: Currently simulated (logs content)  
**Ready for**: Real email service integration

---

## 🚨 Common Issues

### Execute Button Not Showing
→ Check approval status and trip state

### Execution Blocked
→ Review guardrail validation results

### Execution Failed
→ Check logs, follow manual recovery

---

## 📚 Full Documentation

- [DAY_10_SUMMARY.md](../../docs/DAY_10_SUMMARY.md) - Complete implementation
- [README_DAY10.md](./README_DAY10.md) - Module documentation

---

**Day 10 Status: ✅ COMPLETE**

*Limited execution mode active. System fully observable and stoppable.*
