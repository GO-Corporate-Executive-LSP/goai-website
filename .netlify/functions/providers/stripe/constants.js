/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: constants.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Shared constants used throughout the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Provider metadata
 * - Supported currencies
 * - Payment statuses
 * - Checkout modes
 * - Subscription statuses
 * - Invoice statuses
 * - Webhook events
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

const PROVIDER = "Stripe";

/*
|--------------------------------------------------------------------------
| Supported Currencies
|--------------------------------------------------------------------------
*/

const CURRENCIES = [

    "USD",

    "EUR",

    "GBP",

    "CAD",

    "AUD"

];

/*
|--------------------------------------------------------------------------
| Checkout Modes
|--------------------------------------------------------------------------
*/

const CHECKOUT_MODES = [

    "payment",

    "subscription",

    "setup"

];

/*
|--------------------------------------------------------------------------
| Payment Statuses
|--------------------------------------------------------------------------
*/

const PAYMENT_STATUSES = [

    "requires_payment_method",

    "requires_confirmation",

    "requires_action",

    "processing",

    "requires_capture",

    "canceled",

    "succeeded"

];

/*
|--------------------------------------------------------------------------
| Subscription Statuses
|--------------------------------------------------------------------------
*/

const SUBSCRIPTION_STATUSES = [

    "trialing",

    "active",

    "past_due",

    "canceled",

    "incomplete",

    "incomplete_expired",

    "unpaid"

];

/*
|--------------------------------------------------------------------------
| Invoice Statuses
|--------------------------------------------------------------------------
*/

const INVOICE_STATUSES = [

    "draft",

    "open",

    "paid",

    "void",

    "uncollectible"

];

/*
|--------------------------------------------------------------------------
| Refund Statuses
|--------------------------------------------------------------------------
*/

const REFUND_STATUSES = [

    "pending",

    "requires_action",

    "succeeded",

    "failed",

    "canceled"

];

/*
|--------------------------------------------------------------------------
| Webhook Events
|--------------------------------------------------------------------------
*/

const WEBHOOK_EVENTS = [

    "checkout.session.completed",

    "payment_intent.succeeded",

    "payment_intent.payment_failed",

    "customer.subscription.created",

    "customer.subscription.updated",

    "customer.subscription.deleted",

    "invoice.paid",

    "invoice.payment_failed",

    "charge.refunded"

];

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    PROVIDER,

    CURRENCIES,

    CHECKOUT_MODES,

    PAYMENT_STATUSES,

    SUBSCRIPTION_STATUSES,

    INVOICE_STATUSES,

    REFUND_STATUSES,

    WEBHOOK_EVENTS

};
