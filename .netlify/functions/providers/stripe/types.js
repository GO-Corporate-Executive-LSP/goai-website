/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: types.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Canonical object definitions used throughout the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Define Checkout Session type
 * - Define Customer type
 * - Define Payment Intent type
 * - Define Product type
 * - Define Promotion Code type
 * - Define Subscription type
 * - Define Invoice type
 * - Define Refund type
 * - Define Webhook Event type
 *
 * NOTE:
 * These are documentation-first object templates used to standardize
 * normalized data structures across GÖ.AI.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Checkout Session
|--------------------------------------------------------------------------
*/

const CheckoutType = {

    id: "",

    provider: "Stripe",

    mode: "",

    status: "",

    customerId: "",

    paymentIntentId: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

const CustomerType = {

    id: "",

    provider: "Stripe",

    email: "",

    name: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Payment Intent
|--------------------------------------------------------------------------
*/

const PaymentIntentType = {

    id: "",

    provider: "Stripe",

    amount: 0,

    currency: "",

    status: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

const ProductType = {

    id: "",

    provider: "Stripe",

    name: "",

    active: true,

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Promotion Code
|--------------------------------------------------------------------------
*/

const PromotionCodeType = {

    id: "",

    provider: "Stripe",

    code: "",

    active: true,

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Subscription
|--------------------------------------------------------------------------
*/

const SubscriptionType = {

    id: "",

    provider: "Stripe",

    customerId: "",

    status: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Invoice
|--------------------------------------------------------------------------
*/

const InvoiceType = {

    id: "",

    provider: "Stripe",

    customerId: "",

    status: "",

    amountDue: 0,

    currency: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Refund
|--------------------------------------------------------------------------
*/

const RefundType = {

    id: "",

    provider: "Stripe",

    paymentIntentId: "",

    amount: 0,

    status: "",

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Webhook Event
|--------------------------------------------------------------------------
*/

const WebhookType = {

    id: "",

    provider: "Stripe",

    type: "",

    createdAt: "",

    data: {},

    metadata: {}

};

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    CheckoutType,

    CustomerType,

    PaymentIntentType,

    ProductType,

    PromotionCodeType,

    SubscriptionType,

    InvoiceType,

    RefundType,

    WebhookType

};
