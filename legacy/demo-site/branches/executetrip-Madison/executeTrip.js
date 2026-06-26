/**
 * executeTrip.js — Day 10 Manual Execution + Day 11 Automation Branching
 * 
 * Purpose: Handle both manual and automatic execution of approved trips
 * Policy: Single action, conditional automation, full logging, kill-switch enforced
 */

import { canExecuteAutomatically } from './automationEligibility.js';
import { getAutomationConfig } from './automationConfig.js';

/**
 * Execute a single approved trip action
 * 
 * @param {Object} tripObject - The approved trip object
 * @param {string} action - The action to execute (e.g., "SEND_BOOKING_REQUEST")
 * @param {string} executedBy - Who triggered the execution (for audit)
 * @returns {Object} Execution result with updated trip
 */
export function executeTrip(tripObject, action = "SEND_BOOKING_REQUEST", executedBy = "human") {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 DAY 10 — MANUAL EXECUTION TRIGGER");
  console.log("=".repeat(60));
  
  // GUARDRAIL 1: Validate approval status
  if (!tripObject.approval || tripObject.approval.status !== "APPROVED") {
    const error = `Execution blocked: Trip not approved (current status: ${tripObject.approval?.status || "none"})`;
    console.error(`❌ ${error}`);
    
    return {
      success: false,
      error,
      trip: tripObject,
      executionBlocked: true,
      reason: "NOT_APPROVED"
    };
  }
  
  // GUARDRAIL 2: Check if already executed
  if (tripObject.execution?.status === "EXECUTED") {
    const error = "Execution blocked: Trip already executed";
    console.error(`❌ ${error}`);
    
    return {
      success: false,
      error,
      trip: tripObject,
      executionBlocked: true,
      reason: "ALREADY_EXECUTED"
    };
  }
  
  // GUARDRAIL 3: Validate trip state
  if (tripObject.state !== "approved") {
    const error = `Execution blocked: Invalid trip state (current: ${tripObject.state}, expected: approved)`;
    console.error(`❌ ${error}`);
    
    return {
      success: false,
      error,
      trip: tripObject,
      executionBlocked: true,
      reason: "INVALID_STATE"
    };
  }
  
  // Log execution attempt with full context
  console.log(`\n📋 EXECUTION REQUEST:`);
  console.log(`   Trip ID: ${tripObject.trip_id}`);
  console.log(`   Action: ${action}`);
  console.log(`   Triggered By: ${executedBy}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  
  // Log SENTINEL context for audit trail
  if (tripObject.sentinel_snapshot) {
    console.log(`\n🛡️ SENTINEL™ CONTEXT:`);
    console.log(`   Risk Level: ${tripObject.sentinel_snapshot.risk_level}`);
    if (tripObject.sentinel_snapshot.risk_note) {
      console.log(`   Note: ${tripObject.sentinel_snapshot.risk_note}`);
    }
  }
  
  // Log approval context
  if (tripObject.approval) {
    console.log(`\n✅ APPROVAL CONTEXT:`);
    console.log(`   Approved By: ${tripObject.approval.decidedBy}`);
    console.log(`   Approved At: ${tripObject.approval.decidedAt}`);
    if (tripObject.approval.notes) {
      console.log(`   Notes: ${tripObject.approval.notes}`);
    }
  }
  
  console.log("\n" + "─".repeat(60));
  console.log("🎯 EXECUTING SINGLE ACTION...");
  console.log("─".repeat(60));
  
  // Execute the action
  let executionResult;
  
  try {
    switch (action) {
      case "SEND_BOOKING_REQUEST":
        executionResult = sendBookingRequestEmail(tripObject);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action}`);
    }
    
    // Build execution metadata
    const executionData = {
      status: "EXECUTED",
      action: action,
      executedBy: executedBy,
      executedAt: new Date().toISOString(),
      result: executionResult.message,
      notes: executionResult.details || ""
    };
    
    // Update trip with execution data
    const updatedTrip = {
      ...tripObject,
      execution: executionData,
      state: "executed" // New state for executed trips
    };
    
    console.log("\n✅ EXECUTION SUCCESSFUL");
    console.log(`   Result: ${executionResult.message}`);
    console.log(`   Executed At: ${executionData.executedAt}`);
    console.log("=".repeat(60) + "\n");
    
    return {
      success: true,
      trip: updatedTrip,
      executionResult: executionResult,
      message: "Trip executed successfully"
    };
    
  } catch (error) {
    // Handle execution failure
    console.error("\n❌ EXECUTION FAILED");
    console.error(`   Error: ${error.message}`);
    
    const failureData = {
      status: "FAILED",
      action: action,
      executedBy: executedBy,
      executedAt: new Date().toISOString(),
      result: `Failure: ${error.message}`,
      notes: "Manual recovery required"
    };
    
    const updatedTrip = {
      ...tripObject,
      execution: failureData,
      state: "execution_failed"
    };
    
    console.log("\n⚠️ TRIP MARKED AS FAILED");
    console.log("   Manual intervention required");
    console.log("=".repeat(60) + "\n");
    
    return {
      success: false,
      error: error.message,
      trip: updatedTrip,
      requiresManualRecovery: true
    };
  }
}

