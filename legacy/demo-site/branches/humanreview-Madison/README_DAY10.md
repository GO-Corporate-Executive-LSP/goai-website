# Day 10 — Manual Execution Module

## Overview

This module implements **limited, manual execution** for approved trips. A single real-world action (booking request email) can be triggered manually by a human operator after approval, with comprehensive guardrails, logging, and the ability to stop instantly.

## Core Principle

> **Execution NEVER happens automatically. Every action requires explicit human trigger after approval.**

## Files in This Module

### Core Logic
- **executeTrip.js** - Main execution handler with guardrails
- **approvalUI.js** - Extended with execution UI functions (Day 10 additions)
- **tripSchema.v1.js** - Extended with execution metadata

### API Endpoints
- **tripService.jsw** - Added execution endpoints:
  - `executeTripManually()` - Trigger manual execution
  - `checkExecutionEligibility()` - Check if trip can be executed

### Testing
- **__tests__/testDay10Execution.js** - Full test suite
- **__tests__/dryTestDay10.js** - Simplified demonstration

## Quick Start

### 1. Check Execution Eligibility

```javascript
import { checkExecutionEligibility } from 'backend/tripService';

// Check if trip can be executed
const response = await checkExecutionEligibility(tripObject);

if (response.success && response.data.canExecute) {
  // Show execute button
  console.log("Trip ready for execution");
} else {
  // Hide execute button
  console.log("Cannot execute:", response.data.message);
}
```

### 2. Execute Trip Manually

```javascript
import { executeTripManually } from 'backend/tripService';

// Execute the trip
const response = await executeTripManually(
  tripId, 
  tripObject, 
  "SEND_BOOKING_REQUEST",  // Action type
  "human"                   // Executed by
);

if (response.success) {
  console.log("Execution successful!");
  console.log("Updated trip:", response.trip);
} else {
  console.error("Execution failed:", response.data.error);
}
```

### 3. Use UI Helper Functions

```javascript
import { displayExecutionUI, handleExecuteTrip } from 'backend/etas/approvalUI';

// Show execution UI
displayExecutionUI(approvedTrip, uiElements);

// Handle execute button click
handleExecuteTrip(
  approvedTrip,
  "SEND_BOOKING_REQUEST",
  "Optional notes",
  (response) => {
    // Success callback
    console.log("Trip executed:", response.trip);
  },
  (error) => {
    // Error callback
    console.error("Execution failed:", error);
  }
);
```

## Execution Flow

```
Approved Trip
      ↓
Check Eligibility (3 guardrails)
      ↓
User Clicks "Execute Trip (Manual)"
      ↓
Confirmation Required
      ↓
Execute Single Action (SEND_BOOKING_REQUEST)
      ↓
Update Trip with Execution Metadata
      ↓
Display Success/Failure
```

## Guardrails (Non-Negotiable)

Every execution is validated against three critical checks:

1. ✅ **Approval Status** - Trip must have `approval.status = "APPROVED"`
2. ✅ **Trip State** - Trip must be in `state = "approved"`
3. ✅ **Idempotency** - Trip must not have `execution.status = "EXECUTED"`

If any check fails, execution is **immediately blocked** and logged.

## Execution States

| State | Description | Next Action |
|-------|-------------|-------------|
| `PENDING` | Approved but not yet executed | Can execute |
| `EXECUTED` | Successfully executed | Complete (no retry) |
| `FAILED` | Execution attempted but failed | Manual recovery required |

## Available Actions (Day 10)

For Day 10, only **one action** is available:

### `SEND_BOOKING_REQUEST`
- Sends booking request email to operations team
- Includes full trip details
- Includes SENTINEL context
- Includes approval metadata
- **Currently simulated** (logs content, returns success)
- Ready to connect to real email service

**Email Content Includes:**
- Pickup/dropoff addresses
- Pickup time
- Passenger/luggage count
- Tier information
- SENTINEL risk assessment
- Approval details
- Additional notes

## Execution Metadata

Every execution creates comprehensive metadata:

```javascript
execution: {
  status: "EXECUTED",           // "PENDING" | "EXECUTED" | "FAILED"
  action: "SEND_BOOKING_REQUEST", // Action type executed
  executedBy: "human",           // Who triggered execution
  executedAt: "2025-12-27T...",  // ISO timestamp
  result: "Booking request...",  // Result message
  notes: "Optional notes"        // Additional context
}
```

