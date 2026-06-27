/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: seats.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides seat selection services for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Retrieve seat maps
 * - Select seats
 * - Validate seat selections
 * - Normalize seat information
 * - Support ETAS™ and SENTINEL™ traveler continuity
 *
 * IMPORTANT:
 * Seat services are ancillary products associated with
 * Offers and Orders. Availability varies by airline and aircraft.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * SENTINEL™
 *        │
 *        ▼
 * seats.js
 *        │
 *        ▼
 * client.js
 *        │
 *        ▼
 * Duffel Seat Maps API
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Duffel API
 * - Lee Kosek Postman Collection
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

const {
    DuffelValidationError,
    DuffelApiError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const SEATMAP_ENDPOINT = "/air/seat_maps";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates an Offer or Order identifier.
 *
 * @param {string} resourceId
 * @throws {DuffelValidationError}
 */
function validateResourceId(resourceId) {

    if (!resourceId) {

        throw new DuffelValidationError(
            "Offer or Order ID is required."
        );

    }

}

/**
 * Validates a seat selection.
 *
 * @param {Object} seat
 * @throws {DuffelValidationError}
 */
function validateSeatSelectionObject(seat = {}) {

    if (!seat.passengerId) {

        throw new DuffelValidationError(
            "Passenger ID is required."
        );

    }

    if (!seat.seatId) {

        throw new DuffelValidationError(
            "Seat ID is required."
        );

    }

}

/**
 * Builds a Duffel-compatible seat selection payload.
 *
 * @param {Object} seat
 * @returns {Object}
 */
function buildSeatPayload(seat = {}) {

    validateSeatSelectionObject(seat);

    return {

        passenger_id: seat.passengerId,

        seat_id: seat.seatId

    };

}

/**
 * Normalizes seat information.
 *
 * @param {Array} seats
 * @returns {Array}
 */
function normalizeSeats(seats = []) {

    return seats.map((seat) => ({

        id: seat.id,

        number: seat.number,

        cabinClass:
            seat.cabin_class,

        price:
            seat.total_amount,

        currency:
            seat.total_currency,

        characteristics:
            seat.characteristics || [],

        raw: seat

    }));

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Retrieves a seat map.
 *
 * Part 2 implements this function.
 */
async function getSeatMap() {

    throw new Error(
        "getSeatMap() not yet implemented."
    );

}

/**
 * Selects a seat.
 *
 * Part 3 implements this function.
 */
async function selectSeat() {

    throw new Error(
        "selectSeat() not yet implemented."
    );

}

/**
 * Validates a seat selection.
 *
 * Part 4 implements this function.
 */
async function validateSeatSelection() {

    throw new Error(
        "validateSeatSelection() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Seat Map
 * --------------------------------------------------------------------------
 * Retrieves the seat map associated with a Duffel Offer or Order.
 *
 * IMPORTANT:
 * Seat maps are retrieved before seat assignment.
 * Availability is determined by the airline and aircraft configuration.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Traveler Dashboard
 * - Executive Briefings
 * - Twin Trip Simulation
 *
 * @param {string} resourceId
 * @returns {Promise<Object>}
 */
async function getSeatMap(resourceId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateResourceId(resourceId);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Seat Map
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${SEATMAP_ENDPOINT}/${resourceId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve seat map.",
                originalError:
                    error.message
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
                    "Duffel returned an invalid seat map response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Seats
    --------------------------------------------------------------------------
    */

    const seats = normalizeSeats(

        response.data.seats || []

    );

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Seat Map
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        count: seats.length,

        seats

    };

}

/**
 * --------------------------------------------------------------------------
 * Select Seat
 * --------------------------------------------------------------------------
 * Assigns a seat to a passenger for a Duffel Offer or Order.
 *
 * IMPORTANT:
 * Seat assignment is subject to airline availability,
 * aircraft configuration, and fare rules.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Traveler Dashboard
 * - Executive Briefings
 * - Order Management
 *
 * @param {string} resourceId
 * @param {Object} seat
 * @returns {Promise<Object>}
 */
async function selectSeat(resourceId, seat = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateResourceId(resourceId);

    validateSeatSelectionObject(seat);

    /*
    --------------------------------------------------------------------------
    Build Request Payload
    --------------------------------------------------------------------------
    */

    const payload =
        buildSeatPayload(seat);

    let response;

    /*
    --------------------------------------------------------------------------
    Submit Seat Selection
    --------------------------------------------------------------------------
    */

    try {

        response = await client.post(

            `${SEATMAP_ENDPOINT}/${resourceId}/selections`,

            {
                data: payload
            }

        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to select seat.",
                originalError:
                    error.message
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
                    "Duffel returned an invalid seat selection response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Selected Seat
    --------------------------------------------------------------------------
    */

    const selectedSeat =
        normalizeSeats([
            response.data
        ]);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Result
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        selectedAt:
            new Date().toISOString(),

        seat:
            selectedSeat[0]

    };

}

/**
 * --------------------------------------------------------------------------
 * Validate Seat Selection
 * --------------------------------------------------------------------------
 * Validates a seat selection before it is submitted as part of
 * a Duffel Order.
 *
 * IMPORTANT:
 * This function validates only the seat selection.
 * Airline acceptance and final assignment are determined by
 * Duffel and the operating carrier.
 *
 * Used by:
 * - ETAS™
 * - Order Workflow
 * - Traveler Dashboard
 * - Executive Briefings
 *
 * @param {Object} seat
 * @returns {Promise<Object>}
 */
async function validateSeatSelection(seat = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Required Fields
    --------------------------------------------------------------------------
    */

    validateSeatSelectionObject(seat);

    /*
    --------------------------------------------------------------------------
    Validate Seat Number
    --------------------------------------------------------------------------
    */

    if (!seat.number) {

        throw new DuffelValidationError(
            "Seat number is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Validate Cabin Class
    --------------------------------------------------------------------------
    */

    if (!seat.cabinClass &&
        !seat.cabin_class) {

        throw new DuffelValidationError(
            "Cabin class is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Seat
    --------------------------------------------------------------------------
    */

    const normalizedSeat =
        normalizeSeats([
            seat
        ]);

    /*
    --------------------------------------------------------------------------
    Return Validation Result
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        valid: true,

        validatedAt:
            new Date().toISOString(),

        seat:
            normalizedSeat[0]

    };

}

/*
|--------------------------------------------------------------------------
| Seat Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the assigned seat number.
 *
 * @param {Object} seat
 * @returns {string|null}
 */
function getSeatNumber(seat = {}) {

    return seat.number || null;

}

/**
 * Returns the cabin class.
 *
 * @param {Object} seat
 * @returns {string|null}
 */
function getCabinClass(seat = {}) {

    return seat.cabinClass ||
           seat.cabin_class ||
           null;

}

/**
 * Returns the seat price.
 *
 * @param {Object} seat
 * @returns {Object}
 */
function getSeatPrice(seat = {}) {

    return {

        amount:
            seat.price ||
            seat.total_amount ||
            null,

        currency:
            seat.currency ||
            seat.total_currency ||
            null

    };

}

/**
 * Determines whether the seat is a window seat.
 *
 * @param {Object} seat
 * @returns {boolean}
 */
function isWindowSeat(seat = {}) {

    const characteristics =
        seat.characteristics || [];

    return characteristics.includes("window");

}

/**
 * Determines whether the seat is an aisle seat.
 *
 * @param {Object} seat
 * @returns {boolean}
 */
function isAisleSeat(seat = {}) {

    const characteristics =
        seat.characteristics || [];

    return characteristics.includes("aisle");

}

/**
 * Determines whether the seat is located
 * in an exit row.
 *
 * @param {Object} seat
 * @returns {boolean}
 */
function isExitRow(seat = {}) {

    const characteristics =
        seat.characteristics || [];

    return characteristics.includes("exit_row");

}

/**
 * Determines whether the seat provides
 * extra legroom.
 *
 * @param {Object} seat
 * @returns {boolean}
 */
function hasExtraLegroom(seat = {}) {

    const characteristics =
        seat.characteristics || [];

    return characteristics.includes("extra_legroom");

}

/**
 * Returns the passenger assigned to the seat.
 *
 * @param {Object} seat
 * @returns {string|null}
 */
function getPassengerId(seat = {}) {

    return seat.passengerId ||
           seat.passenger_id ||
           null;

}

/**
 * Determines whether two seat selections
 * reference the same seat.
 *
 * @param {Object} seatA
 * @param {Object} seatB
 * @returns {boolean}
 */
function isSameSeat(
    seatA = {},
    seatB = {}
) {

    return (
        getSeatNumber(seatA) ===
        getSeatNumber(seatB)
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All seat operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Seat Operations
    |--------------------------------------------------------------------------
    */

    getSeatMap,

    selectSeat,

    validateSeatSelection,

    /*
    |--------------------------------------------------------------------------
    | Seat Helper Functions
    |--------------------------------------------------------------------------
    */

    getSeatNumber,

    getCabinClass,

    getSeatPrice,

    isWindowSeat,

    isAisleSeat,

    isExitRow,

    hasExtraLegroom,

    getPassengerId,

    isSameSeat

});
