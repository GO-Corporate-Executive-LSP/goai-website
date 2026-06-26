/**
 * Day 9: Human Approval UI Component
 * Day 10: Added manual execution trigger
 * 
 * This module provides UI functions for the human approval loop.
 * Add this to your page and connect to UI elements as needed.
 */

import { approveTrip, assessApprovalUrgency } from './approveTrip.js';
import { executeTrip, canExecuteTrip } from './executeTrip.js';

/**
 * Display the approval UI for a trip in review state
 * 
 * @param {Object} trip - Trip object in "review" state
 * @param {Object} uiElements - Object containing Wix UI element references
 *   {
 *     approveButton: $w('#approveButton'),
 *     adjustButton: $w('#adjustButton'),
 *     escalateButton: $w('#escalateButton'),
 *     statusText: $w('#statusText'),
 *     urgencyBadge: $w('#urgencyBadge'),
 *     notesInput: $w('#notesInput')
 *   }
 */
export function displayApprovalUI(trip, uiElements) {
    console.log("\n🎯 DISPLAYING APPROVAL UI");
    console.log("─".repeat(50));
    
    // Check if trip is ready for approval
    if (trip.state !== "review") {
        console.warn(`⚠️ Trip not in review state (current: ${trip.state})`);
        return;
    }
    
    // Assess urgency based on SENTINEL context
    try {
        const urgency = assessApprovalUrgency(trip);
        displayUrgencyIndicator(urgency, uiElements);
    } catch (error) {
        console.error("Failed to assess urgency:", error);
    }
    
    // Display trip summary
    displayTripSummary(trip);
    
    // Display SENTINEL context if available
    if (trip.sentinel) {
        displaySentinelContext(trip.sentinel);
    }
    
    console.log("\n📋 APPROVAL OPTIONS:");
    console.log("   ✅ Approve Trip");
    console.log("   ✏️ Request Adjustment");
    console.log("   🧍 Escalate to Concierge");
    console.log("─".repeat(50));
}

/**
 * Handle approve button click
 */
export function handleApprove(trip, notes = "", onSuccess, onError) {
    console.log("\n✅ APPROVING TRIP...");
    
    try {
        const result = approveTrip(trip, "APPROVED", notes);
        const urgency = assessApprovalUrgency(trip);
        
        console.log("✅ Trip approved successfully");
        console.log(`📌 ${result.nextAction}`);
        console.log(`🎯 Urgency: ${urgency.urgency}`);
        
        if (onSuccess) {
            onSuccess({ success: true, data: result, urgency });
        } else {
            displayApprovalSuccess(result, "APPROVED");
        }
    } catch (error) {
        console.error("❌ Approval request failed:", error);
        if (onError) {
            onError(error);
        }
    }
}

/**
 * Handle adjustment request button click
 */
export function handleRequestAdjustment(trip, notes = "", onSuccess, onError) {
    console.log("\n✏️ REQUESTING ADJUSTMENT...");
    
    try {
        const result = approveTrip(trip, "NEEDS_ADJUSTMENT", notes);
        
        console.log("✏️ Trip returned for adjustment");
        console.log(`📌 ${result.nextAction}`);
        
        if (onSuccess) {
            onSuccess({ success: true, data: result });
        } else {
            displayApprovalSuccess(result, "NEEDS_ADJUSTMENT");
        }
    } catch (error) {
        console.error("❌ Adjustment request failed:", error);
        if (onError) {
            onError(error);
        }
    }
}

/**
 * Handle escalate button click
 */
export function handleEscalate(trip, notes = "", onSuccess, onError) {
    console.log("\n🧍 ESCALATING TO CONCIERGE...");
    
    try {
        const result = approveTrip(trip, "ESCALATED", notes);
        
        console.log("🧍 Trip escalated to concierge");
        console.log(`📌 ${result.nextAction}`);
        
        if (onSuccess) {
            onSuccess({ success: true, data: result });
        } else {
            displayApprovalSuccess(result, "ESCALATED");
        }
    } catch (error) {
        console.error("❌ Escalation request failed:", error);
        if (onError) {
            onError(error);
        }
    }
}

/**
 * Display urgency indicator based on SENTINEL context
 */
