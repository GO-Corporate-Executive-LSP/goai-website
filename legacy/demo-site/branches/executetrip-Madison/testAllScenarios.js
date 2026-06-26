import { processTrip } from '../processTrip.js';
import { mockTrip } from './mockTrip.js';
import { mockTripMediumRisk } from './mockTripMediumRisk.js';

console.log("=== SCENARIO 1: LOW RISK (18:30 pickup) ===");
const lowRiskResult = processTrip(mockTrip);
console.log(JSON.stringify(lowRiskResult, null, 2));

console.log("\n=== SCENARIO 2: MEDIUM RISK (23:30 pickup) ===");
const mediumRiskResult = processTrip(mockTripMediumRisk);
console.log(JSON.stringify(mediumRiskResult, null, 2));

console.log("\n=== SCENARIO 3: NO SENTINEL DATA (simulated failure) ===");
// Temporarily break the datetime to trigger sentinel failure
const brokenTrip = {
  ...mockTrip,
  pickup: { ...mockTrip.pickup, datetime: "invalid-date" }
};
const noSentinelResult = processTrip(brokenTrip);
console.log(JSON.stringify(noSentinelResult, null, 2));
