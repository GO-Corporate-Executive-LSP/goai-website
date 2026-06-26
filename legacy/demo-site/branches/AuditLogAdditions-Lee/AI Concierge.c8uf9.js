// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world
// Day 9: Human Approval Loop Integration

import { submitTripForReview, submitApprovalDecision } from 'backend/tripService';

$w.onReady(function () {
    
    // STEP 9: Test Scenario 1 - VALID TRIP (LOW RISK - daytime pickup)
    const validTrip = {
        trip_id: "",
        user_id: "",
        state: "draft",
        
        pickup: {
            address: "123 Main St, Charlotte NC",
            datetime: "2025-01-20T14:30:00",  // 2:30 PM - LOW risk
            timezone: "America/New_York"
        },
        
        dropoff: {
            address: "Steak 48, Charlotte NC"
        },
        
        return: {
            pickup_datetime: "2025-01-20T18:00:00",
            estimated_home_arrival: ""
        },
        
        passengers: 2,
        luggage: 0,
        
        tier: {
            name: "GO_BIZZ",
            vehicle_class: ""
        },
        
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        
        notes: ""
    };
    
    // STEP 9: Test Scenario 1B - VALID TRIP (MEDIUM RISK - late night pickup)
    const validTripMediumRisk = {
        trip_id: "",
        user_id: "",
        state: "draft",
        
        pickup: {
            address: "123 Main St, Charlotte NC",
            datetime: "2025-01-20T23:30:00",  // 11:30 PM - MEDIUM risk
            timezone: "America/New_York"
        },
        
        dropoff: {
            address: "Late Night Restaurant, Charlotte NC"
        },
        
        return: {
            pickup_datetime: "2025-01-21T02:00:00",
            estimated_home_arrival: ""
        },
        
        passengers: 2,
        luggage: 0,
        
        tier: {
            name: "GO_BIZZ",
            vehicle_class: ""
        },
        
        sentinel_snapshot: {
            risk_level: "green",
            risk_note: ""
        },
        
        notes: ""
    };
    
    // STEP 9: Test Scenario 2 - INVALID TRIP (missing data)
    const invalidTrip = {
        trip_id: "",
        user_id: "",
        state: "draft",
        
        pickup: {
            address: "",  // ❌ Missing address
            datetime: "",  // ❌ Missing datetime
            timezone: "America/New_York"
        },
        
        dropoff: {
            address: ""  // ❌ Missing address
        },
        
        return: {
            pickup_datetime: "",  // ❌ Missing
            estimated_home_arrival: ""
        },
        
        passengers: 0,  // ❌ Invalid (must be >= 1)
        luggage: 0,
        
        tier: {
            name: "",  // ❌ Missing tier
            vehicle_class: ""
        },
        
        sentinel_snapshot: {
            risk_level: "",  // ❌ Missing
            risk_note: ""
        },
        
        notes: ""
    };

    // Choose which scenario to test:
    console.log("\n=== TESTING SCENARIO 1: VALID TRIP (LOW RISK) ===\n");
    testTrip(validTrip, "SCENARIO 1: VALID TRIP - LOW RISK");
    
    console.log("\n=== TESTING SCENARIO 1B: VALID TRIP (MEDIUM RISK) ===\n");
    testTrip(validTripMediumRisk, "SCENARIO 1B: VALID TRIP - MEDIUM RISK");
    
    console.log("\n=== TESTING SCENARIO 2: INVALID TRIP ===\n");
    testTrip(invalidTrip, "SCENARIO 2: INVALID TRIP");
});

function testTrip(tripObject, scenarioName) {
    console.log(`🧪 ${scenarioName}`);
    console.log("Trip Object:", tripObject);
    console.log("🔄 Sending to backend...");
    
    submitTripForReview(tripObject)
        .then(response => {
            console.log("✅ Backend response:", response);
            
            if (response.success) {
                const { status, nextState, errors } = response.data;
                console.log(`📊 Status: ${status}`);
                console.log(`🎯 Next State: ${nextState}`);
                
                if (errors) {
                    console.log(`⚠️ Errors found:`, errors);
                }
                
                handleBackendResponse(response.data);
            } else {
                console.error("❌ Backend error:", response.error);
            }
        })
        .catch(error => {
            console.error("❌ Failed to call backend:", error);
        });
}

