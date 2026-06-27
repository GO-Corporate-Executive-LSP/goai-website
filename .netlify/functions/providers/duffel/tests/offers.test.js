/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Duffel Provider Adapter
 * File: __tests__/offers.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for offers.js.
 *
 * Responsibilities:
 * - Verify offer searches
 * - Verify validation
 * - Verify normalization
 * - Verify provider failures
 * - Verify retry behavior
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

const offers = require("../offers");

const client = require("../client");

const mockOffers =
    require("../__mocks__/offers.json");

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

describe("Duffel Offers Adapter", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    /*
    --------------------------------------------------------------------------
    Search Offers
    --------------------------------------------------------------------------
    */

             test(
        "searchOffers() returns normalized offers",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockOffers

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

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

            expect(result.offers)
                .toBeDefined();

            expect(Array.isArray(result.offers))
                .toBe(true);

            expect(result.offers.length)
                .toBe(mockOffers.length);

        }
    );

    test(
        "searchOffers() returns an empty collection",
        async () => {

            client.get.mockResolvedValue({

                data: []

            });

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                });

            expect(result.offers)
                .toEqual([]);

            expect(result.offers.length)
                .toBe(0);

        }
    );

```

    /*
    --------------------------------------------------------------------------
    Validation Tests
    --------------------------------------------------------------------------
    */

    test(
        "searchOffers() throws when origin airport is missing",
        async () => {

            await expect(

                offers.searchOffers({

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() throws when destination airport is missing",
        async () => {

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() throws when departure date is missing",
        async () => {

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() throws for invalid origin airport code",
        async () => {

            await expect(

                offers.searchOffers({

                    origin: "CHARLOTTE",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() throws for invalid destination airport code",
        async () => {

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LONDON",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() throws when passenger count is zero",
        async () => {

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 0

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
        "searchOffers() returns normalized offer objects",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get.mockResolvedValue({

                data: mockOffers

            });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                });

            const offer =
                result.offers[0];

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(offer).toHaveProperty("id");

            expect(offer).toHaveProperty("provider");

            expect(offer).toHaveProperty("owner");

            expect(offer).toHaveProperty("totalAmount");

            expect(offer).toHaveProperty("totalCurrency");

            expect(offer).toHaveProperty("expiresAt");

            expect(offer).toHaveProperty("metadata");

        }
    );

    test(
        "every normalized offer contains provider metadata",
        async () => {

            client.get.mockResolvedValue({

                data: mockOffers

            });

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                });

            result.offers.forEach((offer) => {

                expect(offer.provider)
                    .toBe("Duffel");

            });

        }
    );

    test(
        "normalized offers preserve pricing information",
        async () => {

            client.get.mockResolvedValue({

                data: mockOffers

            });

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                });

            result.offers.forEach((offer) => {

                expect(offer.totalAmount)
                    .toBeDefined();

                expect(offer.totalCurrency)
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
        "searchOffers() propagates provider errors",
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

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() retries transient provider failures",
        async () => {

            /*
            --------------------------------------------------------------
            Arrange
            --------------------------------------------------------------
            */

            client.get

                .mockRejectedValueOnce(

                    new Error("Temporary network failure")

                )

                .mockResolvedValue({

                    data: mockOffers

                });

            /*
            --------------------------------------------------------------
            Act
            --------------------------------------------------------------
            */

            const result =
                await offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                });

            /*
            --------------------------------------------------------------
            Assert
            --------------------------------------------------------------
            */

            expect(result.offers.length)
                .toBe(mockOffers.length);

            expect(client.get)
                .toHaveBeenCalled();

        }
    );

    test(
        "searchOffers() handles malformed provider responses",
        async () => {

            client.get.mockResolvedValue({});

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() handles null provider responses",
        async () => {

            client.get.mockResolvedValue(null);

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-15",

                    passengers: 1

                })

            ).rejects.toThrow();

        }
    );

    test(
        "searchOffers() handles undefined provider responses",
        async () => {

            client.get.mockResolvedValue(undefined);

            await expect(

                offers.searchOffers({

                    origin: "CLT",

                    destination: "LHR",

                    departureDate: "2026-09-

                        /*
    --------------------------------------------------------------------------
    Future Test Placeholders
    --------------------------------------------------------------------------
    */

    test.todo(
        "supports multi-city itineraries"
    );

    test.todo(
        "supports multiple passengers"
    );

    test.todo(
        "supports mixed passenger types"
    );

    test.todo(
        "supports branded fares"
    );

    test.todo(
        "supports corporate travel policies"
    );

    test.todo(
        "supports executive travel tiers"
    );

    test.todo(
        "supports disruption-aware offer ranking"
    );

    test.todo(
        "supports SENTINEL™ continuity scoring"
    );

    test.todo(
        "supports SENTRY™ Score generation"
    );

});
