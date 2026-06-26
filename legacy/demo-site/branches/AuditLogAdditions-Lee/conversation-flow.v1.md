# ETAS Lite — Conversational Flow v1
Milestone 1 (Trip Orchestration MVP)

This document defines the required conversational behavior for GEOFF and ADA.
It is logic-first and UI-agnostic.

---

## 1. Greeting / Entry
System greets the user and offers assistance.

Example:
"Hello. How can I assist you with your travel today?"

State: CONVO_ENTRY

---

## 2. Intent Capture
User expresses a travel need.

Required information:
- Destination
- Desired arrival time

If arrival time is missing:
Ask:
"What time do you need to arrive?"

State: INTENT_CAPTURE

---

## 3. Duration Clarification
System must determine how long the user expects to stay.

Ask:
"How long do you expect to stay?"

This value is required to calculate the return trip.

State: DURATION_CLARIFICATION

---

## 4. Passenger & Luggage Collection
System asks:
- "How many passengers will be traveling?"
- "Will there be any luggage?"

Rules:
- Passenger count must be ≥ 1
- Luggage count must be ≥ 0
- Clarify once if unclear

State: OCCUPANCY_COLLECTION

---

## 5. Draft Trip Construction
System constructs a draft trip using collected information:
- Pickup address
- Pickup time
- Dropoff address
- Arrival time
- Estimated return pickup time

Trip state: draft

State: DRAFT_TRIP_CREATED

---

## 6. Tier Recommendation & Selection
System presents all four tiers:
- GO_JET
- GO_EV
- GO_BIZZ
- G_KLUB

System recommends a tier based on passenger/luggage count.
User must explicitly select a tier.

If the user changes tier later, re-enter this state.

State: TIER_SELECTION

---

## 7. Trip Summary (Snapshot)
System reads back:
- Pickup time
- Arrival time
- Return pickup time
- Tier selected
- Passenger count

Ask:
"Does this trip look correct?"

State: TRIP_SUMMARY

---

## 8. Validation Gate
System runs ETAS Lite validation.

If validation fails:
- Ask one clarifying question
- Do not proceed forward

If validation passes:
- Advance to review

State: VALIDATION_CHECK

---

## 9. Ready for Confirmation
Trip is considered complete and review-ready.

Ask:
"Would you like to proceed to booking?"

Note:
- No payment or dispatch occurs in Milestone 1

Trip state: review

State: READY_FOR_CONFIRMATION

---

## 10. Human Fallback
At any point, if:
- User is confused
- Validation repeatedly fails
- User requests help

System offers concierge assistance:
"I can connect you with a concierge to complete this booking."

(Calendar / SMS recovery path)

State: HUMAN_OVERRIDE
