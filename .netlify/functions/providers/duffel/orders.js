/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: orders.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides all booking (Order) operations for the Duffel API.
 *
 * Responsibilities:
 * - Create Orders (Bookings)
 * - Retrieve Orders
 * - Cancel Orders (where supported)
 * - Normalize booking responses
 * - Prepare bookings for ETAS™ orchestration
 *
 * ETAS™ should NEVER communicate directly with the Duffel API.
 * All booking operations must flow through this module.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *      │
 *      ▼
 * orders.js
 *      │
 *      ▼
 * client.js
 *      │
 *      ▼
 * Duffel REST API
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Lee Kosek Duffel Postman Collection
 * - Create Booking
 * - Create Booking (Single Passenger)
 * - Retrieve Order
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Dependencies
|--------------------------------------------------------------------------
*/

const client = require("./client");

const normalize = require("./normalize");

const {
    DuffelValidationError,
    DuffelApiError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ORDER_ENDPOINT = "/air/orders";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates a booking request.
 *
 * @param {Object} booking
 * @throws {DuffelValidationError}
 */
function validateOrderRequest(booking = {}) {

    if (!booking.selectedOffer) {

        throw new DuffelValidationError(
            "A selected Duffel Offer is required before creating an Order."
        );

    }

    if (!booking.passengers ||
        !Array.isArray(booking.passengers) ||
        booking.passengers.length === 0) {

        throw new DuffelValidationError(
            "At least one passenger is required."
        );

    }

}

/**
 * Builds the payload expected by the Duffel Orders API.
 *
 * Future versions may enrich this payload using
 * ETAS policies, traveler preferences,
 * organization rules, and payment methods.
 *
 * @param {Object} booking
 * @returns {Object}
 */
function buildOrderRequest(booking) {

    return {

        data: {

            selected_offers: [
                booking.selectedOffer.id
            ],

            passengers: booking.passengers,

            payments: booking.payments || []

        }

    };

}

/**
 * Normalizes an Order response.
 *
 * @param {Object} response
 * @returns {Object}
 */
function normalizeOrder(response = {}) {

    return normalize.normalizeOrder(

        response.data || response

    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Creates a Duffel Order.
 *
 * Part 2 implements this function.
 */

async function createOrder() {

    throw new Error(
        "createOrder() not yet implemented."
    );

}

/**
 * Retrieves an existing Duffel Order.
 *
 * Part 3 implements this function.
 */

async function getOrder() {

    throw new Error(
        "getOrder() not yet implemented."
    );

}

/**
 * Cancels an existing Duffel Order.
 *
 * Part 4 implements this function.
 */

async function cancelOrder() {

    throw new Error(
        "cancelOrder() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Create Duffel Order (Booking)
 * --------------------------------------------------------------------------
 * Creates a confirmed booking from a previously selected Duffel Offer.
 *
 * Reference:
 * Lee Kosek Postman Collection
 * - Create Booking
 * - Create Booking (Single Passenger)
 *
 * This is the point where a traveler transitions from
 * "shopping" to "booking."
 *
 * @param {Object} booking
 * @returns {Promise<Object>}
 */
async function createOrder(booking = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Request
    --------------------------------------------------------------------------
    */

    validateOrderRequest(booking);

    /*
    --------------------------------------------------------------------------
    Build Duffel Payload
    --------------------------------------------------------------------------
    */

    const payload = buildOrderRequest(booking);

    let response;

    /*
    --------------------------------------------------------------------------
    Submit Booking
    --------------------------------------------------------------------------
    */

    try {

        response = await client.post(
            ORDER_ENDPOINT,
            payload
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to create Duffel Order.",
                originalError: error.message
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Validate Response
    --------------------------------------------------------------------------
    */

    if (!response || !response.data) {

        throw new DuffelApiError(
            502,
            {
                message:
                    "Duffel returned an invalid Order response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Booking
    --------------------------------------------------------------------------
    */

    const order = normalizeOrder(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Booking
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        bookingConfirmed: true,

        bookingTimestamp:
            new Date().toISOString(),

        order

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Duffel Order
 * --------------------------------------------------------------------------
 * Retrieves an existing Duffel Order using its unique Order ID.
 *
 * Reference:
 * Lee Kosek Postman Collection
 * - Retrieve Order
 *
 * Used by:
 * - ETAS™
 * - Continuous Monitoring
 * - Executive Briefings
 * - Traveler Dashboard
 * - Booking Verification
 *
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
async function getOrder(orderId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!orderId) {

        throw new DuffelValidationError(
            "Order ID is required."
        );

    }

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Order
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${ORDER_ENDPOINT}/${orderId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve Duffel Order.",
                originalError: error.message
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Validate Response
    --------------------------------------------------------------------------
    */

    if (!response || !response.data) {

        throw new DuffelApiError(
            502,
            {
                message:
                    "Duffel returned an invalid Order response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Response
    --------------------------------------------------------------------------
    */

    const order = normalizeOrder(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Booking
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        order

    };

}

/**
 * --------------------------------------------------------------------------
 * Cancel Duffel Order
 * --------------------------------------------------------------------------
 * Attempts to cancel an existing Duffel Order.
 *
 * IMPORTANT:
 * Duffel cancellation support depends on the airline and fare rules.
 * Some bookings may not be cancellable through the API.
 *
 * Used by:
 * - ETAS™
 * - Traveler Dashboard
 * - Human Review
 * - Failure Recovery
 *
 * Reference:
 * Duffel Orders API
 *
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
async function cancelOrder(orderId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!orderId) {

        throw new DuffelValidationError(
            "Order ID is required."
        );

    }

    let response;

    /*
    --------------------------------------------------------------------------
    Attempt Cancellation
    --------------------------------------------------------------------------
    */

    try {

        response = await client.delete(
            `${ORDER_ENDPOINT}/${orderId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to cancel Duffel Order.",
                originalError: error.message
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Validate Response
    --------------------------------------------------------------------------
    */

    if (!response || !response.data) {

        throw new DuffelApiError(
            502,
            {
                message:
                    "Duffel returned an invalid cancellation response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Response
    --------------------------------------------------------------------------
    */

    const order = normalizeOrder(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Result
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        cancelled: true,

        cancelledAt:
            new Date().toISOString(),

        order

    };

}

/*
|--------------------------------------------------------------------------
| Booking Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Determines whether an Order has been successfully booked.
 *
 * @param {Object} order
 * @returns {boolean}
 */
function isBooked(order = {}) {

    return (
        order &&
        order.status &&
        order.status.toLowerCase() === "confirmed"
    );

}

/**
 * Determines whether an Order has been cancelled.
 *
 * @param {Object} order
 * @returns {boolean}
 */
function isCancelled(order = {}) {

    return (
        order &&
        order.status &&
        order.status.toLowerCase() === "cancelled"
    );

}

/**
 * Returns the booking reference (PNR).
 *
 * @param {Object} order
 * @returns {string|null}
 */
function getBookingReference(order = {}) {

    return order.bookingReference || null;

}

/**
 * Returns the passenger manifest.
 *
 * @param {Object} order
 * @returns {Array}
 */
function getPassengerList(order = {}) {

    return order.passengers || [];

}

/**
 * Returns all flight slices associated with the booking.
 *
 * @param {Object} order
 * @returns {Array}
 */
function getFlightSlices(order = {}) {

    return order.slices || [];

}

/**
 * Returns the total booking amount.
 *
 * @param {Object} order
 * @returns {Object}
 */
function getTotalPrice(order = {}) {

    return {

        amount: order.totalAmount || null,

        currency: order.totalCurrency || null

    };

}

/**
 * Returns the number of travelers on the booking.
 *
 * @param {Object} order
 * @returns {number}
 */
function getPassengerCount(order = {}) {

    return (order.passengers || []).length;

}

/**
 * Returns the current booking status.
 *
 * @param {Object} order
 * @returns {string|null}
 */
function getBookingStatus(order = {}) {

    return order.status || null;

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All booking operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Booking Operations
    |--------------------------------------------------------------------------
    */

    createOrder,

    getOrder,

    cancelOrder,

    /*
    |--------------------------------------------------------------------------
    | Booking Helper Functions
    |--------------------------------------------------------------------------
    */

    isBooked,

    isCancelled,

    getBookingReference,

    getPassengerList,

    getFlightSlices,

    getTotalPrice,

    getPassengerCount,

    getBookingStatus

});
