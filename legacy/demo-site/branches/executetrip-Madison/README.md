# Day 9 Testing Guide

## Quick Start Testing

### Option 1: Browser Console Testing (Easiest)

1. Open the **AI Concierge** page in your Wix editor
2. Click **Preview** to run the page
3. Open browser developer console (F12)
4. The page will automatically run test scenarios
5. Look for "Trip ready for approval" message
6. Run approval tests:

```javascript
// Test approval decision
testApprove()

// Test adjustment request
testAdjustment()

// Test escalation
testEscalate()
```

### Option 2: Automated Test Suite

Run the complete test suite:

```javascript
import { runAllApprovalTests } from 'backend/etas/__tests__/testApprovalScenarios';
runAllApprovalTests();
```

This will test all three scenarios automatically:
- ✅ Low risk approval
- 🟡 Medium risk escalation  
- ✏️ Adjustment needed

---

## What to Look For

### ✅ Successful Approval
- Trip state changes to "approved"
- Approval metadata populated:
  - status: "APPROVED"
  - decidedBy: "human"
  - decidedAt: [timestamp]
  - notes: [your notes]
- Console shows: "Trip approved and ready for execution"
- No execution happens (Day 9 - review only)

### ✏️ Adjustment Request
- Trip state returns to "draft"
- Approval metadata shows "NEEDS_ADJUSTMENT"
- Console shows: "Trip returned to conversation"
- User can modify trip details

### 🧍 Escalation
- Trip state changes to "escalated"
- Approval metadata shows "ESCALATED"
- Console shows: "Trip escalated to concierge"
- Concierge path displayed

---

## Backend Logs

Check backend logs for audit trail:

```
[APPROVAL] Trip test-001 - Decision: APPROVED
[APPROVAL] SENTINEL Risk: LOW
[APPROVAL] Decided at: 2025-12-26T...
[APPROVAL] Notes: Low risk trip, approved for execution
[APPROVAL] New state: approved
```

---

## Testing Scenarios

### Scenario 1: Low Risk Trip
- **Time:** 2:30 PM (daytime)
- **Expected SENTINEL:** LOW risk
- **Expected Action:** Approve smoothly
- **Expected State:** approved

### Scenario 2: Medium Risk Trip  
- **Time:** 11:30 PM (late night)
- **Expected SENTINEL:** MEDIUM risk
- **Expected Action:** Escalate or approve with caution
- **Expected State:** escalated or approved

### Scenario 3: Adjustment Needed
- **Any trip:** Valid but needs changes
- **Expected Action:** Request adjustment
- **Expected State:** draft

---

## Manual Testing Steps

1. **Submit a trip for review:**
   ```javascript
   submitTripForReview(tripObject)
   ```

2. **Wait for validation:**
   - Should show "valid" status
   - Trip state becomes "review"
   - SENTINEL context displayed

3. **Display approval UI:**
   - Automatically shown when trip reaches review state
   - Shows trip summary
   - Shows SENTINEL risk context
   - Shows approval options

4. **Make approval decision:**
   ```javascript
   // Choose one:
   handleApprove(trip, "notes")
   handleRequestAdjustment(trip, "notes")
   handleEscalate(trip, "notes")
   ```

5. **Verify response:**
   - Check trip state changed correctly
   - Check approval metadata populated
   - Check audit logs in console
   - Verify no execution happened

---

## Troubleshooting

### "Trip must be in review state"
- Trip hasn't been validated yet
- Run `submitTripForReview()` first

### "Invalid decision"
- Must be: "APPROVED", "NEEDS_ADJUSTMENT", or "ESCALATED"
- Check spelling and case

### No SENTINEL data
- This is OK - SENTINEL is optional
- System works without it
- Approval urgency defaults to "STANDARD"

### Backend not responding
- Check backend/tripService.jsw is deployed
- Check backend logs for errors
- Verify import paths are correct

---

## Success Criteria

✅ Trip can be approved  
✅ Trip can be returned for adjustment  
✅ Trip can be escalated  
✅ SENTINEL context displays (when available)  
✅ Approval metadata is recorded  
✅ Audit trail is logged  
✅ No execution happens (Day 9)  

---

## Next Steps After Testing

Once all tests pass:

```bash
git add .
git commit -m "Day 9: add human approval loop before execution"
git push
```

Then proceed to Day 10 or next milestone!
