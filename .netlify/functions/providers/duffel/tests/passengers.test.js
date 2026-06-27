/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/passengers.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for passengers.js.
 *
 * Responsibilities:
 * - Verify passenger retrieval
 * - Verify passenger validation
 * - Verify passenger normalization
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

const passengers = require("../passengers");

const client = require("../client");

const mockPassengers =
    require("../__mocks__/passengers.json");

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

describe("Duffel Passengers Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Passenger Operations
    --------------------------------------------------------------------------
    */

      test(
        "getPassenger() retrieves an existing passenger",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockPassengers[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await passengers.getPassenger(

                    mockPassengers[0].id

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

            expect(result.passenger)
                .toBeDefined();

            expect(result.passenger.id)
                .toBe(mockPassengers[0].id);

        }
    );

    test(
        "listPassengers() returns a collection of passengers",
        async () => {

            client.get.mockResolvedValue({

                data: mockPassengers

            });

            const result =
                await passengers.listPassengers();

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.passengers))
                .toBe(true);

            expect(result.passengers.length)
                .toBe(mockPassengers.length);

        }
    );

    test(
        "listPassengers() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await passengers.listPassengers();

            expect(result.passengers)
                .toEqual([]);

            expect(result.passengers.length)
                .toBe(0);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getPassenger() throws when passenger ID is missing",
        async () => {

            await expect(

                passengers.getPassenger()

            ).rejects.toThrow();

        }
    );

    test(
        "getPassenger() throws when passenger ID is empty",
        async () => {

            await expect(

                passengers.getPassenger("")

            ).rejects.toThrow();

        }
    );

    test(
        "getPassenger() throws when passenger ID is invalid",
        async () => {

            await expect(

                passengers.getPassenger(

                    "invalid_passenger"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listPassengers() handles invalid query parameters",
        async () => {

            await expect(

                passengers.listPassengers({

                    limit: -1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listPassengers() rejects invalid page numbers",
        async () => {

            await expect(

                passengers.listPassengers({

                    page: 0

                })

            ).rejects.toThrow();

        }
    );

    test(
        "listPassengers() rejects unsupported filters",
        async () => {

            await expect(

                passengers.listPassengers({

                    status: "unknown"

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
        "getPassenger() returns a normalized passenger",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockPassengers[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await passengers.getPassenger(

                    mockPassengers[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.passenger)
                .toHaveProperty("id");

            expect(result.passenger)
                .toHaveProperty("type");

            expect(result.passenger)
                .toHaveProperty("givenName");

            expect(result.passenger)
                .toHaveProperty("familyName");

            expect(result.passenger)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every passenger contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockPassengers

            });

            const result =
                await passengers.listPassengers();

            result.passengers.forEach((passenger) => {

                expect(passenger.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized passengers preserve traveler information",
        async () => {

            client.get.mockResolvedValue({

                data: mockPassengers

            });

            const result =
                await passengers.listPassengers();

            result.passengers.forEach((passenger) => {

                expect(passenger.id)
                    .toBeDefined();

                expect(passenger.type)
                    .toBeDefined();

                expect(passenger.givenName)
                    .toBeDefined();

                expect(passenger.familyName)
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
        "getPassenger() propagates provider errors",
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

                passengers.getPassenger(

                    mockPassengers[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "listPassengers() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                passengers.listPassengers()

            ).rejects.toThrow();

        }
    );

    test(
        "getPassenger() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                passengers.getPassenger(

                    mockPassengers[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getPassenger() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                passengers.getPassenger(

                    mockPassengers[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getPassenger() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockPassengers[0]

                });

            const result =
                await passengers.getPassenger(

                    mockPassengers[0].id

                );

            expect(result.passenger.id)
                .toBe(mockPassengers[0].id);

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
        "supports passenger updates"
    );

    test.todo(
        "supports passenger deletion"
    );

    test.todo(
        "supports passport validation"
    );

    test.todo(
        "supports visa verification"
    );

    test.todo(
        "supports known traveler numbers"
    );

    test.todo(
        "supports loyalty program validation"
    );

    test.todo(
        "supports multi-passenger synchronization"
    );

    test.todo(
        "supports ETAS™ traveler profiles"
    );

    test.todo(
        "supports SENTINEL™ traveler continuity"
    );

    test.todo(
        "supports SENTRY™ traveler intelligence"
    );

});
