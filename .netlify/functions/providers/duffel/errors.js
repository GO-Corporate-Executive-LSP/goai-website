/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: errors.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Standardized error handling for all Duffel API interactions.
 *
 * Responsibilities:
 * - Normalize Duffel API errors
 * - Create consistent ETAS-compatible error objects
 * - Support retry decisions
 * - Preserve debugging information
 *
 * Every module in the Duffel adapter throws these errors rather than
 * raw fetch() or HTTP exceptions.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/**
 * Base Duffel API Error
 */
class DuffelApiError extends Error {
  constructor(statusCode, response = {}) {
    super(response.message || "Duffel API Error");

    this.name = "DuffelApiError";
    this.statusCode = statusCode;
    this.response = response;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Determines if the request should be retried.
   */
  isRetryable() {
    return (
      this.statusCode === 408 ||
      this.statusCode === 429 ||
      this.statusCode >= 500
    );
  }

  /**
   * Converts the error into a consistent object
   * for ETAS and logging.
   */
  toJSON() {
    return {
      provider: "Duffel",
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      response: this.response,
      retryable: this.isRetryable(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Configuration Errors
 */
class DuffelConfigurationError extends Error {
  constructor(message) {
    super(message);

    this.name = "DuffelConfigurationError";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Errors
 */
class DuffelValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "DuffelValidationError";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication Errors
 */
class DuffelAuthenticationError extends DuffelApiError {
  constructor(response) {
    super(401, response);

    this.name = "DuffelAuthenticationError";
  }
}

/**
 * Rate Limit Errors
 */
class DuffelRateLimitError extends DuffelApiError {
  constructor(response) {
    super(429, response);

    this.name = "DuffelRateLimitError";
  }
}

/**
 * Timeout Errors
 */
class DuffelTimeoutError extends Error {
  constructor() {
    super("Duffel request timed out.");

    this.name = "DuffelTimeoutError";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Export standardized errors.
 */
module.exports = {
  DuffelApiError,
  DuffelAuthenticationError,
  DuffelConfigurationError,
  DuffelRateLimitError,
  DuffelTimeoutError,
  DuffelValidationError,
};
