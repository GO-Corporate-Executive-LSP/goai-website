/**
 * TripSchema v1 — ETAS Lite
 * Milestone 1 source of truth
 * Day 9: Added approval metadata
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
  
    tier: {
      name: "",
      vehicle_class: ""
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
  
    notes: ""
  };
  