/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/seats.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for seats.js.
 *
 * Responsibilities:
 * - Verify seat retrieval
 * - Verify seat selection
 * - Verify seat validation
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

const seats = require("../seats");

const client = require("../client");

const mockSeats =
    require("../__mocks__/seats.json");

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

describe("Duffel Seats Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Seat Operations
    --------------------------------------------------------------------------
    */

    test(
        "getSeat() retrieves an existing seat",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockSeats[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await seats.getSeat(

                    mockSeats[0].id

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

            expect(result.seat)
                .toBeDefined();

            expect(result.seat.id)
                .toBe(mockSeats[0].id);

        }
    );

    test(
        "listSeats() returns a collection of seats",
        async () => {

            client.get.mockResolvedValue({

                data: mockSeats

            });

            const result =
                await seats.listSeats();

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.seats))
                .toBe(true);

            expect(result.seats.length)
                .toBe(mockSeats.length);

        }
    );

    test(
        "listSeats() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await seats.listSeats();

            expect(result.seats)
                .toEqual([]);

            expect(result.seats.length)
                .toBe(0);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getSeat() throws when seat ID is missing",
        async () => {

            await expect(

                seats.getSeat()

            ).rejects.toThrow();

        }
    );

    test(
        "getSeat() throws when seat ID is empty",
        async () => {

            await expect(

                seats.getSeat("")

            ).rejects.toThrow();

        }
    );

    test(
        "getSeat() throws when seat ID is invalid",
        async () => {

            await expect(

                seats.getSeat(

                    "invalid_seat"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listSeats() rejects invalid passenger IDs",
        async () => {

            await expect(

                seats.listSeats({

                    passengerId: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listSeats() rejects invalid order IDs",
        async () => {

            await expect(

                seats.listSeats({

                    orderId: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listSeats() rejects invalid query parameters",
        async () => {

            await expect(

                seats.listSeats({

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
        "getSeat() returns a normalized seat",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockSeats[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await seats.getSeat(

                    mockSeats[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.seat)
                .toHaveProperty("id");

            expect(result.seat)
                .toHaveProperty("passengerId");

            expect(result.seat)
                .toHaveProperty("number");

            expect(result.seat)
                .toHaveProperty("cabinClass");

            expect(result.seat)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every seat contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockSeats

            });

            const result =
                await seats.listSeats();

            result.seats.forEach((seat) => {

                expect(seat.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized seats preserve seating information",
        async () => {

            client.get.mockResolvedValue({

                data: mockSeats

            });

            const result =
                await seats.listSeats();

            result.seats.forEach((seat) => {

                expect(seat.number)
                    .toBeDefined();

                expect(seat.cabinClass)
                    .toBeDefined();

                expect(seat.characteristics)
                    .toBeDefined();

                expect(seat.price)
                    .toBeDefined();

                expect(seat.price.amount)
                    .toBeDefined();

                expect(seat.price.currency)
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
        "getSeat() propagates provider errors",
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

                seats.getSeat(

                    mockSeats[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listSeats() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                seats.listSeats()

            ).rejects.toThrow();

        }
    );

    test(
        "getSeat() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                seats.getSeat(

                    mockSeats[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getSeat() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                seats.getSeat(

                    mockSeats[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listSeats() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockSeats

                });

            const result =
                await seats.listSeats();

            expect(result.seats.length)
                .toBe(mockSeats.length);

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
        "supports seat selection"
    );

    test.todo(
        "supports seat changes"
    );

    test.todo(
        "supports seat upgrades"
    );

    test.todo(
        "supports preferred seat selection"
    );

    test.todo(
        "supports exit row eligibility"
    );

    test.todo(
        "supports automatic seat reassignment"
    );

    test.todo(
        "supports seat continuity during rebooking"
    );

    test.todo(
        "supports ETAS™ seating coordination"
    );

    test.todo(
        "supports SENTINEL™ seating intelligence"
    );

    test.todo(
        "supports SENTRY™ seating optimization"
    );

});
