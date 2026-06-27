/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: client.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Central HTTP client for all Duffel API communication.
 *
 * All provider modules (offers.js, orders.js, airports.js, etc.)
 * communicate with Duffel through this client.
 *
 * Responsibilities:
 * - Authenticate requests
 * - Attach required headers
 * - Execute GET, POST, PATCH, DELETE requests
 * - Handle retries
 * - Normalize errors
 * - Return parsed JSON responses
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

const config = require("./config");
const retry = require("./retry");
const { DuffelApiError } = require("./errors");

/**
 * Standard request headers.
 */
function buildHeaders() {
  return {
    Authorization: `Bearer ${config.DUFFEL_API_TOKEN}`,
    "Duffel-Version": config.DUFFEL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/**
 * Executes a Duffel API request.
 *
 * @param {string} method
 * @param {string} endpoint
 * @param {Object|null} body
 * @returns {Promise<Object>}
 */
async function request(method, endpoint, body = null) {
  const url = `${config.BASE_URL}${endpoint}`;

  return retry(async () => {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(config.TIMEOUT),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new DuffelApiError(
        response.status,
        json
      );
    }

    return json;
  });
}

/**
 * Convenience Methods
 */

async function get(endpoint) {
  return request("GET", endpoint);
}

async function post(endpoint, body) {
  return request("POST", endpoint, body);
}

async function patch(endpoint, body) {
  return request("PATCH", endpoint, body);
}

async function del(endpoint) {
  return request("DELETE", endpoint);
}

module.exports = {
  get,
  post,
  patch,
  delete: del,
};
