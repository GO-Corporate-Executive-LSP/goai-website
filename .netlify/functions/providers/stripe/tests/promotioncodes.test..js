/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/promotioncodes.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Promotion Code Provider.
 *
 * Coverage:
 * - Promotion Codes
 * - Validation
 * - Error Handling
 * - Search Helpers
 * - Campaign Utilities
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

jest.mock("../client");

const client =
    require("../client");

const promotionCodes =
    require("../promotioncodes");

const mockPromotionCodes =
    require("../__mocks__/promotioncodes.json");

const {

    StripeAPIError,

    StripeValidationError

} = require("../errors");

/*
|--------------------------------------------------------------------------
| Test Suite
|--------------------------------------------------------------------------
*/

describe(

    "Stripe Promotion Codes Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Promotion Code Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createPromotionCode()",

            () => {

                test(

                    "creates a promotion code successfully",

                    async () => {

                        client.promotionCodes.create.mockResolvedValue(

                            mockPromotionCodes[0]

                        );

                        const result =
                            await promotionCodes.createPromotionCode({

                                coupon:

                                    mockPromotionCodes[0].coupon,

                                code:

                                    mockPromotionCodes[0].code,

                                metadata:

                                    mockPromotionCodes[0].metadata

                            });

                        expect(

                            client.promotionCodes.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.promotionCode.id

                        ).toBe(

                            mockPromotionCodes[0].id

                        );

                    }

                );

                test(

                    "throws validation error when coupon is missing",

                    async () => {

                        await expect(

                            promotionCodes.createPromotionCode({

                                code:

                                    "FOUNDING100"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.promotionCodes.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            promotionCodes.createPromotionCode({

                                coupon:

                                    "coupon_001"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Promotion Code Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getPromotionCode()",

            () => {

                test(

                    "retrieves an existing promotion code",

                    async () => {

                        client.promotionCodes.retrieve.mockResolvedValue(

                            mockPromotionCodes[0]

                        );

                        const result =
                            await promotionCodes.getPromotionCode(

                                mockPromotionCodes[0].id

                            );

                        expect(

                            client.promotionCodes.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.promotionCode.id

                        ).toBe(

                            mockPromotionCodes[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.promotionCodes.retrieve.mockRejectedValue(

                            new Error(

                                "Promotion Code Not Found"

                            )

                        );

                        await expect(

                            promotionCodes.getPromotionCode(

                                "promo_invalid"

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Promotion Code Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listPromotionCodes()",

            () => {

                test(

                    "lists all promotion codes",

                    async () => {

                        client.promotionCodes.list.mockResolvedValue({

                            data:

                                mockPromotionCodes

                        });

                        const result =
                            await promotionCodes.listPromotionCodes();

                        expect(

                            client.promotionCodes.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.promotionCodes.length

                        ).toBe(

                            mockPromotionCodes.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.promotionCodes.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await promotionCodes.listPromotionCodes();

                        expect(

                            result.promotionCodes

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.promotionCodes.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            promotionCodes.listPromotionCodes()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Promotion Code Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updatePromotionCode()",

            () => {

                test(

                    "updates a promotion code",

                    async () => {

                        client.promotionCodes.update.mockResolvedValue(

                            mockPromotionCodes[0]

                        );

                        const result =
                            await promotionCodes.updatePromotionCode(

                                mockPromotionCodes[0].id,

                                {

                                    metadata: {

                                        updated: true

                                    }

                                }

                            );

                        expect(

                            client.promotionCodes.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.promotionCode.id

                        ).toBe(

                            mockPromotionCodes[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.promotionCodes.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            promotionCodes.updatePromotionCode(

                                mockPromotionCodes[0].id,

                                {}

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Promotion Code Deactivation
|--------------------------------------------------------------------------
*/

        describe(

            "deactivatePromotionCode()",

            () => {

                test(

                    "deactivates a promotion code",

                    async () => {

                        client.promotionCodes.update.mockResolvedValue({

                            ...mockPromotionCodes[0],

                            active: false

                        });

                        const result =
                            await promotionCodes.deactivatePromotionCode(

                                mockPromotionCodes[0].id

                            );

                        expect(

                            client.promotionCodes.update

                        ).toHaveBeenCalledWith(

                            mockPromotionCodes[0].id,

                            {

                                active: false

                            }

                        );

                        expect(

                            result.promotionCode.active

                        ).toBe(

                            false

                        );

                    }

                );

                test(

                    "throws StripeAPIError when deactivation fails",

                    async () => {

                        client.promotionCodes.update.mockRejectedValue(

                            new Error(

                                "Deactivate Failed"

                            )

                        );

                        await expect(

                            promotionCodes.deactivatePromotionCode(

                                mockPromotionCodes[0].id

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Promotion Code Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "promotionCodeExists()",

            () => {

                test(

                    "returns true when promotion code exists",

                    async () => {

                        client.promotionCodes.retrieve.mockResolvedValue(

                            mockPromotionCodes[0]

                        );

                        const exists =
                            await promotionCodes.promotionCodeExists(

                                mockPromotionCodes[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when promotion code does not exist",

                    async () => {

                        client.promotionCodes.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await promotionCodes.promotionCodeExists(

                                "promo_invalid"

                            );

                        expect(

                            exists

                        ).toBe(

                            false

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Coupon Lookup
|--------------------------------------------------------------------------
*/

        describe(

            "getCouponPromotionCodes()",

            () => {

                test(

                    "retrieves promotion codes by coupon",

                    async () => {

                        client.promotionCodes.list.mockResolvedValue({

                            data:

                                mockPromotionCodes

                        });

                        const result =
                            await promotionCodes.getCouponPromotionCodes(

                                mockPromotionCodes[0].coupon

                            );

                        expect(

                            result.promotionCodes.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "throws StripeAPIError when coupon lookup fails",

                    async () => {

                        client.promotionCodes.list.mockRejectedValue(

                            new Error(

                                "Coupon Lookup Failed"

                            )

                        );

                        await expect(

                            promotionCodes.getCouponPromotionCodes(

                                "coupon_invalid"

                            )

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| GÖ.AI Campaign Utilities
|--------------------------------------------------------------------------
*/

        describe(

            "GÖ.AI Campaign Utilities",

            () => {

                test(

                    "creates a Founding 100 promotion code",

                    async () => {

                        client.promotionCodes.create.mockResolvedValue(

                            mockPromotionCodes[0]

                        );

                        const result =
                            await promotionCodes.createFounding100PromotionCode({

                                coupon:

                                    mockPromotionCodes[0].coupon

                            });

                        expect(

                            result.promotionCode.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist promotion code",

                    async () => {

                        client.promotionCodes.create.mockResolvedValue(

                            mockPromotionCodes[1]

                        );

                        const result =
                            await promotionCodes.createWaitlistPromotionCode({

                                coupon:

                                    mockPromotionCodes[1].coupon

                            });

                        expect(

                            result.promotionCode.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates a Magic Link promotion code",

                    async () => {

                        client.promotionCodes.create.mockResolvedValue(

                            mockPromotionCodes[4]

                        );

                        const result =
                            await promotionCodes.createMagicLinkPromotionCode({

                                coupon:

                                    mockPromotionCodes[4].coupon

                            });

                        expect(

                            result.promotionCode.metadata.magic_link

                        ).toBe(

                            true

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Internal Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Internal Helpers",

            () => {

                test(

                    "buildPromotionCodePayload() returns a valid payload",

                    () => {

                        const payload =
                            promotionCodes.buildPromotionCodePayload({

                                coupon:

                                    "coupon_000001",

                                code:

                                    "FOUNDING100"

                            });

                        expect(

                            payload.coupon

                        ).toBe(

                            "coupon_000001"

                        );

                    }

                );

                test(

                    "normalizePromotionCodes() returns an array",

                    () => {

                        const normalized =
                            promotionCodes.normalizePromotionCodes(

                                mockPromotionCodes

                            );

                        expect(

                            Array.isArray(

                                normalized

                            )

                        ).toBe(

                            true

                        );

                        expect(

                            normalized.length

                        ).toBe(

                            mockPromotionCodes.length

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Response Helpers",

            () => {

                test(

                    "buildResponse() creates a standardized response",

                    () => {

                        const response =
                            promotionCodes.buildResponse(

                                "promotionCode",

                                mockPromotionCodes[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "promotionCode"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockPromotionCodes[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                promotionCodes.handleStripeError(

                                    new StripeAPIError(

                                        "Stripe Failure"

                                    )

                                )

                        ).toThrow(

                            StripeAPIError

                        );

                    }

                );

                test(

                    "handleStripeError() wraps unexpected errors",

                    () => {

                        expect(

                            () =>

                                promotionCodes.handleStripeError(

                                    new Error(

                                        "Unexpected"

                                    )

                                )

                        ).toThrow(

                            StripeAPIError

                        );

                    }

                );

            }

        );

    }

);