function displayUrgencyIndicator(urgency, uiElements) {
    console.log(`\n🎯 APPROVAL URGENCY: ${urgency.urgency}`);
    console.log(`   Reason: ${urgency.reason}`);
    
    if (urgency.riskScore) {
        const emoji = {
            "LOW": "🟢",
            "MEDIUM": "🟡",
            "HIGH": "🔴"
        };
        console.log(`   ${emoji[urgency.riskScore] || "⚪"} Risk Score: ${urgency.riskScore}`);
    }
    
    if (urgency.guidance && urgency.guidance.length > 0) {
        console.log("\n   💡 SENTINEL Guidance:");
        urgency.guidance.forEach(item => {
            console.log(`      • ${item}`);
        });
    }
    
    // In a real UI, this would update badge colors/text
    // For now, we log the information
}

/**
 * Display trip summary for review
 */
function displayTripSummary(trip) {
    console.log("\n📋 TRIP SUMMARY:");
    console.log(`   Pickup: ${trip.pickup.address}`);
    console.log(`   Time: ${new Date(trip.pickup.datetime).toLocaleString()}`);
    console.log(`   Dropoff: ${trip.dropoff.address}`);
    console.log(`   Passengers: ${trip.passengers}`);
    console.log(`   Tier: ${trip.tier.name}`);
    
    if (trip.return?.pickup_datetime) {
        console.log(`   Return: ${new Date(trip.return.pickup_datetime).toLocaleString()}`);
    }
}

/**
 * Display SENTINEL context
 */
function displaySentinelContext(sentinel) {
    console.log("\n🛡️ SENTINEL™ CONTEXT:");
    
    const riskEmoji = {
        "LOW": "🟢",
        "MEDIUM": "🟡",
        "ELEVATED": "🔴"
    };
    
    console.log(`   ${riskEmoji[sentinel.riskScore] || "⚪"} Risk Level: ${sentinel.riskScore}`);
    
    if (sentinel.guidance && sentinel.guidance.length > 0) {
        console.log("   💡 Guidance:");
        sentinel.guidance.forEach(item => {
            console.log(`      • ${item}`);
        });
    }
}

/**
 * Display success message after approval decision
 */
function displayApprovalSuccess(result, decision) {
    console.log("\n" + "=".repeat(50));
    console.log("✅ APPROVAL DECISION RECORDED");
    console.log("=".repeat(50));
    console.log(`Decision: ${decision}`);
    console.log(`Next Action: ${result.nextAction}`);
    console.log(`Execution Required: ${result.requiresExecution ? "YES" : "NO (Day 9)"}`);
    console.log(`New Trip State: ${result.trip.state}`);
    
    if (result.trip.approval) {
        console.log(`\nApproval Metadata:`);
        console.log(`   Status: ${result.trip.approval.status}`);
        console.log(`   Decided By: ${result.trip.approval.decidedBy}`);
        console.log(`   Decided At: ${new Date(result.trip.approval.decidedAt).toLocaleString()}`);
        if (result.trip.approval.notes) {
            console.log(`   Notes: ${result.trip.approval.notes}`);
        }
    }
    
    console.log("=".repeat(50) + "\n");
}

// ============================================================================
// DAY 10 — MANUAL EXECUTION FUNCTIONS
// ============================================================================

/**
 * Display execution UI for an approved trip
 * Only shows if trip is approved and not yet executed
 * 
 * @param {Object} trip - Trip object in "approved" state
 * @param {Object} uiElements - Object containing Wix UI element references
 *   {
 *     executeButton: $w('#executeButton'),
 *     executionStatus: $w('#executionStatus'),
 *     executionNotes: $w('#executionNotes')
 *   }
 */
export function displayExecutionUI(trip, uiElements) {
    console.log("\n🚀 CHECKING EXECUTION ELIGIBILITY");
    console.log("─".repeat(50));
    
    try {
        const validation = canExecuteTrip(trip);
        
        console.log(`\n📋 Execution Status: ${validation.canExecute ? "✅ READY" : "❌ BLOCKED"}`);
        console.log(`Message: ${validation.message}`);
        
        if (validation.checks) {
            console.log("\nValidation Checks:");
            validation.checks.forEach(check => {
                const icon = check.passed ? "✅" : "❌";
                console.log(`   ${icon} ${check.check}: ${check.message}`);
            });
        }
        
        // In real UI, show/hide execute button based on validation
        if (validation.canExecute) {
            console.log("\n🎯 Execute button should be VISIBLE and ENABLED");
        } else {
            console.log("\n🚫 Execute button should be HIDDEN or DISABLED");
        }
        
        console.log("─".repeat(50));
    } catch (error) {
        console.error("Failed to check execution eligibility:", error);
    }
}

