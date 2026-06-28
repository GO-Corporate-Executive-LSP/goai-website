/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: paymentintents.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Payment Intent management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Payment Intents
 * - List Payment Intents
 * - Retrieve Payment Intents
 * - Update Payment Intents
 * - Cancel Payment Intents
 *
 * NOTE:
 * Payment Intents power all payment processing within GÖ.AI,
 * including memberships, subscriptions, executive services,
 * enterprise billing, and future travel commerce.
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

const {

    validateId,

    validateCurrency

} = require("./validators");

const {

    normalizePaymentIntent

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Payment Intent Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Payment Intent payload.
 *
 * @param {Object} paymentIntent
 * @returns {Object}
 */

function buildPaymentIntentPayload(
    paymentIntent
) {

    if (!paymentIntent) {

        throw new StripeValidationError(

            "Payment Intent information is required."

        );

    }

    const {

        amount,

        currency,

        customer,

        paymentMethod,

        description = "",

        metadata = {}

    } = paymentIntent;

    if (

        typeof amount !== "number" ||

        amount <= 0

    ) {

        throw new StripeValidationError(

            "A valid payment amount is required."

        );

    }

    validateCurrency(

        currency

    );

    return {

        amount,

        currency:

            currency.toLowerCase(),

        customer,

        payment_method:

            paymentMethod,

        description,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Payment Intents
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Payment Intent.
 *
 * @param {Object} paymentIntent
 * @returns {Promise<Object>}
 */

async function createPaymentIntent(
    paymentIntent
) {

    try {

        const payload =
            buildPaymentIntentPayload(
                paymentIntent
            );

        const response =
            await client.paymentIntents.create(
                payload
            );

        return {

            provider: "Stripe",

            paymentIntent:

                normalizePaymentIntent(
                    response
                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Retrieve all Payment Intents.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listPaymentIntents(
    options = {}
) {

    try {

        const response =
            await client.paymentIntents.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            paymentIntents:

                response.data.map(

                    normalizePaymentIntent

                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}
/**
 * Retrieve a Payment Intent.
 *
 * @param {String} paymentIntentId
 * @returns {Promise<Object>}
 */

async function getPaymentIntent(
    paymentIntentId
) {

    try {

        validateId(

            paymentIntentId,

            "payment intent"

        );

        const response =
            await client.paymentIntents.retrieve(

                paymentIntentId

            );

        return {

            provider: "Stripe",

            paymentIntent:

                normalizePaymentIntent(

                    response

                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Update a Payment Intent.
 *
 * @param {String} paymentIntentId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updatePaymentIntent(

    paymentIntentId,

    updates

) {

    try {

        validateId(

            paymentIntentId,

            "payment intent"

        );

        const response =
            await client.paymentIntents.update(

                paymentIntentId,

                updates

            );

        return {

            provider: "Stripe",

            paymentIntent:

                normalizePaymentIntent(

                    response

                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Cancel a Payment Intent.
 *
 * @param {String} paymentIntentId
 * @returns {Promise<Object>}
 */

async function cancelPaymentIntent(
    paymentIntentId
) {

    try {

        validateId(

            paymentIntentId,

            "payment intent"

        );

        const response =
            await client.paymentIntents.cancel(

                paymentIntentId

            );

        return {

            provider: "Stripe",

            paymentIntent:

                normalizePaymentIntent(

                    response

                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/*
|--------------------------------------------------------------------------
| Payment Intent Search
|--------------------------------------------------------------------------
*/

/**
 * Retrieve Payment Intents
 * for a Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getCustomerPaymentIntents(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.paymentIntents.list({

                customer:

                    customerId,

                limit: 100

            });

        return {

            provider: "Stripe",

            paymentIntents:

                response.data.map(

                    normalizePaymentIntent

                )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}
/**
 * Determine whether a Payment Intent exists.
 *
 * @param {String} paymentIntentId
 * @returns {Promise<Boolean>}
 */

async function paymentIntentExists(
    paymentIntentId
) {

    try {

        await getPaymentIntent(

            paymentIntentId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve successful Payment Intents.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getSuccessfulPaymentIntents(
    options = {}
) {

    try {

        const response =
            await client.paymentIntents.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            paymentIntents:

                response.data

                    .filter(

                        (paymentIntent) =>

                            paymentIntent.status ===

                            "succeeded"

                    )

                    .map(

                        normalizePaymentIntent

                    )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Retrieve canceled Payment Intents.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getCanceledPaymentIntents(
    options = {}
) {

    try {

        const response =
            await client.paymentIntents.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            paymentIntents:

                response.data

                    .filter(

                        (paymentIntent) =>

                            paymentIntent.status ===

                            "canceled"

                    )

                    .map(

                        normalizePaymentIntent

                    )

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}
/*
|--------------------------------------------------------------------------
| Private Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Normalize a collection of Payment Intents.
 *
 * @param {Array} paymentIntents
 * @returns {Array}
 */

function normalizePaymentIntents(
    paymentIntents = []
) {

    return paymentIntents.map(

        normalizePaymentIntent

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
| GÖ.AI Payment Intent Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Payment Intent.
 *
 * @param {Object} paymentIntent
 * @returns {Promise<Object>}
 */

async function createFounding100PaymentIntent(
    paymentIntent
) {

    paymentIntent.metadata = {

        ...(paymentIntent.metadata || {}),

        membership: "Founding 100",

        campaign: "Founding 100"

    };

    return createPaymentIntent(

        paymentIntent

    );

}

/**
 * Create a Beta Waitlist Payment Intent.
 *
 * @param {Object} paymentIntent
 * @returns {Promise<Object>}
 */

async function createWaitlistPaymentIntent(
    paymentIntent
) {

    paymentIntent.metadata = {

        ...(paymentIntent.metadata || {}),

        membership: "Beta Waitlist",

        campaign: "Beta Waitlist"

    };

    return createPaymentIntent(

        paymentIntent

    );

}

/**
 * Create an Enterprise Payment Intent.
 *
 * @param {Object} paymentIntent
 * @returns {Promise<Object>}
 */

async function createEnterprisePaymentIntent(
    paymentIntent
) {

    paymentIntent.metadata = {

        ...(paymentIntent.metadata || {}),

        membership: "Enterprise",

        campaign: "Enterprise"

    };

    return createPaymentIntent(

        paymentIntent

    );

}

/**
 * Create an Executive Payment Intent.
 *
 * @param {Object} paymentIntent
 * @returns {Promise<Object>}
 */

async function createExecutivePaymentIntent(
    paymentIntent
) {

    paymentIntent.metadata = {

        ...(paymentIntent.metadata || {}),

        membership: "Executive",

        campaign: "Executive"

    };

    return createPaymentIntent(

        paymentIntent

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
    Payment Intents
    --------------------------------------------------------------------------
    */

    createPaymentIntent,

    listPaymentIntents,

    getPaymentIntent,

    updatePaymentIntent,

    cancelPaymentIntent,

    /*
    --------------------------------------------------------------------------
    Payment Intent Search
    --------------------------------------------------------------------------
    */

    getCustomerPaymentIntents,

    getSuccessfulPaymentIntents,

    getCanceledPaymentIntents,

    paymentIntentExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Payment Utilities
    --------------------------------------------------------------------------
    */

    createFounding100PaymentIntent,

    createWaitlistPaymentIntent,

    createEnterprisePaymentIntent,

    createExecutivePaymentIntent,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildPaymentIntentPayload,

    normalizePaymentIntents,

    buildResponse,

    handleStripeError

};
