/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: promotioncodes.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Promotion Code management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Promotion Codes
 * - List Promotion Codes
 * - Retrieve Promotion Codes
 * - Update Promotion Codes
 * - Deactivate Promotion Codes
 *
 * NOTE:
 * Promotion Codes are a critical part of the GÖ.AI commercialization
 * strategy and support:
 *
 * • Founding 100
 * • Beta Waitlist Conversions
 * • Magic Link Campaigns
 * • Kickstarter Rewards
 * • Enterprise Discounts
 * • Referral Programs
 * • Executive Promotions
 *
 * Promotion Codes are built on top of Stripe Coupons.
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

    normalizePromotionCode

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Promotion Code Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Promotion Code payload.
 *
 * @param {Object} promotionCode
 * @returns {Object}
 */

function buildPromotionCodePayload(
    promotionCode
) {

    if (!promotionCode) {

        throw new StripeValidationError(

            "Promotion Code information is required."

        );

    }

    const {

        coupon,

        code,

        active = true,

        maxRedemptions,

        expiresAt,

        customer,

        metadata = {}

    } = promotionCode;

    validateId(

        coupon,

        "coupon"

    );

    if (

        typeof code !== "string" ||

        code.trim() === ""

    ) {

        throw new StripeValidationError(

            "Promotion Code is required."

        );

    }

    return {

        coupon,

        code:

            code.toUpperCase(),

        active,

        max_redemptions:

            maxRedemptions,

        expires_at:

            expiresAt,

        customer,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Promotion Codes
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Promotion Code.
 *
 * @param {Object} promotionCode
 * @returns {Promise<Object>}
 */

async function createPromotionCode(
    promotionCode
) {

    try {

        const payload =
            buildPromotionCodePayload(
                promotionCode
            );

        const response =
            await client.promotionCodes.create(
                payload
            );

        return {

            provider: "Stripe",

            promotionCode:

                normalizePromotionCode(
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
 * Retrieve all Promotion Codes.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listPromotionCodes(
    options = {}
) {

    try {

        const response =
            await client.promotionCodes.list({

                active:

                    options.active ?? true,

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            promotionCodes:

                response.data.map(

                    normalizePromotionCode

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
 * Retrieve a Promotion Code.
 *
 * @param {String} promotionCodeId
 * @returns {Promise<Object>}
 */

async function getPromotionCode(
    promotionCodeId
) {

    try {

        validateId(

            promotionCodeId,

            "promotion code"

        );

        const response =
            await client.promotionCodes.retrieve(

                promotionCodeId

            );

        return {

            provider: "Stripe",

            promotionCode:

                normalizePromotionCode(

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
 * Update a Promotion Code.
 *
 * NOTE:
 * Stripe only allows a limited number
 * of Promotion Code fields to be updated.
 *
 * @param {String} promotionCodeId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updatePromotionCode(

    promotionCodeId,

    updates

) {

    try {

        validateId(

            promotionCodeId,

            "promotion code"

        );

        const response =
            await client.promotionCodes.update(

                promotionCodeId,

                updates

            );

        return {

            provider: "Stripe",

            promotionCode:

                normalizePromotionCode(

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
 * Deactivate a Promotion Code.
 *
 * Promotion Codes are deactivated by
 * setting active = false.
 *
 * @param {String} promotionCodeId
 * @returns {Promise<Object>}
 */

async function deactivatePromotionCode(
    promotionCodeId
) {

    try {

        validateId(

            promotionCodeId,

            "promotion code"

        );

        const response =
            await client.promotionCodes.update(

                promotionCodeId,

                {

                    active: false

                }

            );

        return {

            provider: "Stripe",

            promotionCode:

                normalizePromotionCode(

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
| Promotion Code Utilities
|--------------------------------------------------------------------------
*/

/**
 * Validate a Promotion Code.
 *
 * @param {String} code
 * @returns {Promise<Object>}
 */

async function validatePromotionCode(
    code
) {

    try {

        const response =
            await client.promotionCodes.list({

                code:

                    code.toUpperCase(),

                active: true,

                limit: 1

            });

        return {

            provider: "Stripe",

            valid:

                response.data.length > 0,

            promotionCode:

                response.data.length

                    ? normalizePromotionCode(

                        response.data[0]

                    )

                    : null

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}
/**
 * Determine whether a Promotion Code exists.
 *
 * @param {String} promotionCodeId
 * @returns {Promise<Boolean>}
 */

async function promotionCodeExists(
    promotionCodeId
) {

    try {

        await getPromotionCode(

            promotionCodeId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve Promotion Codes by Coupon.
 *
 * @param {String} couponId
 * @returns {Promise<Object>}
 */

async function getPromotionCodesByCoupon(
    couponId
) {

    try {

        validateId(

            couponId,

            "coupon"

        );

        const response =
            await client.promotionCodes.list({

                coupon:

                    couponId,

                active: true,

                limit: 100

            });

        return {

            provider: "Stripe",

            promotionCodes:

                response.data.map(

                    normalizePromotionCode

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
 * Retrieve Promotion Codes by Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getPromotionCodesByCustomer(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.promotionCodes.list({

                customer:

                    customerId,

                active: true,

                limit: 100

            });

        return {

            provider: "Stripe",

            promotionCodes:

                response.data.map(

                    normalizePromotionCode

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
 * Normalize a collection of Promotion Codes.
 *
 * @param {Array} promotionCodes
 * @returns {Array}
 */

function normalizePromotionCodes(
    promotionCodes = []
) {

    return promotionCodes.map(

        normalizePromotionCode

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
| Campaign Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Promotion Code.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function createFounding100Code(
    options = {}
) {

    const {

        coupon,

        code,

        customer,

        expiresAt,

        metadata = {}

    } = options;

    return createPromotionCode({

        coupon,

        code,

        customer,

        expiresAt,

        maxRedemptions: 1,

        metadata: {

            ...metadata,

            campaign: "Founding 100",

            duration: "first_12_months"

        }

    });

}

/**
 * Create a Beta Waitlist Promotion Code.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function createWaitlistCode(
    options = {}
) {

    const {

        coupon,

        waitlistId,

        customer,

        expiresAt,

        metadata = {}

    } = options;

    if (!waitlistId) {

        throw new StripeValidationError(

            "Waitlist ID is required."

        );

    }

    return createPromotionCode({

        coupon,

        code:

            `GOAI-${waitlistId}`,

        customer,

        expiresAt,

        maxRedemptions: 1,

        metadata: {

            ...metadata,

            waitlistId,

            campaign: "Beta Waitlist"

        }

    });

}

/**
 * Create a Magic Link Promotion Code.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function createMagicLinkCode(
    options = {}
) {

    const {

        coupon,

        magicLinkId,

        customer,

        expiresAt,

        metadata = {}

    } = options;

    if (!magicLinkId) {

        throw new StripeValidationError(

            "Magic Link ID is required."

        );

    }

    return createPromotionCode({

        coupon,

        code:

            `MAGIC-${magicLinkId}`,

        customer,

        expiresAt,

        maxRedemptions: 1,

        metadata: {

            ...metadata,

            magicLinkId,

            campaign: "Magic Link"

        }

    });

}
/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    /*
    --------------------------------------------------------------------------
    Promotion Codes
    --------------------------------------------------------------------------
    */

    createPromotionCode,

    listPromotionCodes,

    getPromotionCode,

    updatePromotionCode,

    deactivatePromotionCode,

    validatePromotionCode,

    /*
    --------------------------------------------------------------------------
    Lookup Utilities
    --------------------------------------------------------------------------
    */

    promotionCodeExists,

    getPromotionCodesByCoupon,

    getPromotionCodesByCustomer,

    /*
    --------------------------------------------------------------------------
    Campaign Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Code,

    createWaitlistCode,

    createMagicLinkCode,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildPromotionCodePayload,

    normalizePromotionCodes,

    buildResponse,

    handleStripeError

};
