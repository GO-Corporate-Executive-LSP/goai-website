/**
 * TripSchema v1 — ETAS Lite
 * Milestone 1 source of truth
 * Day 9: Added approval metadata
 * Day 12: Enhanced tier field with source and locked flag
 * Sprint 1 Day 9: Added admin context fields for audit trail
 */

export const TripSchemaV1 = {
    trip_id: "",
    user_id: "",
    user_email: "",
    state: { 
      current_state: "", 
      previous_state: "", 
      time_in_state: "", 
      state_changed_at: "" 
    },
  
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
      risk_score: 0,
      flag: "green",
      guidance: "",
      evaluated_at: ""
    },
  
    // Sprint 1 Day 9: Admin context (optional, only visible to admins)
    admin_context: {

      // Day 9: Human approval metadata (optional, append-only)
      approval: {
            status: "", // "APPROVED" | "NEEDS_ADJUSTMENT" | "ESCALATED" | ""
            decided_by: "human",
          decided_at: "",
          escalation_reason: "", // if applicable
          notes: ""
      },
  
      // Day 10: Manual execution state (optional, append-only)
      execution: {
        status: "", // "PENDING" | "EXECUTED" | "FAILED" | ""
        action: "", // Action type (e.g., "SEND_BOOKING_REQUEST")
        executed_by: "human",
        executed_at: "",
        result: "",
        notes: ""
      },
  
    // Day 11: Automation eligibility decision (optional, append-only)
    automation: {
      eligible: false, // true | false
      evaluated_at: "",
      evaluated_by: "system",
      reason: "", // Reason code (e.g., "LOW_RISK_STANDARD_TIER", "SENTINEL_ELEVATED_RISK")
      explanation: "" // Human-readable explanation
    },

    failure: {
      failure_type: "",
      failure_reason: ""
    },
    
    retries: {
      retry_count: "",
      last_retry_at: ""
    },

    
    admin_notes: "",
    last_admin_action: "",
    last_admin_user: "",
    created_at: "",
    updated_at: ""

  },

  user_notes: "",

   // the wix collection _id 
   _id: ""

};
