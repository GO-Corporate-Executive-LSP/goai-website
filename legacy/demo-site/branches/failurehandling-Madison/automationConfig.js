/**
 * automationConfig.js — Day 11 Automation Configuration
 * 
 * Purpose: Global automation settings and kill-switch
 * Policy: Instant rollback capability without redeployment
 */

/**
 * AUTOMATION KILL-SWITCH
 * 
 * Set to false to immediately disable all automated execution.
 * When disabled:
 * 
 * - All trips require manual execution
 * - Eligibility is still evaluated (for future use)
 * - No code changes or redeployment needed
 * - Existing manual execution remains fully functional
 * 
 * IMPORTANT: This flag should be controlled outside the UI
 * in production environments (config file, environment variable, or admin panel)
 */
export const AUTOMATION_ENABLED = false; // Default: OFF for safety

/**
 * Automation configuration settings
 */
export const AUTOMATION_CONFIG = {
  // Global enable/disable flag
  enabled: AUTOMATION_ENABLED,
  
  // Version tracking
  version: "1.0.0",
  implementedDate: "2025-12-28",
  
  // Safety settings
  requiresApproval: true, // Always require human approval first
  requiresPaymentConfirmation: false, // Set to true when payment system is integrated
  
  // Execution settings
  executionDelay: 0, // Delay in seconds before auto-execution (0 = immediate)
  maxRetriesOnFailure: 0, // Number of retry attempts on failure (0 = no retries for now)
  
  // Logging and monitoring
  logAllDecisions: true, // Log every automation decision
  logExecutionAttempts: true, // Log every execution attempt
  
  // Tier-based settings (future expansion)
  allowedTiers: [
    "standard",
    "premium",
    "executive" // executive is allowed, but executive_protection is not
  ],
  
  // Risk-based settings
  maxAutomatedRiskLevel: "LOW", // Only LOW risk trips auto-execute
  blockOnSentinelFlags: true, // Block if SENTINEL raises any flags
  
  // Feature flags for gradual rollout
  features: {
    autoExecuteOnApproval: false, // Auto-execute immediately after approval
    scheduledExecution: false, // Schedule execution for future time
    batchExecution: false // Execute multiple trips together (future)
  }
};

/**
 * Check if automation is currently enabled
 * 
 * @returns {boolean} True if automation is enabled
 */
export function isAutomationEnabled() {
  return AUTOMATION_CONFIG.enabled;
}

/**
 * Get current automation configuration
 * 
 * @returns {Object} Current configuration object
 */
export function getAutomationConfig() {
  return { ...AUTOMATION_CONFIG };
}

/**
 * Log automation configuration status
 * Useful for debugging and auditing
 */
export function logAutomationStatus() {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 AUTOMATION CONFIGURATION STATUS");
  console.log("=".repeat(60));
  console.log(`Status: ${AUTOMATION_CONFIG.enabled ? "✅ ENABLED" : "⚠️ DISABLED"}`);
  console.log(`Version: ${AUTOMATION_CONFIG.version}`);
  console.log(`Implemented: ${AUTOMATION_CONFIG.implementedDate}`);
  console.log(`Max Risk Level: ${AUTOMATION_CONFIG.maxAutomatedRiskLevel}`);
  console.log(`Allowed Tiers: ${AUTOMATION_CONFIG.allowedTiers.join(", ")}`);
  console.log("=".repeat(60) + "\n");
}
