/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Jest Global Setup
 * File: jest.setup.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Global setup executed before every Jest test.
 *
 * Responsibilities:
 * - Configure test environment variables
 * - Reset mocks
 * - Configure global timeouts
 * - Suppress unnecessary console output
 * - Prepare provider adapters for testing
 *
 * NOTE:
 * This setup is provider-specific for v1.0.
 * It can later be promoted to the backend root and shared
 * across all provider adapters.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Environment Variables
|--------------------------------------------------------------------------
*/

process.env.NODE_ENV = "test";

process.env.DUFFEL_API_TOKEN =
    "test_api_token";

process.env.DUFFEL_WEBHOOK_SECRET =
    "test_webhook_secret";

process.env.DUFFEL_SANDBOX =
    "true";

process.env.DUFFEL_TIMEOUT =
    "10000";

/*
|--------------------------------------------------------------------------
| Global Timeout
|--------------------------------------------------------------------------
*/

jest.setTimeout(10000);

/*
|--------------------------------------------------------------------------
| Mock Cleanup
|--------------------------------------------------------------------------
*/

beforeEach(() => {

    jest.clearAllMocks();

    jest.restoreAllMocks();

});

afterEach(() => {

    jest.clearAllTimers();

});

/*
|--------------------------------------------------------------------------
| Console Handling
|--------------------------------------------------------------------------
|
| Uncomment these if you wish to suppress console output
| during automated test execution.
|
*/

/*
jest.spyOn(console, "log").mockImplementation(() => {});

jest.spyOn(console, "warn").mockImplementation(() => {});

jest.spyOn(console, "error").mockImplementation(() => {});
*/

/*
|--------------------------------------------------------------------------
| Global Helpers
|--------------------------------------------------------------------------
*/

global.sleep = (ms) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
