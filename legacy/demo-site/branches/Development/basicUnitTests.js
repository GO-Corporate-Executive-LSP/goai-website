/**
 * Basic Unit Tests — Minimal regression checks
 *
 * Run by importing and calling runBasicUnitTests() from a backend context.
 */

import { processTrip } from "../processTrip.js";
import { approveTrip } from "../approveTrip.js";
import { assertCanTransition } from "../stateMachineGuard.js";
import { sentinelLite } from "../../sentinel/sentinelLite.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function buildValidTrip() {
  return {
    trip_id: "trip_test_123",
    user_id: "user_test_123",
    pickup: {
      address: "123 Main St, Charlotte NC",
      datetime: "2026-02-24T18:30:00",
      timezone: "America/New_York"
    },
    dropoff: {
      address: "Steak 48, Charlotte NC"
    },
    return: {
      pickup_datetime: "2026-02-24T21:00:00",
      estimated_home_arrival: ""
    },
    passengers: 2,
    luggage: 0,
    tier: {
      name: "basic",
      source: "user_profile",
      locked: true,
      vehicle_class: ""
    },
    sentinel_snapshot: {
      risk_level: "low",
      risk_score: 0,
      flag: "green",
      guidance: "",
      evaluated_at: ""
    },
    state: "draft",
    user_notes: ""
  };
}

export function runBasicUnitTests() {
  const results = [];

  // 1) Valid trip passes
  try {
    const validTrip = buildValidTrip();
    const result = processTrip(validTrip);
    assert(result.status === "valid", "Valid trip should pass validation");
    results.push({ test: "valid trip passes", status: "passed" });
  } catch (error) {
    results.push({ test: "valid trip passes", status: "failed", error: error.message });
  }

  // 2) Invalid trip fails (missing pickup address)
  try {
    const invalidTrip = buildValidTrip();
    invalidTrip.pickup.address = "";
    const result = processTrip(invalidTrip);
    assert(result.status === "invalid", "Invalid trip should fail validation");
    results.push({ test: "invalid trip fails", status: "passed" });
  } catch (error) {
    results.push({ test: "invalid trip fails", status: "failed", error: error.message });
  }

  // 3) Invalid state transition throws
  try {
    let threw = false;
    try {
      assertCanTransition("approved", "draft");
    } catch (error) {
      threw = true;
    }
    assert(threw, "Invalid state transition should throw");
    results.push({ test: "invalid state transition throws", status: "passed" });
  } catch (error) {
    results.push({ test: "invalid state transition throws", status: "failed", error: error.message });
  }

  // 4) Admin approval updates state and metadata (logs indirectly)
  try {
    const trip = buildValidTrip();
    trip.state = "review";
    const result = approveTrip(trip, "APPROVED", "Looks good");
    assert(result.success === true, "Approval should succeed");
    assert(result.trip.state === "approved", "Approval should set state to approved");
    assert(result.trip.approval?.status === "APPROVED", "Approval status should be set");
    results.push({ test: "admin approval updates state", status: "passed" });
  } catch (error) {
    results.push({ test: "admin approval updates state", status: "failed", error: error.message });
  }

  // 5) SENTINEL failure does not block (sentinelLite returns null safely)
  try {
    const sentinelResult = sentinelLite({});
    assert(sentinelResult === null, "SENTINEL should return null on failure");

    const validTrip = buildValidTrip();
    const result = processTrip(validTrip);
    assert(result.status === "valid", "Trip processing should succeed even if SENTINEL fails");
    results.push({ test: "SENTINEL failure non-blocking", status: "passed" });
  } catch (error) {
    results.push({ test: "SENTINEL failure non-blocking", status: "failed", error: error.message });
  }

  return {
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === "passed").length,
      failed: results.filter((r) => r.status === "failed").length
    },
    results
  };
}

export default {
  runBasicUnitTests
};
