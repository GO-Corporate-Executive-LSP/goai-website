/**
 * idempotency.js
 * 
 * Simple in-memory idempotency protection for backend actions.
 * NOTE: In-memory store resets on deploy or cold start.
 */

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const processedRequests = new Map();

function prune(now = Date.now()) {
  for (const [key, entry] of processedRequests.entries()) {
    if (now - entry.createdAt > DEFAULT_TTL_MS) {
      processedRequests.delete(key);
    }
  }
}

export function getIdempotencyResult(requestId) {
  if (!requestId) {
    return null;
  }

  prune();
  const entry = processedRequests.get(requestId);
  return entry ? entry.response : null;
}

export function recordIdempotencyResult(requestId, response) {
  if (!requestId) {
    return;
  }

  prune();
  processedRequests.set(requestId, {
    response,
    createdAt: Date.now()
  });
}

export default {
  getIdempotencyResult,
  recordIdempotencyResult
};
