/**
 * logger.js
 * 
 * Deterministic, structured logging for auditability and debugging.
 */

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }

  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function normalizeEvent(event) {
  const base = {
    timestamp: new Date().toISOString(),
    ...event
  };

  return sortKeysDeep(base);
}

export function logEvent(event = {}) {
  const payload = normalizeEvent({
    level: "INFO",
    ...event
  });

  console.log(JSON.stringify(payload));
  return payload;
}

export function logError(event = {}, error = null) {
  const errorDetails = error
    ? {
        errorMessage: error.message || String(error),
        errorStack: error.stack || null
      }
    : {};

  const payload = normalizeEvent({
    level: "ERROR",
    ...event,
    ...errorDetails
  });

  console.error(JSON.stringify(payload));
  return payload;
}

export default {
  logEvent,
  logError
};
