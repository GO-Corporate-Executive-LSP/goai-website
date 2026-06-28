/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/invoices.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Invoice Provider.
 *
 * Coverage:
 * - Invoices
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

const invoices =
    require("../invoices");

const mockInvoices =
    require("../__mocks__/invoices.json");

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

    "Stripe Invoices Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Invoice Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createInvoice()",

            () => {

                test(

                    "creates an invoice successfully",

                    async () => {

                        client.invoices.create.mockResolvedValue(

                            mockInvoices[0]

                        );

                        const result =
                            await invoices.createInvoice({

                                customer:

                                    mockInvoices[0].customer,

                                metadata:

                                    mockInvoices[0].metadata

                            });

                        expect(

                            client.invoices.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.invoice.id

                        ).toBe(

                            mockInvoices[0].id

                        );

                    }

                );

                test(

                    "throws validation error when customer is missing",

                    async () => {

                        await expect(

                            invoices.createInvoice({

                                metadata: {}

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.invoices.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            invoices.createInvoice({

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
| Invoice Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getInvoice()",

            () => {

                test(

                    "retrieves an existing invoice",

                    async () => {

                        client.invoices.retrieve.mockResolvedValue(

                            mockInvoices[0]

                        );

                        const result =
                            await invoices.getInvoice(

                                mockInvoices[0].id

                            );

                        expect(

                            client.invoices.retrieve

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.invoice.id

                        ).toBe(

                            mockInvoices[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when retrieval fails",

                    async () => {

                        client.invoices.retrieve.mockRejectedValue(

                            new Error(

                                "Invoice Not Found"

                            )

                        );

                        await expect(

                            invoices.getInvoice(

                                "in_invalid"

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
| Invoice Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listInvoices()",

            () => {

                test(

                    "lists all invoices",

                    async () => {

                        client.invoices.list.mockResolvedValue({

                            data:

                                mockInvoices

                        });

                        const result =
                            await invoices.listInvoices();

                        expect(

                            client.invoices.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.invoices.length

                        ).toBe(

                            mockInvoices.length

                        );

                    }

                );

                test(

                    "returns an empty collection",

                    async () => {

                        client.invoices.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await invoices.listInvoices();

                        expect(

                            result.invoices

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.invoices.list.mockRejectedValue(

                            new Error(

                                "Listing Failed"

                            )

                        );

                        await expect(

                            invoices.listInvoices()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Invoice Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updateInvoice()",

            () => {

                test(

                    "updates an existing invoice",

                    async () => {

                        client.invoices.update.mockResolvedValue(

                            mockInvoices[0]

                        );

                        const result =
                            await invoices.updateInvoice(

                                mockInvoices[0].id,

                                {

                                    metadata: {

                                        updated: true

                                    }

                                }

                            );

                        expect(

                            client.invoices.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.invoice.id

                        ).toBe(

                            mockInvoices[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError when update fails",

                    async () => {

                        client.invoices.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            invoices.updateInvoice(

                                mockInvoices[0].id,

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
| Invoice Finalization
|--------------------------------------------------------------------------
*/

        describe(

            "finalizeInvoice()",

            () => {

                test(

                    "finalizes an existing invoice",

                    async () => {

                        client.invoices.finalizeInvoice.mockResolvedValue({

                            ...mockInvoices[0],

                            status: "paid"

                        });

                        const result =
                            await invoices.finalizeInvoice(

                                mockInvoices[0].id

                            );

                        expect(

                            client.invoices.finalizeInvoice

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.invoice.status

                        ).toBe(

                            "paid"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when finalization fails",

                    async () => {

                        client.invoices.finalizeInvoice.mockRejectedValue(

                            new Error(

                                "Finalization Failed"

                            )

                        );

                        await expect(

                            invoices.finalizeInvoice(

                                mockInvoices[0].id

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
| Invoice Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "invoiceExists()",

            () => {

                test(

                    "returns true when invoice exists",

                    async () => {

                        client.invoices.retrieve.mockResolvedValue(

                            mockInvoices[0]

                        );

                        const exists =
                            await invoices.invoiceExists(

                                mockInvoices[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when invoice does not exist",

                    async () => {

                        client.invoices.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await invoices.invoiceExists(

                                "in_invalid"

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
| Invoice Lookup Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "Invoice Lookup Helpers",

            () => {

                test(

                    "retrieves invoices for a customer",

                    async () => {

                        client.invoices.list.mockResolvedValue({

                            data:

                                mockInvoices

                        });

                        const result =
                            await invoices.getCustomerInvoices(

                                mockInvoices[0].customer

                            );

                        expect(

                            client.invoices.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.invoices.length

                        ).toBeGreaterThan(

                            0

                        );

                    }

                );

                test(

                    "retrieves paid invoices",

                    async () => {

                        client.invoices.list.mockResolvedValue({

                            data:

                                mockInvoices

                        });

                        const result =
                            await invoices.getPaidInvoices();

                        expect(

                            Array.isArray(

                                result.invoices

                            )

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "retrieves open invoices",

                    async () => {

                        client.invoices.list.mockResolvedValue({

                            data:

                                mockInvoices

                        });

                        const result =
                            await invoices.getOpenInvoices();

                        expect(

                            Array.isArray(

                                result.invoices

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

                    "creates a Founding 100 invoice",

                    async () => {

                        client.invoices.create.mockResolvedValue(

                            mockInvoices[0]

                        );

                        const result =
                            await invoices.createFounding100Invoice({

                                customer:

                                    mockInvoices[0].customer

                            });

                        expect(

                            result.invoice.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates a Beta Waitlist invoice",

                    async () => {

                        client.invoices.create.mockResolvedValue(

                            mockInvoices[1]

                        );

                        const result =
                            await invoices.createWaitlistInvoice({

                                customer:

                                    mockInvoices[1].customer

                            });

                        expect(

                            result.invoice.metadata.membership

                        ).toBe(

                            "Beta Waitlist"

                        );

                    }

                );

                test(

                    "creates an Executive invoice",

                    async () => {

                        client.invoices.create.mockResolvedValue(

                            mockInvoices[2]

                        );

                        const result =
                            await invoices.createExecutiveInvoice({

                                customer:

                                    mockInvoices[2].customer

                            });

                        expect(

                            result.invoice.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise invoice",

                    async () => {

                        client.invoices.create.mockResolvedValue(

                            mockInvoices[3]

                        );

                        const result =
                            await invoices.createEnterpriseInvoice({

                                customer:

                                    mockInvoices[3].customer

                            });

                        expect(

                            result.invoice.metadata.membership

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

                    "buildInvoicePayload() returns a valid payload",

                    () => {

                        const payload =
                            invoices.buildInvoicePayload({

                                customer:

                                    "cus_000001"

                            });

                        expect(

                            payload.customer

                        ).toBe(

                            "cus_000001"

                        );

                    }

                );

                test(

                    "normalizeInvoices() returns an array",

                    () => {

                        const normalized =
                            invoices.normalizeInvoices(

                                mockInvoices

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

                            mockInvoices.length

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
                            invoices.buildResponse(

                                "invoice",

                                mockInvoices[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "invoice"

                        );

                        expect(

                            response.data.id

                        ).toBe(

                            mockInvoices[0].id

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                invoices.handleStripeError(

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

                                invoices.handleStripeError(

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
