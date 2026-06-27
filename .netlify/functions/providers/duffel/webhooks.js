/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: webhooks.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Processes webhook events received from the Duffel API.
 *
 * Responsibilities:
 * - Verify webhook authenticity
 * - Parse incoming webhook events
 * - Normalize webhook payloads
 * - Route events into ETAS™
 * - Notify SENTINEL™ of booking changes
 *
 * IMPORTANT:
 * Webhooks are inbound events initiated by Duffel.
 * They allow GÖ.AI to react to booking changes in
 * near real-time without polling the API.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * Duffel Webhooks
 *          │
 *          ▼
 * webhooks.js
 *          │
 *          ▼
 * ETAS™ Event Bus
 *          │
 *          ▼
 * SENTINEL™
 *          │
 *          ▼
 * Canonical Trip Object
 *
 * -----------------------------------------------------------------------------
 * References:
 * - Duffel Webhooks API
 * - Lee Kosek Postman Collection
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

const crypto = require("crypto");

const {
    DuffelValidationError,
    DuffelApiError
} = require("./errors");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

/**
 * Supported Duffel webhook event types.
 */
const WEBHOOK_EVENTS = Object.freeze({

    ORDER_CREATED: "order.created",

    ORDER_UPDATED: "order.updated",

    ORDER_CANCELLED: "order.cancelled",

    ORDER_CHANGED: "order.changed",

    ORDER_FAILED: "order.failed"

});

/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Validates an incoming webhook payload.
 *
 * @param {Object} payload
 * @throws {DuffelValidationError}
 */
function validateWebhookPayload(payload = {}) {

    if (!payload.type) {

        throw new DuffelValidationError(
            "Webhook event type is required."
        );

    }

    if (!payload.data) {

        throw new DuffelValidationError(
            "Webhook payload data is required."
        );

    }

}

/**
 * Normalizes an incoming webhook event.
 *
 * @param {Object} payload
 * @returns {Object}
 */
function normalizeWebhook(payload = {}) {

    validateWebhookPayload(payload);

    return {

        provider: "Duffel",

        eventType: payload.type,

        eventId: payload.id || null,

        occurredAt:
            payload.created_at ||
            new Date().toISOString(),

        data: payload.data,

        raw: payload

    };

}

/*
|--------------------------------------------------------------------------
| Public Functions
|--------------------------------------------------------------------------
*/

/**
 * Verifies webhook authenticity.
 *
 * Part 2 implements this function.
 */
async function verifyWebhook() {

    throw new Error(
        "verifyWebhook() not yet implemented."
    );

}

/**
 * Parses a webhook event.
 *
 * Part 3 implements this function.
 */
async function parseWebhookEvent() {

    throw new Error(
        "parseWebhookEvent() not yet implemented."
    );

}

/**
 * Handles Order-related webhook events.
 *
 * Part 4 implements this function.
 */
async function handleOrderEvent() {

    throw new Error(
        "handleOrderEvent() not yet implemented."
    );

}

/**
 * --------------------------------------------------------------------------
 * Verify Webhook
 * --------------------------------------------------------------------------
 * Verifies the authenticity of an incoming Duffel webhook.
 *
 * IMPORTANT:
 * Every webhook received by ETAS™ should be verified before
 * processing. This prevents forged or replayed webhook events.
 *
 * Future versions should validate the webhook using Duffel's
 * signing secret and official signature verification process.
 *
 * Used by:
 * - ETAS™
 * - Event Bus
 * - SENTINEL™
 *
 * @param {string} payload
 * @param {string} signature
 * @returns {Promise<Object>}
 */
