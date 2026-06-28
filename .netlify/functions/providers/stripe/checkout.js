/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: checkout.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Checkout Session management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Checkout Sessions
 * - List Checkout Sessions
 * - Retrieve Checkout Sessions
 * - Expire Checkout Sessions
 *
 * NOTE:
 * Checkout Sessions are the primary payment entry point for GÖ.AI.
 *
 * They support:
 *
 * • Founding 100 Memberships
 * • Beta Waitlist Conversions
 * • Executive Memberships
 * • Enterprise Subscriptions
 * • Kickstarter Rewards
 * • Promotional Campaigns
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

    validateCheckoutMode

} = require("./validators");

const {

    normalizeCheckout

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Checkout Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Checkout Session payload.
 *
 * @param {Object} checkout
 * @returns {Object}
 */

function buildCheckoutPayload(
    checkout
) {

    if (!checkout) {

        throw new StripeValidationError(

            "Checkout information is required."

        );

    }

    const {

        mode,

        successUrl,

        cancelUrl,

        customer,

        lineItems,

        discounts = [],

        metadata = {}

    } = checkout;

    validateCheckoutMode(

        mode

    );

    if (

        !successUrl ||

        !cancelUrl

    ) {

        throw new StripeValidationError(

            "Checkout URLs are required."

        );

    }

    if (

        !Array.isArray(

            lineItems

        ) ||

        lineItems.length === 0

    ) {

        throw new StripeValidationError(

            "At least one line item is required."

        );

    }

    return {

        mode,

        customer,

        success_url:

            successUrl,

        cancel_url:

            cancelUrl,

        line_items:

            lineItems,

        discounts,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Checkout Sessions
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Checkout Session.
 *
 * @param {Object} checkout
 * @returns {Promise<Object>}
 */

async function createCheckout(
    checkout
) {

    try {

        const payload =
            buildCheckoutPayload(
                checkout
            );

        const response =
            await client.checkout.sessions.create(
                payload
            );

        return {

            provider: "Stripe",

            checkout:

                normalizeCheckout(
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
 * List Checkout Sessions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listCheckouts(
    options = {}
) {

    try {

        const response =
            await client.checkout.sessions.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            checkouts:

                response.data.map(

                    normalizeCheckout

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
 * Retrieve a Checkout Session.
 *
 * @param {String} checkoutId
 * @returns {Promise<Object>}
 */

async function getCheckout(
    checkoutId
) {

    try {

        validateId(

            checkoutId,

            "checkout"

        );

        const response =
            await client.checkout.sessions.retrieve(

                checkoutId

            );

        return {

            provider: "Stripe",

            checkout:

                normalizeCheckout(

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
 * Expire a Checkout Session.
 *
 * Stripe Checkout Sessions can be
 * manually expired before completion.
 *
 * @param {String} checkoutId
 * @returns {Promise<Object>}
 */

async function expireCheckout(
    checkoutId
) {

    try {

        validateId(

            checkoutId,

            "checkout"

        );

        const response =
            await client.checkout.sessions.expire(

                checkoutId

            );

        return {

            provider: "Stripe",

            checkout:

                normalizeCheckout(

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
| Checkout Search
|--------------------------------------------------------------------------
*/

/**
 * Retrieve Checkout Sessions
 * for a Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getCustomerCheckouts(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.checkout.sessions.list({

                customer:

                    customerId,

                limit: 100

            });

        return {

            provider: "Stripe",

            checkouts:

                response.data.map(

                    normalizeCheckout

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
 * Determine whether a Checkout Session exists.
 *
 * @param {String} checkoutId
 * @returns {Promise<Boolean>}
 */

async function checkoutExists(
    checkoutId
) {

    try {

        await getCheckout(

            checkoutId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve completed Checkout Sessions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getCompletedCheckouts(
    options = {}
) {

    try {

        const response =
            await client.checkout.sessions.list({

                status: "complete",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            checkouts:

                response.data.map(

                    normalizeCheckout

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
 * Retrieve expired Checkout Sessions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getExpiredCheckouts(
    options = {}
) {

    try {

        const response =
            await client.checkout.sessions.list({

                status: "expired",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            checkouts:

                response.data.map(

                    normalizeCheckout

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
 * Normalize a collection of Checkout Sessions.
 *
 * @param {Array} checkouts
 * @returns {Array}
 */

function normalizeCheckouts(
    checkouts = []
) {

    return checkouts.map(

        normalizeCheckout

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
| GÖ.AI Checkout Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Checkout Session.
 *
 * @param {Object} checkout
 * @returns {Promise<Object>}
 */

async function createFounding100Checkout(
    checkout
) {

    checkout.metadata = {

        ...(checkout.metadata || {}),

        membership: "Founding 100",

        campaign: "Founding 100"

    };

    return createCheckout(

        checkout

    );

}

/**
 * Create a Beta Waitlist Checkout Session.
 *
 * @param {Object} checkout
 * @returns {Promise<Object>}
 */

async function createWaitlistCheckout(
    checkout
) {

    checkout.metadata = {

        ...(checkout.metadata || {}),

        membership: "Beta Waitlist",

        campaign: "Beta Waitlist"

    };

    return createCheckout(

        checkout

    );

}

/**
 * Create an Enterprise Checkout Session.
 *
 * @param {Object} checkout
 * @returns {Promise<Object>}
 */

async function createEnterpriseCheckout(
    checkout
) {

    checkout.metadata = {

        ...(checkout.metadata || {}),

        membership: "Enterprise",

        campaign: "Enterprise"

    };

    return createCheckout(

        checkout

    );

}

/**
 * Create an Executive Checkout Session.
 *
 * @param {Object} checkout
 * @returns {Promise<Object>}
 */

async function createExecutiveCheckout(
    checkout
) {

    checkout.metadata = {

        ...(checkout.metadata || {}),

        membership: "Executive",

        campaign: "Executive"

    };

    return createCheckout(

        checkout

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
    Checkout Sessions
    --------------------------------------------------------------------------
    */

    createCheckout,

    listCheckouts,

    getCheckout,

    expireCheckout,

    /*
    --------------------------------------------------------------------------
    Checkout Search
    --------------------------------------------------------------------------
    */

    getCustomerCheckouts,

    getCompletedCheckouts,

    getExpiredCheckouts,

    checkoutExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Checkout Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Checkout,

    createWaitlistCheckout,

    createEnterpriseCheckout,

    createExecutiveCheckout,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildCheckoutPayload,

    normalizeCheckouts,

    buildResponse,

    handleStripeError

};
