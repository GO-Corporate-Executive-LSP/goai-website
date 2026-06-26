/** 
 * List of all Audit Log Event Types
*/



export const AUDIT_EVENT_TYPES = {


    // ============================================================================
    // USER ACTIONS (event_category: "USER_ACTION")
    // ============================================================================
    USER_REGISTERED: 'user_registered',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    TRIP_CREATED: 'trip_created',
    TRIP_SUBMITTED: 'trip_submitted',
    TRIP_EDITED: 'trip_edited',
    TRIP_CANCELLED_BY_USER: 'trip_cancelled_by_user',
    PAYMENT_METHOD_UPDATED: 'payment_method_updated',
    PROFILE_UPDATED: 'profile_updated',

    // ============================================================================
    // ADMIN ACTIONS (event_category: "ADMIN_ACTION")
    // ============================================================================
    ADMIN_LOGIN: 'admin_login',
    ADMIN_LOGOUT: 'admin_logout',
    ADMIN_APPROVED: 'admin_approved',
    ADMIN_REJECTED: 'admin_rejected',
    ADMIN_REQUESTED_CHANGES: 'admin_requested_changes',
    ADMIN_ESCALATED: 'admin_escalated',
    ADMIN_NOTE_ADDED: 'admin_note_added',
    ADMIN_OVERRIDE_APPLIED: 'admin_override_applied',
    ADMIN_USER_CONTACTED: 'admin_user_contacted',
    ADMIN_EMERGENCY_CANCEL: 'admin_emergency_cancel',
    ADMIN_RETRY_TRIGGERED: 'admin_retry_triggered',  
  
    // ============================================================================
    // SYSTEM ACTIONS (event_category: "SYSTEM_ACTION")
    // ============================================================================
    VALIDATION_PASSED: 'validation_passed',
    VALIDATION_FAILED: 'validation_failed',
    VALIDATION_BLOCKED: 'validation_blocked',
    SENTINEL_EVALUATED: 'sentinel_evaluated',
    SENTINEL_TIMEOUT: 'sentinel_timeout',
    STATE_TRANSITION: 'state_transition',
    AUTO_APPROVED: 'auto_approved',
    APPROVAL_REQUIRED: 'approval_required',
    ADMIN_QUEUE_ADDED: 'admin_queue_added',
    ADMIN_QUEUE_REMOVED: 'admin_queue_removed',
    EXECUTION_STARTED: 'execution_started',
    EXECUTION_SUCCESS: 'execution_success',
    EXECUTION_FAILED: 'execution_failed',
    EXECUTION_RETRY: 'execution_retry',
    RETRY_SCHEDULED: 'retry_scheduled',
    PAYMENT_INITIATED: 'payment_initiated',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    BOOKING_CONFIRMED: 'booking_confirmed',
    TRIP_COMPLETED: 'trip_completed',
    SENTINEL_ENRICHMENT_ADDED: 'sentinel_enrichment_added',
    AUTOMATION_EVALUATED: 'automation_evaluated',
    FALLBACK_TO_MANUAL_APPROVAL: 'fallback_to_manual_approval',
    ERROR_LOGGED: 'error_logged',
    SYSTEM_ALERT: 'system_alert'
  
  
  };