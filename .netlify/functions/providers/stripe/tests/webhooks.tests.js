/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/webhooks.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Webhooks Provider.
 *
 * Coverage:
 * - Webhook Events
 * - Signature Verification
 * - Validation
 * - Error Handling
 * - Event Dispatch
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

jest.mock("../client");

const client =
    require("../client");

const webhooks =
    require("../webhooks");

const mockWebhooks =
    require("../__mocks__/webhooks.json");

const {

    StripeAPIError,

    StripeValidationError

} = require("../errors");

/*
|--------------------------------------------------------------------------
| Test Suite
|--------------------------------------------------------------------------
*/

describe(

    "Stripe Webhooks Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Webhook Verification
|--------------------------------------------------------------------------
*/

        describe(

            "verifyWebhookSignature()",

            () => {

                test(

                    "verifies a valid webhook signature",

                    async () => {

                        client.webhooks.constructEvent.mockReturnValue(

                            mockWebhooks[0]

                        );

                        const result =
                            await webhooks.verifyWebhookSignature(

                                "payload",

                                "signature",

                                "whsec_test"

                            );

                        expect(

                            client.webhooks.constructEvent

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.event.id

                        ).toBe(

                            mockWebhooks[0].id

                        );

                    }

                );

                test(

                    "throws validation error when signature is missing",

                    async () => {

                        await expect(

                            webhooks.verifyWebhookSignature(

                                "payload",

                                null,

                                "whsec_test"

                            )

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when verification fails",

                    async () => {

                        client.webhooks.constructEvent.mockImplementation(

                            () => {

                                throw new Error(

                                    "Invalid Signature"

                                );

                            }

                        );

                        await expect(

                            webhooks.verifyWebhookSignature(

                                "payload",

                                "bad_signature",

                                "whsec_test"

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Event Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getEvent()",

            () => {

                test(

                    "retrieves a webhook event",

                    async () => {

                        client.events.retrieve.mockResolvedValue(

                            mockWebhooks[0]

                        );

                        const result =
                            await webhooks.getEvent(

                                mockWebhooks[0].id

                            );

                        expect(

                            client.events.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.event.id

                        ).toBe(

                            mockWebhooks[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.events.retrieve.mockRejectedValue(

                            new Error(

                                "Event Not Found"

                            )

                        );

                        await expect(

                            webhooks.getEvent(

                                "evt_invalid"

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Event Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listEvents()",

            () => {

                test(

                    "lists webhook events",

                    async () => {

                        client.events.list.mockResolvedValue({

                            data:

                                mockWebhooks

                        });

                        const result =
                            await webhooks.listEvents();

                        expect(

                            client.events.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.events.length

                        ).toBe(

                            mockWebhooks.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.events.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await webhooks.listEvents();

                        expect(

                            result.events

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.events.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            webhooks.listEvents()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Event Dispatch
|--------------------------------------------------------------------------
*/

        describe(

            "dispatchEvent()",

            () => {

                test(

                    "dispatches a checkout.session.completed event",

                    async () => {

                        const result =
                            await webhooks.dispatchEvent(

                                mockWebhooks[0]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "checkout.session.completed"

                        );

                    }

                );

                test(

                    "dispatches a payment_intent.succeeded event",

                    async () => {

                        const result =
                            await webhooks.dispatchEvent(

                                mockWebhooks[1]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "payment_intent.succeeded"

                        );

                    }

                );

                test(

                    "throws StripeAPIError for unsupported events",

                    async () => {

                        await expect(

                            webhooks.dispatchEvent({

                                id: "evt_unknown",

                                type:

                                    "unknown.event"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Event Processing
|--------------------------------------------------------------------------
*/

        describe(

            "processEvent()",

            () => {

                test(

                    "processes a valid webhook event",

                    async () => {

                        const result =
                            await webhooks.processEvent(

                                mockWebhooks[0]

                            );

                        expect(

                            result.success

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "throws StripeAPIError when processing fails",

                    async () => {

                        await expect(

                            webhooks.processEvent({

                                type:

                                    "invalid.event"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Event Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "eventExists()",

            () => {

                test(

                    "returns true when event exists",

                    async () => {

                        client.events.retrieve.mockResolvedValue(

                            mockWebhooks[0]

                        );

                        const exists =
                            await webhooks.eventExists(

                                mockWebhooks[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when event does not exist",

                    async () => {

                        client.events.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await webhooks.eventExists(

                                "evt_invalid"

                            );

                        expect(

                            exists

                        ).toBe(

                            false

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Event Lookup Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Event Lookup Helpers",

            () => {

                test(

                    "retrieves checkout events",

                    async () => {

                        client.events.list.mockResolvedValue({

                            data:

                                mockWebhooks

                        });

                        const result =
                            await webhooks.getCheckoutEvents();

                        expect(

                            Array.isArray(

                                result.events

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves payment intent events",

                    async () => {

                        client.events.list.mockResolvedValue({

                            data:

                                mockWebhooks

                        });

                        const result =
                            await webhooks.getPaymentIntentEvents();

                        expect(

                            Array.isArray(

                                result.events

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves invoice events",

                    async () => {

                        client.events.list.mockResolvedValue({

                            data:

                                mockWebhooks

                        });

                        const result =
                            await webhooks.getInvoiceEvents();

                        expect(

                            Array.isArray(

                                result.events

                            )

                        ).toBe(

                            true

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| GÖ.AI Webhook Utilities
|--------------------------------------------------------------------------
*/

        describe(

            "GÖ.AI Webhook Utilities",

            () => {

                test(

                    "handles checkout.session.completed event",

                    async () => {

                        const result =
                            await webhooks.handleCheckoutCompleted(

                                mockWebhooks[0]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "checkout.session.completed"

                        );

                    }

                );

                test(

                    "handles payment_intent.succeeded event",

                    async () => {

                        const result =
                            await webhooks.handlePaymentIntentSucceeded(

                                mockWebhooks[1]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "payment_intent.succeeded"

                        );

                    }

                );

                test(

                    "handles invoice.paid event",

                    async () => {

                        const result =
                            await webhooks.handleInvoicePaid(

                                mockWebhooks[5]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "invoice.paid"

                        );

                    }

                );

                test(

                    "handles charge.refunded event",

                    async () => {

                        const result =
                            await webhooks.handleChargeRefunded(

                                mockWebhooks[7]

                            );

                        expect(

                            result.event.type

                        ).toBe(

                            "charge.refunded"

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Internal Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Internal Helpers",

            () => {

                test(

                    "buildWebhookPayload() returns a valid payload",

                    () => {

                        const payload =
                            webhooks.buildWebhookPayload(

                                mockWebhooks[0]

                            );

                        expect(

                            payload.id

                        ).toBe(

                            mockWebhooks[0].id

                        );

                    }

                );

                test(

                    "normalizeEvents() returns an array",

                    () => {

                        const normalized =
                            webhooks.normalizeEvents(

                                mockWebhooks

                            );

                        expect(

                            Array.isArray(

                                normalized

                            )

                        ).toBe(

                            true

                        );

                        expect(

                            normalized.length

                        ).toBe(

                            mockWebhooks.length

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Response Helpers",

            () => {

                test(

                    "buildResponse() creates a standardized response",

                    () => {

                        const response =
                            webhooks.buildResponse(

                                "event",

                                mockWebhooks[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "event"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockWebhooks[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                webhooks.handleStripeError(

                                    new StripeAPIError(

                                        "Stripe Failure"

                                    )

                                )

                        ).toThrow(

                            StripeAPIError

                        );

                    }

                );

                test(

                    "handleStripeError() wraps unexpected errors",

                    () => {

                        expect(

                            () =>

                                webhooks.handleStripeError(

                                    new Error(

                                        "Unexpected"

                                    )

                                )

                        ).toThrow(

                            StripeAPIError

                        );

                    }

                );

            }

        );

    }

);
