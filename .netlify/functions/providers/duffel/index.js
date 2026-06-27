/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: index.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Public entry point for the Duffel Provider Adapter.
 *
 * ETAS™, SENTINEL™, and future backend services should import ONLY this file.
 * Individual modules remain internal implementation details.
 *
 * Responsibilities:
 * - Export all public Duffel services
 * - Hide internal implementation details
 * - Provide a stable interface for ETAS™
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * ETAS™
 *    │
 *    ▼
 * providers/duffel/index.js
 *    │
 *    ├── offers.js
 *    ├── orders.js
 *    ├── passengers.js
 *    ├── airports.js
 *    ├── airlines.js
 *    ├── baggage.js
 *    ├── seats.js
 *    ├── payments.js
 *    └── webhooks.js
 *
 * None of the above modules should be imported directly by ETAS.
 *
 * -----------------------------------------------------------------------------
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Core Configuration
|--------------------------------------------------------------------------
*/

const config = require("./config");

/*
|--------------------------------------------------------------------------
| HTTP Client
|--------------------------------------------------------------------------
*/

const client = require("./client");

/*
|--------------------------------------------------------------------------
| Provider Modules
|--------------------------------------------------------------------------
*/

const offers = require("./offers");
const orders = require("./orders");
const passengers = require("./passengers");
const airports = require("./airports");
const airlines = require("./airlines");
const baggage = require("./baggage");
const seats = require("./seats");
const payments = require("./payments");
const webhooks = require("./webhooks");

/*
|--------------------------------------------------------------------------
| Shared Utilities
|--------------------------------------------------------------------------
*/

const normalize = require("./normalize");
const retry = require("./retry");
const errors = require("./errors");

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

module.exports = Object.freeze({

    /**
     * Provider Metadata
     */
    provider: "Duffel",

    version: "1.0.0",

    config,

    client,

    /*
    |----------------------------------------------------------------------
    | Functional Modules
    |----------------------------------------------------------------------
    */

    offers,

    orders,

    passengers,

    airports,

    airlines,

    baggage,

    seats,

    payments,

    webhooks,

    /*
    |----------------------------------------------------------------------
    | Shared Utilities
    |----------------------------------------------------------------------
    */

    normalize,

    retry,

    errors

});
