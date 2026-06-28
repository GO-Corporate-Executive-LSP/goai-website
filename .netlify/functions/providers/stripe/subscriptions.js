/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: subscriptions.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Subscription management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Subscriptions
 * - List Subscriptions
 * - Retrieve Subscriptions
 * - Update Subscriptions
 * - Cancel Subscriptions
 *
 * NOTE:
 * Subscriptions power recurring memberships within GÖ.AI including:
 *
 * • Founding 100
 * • Beta Memberships
 * • Executive Memberships
 * • Enterprise Memberships
 * • Future Premium Services
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

    validateId

} = require("./validators");

const {

    normalizeSubscription

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Subscription Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Subscription payload.
 *
 * @param {Object} subscription
 * @returns {Object}
 */

function buildSubscriptionPayload(
    subscription
) {

    if (!subscription) {

        throw new StripeValidationError(

            "Subscription information is required."

        );

    }

    const {

        customer,

        items,

        coupon,

        trialEnd,

        metadata = {}

    } = subscription;

    validateId(

        customer,

        "customer"

    );

    if (

        !Array.isArray(

            items

        ) ||

        items.length === 0

    ) {

        throw new StripeValidationError(

            "At least one subscription item is required."

        );

    }

    return {

        customer,

        items,

        coupon,

        trial_end:

            trialEnd,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Subscriptions
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Subscription.
 *
 * @param {Object} subscription
 * @returns {Promise<Object>}
 */

async function createSubscription(
    subscription
) {

    try {

        const payload =
            buildSubscriptionPayload(
                subscription
            );

        const response =
            await client.subscriptions.create(
                payload
            );

        return {

            provider: "Stripe",

            subscription:

                normalizeSubscription(
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
 * Retrieve all Subscriptions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listSubscriptions(
    options = {}
) {

    try {

        const response =
            await client.subscriptions.list({

                status:

                    options.status || "all",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            subscriptions:

                response.data.map(

                    normalizeSubscription

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
 * Retrieve a Subscription.
 *
 * @param {String} subscriptionId
 * @returns {Promise<Object>}
 */

async function getSubscription(
    subscriptionId
) {

    try {

        validateId(

            subscriptionId,

            "subscription"

        );

        const response =
            await client.subscriptions.retrieve(

                subscriptionId

            );

        return {

            provider: "Stripe",

            subscription:

                normalizeSubscription(

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
 * Update a Subscription.
 *
 * @param {String} subscriptionId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updateSubscription(

    subscriptionId,

    updates

) {

    try {

        validateId(

            subscriptionId,

            "subscription"

        );

        const response =
            await client.subscriptions.update(

                subscriptionId,

                updates

            );

        return {

            provider: "Stripe",

            subscription:

                normalizeSubscription(

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
 * Cancel a Subscription.
 *
 * @param {String} subscriptionId
 * @returns {Promise<Object>}
 */

async function cancelSubscription(
    subscriptionId
) {

    try {

        validateId(

            subscriptionId,

            "subscription"

        );

        const response =
            await client.subscriptions.cancel(

                subscriptionId

            );

        return {

            provider: "Stripe",

            subscription:

                normalizeSubscription(

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
| Subscription Search
|--------------------------------------------------------------------------
*/

/**
 * Retrieve Subscriptions
 * for a Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getCustomerSubscriptions(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.subscriptions.list({

                customer:

                    customerId,

                status: "all",

                limit: 100

            });

        return {

            provider: "Stripe",

            subscriptions:

                response.data.map(

                    normalizeSubscription

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
 * Determine whether a Subscription exists.
 *
 * @param {String} subscriptionId
 * @returns {Promise<Boolean>}
 */

async function subscriptionExists(
    subscriptionId
) {

    try {

        await getSubscription(

            subscriptionId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve active Subscriptions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getActiveSubscriptions(
    options = {}
) {

    try {

        const response =
            await client.subscriptions.list({

                status: "active",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            subscriptions:

                response.data.map(

                    normalizeSubscription

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
 * Retrieve canceled Subscriptions.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getCanceledSubscriptions(
    options = {}
) {

    try {

        const response =
            await client.subscriptions.list({

                status: "canceled",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            subscriptions:

                response.data.map(

                    normalizeSubscription

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
 * Normalize a collection of Subscriptions.
 *
 * @param {Array} subscriptions
 * @returns {Array}
 */

function normalizeSubscriptions(
    subscriptions = []
) {

    return subscriptions.map(

        normalizeSubscription

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
| GÖ.AI Subscription Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Subscription.
 *
 * @param {Object} subscription
 * @returns {Promise<Object>}
 */

async function createFounding100Subscription(
    subscription
) {

    subscription.metadata = {

        ...(subscription.metadata || {}),

        membership: "Founding 100",

        campaign: "Founding 100"

    };

    return createSubscription(

        subscription

    );

}

/**
 * Create a Beta Waitlist Subscription.
 *
 * @param {Object} subscription
 * @returns {Promise<Object>}
 */

async function createWaitlistSubscription(
    subscription
) {

    subscription.metadata = {

        ...(subscription.metadata || {}),

        membership: "Beta Waitlist",

        campaign: "Beta Waitlist"

    };

    return createSubscription(

        subscription

    );

}

/**
 * Create an Enterprise Subscription.
 *
 * @param {Object} subscription
 * @returns {Promise<Object>}
 */

async function createEnterpriseSubscription(
    subscription
) {

    subscription.metadata = {

        ...(subscription.metadata || {}),

        membership: "Enterprise",

        campaign: "Enterprise"

    };

    return createSubscription(

        subscription

    );

}

/**
 * Create an Executive Subscription.
 *
 * @param {Object} subscription
 * @returns {Promise<Object>}
 */

async function createExecutiveSubscription(
    subscription
) {

    subscription.metadata = {

        ...(subscription.metadata || {}),

        membership: "Executive",

        campaign: "Executive"

    };

    return createSubscription(

        subscription

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
    Subscriptions
    --------------------------------------------------------------------------
    */

    createSubscription,

    listSubscriptions,

    getSubscription,

    updateSubscription,

    cancelSubscription,

    /*
    --------------------------------------------------------------------------
    Subscription Search
    --------------------------------------------------------------------------
    */

    getCustomerSubscriptions,

    getActiveSubscriptions,

    getCanceledSubscriptions,

    subscriptionExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Subscription Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Subscription,

    createWaitlistSubscription,

    createEnterpriseSubscription,

    createExecutiveSubscription,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildSubscriptionPayload,

    normalizeSubscriptions,

    buildResponse,

    handleStripeError

};