function handleBackendResponse(result) {
    console.log("\n🎯 HANDLING RESPONSE:\n");
    
    if (result.status === "valid") {
        console.log("✅ Trip is VALID");
        console.log("📋 Ready for Review Card");
        console.log("Trip:", result.trip);
        
        // Day 8: Display SENTINEL context if available
        if (result.trip?.sentinel) {
            displaySentinelContext(result.trip.sentinel);
        } else {
            console.log("ℹ️ No SENTINEL data available (non-blocking)");
        }
        
        // Day 9: Display Approval UI when trip reaches review state
        if (result.trip.state === "review") {
            displayApprovalUI(result.trip);
            
            // Store trip for testing (use globalThis to avoid TypeScript errors)
            globalThis.currentTripForApproval = result.trip;
            console.log("\n💡 Trip ready for approval. Test with:");
            console.log("   testApprove()");
            console.log("   testAdjustment()");
            console.log("   testEscalate()");
        }
        
        // STEP 6: Show Review Card (next)
        
    } else if (result.status === "invalid") {
        console.log("⚠️ Trip is INVALID");
        console.log("❌ Errors:", result.errors);
        console.log("💬 Should ask clarifying questions");
        // Ask clarifying questions based on errors
        
    } else if (result.nextState === "HUMAN_OVERRIDE") {
        console.log("🧍 HUMAN OVERRIDE NEEDED");
        console.log("📞 Offer concierge assistance");
        // Show "Talk to Concierge" option
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
}

/**
 * Day 9: Display approval UI for trip in review state
 */
function displayApprovalUI(trip) {
    console.log("\n🎯 DISPLAYING APPROVAL UI");
    console.log("─".repeat(50));
    
    // Display trip summary
    console.log("\n📋 TRIP SUMMARY:");
    console.log(`   Pickup: ${trip.pickup.address}`);
    console.log(`   Time: ${new Date(trip.pickup.datetime).toLocaleString()}`);
    console.log(`   Dropoff: ${trip.dropoff.address}`);
    console.log(`   Passengers: ${trip.passengers}`);
    console.log(`   Tier: ${trip.tier.name}`);
    
    if (trip.return?.pickup_datetime) {
        console.log(`   Return: ${new Date(trip.return.pickup_datetime).toLocaleString()}`);
    }
    
    // Display SENTINEL context if available
    if (trip.sentinel) {
        const riskEmoji = {
            "LOW": "🟢",
            "MEDIUM": "🟡",
            "ELEVATED": "🔴"
        };
        
        console.log("\n🛡️ SENTINEL™ CONTEXT:");
        console.log(`   ${riskEmoji[trip.sentinel.riskScore] || "⚪"} Risk Level: ${trip.sentinel.riskScore}`);
        
        if (trip.sentinel.guidance && trip.sentinel.guidance.length > 0) {
            console.log("   💡 Guidance:");
            trip.sentinel.guidance.forEach(item => {
                console.log(`      • ${item}`);
            });
        }
    }
    
    console.log("\n📋 APPROVAL OPTIONS:");
    console.log("   ✅ Approve Trip");
    console.log("   ✏️ Request Adjustment");
    console.log("   🧍 Escalate to Concierge");
    console.log("─".repeat(50));
}

// Day 9: Test functions for approval flow (callable from console)
globalThis.testApprove = function(notes = "Testing approval flow") {
    if (!globalThis.currentTripForApproval) {
        console.error("❌ No trip ready for approval. Run a valid trip test first.");
        return;
    }
    
    const trip = globalThis.currentTripForApproval;
    console.log("\n✅ APPROVING TRIP...");
    
    submitApprovalDecision(trip.trip_id, trip, "APPROVED", notes)
        .then(response => {
            if (response.success) {
                console.log("✅ Trip approved successfully");
                console.log(`📌 ${response.data.nextAction}`);
                
                if (response.urgency) {
                    console.log(`🎯 Urgency: ${response.urgency.urgency}`);
                }
                
                displayApprovalSuccess(response.data, "APPROVED");
            } else {
                console.error("❌ Approval failed:", response.error);
            }
        })
        .catch(error => {
            console.error("❌ Approval request failed:", error);
        });
};

globalThis.testAdjustment = function(notes = "Need to change pickup time") {
    if (!globalThis.currentTripForApproval) {
        console.error("❌ No trip ready for approval. Run a valid trip test first.");
        return;
    }
    
    const trip = globalThis.currentTripForApproval;
    console.log("\n✏️ REQUESTING ADJUSTMENT...");
    
    submitApprovalDecision(trip.trip_id, trip, "NEEDS_ADJUSTMENT", notes)
        .then(response => {
            if (response.success) {
                console.log("✏️ Trip returned for adjustment");
                console.log(`📌 ${response.data.nextAction}`);
                displayApprovalSuccess(response.data, "NEEDS_ADJUSTMENT");
            } else {
                console.error("❌ Adjustment request failed:", response.error);
            }
        })
        .catch(error => {
            console.error("❌ Adjustment request failed:", error);
        });
};

globalThis.testEscalate = function(notes = "Complex itinerary, needs concierge") {
    if (!globalThis.currentTripForApproval) {
        console.error("❌ No trip ready for approval. Run a valid trip test first.");
        return;
    }
    
    const trip = globalThis.currentTripForApproval;
    console.log("\n🧍 ESCALATING TO CONCIERGE...");
    
    submitApprovalDecision(trip.trip_id, trip, "ESCALATED", notes)
        .then(response => {
            if (response.success) {
                console.log("🧍 Trip escalated to concierge");
                console.log(`📌 ${response.data.nextAction}`);
                displayApprovalSuccess(response.data, "ESCALATED");
            } else {
                console.error("❌ Escalation failed:", response.error);
            }
        })
        .catch(error => {
            console.error("❌ Escalation request failed:", error);
        });
};

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

/**
 * Day 8: Display SENTINEL™ Lite Security Context
 * Non-alarming, informational display of trip risk context
 */
function displaySentinelContext(sentinel) {
    console.log("\n🛡️ TRAVEL CONTEXT (SENTINEL™ Lite):");
    console.log("─".repeat(40));
    
    const riskEmoji = {
        "LOW": "🟢",
        "MEDIUM": "🟡",
        "ELEVATED": "🔴"
    };
    
    console.log(`Risk Level: ${riskEmoji[sentinel.riskScore] || "⚪"} ${sentinel.riskScore}`);
    
    if (sentinel.guidance && sentinel.guidance.length > 0) {
        console.log("\n💡 Guidance:");
        sentinel.guidance.forEach(item => {
            console.log(`   • ${item}`);
        });
    }
    
    if (sentinel.flags && sentinel.flags.length > 0) {
        console.log("\n⚠️ Flags:");
        sentinel.flags.forEach(flag => {
            console.log(`   • ${flag}`);
        });
    }
    
    console.log(`\n📅 Evaluated: ${new Date(sentinel.evaluatedAt).toLocaleString()}`);
    console.log("─".repeat(40));
    
    // In a real UI, this would render a card component
    // For now, we're logging to demonstrate the integration
}