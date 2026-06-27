/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: payments.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Manages payment information used during the Duffel Order workflow.
 *
 * Responsibilities:
 * - Build Duffel payment payloads
 * - Validate payment objects
 * - Normalize payment information
 * - Prepare payments for Order creation
 *
 * IMPORTANT:
 * Duffel processes payment information as part of an Order.
 * Stripe will serve as GÖ.AI's primary payment processor.
 *
 * This module prepares payment data for Duffel while remaining
 * provider-independent from Stripe.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * Canonical Trip Object
 *          │
 *          ▼
 * payments.js
 *          │
 *          ▼
 * orders.js
 *          │
 *          ▼
 * client.js
 *          │
 *          ▼
 * Duffel Orders API
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Lee Kosek Duffel Postman Collection
 * - Create Booking
 * - Orders API
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

const {
    DuffelValidationError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const PAYMENT_TYPES = Object.freeze({

    BALANCE: "balance",

    CARD: "card",

    CASH: "cash",

    INVOICE: "invoice"

});

const PAYMENT_STATUS = Object.freeze({

    PENDING: "pending",

    AUTHORIZED: "authorized",

    PAID: "paid",

    FAILED: "failed",

    REFUNDED: "refunded"

});

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates a payment object.
 *
 * @param {Object} payment
 * @throws {DuffelValidationError}
 */
function validatePaymentObject(payment = {}) {

    if (!payment.type) {

        throw new DuffelValidationError(
            "Payment type is required."
        );

    }

    if (
        !Object.values(PAYMENT_TYPES)
            .includes(payment.type)
    ) {

        throw new DuffelValidationError(
            `Unsupported payment type: ${payment.type}`
        );

    }

    if (
        payment.amount === undefined ||
        payment.amount === null
    ) {

        throw new DuffelValidationError(
            "Payment amount is required."
        );

    }

    if (!payment.currency) {

        throw new DuffelValidationError(
            "Payment currency is required."
        );

    }

}

/**
 * Builds a Duffel-compatible payment payload.
 *
 * Future versions will integrate Stripe Payment
 * Intents and tokenize payment methods before
 * transmitting them to Duffel.
 *
 * @param {Object} payment
 * @returns {Object}
 */
function buildPayment(payment = {}) {

    validatePaymentObject(payment);

    return {

        type: payment.type,

        amount: payment.amount,

        currency: payment.currency,

        payment_intent:
            payment.payment_intent || null,

        metadata:
            payment.metadata || {}

    };

}

/**
 * Normalizes a payment object for ETAS™.
 *
 * @param {Object} payment
 * @returns {Object}
 */
function normalizePayment(payment = {}) {

    return {

        provider: "Duffel",

        type: payment.type,

        status:
            payment.status ||
            PAYMENT_STATUS.PENDING,

        amount: payment.amount,

        currency: payment.currency,

        paymentIntent:
            payment.payment_intent || null,

        metadata:
            payment.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Creates a payment object.
 *
 * Part 2 implements this function.
 */
async function createPayment() {

    throw new Error(
        "createPayment() not yet implemented."
    );

}

/**
 * Retrieves payment information.
 *
 * Part 3 implements this function.
 */
async function getPayment() {

    throw new Error(
        "getPayment() not yet implemented."
    );

}

/**
 * Validates payment readiness.
 *
 * Part 4 implements this function.
 */
async function validatePayment() {

    throw new Error(
        "validatePayment() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Create Payment
 * --------------------------------------------------------------------------
 * Creates an ETAS-compatible payment object for inclusion in a
 * Duffel Order.
 *
 * IMPORTANT:
 * This function does NOT charge the traveler.
 *
 * Payment authorization and capture are handled by Stripe.
 * Duffel receives payment information only after ETAS has
 * successfully completed payment processing.
 *
 * Used by:
 * - ETAS™
 * - orders.js
 * - Stripe Provider Adapter
 *
 * @param {Object} payment
 * @returns {Promise<Object>}
 */
async function createPayment(payment = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Payment
    --------------------------------------------------------------------------
    */

    validatePaymentObject(payment);

    /*
    --------------------------------------------------------------------------
    Build Duffel Payment Payload
    --------------------------------------------------------------------------
    */

    const payload = buildPayment(payment);

    /*
    --------------------------------------------------------------------------
    Normalize Payment
    --------------------------------------------------------------------------
    */

    const normalizedPayment =
        normalizePayment(payload);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Payment Object
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        createdAt:
            new Date().toISOString(),

        payment: normalizedPayment

    };

}

/**
 * --------------------------------------------------------------------------
 * Retrieve Payment
 * --------------------------------------------------------------------------
 * Retrieves payment information associated with a Duffel Order.
 *
 * IMPORTANT:
 * Duffel does not expose a standalone Payments API.
 * Payment information exists as part of the Order resource.
 *
 * Used by:
 * - ETAS™
 * - Executive Briefings
 * - Traveler Dashboard
 * - Continuous Monitoring
 *
 * @param {Object} order
 * @returns {Promise<Object>}
 */
async function getPayment(order = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!order) {

        throw new DuffelValidationError(
            "Order object is required."
        );

    }

    if (!order.payments ||
        !Array.isArray(order.payments) ||
        order.payments.length === 0) {

        throw new DuffelValidationError(
            "No payment information exists for this Order."
        );

    }

    /*
    --------------------------------------------------------------------------
    Retrieve Primary Payment
    --------------------------------------------------------------------------
    */

    const payment = order.payments[0];

    /*
    --------------------------------------------------------------------------
    Normalize Payment
    --------------------------------------------------------------------------
    */

    const normalizedPayment =
        normalizePayment(payment);

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Payment
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        retrievedAt:
            new Date().toISOString(),

        payment: normalizedPayment

    };

}

/**
 * --------------------------------------------------------------------------
 * Validate Payment
 * --------------------------------------------------------------------------
 * Validates that a payment is complete and ready for submission
 * as part of a Duffel Order.
 *
 * IMPORTANT:
 * This function validates payment readiness only.
 * It does NOT authorize, capture, or process payments.
 * Those responsibilities belong to the Stripe Provider Adapter.
 *
 * Used by:
 * - ETAS™
 * - orders.js
 * - Booking Workflow
 *
 * @param {Object} payment
 * @returns {Promise<Object>}
 */
async function validatePayment(payment = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Payment Object
    --------------------------------------------------------------------------
    */

    validatePaymentObject(payment);

    /*
    --------------------------------------------------------------------------
    Verify Payment Status
    --------------------------------------------------------------------------
    */

    if (
        payment.status &&
        payment.status === PAYMENT_STATUS.FAILED
    ) {

        throw new DuffelValidationError(
            "Payment validation failed."
        );

    }

    /*
    --------------------------------------------------------------------------
    Verify Required Payment Intent
    --------------------------------------------------------------------------
    */

    if (
        payment.type === PAYMENT_TYPES.CARD &&
        !payment.payment_intent
    ) {

        throw new DuffelValidationError(
            "Stripe Payment Intent is required for card payments."
        );

    }

    /*
    --------------------------------------------------------------------------
    Normalize Payment
    --------------------------------------------------------------------------
    */

    const normalizedPayment =
        normalizePayment(payment);

    /*
    --------------------------------------------------------------------------
    Return Validation Result
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        valid: true,

        validatedAt:
            new Date().toISOString(),

        payment: normalizedPayment

    };

}

/*
|--------------------------------------------------------------------------
| Payment Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Determines whether a payment has been successfully completed.
 *
 * @param {Object} payment
 * @returns {boolean}
 */
function isPaid(payment = {}) {

    return (
        payment.status === PAYMENT_STATUS.PAID
    );

}

/**
 * Determines whether a payment is pending.
 *
 * @param {Object} payment
 * @returns {boolean}
 */
function isPending(payment = {}) {

    return (
        payment.status === PAYMENT_STATUS.PENDING
    );

}

/**
 * Determines whether a payment has failed.
 *
 * @param {Object} payment
 * @returns {boolean}
 */
function isFailed(payment = {}) {

    return (
        payment.status === PAYMENT_STATUS.FAILED
    );

}

/**
 * Returns the payment amount.
 *
 * @param {Object} payment
 * @returns {number|null}
 */
function getPaymentAmount(payment = {}) {

    return payment.amount || null;

}

/**
 * Returns the payment currency.
 *
 * @param {Object} payment
 * @returns {string|null}
 */
function getCurrency(payment = {}) {

    return payment.currency || null;

}

/**
 * Returns the payment type.
 *
 * @param {Object} payment
 * @returns {string|null}
 */
function getPaymentType(payment = {}) {

    return payment.type || null;

}

/**
 * Returns the Stripe Payment Intent ID.
 *
 * @param {Object} payment
 * @returns {string|null}
 */
function getPaymentIntent(payment = {}) {

    return payment.paymentIntent ||
           payment.payment_intent ||
           null;

}

/**
 * Returns any metadata associated with the payment.
 *
 * @param {Object} payment
 * @returns {Object}
 */
function getMetadata(payment = {}) {

    return payment.metadata || {};

}

/**
 * Determines whether the payment has been refunded.
 *
 * @param {Object} payment
 * @returns {boolean}
 */
function isRefunded(payment = {}) {

    return (
        payment.status === PAYMENT_STATUS.REFUNDED
    );

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All payment operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Payment Operations
    |--------------------------------------------------------------------------
    */

    createPayment,

    getPayment,

    validatePayment,

    /*
    |--------------------------------------------------------------------------
    | Payment Helper Functions
    |--------------------------------------------------------------------------
    */

    isPaid,

    isPending,

    isFailed,

    getPaymentAmount,

    getCurrency,

    getPaymentType,

    getPaymentIntent,

    getMetadata,

    isRefunded

});
