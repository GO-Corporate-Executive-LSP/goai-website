/**
 * ETAS Lite — Trip Validation (Milestone 1)
 * Purpose: Validate completeness before execution or review
 * Policy: No silent assumptions. No auto-correction.
 */

export function validateTrip(trip) {
    const errors = [];
  
    // Pickup validation
    if (!trip.pickup?.address) {
      errors.push("Missing pickup address");
    }
  
    if (!trip.pickup?.datetime) {
      errors.push("Missing pickup datetime");
    }
  
    if (!trip.pickup?.timezone) {
      errors.push("Missing pickup timezone");
    }
  
    // Dropoff validation
    if (!trip.dropoff?.address) {
      errors.push("Missing dropoff address");
    }
  
    // Passenger rules
    if (!Number.isInteger(trip.passengers) || trip.passengers < 1) {
      errors.push("Passenger count must be a whole number greater than 0");
    }
  
    if (!Number.isInteger(trip.luggage) || trip.luggage < 0) {
      errors.push("Luggage count cannot be negative");
    }
  
    // Tier validation
    if (!trip.tier?.name) {
      errors.push("Service tier has not been selected");
    }
  
    // Return trip validation
    if (!trip.return?.pickup_datetime) {
      errors.push("Missing return pickup time");
    }
  
    // Sentinel snapshot (schema-only for now)
    if (!trip.sentinel_snapshot?.risk_level) {
      errors.push("Missing sentinel risk level");
    }
  
    return {
      status: errors.length === 0 ? "valid" : "invalid",
      errors,
      payload: errors.length === 0 ? trip : null
    };
  }
  
  