/**
 * -----------------------------------------------------------------------------
 * GÖ.AI - Duffel Provider Adapter
 * File: config.js
 * -----------------------------------------------------------------------------
 * Purpose:
 * Centralized configuration for the Duffel Provider Adapter.
 *
 * Responsibilities:
 * - Load environment variables
 * - Validate required configuration
 * - Export immutable configuration
 * - Support Sandbox and Production environments
 *
 * Architecture:
 * SENTINEL™
 *      │
 *      ▼
 * ETAS™
 *      │
 *      ▼
 * providers/duffel/config.js
 *      │
 *      ▼
 * Duffel API
 *
 * @author GÖ.AI
 * @version 1.0.0
 */

"use strict";

/**
 * Environment
 */
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Determines whether the adapter should use the
 * Duffel Sandbox environment.
 */
const IS_SANDBOX =
  process.env.DUFFEL_SANDBOX !== "false";

/**
 * API Credentials
 */
const DUFFEL_API_TOKEN =
  process.env.DUFFEL_API_TOKEN;

/**
 * Duffel API Version
 *
 * Update this value only after validating compatibility.
 */
const DUFFEL_API_VERSION =
  process.env.DUFFEL_API_VERSION || "v2";

/**
 * Base URLs
 */
const BASE_URLS = {
  sandbox: "https://api.duffel.com",
  production: "https://api.duffel.com",
};

/**
 * Active Base URL
 */
const BASE_URL = IS_SANDBOX
  ? BASE_URLS.sandbox
  : BASE_URLS.production;

/**
 * Retry Configuration
 */
const RETRY = {
  attempts: Number(
    process.env.DUFFEL_RETRY_ATTEMPTS || 3
  ),

  delay: Number(
    process.env.DUFFEL_RETRY_DELAY || 1000
  ),

  backoffMultiplier: Number(
    process.env.DUFFEL_RETRY_MULTIPLIER || 2
  ),
};

/**
 * Request Timeout (milliseconds)
 */
const TIMEOUT = Number(
  process.env.DUFFEL_TIMEOUT || 15000
);

/**
 * Logging
 */
const LOGGING = {
  enabled:
    process.env.DUFFEL_LOGGING !== "false",

  level:
    process.env.DUFFEL_LOG_LEVEL || "info",
};

/**
 * Validate Required Environment Variables
 */
function validateConfig() {
  const missing = [];

  if (!DUFFEL_API_TOKEN) {
    missing.push("DUFFEL_API_TOKEN");
  }

  if (missing.length > 0) {
    throw new Error(
      `Duffel configuration error.\nMissing environment variables:\n${missing.join(
        "\n"
      )}`
    );
  }
}

/**
 * Validate configuration during startup.
 */
validateConfig();

/**
 * Immutable configuration object.
 */
module.exports = Object.freeze({
  NODE_ENV,

  IS_SANDBOX,

  DUFFEL_API_TOKEN,

  DUFFEL_API_VERSION,

  BASE_URL,

  RETRY,

  TIMEOUT,

  LOGGING,
});
