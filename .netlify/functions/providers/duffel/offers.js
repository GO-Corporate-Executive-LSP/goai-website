/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: offers.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides all flight offer operations for the Duffel API.
 *
 * Responsibilities:
 * - Search flight offers
 * - Retrieve offer details
 * - Validate offers
 * - Normalize responses
 * - Prepare offers for ETAS™ orchestration
 *
 * ETAS™ should NEVER communicate directly with the Duffel API.
 * All flight offer operations must flow through this module.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *     │
 *     ▼
 * offers.js
 *     │
 *     ▼
 * client.js
 *     │
 *     ▼
 * Duffel REST API
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

const OFFER_ENDPOINT = "/air/offer_requests";

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates a search request before sending it
 * to the Duffel API.
 *
 * @param {Object} request
 * @throws {DuffelValidationError}
 */
function validateSearchRequest(request = {}) {

    if (!request.slices || !Array.isArray(request.slices)) {
        throw new DuffelValidationError(
            "Flight search requires at least one slice."
        );
    }

    if (!request.passengers || !Array.isArray(request.passengers)) {
        throw new DuffelValidationError(
            "Passenger information is required."
        );
    }

    if (request.slices.length === 0) {
        throw new DuffelValidationError(
            "At least one trip segment must be provided."
        );
    }

}

/**
 * Builds the request payload expected by Duffel.
 *
 * Future versions may enrich or transform the
 * Canonical Trip Object before transmission.
 *
 * @param {Object} trip
 * @returns {Object}
 */
function buildOfferRequest(trip) {

    return {
        data: trip
    };

}

/**
 * Normalizes the collection returned by Duffel.
 *
 * @param {Object} response
 * @returns {Array}
 */
