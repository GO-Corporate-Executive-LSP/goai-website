/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: hotels.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides hotel search, booking, and lodging intelligence services
 * for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Search hotels
 * - Retrieve hotel information
 * - Retrieve room rates
 * - Book hotel stays
 * - Support ETAS™ and SENTINEL™ continuity recommendations
 *
 * IMPORTANT:
 * Hotels are first-class objects within the Canonical Trip Object.
 * Lodging continuity is just as important as flight continuity during
 * travel disruptions.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * SENTINEL™
 *        │
 *        ▼
 * hotels.js
 *        │
 *        ▼
 * client.js
 *        │
 *        ▼
 * Duffel Hotels API
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Duffel Hotels API
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

const HOTELS_ENDPOINT = "/stays/hotels";

const HOTEL_OFFERS_ENDPOINT = "/stays/offers";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates a hotel identifier.
 *
 * @param {string} hotelId
 * @throws {DuffelValidationError}
 */
function validateHotelId(hotelId) {

    if (!hotelId) {

        throw new DuffelValidationError(
            "Hotel ID is required."
        );

    }

}

/**
 * Builds a hotel search request.
 *
 * @param {Object} filters
 * @returns {Object}
 */
function buildHotelSearch(filters = {}) {

    return {

        location:
            filters.location || "",

        check_in:
            filters.checkIn || "",

        check_out:
            filters.checkOut || "",

        guests:
            filters.guests || 1,

        rooms:
            filters.rooms || 1,

        currency:
            filters.currency || "USD"

    };

}

/**
 * Normalizes hotel collections.
 *
 * @param {Object} response
 * @returns {Array}
 */
