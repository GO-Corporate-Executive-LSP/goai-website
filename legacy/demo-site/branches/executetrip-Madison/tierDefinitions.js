/**
 * tierDefinitions.js — Day 12 Tier-Aware Behavior & Escalation Logic
 * 
 * Purpose: Single source of truth for user tiers and their capabilities
 * Policy: Descriptive (not aspirational), read-only at runtime, no marketing logic
 * 
 * This file defines:
 * 1. Tier constants (for consistency)
 * 2. Tier capability maps (permissions, not behavior)
 * 3. Tier resolution logic (how to determine tier)
 */

/**
 * TIER CONSTANTS
 * Use these throughout the codebase instead of magic strings
 */
export const TIERS = {
  BASIC: "basic",
  CORPORATE: "corporate",
  EXECUTIVE: "executive"
};

/**
 * TIER CAPABILITIES
 * Defines what each tier can do (permissions), not how they do it (behavior)
 * 
 * These capabilities plug into existing Day 11 logic without creating new code paths
 */
export const TIER_CAPABILITIES = {
  [TIERS.BASIC]: {
    // SENTINEL configuration
    sentinelDepth: "lite",           // Use lightweight SENTINEL checks
    
    // Automation behavior
    autoExecutionAllowed: true,      // Can use auto-execution if eligible
    
    // Approval requirements
    requiresAdminApproval: true,     // Always needs admin approval
    
    // Escalation behavior
    autoEscalateOnRisk: false,       // Don't auto-escalate (admin reviews anyway)
    
    // Logging/audit
    auditLevel: "standard"           // Standard logging
  },
  
  [TIERS.CORPORATE]: {
    // SENTINEL configuration
    sentinelDepth: "expanded",       // More comprehensive checks
    
    // Automation behavior
    autoExecutionAllowed: true,      // Can use auto-execution if eligible
    
    // Approval requirements
    requiresAdminApproval: false,    // Can auto-approve if low risk
    
    // Escalation behavior
    autoEscalateOnRisk: true,        // Auto-escalate on medium+ risk
    
    // Logging/audit
    auditLevel: "enhanced"           // More detailed logging
  },
  
  [TIERS.EXECUTIVE]: {
    // SENTINEL configuration
    sentinelDepth: "full",           // Maximum intelligence depth
    
    // Automation behavior
    autoExecutionAllowed: false,     // Never auto-execute (manual only)
    
    // Approval requirements
    requiresAdminApproval: true,     // Always needs admin approval
    
    // Escalation behavior
    autoEscalateOnRisk: true,        // Always escalate on any risk
    
    // Logging/audit
    auditLevel: "maximum"            // Full audit trail
  }
};

/**
 * Get tier capabilities for a given tier name
 * @param {string} tierName - The tier name (e.g., "basic", "corporate", "executive")
 * @returns {Object} The tier capabilities object
 */
export function getTierCapabilities(tierName) {
  const normalizedTier = tierName?.toLowerCase();
  
  // Default to basic tier if unknown
  if (!TIER_CAPABILITIES[normalizedTier]) {
    console.warn(`[TIER] Unknown tier "${tierName}", defaulting to BASIC`);
    return TIER_CAPABILITIES[TIERS.BASIC];
  }
  
  return TIER_CAPABILITIES[normalizedTier];
}

/**
 * Resolve tier from user profile or trip data
 * This is a placeholder - in production, this would query user data
 * 
 * @param {Object} context - Contains user_id, existing tier data, etc.
 * @returns {Object} Tier object with name, source, locked flag
 */
export function resolveTierForTrip(context) {
  // For now, use tier from context if provided, otherwise default to basic
  // In production, this would query user profile/subscription
  
  const tierName = context.tier?.name || context.userTier || TIERS.BASIC;
  const normalizedTier = tierName.toLowerCase();
  
  // Ensure tier is valid
  const validTier = Object.values(TIERS).includes(normalizedTier) 
    ? normalizedTier 
    : TIERS.BASIC;
  
  return {
    name: validTier,
    source: context.tier?.source || "user_profile",
    locked: true  // Tier cannot change mid-trip
  };
}

/**
 * Check if a tier requires manual approval
 * @param {string} tierName - The tier name
 * @returns {boolean} True if manual approval is required
 */
export function requiresManualApproval(tierName) {
  const capabilities = getTierCapabilities(tierName);
  return capabilities.requiresAdminApproval;
}

/**
 * Check if a tier allows auto-execution
 * @param {string} tierName - The tier name
 * @returns {boolean} True if auto-execution is allowed
 */
export function allowsAutoExecution(tierName) {
  const capabilities = getTierCapabilities(tierName);
  return capabilities.autoExecutionAllowed;
}

/**
 * Get the appropriate SENTINEL depth for a tier
 * @param {string} tierName - The tier name
 * @returns {string} SENTINEL depth level ("lite", "expanded", "full")
 */
export function getSentinelDepth(tierName) {
  const capabilities = getTierCapabilities(tierName);
  return capabilities.sentinelDepth;
}

/**
 * Log tier evaluation for audit trail
 * @param {Object} trip - The trip object
 */
export function logTierEvaluation(trip) {
  if (!trip.tier) {
    console.warn("[TIER] No tier information on trip");
    return;
  }
  
  const capabilities = getTierCapabilities(trip.tier.name);
  
  console.log("\n" + "─".repeat(60));
  console.log("🎯 TIER EVALUATION");
  console.log("─".repeat(60));
  console.log(`   Tier: ${trip.tier.name.toUpperCase()}`);
  console.log(`   Source: ${trip.tier.source}`);
  console.log(`   Locked: ${trip.tier.locked}`);
  console.log("\n   Capabilities Applied:");
  console.log(`   • SENTINEL Depth: ${capabilities.sentinelDepth}`);
  console.log(`   • Auto-Execution: ${capabilities.autoExecutionAllowed ? "✅ Allowed" : "❌ Not Allowed"}`);
  console.log(`   • Admin Approval: ${capabilities.requiresAdminApproval ? "✅ Required" : "❌ Not Required"}`);
  console.log(`   • Auto-Escalate on Risk: ${capabilities.autoEscalateOnRisk ? "✅ Yes" : "❌ No"}`);
  console.log(`   • Audit Level: ${capabilities.auditLevel}`);
  console.log("─".repeat(60) + "\n");
}
