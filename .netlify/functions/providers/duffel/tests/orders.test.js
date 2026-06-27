/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/orders.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for orders.js.
 *
 * Responsibilities:
 * - Verify order creation
 * - Verify order retrieval
 * - Verify order cancellation
 * - Verify validation
 * - Verify provider failures
 *
 * IMPORTANT:
 * These tests never communicate with the live Duffel API.
 * All requests are served by mocked responses.
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

const orders = require("../orders");

const client = require("../client");

const mockOrders =
    require("../__mocks__/orders.json");

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

describe("Duffel Orders Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Create Order
    --------------------------------------------------------------------------
    */

    test(
        "createOrder() creates a new order",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.post.mockResolvedValue({

                data: mockOrders[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await orders.createOrder({

                    offerId: "off_000001",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                });

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(client.post)
                .toHaveBeenCalled();

            expect(result)
                .toBeDefined();

            expect(result.provider)
                .toBe("Duffel");

            expect(result.order)
                .toBeDefined();

            expect(result.order.id)
                .toBe(mockOrders[0].id);

        }
    );

    test(
        "getOrder() retrieves an existing order",
        async () => {

            client.get.mockResolvedValue({

                data: mockOrders[0]

            });

            const result =
                await orders.getOrder(

                    mockOrders[0].id

                );

            expect(client.get)
                .toHaveBeenCalled();

            expect(result.order.id)
                .toBe(mockOrders[0].id);

            expect(result.order.status)
                .toBeDefined();

        }
    );

    test(
        "cancelOrder() cancels an existing order",
        async () => {

            client.post.mockResolvedValue({

                data: {

                    ...mockOrders[3]

                }

            });

            const result =
                await orders.cancelOrder(

                    mockOrders[3].id

                );

            expect(client.post)
                .toHaveBeenCalled();

            expect(result.order)
                .toBeDefined();

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "createOrder() throws when offer ID is missing",
        async () => {

            await expect(

                orders.createOrder({

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                })

            ).rejects.toThrow();

        }
    );

    test(
        "createOrder() throws when passengers are missing",
        async () => {

            await expect(

                orders.createOrder({

                    offerId: "off_000001"

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getOrder() throws when order ID is missing",
        async () => {

            await expect(

                orders.getOrder()

            ).rejects.toThrow();

        }
    );

    test(
        "cancelOrder() throws when order ID is missing",
        async () => {

            await expect(

                orders.cancelOrder()

            ).rejects.toThrow();

        }
    );

    test(
        "createOrder() throws when passenger list is empty",
        async () => {

            await expect(

                orders.createOrder({

                    offerId: "off_000001",

                    passengers: []

                })

            ).rejects.toThrow();

        }
    );

    test(
        "createOrder() throws when offer ID is invalid",
        async () => {

            await expect(

                orders.createOrder({

                    offerId: "",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

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
        "createOrder() returns a normalized order",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.post.mockResolvedValue({

                data: mockOrders[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await orders.createOrder({

                    offerId: "off_000001",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                });

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.order)
                .toHaveProperty("id");

            expect(result.order)
                .toHaveProperty("provider");

            expect(result.order)
                .toHaveProperty("status");

            expect(result.order)
                .toHaveProperty("metadata");

        }
    );

    test(
        "getOrder() returns provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockOrders[0]

            });

            const result =
                await orders.getOrder(

                    mockOrders[0].id

                );

            expect(result.provider)
                .toBe("Duffel");

            expect(result.order.provider)
                .toBe("Duffel");

        }
    );

    test(
        "createOrder() preserves booking information",
        async () => {

            client.post.mockResolvedValue({

                data: mockOrders[0]

            });

            const result =
                await orders.createOrder({

                    offerId: "off_000001",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                });

            expect(result.order.bookingReference)
                .toBeDefined();

            expect(result.order.status)
                .toBeDefined();

        }
    );

    /*
    --------------------------------------------------------------------------
    Error Handling & Edge Cases
    --------------------------------------------------------------------------
    */

    test(
        "createOrder() propagates provider errors",
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

                orders.createOrder({

                    offerId: "off_000001",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getOrder() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                orders.getOrder(

                    mockOrders[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "cancelOrder() handles malformed provider responses",
        async () => {

            client.post.mockResolvedValue({});

            await expect(

                orders.cancelOrder(

                    mockOrders[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getOrder() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                orders.getOrder(

                    mockOrders[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "createOrder() retries transient provider failures",
        async () => {

            client.post

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockOrders[0]

                });

            const result =
                await orders.createOrder({

                    offerId: "off_000001",

                    passengers: [

                        {

                            id: "pas_000001"

                        }

                    ]

                });

            expect(result.order.id)
                .toBe(mockOrders[0].id);

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
        "supports order modifications"
    );

    test.todo(
        "supports order refunds"
    );

    test.todo(
        "supports partial cancellations"
    );

    test.todo(
        "supports multi-city bookings"
    );

    test.todo(
        "supports multi-passenger bookings"
    );

    test.todo(
        "supports ancillary services"
    );

    test.todo(
        "supports automatic rebooking"
    );

    test.todo(
        "supports ETAS™ booking orchestration"
    );

    test.todo(
        "supports SENTINEL™ disruption recovery"
    );

    test.todo(
        "supports SENTRY™ continuity scoring"
    );

});
