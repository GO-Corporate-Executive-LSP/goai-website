/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: normalize.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Converts raw Duffel API responses into standardized ETAS-compatible
 * objects that can be consumed by SENTINEL™, ETAS™, and the
 * Canonical Trip Object.
 *
 * Responsibilities:
 * - Normalize Offers
 * - Normalize Orders
 * - Normalize Passengers
 * - Normalize Airports
 * - Normalize Airlines
 * - Remove provider-specific complexity
 * - Return predictable objects
 *
 * NOTE:
 * ETAS should never consume raw Duffel responses directly.
 * Every response should pass through this module.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/**
 * Normalize Flight Offer
 *
 * @param {Object} offer
 * @returns {Object}
 */
function normalizeOffer(offer = {}) {
  return {
    provider: "Duffel",

    id: offer.id,

    expiresAt: offer.expires_at,

    totalAmount: offer.total_amount,

    totalCurrency: offer.total_currency,

    owner: offer.owner?.name || null,

    slices: offer.slices || [],

    passengers: offer.passengers || [],

    raw: offer,
  };
}

/**
 * Normalize Booking Order
 *
 * @param {Object} order
 * @returns {Object}
 */
function normalizeOrder(order = {}) {
  return {
    provider: "Duffel",

    id: order.id,

    bookingReference:
      order.booking_reference || null,

    status: order.status || null,

    createdAt: order.created_at || null,

    passengers: order.passengers || [],

    slices: order.slices || [],

    totalAmount: order.total_amount,

    totalCurrency: order.total_currency,

    raw: order,
  };
}

/**
 * Normalize Passenger
 *
 * @param {Object} passenger
 * @returns {Object}
 */
function normalizePassenger(passenger = {}) {
  return {
    id: passenger.id,

    givenName: passenger.given_name,

    familyName: passenger.family_name,

    title: passenger.title,

    age: passenger.age,

    type: passenger.type,

    raw: passenger,
  };
}

/**
 * Normalize Airport
 *
 * @param {Object} airport
 * @returns {Object}
 */
function normalizeAirport(airport = {}) {
  return {
    id: airport.id,

    iataCode: airport.iata_code,

    icaoCode: airport.icao_code,

    cityName: airport.city_name,

    name: airport.name,

    timezone: airport.time_zone,

    raw: airport,
  };
}

/**
 * Normalize Airline
 *
 * @param {Object} airline
 * @returns {Object}
 */
function normalizeAirline(airline = {}) {
  return {
    id: airline.id,

    iataCode: airline.iata_code,

    icaoCode: airline.icao_code,

    name: airline.name,

    raw: airline,
  };
}

/**
 * Normalize Generic Collection
 *
 * @param {Array} items
 * @param {Function} normalizer
 * @returns {Array}
 */
function normalizeCollection(
  items = [],
  normalizer
) {
  return items.map(normalizer);
}

module.exports = {
  normalizeOffer,
  normalizeOrder,
  normalizePassenger,
  normalizeAirport,
  normalizeAirline,
  normalizeCollection,
};
