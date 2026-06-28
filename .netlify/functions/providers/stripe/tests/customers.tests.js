/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/customers.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Customer Provider.
 *
 * Coverage:
 * - Customers
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

const customers =
    require("../customers");

const mockCustomers =
    require("../__mocks__/customers.json");

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

    "Stripe Customers Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Customer Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createCustomer()",

            () => {

                test(

                    "creates a customer successfully",

                    async () => {

                        client.customers.create.mockResolvedValue(

                            mockCustomers[0]

                        );

                        const result =
                            await customers.createCustomer({

                                email:

                                    mockCustomers[0].email,

                                name:

                                    mockCustomers[0].name,

                                metadata:

                                    mockCustomers[0].metadata

                            });

                        expect(

                            client.customers.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.customer.id

                        ).toBe(

                            mockCustomers[0].id

                        );

                    }

                );

                test(

                    "throws validation error when email is missing",

                    async () => {

                        await expect(

                            customers.createCustomer({

                                name:

                                    "Test User"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.customers.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            customers.createCustomer({

                                email:

                                    "test@goaihq.com"

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
| Customer Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getCustomer()",

            () => {

                test(

                    "retrieves an existing customer",

                    async () => {

                        client.customers.retrieve.mockResolvedValue(

                            mockCustomers[0]

                        );

                        const result =
                            await customers.getCustomer(

                                mockCustomers[0].id

                            );

                        expect(

                            client.customers.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.customer.id

                        ).toBe(

                            mockCustomers[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.customers.retrieve.mockRejectedValue(

                            new Error(

                                "Customer Not Found"

                            )

                        );

                        await expect(

                            customers.getCustomer(

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
| Customer Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listCustomers()",

            () => {

                test(

                    "lists all customers",

                    async () => {

                        client.customers.list.mockResolvedValue({

                            data:

                                mockCustomers

                        });

                        const result =
                            await customers.listCustomers();

                        expect(

                            client.customers.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.customers.length

                        ).toBe(

                            mockCustomers.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.customers.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await customers.listCustomers();

                        expect(

                            result.customers

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.customers.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            customers.listCustomers()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Customer Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updateCustomer()",

            () => {

                test(

                    "updates an existing customer",

                    async () => {

                        client.customers.update.mockResolvedValue(

                            mockCustomers[0]

                        );

                        const result =
                            await customers.updateCustomer(

                                mockCustomers[0].id,

                                {

                                    name:

                                        "Updated Customer"

                                }

                            );

                        expect(

                            client.customers.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.customer.id

                        ).toBe(

                            mockCustomers[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.customers.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            customers.updateCustomer(

                                mockCustomers[0].id,

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
| Customer Deletion
|--------------------------------------------------------------------------
*/

        describe(

            "deleteCustomer()",

            () => {

                test(

                    "deletes an existing customer",

                    async () => {

                        client.customers.del.mockResolvedValue({

                            id:

                                mockCustomers[0].id,

                            deleted: true

                        });

                        const result =
                            await customers.deleteCustomer(

                                mockCustomers[0].id

                            );

                        expect(

                            client.customers.del

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.deleted

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "throws StripeAPIError when deletion fails",

                    async () => {

                        client.customers.del.mockRejectedValue(

                            new Error(

                                "Delete Failed"

                            )

                        );

                        await expect(

                            customers.deleteCustomer(

                                mockCustomers[0].id

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
| Customer Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "customerExists()",

            () => {

                test(

                    "returns true when customer exists",

                    async () => {

                        client.customers.retrieve.mockResolvedValue(

                            mockCustomers[0]

                        );

                        const exists =
                            await customers.customerExists(

                                mockCustomers[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when customer does not exist",

                    async () => {

                        client.customers.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await customers.customerExists(

                                "cus_invalid"

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
| Customer Search
|--------------------------------------------------------------------------
*/

        describe(

            "searchCustomers()",

            () => {

                test(

                    "searches customers successfully",

                    async () => {

                        client.customers.search.mockResolvedValue({

                            data:

                                mockCustomers

                        });

                        const result =
                            await customers.searchCustomers(

                                "founding"

                            );

                        expect(

                            client.customers.search

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.customers.length

                        ).toBe(

                            mockCustomers.length

                        );

                    }

                );

                test(

                    "throws StripeAPIError when search fails",

                    async () => {

                        client.customers.search.mockRejectedValue(

                            new Error(

                                "Search Failed"

                            )

                        );

                        await expect(

                            customers.searchCustomers(

                                "invalid"

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
| GÖ.AI Membership Utilities
|--------------------------------------------------------------------------
*/

        describe(

            "GÖ.AI Membership Utilities",

            () => {

                test(

                    "creates a Founding 100 customer",

                    async () => {

                        client.customers.create.mockResolvedValue(

                            mockCustomers[0]

                        );

                        const result =
                            await customers.createFounding100Customer({

                                email:

                                    mockCustomers[0].email,

                                name:

                                    mockCustomers[0].name

                            });

                        expect(

                            result.customer.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist customer",

                    async () => {

                        client.customers.create.mockResolvedValue(

                            mockCustomers[1]

                        );

                        const result =
                            await customers.createWaitlistCustomer({

                                email:

                                    mockCustomers[1].email,

                                name:

                                    mockCustomers[1].name

                            });

                        expect(

                            result.customer.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive customer",

                    async () => {

                        client.customers.create.mockResolvedValue(

                            mockCustomers[2]

                        );

                        const result =
                            await customers.createExecutiveCustomer({

                                email:

                                    mockCustomers[2].email,

                                name:

                                    mockCustomers[2].name

                            });

                        expect(

                            result.customer.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise customer",

                    async () => {

                        client.customers.create.mockResolvedValue(

                            mockCustomers[3]

                        );

                        const result =
                            await customers.createEnterpriseCustomer({

                                email:

                                    mockCustomers[3].email,

                                name:

                                    mockCustomers[3].name

                            });

                        expect(

                            result.customer.metadata.membership

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

                    "buildCustomerPayload() returns a valid payload",

                    () => {

                        const payload =
                            customers.buildCustomerPayload({

                                email:

                                    "test@goaihq.com",

                                name:

                                    "Test Customer"

                            });

                        expect(

                            payload.email

                        ).toBe(

                            "test@goaihq.com"

                        );

                    }

                );

                test(

                    "normalizeCustomers() returns an array",

                    () => {

                        const normalized =
                            customers.normalizeCustomers(

                                mockCustomers

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

                            mockCustomers.length

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
                            customers.buildResponse(

                                "customer",

                                mockCustomers[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "customer"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockCustomers[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                customers.handleStripeError(

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

                                customers.handleStripeError(

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
