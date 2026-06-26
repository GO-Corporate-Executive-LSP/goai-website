import { processTrip } from '../processTrip.js';
import { mockTrip } from './mockTrip.js';

const result = processTrip(mockTrip);

console.log("DRY RUN RESULT:", JSON.stringify(result, null, 2));
