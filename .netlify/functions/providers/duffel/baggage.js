/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: baggage.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides baggage services for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Retrieve baggage options
 * - Select baggage services
 * - Validate baggage selections
 * - Normalize baggage information
 * - Support ETAS™ and SENTINEL™ continuity decisions
 *
 * IMPORTANT:
 * Baggage services are ancillary products associated with
 * Offers and Orders. Availability varies by airline.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * SENTINEL™
 *        │
 *        ▼
 * baggage.js
 *        │
 *        ▼
 * client.js
 *        │
 *        ▼
 * Duffel Ancillary Services API
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

const BAGGAGE_ENDPOINT = "/air/orders";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates an Order ID.
 *
 * @param {string} orderId
 * @throws {DuffelValidationError}
 */
function validateOrderId(orderId) {

    if (!orderId) {

        throw new DuffelValidationError(
            "Order ID is required."
        );

    }

}

/**
 * Validates a baggage selection.
 *
 * @param {Object} baggage
 * @throws {DuffelValidationError}
 */
function validateBaggageSelection(baggage = {}) {

    if (!baggage.passengerId) {

        throw new DuffelValidationError(
            "Passenger ID is required."
        );

    }

    if (!baggage.serviceId) {

        throw new DuffelValidationError(
            "Baggage service ID is required."
        );

    }

}

/**
 * Builds a Duffel baggage payload.
 *
 * @param {Object} baggage
 * @returns {Object}
 */
function buildBaggagePayload(baggage = {}) {

    validateBaggageSelection(baggage);

    return {

        passenger_id: baggage.passengerId,

        service_id: baggage.serviceId

    };

}

/**
 * Normalizes baggage services.
 *
 * @param {Array} services
 * @returns {Array}
 */
