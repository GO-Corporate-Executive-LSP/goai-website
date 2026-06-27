/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/airlines.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for airlines.js.
 *
 * Responsibilities:
 * - Verify airline retrieval
 * - Verify airline search
 * - Verify airline validation
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

const airlines = require("../airlines");

const client = require("../client");

const mockAirlines =
    require("../__mocks__/airlines.json");

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

describe("Duffel Airlines Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Airline Operations
    --------------------------------------------------------------------------
    */

      test(
        "getAirline() retrieves an existing airline",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockAirlines[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await airlines.getAirline(

                    mockAirlines[0].id

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

            expect(result.airline)
                .toBeDefined();

            expect(result.airline.id)
                .toBe(mockAirlines[0].id);

        }
    );

    test(
        "searchAirlines() returns a collection of airlines",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirlines

            });

            const result =
                await airlines.searchAirlines({

                    query: "Delta"

                });

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.airlines))
                .toBe(true);

            expect(result.airlines.length)
                .toBe(mockAirlines.length);

        }
    );

    test(
        "searchAirlines() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await airlines.searchAirlines({

                    query: "Unknown Airline"

                });

            expect(result.airlines)
                .toEqual([]);

            expect(result.airlines.length)
                .toBe(0);

        }
    );

      test(
        "getAirline() retrieves an existing airline",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockAirlines[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await airlines.getAirline(

                    mockAirlines[0].id

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

            expect(result.airline)
                .toBeDefined();

            expect(result.airline.id)
                .toBe(mockAirlines[0].id);

        }
    );

    test(
        "searchAirlines() returns a collection of airlines",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirlines

            });

            const result =
                await airlines.searchAirlines({

                    query: "Delta"

                });

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.airlines))
                .toBe(true);

            expect(result.airlines.length)
                .toBe(mockAirlines.length);

        }
    );

    test(
        "searchAirlines() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await airlines.searchAirlines({

                    query: "Unknown Airline"

                });

            expect(result.airlines)
                .toEqual([]);

            expect(result.airlines.length)
                .toBe(0);

        }
    );

      /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getAirline() throws when airline ID is missing",
        async () => {

            await expect(

                airlines.getAirline()

            ).rejects.toThrow();

        }
    );

    test(
        "getAirline() throws when airline ID is empty",
        async () => {

            await expect(

                airlines.getAirline("")

            ).rejects.toThrow();

        }
    );

    test(
        "getAirline() throws when airline ID is invalid",
        async () => {

            await expect(

                airlines.getAirline(

                    "invalid_airline"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirlines() throws when search query is missing",
        async () => {

            await expect(

                airlines.searchAirlines()

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirlines() throws when search query is empty",
        async () => {

            await expect(

                airlines.searchAirlines({

                    query: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirlines() rejects invalid airline codes",
        async () => {

            await expect(

                airlines.searchAirlines({

                    query: "DELTA123"

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
        "getAirline() returns a normalized airline",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockAirlines[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await airlines.getAirline(

                    mockAirlines[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.airline)
                .toHaveProperty("id");

            expect(result.airline)
                .toHaveProperty("iataCode");

            expect(result.airline)
                .toHaveProperty("icaoCode");

            expect(result.airline)
                .toHaveProperty("name");

            expect(result.airline)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every airline contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirlines

            });

            const result =
                await airlines.searchAirlines({

                    query: "Air"

                });

            result.airlines.forEach((airline) => {

                expect(airline.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized airlines preserve airline information",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirlines

            });

            const result =
                await airlines.searchAirlines({

                    query: "Air"

                });

            result.airlines.forEach((airline) => {

                expect(airline.iataCode)
                    .toBeDefined();

                expect(airline.name)
                    .toBeDefined();

                expect(airline.country)
                    .toBeDefined();

                expect(airline.callsign)
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
        "getAirline() propagates provider errors",
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

                airlines.getAirline(

                    mockAirlines[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirlines() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                airlines.searchAirlines({

                    query: "Delta"

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getAirline() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                airlines.getAirline(

                    mockAirlines[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getAirline() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                airlines.getAirline(

                    mockAirlines[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirlines() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockAirlines

                });

            const result =
                await airlines.searchAirlines({

                    query: "Delta"

                });

            expect(result.airlines.length)
                .toBe(mockAirlines.length);

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
        "supports airline lookup by IATA code"
    );

    test.todo(
        "supports airline lookup by ICAO code"
    );

    test.todo(
        "supports airline alliance retrieval"
    );

    test.todo(
        "supports airline fleet information"
    );

    test.todo(
        "supports airline route network"
    );

    test.todo(
        "supports airline operational status"
    );

    test.todo(
        "supports airline disruption intelligence"
    );

    test.todo(
        "supports ETAS™ airline coordination"
    );

    test.todo(
        "supports SENTINEL™ airline intelligence"
    );

    test.todo(
        "supports SENTRY™ airline risk scoring"
    );

});
