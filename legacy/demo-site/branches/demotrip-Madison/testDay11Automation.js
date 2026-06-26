/**
 * testDay11Automation.js — Day 11 Test Suite
 * 
 * Purpose: Verify automation eligibility, branching, and kill-switch functionality
 * Tests: Eligibility rules, automation paths, kill-switch enforcement, logging
 */

import { canAutoExecute, evaluateAutomationEligibility } from '../automationEligibility.js';
import { AUTOMATION_CONFIG } from '../automationConfig.js';
import { approveTrip } from '../approveTrip.js';
import { executeAutomatically, decideExecutionPath } from '../executeTrip.js';

/**
 * Mock trip data for testing
 */
const createMockTrip = (overrides = {}) => ({
  trip_id: "test-trip-001",
  user_id: "user-123",
  state: "review",
  pickup: {
    address: "123 Start St, City, State",
    datetime: "2025-12-30T10:00:00Z",
    timezone: "America/New_York"
  },
  dropoff: {
    address: "456 End Ave, City, State"
  },
  return: {
    pickup_datetime: "",
    estimated_home_arrival: ""
  },
  passengers: 2,
  luggage: 1,
  tier: {
    name: "standard",
    vehicle_class: "sedan"
  },
  sentinel_snapshot: {
    risk_level: "green",
    risk_note: ""
  },
  sentinel: {
    riskScore: "LOW",
    flags: [],
    guidance: [],
    evaluatedAt: new Date().toISOString()
  },
  notes: "",
  ...overrides
});

/**
 * Test Suite: Automation Eligibility Rules
 */
function testEligibilityRules() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST SUITE: AUTOMATION ELIGIBILITY RULES");
  console.log("=".repeat(70));
  
  const tests = [
    {
      name: "Standard trip with low risk should be eligible",
      trip: createMockTrip({ state: "approved", approval: { status: "APPROVED" } }),
      expectedEligible: true
    },
    {
      name: "Trip not in approved state should not be eligible",
      trip: createMockTrip({ state: "review" }),
      expectedEligible: false
    },
    {
      name: "Executive protection tier should not be eligible",
      trip: createMockTrip({ 
        state: "approved", 
        approval: { status: "APPROVED" },
        tier: { name: "executive_protection", vehicle_class: "armored_suv" }
      }),
      expectedEligible: false
    },
    {
      name: "SENTINEL elevated risk should not be eligible",
      trip: createMockTrip({ 
        state: "approved", 
        approval: { status: "APPROVED" },
        sentinel_snapshot: { risk_level: "elevated", risk_note: "High traffic alert" }
      }),
      expectedEligible: false
    },
    {
      name: "SENTINEL medium risk with flags should not be eligible",
      trip: createMockTrip({ 
        state: "approved", 
        approval: { status: "APPROVED" },
        sentinel: { riskScore: "MEDIUM", flags: ["weather_alert"], guidance: [] }
      }),
      expectedEligible: false
    },
    {
      name: "Unconfirmed payment should not be eligible",
      trip: createMockTrip({ 
        state: "approved", 
        approval: { status: "APPROVED" },
        paymentStatus: "pending"
      }),
      expectedEligible: false
    },
    {
      name: "Already executed trip should not be eligible",
      trip: createMockTrip({ 
        state: "approved", 
        approval: { status: "APPROVED" },
        execution: { status: "EXECUTED" }
      }),
      expectedEligible: false
    },
    {
      name: "Escalated trip should not be eligible",
      trip: createMockTrip({ 
        state: "escalated",
        approval: { status: "APPROVED" }
      }),
      expectedEligible: false
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.name}`);
    const result = canAutoExecute(test.trip);
    
    if (result.eligible === test.expectedEligible) {
      console.log(`   ✅ PASSED`);
      console.log(`   Result: ${result.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`);
      console.log(`   Reason: ${result.reason}`);
      passed++;
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Expected: ${test.expectedEligible}`);
      console.log(`   Got: ${result.eligible}`);
      console.log(`   Reason: ${result.reason}`);
      failed++;
    }
  });
  
  console.log("\n" + "─".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(70) + "\n");
  
  return { passed, failed };
}

/**
 * Test Suite: Approval Integration
 */
