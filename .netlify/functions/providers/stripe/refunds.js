/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: refunds.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Refund management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Refunds
 * - List Refunds
 * - Retrieve Refunds
 * - Update Refunds
 * - Cancel Refunds
 *
 * NOTE:
 * Refunds support customer service, enterprise billing,
 * membership adjustments, duplicate payment recovery,
 * and future travel commerce reimbursements.
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

    normalizeRefund

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Refund Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Refund payload.
 *
 * @param {Object} refund
 * @returns {Object}
 */

function buildRefundPayload(
    refund
) {

    if (!refund) {

        throw new StripeValidationError(

            "Refund information is required."

        );

    }

    const {

        paymentIntent,

        amount,

        reason,

        metadata = {}

    } = refund;

    validateId(

        paymentIntent,

        "payment intent"

    );

    return {

        payment_intent:

            paymentIntent,

        amount,

        reason,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Refunds
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Refund.
 *
 * @param {Object} refund
 * @returns {Promise<Object>}
 */

async function createRefund(
    refund
) {

    try {

        const payload =
            buildRefundPayload(
                refund
            );

        const response =
            await client.refunds.create(
                payload
            );

        return {

            provider: "Stripe",

            refund:

                normalizeRefund(
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
 * Retrieve all Refunds.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listRefunds(
    options = {}
) {

    try {

        const response =
            await client.refunds.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            refunds:

                response.data.map(

                    normalizeRefund

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
 * Retrieve a Refund.
 *
 * @param {String} refundId
 * @returns {Promise<Object>}
 */

async function getRefund(
    refundId
) {

    try {

        validateId(

            refundId,

            "refund"

        );

        const response =
            await client.refunds.retrieve(

                refundId

            );

        return {

            provider: "Stripe",

            refund:

                normalizeRefund(

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
 * Update a Refund.
 *
 * NOTE:
 * Stripe only permits metadata updates
 * on Refund objects.
 *
 * @param {String} refundId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updateRefund(

    refundId,

    updates

) {

    try {

        validateId(

            refundId,

            "refund"

        );

        const response =
            await client.refunds.update(

                refundId,

                updates

            );

        return {

            provider: "Stripe",

            refund:

                normalizeRefund(

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
 * Cancel a Refund.
 *
 * NOTE:
 * Only Refunds that remain pending
 * may be canceled.
 *
 * @param {String} refundId
 * @returns {Promise<Object>}
 */

async function cancelRefund(
    refundId
) {

    try {

        validateId(

            refundId,

            "refund"

        );

        const response =
            await client.refunds.cancel(

                refundId

            );

        return {

            provider: "Stripe",

            refund:

                normalizeRefund(

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
| Refund Search
|--------------------------------------------------------------------------
*/

/**
 * Retrieve Refunds
 * for a Payment Intent.
 *
 * @param {String} paymentIntentId
 * @returns {Promise<Object>}
 */

async function getPaymentIntentRefunds(
    paymentIntentId
) {

    try {

        validateId(

            paymentIntentId,

            "payment intent"

        );

        const response =
            await client.refunds.list({

                payment_intent:

                    paymentIntentId,

                limit: 100

            });

        return {

            provider: "Stripe",

            refunds:

                response.data.map(

                    normalizeRefund

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
 * Determine whether a Refund exists.
 *
 * @param {String} refundId
 * @returns {Promise<Boolean>}
 */

async function refundExists(
    refundId
) {

    try {

        await getRefund(

            refundId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve successful Refunds.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getSuccessfulRefunds(
    options = {}
) {

    try {

        const response =
            await client.refunds.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            refunds:

                response.data

                    .filter(

                        (refund) =>

                            refund.status ===

                            "succeeded"

                    )

                    .map(

                        normalizeRefund

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
 * Retrieve pending Refunds.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getPendingRefunds(
    options = {}
) {

    try {

        const response =
            await client.refunds.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            refunds:

                response.data

                    .filter(

                        (refund) =>

                            refund.status ===

                            "pending"

                    )

                    .map(

                        normalizeRefund

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
 * Normalize a collection of Refunds.
 *
 * @param {Array} refunds
 * @returns {Array}
 */

function normalizeRefunds(
    refunds = []
) {

    return refunds.map(

        normalizeRefund

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
| GÖ.AI Refund Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Refund.
 *
 * @param {Object} refund
 * @returns {Promise<Object>}
 */

async function createFounding100Refund(
    refund
) {

    refund.metadata = {

        ...(refund.metadata || {}),

        membership: "Founding 100",

        campaign: "Founding 100"

    };

    return createRefund(

        refund

    );

}

/**
 * Create a Beta Waitlist Refund.
 *
 * @param {Object} refund
 * @returns {Promise<Object>}
 */

async function createWaitlistRefund(
    refund
) {

    refund.metadata = {

        ...(refund.metadata || {}),

        membership: "Beta Waitlist",

        campaign: "Beta Waitlist"

    };

    return createRefund(

        refund

    );

}

/**
 * Create an Enterprise Refund.
 *
 * @param {Object} refund
 * @returns {Promise<Object>}
 */

async function createEnterpriseRefund(
    refund
) {

    refund.metadata = {

        ...(refund.metadata || {}),

        membership: "Enterprise",

        campaign: "Enterprise"

    };

    return createRefund(

        refund

    );

}

/**
 * Create an Executive Refund.
 *
 * @param {Object} refund
 * @returns {Promise<Object>}
 */

async function createExecutiveRefund(
    refund
) {

    refund.metadata = {

        ...(refund.metadata || {}),

        membership: "Executive",

        campaign: "Executive"

    };

    return createRefund(

        refund

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
    Refunds
    --------------------------------------------------------------------------
    */

    createRefund,

    listRefunds,

    getRefund,

    updateRefund,

    cancelRefund,

    /*
    --------------------------------------------------------------------------
    Refund Search
    --------------------------------------------------------------------------
    */

    getPaymentIntentRefunds,

    getSuccessfulRefunds,

    getPendingRefunds,

    refundExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Refund Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Refund,

    createWaitlistRefund,

    createEnterpriseRefund,

    createExecutiveRefund,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildRefundPayload,

    normalizeRefunds,

    buildResponse,

    handleStripeError

};
