/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: airlines.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides airline lookup and airline intelligence services for the
 * Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Retrieve airline information
 * - Search airlines
 * - Support airline intelligence
 * - Normalize airline data
 * - Support ETAS™ and SENTINEL™ recommendations
 *
 * IMPORTANT:
 * Airline intelligence supports booking workflows,
 * disruption management, carrier preference logic,
 * and future alliance/codeshare analysis.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * SENTINEL™
 *        │
 *        ▼
 * airlines.js
 *        │
 *        ▼
 * client.js
 *        │
 *        ▼
 * Duffel Airlines API
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

const AIRLINE_ENDPOINT = "/air/airlines";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates an airline identifier.
 *
 * @param {string} airlineCode
 * @throws {DuffelValidationError}
 */
function validateAirlineCode(airlineCode) {

    if (!airlineCode) {

        throw new DuffelValidationError(
            "Airline code is required."
        );

    }

    if (
        typeof airlineCode !== "string" ||
        airlineCode.trim().length < 2
    ) {

        throw new DuffelValidationError(
            "Invalid airline code."
        );

    }

}

/**
 * Builds a Duffel airline search request.
 *
 * @param {Object} filters
 * @returns {Object}
 */
function buildAirlineSearch(filters = {}) {

    return {

        query: filters.query || "",

        country: filters.country || "",

        alliance: filters.alliance || ""

    };

}

/**
 * Normalizes airline collections.
 *
 * @param {Object} response
 * @returns {Array}
 */
