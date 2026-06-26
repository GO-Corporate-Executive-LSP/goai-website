# ETAS Lite — State Machine v1
Milestone 1 (Trip Orchestration MVP)

This document defines the allowed states, transitions, and guards
for the ETAS Lite conversational system.

---

## STATE: CONVO_ENTRY
Description:
Initial greeting and entry point.

On Enter:
- Greet user
- Invite travel request

Transitions:
- → INTENT_CAPTURE (on user travel intent)

---

## STATE: INTENT_CAPTURE
Description:
System captures destination and arrival time.

Required Inputs:
- destination
- arrival_time

Guards:
- arrival_time must be known

Transitions:
- → DURATION_CLARIFICATION (if arrival_time valid)
- → INTENT_CAPTURE (if arrival_time missing → ask again)

---

## STATE: DURATION_CLARIFICATION
Description:
Determine how long the user will stay.

Required Inputs:
- duration

Guards:
- duration must be numeric and > 0

Transitions:
- → OCCUPANCY_COLLECTION (if valid)
- → DURATION_CLARIFICATION (if unclear → clarify once)

---

## STATE: OCCUPANCY_COLLECTION
Description:
Collect passengers and luggage.

Required Inputs:
- passengers ≥ 1
- luggage ≥ 0

Guards:
- passenger count within tier limits (not enforced yet)

Transitions:
- → DRAFT_TRIP_CREATED (if valid)
- → OCCUPANCY_COLLECTION (if unclear → clarify once)

---

## STATE: DRAFT_TRIP_CREATED
Description:
Draft Trip Object is constructed.

System Actions:
- Calculate pickup time
- Calculate return pickup time
- Populate Trip Object with state=draft

Transitions:
- → TIER_SELECTION

---

## STATE: TIER_SELECTION
Description:
User selects service tier.

Required Inputs:
- tier selection (explicit)

Guards:
- tier must be one of:
  GO_JET | GO_EV | GO_BIZZ | G_KLUB

Transitions:
- → TRIP_SUMMARY (on selection)
- → TIER_SELECTION (if changed later)

---

## STATE: TRIP_SUMMARY
Description:
System reads back full trip snapshot.

System Actions:
- Read pickup time
- Read arrival time
- Read return pickup time
- Read tier
- Read passengers

Transitions:
- → VALIDATION_CHECK (if user confirms)
- → TIER_SELECTION (if user wants changes)
- → HUMAN_OVERRIDE (if user confused)

---

## STATE: VALIDATION_CHECK
Description:
ETAS Lite validation gate.

System Actions:
- Run validateTrip.js

Guards:
- All required fields present
- No schema violations

Transitions:
- → READY_FOR_CONFIRMATION (if valid)
- → HUMAN_OVERRIDE (if invalid after clarification)

---

## STATE: READY_FOR_CONFIRMATION
Description:
Trip is review-ready.

Trip State:
- review

System Actions:
- Ask user to proceed to booking

Transitions:
- → BOOKING_HANDOFF (future milestone)
- → HUMAN_OVERRIDE

---

## STATE: HUMAN_OVERRIDE
Description:
Manual recovery path.

System Actions:
- Offer concierge assistance
- Route to Calendly / SMS workflow

This is a terminal state for Milestone 1.
