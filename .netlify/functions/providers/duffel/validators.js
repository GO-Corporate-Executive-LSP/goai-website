/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: validators.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Shared validation library for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Validate common data types
 * - Validate Canonical Trip Object components
 * - Eliminate duplicate validation logic
 * - Provide consistent validation across the adapter
 *
 * IMPORTANT:
 * This file serves as the single source of truth for validation.
 * Provider modules should progressively migrate their validation
 * logic here instead of implementing duplicate validators.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *      │
 *      ▼
 * validators.js
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
| Dependencies
|--------------------------------------------------------------------------
*/

const {
    DuffelValidationError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const VALIDATION = Object.freeze({

    MIN_IATA_LENGTH: 3,

    MIN_ICAO_LENGTH: 4,

    MIN_AIRLINE_CODE_LENGTH: 2,

    MAX_STRING_LENGTH: 255,

    MIN_PASSENGERS: 1

});

/*
|--------------------------------------------------------------------------
| Generic Validation Helpers
|--------------------------------------------------------------------------
*/

/**
 * Ensures a value exists.
 *
 * @param {*} value
 * @param {string} field
 */
function required(value, field) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        throw new DuffelValidationError(
            `${field} is required.`
        );

    }

}

/**
 * Ensures a value is a string.
 *
 * @param {*} value
 * @param {string} field
 */
function isString(value, field) {

    required(value, field);

    if (typeof value !== "string") {

        throw new DuffelValidationError(
            `${field} must be a string.`
        );

    }

}

/**
 * Ensures a value is an array.
 *
 * @param {*} value
 * @param {string} field
 */
function isArray(value, field) {

    required(value, field);

    if (!Array.isArray(value)) {

        throw new DuffelValidationError(
            `${field} must be an array.`
        );

    }

}

/**
 * Ensures a value is a number.
 *
 * @param {*} value
 * @param {string} field
 */
function isNumber(value, field) {

    required(value, field);

    if (typeof value !== "number") {

        throw new DuffelValidationError(
            `${field} must be a number.`
        );

    }

}

/**
 * Ensures a string does not exceed
 * the maximum supported length.
 *
 * @param {string} value
 * @param {string} field
 */
function maxLength(value, field) {

    if (
        value &&
        value.length >
        VALIDATION.MAX_STRING_LENGTH
    ) {

        throw new DuffelValidationError(
            `${field} exceeds maximum length.`
        );

    }

}

/*
|--------------------------------------------------------------------------
| Primitive Type Validators
|--------------------------------------------------------------------------
*/

/**
 * Validates a non-empty string.
 *
 * @param {*} value
 * @param {string} field
 */
function validateString(value, field) {

    isString(value, field);

    if (value.trim().length === 0) {

        throw new DuffelValidationError(
            `${field} cannot be empty.`
        );

    }

    maxLength(value, field);

}

/**
 * Validates a numeric value.
 *
 * @param {*} value
 * @param {string} field
 */
function validateNumber(value, field) {

    isNumber(value, field);

    if (Number.isNaN(value)) {

        throw new DuffelValidationError(
            `${field} must be a valid number.`
        );

    }

}

/**
 * Validates an integer.
 *
 * @param {*} value
 * @param {string} field
 */
function validateInteger(value, field) {

    validateNumber(value, field);

    if (!Number.isInteger(value)) {

        throw new DuffelValidationError(
            `${field} must be an integer.`
        );

    }

}

/**
 * Validates a positive number.
 *
 * @param {*} value
 * @param {string} field
 */
function validatePositiveNumber(value, field) {

    validateNumber(value, field);

    if (value <= 0) {

        throw new DuffelValidationError(
            `${field} must be greater than zero.`
        );

    }

}

/**
 * Validates an array.
 *
 * @param {*} value
 * @param {string} field
 */
function validateArray(value, field) {

    isArray(value, field);

}

/**
 * Validates a non-empty array.
 *
 * @param {*} value
 * @param {string} field
 */
function validateNonEmptyArray(value, field) {

    validateArray(value, field);

    if (value.length === 0) {

        throw new DuffelValidationError(
            `${field} cannot be empty.`
        );

    }

}

/**
 * Validates a boolean value.
 *
 * @param {*} value
 * @param {string} field
 */
