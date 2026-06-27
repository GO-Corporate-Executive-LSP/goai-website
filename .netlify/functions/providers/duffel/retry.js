/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: retry.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Provides standardized retry logic for all Duffel API requests.
 *
 * Responsibilities:
 * - Retry transient failures
 * - Apply exponential backoff
 * - Prevent unnecessary retries
 * - Support ETAS resilience
 *
 * Every provider request executed through client.js should pass through
 * this retry helper.
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

const config = require("./config");
const {
  DuffelApiError,
  DuffelTimeoutError,
  DuffelRateLimitError,
} = require("./errors");

/**
 * Sleep helper.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines whether an error should be retried.
 *
 * @param {Error} error
 * @returns {boolean}
 */
function shouldRetry(error) {
  if (
    error instanceof DuffelTimeoutError ||
    error instanceof DuffelRateLimitError
  ) {
    return true;
  }

  if (
    error instanceof DuffelApiError &&
    error.isRetryable()
  ) {
    return true;
  }

  return false;
}

/**
 * Executes an async operation with retry support.
 *
 * @template T
 * @param {Function} operation
 * @returns {Promise<T>}
 */
async function retry(operation) {
  let attempt = 0;

  while (attempt < config.RETRY.attempts) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      if (
        attempt >= config.RETRY.attempts ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      const delay =
        config.RETRY.delay *
        Math.pow(
          config.RETRY.backoffMultiplier,
          attempt - 1
        );

      if (config.LOGGING.enabled) {
        console.warn(
          `[Duffel Retry] Attempt ${attempt}/${config.RETRY.attempts} failed. Retrying in ${delay} ms.`
        );
      }

      await sleep(delay);
    }
  }
}

module.exports = retry;
