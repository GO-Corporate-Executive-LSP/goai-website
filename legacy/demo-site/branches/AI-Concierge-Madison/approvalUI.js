/**
 * Day 9: Human Approval UI Component
 * 
 * This module provides UI functions for the human approval loop.
 * Add this to your page and connect to UI elements as needed.
 */

import { submitApprovalDecision, getApprovalUrgency } from 'backend/tripService';

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
    getApprovalUrgency(trip)
        .then(response => {
            if (response.success) {
                const urgency = response.data;
                displayUrgencyIndicator(urgency, uiElements);
            }
        })
        .catch(error => {
            console.error("Failed to assess urgency:", error);
        });
    
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
    
    submitApprovalDecision(trip.trip_id, trip, "APPROVED", notes)
        .then(response => {
            if (response.success) {
                console.log("✅ Trip approved successfully");
                console.log(`📌 ${response.data.nextAction}`);
                
                // Display urgency context
                if (response.urgency) {
                    console.log(`🎯 Urgency: ${response.urgency.urgency}`);
                }
                
                if (onSuccess) {
                    onSuccess(response);
                } else {
                    displayApprovalSuccess(response.data, "APPROVED");
                }
            } else {
                console.error("❌ Approval failed:", response.error);
                if (onError) {
                    onError(response.error);
                }
            }
        })
        .catch(error => {
            console.error("❌ Approval request failed:", error);
            if (onError) {
                onError(error);
            }
        });
}

/**
 * Handle adjustment request button click
 */
export function handleRequestAdjustment(trip, notes = "", onSuccess, onError) {
    console.log("\n✏️ REQUESTING ADJUSTMENT...");
    
    submitApprovalDecision(trip.trip_id, trip, "NEEDS_ADJUSTMENT", notes)
        .then(response => {
            if (response.success) {
                console.log("✏️ Trip returned for adjustment");
                console.log(`📌 ${response.data.nextAction}`);
                
                if (onSuccess) {
                    onSuccess(response);
                } else {
                    displayApprovalSuccess(response.data, "NEEDS_ADJUSTMENT");
                }
            } else {
                console.error("❌ Adjustment request failed:", response.error);
                if (onError) {
                    onError(response.error);
                }
            }
        })
        .catch(error => {
            console.error("❌ Adjustment request failed:", error);
            if (onError) {
                onError(error);
            }
        });
}

/**
 * Handle escalate button click
 */
export function handleEscalate(trip, notes = "", onSuccess, onError) {
    console.log("\n🧍 ESCALATING TO CONCIERGE...");
    
    submitApprovalDecision(trip.trip_id, trip, "ESCALATED", notes)
        .then(response => {
            if (response.success) {
                console.log("🧍 Trip escalated to concierge");
                console.log(`📌 ${response.data.nextAction}`);
                
                if (onSuccess) {
                    onSuccess(response);
                } else {
                    displayApprovalSuccess(response.data, "ESCALATED");
                }
            } else {
                console.error("❌ Escalation failed:", response.error);
                if (onError) {
                    onError(error);
                }
            }
        })
        .catch(error => {
            console.error("❌ Escalation request failed:", error);
            if (onError) {
                onError(error);
            }
        });
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