function validateBoolean(value, field) {

    required(value, field);

    if (typeof value !== "boolean") {

        throw new DuffelValidationError(
            `${field} must be a boolean.`
        );

    }

}

/**
 * Validates an object.
 *
 * @param {*} value
 * @param {string} field
 */
function validateObject(value, field) {

    required(value, field);

    if (
        typeof value !== "object" ||
        Array.isArray(value)
    ) {

        throw new DuffelValidationError(
            `${field} must be an object.`
        );

    }

}

/**
 * Validates an ISO-8601 date string.
 *
 * @param {string} value
 * @param {string} field
 */
function validateISODate(value, field) {

    validateString(value, field);

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        throw new DuffelValidationError(
            `${field} must be a valid ISO-8601 date.`
        );

    }

}

/*
|--------------------------------------------------------------------------
| Domain-Specific Validators
|--------------------------------------------------------------------------
*/

/**
 * Validates an IATA airport code.
 *
 * @param {string} code
 */
function validateAirportCode(code) {

    validateString(code, "Airport Code");

    if (code.length !== VALIDATION.MIN_IATA_LENGTH) {

        throw new DuffelValidationError(
            "Airport code must be a valid 3-character IATA code."
        );

    }

}

/**
 * Validates an ICAO airport code.
 *
 * @param {string} code
 */
function validateICAOCode(code) {

    validateString(code, "ICAO Code");

    if (code.length !== VALIDATION.MIN_ICAO_LENGTH) {

        throw new DuffelValidationError(
            "ICAO code must be a valid 4-character code."
        );

    }

}

/**
 * Validates an airline code.
 *
 * @param {string} code
 */
function validateAirlineCode(code) {

    validateString(code, "Airline Code");

    if (code.length < VALIDATION.MIN_AIRLINE_CODE_LENGTH) {

        throw new DuffelValidationError(
            "Airline code is invalid."
        );

    }

}

/**
 * Validates an Offer identifier.
 *
 * @param {string} offerId
 */
function validateOfferId(offerId) {

    validateString(
        offerId,
        "Offer ID"
    );

}

/**
 * Validates an Order identifier.
 *
 * @param {string} orderId
 */
function validateOrderId(orderId) {

    validateString(
        orderId,
        "Order ID"
    );

}

/**
 * Validates a Passenger object.
 *
 * @param {Object} passenger
 */
function validatePassenger(passenger = {}) {

    validateObject(
        passenger,
        "Passenger"
    );

    required(
        passenger.given_name,
        "Passenger Given Name"
    );

    required(
        passenger.family_name,
        "Passenger Family Name"
    );

    required(
        passenger.type,
        "Passenger Type"
    );

}

/**
 * Validates a Passenger collection.
 *
 * @param {Array} passengers
 */
function validatePassengers(passengers = []) {

    validateNonEmptyArray(
        passengers,
        "Passengers"
    );

    if (
        passengers.length <
        VALIDATION.MIN_PASSENGERS
    ) {

        throw new DuffelValidationError(
            "At least one passenger is required."
        );

    }

    passengers.forEach(validatePassenger);

}

/*
|--------------------------------------------------------------------------
| Payment, Baggage & Seat Validators
|--------------------------------------------------------------------------
*/

/**
 * Validates a Payment object.
 *
 * @param {Object} payment
 */
function validatePayment(payment = {}) {

    validateObject(
        payment,
        "Payment"
    );

    required(
        payment.type,
        "Payment Type"
    );

    required(
        payment.amount,
        "Payment Amount"
    );

    validatePositiveNumber(
        payment.amount,
        "Payment Amount"
    );

    required(
        payment.currency,
        "Payment Currency"
    );

}

/**
 * Validates a Baggage object.
 *
 * @param {Object} baggage
 */
function validateBaggage(baggage = {}) {

    validateObject(
        baggage,
        "Baggage"
    );

    required(
        baggage.passengerId,
        "Passenger ID"
    );

    required(
        baggage.serviceId,
        "Baggage Service ID"
    );

    if (
        baggage.quantity !== undefined
    ) {

        validatePositiveNumber(
            baggage.quantity,
            "Baggage Quantity"
        );

    }

}

/**
 * Validates a Seat object.
 *
 * @param {Object} seat
 */