function testApprovalIntegration() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST SUITE: APPROVAL INTEGRATION");
  console.log("=".repeat(70));
  
  const trip = createMockTrip();
  
  console.log("\nTest: Approving a trip should evaluate automation eligibility");
  
  const approvalResult = approveTrip(trip, "APPROVED", "Standard low-risk trip");
  
  if (approvalResult.trip.automation) {
    console.log("✅ PASSED - Automation data added to trip");
    console.log(`   Eligible: ${approvalResult.trip.automation.eligible}`);
    console.log(`   Reason: ${approvalResult.trip.automation.reason}`);
    console.log(`   Evaluated At: ${approvalResult.trip.automation.evaluatedAt}`);
    console.log(`   Evaluated By: ${approvalResult.trip.automation.evaluatedBy}`);
    return { passed: 1, failed: 0 };
  } else {
    console.log("❌ FAILED - No automation data on trip");
    return { passed: 0, failed: 1 };
  }
}

/**
 * Test Suite: Kill-Switch Enforcement
 */
function testKillSwitch() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST SUITE: KILL-SWITCH ENFORCEMENT");
  console.log("=".repeat(70));
  
  const eligibleTrip = createMockTrip({ 
    state: "approved", 
    approval: { status: "APPROVED" },
    automation: {
      eligible: true,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: "system",
      reason: "LOW_RISK_STANDARD_TIER",
      explanation: "Trip meets all criteria"
    }
  });
  
  console.log(`\nCurrent Kill-Switch State: ${AUTOMATION_CONFIG.enabled ? "ENABLED" : "DISABLED"}`);
  
  if (!AUTOMATION_CONFIG.enabled) {
    console.log("\nTest: Kill-switch OFF should block auto-execution");
    
    const result = executeAutomatically(eligibleTrip);
    
    if (result.automationBlocked && result.reason === "AUTOMATION_DISABLED_GLOBALLY") {
      console.log("✅ PASSED - Automation correctly blocked by kill-switch");
      console.log(`   Requires Manual: ${result.requiresManualExecution}`);
      return { passed: 1, failed: 0 };
    } else {
      console.log("❌ FAILED - Kill-switch did not block automation");
      return { passed: 0, failed: 1 };
    }
  } else {
    console.log("\nℹ️  Kill-switch is ON - test would verify auto-execution proceeds");
    console.log("   (Enable kill-switch in automationConfig.js to test blocking)");
    return { passed: 0, failed: 0, skipped: 1 };
  }
}

/**
 * Test Suite: Execution Path Branching
 */
function testExecutionBranching() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST SUITE: EXECUTION PATH BRANCHING");
  console.log("=".repeat(70));
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Trip with no automation data → manual
  console.log("\nTest 1: No automation data → manual path");
  const noAutoTrip = createMockTrip({ 
    state: "approved",
    approval: { status: "APPROVED" }
  });
  
  const result1 = decideExecutionPath(noAutoTrip);
  console.log(`   Path taken: ${result1.automatedExecution ? "AUTOMATIC" : "MANUAL"}`);
  if (!result1.automatedExecution) {
    console.log("   ✅ PASSED");
    passed++;
  } else {
    console.log("   ❌ FAILED");
    failed++;
  }
  
  // Test 2: Trip eligible but kill-switch OFF → manual
  console.log("\nTest 2: Eligible trip, kill-switch OFF → manual path");
  const eligibleTrip = createMockTrip({ 
    state: "approved",
    approval: { status: "APPROVED" },
    automation: {
      eligible: true,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: "system",
      reason: "LOW_RISK_STANDARD_TIER"
    }
  });
  
  const result2 = decideExecutionPath(eligibleTrip);
  console.log(`   Path taken: ${result2.automatedExecution ? "AUTOMATIC" : "MANUAL"}`);
  console.log(`   Kill-switch enabled: ${AUTOMATION_CONFIG.enabled}`);
  
  if (!AUTOMATION_CONFIG.enabled && !result2.automatedExecution) {
    console.log("   ✅ PASSED");
    passed++;
  } else if (AUTOMATION_CONFIG.enabled && result2.automatedExecution) {
    console.log("   ✅ PASSED (kill-switch ON, automation proceeded)");
    passed++;
  } else {
    console.log("   ❌ FAILED");
    failed++;
  }
  
  // Test 3: Trip not eligible → manual
  console.log("\nTest 3: Not eligible trip → manual path");
  const notEligibleTrip = createMockTrip({ 
    state: "approved",
    approval: { status: "APPROVED" },
    automation: {
      eligible: false,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: "system",
      reason: "SENTINEL_ELEVATED_RISK"
    }
  });
  
  const result3 = decideExecutionPath(notEligibleTrip);
  console.log(`   Path taken: ${result3.automatedExecution ? "AUTOMATIC" : "MANUAL"}`);
  if (!result3.automatedExecution) {
    console.log("   ✅ PASSED");
    passed++;
  } else {
    console.log("   ❌ FAILED");
    failed++;
  }
  
  console.log("\n" + "─".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(70) + "\n");
  
  return { passed, failed };
}

