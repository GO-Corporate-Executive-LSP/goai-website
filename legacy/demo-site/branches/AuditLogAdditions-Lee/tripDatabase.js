/**
 * tripDatabase.js 
 * 
 * Purpose: Trip data persistence and admin queue management
 * Aligned with DAY_9_ADMIN_SURFACES.md, DAY_10_TESTING_ARTIFACTS.md, DAY_11_OWNERSHIP_GOVERNANCE.md
 * 
 * Policy: 
 * - Admin-relevant states are tracked and prioritized
 * - Queue operations follow ADMIN_QUEUE_CONFIG ordering and grouping
 * - All admin actions are audited
 */

import wixData from 'wix-data';

let options = {
  consistentRead: true,
};

// Import admin surface constants (from adminSurfaces.js)
import { ADMIN_RELEVANT_STATES, ADMIN_PRIORITY, QUEUE_SECTIONS, STATE_PRIORITY_MAPPING, sortTripsForQueue } from 'backend/etas/adminSurfaces.js';
import { getPriorityForState } from 'backend/etas/adminSurfaces.js';

/**
 * Save or update a trip
 * Includes admin context fields from DAY_9_ADMIN_SURFACES.md
 */
export async function saveTrip(trip) {
  try {
    // Convert trip object to Wix data format
    const tripData = {
      tripId: trip.trip_id,
      userId: trip.user_id,
      userEmail: trip.user_email,

      state: trip.state || {},
      pickup: trip.pickup || {},
      dropoff: trip.dropoff || {},
      returnTrip: trip.return || {},
      
      passengers: trip.passengers || 1,
      luggage: trip.luggage || 0,
      
      tier: trip.tier || {},
      sentinelSnapshot: trip.sentinel_snapshot || {},
      adminContext: trip.admin_context || {},

      userNotes: trip.user_notes || null,

      _id: "not in wix collection",

    };
    
    const loaded_trip = (await loadTrip(trip.trip_id));
    const eventData = {
      tripId: trip.trip_id,
      event: {
        event_type: 'trip_created',
        event_category: 'SYSTEM_ACTION',
        outcome: 'SUCCESS',
      },
      actor: {
        actor_id: 'SYSTEM',
        actor_role: 'SYSTEM',
        actor_email: null,
        ipAddress: null,
      }
    };

    if (loaded_trip != null) {
      // Update existing
      tripData._id = loaded_trip._id;
      const result = await wixData.update("Trips", tripData);

      //log audit event for trip update
      eventData.event.event_type = 'trip_updated';
      eventData.fromState = trip.state.previous_state;
      eventData.toState = trip.state.current_state;
      logAuditEvent(eventData);
      return wixFormatToTrip(result);
    } else {
      // Insert new
      const result = await wixData.insert("Trips", tripData);

      //log audit event for trip creation
      eventData.fromState = "NONE";
      eventData.toState = "DRAFT_TRIP_CREATED";
      logAuditEvent(eventData); 

      return wixFormatToTrip(result);
    }
  } catch (error) {
    console.error("[DB] Failed to save trip:", error);
    logAuditError(trip.trip_id, error, { });
    throw error;
  }
}

/**
 * Load trip by tripId
 */
export async function loadTrip(tripId) {
  try {
    const results = await wixData.query("Trips")
      .eq("tripId", tripId)
      .find();
    
    if (results.items.length === 0) {
      return null;
    }
    
    return wixFormatToTrip(results.items[0]);
  } catch (error) {
    console.error("[DB] Failed to load trip:", error);
    throw error;
  }
}

/**
 * Load trips by userId
 */
export async function loadUserTrips(userId, limit = 50) {
  try {
    const results = await wixData.query("Trips")
      .eq("userId", userId)
      .descending("_createdDate")
      .limit(limit)
      .find();
    
    return results.items.map(wixFormatToTrip);
  } catch (error) {
    console.error("[DB] Failed to load user trips:", error);
    throw error;
  }
}

/**
 * Load trips by state
 */
export async function loadTripsByState(state, limit = 50) {
  try {
    const results = await wixData.query("Trips")
      .eq("state", state)
      .descending("_createdDate")
      .limit(limit)
      .find();
    
    return results.items.map(wixFormatToTrip);
  } catch (error) {
    console.error("[DB] Failed to load trips by state:", error);
    throw error;
  }
}

/**
 * Convert Wix data format to trip object
 * Includes all admin context fields from DAY_9_ADMIN_SURFACES.md
 */
