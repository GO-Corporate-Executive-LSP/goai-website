/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Jest Configuration
 * File: jest.config.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Configures the Jest testing framework for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Locate test files
 * - Configure coverage reporting
 * - Configure test environment
 * - Load global setup
 * - Ignore generated folders
 *
 * NOTE:
 * This configuration is intentionally provider-specific for v1.0.
 * When the backend is complete, it can be promoted to the backend root
 * and shared across all provider adapters.
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

    roots: [

        "<rootDir>/__tests__"

    ],

    testMatch: [

        "**/*.test.js"

    ],

    /*
    |--------------------------------------------------------------------------
    | Setup
    |--------------------------------------------------------------------------
    */

    setupFilesAfterEnv: [

        "<rootDir>/jest.setup.js"

    ],

    /*
    |--------------------------------------------------------------------------
    | Coverage
    |--------------------------------------------------------------------------
    */

    collectCoverage: true,

    coverageDirectory: "coverage",

    collectCoverageFrom: [

        "*.js",

        "!index.js",

        "!jest.config.js",

        "!jest.setup.js"

    ],

    coverageReporters: [

        "text",

        "html",

        "lcov"

    ],

    /*
    |--------------------------------------------------------------------------
    | Module Resolution
    |--------------------------------------------------------------------------
    */

    moduleDirectories: [

        "node_modules",

        "<rootDir>"

    ],

    /*
    |--------------------------------------------------------------------------
    | Mock Handling
    |--------------------------------------------------------------------------
    */

    clearMocks: true,

    restoreMocks: true,

    resetMocks: true,

    /*
    |--------------------------------------------------------------------------
    | Timeouts
    |--------------------------------------------------------------------------
    */

    testTimeout: 10000,

    /*
    |--------------------------------------------------------------------------
    | Ignore Paths
    |--------------------------------------------------------------------------
    */

    testPathIgnorePatterns: [

        "/node_modules/",

        "/coverage/"

    ],

    coveragePathIgnorePatterns: [

        "/node_modules/",

        "/coverage/"

    ],

    /*
    |--------------------------------------------------------------------------
    | Verbose Output
    |--------------------------------------------------------------------------
    */

    verbose: true

};
