/**
 * approveTrip.js — Day 9 Human Approval Handler
 * 
 * Purpose: Handle human approval decisions for trips
 * Policy: No execution - logging and state tracking only
 */

/**
 * Process human approval decision for a trip
 * 
 * @param {Object} tripObject - The trip object to approve
 * @param {string} decision - "APPROVED" | "NEEDS_ADJUSTMENT" | "ESCALATED"
 * @param {string} notes - Optional notes from the decision maker
 * @returns {Object} Updated trip with approval metadata
 */
export function approveTrip(tripObject, decision, notes = "") {
  const validDecisions = ["APPROVED", "NEEDS_ADJUSTMENT", "ESCALATED"];
  
  // Validate decision
  if (!validDecisions.includes(decision)) {
    throw new Error(`Invalid decision: ${decision}. Must be one of: ${validDecisions.join(", ")}`);
  }
  
  // Validate trip is in review state
  if (tripObject.state !== "review") {
    throw new Error(`Trip must be in "review" state. Current state: ${tripObject.state}`);
  }
  
  // Create approval metadata
  const approvalData = {
    status: decision,
    decidedBy: "human",
    decidedAt: new Date().toISOString(),
    notes: notes || ""
  };
  
  // Log decision with SENTINEL context for audit trail
  const sentinelContext = tripObject.sentinel ? 
    `SENTINEL Risk: ${tripObject.sentinel.riskScore}` : 
    "SENTINEL: Not evaluated";
  
  console.log(`[APPROVAL] Trip ${tripObject.trip_id} - Decision: ${decision}`);
  console.log(`[APPROVAL] ${sentinelContext}`);
  console.log(`[APPROVAL] Decided at: ${approvalData.decidedAt}`);
  if (notes) {
    console.log(`[APPROVAL] Notes: ${notes}`);
  }
  
  // Update trip state based on decision
  let newState = tripObject.state;
  let nextAction = "";
  
  switch (decision) {
    case "APPROVED":
      newState = "approved";
      nextAction = "Trip approved and ready for execution (future milestone)";
      break;
      
    case "NEEDS_ADJUSTMENT":
      newState = "draft"; // Return to draft for modifications
      nextAction = "Trip returned to conversation for adjustments";
      break;
      
    case "ESCALATED":
      newState = "escalated";
      nextAction = "Trip escalated to concierge assistance";
      break;
  }
  
  // Build updated trip object
  const updatedTrip = {
    ...tripObject,
    state: newState,
    approval: approvalData
  };
  
  console.log(`[APPROVAL] New state: ${newState}`);
  
  return {
    success: true,
    trip: updatedTrip,
    nextAction,
    requiresExecution: false // Day 9: No execution yet
  };
}

/**
 * Check if a trip requires elevated approval attention
 * based on SENTINEL context
 * 
 * @param {Object} tripObject - The trip to check
 * @returns {Object} Approval urgency assessment
 */
export function assessApprovalUrgency(tripObject) {
  const sentinel = tripObject.sentinel;
  
  if (!sentinel) {
    return {
      urgency: "STANDARD",
      reason: "No SENTINEL evaluation available"
    };
  }
  
  const riskScore = sentinel.riskScore || "LOW";
  
  if (riskScore !== "LOW") {
    return {
      urgency: "ELEVATED",
      reason: `SENTINEL flagged ${riskScore} risk`,
      riskScore: riskScore,
      guidance: sentinel.guidance || []
    };
  }
  
  return {
    urgency: "STANDARD",
    reason: "Low risk trip",
    riskScore: "LOW"
  };
}