async function verifyWebhook(
    payload,
    signature
) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!payload) {

        throw new DuffelValidationError(
            "Webhook payload is required."
        );

    }

    if (!signature) {

        throw new DuffelValidationError(
            "Webhook signature is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Verify Signature
    --------------------------------------------------------------------------

    NOTE:
    This implementation assumes the signing secret is stored
    as an environment variable.

    Future versions should follow Duffel's official webhook
    verification specification.
    */

    const signingSecret =
        process.env.DUFFEL_WEBHOOK_SECRET;

    if (!signingSecret) {

        throw new DuffelApiError(
            500,
            {
                message:
                    "Duffel webhook signing secret is not configured."
            }
        );

    }

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            signingSecret
        )
        .update(payload)
        .digest("hex");

    const verified = crypto.timingSafeEqual(

        Buffer.from(expectedSignature),

        Buffer.from(signature)

    );

    if (!verified) {

        throw new DuffelApiError(
            401,
            {
                message:
                    "Webhook signature verification failed."
            }
        );

    }

    /*
    --------------------------------------------------------------------------
    Return Verification Result
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        verified: true,

        verifiedAt:
            new Date().toISOString()

    };

}

/**
 * --------------------------------------------------------------------------
 * Parse Webhook Event
 * --------------------------------------------------------------------------
 * Parses and normalizes an incoming Duffel webhook event.
 *
 * IMPORTANT:
 * This function assumes the webhook has already passed
 * signature verification.
 *
 * Used by:
 * - ETAS™ Event Bus
 * - SENTINEL™
 * - Canonical Trip Object
 * - Executive Briefings
 *
 * @param {Object|string} payload
 * @returns {Promise<Object>}
 */
async function parseWebhookEvent(payload) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!payload) {

        throw new DuffelValidationError(
            "Webhook payload is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Parse Payload
    --------------------------------------------------------------------------
    */

    let parsedPayload = payload;

    if (typeof payload === "string") {

        try {

            parsedPayload = JSON.parse(payload);

        } catch (error) {

            throw new DuffelValidationError(
                "Webhook payload contains invalid JSON."
            );

        }

    }

    /*
    --------------------------------------------------------------------------
    Normalize Event
    --------------------------------------------------------------------------
    */

    const event =
        normalizeWebhook(parsedPayload);

    /*
    --------------------------------------------------------------------------
    Validate Event Type
    --------------------------------------------------------------------------
    */

    if (
        !Object.values(WEBHOOK_EVENTS)
            .includes(event.eventType)
    ) {

        throw new DuffelValidationError(
            `Unsupported webhook event: ${event.eventType}`
        );

    }

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Event
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        parsedAt:
            new Date().toISOString(),

        event

    };

}

/**
 * --------------------------------------------------------------------------
 * Handle Order Event
 * --------------------------------------------------------------------------
 * Processes Order-related webhook events received from Duffel.
 *
 * IMPORTANT:
 * This function serves as the bridge between Duffel webhooks and
 * ETAS™. It determines the event type, normalizes the payload,
 * and prepares the Canonical Trip Object for updates.
 *
 * Future versions will:
 * - Publish events to the ETAS™ Event Bus
 * - Update the Canonical Trip Object
 * - Trigger SENTINEL™ monitoring
 * - Initiate autonomous rebooking workflows
 * - Notify travelers and enterprise dashboards
 *
 * Used by:
 * - ETAS™
 * - SENTINEL™
 * - Executive Briefings
 * - Traveler Dashboard
 * - Continuous Monitoring
 *
 * @param {Object} event
 * @returns {Promise<Object>}
 */
