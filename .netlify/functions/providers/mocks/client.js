/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Jest Mock Client
 * File: __mocks__/client.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Mock implementation of the Duffel API client used during unit tests.
 *
 * Responsibilities:
 * - Prevent live API calls
 * - Return deterministic mock responses
 * - Simulate provider behavior
 * - Support error testing
 *
 * IMPORTANT:
 * This mock replaces client.js whenever Jest executes tests.
 * No real Duffel API requests are made.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Mock Client
|--------------------------------------------------------------------------
*/

const client = {

    /**
     * Mock GET request.
     *
     * @param {string} url
     * @returns {Promise<Object>}
     */
    get: jest.fn(async (url) => ({

        data: [],

        status: 200,

        url

    })),

    /**
     * Mock POST request.
     *
     * @param {string} url
     * @param {Object} body
     * @returns {Promise<Object>}
     */
    post: jest.fn(async (url, body = {}) => ({

        data: body,

        status: 201,

        url

    })),

    /**
     * Mock PUT request.
     *
     * @param {string} url
     * @param {Object} body
     * @returns {Promise<Object>}
     */
    put: jest.fn(async (url, body = {}) => ({

        data: body,

        status: 200,

        url

    })),

    /**
     * Mock PATCH request.
     *
     * @param {string} url
     * @param {Object} body
     * @returns {Promise<Object>}
     */
    patch: jest.fn(async (url, body = {}) => ({

        data: body,

        status: 200,

        url

    })),

    /**
     * Mock DELETE request.
     *
     * @param {string} url
     * @returns {Promise<Object>}
     */
    delete: jest.fn(async (url) => ({

        data: null,

        status: 204,

        url

    }))

};

module.exports = client;