function validateSeat(seat = {}) {

    validateObject(
        seat,
        "Seat"
    );

    required(
        seat.passengerId,
        "Passenger ID"
    );

    required(
        seat.seatId,
        "Seat ID"
    );

    required(
        seat.number,
        "Seat Number"
    );

    required(
        seat.cabinClass ||
        seat.cabin_class,
        "Cabin Class"
    );

}

/**
 * Validates a webhook payload.
 *
 * @param {Object} payload
 */
function validateWebhook(payload = {}) {

    validateObject(
        payload,
        "Webhook Payload"
    );

    required(
        payload.type,
        "Webhook Event Type"
    );

    required(
        payload.data,
        "Webhook Event Data"
    );

}

/**
 * Validates an ETAS Resource Identifier.
 *
 * Used for:
 * - Offer IDs
 * - Order IDs
 * - Passenger IDs
 * - Service IDs
 * - Seat IDs
 *
 * @param {string} id
 * @param {string} field
 */
function validateResourceId(
    id,
    field = "Resource ID"
) {

    validateString(id, field);

}

/*
|--------------------------------------------------------------------------
| ETAS™ Canonical Trip Object Validators
|--------------------------------------------------------------------------
*/

/**
 * Validates the Canonical Trip Object.
 *
 * @param {Object} trip
 */
function validateTrip(trip = {}) {

    validateObject(
        trip,
        "Canonical Trip Object"
    );

    required(
        trip.tripId,
        "Trip ID"
    );

    required(
        trip.passengers,
        "Passengers"
    );

    validatePassengers(
        trip.passengers
    );

    required(
        trip.itinerary,
        "Itinerary"
    );

    validateItinerary(
        trip.itinerary
    );

}

/**
 * Validates an itinerary.
 *
 * @param {Object} itinerary
 */
function validateItinerary(itinerary = {}) {

    validateObject(
        itinerary,
        "Itinerary"
    );

    required(
        itinerary.slices,
        "Trip Slices"
    );

    validateNonEmptyArray(
        itinerary.slices,
        "Trip Slices"
    );

    itinerary.slices.forEach(
        validateSlice
    );

}

/**
 * Validates a trip slice.
 *
 * @param {Object} slice
 */
function validateSlice(slice = {}) {

    validateObject(
        slice,
        "Trip Slice"
    );

    required(
        slice.origin,
        "Origin Airport"
    );

    required(
        slice.destination,
        "Destination Airport"
    );

    required(
        slice.departureDate,
        "Departure Date"
    );

    validateAirportCode(
        slice.origin
    );

    validateAirportCode(
        slice.destination
    );

    validateISODate(
        slice.departureDate,
        "Departure Date"
    );

}

/**
 * Validates a booking object.
 *
 * @param {Object} booking
 */
function validateBooking(booking = {}) {

    validateObject(
        booking,
        "Booking"
    );

    required(
        booking.orderId,
        "Order ID"
    );

    validateOrderId(
        booking.orderId
    );

}

/**
 * Validates a provider response.
 *
 * @param {Object} response
 */
function validateProviderResponse(response = {}) {

    validateObject(
        response,
        "Provider Response"
    );

    required(
        response.provider,
        "Provider"
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All validation operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Generic Validators
    |--------------------------------------------------------------------------
    */

    required,

    isString,

    isArray,

    isNumber,

    maxLength,

    /*
    |--------------------------------------------------------------------------
    | Primitive Validators
    |--------------------------------------------------------------------------
    */

    validateString,

    validateNumber,

    validateInteger,

    validatePositiveNumber,

    validateArray,

    validateNonEmptyArray,

    validateBoolean,

    validateObject,

    validateISODate,

    /*
    |--------------------------------------------------------------------------
    | Domain Validators
    |--------------------------------------------------------------------------
    */

    validateAirportCode,

    validateICAOCode,

    validateAirlineCode,

    validateOfferId,

    validateOrderId,

    validatePassenger,

    validatePassengers,

    /*
    |--------------------------------------------------------------------------
    | Booking Validators
    |--------------------------------------------------------------------------
    */

    validatePayment,

    validateBaggage,

    validateSeat,

    validateWebhook,

    validateResourceId,

    /*
    |--------------------------------------------------------------------------
    | ETAS™ Validators
    |--------------------------------------------------------------------------
    */

    validateTrip,

    validateItinerary,

    validateSlice,

    validateBooking,

    validateProviderResponse

});
