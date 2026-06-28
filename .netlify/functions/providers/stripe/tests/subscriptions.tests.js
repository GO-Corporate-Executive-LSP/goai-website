/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/subscriptions.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Subscription Provider.
 *
 * Coverage:
 * - Subscriptions
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

const subscriptions =
    require("../subscriptions");

const mockSubscriptions =
    require("../__mocks__/subscriptions.json");

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

    "Stripe Subscriptions Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Subscription Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createSubscription()",

            () => {

                test(

                    "creates a subscription successfully",

                    async () => {

                        client.subscriptions.create.mockResolvedValue(

                            mockSubscriptions[0]

                        );

                        const result =
                            await subscriptions.createSubscription({

                                customer:

                                    mockSubscriptions[0].customer,

                                items:

                                    mockSubscriptions[0].items,

                                metadata:

                                    mockSubscriptions[0].metadata

                            });

                        expect(

                            client.subscriptions.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.subscription.id

                        ).toBe(

                            mockSubscriptions[0].id

                        );

                    }

                );

                test(

                    "throws validation error when customer is missing",

                    async () => {

                        await expect(

                            subscriptions.createSubscription({

                                items: []

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.subscriptions.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            subscriptions.createSubscription({

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
| Subscription Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getSubscription()",

            () => {

                test(

                    "retrieves an existing subscription",

                    async () => {

                        client.subscriptions.retrieve.mockResolvedValue(

                            mockSubscriptions[0]

                        );

                        const result =
                            await subscriptions.getSubscription(

                                mockSubscriptions[0].id

                            );

                        expect(

                            client.subscriptions.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.subscription.id

                        ).toBe(

                            mockSubscriptions[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.subscriptions.retrieve.mockRejectedValue(

                            new Error(

                                "Subscription Not Found"

                            )

                        );

                        await expect(

                            subscriptions.getSubscription(

                                "sub_invalid"

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
| Subscription Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listSubscriptions()",

            () => {

                test(

                    "lists all subscriptions",

                    async () => {

                        client.subscriptions.list.mockResolvedValue({

                            data:

                                mockSubscriptions

                        });

                        const result =
                            await subscriptions.listSubscriptions();

                        expect(

                            client.subscriptions.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.subscriptions.length

                        ).toBe(

                            mockSubscriptions.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.subscriptions.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await subscriptions.listSubscriptions();

                        expect(

                            result.subscriptions

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.subscriptions.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            subscriptions.listSubscriptions()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Subscription Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updateSubscription()",

            () => {

                test(

                    "updates an existing subscription",

                    async () => {

                        client.subscriptions.update.mockResolvedValue(

                            mockSubscriptions[0]

                        );

                        const result =
                            await subscriptions.updateSubscription(

                                mockSubscriptions[0].id,

                                {

                                    metadata: {

                                        updated: true

                                    }

                                }

                            );

                        expect(

                            client.subscriptions.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.subscription.id

                        ).toBe(

                            mockSubscriptions[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.subscriptions.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            subscriptions.updateSubscription(

                                mockSubscriptions[0].id,

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
| Subscription Cancellation
|--------------------------------------------------------------------------
*/

        describe(

            "cancelSubscription()",

            () => {

                test(

                    "cancels an existing subscription",

                    async () => {

                        client.subscriptions.cancel.mockResolvedValue({

                            ...mockSubscriptions[4],

                            status: "canceled"

                        });

                        const result =
                            await subscriptions.cancelSubscription(

                                mockSubscriptions[4].id

                            );

                        expect(

                            client.subscriptions.cancel

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.subscription.status

                        ).toBe(

                            "canceled"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when cancellation fails",

                    async () => {

                        client.subscriptions.cancel.mockRejectedValue(

                            new Error(

                                "Cancellation Failed"

                            )

                        );

                        await expect(

                            subscriptions.cancelSubscription(

                                mockSubscriptions[0].id

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
| Subscription Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "subscriptionExists()",

            () => {

                test(

                    "returns true when subscription exists",

                    async () => {

                        client.subscriptions.retrieve.mockResolvedValue(

                            mockSubscriptions[0]

                        );

                        const exists =
                            await subscriptions.subscriptionExists(

                                mockSubscriptions[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when subscription does not exist",

                    async () => {

                        client.subscriptions.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await subscriptions.subscriptionExists(

                                "sub_invalid"

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
| Subscription Lookup Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Subscription Lookup Helpers",

            () => {

                test(

                    "retrieves subscriptions for a customer",

                    async () => {

                        client.subscriptions.list.mockResolvedValue({

                            data:

                                mockSubscriptions

                        });

                        const result =
                            await subscriptions.getCustomerSubscriptions(

                                mockSubscriptions[0].customer

                            );

                        expect(

                            client.subscriptions.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.subscriptions.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "retrieves active subscriptions",

                    async () => {

                        client.subscriptions.list.mockResolvedValue({

                            data:

                                mockSubscriptions

                        });

                        const result =
                            await subscriptions.getActiveSubscriptions();

                        expect(

                            Array.isArray(

                                result.subscriptions

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves cancelled subscriptions",

                    async () => {

                        client.subscriptions.list.mockResolvedValue({

                            data:

                                mockSubscriptions

                        });

                        const result =
                            await subscriptions.getCancelledSubscriptions();

                        expect(

                            Array.isArray(

                                result.subscriptions

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

                    "creates a Founding 100 subscription",

                    async () => {

                        client.subscriptions.create.mockResolvedValue(

                            mockSubscriptions[0]

                        );

                        const result =
                            await subscriptions.createFounding100Subscription({

                                customer:

                                    mockSubscriptions[0].customer,

                                items:

                                    mockSubscriptions[0].items

                            });

                        expect(

                            result.subscription.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist subscription",

                    async () => {

                        client.subscriptions.create.mockResolvedValue(

                            mockSubscriptions[1]

                        );

                        const result =
                            await subscriptions.createWaitlistSubscription({

                                customer:

                                    mockSubscriptions[1].customer,

                                items:

                                    mockSubscriptions[1].items

                            });

                        expect(

                            result.subscription.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive subscription",

                    async () => {

                        client.subscriptions.create.mockResolvedValue(

                            mockSubscriptions[2]

                        );

                        const result =
                            await subscriptions.createExecutiveSubscription({

                                customer:

                                    mockSubscriptions[2].customer,

                                items:

                                    mockSubscriptions[2].items

                            });

                        expect(

                            result.subscription.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise subscription",

                    async () => {

                        client.subscriptions.create.mockResolvedValue(

                            mockSubscriptions[3]

                        );

                        const result =
                            await subscriptions.createEnterpriseSubscription({

                                customer:

                                    mockSubscriptions[3].customer,

                                items:

                                    mockSubscriptions[3].items

                            });

                        expect(

                            result.subscription.metadata.membership

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

                    "buildSubscriptionPayload() returns a valid payload",

                    () => {

                        const payload =
                            subscriptions.buildSubscriptionPayload({

                                customer:

                                    "cus_000001",

                                items: [

                                    {

                                        price:

                                            "price_000001"

                                    }

                                ]

                            });

                        expect(

                            payload.customer

                        ).toBe(

                            "cus_000001"

                        );

                    }

                );

                test(

                    "normalizeSubscriptions() returns an array",

                    () => {

                        const normalized =
                            subscriptions.normalizeSubscriptions(

                                mockSubscriptions

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

                            mockSubscriptions.length

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
                            subscriptions.buildResponse(

                                "subscription",

                                mockSubscriptions[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "subscription"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockSubscriptions[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                subscriptions.handleStripeError(

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

                                subscriptions.handleStripeError(

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
