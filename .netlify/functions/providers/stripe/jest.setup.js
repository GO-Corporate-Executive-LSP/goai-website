/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Setup
 * File: jest.setup.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Global Jest initialization for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Load environment variables
 * - Configure default test environment
 * - Reset mocks before each test
 * - Restore spies after each test
 * - Suppress unnecessary console output
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

process.env.STRIPE_SECRET_KEY =

    process.env.STRIPE_SECRET_KEY ||

    "sk_test_GOAI";

process.env.STRIPE_WEBHOOK_SECRET =

    process.env.STRIPE_WEBHOOK_SECRET ||

    "whsec_GOAI";

/*
|--------------------------------------------------------------------------
| Global Jest Lifecycle
|--------------------------------------------------------------------------
*/

beforeEach(() => {

    jest.clearAllMocks();

    jest.restoreAllMocks();

    jest.resetModules();

});

afterEach(() => {

    jest.clearAllMocks();

});

/*
|--------------------------------------------------------------------------
| Console Overrides
|--------------------------------------------------------------------------
*/

jest.spyOn(

    console,

    "error"

).mockImplementation(() => {});

jest.spyOn(

    console,

    "warn"

).mockImplementation(() => {});

/*
|--------------------------------------------------------------------------
| Global Test Timeout
|--------------------------------------------------------------------------
*/

jest.setTimeout(

    10000

);
