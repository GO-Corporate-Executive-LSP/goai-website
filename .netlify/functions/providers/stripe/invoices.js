/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: invoices.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Invoice management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Invoices
 * - List Invoices
 * - Retrieve Invoices
 * - Update Invoices
 * - Void Invoices
 *
 * NOTE:
 * Invoices provide the official billing record for all recurring
 * GÖ.AI memberships and enterprise subscriptions.
 *
 * They support:
 *
 * • Founding 100 Memberships
 * • Beta Memberships
 * • Executive Memberships
 * • Enterprise Billing
 * • Future Marketplace Purchases
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

    normalizeInvoice

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Invoice Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Invoice payload.
 *
 * @param {Object} invoice
 * @returns {Object}
 */

function buildInvoicePayload(
    invoice
) {

    if (!invoice) {

        throw new StripeValidationError(

            "Invoice information is required."

        );

    }

    const {

        customer,

        description = "",

        autoAdvance = true,

        collectionMethod = "charge_automatically",

        metadata = {}

    } = invoice;

    validateId(

        customer,

        "customer"

    );

    return {

        customer,

        description,

        auto_advance:

            autoAdvance,

        collection_method:

            collectionMethod,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Invoice.
 *
 * @param {Object} invoice
 * @returns {Promise<Object>}
 */

async function createInvoice(
    invoice
) {

    try {

        const payload =
            buildInvoicePayload(
                invoice
            );

        const response =
            await client.invoices.create(
                payload
            );

        return {

            provider: "Stripe",

            invoice:

                normalizeInvoice(
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
 * Retrieve all Invoices.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listInvoices(
    options = {}
) {

    try {

        const response =
            await client.invoices.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            invoices:

                response.data.map(

                    normalizeInvoice

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
 * Retrieve an Invoice.
 *
 * @param {String} invoiceId
 * @returns {Promise<Object>}
 */

async function getInvoice(
    invoiceId
) {

    try {

        validateId(

            invoiceId,

            "invoice"

        );

        const response =
            await client.invoices.retrieve(

                invoiceId

            );

        return {

            provider: "Stripe",

            invoice:

                normalizeInvoice(

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
 * Update an Invoice.
 *
 * @param {String} invoiceId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updateInvoice(

    invoiceId,

    updates

) {

    try {

        validateId(

            invoiceId,

            "invoice"

        );

        const response =
            await client.invoices.update(

                invoiceId,

                updates

            );

        return {

            provider: "Stripe",

            invoice:

                normalizeInvoice(

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
 * Void an Invoice.
 *
 * @param {String} invoiceId
 * @returns {Promise<Object>}
 */

async function voidInvoice(
    invoiceId
) {

    try {

        validateId(

            invoiceId,

            "invoice"

        );

        const response =
            await client.invoices.voidInvoice(

                invoiceId

            );

        return {

            provider: "Stripe",

            invoice:

                normalizeInvoice(

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
| Invoice Search
|--------------------------------------------------------------------------
*/

/**
 * Retrieve Invoices
 * for a Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getCustomerInvoices(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.invoices.list({

                customer:

                    customerId,

                limit: 100

            });

        return {

            provider: "Stripe",

            invoices:

                response.data.map(

                    normalizeInvoice

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
 * Determine whether an Invoice exists.
 *
 * @param {String} invoiceId
 * @returns {Promise<Boolean>}
 */

async function invoiceExists(
    invoiceId
) {

    try {

        await getInvoice(

            invoiceId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve paid Invoices.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getPaidInvoices(
    options = {}
) {

    try {

        const response =
            await client.invoices.list({

                status: "paid",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            invoices:

                response.data.map(

                    normalizeInvoice

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
 * Retrieve open Invoices.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function getOpenInvoices(
    options = {}
) {

    try {

        const response =
            await client.invoices.list({

                status: "open",

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            invoices:

                response.data.map(

                    normalizeInvoice

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
 * Normalize a collection of Invoices.
 *
 * @param {Array} invoices
 * @returns {Array}
 */

function normalizeInvoices(
    invoices = []
) {

    return invoices.map(

        normalizeInvoice

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
| GÖ.AI Invoice Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Invoice.
 *
 * @param {Object} invoice
 * @returns {Promise<Object>}
 */

async function createFounding100Invoice(
    invoice
) {

    invoice.metadata = {

        ...(invoice.metadata || {}),

        membership: "Founding 100",

        campaign: "Founding 100"

    };

    return createInvoice(

        invoice

    );

}

/**
 * Create a Beta Waitlist Invoice.
 *
 * @param {Object} invoice
 * @returns {Promise<Object>}
 */

async function createWaitlistInvoice(
    invoice
) {

    invoice.metadata = {

        ...(invoice.metadata || {}),

        membership: "Beta Waitlist",

        campaign: "Beta Waitlist"

    };

    return createInvoice(

        invoice

    );

}

/**
 * Create an Enterprise Invoice.
 *
 * @param {Object} invoice
 * @returns {Promise<Object>}
 */

async function createEnterpriseInvoice(
    invoice
) {

    invoice.metadata = {

        ...(invoice.metadata || {}),

        membership: "Enterprise",

        campaign: "Enterprise"

    };

    return createInvoice(

        invoice

    );

}

/**
 * Create an Executive Invoice.
 *
 * @param {Object} invoice
 * @returns {Promise<Object>}
 */

async function createExecutiveInvoice(
    invoice
) {

    invoice.metadata = {

        ...(invoice.metadata || {}),

        membership: "Executive",

        campaign: "Executive"

    };

    return createInvoice(

        invoice

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
    Invoices
    --------------------------------------------------------------------------
    */

    createInvoice,

    listInvoices,

    getInvoice,

    updateInvoice,

    voidInvoice,

    /*
    --------------------------------------------------------------------------
    Invoice Search
    --------------------------------------------------------------------------
    */

    getCustomerInvoices,

    getPaidInvoices,

    getOpenInvoices,

    invoiceExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Invoice Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Invoice,

    createWaitlistInvoice,

    createEnterpriseInvoice,

    createExecutiveInvoice,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildInvoicePayload,

    normalizeInvoices,

    buildResponse,

    handleStripeError

};