function normalizeOffers(response = {}) {

    const offers =
        response.data?.offers ||
        response.data ||
        [];

    return normalize.normalizeCollection(
        offers,
        normalize.normalizeOffer
    );

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Search flight offers.
 *
 * Part 2 implements this function.
 */

async function searchOffers() {
    throw new Error(
        "searchOffers() not yet implemented."
    );
}

/**
 * Retrieve a specific offer.
 *
 * Part 3 implements this function.
 */

async function getOffer() {
    throw new Error(
        "getOffer() not yet implemented."
    );
}

/**
 * Select an offer.
 *
 * Part 4 implements this function.
 */

async function selectOffer() {
    throw new Error(
        "selectOffer() not yet implemented."
    );
}

/**
 * --------------------------------------------------------------------------
 * Search Flight Offers
 * --------------------------------------------------------------------------
 * Creates a Duffel Offer Request and returns a normalized collection
 * of available flight offers.
 *
 * Reference:
 * Lee Kosek Postman Collection
 * - Searching for Flights
 * - Searching for Flights (Single Passenger)
 *
 * @param {Object} trip
 * @returns {Promise<Array>}
 */
async function searchOffers(trip = {}) {

    validateSearchRequest(trip);

    const payload = buildOfferRequest(trip);

    let response;

    try {

        response = await client.post(
            OFFER_ENDPOINT,
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
                    "Unable to retrieve flight offers from Duffel.",
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
                    "Duffel returned an invalid offer response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Results
    --------------------------------------------------------------------------
    */

    const offers = normalizeOffers(response);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Objects
    --------------------------------------------------------------------------
    */

    return offers;

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Flight Offer
 * --------------------------------------------------------------------------
 * Retrieves a specific flight offer from a previously created
 * Duffel Offer Request.
 *
 * Reference:
 * Lee Kosek Postman Collection
 * - Selecting an Offer
 *
 * NOTE:
 * Offer IDs are temporary and may expire.
 *
 * @param {string} offerId
 * @returns {Promise<Object>}
 */
async function getOffer(offerId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!offerId) {
        throw new DuffelValidationError(
            "Offer ID is required."
        );
    }

    let response;

    /*
    --------------------------------------------------------------------------
    Retrieve Offer
    --------------------------------------------------------------------------
    */

    try {

        response = await client.get(
            `/air/offers/${offerId}`
        );

    } catch (error) {

        if (error instanceof DuffelApiError) {
            throw error;
        }

        throw new DuffelApiError(
            500,
            {
                message:
                    "Unable to retrieve flight offer.",
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
                    "Duffel returned an invalid offer response."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Response
    --------------------------------------------------------------------------
    */

    return normalize.normalizeOffer(
        response.data
    );

}

/**
 * --------------------------------------------------------------------------
 * Select Flight Offer
 * --------------------------------------------------------------------------
 * Validates and prepares a selected offer for booking.
 *
 * This function retrieves the latest version of the offer,
 * verifies that it is still valid, normalizes the response,
 * and returns an ETAS-ready object for Order creation.
 *
 * Reference:
 * Lee Kosek Postman Collection
 * - Selecting an Offer
 *
 * NOTE:
 * Selecting an offer does NOT create a booking.
 * Booking occurs in orders.js.
 *
 * @param {string} offerId
 * @returns {Promise<Object>}
 */
async function selectOffer(offerId) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!offerId) {
        throw new DuffelValidationError(
            "Offer ID is required."
        );
    }

    /*
    --------------------------------------------------------------------------
    Retrieve Latest Offer
    --------------------------------------------------------------------------
    */

    const offer = await getOffer(offerId);

    /*
    --------------------------------------------------------------------------
    Verify Offer Status
    --------------------------------------------------------------------------
    */

    if (!offer) {

        throw new DuffelApiError(
            404,
            {
                message:
                    "Requested offer could not be found."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Verify Offer Expiration
    --------------------------------------------------------------------------
    */

    if (
        offer.expiresAt &&
        new Date(offer.expiresAt) < new Date()
    ) {

        throw new DuffelValidationError(
            "The selected offer has expired."
        );

    }

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Offer
    --------------------------------------------------------------------------
    */

    return {
        selected: true,

        selectedAt: new Date().toISOString(),

        offer
    };

}

/*
|--------------------------------------------------------------------------
| Offer Filtering & Validation Helpers
|--------------------------------------------------------------------------
*/

/**
 * Returns only offers that are still valid.
 *
 * @param {Array} offers
 * @returns {Array}
 */
function filterValidOffers(offers = []) {

    const now = new Date();

    return offers.filter((offer) => {

        if (!offer.expiresAt) {
            return true;
        }

        return new Date(offer.expiresAt) > now;

    });

}

/**
 * Sort offers by total price (ascending).
 *
 * @param {Array} offers
 * @returns {Array}
 */
function sortByLowestPrice(offers = []) {

    return [...offers].sort((a, b) => {

        return (
            Number(a.totalAmount || 0) -
            Number(b.totalAmount || 0)
        );

    });

}

/**
 * Filters offers by airline.
 *
 * @param {Array} offers
 * @param {string} airlineName
 * @returns {Array}
 */
function filterByAirline(
    offers = [],
    airlineName
) {

    if (!airlineName) {
        return offers;
    }

    return offers.filter((offer) =>

        offer.owner &&
        offer.owner
            .toLowerCase()
            .includes(
                airlineName.toLowerCase()
            )

    );

}

/**
 * Filters offers by maximum price.
 *
 * @param {Array} offers
 * @param {number} maxPrice
 * @returns {Array}
 */
function filterByMaxPrice(
    offers = [],
    maxPrice
) {

    if (!maxPrice) {
        return offers;
    }

    return offers.filter(

        (offer) =>
            Number(offer.totalAmount) <= maxPrice

    );

}

/**
 * Finds the lowest-priced offer.
 *
 * @param {Array} offers
 * @returns {Object|null}
 */
function getBestOffer(offers = []) {

    if (!offers.length) {
        return null;
    }

    return sortByLowestPrice(offers)[0];

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All flight offer operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Operations
    |--------------------------------------------------------------------------
    */

    searchOffers,

    getOffer,

    selectOffer,

    /*
    |--------------------------------------------------------------------------
    | Filtering Utilities
    |--------------------------------------------------------------------------
    */

    filterValidOffers,

    filterByAirline,

    filterByMaxPrice,

    sortByLowestPrice,

    getBestOffer

});
