/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/refunds.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Refund Provider.
 *
 * Coverage:
 * - Refunds
 * - Validation
 * - Error Handling
 * - Search Helpers
 * - Membership Utilities
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

const refunds =
    require("../refunds");

const mockRefunds =
    require("../__mocks__/refunds.json");

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

    "Stripe Refunds Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Refund Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createRefund()",

            () => {

                test(

                    "creates a refund successfully",

                    async () => {

                        client.refunds.create.mockResolvedValue(

                            mockRefunds[0]

                        );

                        const result =
                            await refunds.createRefund({

                                paymentIntent:

                                    mockRefunds[0].payment_intent,

                                amount:

                                    mockRefunds[0].amount,

                                metadata:

                                    mockRefunds[0].metadata

                            });

                        expect(

                            client.refunds.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.refund.id

                        ).toBe(

                            mockRefunds[0].id

                        );

                    }

                );

                test(

                    "throws validation error when payment intent is missing",

                    async () => {

                        await expect(

                            refunds.createRefund({

                                amount: 34900

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.refunds.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            refunds.createRefund({

                                paymentIntent:

                                    "pi_000001"

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
| Refund Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getRefund()",

            () => {

                test(

                    "retrieves an existing refund",

                    async () => {

                        client.refunds.retrieve.mockResolvedValue(

                            mockRefunds[0]

                        );

                        const result =
                            await refunds.getRefund(

                                mockRefunds[0].id

                            );

                        expect(

                            client.refunds.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.refund.id

                        ).toBe(

                            mockRefunds[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.refunds.retrieve.mockRejectedValue(

                            new Error(

                                "Refund Not Found"

                            )

                        );

                        await expect(

                            refunds.getRefund(

                                "re_invalid"

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
| Refund Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listRefunds()",

            () => {

                test(

                    "lists all refunds",

                    async () => {

                        client.refunds.list.mockResolvedValue({

                            data:

                                mockRefunds

                        });

                        const result =
                            await refunds.listRefunds();

                        expect(

                            client.refunds.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.refunds.length

                        ).toBe(

                            mockRefunds.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.refunds.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await refunds.listRefunds();

                        expect(

                            result.refunds

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.refunds.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            refunds.listRefunds()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Refund Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updateRefund()",

            () => {

                test(

                    "updates refund metadata",

                    async () => {

                        client.refunds.update.mockResolvedValue(

                            mockRefunds[0]

                        );

                        const result =
                            await refunds.updateRefund(

                                mockRefunds[0].id,

                                {

                                    metadata: {

                                        reviewed: true

                                    }

                                }

                            );

                        expect(

                            client.refunds.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.refund.id

                        ).toBe(

                            mockRefunds[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.refunds.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            refunds.updateRefund(

                                mockRefunds[0].id,

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
| Refund Cancellation
|--------------------------------------------------------------------------
*/

        describe(

            "cancelRefund()",

            () => {

                test(

                    "cancels a pending refund",

                    async () => {

                        client.refunds.cancel.mockResolvedValue({

                            ...mockRefunds[4],

                            status: "canceled"

                        });

                        const result =
                            await refunds.cancelRefund(

                                mockRefunds[4].id

                            );

                        expect(

                            client.refunds.cancel

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.refund.status

                        ).toBe(

                            "canceled"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when cancellation fails",

                    async () => {

                        client.refunds.cancel.mockRejectedValue(

                            new Error(

                                "Cancellation Failed"

                            )

                        );

                        await expect(

                            refunds.cancelRefund(

                                mockRefunds[4].id

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
| Refund Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "refundExists()",

            () => {

                test(

                    "returns true when refund exists",

                    async () => {

                        client.refunds.retrieve.mockResolvedValue(

                            mockRefunds[0]

                        );

                        const exists =
                            await refunds.refundExists(

                                mockRefunds[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when refund does not exist",

                    async () => {

                        client.refunds.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await refunds.refundExists(

                                "re_invalid"

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
| Refund Lookup Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Refund Lookup Helpers",

            () => {

                test(

                    "retrieves refunds for a payment intent",

                    async () => {

                        client.refunds.list.mockResolvedValue({

                            data:

                                mockRefunds

                        });

                        const result =
                            await refunds.getPaymentIntentRefunds(

                                mockRefunds[0].payment_intent

                            );

                        expect(

                            client.refunds.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.refunds.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "retrieves successful refunds",

                    async () => {

                        client.refunds.list.mockResolvedValue({

                            data:

                                mockRefunds

                        });

                        const result =
                            await refunds.getSuccessfulRefunds();

                        expect(

                            Array.isArray(

                                result.refunds

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves pending refunds",

                    async () => {

                        client.refunds.list.mockResolvedValue({

                            data:

                                mockRefunds

                        });

                        const result =
                            await refunds.getPendingRefunds();

                        expect(

                            Array.isArray(

                                result.refunds

                            )

                        ).toBe(

                            true

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| GÖ.AI Membership Utilities
|--------------------------------------------------------------------------
*/

        describe(

            "GÖ.AI Membership Utilities",

            () => {

                test(

                    "creates a Founding 100 refund",

                    async () => {

                        client.refunds.create.mockResolvedValue(

                            mockRefunds[0]

                        );

                        const result =
                            await refunds.createFounding100Refund({

                                paymentIntent:

                                    mockRefunds[0].payment_intent,

                                amount:

                                    mockRefunds[0].amount

                            });

                        expect(

                            result.refund.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist refund",

                    async () => {

                        client.refunds.create.mockResolvedValue(

                            mockRefunds[1]

                        );

                        const result =
                            await refunds.createWaitlistRefund({

                                paymentIntent:

                                    mockRefunds[1].payment_intent,

                                amount:

                                    mockRefunds[1].amount

                            });

                        expect(

                            result.refund.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive refund",

                    async () => {

                        client.refunds.create.mockResolvedValue(

                            mockRefunds[2]

                        );

                        const result =
                            await refunds.createExecutiveRefund({

                                paymentIntent:

                                    mockRefunds[2].payment_intent,

                                amount:

                                    mockRefunds[2].amount

                            });

                        expect(

                            result.refund.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise refund",

                    async () => {

                        client.refunds.create.mockResolvedValue(

                            mockRefunds[3]

                        );

                        const result =
                            await refunds.createEnterpriseRefund({

                                paymentIntent:

                                    mockRefunds[3].payment_intent,

                                amount:

                                    mockRefunds[3].amount

                            });

                        expect(

                            result.refund.metadata.membership

                        ).toBe(

                            "Enterprise"

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

                    "buildRefundPayload() returns a valid payload",

                    () => {

                        const payload =
                            refunds.buildRefundPayload({

                                paymentIntent:

                                    "pi_000001",

                                amount:

                                    34900

                            });

                        expect(

                            payload.paymentIntent

                        ).toBe(

                            "pi_000001"

                        );

                    }

                );

                test(

                    "normalizeRefunds() returns an array",

                    () => {

                        const normalized =
                            refunds.normalizeRefunds(

                                mockRefunds

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

                            mockRefunds.length

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
                            refunds.buildResponse(

                                "refund",

                                mockRefunds[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "refund"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockRefunds[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                refunds.handleStripeError(

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

                                refunds.handleStripeError(

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
