# SPRINT 1 — WIX DATABASES & PERSISTENCE LAYER

**Goal:** Establish persistent data storage using Wix Data Collections with support for complex object structures, admin queue management, and comprehensive audit logging

---

## 🎯 Overview

Sprint 1 establishes the database persistence layer for the ETAS trip management system using Wix Data Collections. The implementation provides three core collections (`Trips`, `AdminQueue`, `AuditLog`) with full CRUD operations, admin queue management for prioritized trip review, and comprehensive audit logging aligned with DAY_9_ADMIN_SURFACES requirements.

### Core Principle
> All trip data, admin context, and audit events are persisted with proper format conversion between application objects and Wix Data Collection structures.

---

## 📦 What Was Completed

### 1. Trip Database Operations (`tripDatabase.js`)

#### **Collection: `Trips`**

The `Trips` collection stores complete trip objects with support for nested object structures. Field mappings convert between application format (snake_case, nested objects) and Wix Data format (camelCase, flattened where appropriate).

**Core Functions:**

**`saveTrip(trip)`**
- Saves new trips or updates existing trips
- Automatically checks for existing trip by `tripId` to determine insert vs update
- Converts application trip object to Wix Data format
- Returns updated trip object

**`loadTrip(tripId)`**
- Retrieves trip by `tripId`
- Converts Wix Data format back to application format
- Returns `null` if trip not found

**`loadUserTrips(userId, limit)`**
- Retrieves all trips for a specific user
- Ordered by creation date (newest first)
- Default limit: 50 trips

**`loadTripsByState(state, limit)`**
- Retrieves trips filtered by state
- Useful for admin queries and state monitoring
- Default limit: 50 trips

**`generateTripId()`**
- Generates unique trip IDs: `trip_{timestamp}_{random}`
- Used when creating new trips

**Field Mappings:**

| Application Field | Wix Collection Field | Type | Description |
|------------------|---------------------|------|-------------|
| `trip_id` | `tripId` | Text | Unique trip identifier |
| `user_id` | `userId` | Text | User who created the trip |
| `user_email` | `userEmail` | Text | User email address |
| `state` | `state` | Object | State machine object with `current_state`, `previous_state`, etc. |
| `pickup` | `pickup` | Object | Pickup address, datetime, timezone |
| `dropoff` | `dropoff` | Object | Dropoff address |
| `return` | `returnTrip` | Object | Return trip details |
| `passengers` | `passengers` | Number | Number of passengers |
| `luggage` | `luggage` | Number | Number of luggage pieces |
| `tier` | `tier` | Object | Tier information (name, source, locked, vehicle_class) |
| `sentinel_snapshot` | `sentinelSnapshot` | Object | SENTINEL risk assessment data |
| `admin_context` | `adminContext` | Object | Admin-only context (approval, execution metadata) |
| `user_notes` | `userNotes` | Text | Optional user notes |

**Object Structure Examples:**

```javascript
// state (Object)
{
  current_state: "pending_approval",
  previous_state: "draft",
  time_in_state: "2 hours",
  state_changed_at: "2025-01-20T16:30:00Z"
}

// pickup (Object)
{
  address: "123 Main St, Charlotte NC",
  datetime: "2025-01-20T18:30:00",
  timezone: "America/New_York"
}

// tier (Object)
{
  name: "corporate",
  source: "user_profile",
  locked: true,
  vehicle_class: ""
}

// sentinelSnapshot (Object)
{
  risk_score: 25,
  flag: "green",
  guidance: "Low risk trip",
  evaluated_at: "2025-01-20T16:30:00Z"
}

// adminContext (Object)
{
  approval: {
    status: "APPROVED",
    decided_by: "human",
    decided_at: "2025-01-20T17:00:00Z",
    notes: ""
  },
  execution: {
    status: "PENDING",
    action: "SEND_BOOKING_REQUEST",
    executed_by: "human",
    executed_at: null,
    result: "",
    notes: ""
  }
}
```

---

### 2. Admin Queue Management (`tripDatabase.js`)

#### **Collection: `AdminQueue`**

The `AdminQueue` collection tracks trips that require admin review, organized by priority and queue sections. Integrated with `adminSurfaces.js` for priority calculation and queue section assignment.

**Core Functions:**

**`addToAdminQueue(trip)`**
- Adds trip to admin review queue
- Calculates priority based on trip state (via `getPriorityForState()`)
- Assigns queue section based on state (via `getQueueSectionForState()`)
- Sets status to `"ACTIVE"`
- Logs queue addition for monitoring

