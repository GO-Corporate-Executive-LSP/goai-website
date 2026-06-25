DAY 03 — CONVERSATION FLOW

Sprint: Sprint One
Date: December 19, 2025
Status: Complete

---

Purpose

The objective of Day 3 was to define how ETAS communicates with users through conversational interfaces.

Unlike Day 1 (Trip Schema) and Day 2 (Validation), this work was not focused on backend engineering.

Instead, it established the logic that governs how Geoffrey and Ada interact with users, gather information, and construct a complete Trip object without overwhelming the traveler.

The purpose was to make complex travel planning feel like a natural conversation rather than completing a traditional booking form.

---

Problem Being Solved

Traditional travel applications rely heavily on long forms that require users to enter every piece of information before receiving any value.

Conversational AI introduces a different challenge.

Without structure, conversations become:

- Inconsistent
- Difficult to predict
- Difficult to validate
- Difficult to automate
- Difficult to recover when interrupted

The objective of Day 3 was to ensure every conversation followed a deterministic path while still feeling natural to the user.

---

Design Philosophy

Every conversation should have:

- One clear objective.
- One logical next question.
- One current state.
- One predictable outcome.

Although the interaction feels conversational, the underlying logic behaves like a guided workflow.

This philosophy reduces ambiguity while improving completion rates.

---

Conversation Participants

Two conversational personas were envisioned.

Geoffrey

Geoffrey represents the operational travel concierge.

Responsibilities include:

- Gathering trip information
- Confirming itinerary details
- Explaining recommendations
- Coordinating bookings
- Guiding users through ETAS workflows

---

Ada

Ada represents the intelligence layer.

Responsibilities include:

- Providing contextual insights
- Explaining SENTRY™ Scores
- Interpreting SENTINEL™ recommendations
- Communicating disruptions
- Presenting alternative courses of action

Together, Geoffrey and Ada separate operational assistance from intelligence delivery.

---

Conversation Workflow

The initial conversational workflow was defined as:

Greeting
      ↓
Intent Capture
      ↓
Trip Details
      ↓
Passenger Information
      ↓
Luggage Information
      ↓
Service Tier
      ↓
Draft Trip
      ↓
Trip Summary
      ↓
Validation
      ↓
Confirmation
      ↓
Human Fallback (if necessary)

Each step represents a deterministic state rather than an open-ended conversation.

---

Intent Capture

The first responsibility is understanding what the traveler wants to accomplish.

Examples include:

- Create a new trip
- Modify an existing trip
- Review an itinerary
- Generate an Executive Briefing
- Ask for recommendations

Only after intent is understood should additional information be collected.

---

Progressive Information Collection

Rather than requesting every field simultaneously, ETAS collects information incrementally.

Examples include:

- Where are you traveling?
- When are you leaving?
- How many travelers?
- Will you need ground transportation?
- What service tier would you like?

Each response enriches the Trip object created during Day 1.

---

Conversation State Management

Every response advances the conversation to exactly one new state.

For example:

Waiting for Pickup Address
        ↓
Waiting for Destination
        ↓
Waiting for Travel Date
        ↓
Waiting for Passenger Count

This deterministic structure later became the foundation for the ETAS Lite State Machine developed during Day 4.

---

Validation During Conversation

The Validation Engine created during Day 2 operates continuously throughout the conversation.

Rather than waiting until the end of the interaction, ETAS validates information as it is collected.

Examples include:

- Valid date formats
- Valid passenger counts
- Required fields
- Logical travel sequences

Errors are corrected immediately before additional questions are asked.

---

Human Recovery

One of the design goals was ensuring that conversations never reached an unrecoverable state.

If confidence decreases or the workflow becomes ambiguous, ETAS may transition to a human-assisted workflow.

Examples include:

- Administrative review
- Executive assistant intervention
- Customer support

This maintains continuity without abandoning the conversation.

---

Architectural Significance

Day 3 transformed ETAS from a collection of backend services into an interactive travel platform.

Instead of simply processing requests, ETAS became capable of guiding users through structured decision-making.

The Conversation Flow now serves as the bridge between:

User
      ↓
Conversation
      ↓
Trip Schema
      ↓
Validation
      ↓
ETAS

This interaction model remains foundational to every future interface, including web, mobile, SMS, and voice.

---

Future Capability Enabled

The Conversation Flow established the foundation for:

- Geoffrey™ Concierge
- Ada™ Intelligence Assistant
- Web Chat
- SMS Conversations
- Voice Interfaces
- Executive Assistants
- Corporate Travel Coordinators
- AI Concierge Services
- Executive Briefing Generation
- Human-in-the-Loop Recovery

As SENTINEL evolves, conversations will also become intelligence-aware, allowing Geoffrey and Ada to proactively explain disruptions, recommend alternative travel plans, and communicate changes before they impact the traveler.

---

Dependencies

This document builds directly upon:

- Day 1 — Trip Schema Foundation
- Day 2 — Validation Engine

It directly enables:

- Day 4 — ETAS Lite State Machine
- Day 5 — Process Trip Orchestration
- Future conversational interfaces

---

Engineering Notes

Conversation logic should remain deterministic.

Although future AI models may become increasingly sophisticated, ETAS should always maintain explicit conversation states behind the scenes.

Every question should have a purpose.

Every response should advance the workflow.

Every conversation should produce a validated Trip object ready for orchestration.

This principle ensures that conversational flexibility never compromises system reliability.
