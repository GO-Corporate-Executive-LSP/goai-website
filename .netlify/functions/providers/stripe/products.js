/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: products.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Manage Stripe Products and Prices for the GÖ.AI platform.
 *
 * Responsibilities:
 * - Create products
 * - List products
 * - Retrieve products
 * - Update products
 * - Archive products
 * - Create prices
 * - List prices
 * - Retrieve prices
 * - Update prices
 *
 * NOTE:
 * Stripe separates Products from Prices.
 * A single Product may have multiple Prices attached to it.
 * This allows GÖ.AI to support:
 *
 * • Founding 100 Pricing
 * • Standard Membership Pricing
 * • Enterprise Pricing
 * • Promotional Pricing
 * • Kickstarter Rewards
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

const client =
    require("./client");

const {

    validateId,

    validateCurrency

} = require("./validators");

const {

    normalizeProduct

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Product Helpers
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Product payload.
 *
 * @param {Object} product
 * @returns {Object}
 */

function buildProductPayload(
    product
) {

    if (!product) {

        throw new StripeValidationError(
            "Product information is required."
        );

    }

    const {

        name,

        description,

        active = true,

        metadata = {}

    } = product;

    if (!name) {

        throw new StripeValidationError(
            "Product name is required."
        );

    }

    return {

        name,

        description,

        active,

        metadata

    };

}

/**
 * Build a Stripe Price payload.
 *
 * @param {Object} price
 * @returns {Object}
 */

function buildPricePayload(
    price
) {

    if (!price) {

        throw new StripeValidationError(
            "Price information is required."
        );

    }

    const {

        product,

        unitAmount,

        currency,

        recurring,

        nickname,

        metadata = {}

    } = price;

    validateId(

        product,

        "product"

    );

    validateCurrency(

        currency

    );

    return {

        product,

        unit_amount: unitAmount,

        currency:

            currency.toLowerCase(),

        recurring,

        nickname,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Product.
 *
 * @param {Object} product
 * @returns {Promise<Object>}
 */

async function createProduct(
    product
) {

    try {

        const payload =
            buildProductPayload(
                product
            );

        const response =
            await client.products.create(
                payload
            );

        return {

            provider: "Stripe",

            product:

                normalizeProduct(
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
 * Retrieve all active Stripe Products.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listProducts(
    options = {}
) {

    try {

        const response =
            await client.products.list({

                active:

                    options.active ?? true,

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            products:

                response.data.map(

                    normalizeProduct

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
 * Retrieve a Stripe Product.
 *
 * @param {String} productId
 * @returns {Promise<Object>}
 */

async function getProduct(
    productId
) {

    try {

        validateId(

            productId,

            "product"

        );

        const response =
            await client.products.retrieve(

                productId

            );

        return {

            provider: "Stripe",

            product:

                normalizeProduct(

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
 * Update a Stripe Product.
 *
 * @param {String} productId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updateProduct(

    productId,

    updates

) {

    try {

        validateId(

            productId,

            "product"

        );

        const payload =
            buildProductPayload(

                updates

            );

        const response =
            await client.products.update(

                productId,

                payload

            );

        return {

            provider: "Stripe",

            product:

                normalizeProduct(

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
 * Archive a Stripe Product.
 *
 * Stripe archives products by setting
 * active = false.
 *
 * @param {String} productId
 * @returns {Promise<Object>}
 */

async function archiveProduct(
    productId
) {

    try {

        validateId(

            productId,

            "product"

        );

        const response =
            await client.products.update(

                productId,

                {

                    active: false

                }

            );

        return {

            provider: "Stripe",

            product:

                normalizeProduct(

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
| Prices
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Price.
 *
 * @param {Object} price
 * @returns {Promise<Object>}
 */

async function createPrice(
    price
) {

    try {

        const payload =
            buildPricePayload(
                price
            );

        const response =
            await client.prices.create(
                payload
            );

        return {

            provider: "Stripe",

            price: response

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}
/**
 * Retrieve all Prices for a Product.
 *
 * @param {String} productId
 * @returns {Promise<Object>}
 */

async function listPrices(
    productId
) {

    try {

        validateId(

            productId,

            "product"

        );

        const response =
            await client.prices.list({

                product:

                    productId,

                active: true,

                limit: 100

            });

        return {

            provider: "Stripe",

            prices:

                response.data

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Retrieve a Stripe Price.
 *
 * @param {String} priceId
 * @returns {Promise<Object>}
 */

async function getPrice(
    priceId
) {

    try {

        validateId(

            priceId,

            "price"

        );

        const response =
            await client.prices.retrieve(

                priceId

            );

        return {

            provider: "Stripe",

            price:

                response

        };

    }

    catch (error) {

        throw new StripeAPIError(

            error.message

        );

    }

}

/**
 * Update a Stripe Price.
 *
 * NOTE:
 * Stripe only allows certain fields such as
 * metadata, nickname, and active status
 * to be updated.
 *
 * @param {String} priceId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updatePrice(

    priceId,

    updates

) {

    try {

        validateId(

            priceId,

            "price"

        );

        const response =
            await client.prices.update(

                priceId,

                updates

            );

        return {

            provider: "Stripe",

            price:

                response

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
 * Normalize a collection of Stripe Products.
 *
 * @param {Array} products
 * @returns {Array}
 */

function normalizeProducts(
    products = []
) {

    return products.map(

        normalizeProduct

    );

}

/**
 * Normalize a collection of Stripe Prices.
 *
 * Prices are intentionally returned with their
 * native Stripe structure since ETAS™ frequently
 * needs access to recurring billing details,
 * billing schemes, and tiers.
 *
 * @param {Array} prices
 * @returns {Array}
 */

function normalizePrices(
    prices = []
) {

    return prices.map(

        (price) => ({

            id: price.id,

            provider: "Stripe",

            product: price.product,

            currency: price.currency,

            unitAmount:

                price.unit_amount,

            recurring:

                price.recurring,

            nickname:

                price.nickname,

            active:

                price.active,

            metadata:

                price.metadata || {}

        })

    );

}

/**
 * Build a standardized Stripe response.
 *
 * @param {String} provider
 * @param {String} resource
 * @param {*} data
 * @returns {Object}
 */

function buildResponse(

    provider,

    resource,

    data

) {

    return {

        provider,

        resource,

        data

    };

}

/**
 * Wrap unexpected provider errors.
 *
 * @param {Error} error
 * @throws {StripeAPIError}
 */

function handleStripeError(
    error
) {

    if (

        error instanceof StripeAPIError ||

        error instanceof StripeValidationError

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
| Provider Utilities
|--------------------------------------------------------------------------
*/

/**
 * Verify whether a Product exists.
 *
 * @param {String} productId
 * @returns {Promise<Boolean>}
 */

async function productExists(
    productId
) {

    try {

        await getProduct(

            productId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Verify whether a Price exists.
 *
 * @param {String} priceId
 * @returns {Promise<Boolean>}
 */

async function priceExists(
    priceId
) {

    try {

        await getPrice(

            priceId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve the default active Price
 * associated with a Product.
 *
 * @param {String} productId
 * @returns {Promise<Object|null>}
 */

async function getDefaultPrice(
    productId
) {

    const response =
        await listPrices(

            productId

        );

    if (

        !response.prices ||

        response.prices.length === 0

    ) {

        return null;

    }

    return response.prices[0];

}

/**
 * Retrieve all active recurring Prices
 * for a Product.
 *
 * @param {String} productId
 * @returns {Promise<Array>}
 */

async function getRecurringPrices(
    productId
) {

    const response =
        await listPrices(

            productId

        );

    return response.prices.filter(

        (price) =>

            price.recurring

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
    Products
    --------------------------------------------------------------------------
    */

    createProduct,

    listProducts,

    getProduct,

    updateProduct,

    archiveProduct,

    /*
    --------------------------------------------------------------------------
    Prices
    --------------------------------------------------------------------------
    */

    createPrice,

    listPrices,

    getPrice,

    updatePrice,

    /*
    --------------------------------------------------------------------------
    Utilities
    --------------------------------------------------------------------------
    */

    productExists,

    priceExists,

    getDefaultPrice,

    getRecurringPrices,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildProductPayload,

    buildPricePayload,

    normalizeProducts,

    normalizePrices,

    buildResponse,

    handleStripeError

};
