/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * Jest Test Suite
 * File: tests/products.test.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Unit tests for the Stripe Product Provider.
 *
 * Coverage:
 * - Products
 * - Prices
 * - Validation
 * - Error Handling
 * - Search Helpers
 * - GÖ.AI Membership Utilities
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

const products =
    require("../products");

const mockProducts =
    require("../__mocks__/products.json");

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

    "Stripe Products Provider",

    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });

/*
|--------------------------------------------------------------------------
| Product Creation
|--------------------------------------------------------------------------
*/

        describe(

            "createProduct()",

            () => {

                test(

                    "creates a product successfully",

                    async () => {

                        client.products.create.mockResolvedValue(

                            mockProducts[0]

                        );

                        const result =
                            await products.createProduct({

                                name:

                                    mockProducts[0].name,

                                description:

                                    mockProducts[0].description,

                                metadata:

                                    mockProducts[0].metadata

                            });

                        expect(

                            client.products.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            result.product.id

                        ).toBe(

                            mockProducts[0].id

                        );

                    }

                );

                test(

                    "throws validation error when name is missing",

                    async () => {

                        await expect(

                            products.createProduct({

                                description:

                                    "Invalid"

                            })

                        ).rejects.toBeInstanceOf(

                            StripeValidationError

                        );

                    }

                );

                test(

                    "throws StripeAPIError when Stripe fails",

                    async () => {

                        client.products.create.mockRejectedValue(

                            new Error(

                                "Stripe Failure"

                            )

                        );

                        await expect(

                            products.createProduct({

                                name:

                                    "Example Product"

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
| Product Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getProduct()",

            () => {

                test(

                    "retrieves an existing product",

                    async () => {

                        client.products.retrieve.mockResolvedValue(

                            mockProducts[0]

                        );

                        const result =
                            await products.getProduct(

                                mockProducts[0].id

                            );

                        expect(

                            result.product.id

                        ).toEqual(

                            mockProducts[0].id

                        );

                    }

                );

                test(

                    "fails when Stripe returns an error",

                    async () => {

                        client.products.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        await expect(

                            products.getProduct(

                                "prod_invalid"

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
| Product Listing
|--------------------------------------------------------------------------
*/

        describe(

            "listProducts()",

            () => {

                test(

                    "lists all products",

                    async () => {

                        client.products.list.mockResolvedValue({

                            data:

                                mockProducts

                        });

                        const result =
                            await products.listProducts();

                        expect(

                            client.products.list

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.products.length

                        ).toBe(

                            mockProducts.length

                        );

                    }

                );

                test(

                    "returns an empty array when no products exist",

                    async () => {

                        client.products.list.mockResolvedValue({

                            data: []

                        });

                        const result =
                            await products.listProducts();

                        expect(

                            result.products

                        ).toEqual(

                            []

                        );

                    }

                );

                test(

                    "throws StripeAPIError when listing fails",

                    async () => {

                        client.products.list.mockRejectedValue(

                            new Error(

                                "Unable to retrieve products"

                            )

                        );

                        await expect(

                            products.listProducts()

                        ).rejects.toBeInstanceOf(

                            StripeAPIError

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Product Updates
|--------------------------------------------------------------------------
*/

        describe(

            "updateProduct()",

            () => {

                test(

                    "updates a product",

                    async () => {

                        client.products.update.mockResolvedValue(

                            mockProducts[0]

                        );

                        const result =
                            await products.updateProduct(

                                mockProducts[0].id,

                                {

                                    description:

                                        "Updated Description"

                                }

                            );

                        expect(

                            client.products.update

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.product.id

                        ).toBe(

                            mockProducts[0].id

                        );

                    }

                );

                test(

                    "throws StripeAPIError on update failure",

                    async () => {

                        client.products.update.mockRejectedValue(

                            new Error(

                                "Update Failed"

                            )

                        );

                        await expect(

                            products.updateProduct(

                                mockProducts[0].id,

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
| Product Archive
|--------------------------------------------------------------------------
*/

        describe(

            "archiveProduct()",

            () => {

                test(

                    "archives an existing product",

                    async () => {

                        client.products.update.mockResolvedValue({

                            ...mockProducts[0],

                            active: false

                        });

                        const result =
                            await products.archiveProduct(

                                mockProducts[0].id

                            );

                        expect(

                            client.products.update

                        ).toHaveBeenCalledWith(

                            mockProducts[0].id,

                            {

                                active: false

                            }

                        );

                        expect(

                            result.product.active

                        ).toBe(

                            false

                        );

                    }

                );

                test(

                    "throws StripeAPIError when archive fails",

                    async () => {

                        client.products.update.mockRejectedValue(

                            new Error(

                                "Archive Failed"

                            )

                        );

                        await expect(

                            products.archiveProduct(

                                mockProducts[0].id

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
| Product Search Helpers
|--------------------------------------------------------------------------
*/

        describe(

            "productExists()",

            () => {

                test(

                    "returns true when product exists",

                    async () => {

                        client.products.retrieve.mockResolvedValue(

                            mockProducts[0]

                        );

                        const exists =
                            await products.productExists(

                                mockProducts[0].id

                            );

                        expect(

                            exists

                        ).toBe(

                            true

                        );

                    }

                );

                test(

                    "returns false when product does not exist",

                    async () => {

                        client.products.retrieve.mockRejectedValue(

                            new Error(

                                "Not Found"

                            )

                        );

                        const exists =
                            await products.productExists(

                                "prod_invalid"

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
| Price Operations
|--------------------------------------------------------------------------
*/

        describe(

            "createPrice()",

            () => {

                test(

                    "creates a recurring price",

                    async () => {

                        const mockPrice = {

                            id: "price_000001",

                            unit_amount: 34900,

                            currency: "usd",

                            recurring: {

                                interval: "year"

                            }

                        };

                        client.prices.create.mockResolvedValue(

                            mockPrice

                        );

                        const result =
                            await products.createPrice({

                                product:

                                    mockProducts[0].id,

                                unitAmount:

                                    34900,

                                currency:

                                    "usd",

                                recurring: {

                                    interval:

                                        "year"

                                }

                            });

                        expect(

                            client.prices.create

                        ).toHaveBeenCalledTimes(

                            1

                        );

                        expect(

                            result.price.id

                        ).toBe(

                            "price_000001"

                        );

                    }

                );

                test(

                    "throws StripeAPIError when price creation fails",

                    async () => {

                        client.prices.create.mockRejectedValue(

                            new Error(

                                "Price Creation Failed"

                            )

                        );

                        await expect(

                            products.createPrice({

                                product:

                                    mockProducts[0].id,

                                unitAmount:

                                    34900,

                                currency:

                                    "usd"

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
| Price Retrieval
|--------------------------------------------------------------------------
*/

        describe(

            "getPrice()",

            () => {

                test(

                    "retrieves a price",

                    async () => {

                        const mockPrice = {

                            id: "price_000001"

                        };

                        client.prices.retrieve.mockResolvedValue(

                            mockPrice

                        );

                        const result =
                            await products.getPrice(

                                "price_000001"

                            );

                        expect(

                            result.price.id

                        ).toBe(

                            "price_000001"

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

                    "creates a Founding 100 product",

                    async () => {

                        client.products.create.mockResolvedValue(

                            mockProducts[0]

                        );

                        const result =
                            await products.createFounding100Product({

                                name:

                                    mockProducts[0].name

                            });

                        expect(

                            result.product.metadata.membership

                        ).toBe(

                            "Founding 100"

                        );

                    }

                );

                test(

                    "creates an Executive product",

                    async () => {

                        client.products.create.mockResolvedValue(

                            mockProducts[2]

                        );

                        const result =
                            await products.createExecutiveProduct({

                                name:

                                    mockProducts[2].name

                            });

                        expect(

                            result.product.metadata.membership

                        ).toBe(

                            "Executive"

                        );

                    }

                );

                test(

                    "creates an Enterprise product",

                    async () => {

                        client.products.create.mockResolvedValue(

                            mockProducts[3]

                        );

                        const result =
                            await products.createEnterpriseProduct({

                                name:

                                    mockProducts[3].name

                            });

                        expect(

                            result.product.metadata.membership

                        ).toBe(

                            "Enterprise"

                        );

                    }

                );

            }

        );

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

        describe(

            "Internal Helpers",

            () => {

                test(

                    "buildProductPayload returns a valid payload",

                    () => {

                        const payload =
                            products.buildProductPayload({

                                name:

                                    "Test Product"

                            });

                        expect(

                            payload.name

                        ).toBe(

                            "Test Product"

                        );

                    }

                );

                test(

                    "normalizeProducts returns an array",

                    () => {

                        const normalized =
                            products.normalizeProducts(

                                mockProducts

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

                            mockProducts.length

                        );

                    }

                );

            }

        );
      /*
|--------------------------------------------------------------------------
| Response Builders
|--------------------------------------------------------------------------
*/

        describe(

            "Response Helpers",

            () => {

                test(

                    "buildResponse() creates a standardized response",

                    () => {

                        const response =
                            products.buildResponse(

                                "product",

                                mockProducts[0]

                            );

                        expect(

                            response.provider

                        ).toBe(

                            "Stripe"

                        );

                        expect(

                            response.resource

                        ).toBe(

                            "product"

                        );

                    }

                );

                test(

                    "handleStripeError() rethrows StripeAPIError",

                    () => {

                        expect(

                            () =>

                                products.handleStripeError(

                                    new StripeAPIError(

                                        "Failure"

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
