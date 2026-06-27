/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/payments.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for payments.js.
 *
 * Responsibilities:
 * - Verify payment retrieval
 * - Verify payment validation
 * - Verify payment normalization
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

const payments = require("../payments");

const client = require("../client");

const mockPayments =
    require("../__mocks__/payments.json");

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

describe("Duffel Payments Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Payment Operations
    --------------------------------------------------------------------------
    */

    test(
        "getPayment() retrieves an existing payment",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockPayments[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await payments.getPayment(

                    mockPayments[0].id

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

            expect(result.payment)
                .toBeDefined();

            expect(result.payment.id)
                .toBe(mockPayments[0].id);

        }
    );

    test(
        "listPayments() returns a collection of payments",
        async () => {

            client.get.mockResolvedValue({

                data: mockPayments

            });

            const result =
                await payments.listPayments();

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.payments))
                .toBe(true);

            expect(result.payments.length)
                .toBe(mockPayments.length);

        }
    );

    test(
        "listPayments() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await payments.listPayments();

            expect(result.payments)
                .toEqual([]);

            expect(result.payments.length)
                .toBe(0);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getPayment() throws when payment ID is missing",
        async () => {

            await expect(

                payments.getPayment()

            ).rejects.toThrow();

        }
    );

    test(
        "getPayment() throws when payment ID is empty",
        async () => {

            await expect(

                payments.getPayment("")

            ).rejects.toThrow();

        }
    );

    test(
        "getPayment() throws when payment ID is invalid",
        async () => {

            await expect(

                payments.getPayment(

                    "invalid_payment"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listPayments() rejects invalid order IDs",
        async () => {

            await expect(

                payments.listPayments({

                    orderId: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listPayments() rejects invalid payment statuses",
        async () => {

            await expect(

                payments.listPayments({

                    status: "unknown"

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listPayments() rejects invalid query parameters",
        async () => {

            await expect(

                payments.listPayments({

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
        "getPayment() returns a normalized payment",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockPayments[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await payments.getPayment(

                    mockPayments[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.payment)
                .toHaveProperty("id");

            expect(result.payment)
                .toHaveProperty("provider");

            expect(result.payment)
                .toHaveProperty("status");

            expect(result.payment)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every payment contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockPayments

            });

            const result =
                await payments.listPayments();

            result.payments.forEach((payment) => {

                expect(payment.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized payments preserve payment information",
        async () => {

            client.get.mockResolvedValue({

                data: mockPayments

            });

            const result =
                await payments.listPayments();

            result.payments.forEach((payment) => {

                expect(payment.amount)
                    .toBeDefined();

                expect(payment.currency)
                    .toBeDefined();

                expect(payment.status)
                    .toBeDefined();

                expect(payment.type)
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
        "getPayment() propagates provider errors",
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

                payments.getPayment(

                    mockPayments[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listPayments() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                payments.listPayments()

            ).rejects.toThrow();

        }
    );

    test(
        "getPayment() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                payments.getPayment(

                    mockPayments[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getPayment() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                payments.getPayment(

                    mockPayments[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listPayments() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockPayments

                });

            const result =
                await payments.listPayments();

            expect(result.payments.length)
                .toBe(mockPayments.length);

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
        "supports payment authorization"
    );

    test.todo(
        "supports payment capture"
    );

    test.todo(
        "supports payment refunds"
    );

    test.todo(
        "supports partial refunds"
    );

    test.todo(
        "supports payment retries"
    );

    test.todo(
        "supports multiple payment methods"
    );

    test.todo(
        "supports payment continuity during rebooking"
    );

    test.todo(
        "supports ETAS™ payment orchestration"
    );

    test.todo(
        "supports SENTINEL™ financial continuity"
    );

    test.todo(
        "supports SENTRY™ financial risk scoring"
    );

});
