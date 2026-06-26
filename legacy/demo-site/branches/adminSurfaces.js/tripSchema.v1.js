/**
 * TripSchema v1 — ETAS Lite
 * Milestone 1 source of truth
 * Day 9: Added approval metadata
 * Day 12: Enhanced tier field with source and locked flag
 */

export const TripSchemaV1 = {
    trip_id: "",
    user_id: "",
    state: "draft",
  
    pickup: {
      address: "",
      datetime: "",
      timezone: "America/New_York"
    },
  
    dropoff: {
      address: ""
    },
  
    return: {
      pickup_datetime: "",
      estimated_home_arrival: ""
    },
  
    passengers: 1,
    luggage: 0,
  
    // Day 12: User tier (determines approval, automation, and SENTINEL behavior)
    tier: {
      name: "",              // "basic" | "corporate" | "executive"
      source: "",            // Where tier was resolved from (e.g., "user_profile")
      locked: true,          // Tier cannot change mid-trip
      vehicle_class: ""      // Optional: specific vehicle tier (for booking)
    },
  
    sentinel_snapshot: {
      risk_level: "green",
      risk_note: ""
    },
  
    // Day 9: Human approval metadata (optional, append-only)
    approval: {
      status: "", // "APPROVED" | "NEEDS_ADJUSTMENT" | "ESCALATED" | ""
      decidedBy: "human",
      decidedAt: "",
      notes: ""
    },
  
    // Day 10: Manual execution state (optional, append-only)
    execution: {
      status: "", // "PENDING" | "EXECUTED" | "FAILED" | ""
      action: "", // Action type (e.g., "SEND_BOOKING_REQUEST")
      executedBy: "human",
      executedAt: "",
      result: "",
      notes: ""
    },
  
  // Day 11: Automation eligibility decision (optional, append-only)
  automation: {
    eligible: false, // true | false
    evaluatedAt: "",
    evaluatedBy: "system",
    reason: "", // Reason code (e.g., "LOW_RISK_STANDARD_TIER", "SENTINEL_ELEVATED_RISK")
    explanation: "" // Human-readable explanation
  },
};
