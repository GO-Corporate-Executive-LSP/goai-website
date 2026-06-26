/**
 * automationEligibility.js — Day 11 Automation Eligibility Rules + Day 12 Tier-Aware Behavior
 * 
 * Purpose: Deterministic evaluation of whether a trip qualifies for auto-execution
 * Policy: Transparent, reversible, auditable decisions
 */

import { getTierCapabilities, allowsAutoExecution } from './tierDefinitions.js';

/**
 * Evaluate if a trip is eligible for automated execution
 * 
 * This is the single source of truth for automation decisions.
 * Rules are:
 * - Deterministic (same input = same output)
 * - Readable (clear logic)
 * - Explainable (reason provided)
 * - Reversible (can always fall back to manual)
 * 
 * @param {Object} trip - The trip object to evaluate
 * @returns {Object} { eligible: boolean, reason: string }
 */
export function canAutoExecute(trip) {
  // Rule 1: Must be in approved state
  if (trip.state !== "approved") {
    return {
      eligible: false,
      reason: "TRIP_NOT_APPROVED",
      explanation: "Trip must be in approved state"
    };
  }

  // Rule 2: Must have approval metadata
  if (!trip.approval || trip.approval.status !== "APPROVED") {
    return {
      eligible: false,
      reason: "MISSING_APPROVAL_METADATA",
      explanation: "Trip lacks valid approval metadata"
    };
  }

  // Day 12: Rule 3 - Check tier capabilities (replaces hard-coded tier checks)
  if (trip.tier && trip.tier.name) {
    const tierCapabilities = getTierCapabilities(trip.tier.name);
    
    if (!tierCapabilities.autoExecutionAllowed) {
      return {
        eligible: false,
        reason: "TIER_MANUAL_ONLY",
        explanation: `${trip.tier.name.toUpperCase()} tier requires manual execution`
      };
    }
  }

  // Old Rule 3 (deprecated by tier system, kept for backward compatibility)
  if (trip.tier?.name === "executive_protection" || trip.tier?.name === "executive-protection") {
    return {
      eligible: false,
      reason: "EXECUTIVE_TIER_MANUAL_ONLY",
      explanation: "Executive protection trips require manual oversight"
    };
  }

  // Rule 4: SENTINEL elevated risk requires manual review
  if (trip.sentinel_snapshot?.risk_level === "elevated" || 
      trip.sentinel_snapshot?.risk_level === "high" ||
      trip.sentinel_snapshot?.risk_level === "ELEVATED" ||
      trip.sentinel_snapshot?.risk_level === "HIGH") {
    return {
      eligible: false,
      reason: "SENTINEL_ELEVATED_RISK",
      explanation: "SENTINEL flagged elevated risk requiring manual review"
    };
  }

  // Rule 5: SENTINEL medium risk with specific flags may block
  if (trip.sentinel?.riskScore === "MEDIUM" && trip.sentinel?.flags?.length > 0) {
    return {
      eligible: false,
      reason: "SENTINEL_FLAGGED_REVIEW",
      explanation: "SENTINEL flags require manual review"
    };
  }

  // Rule 6: Payment status check (if field exists)
  if (trip.paymentStatus && trip.paymentStatus !== "confirmed" && trip.paymentStatus !== "verified") {
    return {
      eligible: false,
      reason: "PAYMENT_NOT_CONFIRMED",
      explanation: "Payment must be confirmed for auto-execution"
    };
  }

  // Rule 7: Cannot auto-execute if already executed
  if (trip.execution?.status === "EXECUTED") {
    return {
      eligible: false,
      reason: "ALREADY_EXECUTED",
      explanation: "Trip has already been executed"
    };
  }

  // Rule 8: Escalated trips require manual handling
  if (trip.state === "escalated") {
    return {
      eligible: false,
      reason: "TRIP_ESCALATED",
      explanation: "Escalated trips require manual review"
    };
  }

  // All checks passed - eligible for auto-execution
  return {
    eligible: true,
    reason: "LOW_RISK_STANDARD_TIER",
    explanation: "Trip meets all criteria for automated execution"
  };
}

/**
 * Generate automation eligibility metadata for storage on trip object
 * 
 * @param {Object} trip - The trip to evaluate
 * @returns {Object} Automation metadata object
 */
export function evaluateAutomationEligibility(trip) {
  const eligibilityResult = canAutoExecute(trip);
  
  return {
    eligible: eligibilityResult.eligible,
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: "system",
    reason: eligibilityResult.reason,
    explanation: eligibilityResult.explanation
  };
}

/**
 * Check if automation is currently possible given system state
 * This combines trip eligibility with system-level flags
 * 
 * @param {Object} trip - The trip to check
 * @param {Object} config - System configuration (includes AUTOMATION_ENABLED)
 * @returns {Object} Combined automation assessment
 */
export function canExecuteAutomatically(trip, config) {
  // First check if automation is enabled globally
  if (!config.AUTOMATION_ENABLED) {
    return {
      canExecute: false,
      tripEligible: trip.automation?.eligible || false,
      reason: "AUTOMATION_DISABLED_GLOBALLY",
      explanation: "Automation is currently disabled at system level"
    };
  }

  // Then check trip-specific eligibility
  const tripEligible = trip.automation?.eligible || false;
  
  if (!tripEligible) {
    return {
      canExecute: false,
      tripEligible: false,
      reason: trip.automation?.reason || "NOT_ELIGIBLE",
      explanation: trip.automation?.explanation || "Trip does not meet automation criteria"
    };
  }

  // Both checks passed
  return {
    canExecute: true,
    tripEligible: true,
    reason: "ELIGIBLE_AND_ENABLED",
    explanation: "Trip is eligible and automation is enabled"
  };
}
