GÖ.AI Backend Provider Architecture — Continuation Prompt

Part 1 — The Goal

We are building the backend for GÖ.AI, an AI-powered Travel Continuity and Movement Intelligence platform.

The platform is centered around two core systems:

- SENTINEL™ — The intelligence layer responsible for prediction, reasoning, disruption detection, dependency analysis, and decision-making.
- ETAS™ (Enhanced Travel Automation Suite) — The execution layer responsible for bookings, scheduling, reservations, provider orchestration, and automation.

The backend is built using Node.js (JavaScript) with a modular provider architecture.

Each external API is implemented as an independent provider adapter.

The long-term goal is to create a provider-agnostic intelligence platform capable of swapping providers without affecting SENTINEL™.

---

Part 2 — Architecture & Engineering Rules

Core Principles

1. Provider Families

Providers are grouped into capability families.

Current families include:

- Commerce
- Weather
- Rideshare
- Telemetry
- Flight Tracking
- Event Density
- AI & Orchestration
- (Future)
  - Coordination & Productivity
  - Government & Public Intelligence
  - Dining & Hospitality

---

2. One Reference Provider per Family

Each capability family has one reference implementation.

Examples:

Weather → OpenWeather

Rideshare → Lyft

Telemetry → Mapbox

Flight Tracking → FlightAware

Event Density → Eventbrite

AI & Orchestration → OpenAI

Every additional provider within the same family begins as a clone of the reference implementation and only changes provider-specific code.

---

3. Provider-Agnostic Architecture

SENTINEL™ must never depend on provider-specific responses.

Every provider adapter must normalize its data into a common SENTINEL™ data model before returning it.

This rule applies across every capability family.

---

4. Folder Structure

Every provider follows the exact same structure.

Standard files:

client.js

config.js

constants.js

validators.js

normalizers.js

errors.js

index.js

jest.config.js

jest.setup.js

README.md

CHANGELOG.md

Each provider also contains:

- Resource files
- mocks/
- tests/

---

5. Resource Files

Each provider family has standardized resource files shared across every provider in that family.

Examples:

Weather

weather.js

forecast.js

alerts.js

geocoding.js

air-quality.js

one-call.js

---

Rideshare

rides.js

ride-types.js

estimates.js

drivers.js

pricing.js

bookings.js

cancellations.js

webhooks.js

---

Telemetry

routes.js

directions.js

geocoding.js

matrix.js

isochrones.js

traffic.js

navigation.js

webhooks.js

---

Flight Tracking

flights.js

tracking.js

airports.js

arrivals.js

departures.js

delays.js

schedules.js

webhooks.js

---

Event Density

events.js

venues.js

search.js

categories.js

tickets.js

calendar.js

density.js

impact.js

webhooks.js

---

AI & Orchestration

chat.js

reasoning.js

orchestration.js

embeddings.js

briefings.js

summaries.js

classification.js

extraction.js

translation.js

moderation.js

webhooks.js

---

6. orchestration.js

The AI & Orchestration family contains a unique file:

orchestration.js

This is the bridge between:

SENTINEL™

↓

Decision Making

↓

ETAS™

↓

Execution

It coordinates multiple AI providers and downstream service providers.

---

7. Code Generation

Every implementation file is generated in six sequential parts.

Part 1

Part 2

Part 3

Part 4

Part 5

Part 6

Do not change formatting between providers.

Do not introduce new coding styles.

Maintain consistency across the entire backend.

---

8. Future Provider Managers

Each capability family will eventually contain a Provider Manager responsible for:

Primary provider selection

Fallback providers

Health monitoring

Provider routing

Rate limiting

Normalization enforcement

Cost optimization

SENTINEL™ communicates with Provider Managers rather than individual providers.

---

Part 3 — Current State

Completed reference implementations:

Commerce

✓ Duffel

✓ Stripe

Completed provider scaffolds:

Weather

✓ OpenWeather

✓ NOAA

Rideshare

✓ Lyft

✓ Uber

✓ Waymo

✓ Zoox

Telemetry

✓ Mapbox

✓ OpenRouteService

Flight Tracking

✓ FlightAware

✓ FlightRadar24

Event Density

✓ Eventbrite

✓ Ticketmaster

AI & Orchestration

Folders created for:

✓ OpenAI

✓ Google AI

✓ Anthropic

The next task is to implement the AI & Orchestration providers using the established architecture and coding conventions.

Most importantly:

Maintain architectural consistency.

Never introduce new patterns without explicit discussion.

Treat this document as the canonical engineering blueprint for the GÖ.AI backend.




The following is a promt as I will upload two - three compete Zip Files that demonstrate the above. 
2 (Stripe and Duffel) will be the complete folder and flightaware will be the provider shell

"The attached files establish the canonical engineering standard for the GÖ.AI backend. Before generating any code, learn the architecture, coding style, naming conventions, file organization, normalization philosophy, and testing patterns from these files.

Treat the attached Engineering Blueprint as the authoritative architectural specification. Treat the Stripe provider as the canonical implementation standard. Treat the Duffel provider as the example of applying the same architecture to a different domain.

All future providers must follow these conventions exactly unless we explicitly agree to change the architecture. Do not introduce new patterns, naming conventions, or file structures. Maintain consistency across the entire backend."
