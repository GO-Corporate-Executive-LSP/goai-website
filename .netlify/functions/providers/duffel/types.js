/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: types.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Defines the canonical data contracts used throughout the
 * Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Define standard ETAS™ object shapes
 * - Eliminate ambiguity between provider modules
 * - Provide canonical factories for common objects
 * - Support future TypeScript migration
 *
 * IMPORTANT:
 * Although GÖ.AI is currently written in JavaScript,
 * these factories establish the canonical data model for
 * every provider adapter (Duffel, Lyft, Stripe, FlightAware,
 * OpenWeather, Base Operations, etc.).
 *
 * ETAS™ and SENTINEL™ should consume these object contracts
 * rather than provider-specific payloads.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *      │
 *      ▼
 * types.js
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
| Shared Type Helpers
|--------------------------------------------------------------------------
*/

/**
 * Creates a standard Provider Response.
 *
 * @param {string} provider
 * @returns {Object}
 */
function createProviderResponse(provider = "Duffel") {

    return {

        provider,

        timestamp:
            new Date().toISOString(),

        success: true

    };

}

/**
 * Creates a standard Metadata object.
 *
 * @returns {Object}
 */
function createMetadata() {

    return {

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        version: "1.0.0"

    };

}

/*
|--------------------------------------------------------------------------
| Offer & Order Types
|--------------------------------------------------------------------------
*/

/**
 * Creates a canonical Offer object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createOffer(data = {}) {

    return {

        id: data.id || null,

        provider: data.provider || "Duffel",

        offerRequestId:
            data.offerRequestId || null,

        owner:
            data.owner || null,

        totalAmount:
            data.totalAmount || null,

        totalCurrency:
            data.totalCurrency || null,

        expiresAt:
            data.expiresAt || null,

        slices:
            data.slices || [],

        passengers:
            data.passengers || [],

        conditions:
            data.conditions || {},

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a canonical Order object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createOrder(data = {}) {

    return {

        id: data.id || null,

        provider: data.provider || "Duffel",

        bookingReference:
            data.bookingReference || null,

        status:
            data.status || "pending",

        passengers:
            data.passengers || [],

        itinerary:
            data.itinerary || {},

        payments:
            data.payments || [],

        services:
            data.services || [],

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/*
|--------------------------------------------------------------------------
| Passenger & Payment Types
|--------------------------------------------------------------------------
*/

/**
 * Creates a canonical Passenger object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createPassenger(data = {}) {

    return {

        id: data.id || null,

        type: data.type || "adult",

        givenName:
            data.givenName ||
            data.given_name ||
            null,

        familyName:
            data.familyName ||
            data.family_name ||
            null,

        bornOn:
            data.bornOn ||
            data.born_on ||
            null,

        email:
            data.email || null,

        phoneNumber:
            data.phoneNumber ||
            data.phone_number ||
            null,

        loyaltyProgram:
            data.loyaltyProgram || null,

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a canonical Payment object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createPayment(data = {}) {

    return {

        id: data.id || null,

        provider:
            data.provider || "Duffel",

        type:
            data.type || null,

        status:
            data.status || "pending",

        amount:
            data.amount || null,

        currency:
            data.currency || null,

        paymentIntent:
            data.paymentIntent ||
            data.payment_intent ||
            null,

        transactionId:
            data.transactionId || null,

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/*
|--------------------------------------------------------------------------
| Airport, Airline, Baggage & Seat Types
|--------------------------------------------------------------------------
*/