## Audit Trail

Every execution is fully auditable with:

- **Who**: `executedBy` field
- **When**: `executedAt` timestamp
- **What**: `action` type
- **Context**: SENTINEL risk level and approval details
- **Outcome**: `result` message (success or failure)

## Failure Handling

When execution fails:

1. ❌ Execution stops immediately
2. 📝 Failure logged with error message
3. 🏷️ Trip state set to `execution_failed`
4. 📋 Execution metadata created with `status: "FAILED"`
5. ⚠️ Manual recovery explicitly required
6. 🚫 **No automatic retry attempts**

## Testing

Run the test suite:

```bash
# Simplified demonstration
node src/backend/etas/__tests__/dryTestDay10.js

# Full test suite (requires imports)
node src/backend/etas/__tests__/testDay10Execution.js
```

### Test Scenarios

1. **Approved → Execute** - Verifies successful execution
2. **Not Approved → Blocked** - Verifies guardrails work
3. **Execution Failure** - Verifies failure handling
4. **Already Executed** - Verifies idempotency

## Safety Features

✅ **Manual Trigger Only** - No automatic execution  
✅ **Single Action** - No action chaining  
✅ **No Retries** - Failures require manual intervention  
✅ **Full Logging** - Every execution logged  
✅ **Guardrails** - Multiple safety checks  
✅ **Observable** - Complete visibility  
✅ **Stoppable** - No background processes  

## What Day 10 IS vs IS NOT

### ✅ Day 10 IS
- Manual execution trigger
- Single downstream action
- Full logging and audit trail
- Reversible action
- Observable and stoppable

### ❌ Day 10 IS NOT
- Background automation
- Action chaining
- Automatic retries
- Autonomous decisions
- Full production launch

## API Reference

### `executeTrip(tripObject, action, executedBy)`

Execute a single action for an approved trip.

**Parameters:**
- `tripObject` (Object) - Full trip object
- `action` (String) - Action type (default: "SEND_BOOKING_REQUEST")
- `executedBy` (String) - Who triggered execution (default: "human")

**Returns:**
```javascript
{
  success: true/false,
  trip: { ...updatedTrip },
  executionResult: { message, details, timestamp },
  error: "Error message if failed"
}
```

### `canExecuteTrip(tripObject)`

Check if a trip is eligible for execution.

**Parameters:**
- `tripObject` (Object) - Trip to validate

**Returns:**
```javascript
{
  canExecute: true/false,
  checks: [
    { passed: true/false, check: "Check name", message: "Details" }
  ],
  message: "Overall result"
}
```

### `executeTripManually(tripId, tripObject, action, executedBy)` (Web Method)

Backend API endpoint for manual execution.

**Parameters:**
- `tripId` (String) - Trip identifier
- `tripObject` (Object) - Full trip object
- `action` (String) - Action type
- `executedBy` (String) - Executor identifier

**Returns:**
```javascript
{
  success: true/false,
  data: { ...executionResult },
  trip: { ...updatedTrip }
}
```

## Troubleshooting

### Execute Button Not Showing
- Check trip has `approval.status = "APPROVED"`
- Check trip `state = "approved"`
- Check trip not already executed

### Execution Blocked
- Review guardrail check results
- Verify approval is present
- Verify trip state is correct

### Execution Failed
- Review error message in logs
- Check execution metadata for details
- Follow manual recovery process
- **Do not retry automatically**

## Next Steps

### Before Production
1. Connect to real email service
2. Add execution confirmation UI dialog
3. Create execution history view
4. Build operations playbook for failures
5. Set up execution monitoring/alerts

### Future Enhancements (Not Day 10)
- Multiple action types
- External system integrations
- Batch execution (still manual)
- Execution scheduling (still requires approval)

## Related Documentation

- [Day 10 Summary](../../docs/DAY_10_SUMMARY.md) - Full implementation details
- [Day 9 Summary](../../docs/DAY_9_SUMMARY.md) - Human approval loop
- [Trip Schema](./tripSchema.v1.js) - Data structure

---

**Day 10 Status: ✅ COMPLETE**

*Manual execution mode activated. System remains fully observable and stoppable.*