/**
 * Send booking request email (Day 10 execution action)
 * 
 * @param {Object} trip - Trip object
 * @returns {Object} Execution result
 */
function sendBookingRequestEmail(trip) {
  console.log("\n📧 SENDING BOOKING REQUEST EMAIL...");
  console.log(`   To: operations@example.com`);
  console.log(`   Subject: New Booking Request - Trip ${trip.trip_id}`);
  
  // Build email content
  const emailContent = buildBookingEmailContent(trip);
  
  console.log("\n📝 Email Content:");
  console.log(emailContent);
  
  // In Day 10, this is a safe, logged action
  // In production, this would call an actual email service
  // For now, we log and simulate success
  
  console.log("\n✅ Email sent (simulated)");
  
  return {
    success: true,
    message: "Booking request email sent",
    details: `Email sent to operations team for trip ${trip.trip_id}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Build email content for booking request
 * 
 * @param {Object} trip - Trip object
 * @returns {string} Email content
 */
function buildBookingEmailContent(trip) {
  return `
─────────────────────────────────────────────────────
BOOKING REQUEST — Trip ${trip.trip_id}
─────────────────────────────────────────────────────

TRIP DETAILS:
• Pickup: ${trip.pickup.address}
• Pickup Time: ${new Date(trip.pickup.datetime).toLocaleString()}
• Dropoff: ${trip.dropoff.address}
• Passengers: ${trip.passengers}
• Luggage: ${trip.luggage}
• Tier: ${trip.tier.name} (${trip.tier.vehicle_class})

${trip.return?.pickup_datetime ? `
RETURN TRIP:
• Return Time: ${new Date(trip.return.pickup_datetime).toLocaleString()}
• Estimated Home Arrival: ${trip.return.estimated_home_arrival}
` : ''}

SENTINEL™ ASSESSMENT:
• Risk Level: ${trip.sentinel_snapshot?.risk_level || 'Not assessed'}
${trip.sentinel_snapshot?.risk_note ? `• Note: ${trip.sentinel_snapshot.risk_note}` : ''}

APPROVAL DETAILS:
• Approved By: ${trip.approval.decidedBy}
• Approved At: ${new Date(trip.approval.decidedAt).toLocaleString()}
${trip.approval.notes ? `• Notes: ${trip.approval.notes}` : ''}

${trip.notes ? `
ADDITIONAL NOTES:
${trip.notes}
` : ''}

─────────────────────────────────────────────────────
This booking has been manually approved and executed.
Action required: Confirm and schedule with provider.
─────────────────────────────────────────────────────
  `.trim();
}

/**
 * Validate if a trip can be executed
 * 
 * @param {Object} tripObject - Trip to validate
 * @returns {Object} Validation result
 */
export function canExecuteTrip(tripObject) {
  const checks = [];
  let canExecute = true;
  
  // Check 1: Approval status
  if (!tripObject.approval || tripObject.approval.status !== "APPROVED") {
    checks.push({
      passed: false,
      check: "Approval Status",
      message: "Trip must be approved"
    });
    canExecute = false;
  } else {
    checks.push({
      passed: true,
      check: "Approval Status",
      message: "Trip is approved"
    });
  }
  
  // Check 2: Trip state
  if (tripObject.state !== "approved") {
    checks.push({
      passed: false,
      check: "Trip State",
      message: `Trip must be in 'approved' state (current: ${tripObject.state})`
    });
    canExecute = false;
  } else {
    checks.push({
      passed: true,
      check: "Trip State",
      message: "Trip is in approved state"
    });
  }
  
  // Check 3: Not already executed
  if (tripObject.execution?.status === "EXECUTED") {
    checks.push({
      passed: false,
      check: "Execution Status",
      message: "Trip already executed"
    });
    canExecute = false;
  } else {
    checks.push({
      passed: true,
      check: "Execution Status",
      message: "Trip not yet executed"
    });
  }
  
  return {
    canExecute,
    checks,
    message: canExecute ? "Trip ready for execution" : "Trip cannot be executed"
  };
}

/**
 * DAY 11: Execute trip automatically (if eligible and enabled)
 * 
 * This function is called by the system when automation is triggered.
 * It performs the same execution as manual, but logs it as automatic.
 * 
 * @param {Object} tripObject - The trip to auto-execute
 * @param {string} action - The action to execute
 * @returns {Object} Execution result
 */
export function executeAutomatically(tripObject, action = "SEND_BOOKING_REQUEST") {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 DAY 11 — AUTOMATIC EXECUTION TRIGGER");
  console.log("=".repeat(60));
  
  const config = getAutomationConfig();
  
  // CRITICAL: Check kill-switch first
  if (!config.enabled) {
    console.error("❌ AUTOMATION DISABLED GLOBALLY");
    console.log("   Falling back to manual execution mode");
    console.log("=".repeat(60) + "\n");
    
    return {
      success: false,
      error: "Automation is currently disabled",
      trip: tripObject,
      automationBlocked: true,
      reason: "AUTOMATION_DISABLED_GLOBALLY",
      requiresManualExecution: true
    };
  }
  
  // Check trip-specific eligibility
  const automationCheck = canExecuteAutomatically(tripObject, config);
  
  if (!automationCheck.canExecute) {
    console.error(`❌ AUTOMATION BLOCKED: ${automationCheck.reason}`);
    console.log(`   Explanation: ${automationCheck.explanation}`);
    console.log("   Manual execution required");
    console.log("=".repeat(60) + "\n");
    
    // Log automation block event
    logAutomationEvent({
      event: "auto_execution_blocked",
      tripId: tripObject.trip_id,
      reason: automationCheck.reason,
      explanation: automationCheck.explanation,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: automationCheck.explanation,
      trip: tripObject,
      automationBlocked: true,
      reason: automationCheck.reason,
      requiresManualExecution: true
    };
  }
  
  // Automation checks passed - proceed with automatic execution
  console.log("✅ AUTOMATION CHECKS PASSED");
  console.log(`   Reason: ${automationCheck.reason}`);
  console.log(`   Trip Eligible: ${automationCheck.tripEligible}`);
  
  // Log automation trigger event
  logAutomationEvent({
    event: "auto_execution_triggered",
    tripId: tripObject.trip_id,
    reason: automationCheck.reason,
    action: action,
    timestamp: new Date().toISOString()
  });
  
  // Call the standard execution function with "system" as executor
  const result = executeTrip(tripObject, action, "system");
  
  // Log automation result
  if (result.success) {
    logAutomationEvent({
      event: "auto_execution_succeeded",
      tripId: tripObject.trip_id,
      action: action,
      timestamp: new Date().toISOString()
    });
  } else {
    logAutomationEvent({
      event: "auto_execution_failed",
      tripId: tripObject.trip_id,
      action: action,
      error: result.error,
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    ...result,
    automatedExecution: true
  };
}

/**
 * DAY 11: Decide execution path (manual vs automatic)
 * 
 * This is the new entry point that branches based on automation eligibility.
 * Both paths call the same core execution handler - only the trigger differs.
 * 
 * @param {Object} tripObject - The trip to execute
 * @param {string} action - The action to execute
 * @returns {Object} Execution result
 */
export function decideExecutionPath(tripObject, action = "SEND_BOOKING_REQUEST") {
  console.log("\n" + "=".repeat(60));
  console.log("🔀 DAY 11 — EXECUTION PATH DECISION");
  console.log("=".repeat(60));
  
  const config = getAutomationConfig();
  
  // Check if trip has automation eligibility data
  if (!tripObject.automation) {
    console.log("ℹ️  No automation data - defaulting to manual execution");
    console.log("=".repeat(60) + "\n");
    return executeTrip(tripObject, action, "human");
  }
  
  // Check global automation flag
  if (!config.enabled) {
    console.log("ℹ️  Automation disabled globally - manual execution");
    console.log("=".repeat(60) + "\n");
    return executeTrip(tripObject, action, "human");
  }
  
  // Check trip eligibility
  if (tripObject.automation.eligible) {
    console.log("✅ Trip eligible for automation - attempting auto-execution");
    console.log(`   Reason: ${tripObject.automation.reason}`);
    console.log("=".repeat(60) + "\n");
    return executeAutomatically(tripObject, action);
  } else {
    console.log("ℹ️  Trip not eligible for automation - manual execution required");
    console.log(`   Reason: ${tripObject.automation.reason}`);
    console.log("=".repeat(60) + "\n");
    return executeTrip(tripObject, action, "human");
  }
}

/**
 * DAY 11: Log automation events
 * 
 * Centralized logging for all automation-related events.
 * This ensures audit trail for automation decisions and actions.
 * 
 * @param {Object} event - Event data to log
 */
function logAutomationEvent(event) {
  console.log("\n" + "─".repeat(60));
  console.log("📊 AUTOMATION EVENT LOG");
  console.log("─".repeat(60));
  console.log(`Event: ${event.event}`);
  console.log(`Trip ID: ${event.tripId}`);
  console.log(`Timestamp: ${event.timestamp}`);
  
  if (event.reason) {
    console.log(`Reason: ${event.reason}`);
  }
  
  if (event.explanation) {
    console.log(`Explanation: ${event.explanation}`);
  }
  
  if (event.action) {
    console.log(`Action: ${event.action}`);
  }
  
  if (event.error) {
    console.log(`Error: ${event.error}`);
  }
  
  console.log("─".repeat(60) + "\n");
  
  // In production, this would write to a database or logging service
  // For now, console logs serve as the audit trail
}
