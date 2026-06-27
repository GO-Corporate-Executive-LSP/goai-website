/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: constants.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Centralized constants used throughout the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Eliminate duplicated constants
 * - Centralize API endpoints
 * - Standardize provider metadata
 * - Provide immutable configuration values
 *
 * IMPORTANT:
 * This file becomes the single source of truth for every constant
 * used throughout the Duffel adapter. Provider modules should
 * progressively migrate their locally defined constants here.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *      │
 *      ▼
 * constants.js
 *      │
 *      ├── offers.js
 *      ├── orders.js
 *      ├── passengers.js
 *      ├── payments.js
 *      ├── airports.js
 *      ├── airlines.js
 *      ├── baggage.js
 *      ├── seats.js
 *      └── webhooks.js
 *
 * -----------------------------------------------------------------------------
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Provider Metadata
|--------------------------------------------------------------------------
*/

const PROVIDER = Object.freeze({

    NAME: "Duffel",

    VERSION: "1.0.0",

    ADAPTER: "Duffel Provider Adapter",

    API_VERSION: "v2"

});

/*
|--------------------------------------------------------------------------
| API Endpoints
|--------------------------------------------------------------------------
*/

const ENDPOINTS = Object.freeze({

    OFFERS: "/air/offer_requests",

    ORDERS: "/air/orders",

    AIRPORTS: "/air/airports",

    AIRLINES: "/air/airlines",

    SEAT_MAPS: "/air/seat_maps",

    ANCILLARY_SERVICES: "/air/orders",

    WEBHOOKS: "/webhooks"

});

/*
|--------------------------------------------------------------------------
| Environment Variable Names
|--------------------------------------------------------------------------
*/

const ENVIRONMENT = Object.freeze({

    API_TOKEN:
        "DUFFEL_API_TOKEN",

    WEBHOOK_SECRET:
        "DUFFEL_WEBHOOK_SECRET",

    API_VERSION:
        "DUFFEL_API_VERSION",

    SANDBOX:
        "DUFFEL_SANDBOX",

    LOG_LEVEL:
        "DUFFEL_LOG_LEVEL",

    LOGGING:
        "DUFFEL_LOGGING",

    TIMEOUT:
        "DUFFEL_TIMEOUT",

    RETRY_ATTEMPTS:
        "DUFFEL_RETRY_ATTEMPTS",

    RETRY_DELAY:
        "DUFFEL_RETRY_DELAY",

    RETRY_MULTIPLIER:
        "DUFFEL_RETRY_MULTIPLIER"

});

/*
|--------------------------------------------------------------------------
| Booking, Payment & Traveler Constants
|--------------------------------------------------------------------------
*/

const BOOKING_STATUS = Object.freeze({

    DRAFT: "draft",

    PENDING: "pending",

    CONFIRMED: "confirmed",

    TICKETED: "ticketed",

    CHANGED: "changed",

    CANCELLED: "cancelled",

    FAILED: "failed",

    REFUNDED: "refunded"

});

const PAYMENT_STATUS = Object.freeze({

    PENDING: "pending",

    AUTHORIZED: "authorized",

    PAID: "paid",

    FAILED: "failed",

    REFUNDED: "refunded"

});

const PASSENGER_TYPES = Object.freeze({

    ADULT: "adult",

    CHILD: "child",

    INFANT: "infant"

});

const CABIN_CLASSES = Object.freeze({

    ECONOMY: "economy",

    PREMIUM_ECONOMY: "premium_economy",

    BUSINESS: "business",

    FIRST: "first"

});

const TRIP_TYPES = Object.freeze({

    ONE_WAY: "one_way",

    ROUND_TRIP: "round_trip",

    MULTI_CITY: "multi_city"

});

const TICKET_STATUS = Object.freeze({

    NOT_ISSUED: "not_issued",

    ISSUED: "issued",

    VOIDED: "voided",

    EXCHANGED: "exchanged"

});

/*
|--------------------------------------------------------------------------
| Webhooks, HTTP & Network Constants
|--------------------------------------------------------------------------
*/

const WEBHOOK_EVENTS = Object.freeze({

    ORDER_CREATED: "order.created",

    ORDER_UPDATED: "order.updated",

    ORDER_CANCELLED: "order.cancelled",

    ORDER_CHANGED: "order.changed",

    ORDER_FAILED: "order.failed"

});

const HTTP_METHODS = Object.freeze({

    GET: "GET",

    POST: "POST",

    PUT: "PUT",

    PATCH: "PATCH",

    DELETE: "DELETE"

});

const HTTP_STATUS = Object.freeze({

    OK: 200,

    CREATED: 201,

    ACCEPTED: 202,

    NO_CONTENT: 204,

    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    CONFLICT: 409,

    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,

    BAD_GATEWAY: 502,

    SERVICE_UNAVAILABLE: 503,

    GATEWAY_TIMEOUT: 504

});

const RETRY = Object.freeze({

    DEFAULT_ATTEMPTS: 3,

    DEFAULT_DELAY_MS: 1000,

    DEFAULT_BACKOFF_MULTIPLIER: 2

});

