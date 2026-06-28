/**
 * -----------------------------------------------------------------------------
 * GÖ.AI Backend
 * Stripe Provider Adapter
 * File: errors.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Standardized error classes for the Stripe Provider Adapter.
 *
 * Responsibilities:
 * - Normalize Stripe errors
 * - Provide consistent error handling
 * - Separate provider errors from application logic
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/*
|--------------------------------------------------------------------------
| Base Error
|--------------------------------------------------------------------------
*/

class StripeError extends Error {

    constructor(message) {

        super(message);

        this.name = "StripeError";

    }

}

/*
|--------------------------------------------------------------------------
| Authentication Error
|--------------------------------------------------------------------------
*/

class StripeAuthenticationError extends StripeError {

    constructor(message = "Stripe authentication failed.") {

        super(message);

        this.name = "StripeAuthenticationError";

    }

}

/*
|--------------------------------------------------------------------------
| Validation Error
|--------------------------------------------------------------------------
*/

class StripeValidationError extends StripeError {

    constructor(message = "Stripe validation failed.") {

        super(message);

        this.name = "StripeValidationError";

    }

}

/*
|--------------------------------------------------------------------------
| Rate Limit Error
|--------------------------------------------------------------------------
*/

class StripeRateLimitError extends StripeError {

    constructor(message = "Stripe rate limit exceeded.") {

        super(message);

        this.name = "StripeRateLimitError";

    }

}

/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

class StripeAPIError extends StripeError {

    constructor(message = "Stripe API request failed.") {

        super(message);

        this.name = "StripeAPIError";

    }

}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    StripeError,

    StripeAuthenticationError,

    StripeValidationError,

    StripeRateLimitError,

    StripeAPIError

};
