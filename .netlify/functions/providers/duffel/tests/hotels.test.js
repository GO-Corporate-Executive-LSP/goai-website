/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/hotels.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for hotels.js.
 *
 * Responsibilities:
 * - Verify hotel retrieval
 * - Verify hotel search
 * - Verify hotel rates
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

const hotels = require("../hotels");

const client = require("../client");

const mockHotels =
    require("../__mocks__/hotels.json");

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

describe("Duffel Hotels Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Hotel Operations
    --------------------------------------------------------------------------
    */

    test(
        "searchHotels() returns a collection of hotels",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockHotels

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                });

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

            expect(Array.isArray(result.hotels))
                .toBe(true);

            expect(result.hotels.length)
                .toBe(mockHotels.length);

        }
    );

    test(
        "getHotel() retrieves an existing hotel",
        async () => {

            client.get.mockResolvedValue({

                data: mockHotels[0]

            });

            const result =
                await hotels.getHotel(

                    mockHotels[0].id

                );

            expect(client.get)
                .toHaveBeenCalled();

            expect(result.hotel)
                .toBeDefined();

            expect(result.hotel.id)
                .toBe(mockHotels[0].id);

        }
    );

    test(
        "getHotelRates() retrieves available hotel rates",
        async () => {

            client.get.mockResolvedValue({

                data: mockHotels

            });

            const result =
                await hotels.getHotelRates(

                    mockHotels[0].id

                );

            expect(client.get)
                .toHaveBeenCalled();

            expect(Array.isArray(result.rates))
                .toBe(true);

            expect(result.rates.length)
                .toBe(mockHotels.length);

        }
    );

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "searchHotels() throws when location is missing",
        async () => {

            await expect(

                hotels.searchHotels({

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchHotels() throws when check-in date is missing",
        async () => {

            await expect(

                hotels.searchHotels({

                    location: "Charlotte",

                    checkOut: "2026-09-18",

                    guests: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getHotel() throws when hotel ID is missing",
        async () => {

            await expect(

                hotels.getHotel()

            ).rejects.toThrow();

        }
    );

    test(
        "getHotelRates() throws when hotel ID is missing",
        async () => {

            await expect(

                hotels.getHotelRates()

            ).rejects.toThrow();

        }
    );

    test(
        "searchHotels() rejects invalid guest counts",
        async () => {

            await expect(

                hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 0

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchHotels() rejects invalid room counts",
        async () => {

            await expect(

                hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 2,

                    rooms: 0

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
        "getHotel() returns a normalized hotel",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockHotels[0]

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await hotels.getHotel(

                    mockHotels[0].id

                );

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.hotel)
                .toHaveProperty("id");

            expect(result.hotel)
                .toHaveProperty("name");

            expect(result.hotel)
                .toHaveProperty("city");

            expect(result.hotel)
                .toHaveProperty("country");

            expect(result.hotel)
                .toHaveProperty("metadata");

        }
    );

    test(
        "every hotel contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockHotels

            });

            const result =
                await hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                });

            result.hotels.forEach((hotel) => {

                expect(hotel.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized hotels preserve lodging information",
        async () => {

            client.get.mockResolvedValue({

                data: mockHotels

            });

            const result =
                await hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                });

            result.hotels.forEach((hotel) => {

                expect(hotel.name)
                    .toBeDefined();

                expect(hotel.city)
                    .toBeDefined();

                expect(hotel.country)
                    .toBeDefined();

                expect(hotel.starRating)
                    .toBeDefined();

                expect(hotel.coordinates)
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
        "getHotel() propagates provider errors",
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

                hotels.getHotel(

                    mockHotels[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchHotels() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "getHotel() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                hotels.getHotel(

                    mockHotels[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "getHotelRates() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                hotels.getHotelRates(

                    mockHotels[0].id

                )

            ).rejects.toThrow();

        }
    );

    test(
        "searchHotels() retries transient provider failures",
        async () => {

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockHotels

                });

            const result =
                await hotels.searchHotels({

                    location: "Charlotte",

                    checkIn: "2026-09-15",

                    checkOut: "2026-09-18",

                    guests: 1

                });

            expect(result.hotels.length)
                .toBe(mockHotels.length);

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
        "supports hotel booking"
    );

    test.todo(
        "supports hotel cancellation"
    );

    test.todo(
        "supports hotel stay extensions"
    );

    test.todo(
        "supports early check-in requests"
    );

    test.todo(
        "supports late check-out requests"
    );

    test.todo(
        "supports airport hotel recommendations"
    );

    test.todo(
        "supports hotel continuity during disruptions"
    );

    test.todo(
        "supports ETAS™ lodging coordination"
    );

    test.todo(
        "supports SENTINEL™ lodging intelligence"
    );

    test.todo(
        "supports SENTRY™ lodging risk scoring"
    );

});
