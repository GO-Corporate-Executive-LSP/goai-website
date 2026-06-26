import { processTrip } from '../processTrip.js';
import { mockTrip } from './mockTrip.js';

console.log("Starting test...");
console.log("Mock trip:", JSON.stringify(mockTrip, null, 2));

try {
  const result = processTrip(mockTrip);
  console.log("DRY RUN RESULT:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("ERROR:", error.message);
  console.error(error.stack);
}
