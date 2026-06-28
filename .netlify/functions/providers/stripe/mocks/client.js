/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Mock Client
 * File: __mocks__/client.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Mock implementation of the Stripe SDK used throughout the Jest
 * test suite.
 *
 * Responsibilities:
 * - Mock Products
 * - Mock Prices
 * - Mock Promotion Codes
 * - Mock Customers
 * - Mock Checkout Sessions
 * - Mock Payment Intents
 * - Mock Subscriptions
 * - Mock Invoices
 * - Mock Refunds
 * - Mock Webhooks
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

const products = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Prices
|--------------------------------------------------------------------------
*/

const prices = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Promotion Codes
|--------------------------------------------------------------------------
*/

const promotionCodes = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Customers
|--------------------------------------------------------------------------
*/

const customers = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn(),

    del: jest.fn(),

    search: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Checkout Sessions
|--------------------------------------------------------------------------
*/

const checkout = {

    sessions: {

        create: jest.fn(),

        list: jest.fn(),

        retrieve: jest.fn(),

        expire: jest.fn()

    }

};

/*
|--------------------------------------------------------------------------
| Payment Intents
|--------------------------------------------------------------------------
*/

const paymentIntents = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn(),

    cancel: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Subscriptions
|--------------------------------------------------------------------------
*/

const subscriptions = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn(),

    cancel: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

const invoices = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn(),

    voidInvoice: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Refunds
|--------------------------------------------------------------------------
*/

const refunds = {

    create: jest.fn(),

    list: jest.fn(),

    retrieve: jest.fn(),

    update: jest.fn(),

    cancel: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Webhooks
|--------------------------------------------------------------------------
*/

const webhooks = {

    constructEvent: jest.fn()

};

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    products,

    prices,

    promotionCodes,

    customers,

    checkout,

    paymentIntents,

    subscriptions,

    invoices,

    refunds,

    webhooks

};