/**
 * Handle manual trip execution
 * Called when user clicks "Execute Trip (Manual)" button
 * 
 * @param {Object} trip - Trip to execute
 * @param {string} action - Action type (default: "SEND_BOOKING_REQUEST")
 * @param {string} notes - Optional execution notes
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export function handleExecuteTrip(trip, action = "SEND_BOOKING_REQUEST", notes = "", onSuccess, onError) {
    console.log("\n🚀 INITIATING MANUAL EXECUTION...");
    console.log("─".repeat(50));
    
    // Confirm execution intent
    console.log("⚠️ CONFIRMATION REQUIRED");
    console.log("This will trigger a real-world action:");
    console.log(`   Action: ${action}`);
    console.log(`   Trip: ${trip.trip_id}`);
    console.log("\nProceed with execution? (In real UI, show confirmation dialog)");
    
    // Execute trip
    try {
        const result = executeTrip(trip, action, "human");
        
        if (result.success) {
            console.log("\n✅ EXECUTION SUCCESSFUL");
            console.log("─".repeat(50));
            
            displayExecutionSuccess(result, trip);
            
            if (onSuccess) {
                onSuccess({ success: true, data: result, trip: result.trip });
            }
        } else {
            console.log("\n❌ EXECUTION FAILED OR BLOCKED");
            console.log("─".repeat(50));
            
            const errorMsg = result.error || "Unknown error";
            const reason = result.reason || "UNKNOWN";
            
            console.error(`Error: ${errorMsg}`);
            console.error(`Reason: ${reason}`);
            
            if (result.executionBlocked) {
                console.log("\n🚫 Execution was blocked by guardrails");
                console.log("This is expected behavior for safety");
            }
            
            if (result.requiresManualRecovery) {
                console.log("\n⚠️ MANUAL RECOVERY REQUIRED");
                console.log("Please investigate and resolve manually");
            }
            
            if (onError) {
                onError(errorMsg);
            } else {
                displayExecutionFailure(result || { error: errorMsg });
            }
        }
    } catch (error) {
        console.error("\n❌ EXECUTION REQUEST FAILED:", error);
        
        if (onError) {
            onError(error);
        } else {
            displayExecutionFailure({ error: error.message || error });
        }
    }
}

/**
 * Display execution success message
 */
function displayExecutionSuccess(result, trip) {
    console.log("\n" + "=".repeat(60));
    console.log("✅ TRIP EXECUTION COMPLETE");
    console.log("=".repeat(60));
    
    if (result.executionResult) {
        console.log(`\n📧 Action: ${result.trip.execution.action}`);
        console.log(`Result: ${result.executionResult.message}`);
        if (result.executionResult.details) {
            console.log(`Details: ${result.executionResult.details}`);
        }
    }
    
    if (result.trip.execution) {
        console.log(`\n📋 Execution Metadata:`);
        console.log(`   Status: ${result.trip.execution.status}`);
        console.log(`   Executed By: ${result.trip.execution.executedBy}`);
        console.log(`   Executed At: ${new Date(result.trip.execution.executedAt).toLocaleString()}`);
        console.log(`   Result: ${result.trip.execution.result}`);
        if (result.trip.execution.notes) {
            console.log(`   Notes: ${result.trip.execution.notes}`);
        }
    }
    
    console.log(`\n🎯 Trip State: ${result.trip.state}`);
    console.log("\n📌 NEXT STEPS:");
    console.log("   • Execution logged and auditable");
    console.log("   • No automatic retries");
    console.log("   • Manual follow-up if needed");
    
    console.log("\n" + "=".repeat(60) + "\n");
}

/**
 * Display execution failure message
 */
function displayExecutionFailure(result) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ EXECUTION FAILED");
    console.log("=".repeat(60));
    
    console.log(`\nError: ${result.error || "Unknown error"}`);
    
    if (result.trip?.execution) {
        console.log(`\n📋 Execution Metadata:`);
        console.log(`   Status: ${result.trip.execution.status}`);
        console.log(`   Executed At: ${new Date(result.trip.execution.executedAt).toLocaleString()}`);
        console.log(`   Result: ${result.trip.execution.result}`);
        if (result.trip.execution.notes) {
            console.log(`   Notes: ${result.trip.execution.notes}`);
        }
    }
    
    console.log("\n⚠️ REQUIRED ACTION:");
    console.log("   • Review failure details");
    console.log("   • Investigate root cause");
    console.log("   • Perform manual recovery");
    console.log("   • Do NOT retry automatically");
    
    console.log("\n" + "=".repeat(60) + "\n");
}