**`getAdminQueue(filters, section, limit)`**
- Retrieves admin queue entries with filtering and sorting
- Filters by: `status`, `state`, `priority`, `queueSection`
- Supports in-memory filtering for complex queries (retry_count, time_in_state)
- Applies `sortTripsForQueue()` for proper ordering per ADMIN_QUEUE_CONFIG
- Returns sorted, filtered entries (default limit: 50)

**`updateAdminQueue(tripId, updateData)`**
- Updates queue entry when admin takes action
- Updates: `state`, `priority`, `queueSection`, `context`, `review`
- Auto-archives entries when trip moves to `COMPLETED` or `CANCELLED`
- Handles entries with any status (not just ACTIVE)

**Field Structure:**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `tripId` | Text | Yes | Reference to trip in Trips collection |
| `priority` | Text | Yes | Priority level: "critical", "high", "medium", "low", "archive" |
| `queueSection` | Text | Yes | Queue section: "NEEDS_ACTION", "MONITORING", "ACTIVE", "ARCHIVE" |
| `state` | Object | Yes | Current trip state object |
| `addedAt` | Text | Yes | ISO timestamp when added to queue |
| `status` | Text | Yes | Queue entry status: "ACTIVE" or "ARCHIVED" |
| `adminContext` | Object | No | Admin context from trip (snapshot) |
| `context` | Object | No | Additional queue context (retry_count, state_changed_at, etc.) |


**Queue Section Mapping:**

Queue sections are determined by trip state (via `QUEUE_SECTIONS` in `adminSurfaces.js`):
- **NEEDS_ACTION**: States requiring immediate admin attention (e.g., `pending_approval`, `failed`)
- **MONITORING**: States being monitored but not requiring action (e.g., `execution_failed`)
- **ACTIVE**: Active trip states (e.g., `approved`, `executed`)
- **ARCHIVE**: Terminal states (e.g., `completed`, `cancelled`)

---

### 3. Audit Logging (`tripDatabase.js`)

#### **Collection: `AuditLog`**

The `AuditLog` collection provides comprehensive audit trail for all admin actions, aligned with DAY_9_ADMIN_SURFACES audit requirements.

**Core Functions:**

**`logAuditEvent(eventData)`**
- Logs audit events for admin actions
- Includes all required fields per DAY_9_ADMIN_SURFACES
- Generates unique `auditId` and `sessionId`
- Non-blocking: failures don't interrupt main flow
- Supports flexible event data structure

**Field Structure (Required Fields):**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `auditId` | Text | Yes | Unique audit record identifier (UUID) |
| `adminId` | Text | Yes | Admin who performed action |
| `adminEmail` | Text | Yes | Admin email address |
| `action` | Text | Yes | Action type (e.g., "approve_trip", "escalate_trip") |
| `tripId` | Text | Yes | Related trip identifier |
| `timestamp` | Text | Yes | ISO timestamp of action |
| `fromState` | Text | No | Previous trip state |
| `toState` | Text | No | New trip state |
| `ipAddress` | Text | Yes | IP address of admin (empty string if not available) |
| `userAgent` | Text | Yes | User agent string (empty string if not available) |

**Field Structure (Optional Fields):**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `notes` | Text | No | Optional action notes |
| `overrideReason` | Text | No | Reason for override (if applicable) |
| `userContacted` | Boolean | No | Whether user was contacted |
| `escalationTarget` | Text | No | Escalation target (if escalated) |
| `resolutionNotes` | Text | No | Resolution details |
| `sessionId` | Text | Yes | Session identifier (auto-generated) |
| `environment` | Text | Yes | Environment (production/development) |
| `version` | Text | Yes | System version (default: "1.0.0") |

**Audit Event Example:**

```javascript
{
  auditId: "a1b2c3d4-e5f6-4789-a012-345678901234",
  adminId: "admin_123",
  adminEmail: "admin@example.com",
  action: "approve_trip",
  tripId: "trip_001",
  timestamp: "2025-01-20T17:00:00Z",
  fromState: "pending_approval",
  toState: "approved",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  notes: "Approved based on low SENTINEL risk",
  sessionId: "sess_1737398400000_abc123",
  environment: "production",
  version: "1.0.0"
}
```

---

### 4. Data Format Conversion

**Application Format → Wix Format** (in `saveTrip()`)

The `saveTrip()` function converts application trip objects (snake_case field names, nested structures) to Wix Data Collection format:

```javascript
// Application format
{
  trip_id: "trip_001",
  user_id: "user_123",
  sentinel_snapshot: { risk_score: 25 },
  admin_context: { approval: { status: "APPROVED" } }
}

// Wix format (stored in collection)
{
  tripId: "trip_001",
  userId: "user_123",
  sentinelSnapshot: { risk_score: 25 },
  adminContext: { approval: { status: "APPROVED" } }
}
```

