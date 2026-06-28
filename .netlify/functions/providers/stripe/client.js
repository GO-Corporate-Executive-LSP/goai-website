/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: client.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Centralized Stripe client used throughout the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Initialize Stripe SDK
 * - Apply shared configuration
 * - Export a singleton client
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

const Stripe =
    require("stripe");

const config =
    require("./config");

/*
|--------------------------------------------------------------------------
| Stripe Client
|--------------------------------------------------------------------------
*/

const client = new Stripe(

    config.secretKey,

    {

        apiVersion:

            config.apiVersion,

        maxNetworkRetries:

            config.maxRetries,

        timeout:

            config.timeout

    }

);

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = client;