function normalizeBaggage(services = []) {

    return services.map((service) => ({

        id: service.id,

        type: service.type,

        quantity: service.quantity,

        totalAmount:
            service.total_amount,

        totalCurrency:
            service.total_currency,

        raw: service

    }));

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Retrieves baggage options.
 *
 * Part 2 implements this function.
 */
async function getBaggageOptions() {

    throw new Error(
        "getBaggageOptions() not yet implemented."
    );

}

/**
 * Selects baggage.
 *
 * Part 3 implements this function.
 */
async function selectBaggage() {

    throw new Error(
        "selectBaggage() not yet implemented."
    );

}

/**
 * Validates baggage selections.
 *
 * Part 4 implements this function.
 */
async function validateBaggage() {

    throw new Error(
        "validateBaggage() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Baggage Options
 * --------------------------------------------------------------------------
 * Retrieves all baggage services available for a Duffel Order.
 *
 * IMPORTANT:
 * Baggage availability is determined by the airline and fare rules.
 * Not every booking will support additional baggage purchases.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Traveler Dashboard
 * - Executive Briefings
 * - Twin Trip Simulation
 *
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
async function getBaggageOptions(orderId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateOrderId(orderId);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Order
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${BAGGAGE_ENDPOINT}/${orderId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve baggage options.",
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
                    "Duffel returned an invalid baggage response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Extract Baggage Services
    --------------------------------------------------------------------------
    */

    const services =
        response.data.available_services || [];

    /*
    --------------------------------------------------------------------------
    Normalize Results
    --------------------------------------------------------------------------
    */

    const baggage =
        normalizeBaggage(services);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Collection
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        count: baggage.length,

        baggage

    };

}

/**
 * --------------------------------------------------------------------------
 * Select Baggage
 * --------------------------------------------------------------------------
 * Selects an available baggage service for a passenger.
 *
 * IMPORTANT:
 * Duffel represents baggage as an ancillary service.
 * This function prepares and submits the baggage selection
 * to the associated Order.
 *
 * Used by:
 * - ETAS™
 * - Traveler Dashboard
 * - Executive Briefings
 * - Order Management
 *
 * @param {string} orderId
 * @param {Object} baggage
 * @returns {Promise<Object>}
 */
async function selectBaggage(orderId, baggage = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateOrderId(orderId);

    validateBaggageSelection(baggage);

    /*
    --------------------------------------------------------------------------
    Build Request Payload
    --------------------------------------------------------------------------
    */

    const payload =
        buildBaggagePayload(baggage);

    let response;

    /*
    --------------------------------------------------------------------------
    Submit Baggage Selection
    --------------------------------------------------------------------------
    */

    try {

        response = await client.post(

            `${BAGGAGE_ENDPOINT}/${orderId}/services`,

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
                    "Unable to select baggage service.",
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
                    "Duffel returned an invalid baggage selection response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Selected Service
    --------------------------------------------------------------------------
    */

    const baggageSelection =
        normalizeBaggage([
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

        baggage:
            baggageSelection[0]

    };

}

/**
 * --------------------------------------------------------------------------
 * Validate Baggage
 * --------------------------------------------------------------------------
 * Validates a baggage selection before it is submitted as part of
 * a Duffel Order.
 *
 * IMPORTANT:
 * This function validates only the baggage selection.
 * Airline acceptance and pricing are ultimately determined by Duffel
 * and the operating carrier.
 *
 * Used by:
 * - ETAS™
 * - Order Workflow
 * - Traveler Dashboard
 * - Executive Briefings
 *
 * @param {Object} baggage
 * @returns {Promise<Object>}
 */
async function validateBaggage(baggage = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Required Fields
    --------------------------------------------------------------------------
    */

    validateBaggageSelection(baggage);

    /*
    --------------------------------------------------------------------------
    Validate Quantity
    --------------------------------------------------------------------------
    */

    if (
        baggage.quantity !== undefined &&
        baggage.quantity <= 0
    ) {

        throw new DuffelValidationError(
            "Baggage quantity must be greater than zero."
        );

    }

    /*
    --------------------------------------------------------------------------
    Validate Weight
    --------------------------------------------------------------------------
    */

    if (
        baggage.weight !== undefined &&
        baggage.weight < 0
    ) {

        throw new DuffelValidationError(
            "Baggage weight cannot be negative."
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Baggage
    --------------------------------------------------------------------------
    */

    const normalizedBaggage =
        normalizeBaggage([
            baggage
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

        baggage:
            normalizedBaggage[0]

    };

}

/*
|--------------------------------------------------------------------------
| Baggage Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the number of checked bags.
 *
 * @param {Object} baggage
 * @returns {number}
 */
function getCheckedBags(baggage = {}) {

    return baggage.quantity || 0;

}

/**
 * Returns the carry-on allowance.
 *
 * @param {Object} baggage
 * @returns {Object|null}
 */
function getCarryOnAllowance(baggage = {}) {

    return baggage.carryOn ||
           baggage.carry_on ||
           null;

}

/**
 * Returns the baggage weight limit.
 *
 * @param {Object} baggage
 * @returns {Object|null}
 */
function getWeightLimit(baggage = {}) {

    return {

        value:
            baggage.weight || null,

        unit:
            baggage.weightUnit ||
            baggage.weight_unit ||
            "kg"

    };

}

/**
 * Returns the baggage price.
 *
 * @param {Object} baggage
 * @returns {Object}
 */
function getBaggagePrice(baggage = {}) {

    return {

        amount:
            baggage.totalAmount ||
            baggage.total_amount ||
            null,

        currency:
            baggage.totalCurrency ||
            baggage.total_currency ||
            null

    };

}

/**
 * Determines whether baggage is included
 * in the fare.
 *
 * @param {Object} baggage
 * @returns {boolean}
 */
function isIncluded(baggage = {}) {

    return Boolean(
        baggage.included
    );

}

/**
 * Determines whether baggage exceeds
 * the airline's weight allowance.
 *
 * @param {Object} baggage
 * @returns {boolean}
 */
function isOverweight(baggage = {}) {

    if (
        baggage.weight === undefined ||
        baggage.weightLimit === undefined
    ) {

        return false;

    }

    return baggage.weight >
           baggage.weightLimit;

}

/**
 * Returns the baggage service identifier.
 *
 * @param {Object} baggage
 * @returns {string|null}
 */
function getServiceId(baggage = {}) {

    return baggage.serviceId ||
           baggage.service_id ||
           baggage.id ||
           null;

}

/**
 * Returns the passenger associated
 * with the baggage selection.
 *
 * @param {Object} baggage
 * @returns {string|null}
 */
function getPassengerId(baggage = {}) {

    return baggage.passengerId ||
           baggage.passenger_id ||
           null;

}

/**
 * Determines whether two baggage
 * selections reference the same service.
 *
 * @param {Object} baggageA
 * @param {Object} baggageB
 * @returns {boolean}
 */
function isSameBaggage(
    baggageA = {},
    baggageB = {}
) {

    return (
        getServiceId(baggageA) ===
        getServiceId(baggageB)
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All baggage operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Baggage Operations
    |--------------------------------------------------------------------------
    */

    getBaggageOptions,

    selectBaggage,

    validateBaggage,

    /*
    |--------------------------------------------------------------------------
    | Baggage Helper Functions
    |--------------------------------------------------------------------------
    */

    getCheckedBags,

    getCarryOnAllowance,

    getWeightLimit,

    getBaggagePrice,

    isIncluded,

    isOverweight,

    getServiceId,

    getPassengerId,

    isSameBaggage

});
