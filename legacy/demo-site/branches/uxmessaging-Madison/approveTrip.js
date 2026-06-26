/**
 * approveTrip.js — Day 9 Human Approval Handler + Day 11 Automation Eligibility + Day 12 Tier-Aware
 * 
 * Purpose: Handle human approval decisions for trips and evaluate automation eligibility
 * Policy: No execution - logging and state tracking only
 */

import { evaluateAutomationEligibility } from './automationEligibility.js';
import { getTierCapabilities, requiresManualApproval } from './tierDefinitions.js';

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
  
  // Day 12: Get tier capabilities for logging
  const tierCapabilities = tripObject.tier ? getTierCapabilities(tripObject.tier.name) : null;
  
  // Create approval metadata
  const approvalData = {
    status: decision,
    decidedBy: "human",
    decidedAt: new Date().toISOString(),
    notes: notes || ""
  };
  
  // Log decision with SENTINEL and Tier context for audit trail
  const sentinelContext = tripObject.sentinel ? 
    `SENTINEL Risk: ${tripObject.sentinel.riskScore}` : 
    "SENTINEL: Not evaluated";
  
  const tierContext = tripObject.tier ? 
    `Tier: ${tripObject.tier.name.toUpperCase()}` : 
    "Tier: Not set";
  
  console.log(`[APPROVAL] Trip ${tripObject.trip_id} - Decision: ${decision}`);
  console.log(`[APPROVAL] ${sentinelContext}`);
  console.log(`[APPROVAL] ${tierContext}`);
  console.log(`[APPROVAL] Decided at: ${approvalData.decidedAt}`);
  if (notes) {
    console.log(`[APPROVAL] Notes: ${notes}`);
  }
  
  // Day 12: Log tier capabilities applied
  if (tierCapabilities) {
    console.log(`[APPROVAL] Tier capabilities: auto-execution ${tierCapabilities.autoExecutionAllowed ? "allowed" : "blocked"}, admin approval ${tierCapabilities.requiresAdminApproval ? "required" : "optional"}`);
  }
  
  // Update trip state based on decision
  let newState = tripObject.state;
  let nextAction = "";
  let automationData = null;
  
  switch (decision) {
    case "APPROVED":
      newState = "approved";
      nextAction = "Trip approved and ready for execution";
      
      // Day 11: Evaluate automation eligibility when trip is approved
      automationData = evaluateAutomationEligibility({
        ...tripObject,
        state: newState,
        approval: approvalData
      });
      
      console.log(`[AUTOMATION] Eligibility evaluated: ${automationData.eligible ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}`);
      console.log(`[AUTOMATION] Reason: ${automationData.reason}`);
      console.log(`[AUTOMATION] ${automationData.explanation}`);
      
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
  
  // Add automation data if evaluated (only for APPROVED trips)
  if (automationData) {
    updatedTrip.automation = automationData;
  }
  
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
 * based on SENTINEL context and tier
 * 
 * @param {Object} tripObject - The trip to check
 * @returns {Object} Approval urgency assessment
 */
export function assessApprovalUrgency(tripObject) {
  const sentinel = tripObject.sentinel;
  const tierCapabilities = tripObject.tier ? getTierCapabilities(tripObject.tier.name) : null;
  
  // Day 12: Executive tier always requires elevated approval
  if (tierCapabilities && tierCapabilities.autoEscalateOnRisk && tripObject.tier.name === "executive") {
    return {
      urgency: "ELEVATED",
      reason: "Executive tier requires enhanced approval process",
      tier: tripObject.tier.name,
      riskScore: sentinel?.riskScore || "UNKNOWN"
    };
  }
  
  if (!sentinel) {
    return {
      urgency: "STANDARD",
      reason: "No SENTINEL evaluation available"
    };
  }
  
  const riskScore = sentinel.riskScore || "LOW";
  
  // Day 12: Tier-aware escalation
  if (riskScore !== "LOW") {
    const shouldAutoEscalate = tierCapabilities?.autoEscalateOnRisk || false;
    
    return {
      urgency: shouldAutoEscalate ? "ELEVATED" : "STANDARD",
      reason: `SENTINEL flagged ${riskScore} risk${shouldAutoEscalate ? " - tier requires escalation" : ""}`,
      riskScore: riskScore,
      tier: tripObject.tier?.name,
      guidance: sentinel.guidance || []
    };
  }
  
  return {
    urgency: "STANDARD",
    reason: "Low risk trip",
    riskScore: "LOW",
    tier: tripObject.tier?.name
  };
}
