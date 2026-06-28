/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Configuration
 * File: jest.config.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Configure the Jest testing framework for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Define the Node.js test environment
 * - Locate Stripe test files
 * - Configure coverage collection
 * - Ignore mocks and node_modules
 * - Produce coverage reports
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

module.exports = {

    /*
    |--------------------------------------------------------------------------
    | Test Environment
    |--------------------------------------------------------------------------
    */

    testEnvironment: "node",

    /*
    |--------------------------------------------------------------------------
    | Test Discovery
    |--------------------------------------------------------------------------
    */

    testMatch: [

        "**/tests/**/*.test.js"

    ],

    /*
    |--------------------------------------------------------------------------
    | Coverage Collection
    |--------------------------------------------------------------------------
    */

    collectCoverage: true,

    collectCoverageFrom: [

        "*.js",

        "!index.js",

        "!jest.config.js",

        "!**/__mocks__/**",

        "!**/tests/**"

    ],

    /*
    |--------------------------------------------------------------------------
    | Coverage Reports
    |--------------------------------------------------------------------------
    */

    coverageDirectory:

        "coverage",

    coverageReporters: [

        "text",

        "lcov",

        "html"

    ],

    /*
    |--------------------------------------------------------------------------
    | Ignore Patterns
    |--------------------------------------------------------------------------
    */

    testPathIgnorePatterns: [

        "/node_modules/"

    ],

    coveragePathIgnorePatterns: [

        "/node_modules/",

        "/__mocks__/"

    ],

    /*
    |--------------------------------------------------------------------------
    | Clear Mock State
    |--------------------------------------------------------------------------
    */

    clearMocks: true,

    restoreMocks: true,

    resetMocks: true,

    /*
    |--------------------------------------------------------------------------
    | Verbose Output
    |--------------------------------------------------------------------------
    */

    verbose: true

};