**Wix Format → Application Format** (in `wixFormatToTrip()`)

The `wixFormatToTrip()` helper function converts Wix Data format back to application format:

```javascript
// Wix format (from collection)
{
  tripId: "trip_001",
  userId: "user_123",
  sentinelSnapshot: { risk_score: 25 },
  returnTrip: { pickup_datetime: "..." }
}

// Application format (returned to application)
{
  trip_id: "trip_001",
  user_id: "user_123",
  sentinel_snapshot: { risk_score: 25 },
  return: { pickup_datetime: "..." }
}
```

---

### 5. Testing & Verification

**File:** `src/backend/etas/__tests__/testTripDatabase.js`

Comprehensive test suite covering all database operations:

#### **Test Coverage:**

1. **`testGenerateTripId()`** - Verifies trip ID generation format and uniqueness
2. **`testSaveTripNew()`** - Tests saving new trips to database
3. **`testSaveTripUpdate()`** - Tests updating existing trips
4. **`testLoadTrip()`** - Tests loading trips by tripId
5. **`testLoadUserTrips()`** - Tests loading trips filtered by userId
6. **`testLoadTripsByState()`** - Tests loading trips filtered by state
7. **`testAddToAdminQueue()`** - Tests adding trips to admin queue
8. **`testGetAdminQueue()`** - Tests retrieving and filtering admin queue
9. **`testUpdateAdminQueue()`** - Tests updating queue entries
10. **`testLogAuditEvent()`** - Tests audit event logging
11. **`testDataFormatConversion()`** - Verifies format conversion accuracy

#### **Running Tests:**

```bash
node src/backend/etas/__tests__/testTripDatabase.js
```

The test suite uses mocked `wix-data` to simulate database operations without requiring actual Wix Data Collections to get clogged with test entries.

---

## 🛡️ Key Design Principles

### 1. **Format Conversion Abstraction**
- Application code works with snake_case, nested objects
- Wix Data Collections use camelCase field names
- Conversion handled transparently in `tripDatabase.js`
- Application code never directly accesses Wix Data format

### 2. **Consistent Error Handling**
- All database operations wrapped in try-catch
- Errors logged with context: `[DB] Failed to [operation]`
- Non-critical failures (like audit logging) don't throw

### 3. **Admin Queue Integration**
- Queue operations integrated with `adminSurfaces.js`
- Priority and queue section calculated using shared constants
- Sorting follows ADMIN_QUEUE_CONFIG ordering strategy