function normalizeHotels(response = {}) {

    const hotels =
        response.data || [];

    return normalize.normalizeCollection(

        hotels,

        normalize.normalizeHotel

    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Searches hotels.
 *
 * Part 2 implements this function.
 */
async function searchHotels() {

    throw new Error(
        "searchHotels() not yet implemented."
    );

}

/**
 * Retrieves hotel details.
 *
 * Part 3 implements this function.
 */
async function getHotel() {

    throw new Error(
        "getHotel() not yet implemented."
    );

}

/**
 * Retrieves hotel rates.
 *
 * Part 4 implements this function.
 */
async function getHotelRates() {

    throw new Error(
        "getHotelRates() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Search Hotels
 * --------------------------------------------------------------------------
 * Searches the Duffel Hotels API for available hotels.
 *
 * IMPORTANT:
 * Hotel availability is determined by location, stay dates,
 * occupancy, and provider inventory.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - AI Concierge
 * - Executive Briefings
 * - Traveler Dashboard
 *
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
async function searchHotels(filters = {}) {

    /*
    --------------------------------------------------------------------------
    Build Search Request
    --------------------------------------------------------------------------
    */

    const search =
        buildHotelSearch(filters);

    const query =
        new URLSearchParams(search).toString();

    let response;

    /*
    --------------------------------------------------------------------------
    Execute Search
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${HOTELS_ENDPOINT}?${query}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {

            throw error;

        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to search hotels.",
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
                    "Duffel returned an invalid hotel search response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Hotels
    --------------------------------------------------------------------------
    */

    const hotels =
        normalizeHotels(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Collection
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        searchedAt:
            new Date().toISOString(),

        count:
            hotels.length,

        hotels

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Hotel
 * --------------------------------------------------------------------------
 * Retrieves detailed information for a single hotel from the
 * Duffel Hotels API.
 *
 * IMPORTANT:
 * Hotel details include property information, amenities,
 * location, policies, and metadata used by ETAS™ and SENTINEL™.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Traveler Dashboard
 * - AI Concierge
 *
 * @param {string} hotelId
 * @returns {Promise<Object>}
 */
async function getHotel(hotelId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateHotelId(hotelId);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Hotel
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${HOTELS_ENDPOINT}/${hotelId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {

            throw error;

        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve hotel information.",
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
                    "Duffel returned an invalid hotel response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Hotel
    --------------------------------------------------------------------------
    */

    const hotel =
        normalize.normalizeHotel(
            response.data
        );

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Hotel
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        hotel

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Hotel Rates
 * --------------------------------------------------------------------------
 * Retrieves available room rates and offers for a hotel.
 *
 * IMPORTANT:
 * Hotel rates are dynamic and may vary based on:
 * - Availability
 * - Occupancy
 * - Cancellation policy
 * - Rate plan
 * - Length of stay
 *
 * Future versions will enrich hotel rates with SENTINEL™
 * continuity intelligence before presenting recommendations.
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Traveler Dashboard
 * - AI Concierge
 *
 * @param {string} hotelId
 * @returns {Promise<Object>}
 */
async function getHotelRates(hotelId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    validateHotelId(hotelId);

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Hotel Rates
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `${HOTEL_OFFERS_ENDPOINT}?hotel_id=${hotelId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {

            throw error;

        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve hotel rates.",
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
                    "Duffel returned an invalid hotel rates response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Rates
    --------------------------------------------------------------------------
    */

    const rates = response.data.map((rate) => ({

        id: rate.id,

        roomType:
            rate.room_type,

        boardType:
            rate.board_type,

        price: {

            amount:
                rate.total_amount,

            currency:
                rate.total_currency

        },

        cancellationPolicy:
            rate.cancellation_policy,

        refundable:
            rate.refundable,

        raw: rate

    }));

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Hotel Rates
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        hotelId,

        count:
            rates.length,

        rates

    };

}

/*
|--------------------------------------------------------------------------
| Hotel Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Returns the hotel name.
 *
 * @param {Object} hotel
 * @returns {string|null}
 */
function getHotelName(hotel = {}) {

    return hotel.name || null;

}

/**
 * Returns the hotel's star rating.
 *
 * @param {Object} hotel
 * @returns {number|null}
 */
function getStarRating(hotel = {}) {

    return hotel.starRating ||
           hotel.star_rating ||
           null;

}

/**
 * Returns the nightly room rate.
 *
 * @param {Object} rate
 * @returns {Object}
 */
function getNightlyRate(rate = {}) {

    return {

        amount:
            rate.price?.amount ||
            rate.total_amount ||
            null,

        currency:
            rate.price?.currency ||
            rate.total_currency ||
            null

    };

}

/**
 * Determines whether the hotel rate
 * is refundable.
 *
 * @param {Object} rate
 * @returns {boolean}
 */
function isRefundable(rate = {}) {

    return Boolean(rate.refundable);

}

/**
 * Returns the hotel's check-in time.
 *
 * @param {Object} hotel
 * @returns {string|null}
 */
function getCheckInTime(hotel = {}) {

    return hotel.checkInTime ||
           hotel.check_in_time ||
           null;

}

/**
 * Returns the hotel's check-out time.
 *
 * @param {Object} hotel
 * @returns {string|null}
 */
function getCheckOutTime(hotel = {}) {

    return hotel.checkOutTime ||
           hotel.check_out_time ||
           null;

}

/**
 * Returns the hotel's geographic coordinates.
 *
 * @param {Object} hotel
 * @returns {Object}
 */
function getCoordinates(hotel = {}) {

    return {

        latitude:
            hotel.latitude ||
            null,

        longitude:
            hotel.longitude ||
            null

    };

}

/**
 * Determines whether the hotel
 * provides airport shuttle service.
 *
 * @param {Object} hotel
 * @returns {boolean}
 */
function hasAirportShuttle(hotel = {}) {

    return Boolean(

        hotel.airportShuttle ||
        hotel.airport_shuttle

    );

}

/**
 * Determines whether two hotel objects
 * represent the same property.
 *
 * @param {Object} hotelA
 * @param {Object} hotelB
 * @returns {boolean}
 */
function isSameHotel(
    hotelA = {},
    hotelB = {}
) {

    return hotelA.id &&
           hotelA.id === hotelB.id;

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All hotel operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Hotel Operations
    |--------------------------------------------------------------------------
    */

    searchHotels,

    getHotel,

    getHotelRates,

    /*
    |--------------------------------------------------------------------------
    | Hotel Helper Functions
    |--------------------------------------------------------------------------
    */

    getHotelName,

    getStarRating,

    getNightlyRate,

    isRefundable,

    getCheckInTime,

    getCheckOutTime,

    getCoordinates,

    hasAirportShuttle,

    isSameHotel

});
