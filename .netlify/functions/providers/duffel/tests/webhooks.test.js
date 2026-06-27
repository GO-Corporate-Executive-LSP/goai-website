/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/webhooks.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for webhooks.js.
 *
 * Responsibilities:
 * - Verify webhook signature validation
 * - Verify webhook event processing
 * - Verify payload validation
 * - Verify response normalization
 * - Verify provider failures
 *
 * IMPORTANT:
 * These tests never communicate with the live Duffel API.
 * All requests are served by mocked webhook payloads.
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

const webhooks = require("../webhooks");

const client = require("../client");

const mockWebhooks =
    require("../__mocks__/webhooks.json");

/*
|--------------------------------------------------------------------------
| Mock Client
|--------------------------------------------------------------------------
*/

jest.mock("../client");

/*
|--------------------------------------------------------------------------
| Test Setup
|--------------------------------------------------------------------------
*/

describe("Duffel Webhooks Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Webhook Operations
    --------------------------------------------------------------------------
    */

    test(
        "verifyWebhook() validates a webhook signature",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            const payload =
                mockWebhooks[0];

            const signature =
                "valid_signature";

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await webhooks.verifyWebhook(

                    payload,

                    signature

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result)
                .toBeDefined();

            expect(result.valid)
                .toBe(true);

        }
    );

    test(
        "processWebhook() processes an order.created event",
        async () => {

            client.post.mockResolvedValue({

                data: mockWebhooks[0]

            });

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[0]

                );

            expect(result)
                .toBeDefined();

            expect(result.provider)
                .toBe("Duffel");

            expect(result.event.type)
                .toBe("order.created");

        }
    );

    test(
        "processWebhook() processes an order.updated event",
        async () => {

            client.post.mockResolvedValue({

                data: mockWebhooks[1]

            });

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[1]

                );

            expect(result.event.type)
                .toBe("order.updated");

            expect(result.event.data)
                .toBeDefined();

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "verifyWebhook() throws when payload is missing",
        async () => {

            await expect(

                webhooks.verifyWebhook()

            ).rejects.toThrow();

        }
    );

    test(
        "verifyWebhook() throws when signature is missing",
        async () => {

            await expect(

                webhooks.verifyWebhook(

                    mockWebhooks[0]

                )

            ).rejects.toThrow();

        }
    );

    test(
        "verifyWebhook() rejects an invalid signature",
        async () => {

            await expect(

                webhooks.verifyWebhook(

                    mockWebhooks[0],

                    "invalid_signature"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() throws when payload is missing",
        async () => {

            await expect(

                webhooks.processWebhook()

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() rejects unsupported event types",
        async () => {

            await expect(

                webhooks.processWebhook({

                    type: "unsupported.event",

                    data: {}

                })

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() rejects malformed webhook payloads",
        async () => {

            await expect(

                webhooks.processWebhook({

                    invalid: true

                })

            ).rejects.toThrow();

        }
    );

    /*
    --------------------------------------------------------------------------
    Response Normalization Tests
    --------------------------------------------------------------------------
    */

    test(
        "processWebhook() returns a normalized webhook event",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.post.mockResolvedValue({

                data: mockWebhooks[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[0]

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.event)
                .toHaveProperty("id");

            expect(result.event)
                .toHaveProperty("type");

            expect(result.event)
                .toHaveProperty("provider");

            expect(result.event)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every webhook event contains provider metadata",
        async () => {

            client.post.mockResolvedValue({

                data: mockWebhooks[1]

            });

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[1]

                );

            expect(result.provider)
                .toBe("Duffel");

            expect(result.event.provider)
                .toBe("Duffel");

        }
    );

    test(
        "normalized webhook events preserve payload information",
        async () => {

            client.post.mockResolvedValue({

                data: mockWebhooks[2]

            });

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[2]

                );

            expect(result.event.id)
                .toBeDefined();

            expect(result.event.type)
                .toBeDefined();

            expect(result.event.data)
                .toBeDefined();

            expect(result.event.createdAt)
                .toBeDefined();

        }
    );

    /*
    --------------------------------------------------------------------------
    Error Handling & Edge Cases
    --------------------------------------------------------------------------
    */

    test(
        "processWebhook() propagates provider errors",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.post.mockRejectedValue(

                new Error("Duffel API unavailable")

            );

            /*
            --------------------------------------------------------------
            Act / Assert
            --------------------------------------------------------------
            */

            await expect(

                webhooks.processWebhook(

                    mockWebhooks[0]

                )

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() handles malformed provider responses",
        async () => {

            client.post.mockResolvedValue({});

            await expect(

                webhooks.processWebhook(

                    mockWebhooks[0]

                )

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() handles null provider responses",
        async () => {

            client.post.mockResolvedValue(null);

            await expect(

                webhooks.processWebhook(

                    mockWebhooks[0]

                )

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() handles undefined provider responses",
        async () => {

            client.post.mockResolvedValue(undefined);

            await expect(

                webhooks.processWebhook(

                    mockWebhooks[0]

                )

            ).rejects.toThrow();

        }
    );

    test(
        "processWebhook() retries transient provider failures",
        async () => {

            client.post

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockWebhooks[0]

                });

            const result =
                await webhooks.processWebhook(

                    mockWebhooks[0]

                );

            expect(result.event.id)
                .toBe(mockWebhooks[0].id);

            expect(client.post)
                .toHaveBeenCalled();

        }
    );

    /*
    --------------------------------------------------------------------------
    Future Test Placeholders
    --------------------------------------------------------------------------
    */

    test.todo(
        "supports order.created webhook events"
    );

    test.todo(
        "supports order.updated webhook events"
    );

    test.todo(
        "supports order.changed webhook events"
    );

    test.todo(
        "supports order.cancelled webhook events"
    );

    test.todo(
        "supports webhook replay protection"
    );

    test.todo(
        "supports webhook idempotency"
    );

    test.todo(
        "supports ETAS™ event orchestration"
    );

    test.todo(
        "supports SENTINEL™ disruption event processing"
    );

    test.todo(
        "supports SENTRY™ event intelligence scoring"
    );

    test.todo(
        "supports multi-provider webhook routing"
    );

});