function normalizeAirlines(response = {}) {

    const airlines =
        response.data || [];

    return normalize.normalizeCollection(

        airlines,

        normalize.normalizeAirline

    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Retrieves a single airline.
 *
 * Part 2 implements this function.
 */
async function getAirline() {

    throw new Error(
        "getAirline() not yet implemented."
    );

}

/**
 * Searches airlines.
 *
 * Part 3 implements this function.
 */
async function searchAirlines() {

    throw new Error(
        "searchAirlines() not yet implemented."
    );

}

/**
 * Retrieves partner airlines.
 *
 * Part 4 implements this function.
 */
async function getPartnerAirlines() {

    throw new Error(
        "getPartnerAirlines() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Airline
 * --------------------------------------------------------------------------
 * Retrieves a single airline from the Duffel API.
 *
 * Reference:
 * Duffel Airlines API
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Traveler Dashboard
 * - Carrier Intelligence
 *
 * @param {string} airlineCode
 * @returns {Promise<Object>}
 */
async function getAirline(airlineCode) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateAirlineCode(airlineCode);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Airline
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${AIRLINE_ENDPOINT}/${airlineCode}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve airline information.",
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
                    "Duffel returned an invalid airline response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Response
    --------------------------------------------------------------------------
    */

    const airline = normalize.normalizeAirline(
        response.data
    );

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Airline
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        airline

    };

}

/**
 * --------------------------------------------------------------------------
 * Search Airlines
 * --------------------------------------------------------------------------
 * Searches the Duffel Airlines API using airline code,
 * airline name, country, or alliance filters.
 *
 * Used by:
 * - AI Concierge
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Carrier Recommendation Engine
 *
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
async function searchAirlines(filters = {}) {

    /*
    --------------------------------------------------------------------------
    Build Search Request
    --------------------------------------------------------------------------
    */

    const search = buildAirlineSearch(filters);

    const query = new URLSearchParams(search).toString();

    let response;

    /*
    --------------------------------------------------------------------------
    Execute Search
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${AIRLINE_ENDPOINT}?${query}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to search airlines.",
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
                    "Duffel returned an invalid airline search response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Results
    --------------------------------------------------------------------------
    */

    const airlines =
        normalizeAirlines(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Collection
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        searchedAt:
            new Date().toISOString(),

        count: airlines.length,

        airlines

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Partner Airlines
 * --------------------------------------------------------------------------
 * Retrieves partner airlines associated with a carrier.
 *
 * IMPORTANT:
 * Duffel does not currently expose a dedicated Airline Partnerships
 * or Alliance API.
 *
 * Version 1.0 establishes the interface that SENTINEL™ and ETAS™
 * will use in future releases.
 *
 * Future integrations may include:
 * - IATA Alliance Data
 * - Oneworld
 * - SkyTeam
 * - Star Alliance
 * - Codeshare Intelligence
 * - FlightAware
 * - AviationStack
 * - Internal GÖ.AI Knowledge Graph
 *
 * Used by:
 * - SENTINEL™
 * - ETAS™
 * - Twin Trip Simulation
 * - Automatic Rebooking
 * - Executive Briefings
 *
 * @param {string} airlineCode
 * @returns {Promise<Object>}
 */
async function getPartnerAirlines(airlineCode) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateAirlineCode(airlineCode);

    /*
    --------------------------------------------------------------------------
    Retrieve Primary Airline
    --------------------------------------------------------------------------
    */

    const primaryAirline =
        await getAirline(airlineCode);

    /*
    --------------------------------------------------------------------------
    Future Enhancement
    --------------------------------------------------------------------------
    Version 1.0 returns the primary airline only.

    Future releases will augment this function with:

        - Airline alliance membership
        - Codeshare partners
        - Joint venture carriers
        - Interline agreements
        - Preferred enterprise carriers
        - Alternate rebooking recommendations
        - SENTINEL™ continuity scoring

    This preserves a stable interface while allowing
    progressively richer airline intelligence.
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        primaryAirline:
            primaryAirline.airline,

        partnerAirlines: [
            primaryAirline.airline
        ]

    };

}

/*
|--------------------------------------------------------------------------
| Airline Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the airline IATA code.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getIATACode(airline = {}) {

    return airline.iataCode ||
           airline.iata_code ||
           null;

}

/**
 * Returns the airline ICAO code.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getICAOCode(airline = {}) {

    return airline.icaoCode ||
           airline.icao_code ||
           null;

}

/**
 * Returns the airline name.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getAirlineName(airline = {}) {

    return airline.name || null;

}

/**
 * Returns the airline's country.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getCountry(airline = {}) {

    return airline.country || null;

}

/**
 * Determines whether the airline is a
 * low-cost carrier.
 *
 * NOTE:
 * Version 1.0 uses the Duffel field if present.
 * Future versions may enhance this with
 * aviation intelligence sources.
 *
 * @param {Object} airline
 * @returns {boolean}
 */
function isLowCostCarrier(airline = {}) {

    return Boolean(
        airline.lowCost ||
        airline.low_cost ||
        airline.isLowCostCarrier
    );

}

/**
 * Determines whether an airline is a
 * codeshare partner.
 *
 * NOTE:
 * Version 1.0 checks only the airline object.
 * Future releases will integrate alliance and
 * codeshare intelligence databases.
 *
 * @param {Object} airline
 * @returns {boolean}
 */
function isCodesharePartner(airline = {}) {

    return Boolean(
        airline.codeshare ||
        airline.isCodesharePartner
    );

}

/**
 * Returns the airline alliance.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getAlliance(airline = {}) {

    return airline.alliance || null;

}

/**
 * Returns the airline callsign.
 *
 * @param {Object} airline
 * @returns {string|null}
 */
function getCallsign(airline = {}) {

    return airline.callsign || null;

}

/**
 * Determines whether two airlines are identical.
 *
 * @param {Object} airlineA
 * @param {Object} airlineB
 * @returns {boolean}
 */
function isSameAirline(
    airlineA = {},
    airlineB = {}
) {

    return (
        getIATACode(airlineA) ===
        getIATACode(airlineB)
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All airline operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Airline Operations
    |--------------------------------------------------------------------------
    */

    getAirline,

    searchAirlines,

    getPartnerAirlines,

    /*
    |--------------------------------------------------------------------------
    | Airline Helper Functions
    |--------------------------------------------------------------------------
    */

    getIATACode,

    getICAOCode,

    getAirlineName,

    getCountry,

    isLowCostCarrier,

    isCodesharePartner,

    getAlliance,

    getCallsign,

    isSameAirline

});
