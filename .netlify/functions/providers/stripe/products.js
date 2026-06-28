/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: products.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise product and pricing management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Products
 * - List Products
 * - Retrieve Products
 * - Update Products
 * - Archive Products
 * - Create Prices
 * - List Prices
 * - Retrieve Prices
 * - Update Prices
 *
 * NOTE:
 * Stripe separates Products from Prices.
 * GÖ.AI intentionally manages both within this module because
 * every membership, enterprise plan, promotion, Kickstarter reward,
 * and Founding 100 offer begins with a Product.
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

    normalizeProduct,

    normalizePrice

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Product Payload Builder
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

        description = "",

        active = true,

        metadata = {}

    } = product;

    if (

        typeof name !== "string" ||

        name.trim() === ""

    ) {

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

/*
|--------------------------------------------------------------------------
| Price Payload Builder
|--------------------------------------------------------------------------
*/

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

    if (

        typeof unitAmount !== "number" ||

        unitAmount <= 0

    ) {

        throw new StripeValidationError(

            "A valid unit amount is required."

        );

    }

    return {

        product,

        unit_amount:

            unitAmount,

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
 * Retrieve all Stripe Products.
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
 * Stripe archives Products by
 * setting active = false.
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

            price:

                normalizePrice(

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
 * Retrieve all Prices associated with a Product.
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

                response.data.map(

                    normalizePrice

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

                normalizePrice(

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
 * Update a Stripe Price.
 *
 * NOTE:
 * Stripe only allows metadata,
 * nickname, lookup_key,
 * active status, and transfer lookup
 * fields to be updated.
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

                normalizePrice(

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
 * @param {Array} prices
 * @returns {Array}
 */

function normalizePrices(
    prices = []
) {

    return prices.map(

        normalizePrice

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
| Provider Utilities
|--------------------------------------------------------------------------
*/

/**
 * Determine whether a Product exists.
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
 * Determine whether a Price exists.
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

        response.prices.length === 0

    ) {

        return null;

    }

    return response.prices[0];

}

/**
 * Retrieve all recurring Prices
 * associated with a Product.
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

/**
 * Retrieve all active one-time Prices
 * associated with a Product.
 *
 * @param {String} productId
 * @returns {Promise<Array>}
 */

async function getOneTimePrices(
    productId
) {

    const response =
        await listPrices(

            productId

        );

    return response.prices.filter(

        (price) =>

            !price.recurring

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
    Provider Utilities
    --------------------------------------------------------------------------
    */

    productExists,

    priceExists,

    getDefaultPrice,

    getRecurringPrices,

    getOneTimePrices,

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
