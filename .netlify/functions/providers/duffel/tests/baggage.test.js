/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/baggage.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for baggage.js.
 *
 * Responsibilities:
 * - Verify baggage retrieval
 * - Verify baggage services
 * - Verify baggage validation
 * - Verify response normalization
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

const baggage = require("../baggage");

const client = require("../client");

const mockBaggage =
    require("../__mocks__/baggage.json");

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

describe("Duffel Baggage Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Baggage Operations
    --------------------------------------------------------------------------
    */

      test(
        "getBaggage() retrieves baggage information",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockBaggage[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await baggage.getBaggage(

                    mockBaggage[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(client.get)
                .toHaveBeenCalled();

            expect(result)
                .toBeDefined();

            expect(result.provider)
                .toBe("Duffel");

            expect(result.baggage)
                .toBeDefined();

            expect(result.baggage.id)
                .toBe(mockBaggage[0].id);

        }
    );

    test(
        "listBaggage() returns a collection of baggage services",
        async () => {

            client.get.mockResolvedValue({

                data: mockBaggage

            });

            const result =
                await baggage.listBaggage();

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.baggage))
                .toBe(true);

            expect(result.baggage.length)
                .toBe(mockBaggage.length);

        }
    );

    test(
        "listBaggage() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await baggage.listBaggage();

            expect(result.baggage)
                .toEqual([]);

            expect(result.baggage.length)
                .toBe(0);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getBaggage() throws when baggage ID is missing",
        async () => {

            await expect(

                baggage.getBaggage()

            ).rejects.toThrow();

        }
    );

    test(
        "getBaggage() throws when baggage ID is empty",
        async () => {

            await expect(

                baggage.getBaggage("")

            ).rejects.toThrow();

        }
    );

    test(
        "getBaggage() throws when baggage ID is invalid",
        async () => {

            await expect(

                baggage.getBaggage(

                    "invalid_baggage"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listBaggage() rejects invalid passenger IDs",
        async () => {

            await expect(

                baggage.listBaggage({

                    passengerId: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listBaggage() rejects invalid order IDs",
        async () => {

            await expect(

                baggage.listBaggage({

                    orderId: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listBaggage() rejects invalid query parameters",
        async () => {

            await expect(

                baggage.listBaggage({

                    limit: -1

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
        "getBaggage() returns normalized baggage",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockBaggage[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await baggage.getBaggage(

                    mockBaggage[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.baggage)
                .toHaveProperty("id");

            expect(result.baggage)
                .toHaveProperty("passengerId");

            expect(result.baggage)
                .toHaveProperty("serviceId");

            expect(result.baggage)
                .toHaveProperty("quantity");

            expect(result.baggage)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every baggage item contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockBaggage

            });

            const result =
                await baggage.listBaggage();

            result.baggage.forEach((item) => {

                expect(item.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized baggage preserves pricing information",
        async () => {

            client.get.mockResolvedValue({

                data: mockBaggage

            });

            const result =
                await baggage.listBaggage();

            result.baggage.forEach((item) => {

                expect(item.quantity)
                    .toBeDefined();

                expect(item.price)
                    .toBeDefined();

                expect(item.price.amount)
                    .toBeDefined();

                expect(item.price.currency)
                    .toBeDefined();

            });

        }
    );

    /*
    --------------------------------------------------------------------------
    Error Handling & Edge Cases
    --------------------------------------------------------------------------
    */

    test(
        "getBaggage() propagates provider errors",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockRejectedValue(

                new Error("Duffel API unavailable")

            );

            /*
            --------------------------------------------------------------
            Act / Assert
            --------------------------------------------------------------
            */

            await expect(

                baggage.getBaggage(

                    mockBaggage[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listBaggage() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                baggage.listBaggage()

            ).rejects.toThrow();

        }
    );

    test(
        "getBaggage() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                baggage.getBaggage(

                    mockBaggage[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getBaggage() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                baggage.getBaggage(

                    mockBaggage[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listBaggage() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockBaggage

                });

            const result =
                await baggage.listBaggage();

            expect(result.baggage.length)
                .toBe(mockBaggage.length);

            expect(client.get)
                .toHaveBeenCalled();

        }
    );

    /*
    --------------------------------------------------------------------------
    Future Test Placeholders
    --------------------------------------------------------------------------
    */

    test.todo(
        "supports baggage purchase"
    );

    test.todo(
        "supports baggage removal"
    );

    test.todo(
        "supports baggage quantity updates"
    );

    test.todo(
        "supports overweight baggage pricing"
    );

    test.todo(
        "supports oversized baggage validation"
    );

    test.todo(
        "supports baggage allowance calculations"
    );

    test.todo(
        "supports baggage continuity during rebooking"
    );

    test.todo(
        "supports ETAS™ baggage coordination"
    );

    test.todo(
        "supports SENTINEL™ baggage intelligence"
    );

    test.todo(
        "supports SENTRY™ baggage risk scoring"
    );

});