const TIMEOUT = Object.freeze({

    DEFAULT_REQUEST_TIMEOUT_MS: 15000,

    WEBHOOK_VERIFICATION_TIMEOUT_MS: 5000

});

const LOG_LEVELS = Object.freeze({

    DEBUG: "debug",

    INFO: "info",

    WARN: "warn",

    ERROR: "error"

});

/*
|--------------------------------------------------------------------------
| Airport, Airline & Geographic Constants
|--------------------------------------------------------------------------
*/

const AIRPORT = Object.freeze({

    IATA_CODE_LENGTH: 3,

    ICAO_CODE_LENGTH: 4,

    UNKNOWN_AIRPORT: "UNKNOWN",

    DEFAULT_TIMEZONE: "UTC"

});

const AIRLINE = Object.freeze({

    IATA_CODE_LENGTH: 2,

    ICAO_CODE_LENGTH: 3,

    UNKNOWN_AIRLINE: "UNKNOWN"

});

const BAGGAGE = Object.freeze({

    DEFAULT_WEIGHT_UNIT: "kg",

    DEFAULT_DIMENSION_UNIT: "cm",

    MAX_BAGS_PER_PASSENGER: 10

});

const SEATS = Object.freeze({

    WINDOW: "window",

    AISLE: "aisle",

    MIDDLE: "middle",

    EXIT_ROW: "exit_row",

    EXTRA_LEGROOM: "extra_legroom"

});

const CURRENCY = Object.freeze({

    DEFAULT: "USD"

});

const COUNTRY = Object.freeze({

    DEFAULT: "US"

});

const LOCALE = Object.freeze({

    DEFAULT_LANGUAGE: "en",

    DEFAULT_REGION: "US"

});

const DATE_FORMAT = Object.freeze({

    ISO_8601: "YYYY-MM-DD",

    ISO_8601_DATETIME: "YYYY-MM-DDTHH:mm:ssZ"

});

/*
|--------------------------------------------------------------------------
| ETAS™ & SENTINEL™ Constants
|--------------------------------------------------------------------------
*/

const ETAS = Object.freeze({

    NAME: "Enhanced Travel Automation Suite",

    VERSION: "1.0.0",

    CANONICAL_TRIP_OBJECT: "CanonicalTripObject",

    DEFAULT_PROVIDER: "Duffel",

    DEFAULT_TIMEZONE: "UTC"

});

const SENTINEL = Object.freeze({

    NAME: "SENTINEL™",

    VERSION: "1.0.0",

    DEFAULT_RISK_SCORE: 0,

    MAX_RISK_SCORE: 100,

    DEFAULT_MONITORING_STATE: "active"

});

const CANONICAL_TRIP = Object.freeze({

    STATUS: {

        DRAFT: "draft",

        VALIDATED: "validated",

        BOOKING_READY: "booking_ready",

        SUBMITTED: "submitted",

        CONFIRMED: "confirmed",

        ACTIVE: "active",

        COMPLETED: "completed",

        CANCELLED: "cancelled",

        FAILED: "failed"

    },

    REQUIRED_FIELDS: Object.freeze([

        "tripId",

        "passengers",

        "itinerary"

    ])

});

const EVENT_BUS = Object.freeze({

    PROVIDER_EVENT: "provider.event",

    ORDER_CREATED: "order.created",

    ORDER_UPDATED: "order.updated",

    ORDER_CANCELLED: "order.cancelled",

    SENTINEL_ALERT: "sentinel.alert",

    ETAS_ACTION: "etas.action"

});

const EXECUTIVE_BRIEFING = Object.freeze({

    STATUS: {

        PENDING: "pending",

        GENERATED: "generated",

        DELIVERED: "delivered"

    }

});

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All constants should be imported from this file rather than
| redefining them throughout the provider adapter.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Provider Metadata
    |--------------------------------------------------------------------------
    */

    PROVIDER,

    /*
    |--------------------------------------------------------------------------
    | API & Environment
    |--------------------------------------------------------------------------
    */

    ENDPOINTS,

    ENVIRONMENT,

    /*
    |--------------------------------------------------------------------------
    | Booking & Traveler Constants
    |--------------------------------------------------------------------------
    */

    BOOKING_STATUS,

    PAYMENT_STATUS,

    PASSENGER_TYPES,

    CABIN_CLASSES,

    TRIP_TYPES,

    TICKET_STATUS,

    /*
    |--------------------------------------------------------------------------
    | Network & Webhook Constants
    |--------------------------------------------------------------------------
    */

    WEBHOOK_EVENTS,

    HTTP_METHODS,

    HTTP_STATUS,

    RETRY,

    TIMEOUT,

    LOG_LEVELS,

    /*
    |--------------------------------------------------------------------------
    | Airport & Airline Constants
    |--------------------------------------------------------------------------
    */

    AIRPORT,

    AIRLINE,

    BAGGAGE,

    SEATS,

    CURRENCY,

    COUNTRY,

    LOCALE,

    DATE_FORMAT,

    /*
    |--------------------------------------------------------------------------
    | ETAS™ & SENTINEL™
    |--------------------------------------------------------------------------
    */

    ETAS,

    SENTINEL,

    CANONICAL_TRIP,

    EVENT_BUS,

    EXECUTIVE_BRIEFING

});
