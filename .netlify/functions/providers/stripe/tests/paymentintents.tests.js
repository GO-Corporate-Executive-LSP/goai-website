/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/paymentintents.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Payment Intent Provider.
 *
 * Coverage:
 * - Payment Intents
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

const paymentIntents =
    require("../paymentintents");

const mockPaymentIntents =
    require("../__mocks__/paymentintents.json");

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

    "Stripe Payment Intents Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Payment Intent Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createPaymentIntent()",

            () => {

                test(

                    "creates a payment intent successfully",

                    async () => {

                        client.paymentIntents.create.mockResolvedValue(

                            mockPaymentIntents[0]

                        );

                        const result =
                            await paymentIntents.createPaymentIntent({

                                amount:

                                    mockPaymentIntents[0].amount,

                                currency:

                                    mockPaymentIntents[0].currency,

                                customer:

                                    mockPaymentIntents[0].customer,

                                metadata:

                                    mockPaymentIntents[0].metadata

                            });

                        expect(

                            client.paymentIntents.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.paymentIntent.id

                        ).toBe(

                            mockPaymentIntents[0].id

                        );

                    }

                );

                test(

                    "throws validation error when amount is missing",

                    async () => {

                        await expect(

                            paymentIntents.createPaymentIntent({

                                currency: "usd"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.paymentIntents.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            paymentIntents.createPaymentIntent({

                                amount: 1000,

                                currency: "usd"

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
| Payment Intent Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getPaymentIntent()",

            () => {

                test(

                    "retrieves an existing payment intent",

                    async () => {

                        client.paymentIntents.retrieve.mockResolvedValue(

                            mockPaymentIntents[0]

                        );

                        const result =
                            await paymentIntents.getPaymentIntent(

                                mockPaymentIntents[0].id

                            );

                        expect(

                            client.paymentIntents.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.paymentIntent.id

                        ).toBe(

                            mockPaymentIntents[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.paymentIntents.retrieve.mockRejectedValue(

                            new Error(

                                "Payment Intent Not Found"

                            )

                        );

                        await expect(

                            paymentIntents.getPaymentIntent(

                                "pi_invalid"

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
| Payment Intent Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listPaymentIntents()",

            () => {

                test(

                    "lists all payment intents",

                    async () => {

                        client.paymentIntents.list.mockResolvedValue({

                            data:

                                mockPaymentIntents

                        });

                        const result =
                            await paymentIntents.listPaymentIntents();

                        expect(

                            client.paymentIntents.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.paymentIntents.length

                        ).toBe(

                            mockPaymentIntents.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.paymentIntents.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await paymentIntents.listPaymentIntents();

                        expect(

                            result.paymentIntents

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.paymentIntents.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            paymentIntents.listPaymentIntents()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Payment Intent Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updatePaymentIntent()",

            () => {

                test(

                    "updates an existing payment intent",

                    async () => {

                        client.paymentIntents.update.mockResolvedValue(

                            mockPaymentIntents[0]

                        );

                        const result =
                            await paymentIntents.updatePaymentIntent(

                                mockPaymentIntents[0].id,

                                {

                                    metadata: {

                                        updated: true

                                    }

                                }

                            );

                        expect(

                            client.paymentIntents.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.paymentIntent.id

                        ).toBe(

                            mockPaymentIntents[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.paymentIntents.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            paymentIntents.updatePaymentIntent(

                                mockPaymentIntents[0].id,

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
| Payment Intent Cancellation
|--------------------------------------------------------------------------
*/

        describe(

            "cancelPaymentIntent()",

            () => {

                test(

                    "cancels an existing payment intent",

                    async () => {

                        client.paymentIntents.cancel.mockResolvedValue({

                            ...mockPaymentIntents[4],

                            status: "canceled"

                        });

                        const result =
                            await paymentIntents.cancelPaymentIntent(

                                mockPaymentIntents[4].id

                            );

                        expect(

                            client.paymentIntents.cancel

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.paymentIntent.status

                        ).toBe(

                            "canceled"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when cancellation fails",

                    async () => {

                        client.paymentIntents.cancel.mockRejectedValue(

                            new Error(

                                "Cancellation Failed"

                            )

                        );

                        await expect(

                            paymentIntents.cancelPaymentIntent(

                                mockPaymentIntents[0].id

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
| Payment Intent Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "paymentIntentExists()",

            () => {

                test(

                    "returns true when payment intent exists",

                    async () => {

                        client.paymentIntents.retrieve.mockResolvedValue(

                            mockPaymentIntents[0]

                        );

                        const exists =
                            await paymentIntents.paymentIntentExists(

                                mockPaymentIntents[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when payment intent does not exist",

                    async () => {

                        client.paymentIntents.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await paymentIntents.paymentIntentExists(

                                "pi_invalid"

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
| Payment Intent Lookup Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Payment Intent Lookup Helpers",

            () => {

                test(

                    "retrieves payment intents for a customer",

                    async () => {

                        client.paymentIntents.list.mockResolvedValue({

                            data:

                                mockPaymentIntents

                        });

                        const result =
                            await paymentIntents.getCustomerPaymentIntents(

                                mockPaymentIntents[0].customer

                            );

                        expect(

                            client.paymentIntents.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.paymentIntents.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "retrieves successful payment intents",

                    async () => {

                        client.paymentIntents.list.mockResolvedValue({

                            data:

                                mockPaymentIntents

                        });

                        const result =
                            await paymentIntents.getSuccessfulPaymentIntents();

                        expect(

                            Array.isArray(

                                result.paymentIntents

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves cancelled payment intents",

                    async () => {

                        client.paymentIntents.list.mockResolvedValue({

                            data:

                                mockPaymentIntents

                        });

                        const result =
                            await paymentIntents.getCancelledPaymentIntents();

                        expect(

                            Array.isArray(

                                result.paymentIntents

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

                    "creates a Founding 100 payment intent",

                    async () => {

                        client.paymentIntents.create.mockResolvedValue(

                            mockPaymentIntents[0]

                        );

                        const result =
                            await paymentIntents.createFounding100PaymentIntent({

                                amount:

                                    mockPaymentIntents[0].amount,

                                currency:

                                    mockPaymentIntents[0].currency

                            });

                        expect(

                            result.paymentIntent.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist payment intent",

                    async () => {

                        client.paymentIntents.create.mockResolvedValue(

                            mockPaymentIntents[1]

                        );

                        const result =
                            await paymentIntents.createWaitlistPaymentIntent({

                                amount:

                                    mockPaymentIntents[1].amount,

                                currency:

                                    mockPaymentIntents[1].currency

                            });

                        expect(

                            result.paymentIntent.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive payment intent",

                    async () => {

                        client.paymentIntents.create.mockResolvedValue(

                            mockPaymentIntents[2]

                        );

                        const result =
                            await paymentIntents.createExecutivePaymentIntent({

                                amount:

                                    mockPaymentIntents[2].amount,

                                currency:

                                    mockPaymentIntents[2].currency

                            });

                        expect(

                            result.paymentIntent.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise payment intent",

                    async () => {

                        client.paymentIntents.create.mockResolvedValue(

                            mockPaymentIntents[3]

                        );

                        const result =
                            await paymentIntents.createEnterprisePaymentIntent({

                                amount:

                                    mockPaymentIntents[3].amount,

                                currency:

                                    mockPaymentIntents[3].currency

                            });

                        expect(

                            result.paymentIntent.metadata.membership

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

                    "buildPaymentIntentPayload() returns a valid payload",

                    () => {

                        const payload =
                            paymentIntents.buildPaymentIntentPayload({

                                amount: 34900,

                                currency: "usd"

                            });

                        expect(

                            payload.amount

                        ).toBe(

                            34900

                        );

                    }

                );

                test(

                    "normalizePaymentIntents() returns an array",

                    () => {

                        const normalized =
                            paymentIntents.normalizePaymentIntents(

                                mockPaymentIntents

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

                            mockPaymentIntents.length

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
                            paymentIntents.buildResponse(

                                "paymentIntent",

                                mockPaymentIntents[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "paymentIntent"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockPaymentIntents[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                paymentIntents.handleStripeError(

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

                                paymentIntents.handleStripeError(

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
