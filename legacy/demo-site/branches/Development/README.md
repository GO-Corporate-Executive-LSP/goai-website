## processTrip.js (Milestone 1)

This function is the single backend entry point for
validated conversational trips.

Responsibilities:
- Run ETAS Lite validation
- Enforce schema correctness
- Gate execution behind a review state

Non-Responsibilities:
- No booking
- No payment
- No dispatch
- No API calls
