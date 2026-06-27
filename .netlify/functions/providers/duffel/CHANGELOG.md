CHANGELOG

All notable changes to the GÖ.AI Duffel Provider Adapter will be documented in this file.

The format is based on Keep a Changelog and follows Semantic Versioning (SemVer).

---

[1.0.0] - 2026-06-27

Initial Release

This is the first production release of the GÖ.AI Duffel Provider Adapter.

Added

Flight Offers

- Offer search
- Offer retrieval
- Offer normalization
- Offer helper utilities

Orders

- Order creation
- Order retrieval
- Order cancellation
- Order normalization

Passengers

- Passenger retrieval
- Passenger normalization
- Passenger helper functions

Payments

- Payment retrieval
- Payment normalization
- Payment helper utilities

Airports

- Airport search
- Airport retrieval
- Airport normalization

Airlines

- Airline search
- Airline retrieval
- Airline normalization

Baggage

- Baggage retrieval
- Baggage normalization
- Baggage helper utilities

Seats

- Seat retrieval
- Seat normalization
- Seat helper utilities

Hotels

- Hotel search
- Hotel retrieval
- Hotel rate retrieval
- Hotel normalization
- Lodging helper utilities

Webhooks

- Webhook signature verification
- Webhook event processing
- Event normalization

---

Validation

Added centralized validation for:

- Airport codes
- Airline identifiers
- Passenger identifiers
- Order identifiers
- Offer identifiers
- Payment identifiers
- Hotel identifiers
- Baggage identifiers
- Seat identifiers
- Webhook payloads

---

Error Handling

Implemented standardized provider error handling including:

- Invalid request validation
- Provider exception wrapping
- Malformed response detection
- Null response handling
- Retry-ready architecture

---

Testing

Added complete Jest test suite covering:

- offers.test.js
- orders.test.js
- passengers.test.js
- payments.test.js
- airports.test.js
- airlines.test.js
- baggage.test.js
- seats.test.js
- hotels.test.js
- webhooks.test.js

Includes:

- Success scenarios
- Validation tests
- Response normalization
- Provider failures
- Retry scenarios
- Edge cases
- Future capability placeholders

---

Architecture

Established the GÖ.AI provider adapter architecture including:

- Canonical Trip Object compatibility
- ETAS™ integration
- SENTINEL™ compatibility
- Provider normalization layer
- Shared helper utilities
- Modular exports
- Enterprise file organization

---

Future

Reserved architecture for:

- Automatic rebooking
- Continuity intelligence
- Multi-city coordination
- Executive travel workflows
- SENTRY™ scoring
- Disruption prediction
- Autonomous itinerary orchestration
- Multi-provider routing
- Enterprise policy enforcement

---

End of Initial Release