/**
 * Creates a canonical Airport object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createAirport(data = {}) {

    return {

        id: data.id || null,

        iataCode:
            data.iataCode ||
            data.iata_code ||
            null,

        icaoCode:
            data.icaoCode ||
            data.icao_code ||
            null,

        name:
            data.name || null,

        city:
            data.city ||
            data.city_name ||
            null,

        country:
            data.country || null,

        timezone:
            data.timezone || null,

        coordinates: {

            latitude:
                data.latitude || null,

            longitude:
                data.longitude || null

        },

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a canonical Airline object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createAirline(data = {}) {

    return {

        id: data.id || null,

        iataCode:
            data.iataCode ||
            data.iata_code ||
            null,

        icaoCode:
            data.icaoCode ||
            data.icao_code ||
            null,

        name:
            data.name || null,

        country:
            data.country || null,

        alliance:
            data.alliance || null,

        callsign:
            data.callsign || null,

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a canonical Baggage object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createBaggage(data = {}) {

    return {

        id: data.id || null,

        passengerId:
            data.passengerId ||
            data.passenger_id ||
            null,

        serviceId:
            data.serviceId ||
            data.service_id ||
            null,

        quantity:
            data.quantity || 0,

        weight:
            data.weight || null,

        weightUnit:
            data.weightUnit ||
            data.weight_unit ||
            "kg",

        price: {

            amount:
                data.totalAmount ||
                data.total_amount ||
                null,

            currency:
                data.totalCurrency ||
                data.total_currency ||
                null

        },

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a canonical Seat object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createSeat(data = {}) {

    return {

        id: data.id || null,

        passengerId:
            data.passengerId ||
            data.passenger_id ||
            null,

        number:
            data.number || null,

        cabinClass:
            data.cabinClass ||
            data.cabin_class ||
            null,

        characteristics:
            data.characteristics || [],

        price: {

            amount:
                data.totalAmount ||
                data.total_amount ||
                null,

            currency:
                data.totalCurrency ||
                data.total_currency ||
                null

        },

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/*
|--------------------------------------------------------------------------
| Webhook, Canonical Trip & Provider Response Types
|--------------------------------------------------------------------------
*/

/**
 * Creates a canonical Webhook Event object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createWebhookEvent(data = {}) {

    return {

        id:
            data.id || null,

        provider:
            data.provider || "Duffel",

        eventType:
            data.eventType ||
            data.type ||
            null,

        occurredAt:
            data.occurredAt ||
            data.created_at ||
            new Date().toISOString(),

        data:
            data.data || {},

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a Canonical Trip Object.
 *
 * This is the master object consumed by ETAS™
 * and enriched by SENTINEL™.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createCanonicalTrip(data = {}) {

    return {

        tripId:
            data.tripId || null,

        status:
            data.status || "draft",

        provider:
            data.provider || "Duffel",

        passengers:
            data.passengers || [],

        itinerary:
            data.itinerary || {},

        bookings:
            data.bookings || [],

        payments:
            data.payments || [],

        intelligence:
            data.intelligence || {},

        recommendations:
            data.recommendations || [],

        executiveBriefing:
            data.executiveBriefing || null,

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/**
 * Creates a standardized Provider Response.
 *
 * Every provider adapter should ultimately
 * return this object to ETAS™.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createProviderResult(data = {}) {

    return {

        provider:
            data.provider || "Duffel",

        success:
            data.success ?? true,

        status:
            data.status || "success",

        message:
            data.message || null,

        data:
            data.data || null,

        errors:
            data.errors || [],

        metadata:
            data.metadata ||
            createMetadata()

    };

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| These canonical object factories establish the data contracts
| consumed by ETAS™, SENTINEL™, and all future provider adapters.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Shared Types
    |--------------------------------------------------------------------------
    */

    createProviderResponse,

    createMetadata,

    /*
    |--------------------------------------------------------------------------
    | Booking Types
    |--------------------------------------------------------------------------
    */

    createOffer,

    createOrder,

    /*
    |--------------------------------------------------------------------------
    | Traveler Types
    |--------------------------------------------------------------------------
    */

    createPassenger,

    createPayment,

    /*
    |--------------------------------------------------------------------------
    | Transportation Types
    |--------------------------------------------------------------------------
    */

    createAirport,

    createAirline,

    createBaggage,

    createSeat,

    /*
    |--------------------------------------------------------------------------
    | Platform Types
    |--------------------------------------------------------------------------
    */

    createWebhookEvent,

    createCanonicalTrip,

    createProviderResult

});
