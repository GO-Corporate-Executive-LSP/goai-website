/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: customers.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Enterprise Customer management for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Create Customers
 * - List Customers
 * - Retrieve Customers
 * - Update Customers
 * - Delete Customers
 *
 * NOTE:
 * Stripe Customers represent every user who purchases
 * or subscribes to a GÖ.AI product.
 *
 * Customers may include:
 *
 * • Beta Waitlist Members
 * • Founding 100 Members
 * • Individual Subscribers
 * • Enterprise Administrators
 * • Corporate Billing Contacts
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

    normalizeCustomer

} = require("./normalize");

const {

    StripeAPIError,

    StripeValidationError

} = require("./errors");

/*
|--------------------------------------------------------------------------
| Customer Payload Builder
|--------------------------------------------------------------------------
*/

/**
 * Build a Stripe Customer payload.
 *
 * @param {Object} customer
 * @returns {Object}
 */

function buildCustomerPayload(
    customer
) {

    if (!customer) {

        throw new StripeValidationError(

            "Customer information is required."

        );

    }

    const {

        email,

        name,

        phone,

        description = "",

        metadata = {}

    } = customer;

    if (

        typeof email !== "string" ||

        email.trim() === ""

    ) {

        throw new StripeValidationError(

            "Customer email is required."

        );

    }

    return {

        email,

        name,

        phone,

        description,

        metadata

    };

}

/*
|--------------------------------------------------------------------------
| Customers
|--------------------------------------------------------------------------
*/

/**
 * Create a Stripe Customer.
 *
 * @param {Object} customer
 * @returns {Promise<Object>}
 */

async function createCustomer(
    customer
) {

    try {

        const payload =
            buildCustomerPayload(
                customer
            );

        const response =
            await client.customers.create(
                payload
            );

        return {

            provider: "Stripe",

            customer:

                normalizeCustomer(
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
 * Retrieve all Stripe Customers.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */

async function listCustomers(
    options = {}
) {

    try {

        const response =
            await client.customers.list({

                limit:

                    options.limit || 100

            });

        return {

            provider: "Stripe",

            customers:

                response.data.map(

                    normalizeCustomer

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
 * Retrieve a Stripe Customer.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function getCustomer(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.customers.retrieve(

                customerId

            );

        return {

            provider: "Stripe",

            customer:

                normalizeCustomer(

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
 * Update a Stripe Customer.
 *
 * @param {String} customerId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */

async function updateCustomer(

    customerId,

    updates

) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.customers.update(

                customerId,

                updates

            );

        return {

            provider: "Stripe",

            customer:

                normalizeCustomer(

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
 * Delete a Stripe Customer.
 *
 * Stripe marks Customers as deleted
 * rather than permanently removing them.
 *
 * @param {String} customerId
 * @returns {Promise<Object>}
 */

async function deleteCustomer(
    customerId
) {

    try {

        validateId(

            customerId,

            "customer"

        );

        const response =
            await client.customers.del(

                customerId

            );

        return {

            provider: "Stripe",

            deleted:

                response.deleted,

            id:

                response.id

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
| Customer Search
|--------------------------------------------------------------------------
*/

/**
 * Search Customers by email.
 *
 * @param {String} email
 * @returns {Promise<Object>}
 */

async function getCustomerByEmail(
    email
) {

    try {

        const response =
            await client.customers.list({

                email,

                limit: 1

            });

        return {

            provider: "Stripe",

            customer:

                response.data.length

                    ? normalizeCustomer(

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
 * Determine whether a Customer exists.
 *
 * @param {String} customerId
 * @returns {Promise<Boolean>}
 */

async function customerExists(
    customerId
) {

    try {

        await getCustomer(

            customerId

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/**
 * Retrieve Customers by name.
 *
 * @param {String} name
 * @returns {Promise<Object>}
 */

async function getCustomersByName(
    name
) {

    try {

        const response =
            await client.customers.search({

                query:

                    `name:"${name}"`

            });

        return {

            provider: "Stripe",

            customers:

                response.data.map(

                    normalizeCustomer

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
 * Retrieve Customers by metadata.
 *
 * Useful for locating GÖ.AI members,
 * Founding 100 users, waitlist members,
 * enterprise accounts, etc.
 *
 * @param {String} key
 * @param {String} value
 * @returns {Promise<Object>}
 */

async function getCustomersByMetadata(

    key,

    value

) {

    try {

        const response =
            await client.customers.search({

                query:

                    `metadata["${key}"]:"${value}"`

            });

        return {

            provider: "Stripe",

            customers:

                response.data.map(

                    normalizeCustomer

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
 * Normalize a collection of Stripe Customers.
 *
 * @param {Array} customers
 * @returns {Array}
 */

function normalizeCustomers(
    customers = []
) {

    return customers.map(

        normalizeCustomer

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
| GÖ.AI Customer Utilities
|--------------------------------------------------------------------------
*/

/**
 * Create a Founding 100 Customer.
 *
 * @param {Object} customer
 * @returns {Promise<Object>}
 */

async function createFounding100Customer(
    customer
) {

    customer.metadata = {

        ...(customer.metadata || {}),

        membership: "Founding 100",

        foundingMember: true

    };

    return createCustomer(

        customer

    );

}

/**
 * Create a Beta Waitlist Customer.
 *
 * @param {Object} customer
 * @returns {Promise<Object>}
 */

async function createWaitlistCustomer(
    customer
) {

    customer.metadata = {

        ...(customer.metadata || {}),

        membership: "Beta Waitlist",

        betaUser: true

    };

    return createCustomer(

        customer

    );

}

/**
 * Create an Enterprise Customer.
 *
 * @param {Object} customer
 * @returns {Promise<Object>}
 */

async function createEnterpriseCustomer(
    customer
) {

    customer.metadata = {

        ...(customer.metadata || {}),

        membership: "Enterprise",

        enterprise: true

    };

    return createCustomer(

        customer

    );

}

/**
 * Create an Executive Customer.
 *
 * @param {Object} customer
 * @returns {Promise<Object>}
 */

async function createExecutiveCustomer(
    customer
) {

    customer.metadata = {

        ...(customer.metadata || {}),

        membership: "Executive",

        executive: true

    };

    return createCustomer(

        customer

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
    Customers
    --------------------------------------------------------------------------
    */

    createCustomer,

    listCustomers,

    getCustomer,

    updateCustomer,

    deleteCustomer,

    /*
    --------------------------------------------------------------------------
    Customer Search
    --------------------------------------------------------------------------
    */

    getCustomerByEmail,

    getCustomersByName,

    getCustomersByMetadata,

    customerExists,

    /*
    --------------------------------------------------------------------------
    GÖ.AI Customer Utilities
    --------------------------------------------------------------------------
    */

    createFounding100Customer,

    createWaitlistCustomer,

    createEnterpriseCustomer,

    createExecutiveCustomer,

    /*
    --------------------------------------------------------------------------
    Internal Helpers
    --------------------------------------------------------------------------
    */

    buildCustomerPayload,

    normalizeCustomers,

    buildResponse,

    handleStripeError

};
