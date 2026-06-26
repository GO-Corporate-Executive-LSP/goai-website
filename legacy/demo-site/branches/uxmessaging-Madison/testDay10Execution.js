/**
 * Day 10 Test Scenarios — Manual Execution Testing
 * 
 * Test the three critical scenarios for Day 10:
 * 1. Approved → Execute (SUCCESS)
 * 2. Not Approved → Execute Attempt (BLOCKED)
 * 3. Execution Failure (LOGGED)
 */

import { executeTrip, canExecuteTrip } from '../executeTrip.js';
import { approveTrip } from '../approveTrip.js';
import { processTrip } from '../processTrip.js';

console.log("\n" + "=".repeat(70));
console.log("DAY 10 TEST SUITE — MANUAL EXECUTION SCENARIOS");
console.log("=".repeat(70));

// ============================================================================
// SCENARIO 1 — APPROVED → EXECUTE (SUCCESS)
// ============================================================================

function testScenario1_ApprovedExecution() {
    console.log("\n🟢 SCENARIO 1 — Approved Trip → Execute");
    console.log("─".repeat(70));
    console.log("Expected: Execution succeeds, trip state = 'executed'");
    console.log("─".repeat(70));
    
    // Create a trip and move it through the full flow
    const trip = {
        trip_id: "TEST-001",
        user_id: "user-123",
        state: "draft",
        pickup: {
            address: "123 Main St, New York, NY",
            datetime: "2025-12-28T14:00:00Z",
            timezone: "America/New_York"
        },
        dropoff: {
            address: "456 Park Ave, New York, NY"
        },
        passengers: 2,
        luggage: 1,
        tier: {
            name: "Premium",
            vehicle_class: "Luxury Sedan"
        },
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        notes: "Test trip for Day 10 scenario 1"
    };
    
    // Step 1: Process trip for review
    console.log("\n📝 Step 1: Process trip for review...");
    const processResult = processTrip(trip);
    const reviewTrip = processResult.trip;
    console.log(`✅ Trip processed. State: ${reviewTrip.state}`);
    
    // Step 2: Approve the trip
    console.log("\n✅ Step 2: Approve trip...");
    const approvalResult = approveTrip(reviewTrip, "APPROVED", "Test approval for execution");
    const approvedTrip = approvalResult.trip;
    console.log(`✅ Trip approved. State: ${approvedTrip.state}`);
    
    // Step 3: Check execution eligibility
    console.log("\n🔍 Step 3: Check execution eligibility...");
    const eligibility = canExecuteTrip(approvedTrip);
    console.log(`Can Execute: ${eligibility.canExecute}`);
    eligibility.checks.forEach(check => {
        console.log(`   ${check.passed ? "✅" : "❌"} ${check.check}: ${check.message}`);
    });
    
    // Step 4: Execute the trip
    console.log("\n🚀 Step 4: Execute trip...");
    const executionResult = executeTrip(approvedTrip, "SEND_BOOKING_REQUEST", "test-user");
    
    // Verify results
    console.log("\n" + "─".repeat(70));
    console.log("SCENARIO 1 RESULTS:");
    console.log("─".repeat(70));
    console.log(`Success: ${executionResult.success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Trip State: ${executionResult.trip.state}`);
    console.log(`Execution Status: ${executionResult.trip.execution?.status || "NONE"}`);
    console.log(`Expected State: executed`);
    console.log(`Expected Execution Status: EXECUTED`);
    
    const passed = executionResult.success && 
                   executionResult.trip.state === "executed" &&
                   executionResult.trip.execution?.status === "EXECUTED";
    
    console.log(`\n🎯 SCENARIO 1: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log("─".repeat(70));
    
    return passed;
}

// ============================================================================
// SCENARIO 2 — NOT APPROVED → EXECUTE ATTEMPT (BLOCKED)
// ============================================================================

function testScenario2_NotApprovedBlocked() {
    console.log("\n🟡 SCENARIO 2 — Not Approved → Execute Attempt");
    console.log("─".repeat(70));
    console.log("Expected: Execution blocked, trip unchanged");
    console.log("─".repeat(70));
    
    // Create a trip in review state (not approved)
    const trip = {
        trip_id: "TEST-002",
        user_id: "user-456",
        state: "review",
        pickup: {
            address: "789 Broadway, New York, NY",
            datetime: "2025-12-28T16:00:00Z",
            timezone: "America/New_York"
        },
        dropoff: {
            address: "321 Fifth Ave, New York, NY"
        },
        passengers: 1,
        luggage: 0,
        tier: {
            name: "Standard",
            vehicle_class: "Sedan"
        },
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        approval: {
            status: "",  // NOT APPROVED
            decidedBy: "",
            decidedAt: "",
            notes: ""
        },
        notes: "Test trip for Day 10 scenario 2"
    };
    
    // Attempt to execute without approval
    console.log("\n🚫 Attempting to execute unapproved trip...");
    const executionResult = executeTrip(trip, "SEND_BOOKING_REQUEST", "test-user");
    
    // Verify results
    console.log("\n" + "─".repeat(70));
    console.log("SCENARIO 2 RESULTS:");
    console.log("─".repeat(70));
    console.log(`Success: ${executionResult.success ? "❌ SHOULD HAVE BEEN BLOCKED" : "✅ PASS (Correctly blocked)"}`);
    console.log(`Execution Blocked: ${executionResult.executionBlocked ? "✅ YES" : "❌ NO"}`);
    console.log(`Block Reason: ${executionResult.reason || "NONE"}`);
    console.log(`Error Message: ${executionResult.error || "NONE"}`);
    console.log(`Trip State: ${executionResult.trip.state} (should be unchanged: review)`);
    
    const passed = !executionResult.success && 
                   executionResult.executionBlocked &&
                   executionResult.reason === "NOT_APPROVED" &&
                   executionResult.trip.state === "review";
    
    console.log(`\n🎯 SCENARIO 2: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log("─".repeat(70));
    
    return passed;
}

// ============================================================================
// SCENARIO 3 — EXECUTION FAILURE (LOGGED)
// ============================================================================

function testScenario3_ExecutionFailure() {
    console.log("\n🔴 SCENARIO 3 — Execution Failure");
    console.log("─".repeat(70));
    console.log("Expected: Failure logged, state = 'execution_failed', manual recovery required");
    console.log("─".repeat(70));
    
    // Create an approved trip
    const trip = {
        trip_id: "TEST-003",
        user_id: "user-789",
        state: "approved",
        pickup: {
            address: "555 Madison Ave, New York, NY",
            datetime: "2025-12-28T18:00:00Z",
            timezone: "America/New_York"
        },
        dropoff: {
            address: "777 Lexington Ave, New York, NY"
        },
        passengers: 3,
        luggage: 2,
        tier: {
            name: "Executive",
            vehicle_class: "SUV"
        },
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        approval: {
            status: "APPROVED",
            decidedBy: "human",
            decidedAt: new Date().toISOString(),
            notes: "Test approval for failure scenario"
        },
        notes: "Test trip for Day 10 scenario 3 - will simulate failure"
    };
    
    // Attempt execution with invalid action (to trigger failure)
    console.log("\n💥 Attempting execution with invalid action (to trigger failure)...");
    const executionResult = executeTrip(trip, "INVALID_ACTION", "test-user");
    
    // Verify results
    console.log("\n" + "─".repeat(70));
    console.log("SCENARIO 3 RESULTS:");
    console.log("─".repeat(70));
    console.log(`Success: ${executionResult.success ? "❌ SHOULD HAVE FAILED" : "✅ PASS (Correctly failed)"}`);
    console.log(`Manual Recovery Required: ${executionResult.requiresManualRecovery ? "✅ YES" : "❌ NO"}`);
    console.log(`Trip State: ${executionResult.trip.state} (should be: execution_failed)`);
    console.log(`Execution Status: ${executionResult.trip.execution?.status || "NONE"} (should be: FAILED)`);
    console.log(`Error Logged: ${executionResult.error ? "✅ YES" : "❌ NO"}`);
    
    const passed = !executionResult.success &&
                   executionResult.requiresManualRecovery &&
                   executionResult.trip.state === "execution_failed" &&
                   executionResult.trip.execution?.status === "FAILED";
    
    console.log(`\n🎯 SCENARIO 3: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log("─".repeat(70));
    
    return passed;
}

// ============================================================================
// ADDITIONAL TEST: Already Executed Check
// ============================================================================

function testScenario4_AlreadyExecuted() {
    console.log("\n🟣 BONUS SCENARIO 4 — Already Executed Check");
    console.log("─".repeat(70));
    console.log("Expected: Second execution blocked");
    console.log("─".repeat(70));
    
    // Create an already-executed trip
    const trip = {
        trip_id: "TEST-004",
        user_id: "user-999",
        state: "executed",
        pickup: {
            address: "100 Wall St, New York, NY",
            datetime: "2025-12-28T20:00:00Z",
            timezone: "America/New_York"
        },
        dropoff: {
            address: "200 Broadway, New York, NY"
        },
        passengers: 1,
        luggage: 1,
        tier: {
            name: "Standard",
            vehicle_class: "Sedan"
        },
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        approval: {
            status: "APPROVED",
            decidedBy: "human",
            decidedAt: new Date().toISOString(),
            notes: "Previously approved"
        },
        execution: {
            status: "EXECUTED",
            action: "SEND_BOOKING_REQUEST",
            executedBy: "human",
            executedAt: new Date().toISOString(),
            result: "Booking request email sent",
            notes: "Already executed"
        },
        notes: "Test trip for already executed check"
    };
    
    // Attempt to execute again
    console.log("\n🚫 Attempting to execute already-executed trip...");
    const executionResult = executeTrip(trip, "SEND_BOOKING_REQUEST", "test-user");
    
    // Verify results
    console.log("\n" + "─".repeat(70));
    console.log("SCENARIO 4 RESULTS:");
    console.log("─".repeat(70));
    console.log(`Success: ${executionResult.success ? "❌ SHOULD HAVE BEEN BLOCKED" : "✅ PASS (Correctly blocked)"}`);
    console.log(`Execution Blocked: ${executionResult.executionBlocked ? "✅ YES" : "❌ NO"}`);
    console.log(`Block Reason: ${executionResult.reason || "NONE"} (should be: ALREADY_EXECUTED)`);
    
    const passed = !executionResult.success &&
                   executionResult.executionBlocked &&
                   executionResult.reason === "ALREADY_EXECUTED";
    
    console.log(`\n🎯 SCENARIO 4: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log("─".repeat(70));
    
    return passed;
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export function runDay10Tests() {
    console.log("\n\n");
    console.log("█".repeat(70));
    console.log("█" + " ".repeat(68) + "█");
    console.log("█" + "  DAY 10 TEST EXECUTION — LIMITED MANUAL EXECUTION".padEnd(68) + "█");
    console.log("█" + " ".repeat(68) + "█");
    console.log("█".repeat(70));
    
    const results = [];
    
    try {
        results.push({ name: "Scenario 1: Approved → Execute", passed: testScenario1_ApprovedExecution() });
    } catch (error) {
        console.error("❌ Scenario 1 threw error:", error.message);
        results.push({ name: "Scenario 1: Approved → Execute", passed: false });
    }
    
    try {
        results.push({ name: "Scenario 2: Not Approved → Blocked", passed: testScenario2_NotApprovedBlocked() });
    } catch (error) {
        console.error("❌ Scenario 2 threw error:", error.message);
        results.push({ name: "Scenario 2: Not Approved → Blocked", passed: false });
    }
    
    try {
        results.push({ name: "Scenario 3: Execution Failure", passed: testScenario3_ExecutionFailure() });
    } catch (error) {
        console.error("❌ Scenario 3 threw error:", error.message);
        results.push({ name: "Scenario 3: Execution Failure", passed: false });
    }
    
    try {
        results.push({ name: "Scenario 4: Already Executed Check", passed: testScenario4_AlreadyExecuted() });
    } catch (error) {
        console.error("❌ Scenario 4 threw error:", error.message);
        results.push({ name: "Scenario 4: Already Executed Check", passed: false });
    }
    
    // Summary
    console.log("\n\n");
    console.log("█".repeat(70));
    console.log("█" + " ".repeat(68) + "█");
    console.log("█" + "  TEST SUMMARY".padEnd(68) + "█");
    console.log("█" + " ".repeat(68) + "█");
    console.log("█".repeat(70));
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    results.forEach(result => {
        const icon = result.passed ? "✅" : "❌";
        console.log(`${icon} ${result.name}`);
    });
    
    console.log("\n" + "─".repeat(70));
    console.log(`RESULTS: ${passedCount}/${totalCount} scenarios passed`);
    console.log("─".repeat(70));
    
    if (passedCount === totalCount) {
        console.log("\n🎉 ALL TESTS PASSED — DAY 10 SUCCESS!");
        console.log("✅ Manual execution trigger implemented correctly");
        console.log("✅ Guardrails functioning properly");
        console.log("✅ Audit logging in place");
        console.log("✅ Ready for controlled activation");
    } else {
        console.log("\n⚠️ SOME TESTS FAILED — REVIEW REQUIRED");
        console.log("Review failed scenarios and fix issues before proceeding");
    }
    
    console.log("\n" + "█".repeat(70) + "\n\n");
    
    return {
        passed: passedCount === totalCount,
        results,
        passedCount,
        totalCount
    };
}

// Auto-run if executed directly
if (typeof module !== 'undefined' && require.main === module) {
    runDay10Tests();
}