/**
 * Test Suite: Complete Flow
 */
function testCompleteFlow() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST SUITE: COMPLETE DAY 11 FLOW");
  console.log("=".repeat(70));
  
  console.log("\nSimulating: Trip submission → Approval → Execution decision");
  
  // Step 1: Create trip in review state
  let trip = createMockTrip();
  console.log(`\nStep 1: Trip in review state`);
  console.log(`   Trip ID: ${trip.trip_id}`);
  console.log(`   State: ${trip.state}`);
  
  // Step 2: Approve trip (this should evaluate automation)
  console.log(`\nStep 2: Approving trip...`);
  const approvalResult = approveTrip(trip, "APPROVED", "Looks good");
  trip = approvalResult.trip;
  
  console.log(`   Approved: ${trip.state === "approved" ? "✅" : "❌"}`);
  console.log(`   Automation Evaluated: ${trip.automation ? "✅" : "❌"}`);
  
  if (trip.automation) {
    console.log(`   Eligible: ${trip.automation.eligible}`);
    console.log(`   Reason: ${trip.automation.reason}`);
  }
  
  // Step 3: Decide execution path
  console.log(`\nStep 3: Deciding execution path...`);
  const executionResult = decideExecutionPath(trip);
  
  console.log(`   Path: ${executionResult.automatedExecution ? "AUTOMATIC" : "MANUAL"}`);
  console.log(`   Success: ${executionResult.success ? "✅" : "❌"}`);
  
  if (executionResult.automationBlocked) {
    console.log(`   Blocked: ${executionResult.reason}`);
  }
  
  console.log("\n" + "─".repeat(70));
  
  if (approvalResult.success && trip.automation) {
    console.log("✅ COMPLETE FLOW SUCCESSFUL");
    console.log("   - Trip approved");
    console.log("   - Automation evaluated");
    console.log("   - Execution path determined");
    return { passed: 1, failed: 0 };
  } else {
    console.log("❌ FLOW INCOMPLETE");
    return { passed: 0, failed: 1 };
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log("\n\n");
  console.log("█".repeat(70));
  console.log("█" + " ".repeat(68) + "█");
  console.log("█" + " ".repeat(15) + "DAY 11 TEST SUITE — GUARDED AUTOMATION" + " ".repeat(15) + "█");
  console.log("█" + " ".repeat(68) + "█");
  console.log("█".repeat(70));
  
  const results = [];
  
  // Run test suites
  results.push({ suite: "Eligibility Rules", ...testEligibilityRules() });
  results.push({ suite: "Approval Integration", ...testApprovalIntegration() });
  results.push({ suite: "Kill-Switch", ...testKillSwitch() });
  results.push({ suite: "Execution Branching", ...testExecutionBranching() });
  results.push({ suite: "Complete Flow", ...testCompleteFlow() });
  
  // Summary
  console.log("\n" + "█".repeat(70));
  console.log("█" + " ".repeat(25) + "TEST SUMMARY" + " ".repeat(31) + "█");
  console.log("█".repeat(70));
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  results.forEach(result => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalSkipped += result.skipped || 0;
    
    const status = result.failed === 0 ? "✅" : "❌";
    console.log(`\n${status} ${result.suite}`);
    console.log(`   Passed: ${result.passed}, Failed: ${result.failed}${result.skipped ? `, Skipped: ${result.skipped}` : ""}`);
  });
  
  console.log("\n" + "─".repeat(70));
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed${totalSkipped ? `, ${totalSkipped} skipped` : ""}`);
  console.log("█".repeat(70) + "\n\n");
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    totalSkipped
  };
}

// Export functions for use in other test files
export {
  createMockTrip,
  testEligibilityRules,
  testApprovalIntegration,
  testKillSwitch,
  testExecutionBranching,
  testCompleteFlow,
  runAllTests
};

// If running directly, execute all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
