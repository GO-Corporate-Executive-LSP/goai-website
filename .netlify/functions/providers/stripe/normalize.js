/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: normalize.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Normalize Stripe objects into GÖ.AI's canonical format.
 *
 * Responsibilities:
 * - Normalize Checkout Sessions
 * - Normalize Customers
 * - Normalize Payment Intents
 * - Normalize Products
 * - Normalize Promotion Codes
 * - Normalize Subscriptions
 * - Normalize Invoices
 * - Normalize Refunds
 * - Normalize Webhooks
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

const {

    PROVIDER

} = require("./constants");

/*
|--------------------------------------------------------------------------
| Checkout Session
|--------------------------------------------------------------------------
*/

function normalizeCheckout(
    session
) {

    return {

        id: session.id,

        provider: PROVIDER,

        mode: session.mode,

        status: session.status,

        customerId: session.customer,

        paymentIntentId:
            session.payment_intent,

        metadata:
            session.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

function normalizeCustomer(
    customer
) {

    return {

        id: customer.id,

        provider: PROVIDER,

        email: customer.email,

        name: customer.name,

        metadata:
            customer.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Payment Intent
|--------------------------------------------------------------------------
*/

function normalizePaymentIntent(
    paymentIntent
) {

    return {

        id: paymentIntent.id,

        provider: PROVIDER,

        amount: paymentIntent.amount,

        currency: paymentIntent.currency,

        status: paymentIntent.status,

        metadata:
            paymentIntent.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

function normalizeProduct(
    product
) {

    return {

        id: product.id,

        provider: PROVIDER,

        name: product.name,

        active: product.active,

        metadata:
            product.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Promotion Code
|--------------------------------------------------------------------------
*/

function normalizePromotionCode(
    promotionCode
) {

    return {

        id: promotionCode.id,

        provider: PROVIDER,

        code: promotionCode.code,

        active: promotionCode.active,

        metadata:
            promotionCode.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Subscription
|--------------------------------------------------------------------------
*/

function normalizeSubscription(
    subscription
) {

    return {

        id: subscription.id,

        provider: PROVIDER,

        customerId: subscription.customer,

        status: subscription.status,

        metadata:
            subscription.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Invoice
|--------------------------------------------------------------------------
*/

function normalizeInvoice(
    invoice
) {

    return {

        id: invoice.id,

        provider: PROVIDER,

        customerId: invoice.customer,

        status: invoice.status,

        amountDue:
            invoice.amount_due,

        currency:
            invoice.currency,

        metadata:
            invoice.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Refund
|--------------------------------------------------------------------------
*/

function normalizeRefund(
    refund
) {

    return {

        id: refund.id,

        provider: PROVIDER,

        paymentIntentId:
            refund.payment_intent,

        amount:
            refund.amount,

        status:
            refund.status,

        metadata:
            refund.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Webhook Event
|--------------------------------------------------------------------------
*/

function normalizeWebhook(
    event
) {

    return {

        id: event.id,

        provider: PROVIDER,

        type: event.type,

        createdAt:
            event.created,

        data:
            event.data,

        metadata: {}

    };

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    normalizeCheckout,

    normalizeCustomer,

    normalizePaymentIntent,

    normalizeProduct,

    normalizePromotionCode,

    normalizeSubscription,

    normalizeInvoice,

    normalizeRefund,

    normalizeWebhook

};
