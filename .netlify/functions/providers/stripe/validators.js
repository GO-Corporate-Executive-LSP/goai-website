/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: validators.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Shared validation utilities for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Validate identifiers
 * - Validate currencies
 * - Validate checkout modes
 * - Validate payment status
 * - Validate subscription status
 * - Validate invoice status
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

    CURRENCIES,

    CHECKOUT_MODES,

    PAYMENT_STATUSES,

    SUBSCRIPTION_STATUSES,

    INVOICE_STATUSES,

    REFUND_STATUSES,

    WEBHOOK_EVENTS

} = require("./constants");

/*
|--------------------------------------------------------------------------
| Identifier Validation
|--------------------------------------------------------------------------
*/

function validateId(
    id,
    field = "id"
) {

    if (

        typeof id !== "string" ||

        id.trim() === ""

    ) {

        throw new Error(

            `Invalid ${field}.`

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Currency Validation
|--------------------------------------------------------------------------
*/

function validateCurrency(
    currency
) {

    if (

        !CURRENCIES.includes(

            currency

        )

    ) {

        throw new Error(

            "Unsupported currency."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Checkout Mode Validation
|--------------------------------------------------------------------------
*/

function validateCheckoutMode(
    mode
) {

    if (

        !CHECKOUT_MODES.includes(

            mode

        )

    ) {

        throw new Error(

            "Invalid checkout mode."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Payment Status Validation
|--------------------------------------------------------------------------
*/

function validatePaymentStatus(
    status
) {

    if (

        !PAYMENT_STATUSES.includes(

            status

        )

    ) {

        throw new Error(

            "Invalid payment status."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Subscription Status Validation
|--------------------------------------------------------------------------
*/

function validateSubscriptionStatus(
    status
) {

    if (

        !SUBSCRIPTION_STATUSES.includes(

            status

        )

    ) {

        throw new Error(

            "Invalid subscription status."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Invoice Status Validation
|--------------------------------------------------------------------------
*/

function validateInvoiceStatus(
    status
) {

    if (

        !INVOICE_STATUSES.includes(

            status

        )

    ) {

        throw new Error(

            "Invalid invoice status."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Refund Status Validation
|--------------------------------------------------------------------------
*/

function validateRefundStatus(
    status
) {

    if (

        !REFUND_STATUSES.includes(

            status

        )

    ) {

        throw new Error(

            "Invalid refund status."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Webhook Event Validation
|--------------------------------------------------------------------------
*/

function validateWebhookEvent(
    event
) {

    if (

        !WEBHOOK_EVENTS.includes(

            event

        )

    ) {

        throw new Error(

            "Unsupported webhook event."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    validateId,

    validateCurrency,

    validateCheckoutMode,

    validatePaymentStatus,

    validateSubscriptionStatus,

    validateInvoiceStatus,

    validateRefundStatus,

    validateWebhookEvent

};
