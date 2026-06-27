/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/airports.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for airports.js.
 *
 * Responsibilities:
 * - Verify airport retrieval
 * - Verify airport search
 * - Verify airport validation
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

const airports = require("../airports");

const client = require("../client");

const mockAirports =
    require("../__mocks__/airports.json");

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

describe("Duffel Airports Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Airport Operations
    --------------------------------------------------------------------------
    */

    test(
        "getAirport() retrieves an existing airport",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockAirports[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await airports.getAirport(

                    mockAirports[0].id

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

            expect(result.airport)
                .toBeDefined();

            expect(result.airport.id)
                .toBe(mockAirports[0].id);

        }
    );

    test(
        "searchAirports() returns a collection of airports",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirports

            });

            const result =
                await airports.searchAirports({

                    query: "Charlotte"

                });

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.airports))
                .toBe(true);

            expect(result.airports.length)
                .toBe(mockAirports.length);

        }
    );

    test(
        "searchAirports() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await airports.searchAirports({

                    query: "Atlantis"

                });

            expect(result.airports)
                .toEqual([]);

            expect(result.airports.length)
                .toBe(0);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "getAirport() throws when airport ID is missing",
        async () => {

            await expect(

                airports.getAirport()

            ).rejects.toThrow();

        }
    );

    test(
        "getAirport() throws when airport ID is empty",
        async () => {

            await expect(

                airports.getAirport("")

            ).rejects.toThrow();

        }
    );

    test(
        "getAirport() throws when airport ID is invalid",
        async () => {

            await expect(

                airports.getAirport(

                    "invalid_airport"

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirports() throws when search query is missing",
        async () => {

            await expect(

                airports.searchAirports()

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirports() throws when search query is empty",
        async () => {

            await expect(

                airports.searchAirports({

                    query: ""

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirports() rejects invalid airport codes",
        async () => {

            await expect(

                airports.searchAirports({

                    query: "CHARLOTTE123"

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
        "getAirport() returns a normalized airport",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockAirports[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await airports.getAirport(

                    mockAirports[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.airport)
                .toHaveProperty("id");

            expect(result.airport)
                .toHaveProperty("iataCode");

            expect(result.airport)
                .toHaveProperty("icaoCode");

            expect(result.airport)
                .toHaveProperty("name");

            expect(result.airport)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every airport contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirports

            });

            const result =
                await airports.searchAirports({

                    query: "Airport"

                });

            result.airports.forEach((airport) => {

                expect(airport.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized airports preserve location information",
        async () => {

            client.get.mockResolvedValue({

                data: mockAirports

            });

            const result =
                await airports.searchAirports({

                    query: "Airport"

                });

            result.airports.forEach((airport) => {

                expect(airport.iataCode)
                    .toBeDefined();

                expect(airport.name)
                    .toBeDefined();

                expect(airport.city)
                    .toBeDefined();

                expect(airport.country)
                    .toBeDefined();

                expect(airport.timezone)
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
        "getAirport() propagates provider errors",
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

                airports.getAirport(

                    mockAirports[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirports() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                airports.searchAirports({

                    query: "Charlotte"

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getAirport() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                airports.getAirport(

                    mockAirports[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getAirport() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                airports.getAirport(

                    mockAirports[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchAirports() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockAirports

                });

            const result =
                await airports.searchAirports({

                    query: "Charlotte"

                });

            expect(result.airports.length)
                .toBe(mockAirports.length);

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
        "supports airport lookup by IATA code"
    );

    test.todo(
        "supports airport lookup by ICAO code"
    );

    test.todo(
        "supports nearby airport searches"
    );

    test.todo(
        "supports airport timezone calculations"
    );

    test.todo(
        "supports airport geospatial searches"
    );

    test.todo(
        "supports airport operational status"
    );

    test.todo(
        "supports airport disruption intelligence"
    );

    test.todo(
        "supports ETAS™ airport coordination"
    );

    test.todo(
        "supports SENTINEL™ airport intelligence"
    );

    test.todo(
        "supports SENTRY™ airport risk scoring"
    );

});
