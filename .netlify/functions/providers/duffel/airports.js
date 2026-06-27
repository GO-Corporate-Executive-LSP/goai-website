/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: airports.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides airport lookup and airport intelligence services for the
 * Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Retrieve airport information
 * - Search airports
 * - Discover nearby airports
 * - Normalize airport data
 * - Support ETAS™ and SENTINEL™ recommendations
 *
 * IMPORTANT:
 * Airport intelligence supports both booking workflows and
 * disruption management.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * SENTINEL™
 *        │
 *        ▼
 * airports.js
 *        │
 *        ▼
 * client.js
 *        │
 *        ▼
 * Duffel Airports API
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

const AIRPORT_ENDPOINT = "/air/airports";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates an airport identifier.
 *
 * @param {string} airportCode
 * @throws {DuffelValidationError}
 */
function validateAirportCode(airportCode) {

    if (!airportCode) {

        throw new DuffelValidationError(
            "Airport code is required."
        );

    }

    if (
        typeof airportCode !== "string" ||
        airportCode.trim().length < 3
    ) {

        throw new DuffelValidationError(
            "Invalid airport code."
        );

    }

}

/**
 * Builds a Duffel airport search payload.
 *
 * @param {Object} filters
 * @returns {Object}
 */
function buildAirportSearch(filters = {}) {

    return {

        query: filters.query || "",

        city: filters.city || "",

        country: filters.country || ""

    };

}

/**
 * Normalizes airport collections.
 *
 * @param {Object} response
 * @returns {Array}
 */
