/**
 * ETAS Lite — Trip Validation (Milestone 1)
 * Purpose: Validate completeness before execution or review
 * Policy: No silent assumptions. No auto-correction beyond safe normalization.
 */

import { z } from "zod";

const trimString = (value) => (typeof value === "string" ? value.trim() : value);

const toInteger = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return value;
    }
    const num = Number(trimmed);
    if (Number.isInteger(num)) {
      return num;
    }
  }
  return value;
};

const requiredString = z.preprocess(trimString, z.string().min(1));
const optionalString = z.preprocess(trimString, z.string()).optional();

const TierSchema = z
  .object({
    name: requiredString,
    source: optionalString.default(""),
    locked: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean()).optional(),
    vehicle_class: optionalString.default("")
  })
  .strict();

const ApprovalSchema = z
  .object({
    status: optionalString.default(""),
    decided_by: optionalString.default("human"),
    decided_at: optionalString.default(""),
    escalation_reason: optionalString.default(""),
    notes: optionalString.default("")
  })
  .strict();

const ExecutionSchema = z
  .object({
    status: optionalString.default(""),
    action: optionalString.default(""),
    executed_by: optionalString.default("human"),
    executed_at: optionalString.default(""),
    result: optionalString.default(""),
    notes: optionalString.default("")
  })
  .strict();

const AutomationSchema = z
  .object({
    eligible: z
      .preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean())
      .optional()
      .default(false),
    evaluated_at: optionalString.default(""),
    evaluated_by: optionalString.default("system"),
    reason: optionalString.default(""),
    explanation: optionalString.default("")
  })
  .strict();

const FailureSchema = z
  .object({
    failure_type: optionalString.default(""),
    failure_reason: optionalString.default("")
  })
  .strict();

const RetriesSchema = z
  .object({
    retry_count: optionalString.default(""),
    last_retry_at: optionalString.default("")
  })
  .strict();

const AdminContextSchema = z
  .object({
    approval: ApprovalSchema.optional(),
    execution: ExecutionSchema.optional(),
    automation: AutomationSchema.optional(),
    failure: FailureSchema.optional(),
    retries: RetriesSchema.optional(),
    admin_notes: optionalString.default(""),
    last_admin_action: optionalString.default(""),
    last_admin_user: optionalString.default(""),
    created_at: optionalString.default(""),
    updated_at: optionalString.default("")
  })
  .strict();

const SentinelSchema = z
  .object({
    riskScore: optionalString.default(""),
    flags: z.array(requiredString).optional().default([]),
    guidance: z.array(requiredString).optional().default([]),
    evaluatedAt: optionalString.default(""),
    tierContext: z
      .object({
        tier: optionalString.default(""),
        requestedDepth: optionalString.default("")
      })
      .strict()
      .optional()
  })
  .strict();

const SentinelSnapshotSchema = z
  .object({
    risk_level: requiredString,
    risk_score: z.preprocess(toInteger, z.number().int().min(0)).optional(),
    flag: optionalString.default(""),
    guidance: optionalString.default(""),
    evaluated_at: optionalString.default("")
  })
  .strict();

const StateSchema = z.union([
  requiredString,
  z
    .object({
      current_state: optionalString.default(""),
      previous_state: optionalString.default(""),
      time_in_state: optionalString.default(""),
      state_changed_at: optionalString.default("")
    })
    .strict()
]);

const TripSchema = z
  .object({
    trip_id: optionalString,
    user_id: optionalString,
    user_email: optionalString,
    state: StateSchema.optional(),
    pickup: z
      .object({
        address: requiredString,
        datetime: requiredString,
        timezone: requiredString
      })
      .strict(),
    dropoff: z
      .object({
        address: requiredString
      })
      .strict(),
    return: z
      .object({
        pickup_datetime: requiredString,
        estimated_home_arrival: optionalString.default("")
      })
      .strict(),
    passengers: z.preprocess(toInteger, z.number().int().min(1)),
    luggage: z.preprocess(toInteger, z.number().int().min(0)),
    tier: TierSchema,
    sentinel_snapshot: SentinelSnapshotSchema,
    admin_context: AdminContextSchema.optional(),
    user_notes: optionalString.default(""),
    _id: optionalString,
    sentinel: SentinelSchema.optional()
  })
  .strict();

export function validateTrip(trip) {
  const result = TripSchema.safeParse(trip);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      if (issue.code === "unrecognized_keys") {
        return `Unexpected field(s): ${issue.keys.join(", ")}`;
      }

      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    });

    return {
      status: "invalid",
      errors,
      payload: null
    };
  }

  return {
    status: "valid",
    errors: [],
    payload: result.data
  };
}
  
  