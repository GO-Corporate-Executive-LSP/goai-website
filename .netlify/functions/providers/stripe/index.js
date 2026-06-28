/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: index.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Central export for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Export infrastructure modules
 * - Export commerce modules
 * - Provide a single import point
 *
 * Example:
 *
 * const stripe = require("./providers/stripe");
 *
 * stripe.checkout.createCheckout(...);
 * stripe.products.listProducts(...);
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Infrastructure
|--------------------------------------------------------------------------
*/

const client =
    require("./client");

const config =
    require("./config");

const constants =
    require("./constants");

const validators =
    require("./validators");

const normalize =
    require("./normalize");

const types =
    require("./types");

const errors =
    require("./errors");

/*
|--------------------------------------------------------------------------
| Commerce Modules
|--------------------------------------------------------------------------
*/

const checkout =
    require("./checkout");

const customers =
    require("./customers");

const paymentintents =
    require("./paymentintents");

const products =
    require("./products");

const promotioncodes =
    require("./promotioncodes");

const subscriptions =
    require("./subscriptions");

const invoices =
    require("./invoices");

const refunds =
    require("./refunds");

const webhooks =
    require("./webhooks");

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    /*
    --------------------------------------------------------------------------
    Infrastructure
    --------------------------------------------------------------------------
    */

    client,

    config,

    constants,

    validators,

    normalize,

    types,

    errors,

    /*
    --------------------------------------------------------------------------
    Commerce
    --------------------------------------------------------------------------
    */

    checkout,

    customers,

    paymentintents,

    products,

    promotioncodes,

    subscriptions,

    invoices,

    refunds,

    webhooks

};
