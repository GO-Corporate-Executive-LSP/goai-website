/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: passengers.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Manages passenger objects used throughout the Duffel booking workflow.
 *
 * Responsibilities:
 * - Build passenger payloads
 * - Validate passenger information
 * - Normalize passenger objects
 * - Prepare passengers for Offer Requests and Orders
 *
 * IMPORTANT:
 * Duffel does not expose a standalone Passenger API.
 * Passengers are embedded within Offer Requests and Orders.
 *
 * ETAS™ remains the authoritative source for passenger information
 * through the Canonical Trip Object.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * Canonical Trip Object
 *          │
 *          ▼
 * passengers.js
 *          │
 *          ▼
 * orders.js
 *          │
 *          ▼
 * client.js
 *          │
 *          ▼
 * Duffel Orders API
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Lee Kosek Duffel Postman Collection
 * - Create Booking
 * - Create Booking (Single Passenger)
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

const normalize = require("./normalize");

const {
    DuffelValidationError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const PASSENGER_TYPES = Object.freeze({

    ADULT: "adult",

    CHILD: "child",

    INFANT: "infant"

});

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates a passenger object before
 * it is submitted to Duffel.
 *
 * @param {Object} passenger
 * @throws {DuffelValidationError}
 */
function validatePassenger(passenger = {}) {

    if (!passenger.given_name) {

        throw new DuffelValidationError(
            "Passenger given_name is required."
        );

    }

    if (!passenger.family_name) {

        throw new DuffelValidationError(
            "Passenger family_name is required."
        );

    }

    if (!passenger.type) {

        throw new DuffelValidationError(
            "Passenger type is required."
        );

    }

    if (
        !Object.values(PASSENGER_TYPES)
            .includes(passenger.type)
    ) {

        throw new DuffelValidationError(
            `Unsupported passenger type: ${passenger.type}`
        );

    }

}

/**
 * Builds the passenger payload expected
 * by the Duffel Orders API.
 *
 * @param {Object} passenger
 * @returns {Object}
 */
function buildPassenger(passenger) {

    validatePassenger(passenger);

    return {

        given_name: passenger.given_name,

        family_name: passenger.family_name,

        title: passenger.title,

        type: passenger.type,

        born_on: passenger.born_on,

        gender: passenger.gender,

        email: passenger.email,

        phone_number: passenger.phone_number

    };

}

/**
 * Normalizes a passenger object
 * for ETAS™ consumption.
 *
 * @param {Object} passenger
 * @returns {Object}
 */
function normalizePassenger(passenger = {}) {

    return normalize.normalizePassenger(
        passenger
    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Creates a Passenger object.
 *
 * Part 2 implements this function.
 */
async function createPassenger() {

    throw new Error(
        "createPassenger() not yet implemented."
    );

}

/**
 * Retrieves a Passenger object.
 *
 * Part 3 implements this function.
 */
async function getPassenger() {

    throw new Error(
        "getPassenger() not yet implemented."
    );

}

/**
 * Updates a Passenger object.
 *
 * Part 4 implements this function.
 */
async function updatePassenger() {

    throw new Error(
        "updatePassenger() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Create Passenger
 * --------------------------------------------------------------------------
 * Creates and validates an ETAS-compatible passenger object.
 *
 * NOTE:
 * Duffel does not create standalone Passenger resources.
 * This function prepares a validated passenger object that will later
 * be embedded within an Offer Request or Order.
 *
 * Used by:
 * - AI Concierge
 * - Canonical Trip Object
 * - ETAS™
 * - orders.js
 *
 * @param {Object} passenger
 * @returns {Promise<Object>}
 */
async function createPassenger(passenger = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Passenger
    --------------------------------------------------------------------------
    */

    validatePassenger(passenger);

    /*
    --------------------------------------------------------------------------
    Build Duffel Passenger Payload
    --------------------------------------------------------------------------
    */

    const payload = buildPassenger(passenger);

    /*
    --------------------------------------------------------------------------
    Normalize Passenger
    --------------------------------------------------------------------------
    */

    const normalizedPassenger =
        normalizePassenger(payload);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Passenger
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        createdAt: new Date().toISOString(),

        passenger: normalizedPassenger

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Passenger
 * --------------------------------------------------------------------------
 * Retrieves a passenger from an ETAS-compatible passenger collection.
 *
 * NOTE:
 * Duffel does not expose a Passenger endpoint.
 * Passengers exist only within Offer Requests and Orders.
 *
 * This function searches the provided passenger collection and returns
 * a normalized passenger object.
 *
 * Used by:
 * - ETAS™
 * - Canonical Trip Object
 * - Traveler Dashboard
 * - Executive Briefings
 *
 * @param {Array} passengers
 * @param {string} passengerId
 * @returns {Promise<Object>}
 */
async function getPassenger(
    passengers = [],
    passengerId
) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!Array.isArray(passengers)) {

        throw new DuffelValidationError(
            "Passenger collection must be an array."
        );

    }

    if (!passengerId) {

        throw new DuffelValidationError(
            "Passenger ID is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Locate Passenger
    --------------------------------------------------------------------------
    */

    const passenger = passengers.find(

        (p) => p.id === passengerId

    );

    if (!passenger) {

        throw new DuffelValidationError(
            `Passenger '${passengerId}' could not be found.`
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Passenger
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        passenger: normalizePassenger(
            passenger
        )

    };

}

/**
 * --------------------------------------------------------------------------
 * Update Passenger
 * --------------------------------------------------------------------------
 * Updates an existing passenger object.
 *
 * NOTE:
 * Duffel does not expose a standalone Passenger Update endpoint.
 * Passenger information is maintained within the Canonical Trip Object
 * until submitted as part of an Order.
 *
 * This function updates the passenger locally while preserving
 * ETAS™ compatibility.
 *
 * Used by:
 * - AI Concierge
 * - Canonical Trip Object
 * - Traveler Dashboard
 * - ETAS™
 *
 * @param {Array} passengers
 * @param {string} passengerId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
async function updatePassenger(
    passengers = [],
    passengerId,
    updates = {}
) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!Array.isArray(passengers)) {

        throw new DuffelValidationError(
            "Passenger collection must be an array."
        );

    }

    if (!passengerId) {

        throw new DuffelValidationError(
            "Passenger ID is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Locate Passenger
    --------------------------------------------------------------------------
    */

    const index = passengers.findIndex(

        (p) => p.id === passengerId

    );

    if (index === -1) {

        throw new DuffelValidationError(
            `Passenger '${passengerId}' could not be found.`
        );

    }

    /*
    --------------------------------------------------------------------------
    Merge Updates
    --------------------------------------------------------------------------
    */

    const updatedPassenger = {

        ...passengers[index],

        ...updates

    };

    /*
    --------------------------------------------------------------------------
    Validate Updated Passenger
    --------------------------------------------------------------------------
    */

    validatePassenger(updatedPassenger);

    /*
    --------------------------------------------------------------------------
    Save Updated Passenger
    --------------------------------------------------------------------------
    */

    passengers[index] = updatedPassenger;

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Passenger
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        updatedAt: new Date().toISOString(),

        passenger: normalizePassenger(
            updatedPassenger
        )

    };

}

/*
|--------------------------------------------------------------------------
| Passenger Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the passenger's full name.
 *
 * @param {Object} passenger
 * @returns {string}
 */
function getFullName(passenger = {}) {

    return [
        passenger.givenName || passenger.given_name || "",
        passenger.familyName || passenger.family_name || ""
    ]
        .filter(Boolean)
        .join(" ");

}

/**
 * Returns the passenger type.
 *
 * @param {Object} passenger
 * @returns {string|null}
 */
function getPassengerType(passenger = {}) {

    return passenger.type || null;

}

/**
 * Determines whether the passenger is an adult.
 *
 * @param {Object} passenger
 * @returns {boolean}
 */
function isAdult(passenger = {}) {

    return passenger.type === PASSENGER_TYPES.ADULT;

}

/**
 * Determines whether the passenger is a child.
 *
 * @param {Object} passenger
 * @returns {boolean}
 */
function isChild(passenger = {}) {

    return passenger.type === PASSENGER_TYPES.CHILD;

}

/**
 * Determines whether the passenger is an infant.
 *
 * @param {Object} passenger
 * @returns {boolean}
 */
function isInfant(passenger = {}) {

    return passenger.type === PASSENGER_TYPES.INFANT;

}

/**
 * Returns the passenger's age.
 *
 * NOTE:
 * Age is calculated from born_on when available.
 *
 * @param {Object} passenger
 * @returns {number|null}
 */
function getAge(passenger = {}) {

    if (!passenger.born_on) {
        return null;
    }

    const birthDate = new Date(passenger.born_on);
    const today = new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age;

}

/**
 * Determines whether the passenger is the primary traveler.
 *
 * @param {Object} passenger
 * @returns {boolean}
 */
function isPrimaryTraveler(passenger = {}) {

    return Boolean(passenger.primaryTraveler);

}

/**
 * Returns the passenger email address.
 *
 * @param {Object} passenger
 * @returns {string|null}
 */
function getEmail(passenger = {}) {

    return passenger.email || null;

}

/**
 * Returns the passenger phone number.
 *
 * @param {Object} passenger
 * @returns {string|null}
 */
function getPhoneNumber(passenger = {}) {

    return passenger.phone_number || null;

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All passenger operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Passenger Operations
    |--------------------------------------------------------------------------
    */

    createPassenger,

    getPassenger,

    updatePassenger,

    /*
    |--------------------------------------------------------------------------
    | Passenger Helper Functions
    |--------------------------------------------------------------------------
    */

    getFullName,

    getPassengerType,

    isAdult,

    isChild,

    isInfant,

    getAge,

    isPrimaryTraveler,

    getEmail,

    getPhoneNumber

});
