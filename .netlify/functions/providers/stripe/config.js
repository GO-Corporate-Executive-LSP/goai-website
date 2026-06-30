/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: config.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Centralized configuration for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Load environment variables
 * - Configure Stripe API settings
 * - Export provider configuration
 * - Validate required configuration
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

const {

    STRIPE_SECRET_KEY,

    STRIPE_PUBLISHABLE_KEY,

    STRIPE_WEBHOOK_SECRET,

    STRIPE_API_VERSION,

    STRIPE_TIMEOUT,

    STRIPE_MAX_RETRIES

} = process.env;

/*
|--------------------------------------------------------------------------
| Configuration Validation
|--------------------------------------------------------------------------
*/

if (!STRIPE_SECRET_KEY) {

    throw new Error(
        "Missing STRIPE_SECRET_KEY environment variable."
    );

}

if (!STRIPE_WEBHOOK_SECRET) {

    throw new Error(
        "Missing STRIPE_WEBHOOK_SECRET environment variable."
    );

}

/*
|--------------------------------------------------------------------------
| Stripe Configuration
|--------------------------------------------------------------------------
*/

const config = {

    provider: "Stripe",

    apiVersion:

        STRIPE_API_VERSION ||
        "2026-06-24.dahlia",

    secretKey:

        STRIPE_SECRET_KEY,

    publishableKey:

        STRIPE_PUBLISHABLE_KEY,

    webhookSecret:

        STRIPE_WEBHOOK_SECRET,

    timeout:

        Number(STRIPE_TIMEOUT) ||
        30000,

    maxRetries:

        Number(STRIPE_MAX_RETRIES) ||
        3

};

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = config;
