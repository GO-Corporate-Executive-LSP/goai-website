GÖ.AI Duffel Provider Adapter

Enterprise-grade Duffel API integration for the GÖ.AI platform.

The Duffel Provider Adapter serves as the booking and airline commerce layer for ETAS™ (Enhanced Travel Automation Suite) and provides the execution capabilities that enable SENTINEL™ to preserve traveler continuity.

---

Purpose

This adapter abstracts the Duffel API behind a consistent interface so that the remainder of the GÖ.AI backend never communicates directly with provider-specific endpoints.

Responsibilities include:

- Flight offer search
- Order management
- Passenger management
- Payments
- Airport lookup
- Airline lookup
- Baggage services
- Seat services
- Hotel search
- Webhook processing

All provider responses are normalized into GÖ.AI's canonical data structures before being returned to ETAS™.

---

Architecture

SENTINEL™

        │

        ▼

ETAS™

        │

        ▼

Duffel Provider Adapter

        │

        ▼

Duffel API

The provider adapter is intentionally isolated from business logic.

It retrieves, validates, normalizes, and returns provider data.

All orchestration decisions remain inside ETAS™ and SENTINEL™.

---

Folder Structure

duffel/

├── offers.js
├── orders.js
├── passengers.js
├── payments.js
├── airports.js
├── airlines.js
├── baggage.js
├── seats.js
├── hotels.js
├── webhooks.js

├── client.js
├── config.js
├── constants.js
├── validators.js
├── normalize.js
├── errors.js
├── types.js
├── index.js

├── jest.config.js
├── jest.setup.js

├── __tests__/
├── __mocks__/

├── README.md
└── CHANGELOG.md

---

Features

Flights

- Search offers
- Normalize offers
- Retrieve offer details

Orders

- Create orders
- Retrieve orders
- Cancel orders

Passengers

- Passenger retrieval
- Passenger helpers

Payments

- Payment retrieval
- Payment normalization

Airports

- Airport search
- Airport lookup

Airlines

- Airline search
- Airline lookup

Baggage

- Baggage retrieval
- Ancillary normalization

Seats

- Seat retrieval
- Seat helpers

Hotels

- Hotel search
- Hotel retrieval
- Hotel rates

Webhooks

- Signature validation
- Event processing
- Event normalization

---

Testing

The adapter includes a complete Jest test suite.

Coverage includes:

- Successful requests
- Validation
- Response normalization
- Provider failures
- Retry behavior
- Edge cases
- Future capability placeholders

Execute tests:

npm test

---

Design Principles

The adapter follows several engineering principles:

- Provider isolation
- Single responsibility
- Defensive validation
- Standardized errors
- Response normalization
- Modular architecture
- Enterprise documentation
- Comprehensive automated testing

---

ETAS™

The Duffel adapter provides execution capabilities for ETAS™, including:

- Flight booking
- Order management
- Passenger coordination
- Hotel retrieval
- Airline information
- Airport information
- Ancillary services

ETAS™ determines what actions to perform.

The Duffel adapter performs how those actions are executed.

---

SENTINEL™

SENTINEL™ consumes normalized provider data to power:

- Continuity analysis
- Disruption detection
- Risk assessment
- Recommendation generation
- Autonomous itinerary coordination

The provider adapter intentionally contains no business intelligence.

---

Future Roadmap

Planned capabilities include:

- Automatic rebooking
- Hotel continuity
- Ground transportation integration
- Multi-provider orchestration
- Executive travel workflows
- Corporate travel policies
- Autonomous itinerary recovery
- SENTRY™ scoring
- Enterprise continuity intelligence

---

Version

Current Version:

1.0.0

---

License

Copyright © 2026 GÖ.AI.

All rights reserved.