function wixFormatToTrip(wixData) {
  return {
    trip_id: wixData.tripId,
    user_id: wixData.userId,
    user_email: wixData.userEmail || null,
    
    state: wixData.state || {},
    pickup: wixData.pickup || {},
    dropoff: wixData.dropoff || {},
    return: wixData.returnTrip || {},
    
    passengers: wixData.passengers || 1,
    luggage: wixData.luggage || 0,
    
    tier: wixData.tier || {},
    sentinel_snapshot: wixData.sentinelSnapshot || {},
    admin_context: wixData.adminContext || {},

    user_notes: wixData.userNotes || null,
    
    // the wix collection _id 
    _id: wixData._id || "not in wix collection", 
  };
}

/**
 * Generate unique trip ID
 */
export function generateTripId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `trip_${timestamp}_${random}`;
}

/**
 * Add trip to admin queue
 */
export async function addToAdminQueue(trip) {
  try {
    const priority = getPriorityForState(trip.state.current_state);
    const queueSection = getQueueSectionForState(trip.state.current_state);
    
    const queueEntry = {
      tripId: trip.trip_id,
      priority: priority,
      queueSection: queueSection,
      state: trip.state,
      addedAt: new Date().toISOString(),
      status: "ACTIVE",
      adminContext: trip.admin_context || {},
      
    };
    
    const result = await wixData.insert("AdminQueue", queueEntry);
    console.log(`[ADMIN QUEUE] Trip ${trip.trip_id} added to ${queueSection} (priority: ${priority})`);
    
    return result;
  } catch (error) {
    console.error("[DB] Failed to add to admin queue:", error);
    logAuditError(trip.trip_id, error, { });
    throw error;
  }
}

/**
 * Get queue section for a trip state
 * Aligned with QUEUE_SECTIONS from DAY_9
 */
function getQueueSectionForState(state) {
  for (const [sectionKey, section] of Object.entries(QUEUE_SECTIONS)) {
    if (section.states.includes(state)) {
      return sectionKey;
    }
  }
  return 'ARCHIVE'; // Default to archive if not found
}

/**
 * Get admin queue with filtering and sorting
 * Aligned with ADMIN_QUEUE_CONFIG from DAY_9_ADMIN_SURFACES.md
 * 
 * @param {object} filters - Filter criteria (state, failure_type, tier, priority, etc.)
 * @param {string} section - Queue section (NEEDS_ACTION, MONITORING, ACTIVE, ARCHIVE)
 * @param {number} limit - Max items to return (default 50)
 * @returns {Promise<array>} Sorted and filtered queue entries
 */
export async function getAdminQueue(filters = {}, section = null, limit = 50) {
  try {
    let query = wixData.query("AdminQueue")
      .eq("status", "ACTIVE");
    
    // Filter by section
    if (section) {
      query = query.eq("queueSection", section);
    }
    
    // Filter by state
    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    
    // Filter by priority
    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }
    
    // Filter by retry count (greater than)
    if (filters.retry_count_gt !== undefined) {
      // Note: Wix Data doesn't support > directly, would need to filter in memory
      // For now, we'll do basic query and filter in memory
    }
    
    const results = await query
      .limit(limit * 2) // Get more to filter in memory
      .find();
    
    let items = results.items;
    
    // Apply in-memory filters (for complex queries Wix doesn't support)
    if (filters.retry_count_gt !== undefined) {
      items = items.filter(item => (item.context?.retry_count || 0) > filters.retry_count_gt);
    }
    
    if (filters.time_in_state_gt) {
      const threshold = Date.now() - filters.time_in_state_gt;
      items = items.filter(item => {
        const stateTime = new Date(item.context?.state_changed_at || item.addedAt).getTime();
        return stateTime < threshold;
      });
    }
    
    // Sort according to ADMIN_QUEUE_CONFIG ordering strategy
    items = sortTripsForQueue(items);
    
    // Limit after sorting
    return items.slice(0, limit);
  } catch (error) {
    console.error("[DB] Failed to get admin queue:", error);
    throw error;
  }
}



/**
 * Update admin queue entry
 * Used when admin takes action on a trip
 */
export async function updateAdminQueue(tripId, updateData) {
  try {
    // Find queue entry
    const results = await wixData.query("AdminQueue")
      .eq("tripId", tripId)
      .eq("status", "ACTIVE")
      .find();
    
    if (results.items.length === 0) {
      // Try to find by any status
      const allResults = await wixData.query("AdminQueue")
        .eq("tripId", tripId)
        .find();
      
      if (allResults.items.length === 0) {
        throw new Error(`No admin queue entry found for trip ${tripId}`);
      }
      
      // Update the found entry
      const queueEntry = allResults.items[0];
      Object.assign(queueEntry, updateData);
      await wixData.update("AdminQueue", queueEntry);
      return queueEntry;
    }
    
    const queueEntry = results.items[0];
    
    // Update with new data
    if (updateData.state) {
      queueEntry.state = updateData.state;
      queueEntry.priority = getPriorityForState(updateData.state);
      queueEntry.queueSection = getQueueSectionForState(updateData.state);
    }
    
    if (updateData.context) {
      queueEntry.context = { ...queueEntry.context, ...updateData.context };
    }
    
    if (updateData.review) {
      queueEntry.review = { ...queueEntry.review, ...updateData.review };
    }
    
    // If trip moved to archive state, mark as archived
    if (updateData.state === ADMIN_RELEVANT_STATES.COMPLETED || 
        updateData.state === ADMIN_RELEVANT_STATES.CANCELLED) {
      queueEntry.status = "ARCHIVED";
      queueEntry.archivedAt = new Date().toISOString();
    }
    
    await wixData.update("AdminQueue", queueEntry);
    
    return queueEntry;
  } catch (error) {
    console.error("[DB] Failed to update admin queue:", error);
    logAuditError(tripId, error, { });
    throw error;
  }
}