async function handleOrderEvent(event = {}) {

    /*
    --------------------------------------------------------------------------
    Validate Input
    --------------------------------------------------------------------------
    */

    if (!event.eventType) {

        throw new DuffelValidationError(
            "Webhook event type is required."
        );

    }

    if (!event.data) {

        throw new DuffelValidationError(
            "Webhook event data is required."
        );

    }

    /*
    --------------------------------------------------------------------------
    Process Event
    --------------------------------------------------------------------------
    */

    let action;

    switch (event.eventType) {

        case WEBHOOK_EVENTS.ORDER_CREATED:

            action = "ORDER_CREATED";

            break;

        case WEBHOOK_EVENTS.ORDER_UPDATED:

            action = "ORDER_UPDATED";

            break;

        case WEBHOOK_EVENTS.ORDER_CANCELLED:

            action = "ORDER_CANCELLED";

            break;

        case WEBHOOK_EVENTS.ORDER_CHANGED:

            action = "ORDER_CHANGED";

            break;

        case WEBHOOK_EVENTS.ORDER_FAILED:

            action = "ORDER_FAILED";

            break;

        default:

            throw new DuffelValidationError(
                `Unsupported webhook event: ${event.eventType}`
            );

    }

    /*
    --------------------------------------------------------------------------
    Future ETAS Integration
    --------------------------------------------------------------------------

    Version 1.0 intentionally stops here.

    Future versions will:

        ✓ Update Canonical Trip Object
        ✓ Publish ETAS Event
        ✓ Trigger SENTINEL™
        ✓ Generate Executive Briefing updates
        ✓ Notify Traveler
        ✓ Trigger Automatic Rebooking
        ✓ Refresh Dashboard

    --------------------------------------------------------------------------
    */

    /*
    --------------------------------------------------------------------------
    Return ETAS-Compatible Event
    --------------------------------------------------------------------------
    */

    return {

        provider: "Duffel",

        handledAt:
            new Date().toISOString(),

        action,

        event

    };

}

/*
|--------------------------------------------------------------------------
| Webhook Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Determines whether the webhook represents
 * an Order Created event.
 *
 * @param {Object} event
 * @returns {boolean}
 */
function isOrderCreated(event = {}) {

    return (
        event.eventType ===
        WEBHOOK_EVENTS.ORDER_CREATED
    );

}

/**
 * Determines whether the webhook represents
 * an Order Updated event.
 *
 * @param {Object} event
 * @returns {boolean}
 */
function isOrderUpdated(event = {}) {

    return (
        event.eventType ===
        WEBHOOK_EVENTS.ORDER_UPDATED
    );

}

/**
 * Determines whether the webhook represents
 * an Order Cancelled event.
 *
 * @param {Object} event
 * @returns {boolean}
 */
function isOrderCancelled(event = {}) {

    return (
        event.eventType ===
        WEBHOOK_EVENTS.ORDER_CANCELLED
    );

}

/**
 * Determines whether the webhook represents
 * an Order Changed event.
 *
 * @param {Object} event
 * @returns {boolean}
 */
function isOrderChanged(event = {}) {

    return (
        event.eventType ===
        WEBHOOK_EVENTS.ORDER_CHANGED
    );

}

/**
 * Determines whether the webhook represents
 * an Order Failed event.
 *
 * @param {Object} event
 * @returns {boolean}
 */
function isOrderFailed(event = {}) {

    return (
        event.eventType ===
        WEBHOOK_EVENTS.ORDER_FAILED
    );

}

/**
 * Returns the webhook event type.
 *
 * @param {Object} event
 * @returns {string|null}
 */
function getEventType(event = {}) {

    return event.eventType || null;

}

/**
 * Returns the normalized webhook payload.
 *
 * @param {Object} event
 * @returns {Object|null}
 */
function getEventData(event = {}) {

    return event.data || null;

}

/**
 * Returns the webhook event identifier.
 *
 * @param {Object} event
 * @returns {string|null}
 */
function getEventId(event = {}) {

    return event.eventId || null;

}

/**
 * Returns the timestamp indicating when
 * the webhook event occurred.
 *
 * @param {Object} event
 * @returns {string|null}
 */
function getOccurredAt(event = {}) {

    return event.occurredAt || null;

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
|
| Public API exposed to ETAS™.
| All webhook operations should be accessed through these methods.
|
*/

module.exports = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Core Webhook Operations
    |--------------------------------------------------------------------------
    */

    verifyWebhook,

    parseWebhookEvent,

    handleOrderEvent,

    /*
    |--------------------------------------------------------------------------
    | Webhook Helper Functions
    |--------------------------------------------------------------------------
    */

    isOrderCreated,

    isOrderUpdated,

    isOrderCancelled,

    isOrderChanged,

    isOrderFailed,

    getEventType,

    getEventData,

    getEventId,

    getOccurredAt

});
