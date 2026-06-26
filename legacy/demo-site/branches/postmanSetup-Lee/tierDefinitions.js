/**
 * tierDefinitions.js — Sprint Day 4: Tier Logic & Capacity Rules
 * 
 * Purpose: Single source of truth for user tiers and their capabilities
 * Policy: Descriptive (not aspirational), read-only at runtime, no marketing logic
 * 
 * This file defines:
 * 1. Tier constants (for consistency)
 * 2. Tier capability maps (permissions, not behavior)
 * 3. Tier capacity constraints (passengers, luggage)
 * 4. Tier recommendation logic
 * 5. Tier enforcement rules
 * 6. Tier resolution logic (how to determine tier)
 * 
 * Day 4 Goal: "Make sure the system always recommends, enforces, and understands
 *              the correct service tier based on the trip."
 */

// ═══════════════════════════════════════════════════════════════════════════
// TIER CONSTANTS (Internal Vocabulary)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TIER CONSTANTS
 * Use these throughout the codebase instead of magic strings
 * 
 * Internal names stay stable — display names can change later
 * 
 * Marketing Names (examples):
 * - BASIC → "GO Basic"
 * - CORPORATE → "GO Bizz" 
 * - EXECUTIVE → "G-Klub"
 */
export const TIERS = {
  BASIC: "basic",
  CORPORATE: "corporate",
  EXECUTIVE: "executive"
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER CAPACITY CONSTRAINTS (Day 4 Core Work)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tier capacity constraints define hard limits for each service tier
 * These are operational guardrails, not vehicle locks
 */
export const TIER_CAPACITY = {
  [TIERS.BASIC]: {
    maxPassengers: 4,
    maxLuggage: 2,
    description: "Standard sedan or equivalent"
  },
  
  [TIERS.CORPORATE]: {
    maxPassengers: 6,
    maxLuggage: 4,
    description: "SUV or premium vehicle"
  },
  
  [TIERS.EXECUTIVE]: {
    maxPassengers: 8,
    maxLuggage: 6,
    description: "Luxury SUV or executive vehicle"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER CAPABILITIES (Permissions & Behavior)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TIER CAPABILITIES
 * Defines what each tier can do (permissions), not how they do it (behavior)
 * 
 * These capabilities plug into existing Day 11 logic without creating new code paths
 */
export const TIER_CAPABILITIES = {
  [TIERS.BASIC]: {
    // Capacity (from TIER_CAPACITY)
    maxPassengers: 4,
    maxLuggage: 2,
    
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
    // Capacity (from TIER_CAPACITY)
    maxPassengers: 6,
    maxLuggage: 4,
    
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
    // Capacity (from TIER_CAPACITY)
    maxPassengers: 8,
    maxLuggage: 6,
    
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

// ═══════════════════════════════════════════════════════════════════════════
// TIER RECOMMENDATION RULES (Day 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recommend a tier based on trip parameters
 * 
 * IMPORTANT: Recommendation ≠ Requirement
 * This suggests optimal tier, but user can choose differently
 * (subject to enforcement rules)
 * 
 * @param {Object} trip - Trip object with passengers, luggage, etc.
 * @returns {Object} Recommendation result
 */
export function recommendTier(trip) {
  const passengers = trip.passengers || 1;
  const luggage = trip.luggage || 0;
  
  // Rule 1: If passengers > 6 → EXECUTIVE required
  if (passengers > 6) {
    return {
      tier: TIERS.EXECUTIVE,
      reason: "PASSENGER_CAPACITY",
      message: "8+ passengers require Executive tier",
      required: true
    };
  }
  
  // Rule 2: If passengers > 4 → CORPORATE recommended
  if (passengers > 4) {
    return {
      tier: TIERS.CORPORATE,
      reason: "PASSENGER_CAPACITY",
      message: "5-6 passengers work best with Corporate tier",
      required: false
    };
  }
  
  // Rule 3: If luggage > 4 → CORPORATE recommended
  if (luggage > 4) {
    return {
      tier: TIERS.CORPORATE,
      reason: "LUGGAGE_CAPACITY",
      message: "Heavy luggage requires Corporate or Executive tier",
      required: false
    };
  }
  
  // Rule 4: If passengers + luggage > 5 → CORPORATE recommended
  if (passengers + luggage > 5) {
    return {
      tier: TIERS.CORPORATE,
      reason: "COMBINED_CAPACITY",
      message: "Combined passenger and luggage count suggests Corporate tier",
      required: false
    };
  }
  
  // Rule 5: Late night trips (optional future rule)
  // if (isLateNight(trip.pickup.datetime)) {
  //   return { tier: TIERS.CORPORATE, reason: "LATE_NIGHT", required: false };
  // }
  
  // Default: BASIC is fine
  return {
    tier: TIERS.BASIC,
    reason: "STANDARD_TRIP",
    message: "Basic tier is suitable for this trip",
    required: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER ENFORCEMENT RULES (Day 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate if a tier can accommodate the trip requirements
 * 
 * These are HARD constraints — validation fails if violated
 * 
 * @param {Object} trip - Trip object
 * @returns {Object} Validation result { valid, errors[] }
 */
export function validateTierCapacity(trip) {
  if (!trip.tier || !trip.tier.name) {
    // Tier not yet selected — skip capacity validation
    return { valid: true, errors: [] };
  }
  
  const tierName = trip.tier.name;
  const capacity = TIER_CAPACITY[tierName];
  const errors = [];
  
  if (!capacity) {
    errors.push({
      type: "INVALID",
      code: "UNKNOWN_TIER",
      field: "tier.name",
      message: "Please select a valid service tier."
    });
    return { valid: false, errors };
  }
  
  // Check passenger capacity
  if (trip.passengers > capacity.maxPassengers) {
    errors.push({
      type: "INVALID",
      code: "TIER_CAPACITY_EXCEEDED",
      field: "passengers",
      message: `The ${tierName} tier supports up to ${capacity.maxPassengers} passengers. Please select a higher tier or reduce passengers.`
    });
  }
  
  // Check luggage capacity
  if (trip.luggage > capacity.maxLuggage) {
    errors.push({
      type: "INVALID",
      code: "LUGGAGE_CAPACITY_EXCEEDED",
      field: "luggage",
      message: `The ${tierName} tier supports up to ${capacity.maxLuggage} pieces of luggage. Please select a higher tier or reduce luggage.`
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a specific tier can accommodate trip requirements
 * @param {string} tierName - Tier to check
 * @param {number} passengers - Number of passengers
 * @param {number} luggage - Number of luggage pieces
 * @returns {boolean} True if tier can accommodate
 */
export function canTierAccommodate(tierName, passengers, luggage = 0) {
  const capacity = TIER_CAPACITY[tierName];
  if (!capacity) return false;
  
  return passengers <= capacity.maxPassengers && 
         luggage <= capacity.maxLuggage;
}

/**
 * Get list of valid tiers for trip requirements
 * @param {number} passengers - Number of passengers
 * @param {number} luggage - Number of luggage pieces
 * @returns {Array} Array of valid tier names
 */
export function getValidTiers(passengers, luggage = 0) {
  return Object.values(TIERS).filter(tierName => 
    canTierAccommodate(tierName, passengers, luggage)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER → VALIDATION INTERACTION (Day 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine if tier is required based on trip state
 * 
 * Rule: Tier is optional in "draft", required in "booking_ready" and beyond
 * 
 * @param {string} tripState - Current trip state
 * @returns {boolean} True if tier is required
 */
export function isTierRequired(tripState) {
  const statesRequiringTier = [
    "booking_ready",
    "pending_approval",
    "approved",
    "booked",
    "in_progress",
    "completed"
  ];
  
  return statesRequiringTier.includes(tripState);
}

/**
 * Validate tier for current trip state
 * @param {Object} trip - Trip object
 * @returns {Object} Validation result
 */
export function validateTierForState(trip) {
  const errors = [];
  
  // Check if tier is required for current state
  if (isTierRequired(trip.state)) {
    if (!trip.tier || !trip.tier.name || trip.tier.name.trim() === "") {
      errors.push({
        type: "INVALID",
        code: "MISSING_TIER",
        field: "tier.name",
        message: "A service tier must be selected before booking."
      });
      return { valid: false, errors };
    }
    
    // Validate tier is in allowed set
    const validTiers = Object.values(TIERS);
    if (!validTiers.includes(trip.tier.name.toLowerCase())) {
      errors.push({
        type: "INVALID",
        code: "INVALID_TIER",
        field: "tier.name",
        message: "Please select a valid service tier."
      });
      return { valid: false, errors };
    }
  }
  
  return { valid: true, errors: [] };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER → SENTINEL INTERACTION (Day 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get SENTINEL intelligence depth based on tier
 * 
 * Rule: Tier gates intelligence depth, not booking permission
 * 
 * BASIC → lite: basic risk indicator
 * CORPORATE → expanded: comprehensive context
 * EXECUTIVE → full: maximum intelligence depth
 * 
 * @param {string} tierName - The tier name
 * @returns {string} SENTINEL depth level ("lite", "expanded", "full")
 */
export function getSentinelDepth(tierName) {
  const capabilities = getTierCapabilities(tierName);
  return capabilities.sentinelDepth;
}

/**
 * Get SENTINEL configuration for a tier
 * @param {string} tierName - The tier name
 * @returns {Object} SENTINEL configuration
 */
export function getSentinelConfig(tierName) {
  const depth = getSentinelDepth(tierName);
  
  return {
    depth,
    features: {
      basicRiskCheck: true,
      routeAnalysis: depth !== "lite",
      historicalPatterns: depth === "full",
      predictiveInsights: depth === "full",
      realTimeMonitoring: depth === "full"
    },
    displayLevel: {
      lite: "risk_indicator_only",
      expanded: "risk_plus_context",
      full: "full_intelligence_module"
    }[depth]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER RESOLUTION & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get tier capabilities for a given tier name
 * @param {string} tierName - The tier name (e.g., "basic", "corporate", "executive")
 * @returns {Object} The tier capabilities object
 */

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
 * Get tier capacity information
 * @param {string} tierName - The tier name
 * @returns {Object} Capacity object with maxPassengers and maxLuggage
 */
export function getTierCapacity(tierName) {
  const normalizedTier = tierName?.toLowerCase();
  return TIER_CAPACITY[normalizedTier] || TIER_CAPACITY[TIERS.BASIC];
}

/**
 * Get the appropriate SENTINEL depth for a tier
 * (Duplicate removed - already defined above)
 */

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