/**
 * Log audit event
 * Aligned with AUDIT_REQUIREMENTS from DAY_9_ADMIN_SURFACES.md
 * 
 * Required fields per DAY_9:
 * - admin_id, admin_email, action, trip_id, timestamp, from_state, to_state, ip_address, user_agent
 * 
 * Added fields per schema reconciliation : event, actor, retentionPolicy, complianceTags, immutable
 *  [removed admin_id & email, userAgent, & action]
 *  [moved ipAddress, notes, overrideReason, userContaction, escalationTarget, resolutionNotes, 
 *  environment, version & session_id into objects]
 */
export async function logAuditEvent(eventData) {
  try {
    const auditEntry = {
      // Required fields (from DAY_9)
      auditId: generateUUID(),
      tripId: eventData.tripId || "",
      timestamp: new Date().toISOString(),
      fromState: eventData.fromState || eventData.stateChange?.from || null,
      toState: eventData.toState || eventData.stateChange?.to || null,
      

      // Retention
      retentionPolicy: eventData.retentionPolicy || "STANDARD",   // STANDARD | EXTENDED | PERMANENT | LEGAL_HOLD
      complianceTags: eventData.complianceTags || [],
      immutable: eventData.immutable || true,

      // ============================================================================
      // EVENT OBJECT
      // event : {
      // "event_type": "string",         // Event category  
      // "event_category": "string",     // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
      // "outcome": "string",            // SUCCESS | FAILURE | PARTIAL | PENDING
      // }
      // ============================================================================
      event: eventData.event || {}, 
      
      // ============================================================================
      // ACTOR OBJECT
      // event : {
      // "actor_id": "string",           // User ID, Admin ID, or "SYSTEM"
      // "actor_role": "string",         // USER | ADMIN | SENIOR_ADMIN | SYSTEM
      // "actor_email": "string",        // Actor email (if applicable, null for SYSTEM)
      // "ipAddress": "string",          // Actor IP Address
      // }
      // ============================================================================
      actor: eventData.actor || {}, 

       // ============================================================================
      // ADMIN CONTEXT OBJECT (Optional, for admin actions only)
      // adminContext : {
      // ============================================================================
      // "notes": "text",                // Admin reasoning/notes
      // "override_reason": "text",      // Why override was necessary
      // "user_contacted": "boolean",    // Was user notified
      // "escalation_target": "string",  // Who was escalated to (if applicable)
      // "resolution_notes": "text",     // How issue was resolved
      // "session_id": "string",       // Session identifier
      // "environment": "string",      // production | staging | dev
      // "version": "string",          // System version at time of action
      // }
      // ============================================================================
      adminContext: eventData.admin_context || {}, 
      

    };
    
    await wixData.insert("AuditLog", auditEntry);
    
    console.log(`[AUDIT] ${auditEntry.action} logged for trip ${auditEntry.trip_id} by ${auditEntry.admin_email}`);
  } catch (error) {
    console.error("[DB] Failed to log audit event:", error);
    logAuditError(eventData.tripId, error, { });
    // Don't throw - audit failures shouldn't break the main flow
  }
}


/**
 * Error Audit Logging
 */
export async function logAuditError(tripId, error, context = {}) {
  try { 
    const eventData = {
      tripId: tripId || "",
      fromState: 'NONE',
      toState: 'NONE',
      event: {
        event_type: 'error_logged',
        event_category: 'SYSTEM_ACTION',
        outcome: 'FAILURE',
      },
      actor: {
        actor_id: 'SYSTEM',
        actor_role: 'SYSTEM',
        actor_email: null,
        ipAddress: null,
      },
      admin_context: {
        notes: `Error: ${error.message || error.toString()}`,
        ...context,
      }
    };
    logAuditEvent(eventData);
  } catch (err) {
    console.error("[DB] Failed to log audit error:", err);
  }
}

/**
 * Generate UUID for audit records
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}