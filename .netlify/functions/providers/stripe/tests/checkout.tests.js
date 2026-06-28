/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/checkout.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Checkout Provider.
 *
 * Coverage:
 * - Checkout Sessions
 * - Validation
 * - Error Handling
 * - Session Helpers
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

const checkout =
    require("../checkout");

const mockCheckout =
    require("../__mocks__/checkout.json");

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

    "Stripe Checkout Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Checkout Session Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createCheckoutSession()",

            () => {

                test(

                    "creates a checkout session successfully",

                    async () => {

                        client.checkout.sessions.create.mockResolvedValue(

                            mockCheckout[0]

                        );

                        const result =
                            await checkout.createCheckoutSession({

                                customer:

                                    mockCheckout[0].customer,

                                successUrl:

                                    mockCheckout[0].success_url,

                                cancelUrl:

                                    mockCheckout[0].cancel_url,

                                metadata:

                                    mockCheckout[0].metadata

                            });

                        expect(

                            client.checkout.sessions.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.checkout.id

                        ).toBe(

                            mockCheckout[0].id

                        );

                    }

                );

                test(

                    "throws validation error when customer is missing",

                    async () => {

                        await expect(

                            checkout.createCheckoutSession({

                                successUrl:

                                    "https://goaihq.com"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.checkout.sessions.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            checkout.createCheckoutSession({

                                customer:

                                    "cus_000001"

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
| Checkout Session Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getCheckoutSession()",

            () => {

                test(

                    "retrieves an existing checkout session",

                    async () => {

                        client.checkout.sessions.retrieve.mockResolvedValue(

                            mockCheckout[0]

                        );

                        const result =
                            await checkout.getCheckoutSession(

                                mockCheckout[0].id

                            );

                        expect(

                            client.checkout.sessions.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.checkout.id

                        ).toBe(

                            mockCheckout[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.checkout.sessions.retrieve.mockRejectedValue(

                            new Error(

                                "Checkout Session Not Found"

                            )

                        );

                        await expect(

                            checkout.getCheckoutSession(

                                "cs_invalid"

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
| Checkout Session Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listCheckoutSessions()",

            () => {

                test(

                    "lists all checkout sessions",

                    async () => {

                        client.checkout.sessions.list.mockResolvedValue({

                            data:

                                mockCheckout

                        });

                        const result =
                            await checkout.listCheckoutSessions();

                        expect(

                            client.checkout.sessions.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.checkouts.length

                        ).toBe(

                            mockCheckout.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.checkout.sessions.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await checkout.listCheckoutSessions();

                        expect(

                            result.checkouts

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.checkout.sessions.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            checkout.listCheckoutSessions()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Checkout Session Expiration
|--------------------------------------------------------------------------
*/

        describe(

            "expireCheckoutSession()",

            () => {

                test(

                    "expires an existing checkout session",

                    async () => {

                        client.checkout.sessions.expire.mockResolvedValue(

                            mockCheckout[3]

                        );

                        const result =
                            await checkout.expireCheckoutSession(

                                mockCheckout[3].id

                            );

                        expect(

                            client.checkout.sessions.expire

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.checkout.status

                        ).toBe(

                            "expired"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when expiration fails",

                    async () => {

                        client.checkout.sessions.expire.mockRejectedValue(

                            new Error(

                                "Expiration Failed"

                            )

                        );

                        await expect(

                            checkout.expireCheckoutSession(

                                mockCheckout[0].id

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
| Checkout Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "checkoutSessionExists()",

            () => {

                test(

                    "returns true when checkout session exists",

                    async () => {

                        client.checkout.sessions.retrieve.mockResolvedValue(

                            mockCheckout[0]

                        );

                        const exists =
                            await checkout.checkoutSessionExists(

                                mockCheckout[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when checkout session does not exist",

                    async () => {

                        client.checkout.sessions.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await checkout.checkoutSessionExists(

                                "cs_invalid"

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
| Customer Checkout Lookup
|--------------------------------------------------------------------------
*/

        describe(

            "getCustomerCheckoutSessions()",

            () => {

                test(

                    "retrieves checkout sessions for a customer",

                    async () => {

                        client.checkout.sessions.list.mockResolvedValue({

                            data:

                                mockCheckout

                        });

                        const result =
                            await checkout.getCustomerCheckoutSessions(

                                mockCheckout[0].customer

                            );

                        expect(

                            client.checkout.sessions.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.checkouts.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "throws StripeAPIError when customer lookup fails",

                    async () => {

                        client.checkout.sessions.list.mockRejectedValue(

                            new Error(

                                "Customer Lookup Failed"

                            )

                        );

                        await expect(

                            checkout.getCustomerCheckoutSessions(

                                "cus_invalid"

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
| Checkout Status Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Checkout Status Helpers",

            () => {

                test(

                    "retrieves completed checkout sessions",

                    async () => {

                        client.checkout.sessions.list.mockResolvedValue({

                            data:

                                mockCheckout

                        });

                        const result =
                            await checkout.getCompletedCheckoutSessions();

                        expect(

                            Array.isArray(

                                result.checkouts

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves expired checkout sessions",

                    async () => {

                        client.checkout.sessions.list.mockResolvedValue({

                            data:

                                mockCheckout

                        });

                        const result =
                            await checkout.getExpiredCheckoutSessions();

                        expect(

                            Array.isArray(

                                result.checkouts

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

                    "creates a Founding 100 checkout session",

                    async () => {

                        client.checkout.sessions.create.mockResolvedValue(

                            mockCheckout[0]

                        );

                        const result =
                            await checkout.createFounding100Checkout({

                                customer:

                                    mockCheckout[0].customer

                            });

                        expect(

                            result.checkout.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist checkout session",

                    async () => {

                        client.checkout.sessions.create.mockResolvedValue(

                            mockCheckout[1]

                        );

                        const result =
                            await checkout.createWaitlistCheckout({

                                customer:

                                    mockCheckout[1].customer

                            });

                        expect(

                            result.checkout.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive checkout session",

                    async () => {

                        client.checkout.sessions.create.mockResolvedValue(

                            mockCheckout[2]

                        );

                        const result =
                            await checkout.createExecutiveCheckout({

                                customer:

                                    mockCheckout[2].customer

                            });

                        expect(

                            result.checkout.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise checkout session",

                    async () => {

                        client.checkout.sessions.create.mockResolvedValue(

                            mockCheckout[3]

                        );

                        const result =
                            await checkout.createEnterpriseCheckout({

                                customer:

                                    mockCheckout[3].customer

                            });

                        expect(

                            result.checkout.metadata.membership

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

                    "buildCheckoutPayload() returns a valid payload",

                    () => {

                        const payload =
                            checkout.buildCheckoutPayload({

                                customer:

                                    "cus_000001",

                                successUrl:

                                    "https://goaihq.com/success",

                                cancelUrl:

                                    "https://goaihq.com/cancel"

                            });

                        expect(

                            payload.customer

                        ).toBe(

                            "cus_000001"

                        );

                    }

                );

                test(

                    "normalizeCheckouts() returns an array",

                    () => {

                        const normalized =
                            checkout.normalizeCheckouts(

                                mockCheckout

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

                            mockCheckout.length

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
                            checkout.buildResponse(

                                "checkout",

                                mockCheckout[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "checkout"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockCheckout[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                checkout.handleStripeError(

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

                                checkout.handleStripeError(

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
      