### 4. **Audit Trail Completeness**
- All required audit fields from DAY_9_ADMIN_SURFACES implemented
- System-generated fields (auditId, sessionId) auto-populated
- Audit failures non-blocking (logged but don't break flow)

### 5. **Object Field Support**
- Wix Data Collections store complex nested objects
- No flattening required for object fields
- Maintains structure integrity through save/load cycle

---

## 🧪 Usage Examples

### Example 1: Save and Load a Trip

```javascript
import { saveTrip, loadTrip, generateTripId } from 'backend/etas/tripDatabase.js';

// Create new trip
const trip = {
  trip_id: generateTripId(),
  user_id: "user_123",
  user_email: "user@example.com",
  state: { current_state: "draft" },
  pickup: { address: "123 Main St", datetime: "2025-01-20T18:30:00" },
  dropoff: { address: "456 Oak Ave" },
  passengers: 2,
  luggage: 0,
  tier: { name: "basic", source: "user_profile", locked: true }
};

// Save trip
const saved = await saveTrip(trip);
console.log(`Trip saved with _id: ${saved._id}`);

// Load trip later
const loaded = await loadTrip(trip.trip_id);
console.log(`Loaded trip: ${loaded.trip_id}`);
```

### Example 2: Add Trip to Admin Queue

```javascript
import { addToAdminQueue, getAdminQueue } from 'backend/etas/tripDatabase.js';

// Add trip to queue (when state changes to admin-relevant state)
const trip = { /* trip object */ };
await addToAdminQueue(trip);

// Retrieve queue entries
const queue = await getAdminQueue(
  { priority: "critical" },  // filters
  "NEEDS_ACTION",             // queue section
  50                          // limit
);

console.log(`Found ${queue.length} high-priority items needing action`);
```

### Example 3: Log Admin Action

```javascript
import { logAuditEvent } from 'backend/etas/tripDatabase.js';

// Log approval action
await logAuditEvent({
  adminId: "admin_123",
  adminEmail: "admin@example.com",
  action: "approve_trip",
  tripId: "trip_001",
  fromState: "pending_approval",
  toState: "approved",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  notes: "Approved based on SENTINEL assessment"
});
```

### Example 4: Update Admin Queue Entry

```javascript
import { updateAdminQueue } from 'backend/etas/tripDatabase.js';

// Update queue entry after admin action
await updateAdminQueue("trip_001", {
  state: { current_state: "approved" },
  context: { reviewed_by: "admin_123" },
  review: {
    reviewedAt: new Date().toISOString(),
    reviewedBy: "admin_123",
    decision: "APPROVED"
  }
});
```

---

## 📊 Collection Permissions

### `Trips` Collection

| Permission | Setting | Notes |
|------------|---------|-------|
| **Read** | Anyone | Filtered by `userId` in application code |
| **Create** | Anyone | Validated in backend before save |
| **Update** | Anyone | Validated in backend before update |
| **Delete** | Admin only | Controlled by Wix permissions |

### `AdminQueue` Collection

| Permission | Setting | Notes |
|------------|---------|-------|
| **Read** | Admin only | Queue entries only visible to admins |
| **Create** | Backend only | Created programmatically via `addToAdminQueue()` |
| **Update** | Admin only | Updated via `updateAdminQueue()` |
| **Delete** | Admin only | Manual deletion only (no auto-delete) |

### `AuditLog` Collection

| Permission | Setting | Notes |
|------------|---------|-------|
| **Read** | Admin only | Audit logs sensitive, admin-only access |
| **Create** | Backend only | Created via `logAuditEvent()` |
| **Update** | None | Audit logs append-only (immutable) |
| **Delete** | Admin only | Manual deletion only (for compliance) |

---

## 🔄 Integration Points

### With `adminSurfaces.js`

- Uses `ADMIN_RELEVANT_STATES` to determine which trips need queue tracking
- Uses `getPriorityForState()` for priority calculation
- Uses `QUEUE_SECTIONS` for queue section assignment
- Uses `sortTripsForQueue()` for queue ordering

### With `tripSchema.v1.js`

- Field names match trip schema definitions
- Supports all schema object structures
- Maintains schema version compatibility

### With Approval/Execution Flow

- `approveTrip.js` updates queue via `updateAdminQueue()`
- `executeTrip.js` logs execution state to trip
- `processTrip.js` calls `addToAdminQueue()` when state changes

---

## 📁 Files Created/Modified

### Created:
- `src/backend/etas/tripDatabase.js` - Complete database operations module (397 lines)
- `src/backend/etas/__tests__/testTripDatabase.js` - Comprehensive test suite (518 lines)

### Modified:
- `docs/SPRINT_1_WIX_DATABASES.md` - This documentation (updated to reflect implementation)

---

## 🚀 Future Enhancements

### Query Optimization
- Add database indexes for common queries (userId, state, priority)
- Implement pagination for large result sets
- Cache frequently accessed trips

### Advanced Filtering
- Support date range queries for audit logs
- Add full-text search for trip addresses
- Implement complex multi-field filters

### Data Migration
- Version migration utilities for schema changes
- Bulk import/export tools
- Data archival for completed trips

### Performance Monitoring
- Query performance tracking
- Database operation metrics
- Queue size monitoring

---

## 📚 Related Documentation

- `DAY_9_ADMIN_SURFACES.md` - Admin queue requirements and audit specifications
- `DAY_9_SUMMARY.md` - Human approval loop integration
- `DAY_10_SUMMARY.md` - Execution metadata structure
- `DAY_12_SUMMARY.md` - Tier field implementation
- `tripSchema.v1.js` - Complete trip schema definition
- `adminSurfaces.js` - Admin queue configuration and constants

---

## ✅ Definition of "Sprint 1 Database Complete"

You can confidently say:

> **"The database persistence layer is fully implemented with three collections (Trips, AdminQueue, AuditLog), comprehensive CRUD operations, format conversion between application and Wix Data formats, admin queue management with priority sorting, and complete audit logging aligned with DAY_9 requirements."**

Specifically:
- ✅ Three Wix Data Collections defined and implemented
- ✅ Complete CRUD operations for trips
- ✅ Format conversion between application and Wix Data formats
- ✅ Admin queue management with priority and section tracking
- ✅ Comprehensive audit logging with all required fields
- ✅ Full test coverage (11 test scenarios)
- ✅ Integration with adminSurfaces.js for queue operations
- ✅ Non-blocking error handling
- ✅ Documentation complete

---

**Sprint 1 Database Status:** ✅ **COMPLETE**  
**Date Completed:** December 30, 2025  
**Next Steps:** Production deployment and performance optimization
