/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: webhooks.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Webhook management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Construct Webhook Events
 * - Verify Webhook Signatures
 * - Parse Webhook Payloads
 * - Dispatch Supported Events
 * - Register Event Handlers
 *
 * NOTE:
 * Stripe Webhooks provide real-time event notifications
 * that keep ETAS™ and SENTINEL™ synchronized with billing,
 * subscriptions, refunds, invoices, and checkout activity.
 *
 * @author GÖ.AI
 * @version 1.1.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Dependencies
|--------------------------------------------------------------------------
*/

const client =
    require("./client");

const config =
    require("./config");

const {

    validateWebhookEvent

} = require("./validators");

const {

    normalizeWebhook

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Registered Event Handlers
|--------------------------------------------------------------------------
*/

const handlers = {};

/*
|--------------------------------------------------------------------------
| Webhook Helpers
|--------------------------------------------------------------------------
*/

/**
 * Construct and verify a Stripe webhook.
 *
 * @param {Buffer|String} payload
 * @param {String} signature
 * @returns {Object}
 */

function constructWebhook(

    payload,

    signature

) {

    if (

        !payload ||

        !signature

    ) {

        throw new StripeValidationError(

            "Webhook payload and signature are required."

        );

    }

    try {

        const event =
            client.webhooks.constructEvent(

                payload,

                signature,

                config.webhookSecret

            );

        return normalizeWebhook(

            event

        );

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/*
|--------------------------------------------------------------------------
| Webhook Dispatcher
|--------------------------------------------------------------------------
*/

/**
 * Dispatch a verified webhook
 * to a registered handler.
 *
 * @param {Object} event
 * @returns {Promise<*>}
 */

async function dispatchWebhook(
    event
) {

    validateWebhookEvent(

        event.type

    );

    const handler =
        handlers[event.type];

    if (

        !handler

    ) {

        return null;

    }

    return await handler(

        normalizeWebhook(

            event

        )

    );

}

/**
 * Register a webhook handler.
 *
 * @param {String} eventType
 * @param {Function} handler
 */

function registerWebhook(

    eventType,

    handler

) {

    validateWebhookEvent(

        eventType

    );

    handlers[eventType] =

        handler;

}

/**
 * Remove a webhook handler.
 *
 * @param {String} eventType
 */

function unregisterWebhook(
    eventType
) {

    validateWebhookEvent(

        eventType

    );

    delete handlers[

        eventType

    ];

}
/**
 * Retrieve all registered webhook events.
 *
 * @returns {Array<String>}
 */

function listWebhookHandlers() {

    return Object.keys(

        handlers

    );

}

/**
 * Determine whether a handler has been
 * registered for a webhook event.
 *
 * @param {String} eventType
 * @returns {Boolean}
 */

function webhookHandlerExists(
    eventType
) {

    validateWebhookEvent(

        eventType

    );

    return Object.prototype.hasOwnProperty.call(

        handlers,

        eventType

    );

}

/**
 * Parse a normalized webhook event.
 *
 * @param {Object} event
 * @returns {Object}
 */

function parseWebhook(
    event
) {

    validateWebhookEvent(

        event.type

    );

    return normalizeWebhook(

        event

    );

}

/*
|--------------------------------------------------------------------------
| Webhook Event Helpers
|--------------------------------------------------------------------------
*/

/**
 * Determine whether the webhook
 * represents a successful payment.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isPaymentSucceeded(
    event
) {

    return (

        event.type ===

        "payment_intent.succeeded"

    );

}

/**
 * Determine whether the webhook
 * represents a failed payment.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isPaymentFailed(
    event
) {

    return (

        event.type ===

        "payment_intent.payment_failed"

    );

}

/**
 * Determine whether the webhook
 * represents a completed checkout.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isCheckoutCompleted(
    event
) {

    return (

        event.type ===

        "checkout.session.completed"

    );

}
/**
 * Determine whether the webhook
 * represents a subscription event.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isSubscriptionEvent(
    event
) {

    return (

        event.type ===

            "customer.subscription.created" ||

        event.type ===

            "customer.subscription.updated" ||

        event.type ===

            "customer.subscription.deleted"

    );

}

/**
 * Determine whether the webhook
 * represents an invoice event.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isInvoiceEvent(
    event
) {

    return (

        event.type ===

            "invoice.paid" ||

        event.type ===

            "invoice.payment_failed"

    );

}

/**
 * Determine whether the webhook
 * represents a refund event.
 *
 * @param {Object} event
 * @returns {Boolean}
 */

function isRefundEvent(
    event
) {

    return (

        event.type ===

        "charge.refunded"

    );

}

/**
 * Determine whether a webhook
 * handler exists for an event.
 *
 * @param {String} eventType
 * @returns {Boolean}
 */

function hasWebhookHandler(
    eventType
) {

    validateWebhookEvent(

        eventType

    );

    return Object.prototype.hasOwnProperty.call(

        handlers,

        eventType

    );

}
/*
|--------------------------------------------------------------------------
| Private Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Normalize a collection of Webhook Events.
 *
 * @param {Array} events
 * @returns {Array}
 */

function normalizeWebhooks(
    events = []
) {

    return events.map(

        normalizeWebhook

    );

}

/**
 * Build a standardized provider response.
 *
 * @param {String} resource
 * @param {*} data
 * @returns {Object}
 */

function buildResponse(

    resource,

    data

) {

    return {

        provider: "Stripe",

        resource,

        data

    };

}

/**
 * Convert unexpected provider errors into
 * standardized Stripe API errors.
 *
 * @param {Error} error
 * @throws {StripeAPIError}
 */

function handleStripeError(
    error
) {

    if (

        error instanceof StripeValidationError ||

        error instanceof StripeAPIError

    ) {

        throw error;

    }

    throw new StripeAPIError(

        error.message ||

        "Unexpected Stripe provider error."

    );

}
/*
|--------------------------------------------------------------------------
| GÖ.AI Webhook Utilities
|--------------------------------------------------------------------------
*/

/**
 * Register the default GÖ.AI webhook handlers.
 *
 * @returns {Object}
 */

function registerDefaultHandlers() {

    registerWebhook(

        "checkout.session.completed",

        async (event) => event

    );

    registerWebhook(

        "payment_intent.succeeded",

        async (event) => event

    );

    registerWebhook(

        "customer.subscription.created",

        async (event) => event

    );

    registerWebhook(

        "invoice.paid",

        async (event) => event

    );

    registerWebhook(

        "charge.refunded",

        async (event) => event

    );

    return {

        provider: "Stripe",

        handlers:

            listWebhookHandlers()

    };

}

/**
 * Remove all registered webhook handlers.
 *
 * @returns {Boolean}
 */

function clearWebhookHandlers() {

    Object.keys(

        handlers

    ).forEach(

        (eventType) =>

            delete handlers[

                eventType

            ]

    );

    return true;

}

/**
 * Retrieve the number of
 * registered webhook handlers.
 *
 * @returns {Number}
 */

function getWebhookHandlerCount() {

    return Object.keys(

        handlers

    ).length;

}

/**
 * Determine whether any webhook
 * handlers have been registered.
 *
 * @returns {Boolean}
 */

function hasRegisteredHandlers() {

    return (

        getWebhookHandlerCount() > 0

    );

}
/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    /*
    --------------------------------------------------------------------------
    Webhook Processing
    --------------------------------------------------------------------------
    */

    constructWebhook,

    dispatchWebhook,

    parseWebhook,

    /*
    --------------------------------------------------------------------------
    Webhook Registration
    --------------------------------------------------------------------------
    */

    registerWebhook,

    unregisterWebhook,

    listWebhookHandlers,

    webhookHandlerExists,

    hasWebhookHandler,

    /*
    --------------------------------------------------------------------------
    Event Helpers
    --------------------------------------------------------------------------
    */

    isPaymentSucceeded,

    isPaymentFailed,

    isCheckoutCompleted,

    isSubscriptionEvent,

    isInvoiceEvent,

    isRefundEvent,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Webhook Utilities
    --------------------------------------------------------------------------
    */

    registerDefaultHandlers,

    clearWebhookHandlers,

    getWebhookHandlerCount,

    hasRegisteredHandlers,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    normalizeWebhooks,

    buildResponse,

    handleStripeError

};