function normalizeAirports(response = {}) {

    const airports =
        response.data || [];

    return normalize.normalizeCollection(

        airports,

        normalize.normalizeAirport

    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Retrieves a single airport.
 *
 * Part 2 implements this function.
 */
async function getAirport() {

    throw new Error(
        "getAirport() not yet implemented."
    );

}

/**
 * Searches airports.
 *
 * Part 3 implements this function.
 */
async function searchAirports() {

    throw new Error(
        "searchAirports() not yet implemented."
    );

}

/**
 * Retrieves nearby airports.
 *
 * Part 4 implements this function.
 */
async function getNearbyAirports() {

    throw new Error(
        "getNearbyAirports() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Airport
 * --------------------------------------------------------------------------
 * Retrieves a single airport from the Duffel API.
 *
 * Reference:
 * Duffel Airports API
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Traveler Dashboard
 * - Alternate Airport Recommendations
 *
 * @param {string} airportCode
 * @returns {Promise<Object>}
 */
async function getAirport(airportCode) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateAirportCode(airportCode);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Airport
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${AIRPORT_ENDPOINT}/${airportCode}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve airport information.",
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
                    "Duffel returned an invalid airport response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Response
    --------------------------------------------------------------------------
    */

    const airport = normalize.normalizeAirport(
        response.data
    );

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Airport
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        airport

    };

}

/**
 * --------------------------------------------------------------------------
 * Search Airports
 * --------------------------------------------------------------------------
 * Searches the Duffel Airports API using airport code,
 * airport name, city, or country filters.
 *
 * Used by:
 * - AI Concierge
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Alternate Airport Recommendations
 *
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
async function searchAirports(filters = {}) {

    /*
    --------------------------------------------------------------------------
    Build Search Request
    --------------------------------------------------------------------------
    */

    const search = buildAirportSearch(filters);

    const query = new URLSearchParams(search).toString();

    let response;

    /*
    --------------------------------------------------------------------------
    Execute Search
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${AIRPORT_ENDPOINT}?${query}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to search airports.",
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
                    "Duffel returned an invalid airport search response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Results
    --------------------------------------------------------------------------
    */

    const airports =
        normalizeAirports(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Collection
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        searchedAt:
            new Date().toISOString(),

        count: airports.length,

        airports

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Nearby Airports
 * --------------------------------------------------------------------------
 * Identifies nearby airports that may serve as alternative departure
 * or arrival options during travel disruptions.
 *
 * IMPORTANT:
 * Duffel does not currently expose a dedicated Nearby Airports API.
 *
 * This implementation uses airport metadata returned from the Duffel
 * Airports API and is designed to be enhanced in future releases with:
 *
 * - OpenRouteService
 * - Mapbox
 * - FlightAware
 * - SENTINEL™ Corridor Intelligence
 * - Geospatial calculations
 *
 * Used by:
 * - SENTINEL™
 * - ETAS™
 * - Twin Trip Simulation
 * - Disruption Recovery
 * - Executive Briefings
 *
 * @param {string} airportCode
 * @returns {Promise<Array>}
 */
async function getNearbyAirports(airportCode) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateAirportCode(airportCode);

    /*
    --------------------------------------------------------------------------
    Retrieve Primary Airport
    --------------------------------------------------------------------------
    */

    const primaryAirport =
        await getAirport(airportCode);

    /*
    --------------------------------------------------------------------------
    Future Enhancement
    --------------------------------------------------------------------------
    Version 1.0 returns the primary airport only.

    Future releases will integrate:
        - Geographic radius searches
        - Alternate airport scoring
        - Ground transportation analysis
        - Twin Trip Simulation
        - SENTINEL™ recommendations
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        searchedAt:
            new Date().toISOString(),

        primaryAirport:
            primaryAirport.airport,

        nearbyAirports: [
            primaryAirport.airport
        ]

    };

}

/*
|--------------------------------------------------------------------------
| Airport Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the airport IATA code.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getIATACode(airport = {}) {

    return airport.iataCode ||
           airport.iata_code ||
           null;

}

/**
 * Returns the airport ICAO code.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getICAOCode(airport = {}) {

    return airport.icaoCode ||
           airport.icao_code ||
           null;

}

/**
 * Returns the airport name.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getAirportName(airport = {}) {

    return airport.name || null;

}

/**
 * Returns the airport city.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getCityName(airport = {}) {

    return airport.cityName ||
           airport.city_name ||
           null;

}

/**
 * Returns the airport timezone.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getTimezone(airport = {}) {

    return airport.timezone ||
           airport.time_zone ||
           null;

}

/**
 * Determines whether the airport supports
 * international operations.
 *
 * NOTE:
 * Version 1.0 uses the Duffel field if present.
 * Future versions may augment this with FAA,
 * ICAO, and SENTINEL™ intelligence.
 *
 * @param {Object} airport
 * @returns {boolean}
 */
function isInternationalAirport(airport = {}) {

    return Boolean(
        airport.international ||
        airport.isInternational
    );

}

/**
 * Returns the airport country.
 *
 * @param {Object} airport
 * @returns {string|null}
 */
function getCountry(airport = {}) {

    return airport.country || null;

}

/**
 * Returns the airport latitude and longitude.
 *
 * @param {Object} airport
 * @returns {Object}
 */
function getCoordinates(airport = {}) {

    return {

        latitude:
            airport.latitude || null,

        longitude:
            airport.longitude || null

    };

}

/**
 * Determines whether two airports are the same.
 *
 * @param {Object} airportA
 * @param {Object} airportB
 * @returns {boolean}
 */
function isSameAirport(
    airportA = {},
    airportB = {}
) {

    return (
        getIATACode(airportA) ===
        getIATACode(airportB)
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All airport operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Airport Operations
    |--------------------------------------------------------------------------
    */

    getAirport,

    searchAirports,

    getNearbyAirports,

    /*
    |--------------------------------------------------------------------------
    | Airport Helper Functions
    |--------------------------------------------------------------------------
    */

    getIATACode,

    getICAOCode,

    getAirportName,

    getCityName,

    getTimezone,

    isInternationalAirport,

    getCountry,

    getCoordinates,

    isSameAirport

});
