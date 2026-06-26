# WAI Technologies — ETAS Environment & Architecture Setup Guide

**Document Date**: January 18, 2026  
**Sprint**: Sprint 1 Complete → Sprint 2 Setup  
**Purpose**: Production-ready environment and architecture implementation guide

---

## 🎯 Executive Summary

This document provides WAI Technologies with a complete blueprint for setting up production, staging, and development environments for the ETAS (Enhanced Trip Approval System) platform, based on Sprint 1's completed work.

**What's Been Built:**
- ✅ Complete trip lifecycle state machine (10 states)
- ✅ Three-tier service model (BASIC, CORPORATE, EXECUTIVE)
- ✅ Validation framework with 3 layers
- ✅ SENTINEL risk assessment engine
- ✅ Human approval workflow
- ✅ Role-based permissions (USER, ADMIN, SYSTEM)
- ✅ Failure recovery & retry logic
- ✅ Audit trail & logging
- ✅ Admin operational surfaces

**What This Guide Delivers:**
- ✅ Environment architecture (Dev, Staging, Production)
- ✅ Wix platform configuration
- ✅ Database schema & collections
- ✅ Service boundaries & integrations
- ✅ Security & permissions model
- ✅ Deployment strategy
- ✅ Monitoring & observability setup
- ✅ Team ownership boundaries

---

## 📊 Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (WAI)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │   User     │  │   Admin    │  │  Booking   │  │  Dashboard   │     │
│  │   Portal   │  │  Dashboard │  │   Forms    │  │  Analytics   │     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘     │
└────────┼───────────────┼───────────────┼────────────────┼──────────────┘
         │               │               │                │
         └───────────────┴───────────────┴────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Wix API Gateway      │
                    │   (tripService.jsw)     │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────────┐
│                        BACKEND LAYER (Madison Logic)                      │
│                                 │                                         │
│  ┌─────────────────────────────▼─────────────────────────────┐          │
│  │              ETAS Core Processing Engine                    │          │
│  │                                                              │          │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │          │
│  │  │  processTrip │  │  validateTrip│  │  tierDefinitions│ │          │
│  │  │     .js      │  │     .js      │  │      .js        │ │          │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │          │
│  │         │                  │                   │           │          │
│  │  ┌──────▼──────────────────▼───────────────────▼────────┐ │          │
│  │  │          Trip State Machine & Validation              │ │          │
│  │  │         (tripSchema.v1.js, tripValidation.js)         │ │          │
│  │  └──────┬────────────────────────────────────────────────┘ │          │
│  │         │                                                    │          │
│  │  ┌──────▼───────────┐  ┌────────────────┐  ┌────────────┐ │          │
│  │  │  approveTrip.js  │  │ executeTrip.js │  │ SENTINEL   │ │          │
│  │  │  (Human Review)  │  │  (Execution)   │  │ sentinelLite│ │          │
│  │  └──────┬───────────┘  └──────┬─────────┘  └─────┬──────┘ │          │
│  │         │                     │                   │         │          │
│  │  ┌──────▼─────────────────────▼───────────────────▼──────┐ │          │
│  │  │         Failure Handling & Retry Logic                 │ │          │
│  │  │         (failureHandling.js, automationEligibility.js) │ │          │
│  │  └────────────────────────────────────────────────────────┘ │          │
│  └──────────────────────────────┬───────────────────────────────┘          │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Wix Data Collections      │
                    │  (Database Layer)          │
                    └─────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
    ┌────▼─────┐         ┌───────▼─────┐         ┌───────▼─────┐
    │  Trips   │         │  AuditLog   │         │  UserProfiles│
    │Collection│         │  Collection │         │  Collection  │
    └──────────┘         └─────────────┘         └──────────────┘
                                  │
┌─────────────────────────────────┼──────────────────────────────────────────┐
│                      EXECUTION LAYER (Lee Integration)                     │
│                                  │                                          │
│  ┌──────────────────────────────▼──────────────────────────────┐          │
│  │              Execution Orchestration Service                 │          │
│  │                                                               │          │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │          │
│  │  │  Payment    │  │   Provider   │  │    Dispatch      │   │          │
│  │  │  Gateway    │  │   API Calls  │  │  Coordination    │   │          │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘   │          │
│  └───────────────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**
   - Frontend (WAI): UI/UX presentation only
   - Backend (Madison): Business logic, validation, state management
   - Execution (Lee): Payment, booking, dispatch

2. **State Machine Governance**
   - All trip behavior flows through explicit state transitions
   - No direct state manipulation from UI
   - Validation gates at every transition

3. **Non-Blocking Intelligence**
   - SENTINEL enriches but never blocks
   - Intelligence informs human decisions
   - Auto-approval based on confidence scoring

4. **Fail-Safe Defaults**
   - System defaults to human review when uncertain
   - All failures logged and auditable
   - Retry strategies automatic and transparent

---

## 🌍 Environment Setup

### Environment Tiers

| Environment | Purpose | Data | Users | Deployment |
|-------------|---------|------|-------|------------|
| **Development** | Active development, testing new features | Synthetic/mock data | Developers only | On commit to `dev` branch |
| **Staging** | Pre-production validation, integration testing | Anonymized production copy | Internal team + select beta users | On merge to `staging` branch |
| **Production** | Live customer service | Real customer data | All users | On approved release tag |

### Environment Configuration

#### Development Environment

```javascript
// wix.config.dev.json
{
  "siteId": "dev-c4597d81-xxxx",
  "environment": "development",
  "features": {
    "sentinelDepth": "lite",
    "automationEnabled": false,
    "paymentMode": "sandbox",
    "auditLevel": "verbose"
  },
  "externalServices": {
    "sentinelAPI": "https://dev-sentinel.wai-tech.com",
    "paymentGateway": "https://sandbox.stripe.com",
    "providerAPI": "https://mock-provider.wai-tech.com"
  },
  "logging": {
    "level": "debug",
    "console": true,
    "remote": false
  }
}
```

#### Staging Environment

```javascript
// wix.config.staging.json
{
  "siteId": "staging-c4597d81-xxxx",
  "environment": "staging",
  "features": {
    "sentinelDepth": "expanded",
    "automationEnabled": true,
    "paymentMode": "test",
    "auditLevel": "standard"
  },
  "externalServices": {
    "sentinelAPI": "https://staging-sentinel.wai-tech.com",
    "paymentGateway": "https://test.stripe.com",
    "providerAPI": "https://staging-provider.wai-tech.com"
  },
  "logging": {
    "level": "info",
    "console": false,
    "remote": true
  }
}
```

#### Production Environment

```javascript
// wix.config.production.json
{
  "siteId": "c4597d81-b5f2-45ae-87a6-90e8f403901f",
  "environment": "production",
  "features": {
    "sentinelDepth": "full",
    "automationEnabled": true,
    "paymentMode": "live",
    "auditLevel": "enhanced"
  },
  "externalServices": {
    "sentinelAPI": "https://sentinel.wai-tech.com",
    "paymentGateway": "https://api.stripe.com",
    "providerAPI": "https://provider.wai-tech.com"
  },
  "logging": {
    "level": "warn",
    "console": false,
    "remote": true,
    "alerting": true
  },
  "rateLimit": {
    "requestsPerMinute": 1000,
    "burstAllowance": 100
  }
}
```

---

## 💾 Database Schema & Collections

### Wix Data Collections

#### 1. Trips Collection

**Collection Name**: `Trips`  
**Permissions**: 
- Read: USER (own trips), ADMIN (all trips)
- Write: SYSTEM only
- Create: USER
- Delete: ADMIN only (soft delete)

**Schema**:

```javascript
{
  "_id": "string",              // Wix auto-generated
  "trip_id": "string",          // TRP_XXXXX format
  "user_id": "string",          // Wix member ID
  "state": "string",            // State machine state
  "created_at": "date",
  "updated_at": "date",
  
  // Trip Details
  "pickup": {
    "address": "string",
    "datetime": "string",       // ISO 8601
    "timezone": "string"
  },
  "dropoff": {
    "address": "string"
  },
  "return": {
    "pickup_datetime": "string",
    "estimated_home_arrival": "string"
  },
  "passengers": "number",
  "luggage": "number",
  
  // Tier Information (Day 12)
  "tier": {
    "name": "string",           // basic | corporate | executive
    "source": "string",         // user_profile | system_default
    "locked": "boolean",
    "resolved_at": "string"
  },
  
  // SENTINEL Assessment
  "sentinel_snapshot": {
    "risk_level": "string",     // LOW | MEDIUM | HIGH | CRITICAL
    "risk_score": "number",     // 0-100
    "flags": "array",           // SENTINEL flags
    "timestamp": "string",
    "version": "string"         // SENTINEL version
  },
  
  // Admin Context (Days 9-11) - NESTED STRUCTURE
  // Contains ALL admin-related data: approval, automation, execution, failure, retries
  "admin_context": {
    // Approval tracking
    "approval": {
      "status": "string",       // PENDING | APPROVED | REJECTED | NEEDS_CLARIFICATION
      "decided_by": "string",   // admin_id or null
      "decided_at": "string",   // ISO timestamp or null
      "notes": "text",
      "decision_reason": "string" // Structured reason code
    },
    
    // Automation eligibility
    "automation": {
      "eligible": "boolean",
      "reason": "string",       // Why not eligible
      "checked_at": "string"    // ISO timestamp
    },
    
    // Execution tracking
    "execution": {
      "status": "string",       // NOT_STARTED | IN_PROGRESS | COMPLETED | FAILED
      "action": "string",       // approve | reject | clarify | escalate
      "executed_by": "string",  // admin_id or null
      "executed_at": "string",  // ISO timestamp or null
      "result": "object"        // Execution outcome data
    },
    
    // Failure tracking
    "failure": {
      "count": "number",
      "last_failure_at": "string",
      "last_failure_reason": "string",
      "failure_type": "string"  // payment | booking | validation | system
    },
    
    // Retry tracking
    "retries": {
      "count": "number",
      "last_retry_at": "string",
      "max_retries_reached": "boolean"
    }
  },
  
  // Payment
  "payment": {
    "method": "string",
    "status": "string",
    "transaction_id": "string",
    "amount": "number",
    "currency": "string"
  },
  
  // Metadata
  "soft_deleted": "boolean",
  "deleted_at": "date",
  "deleted_by": "string"
}
```

**Indexes**:
- `user_id` (for user trip queries)
- `state` (for admin queue filtering)
- `admin_context.approval.status` (for approval workflows)
- `created_at` (for sorting)
- Compound: `user_id + state` (for user trip history)
- Compound: `state + admin_context.approval.status` (for admin queue)

#### 2. AuditLog Collection

**Collection Name**: `AuditLog`  
**Permissions**: 
- Read: ADMIN only
- Write: SYSTEM only
- Create: SYSTEM only
- Delete: Never (append-only)

**Schema** (from Lee's tripDatabase.js):

```javascript
{
  "_id": "string",
  "auditId": "string",          // UUID generated by system
  "tripId": "string",
  "timestamp": "date",          // ISO 8601 timestamp
  "fromState": "string",        // Previous trip state (null for create)
  "toState": "string",          // New trip state
  
  // Event metadata
  "event": {
    "event_type": "string",     // From eventTypes.js (40+ event types)
    "event_category": "string", // USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION
    "outcome": "string"         // SUCCESS | FAILURE | PARTIAL | PENDING
  },
  
  // Actor information (who/what did it)
  "actor": {
    "actor_id": "string",       // User ID, Admin ID, or "SYSTEM"
    "actor_role": "string",     // USER | ADMIN | SENIOR_ADMIN | SYSTEM
    "actor_email": "string",    // Email (null for SYSTEM)
    "ipAddress": "string"       // IP address (empty string if N/A)
  },
  
  // Admin context (optional, for admin actions only)
  "adminContext": {
    "notes": "text",            // Admin reasoning/notes
    "override_reason": "text",  // Why override was necessary
    "user_contacted": "boolean", // Was user notified
    "escalation_target": "string", // Who was escalated to
    "resolution_notes": "text",  // How issue was resolved
    "session_id": "string",     // Session identifier
    "environment": "string",    // production | staging | dev
    "version": "string"         // System version at time of action
  },
  
  // Retention and compliance
  "retentionPolicy": "string", // STANDARD | EXTENDED | PERMANENT | LEGAL_HOLD
  "complianceTags": "array",   // ["PII", "FINANCIAL", etc.]
  "immutable": "boolean"       // Always true
}
```

**Indexes**:
- `tripId` (primary lookup)
- `timestamp` (time-based queries)
- `event.event_type` (event filtering)
- `event.event_category` (category filtering: USER_ACTION | ADMIN_ACTION | SYSTEM_ACTION)
- `actor.actor_id` (actor-based queries)
- Compound: `tripId + timestamp` (trip history)
- Compound: `event.event_category + timestamp` (admin action reports)

#### 3. UserProfiles Collection

**Collection Name**: `UserProfiles`  
**Permissions**: 
- Read: USER (own profile), ADMIN (all profiles)
- Write: USER (own profile), ADMIN
- Create: Automatic on registration
- Delete: GDPR request only

**Schema**:

```javascript
{
  "_id": "string",              // Wix member ID
  "email": "string",
  "created_at": "date",
  "last_login": "date",
  
  // Tier Assignment
  "tier": "string",             // basic | corporate | executive
  "tier_assigned_at": "date",
  "tier_assigned_by": "string",
  
  // Account Status
  "account_status": "string",   // active | suspended | blocked
  "verification_status": "string", // unverified | verified | trusted
  
  // Trip Statistics
  "stats": {
    "total_trips": "number",
    "completed_trips": "number",
    "cancelled_trips": "number",
    "last_trip_date": "date"
  },
  
  // SENTINEL Context
  "sentinel_context": {
    "baseline_established": "boolean",
    "risk_score_avg": "number",
    "anomaly_count": "number",
    "last_evaluation": "date"
  },
  
  // Preferences
  "preferences": {
    "default_pickup": "string",
    "default_passengers": "number",
    "notification_settings": "object"
  },
  
  // Compliance
  "gdpr_consent": "boolean",
  "marketing_consent": "boolean",
  "data_retention_override": "string"
}
```

**Indexes**:
- `email` (unique)
- `tier` (tier-based queries)
- `account_status` (active user lookups)

#### 4. AdminQueue Collection

**Collection Name**: `AdminQueue`  
**Permissions**: 
- Read: ADMIN only
- Write: SYSTEM only
- Create: SYSTEM only
- Delete: SYSTEM (auto-cleanup after resolution)

**Schema**:

```javascript
{
  "_id": "string",
  "trip_id": "string",
  "queued_at": "date",
  "priority": "string",         // LOW | MEDIUM | HIGH | CRITICAL
  "queue_reason": "string",     // sentinel_orange | validation_blocked | payment_failure | etc.
  
  "trip_summary": {
    "user_id": "string",
    "destination": "string",
    "pickup_time": "string",
    "passengers": "number",
    "tier": "string"
  },
  
  "context": {
    "sentinel_flag": "string",
    "sentinel_confidence": "number",
    "anomalies": "array",
    "validation_errors": "array",
    "failure_history": "array"
  },
  
  "assigned_to": "string",      // Admin ID
  "assigned_at": "date",
  "status": "string",           // pending | in_review | resolved
  "resolved_at": "date",
  "resolution": "string",       // APPROVED | REJECTED | ESCALATED
  "admin_notes": "text",
  
  "sla": {
    "response_deadline": "date",
    "overdue": "boolean"
  }
}
```

**Indexes**:
- `priority` (queue ordering)
- `status` (pending items)
- `queued_at` (FIFO within priority)
- Compound: `status + priority + queued_at` (admin dashboard)

---

## 🔐 Security & Permissions

### Backend Permissions (permissions.json)

```json
{
  "web-methods": {
    "*": {
      "*": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": false },
        "anonymous": { "invoke": false }
      }
    },
    "backend/tripService.jsw": {
      "createTrip": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": true },
        "anonymous": { "invoke": false }
      },
      "getMyTrips": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": true },
        "anonymous": { "invoke": false }
      },
      "submitTrip": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": true },
        "anonymous": { "invoke": false }
      },
      "cancelTrip": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": true },
        "anonymous": { "invoke": false }
      },
      "getTripStatus": {
        "siteOwner": { "invoke": true },
        "siteMember": { "invoke": true },
        "anonymous": { "invoke": false }
      }
    }
  }
}
```

### Role-Based Access Control

**Implemented in**: `src/backend/etas/rolesPermissions.js`

| Role | Capabilities | Restrictions |
|------|-------------|--------------|
| **USER** | Create trips, view own trips, edit draft trips, cancel own trips | Cannot access other users' trips, cannot approve trips, cannot access admin functions |
| **ADMIN** | View all trips, approve/reject trips, access admin queue, annotate trips, manual retry | Cannot modify business rules, cannot bypass audit trail, must provide justification for overrides |
| **SYSTEM** | Auto-validate, auto-approve (when eligible), log audit events, execute retries | No manual override capability, bound by business rules, all actions logged |
| **SENIOR ADMIN** | All ADMIN capabilities + override rules, escalate critical issues | Overrides require written justification, all overrides audited |

---

## 🔌 Integration Boundaries

### Service Integration Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTEGRATION LAYER                               │
├──────────────────┬──────────────────┬──────────────────┬────────────────┤
│   YOU (Madison)  │   LEE (Execute)  │   WAI (Frontend) │  EXTERNAL APIs │
├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ Business Logic   │ Payment Gateway  │ User Interface   │ SENTINEL API   │
│ State Machine    │ Provider APIs    │ Admin Dashboard  │ Payment Gateway│
│ Validation       │ Dispatch System  │ Booking Forms    │ Provider APIs  │
│ Approval Rules   │ Booking Execution│ Status Displays  │ Maps/Geocoding │
│ Failure Handling │ Retry Execution  │ Notifications    │ Analytics      │
└──────────────────┴──────────────────┴──────────────────┴────────────────┘
```

### Integration Contracts

#### Madison → Lee (Execution Handoff)

**Trigger**: Trip state = `approved` + `execution.status = PENDING`

**Data Contract**:
```javascript
{
  "trip_id": "string",
  "action": "SEND_BOOKING_REQUEST",
  "approved_by": "string",
  "approved_at": "string",
  "trip_details": {
    "pickup": { /* full pickup object */ },
    "dropoff": { /* full dropoff object */ },
    "passengers": "number",
    "tier": "string",
    "payment_method": "string"
  },
  "execution_context": {
    "priority": "string",
    "retry_strategy": "string",
    "timeout_ms": "number"
  }
}
```

**Expected Response**:
```javascript
{
  "status": "SUCCESS" | "FAILURE",
  "transaction_id": "string",
  "provider_confirmation": "string",
  "error_code": "string" (if failure),
  "retry_eligible": "boolean"
}
```

#### Madison → WAI (UI State Updates)

**Trigger**: Any state transition

**Data Contract**:
```javascript
{
  "trip_id": "string",
  "new_state": "string",
  "user_message": "string",         // From uxMessaging.js
  "status_indicator": "string",     // success | warning | error | info
  "actions_available": ["array"],   // UI buttons to show
  "estimated_time": "string",       // When applicable
  "context": {
    "validation_errors": ["array"],
    "next_steps": "string",
    "help_text": "string"
  }
}
```

#### External → SENTINEL API

**Trigger**: Post-validation, pre-approval

**Request**:
```javascript
{
  "trip_id": "string",
  "user_id": "string",
  "tier": "string",
  "requested_depth": "lite" | "expanded" | "full",
  "trip_data": {
    "destination": "string",
    "pickup_time": "string",
    "passengers": "number",
    "tier": "string"
  },
  "user_context": {
    "trip_history": "number",
    "account_age_days": "number",
    "verification_level": "string"
  }
}
```

**Response**:
```javascript
{
  "risk_flag": "green" | "yellow" | "orange" | "red",
  "confidence": "number",         // 0-1
  "anomalies": ["array"],
  "recommendations": {
    "auto_approve": "boolean",
    "requires_review": "boolean",
    "escalate": "boolean"
  },
  "context": "text"
}
```

---

## 🚀 Deployment Strategy

### Deployment Pipeline

```
Developer Commit
      ↓
Git Push to Branch
      ↓
    ┌─────────────────────┐
    │  CI/CD Pipeline     │
    │  - Lint             │
    │  - Unit Tests       │
    │  - Integration Tests│
    └──────────┬──────────┘
               ↓
         Branch Type?
               ↓
    ┌──────────┼──────────┐
    │          │          │
  `dev`    `staging`  `main`
    ↓          ↓          ↓
 Deploy    Deploy     Deploy
   to        to         to
  Dev     Staging   Production
    ↓          ↓          ↓
  ✅         ✅         ✅
```

### Wix CLI Deployment Commands

**Development Deployment**:
```powershell
# Set environment
$env:WIX_ENV = "development"

# Deploy to dev
wix dev --open

# Or deploy without opening
wix publish --env dev
```

**Staging Deployment**:
```powershell
# Set environment
$env:WIX_ENV = "staging"

# Deploy to staging
wix publish --env staging

# Run smoke tests
npm run test:smoke -- --env=staging
```

**Production Deployment**:
```powershell
# Requires approval tag
git tag -a v1.0.0 -m "Sprint 1 Complete - ETAS Core"
git push origin v1.0.0

# Set environment
$env:WIX_ENV = "production"

# Deploy to production (with confirmation)
wix publish --env production --confirm

# Verify deployment
wix status --env production
```

### Rollback Strategy

**Immediate Rollback**:
```powershell
# Revert to previous version
wix rollback --env production --version previous

# Or rollback to specific version
wix rollback --env production --version v0.9.5
```

**Database Rollback** (if needed):
```javascript
// Execute rollback script
wix data restore --collection Trips --snapshot pre-deploy-20260118
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

#### System Health Metrics

| Metric | Target | Alert Threshold | Owner |
|--------|--------|-----------------|-------|
| **API Response Time** | < 500ms (p95) | > 1000ms | Lee |
| **Trip Validation Success Rate** | > 95% | < 90% | Madison |
| **Auto-Approval Rate** | 70-80% | < 60% or > 90% | Madison |
| **Payment Success Rate** | > 98% | < 95% | Lee |
| **Retry Success Rate** | > 80% | < 70% | Madison + Lee |
| **Admin Queue SLA** | < 15 min | > 30 min | Ops Team |
| **SENTINEL API Uptime** | > 99.5% | < 99% | Madison |

#### Business Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| **Trip Completion Rate** | > 90% | Product |
| **Cancellation Rate** | < 5% | Product |
| **Admin Approval Time (avg)** | < 10 min | Ops |
| **User Satisfaction (NPS)** | > 8.0 | Product |
| **Tier Distribution** | 60/30/10 (B/C/E) | Business |

### Logging Configuration

**Implemented in**: `src/backend/etas/*` (console.log statements)

**Log Levels**:
- `DEBUG`: Development only, verbose output
- `INFO`: Normal operations, state transitions
- `WARN`: Validation failures, retry attempts
- `ERROR`: System errors, execution failures
- `CRITICAL`: Security issues, data corruption

**Log Structure** (JSON format):
```javascript
{
  "timestamp": "2026-01-18T10:30:00Z",
  "level": "INFO",
  "service": "ETAS",
  "module": "processTrip",
  "trip_id": "TRP_12345",
  "user_id": "USR_789",
  "event": "STATE_TRANSITION",
  "from_state": "draft",
  "to_state": "booking_ready",
  "metadata": {
    "tier": "corporate",
    "sentinel_flag": "green"
  }
}
```

### Alerting Rules

**Critical Alerts** (Immediate Response):
- Payment gateway down
- SENTINEL API unavailable
- Database connection lost
- Admin queue SLA breach (> 30 min)
- Security event detected

**Warning Alerts** (Monitor):
- Auto-approval rate deviation
- Retry rate increase
- Validation failure spike
- Admin queue growing

**Notification Channels**:
- Email: ops@wai-tech.com
- Slack: #etas-alerts
- SMS: On-call engineer (critical only)
- PagerDuty: Critical production issues

---

## 👥 Team Ownership Boundaries

### Responsibility Matrix

| Domain | Owner | Responsibilities | Does NOT Own |
|--------|-------|------------------|--------------|
| **Business Logic** | Madison | State machine, validation rules, approval logic, tier definitions, failure handling | UI design, payment execution, frontend code |
| **Execution** | Lee | Payment processing, provider APIs, booking execution, dispatch | Business rules, validation logic, approval decisions |
| **UI/UX** | WAI | Frontend design, user flows, admin dashboard, visual presentation | Business logic, state definitions, approval rules |
| **Operations** | Admin Team | Trip approvals, queue management, escalations, user support | System configuration, business rule changes, code deployment |
| **Infrastructure** | DevOps Team | Environment setup, deployment pipeline, monitoring, security | Business logic, feature development, approval decisions |

### Decision Authority

| Decision Type | Owner | Requires Approval From |
|---------------|-------|------------------------|
| **Business Rule Changes** | Madison | Product Lead |
| **New Feature Development** | Product Lead | Executive Team |
| **Tier Capacity Changes** | Madison | Business Team |
| **Payment Provider Selection** | Lee | Finance + Product |
| **UI/UX Changes** | WAI | Product + Madison (for logic impact) |
| **Production Deployment** | DevOps | Tech Lead + Product |
| **Emergency Rollback** | On-Call Engineer | Tech Lead (post-action) |
| **Admin Override Policy** | Operations Manager | Compliance Team |

---

## 📋 Sprint 2 Setup Checklist

### Phase 1: Environment Provisioning (Week 1)

**Wix Platform Setup**:
- [ ] Create staging Wix site (duplicate production site ID)
- [ ] Configure staging environment variables
- [ ] Set up staging collections (Trips, AuditLog, UserProfiles, AdminQueue)
- [ ] Apply collection indexes
- [ ] Configure staging permissions.json
- [ ] Test Wix CLI access to all environments

**External Services**:
- [ ] Set up SENTINEL API staging endpoint
- [ ] Configure payment gateway test accounts
- [ ] Set up provider API sandbox
- [ ] Configure monitoring tools (e.g., New Relic, Datadog)
- [ ] Set up log aggregation (e.g., LogRocket, Sentry)

**Access Control**:
- [ ] Provision admin accounts (Ops team)
- [ ] Create test user accounts (all tiers)
- [ ] Configure role-based permissions in Wix
- [ ] Set up API keys for external services
- [ ] Document credential management (use 1Password/LastPass)

### Phase 2: Code Deployment (Week 1-2)

**Backend Deployment**:
- [ ] Deploy Sprint 1 backend code to staging
- [ ] Verify all ETAS modules loaded correctly
- [ ] Test tripService.jsw endpoints
- [ ] Validate permissions.json applied
- [ ] Run backend unit tests in staging
- [ ] Verify database connections

**Frontend Integration (WAI)**:
- [ ] Create user trip submission form
- [ ] Build trip status display page
- [ ] Implement admin approval dashboard
- [ ] Create admin queue interface
- [ ] Add user trip history page
- [ ] Build tier selection UI
- [ ] Connect frontend to backend APIs
- [ ] Test end-to-end flows

**Execution Integration (Lee)**:
- [ ] Set up payment gateway integration
- [ ] Implement provider API calls
- [ ] Build dispatch coordination logic
- [ ] Create retry execution handler
- [ ] Test execution workflows
- [ ] Verify failure handling

### Phase 3: Testing & Validation (Week 2-3)

**Functional Testing**:
- [ ] Run 5 canonical scenarios in staging ([demo-trip-flow.html](../public/demo-trip-flow.html))
- [ ] Test all user roles (USER, ADMIN, SYSTEM)
- [ ] Validate tier-based behavior (BASIC, CORPORATE, EXECUTIVE)
- [ ] Test validation error handling
- [ ] Verify SENTINEL integration
- [ ] Test payment retry logic
- [ ] Validate admin approval workflows
- [ ] Test failure escalation paths

**Integration Testing**:
- [ ] End-to-end trip lifecycle (draft → completed)
- [ ] Payment gateway integration
- [ ] Provider API integration
- [ ] SENTINEL API integration
- [ ] Frontend → Backend → Execution flow
- [ ] Audit log completeness
- [ ] Admin queue functionality

**Performance Testing**:
- [ ] Load test API endpoints (100 concurrent users)
- [ ] Test database query performance
- [ ] Validate retry logic under load
- [ ] Test admin queue scalability
- [ ] Measure SENTINEL API latency

**Security Testing**:
- [ ] Penetration testing (user roles)
- [ ] API authentication validation
- [ ] Database access control verification
- [ ] Audit log immutability check
- [ ] GDPR compliance validation

### Phase 4: Documentation & Handoff (Week 3)

**Technical Documentation**:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Environment configuration guide
- [ ] Deployment runbook
- [ ] Rollback procedures
- [ ] Troubleshooting guide

**Operational Documentation**:
- [ ] Admin user guide
- [ ] Approval decision flowchart
- [ ] Escalation procedures
- [ ] SLA definitions
- [ ] On-call runbook
- [ ] Incident response plan

**Training**:
- [ ] Admin team training (approval workflows)
- [ ] Ops team training (monitoring & alerting)
- [ ] Support team training (user issues)
- [ ] Developer handoff session (WAI + Lee)

### Phase 5: Production Readiness (Week 4)

**Pre-Launch Checklist**:
- [ ] All tests passing in staging
- [ ] Performance metrics within targets
- [ ] Security audit complete
- [ ] Monitoring & alerting configured
- [ ] Backup & recovery tested
- [ ] Disaster recovery plan documented
- [ ] Stakeholder sign-off obtained
- [ ] Go/No-Go meeting scheduled

**Launch**:
- [ ] Deploy to production (off-peak hours)
- [ ] Run smoke tests in production
- [ ] Monitor system metrics (first 24h)
- [ ] Verify audit logs writing correctly
- [ ] Check admin queue functioning
- [ ] Validate payment gateway live mode
- [ ] Confirm SENTINEL API production endpoint
- [ ] Post-launch retrospective

---

## 🔗 Key Files & Modules Reference

### Core Backend Modules

| File | Purpose | Owner | Status |
|------|---------|-------|--------|
| [tripSchema.v1.js](../src/backend/etas/tripSchema.v1.js) | State definitions & data structure | Madison | ✅ Complete |
| [tripValidation.js](../src/backend/etas/tripValidation.js) | 3-layer validation framework | Madison | ✅ Complete |
| [processTrip.js](../src/backend/etas/processTrip.js) | Main entry point | Madison | ✅ Complete |
| [tierDefinitions.js](../src/backend/etas/tierDefinitions.js) | Tier capabilities & behavior | Madison | ✅ Complete |
| [approveTrip.js](../src/backend/etas/approveTrip.js) | Human approval logic | Madison | ✅ Complete |
| [executeTrip.js](../src/backend/etas/executeTrip.js) | Execution validation | Madison | ✅ Complete |
| [automationEligibility.js](../src/backend/etas/automationEligibility.js) | Auto-approval rules | Madison | ✅ Complete |
| [failureHandling.js](../src/backend/etas/failureHandling.js) | Retry strategies | Madison | ✅ Complete |
| [rolesPermissions.js](../src/backend/etas/rolesPermissions.js) | RBAC definitions | Madison | ✅ Complete |
| [uxMessaging.js](../src/backend/etas/uxMessaging.js) | User-facing messages | Madison | ✅ Complete |
| [adminSurfaces.js](../src/backend/etas/adminSurfaces.js) | Admin context & actions | Madison | ✅ Complete |
| [sentinelLite.js](../src/backend/sentinel/sentinelLite.js) | Risk assessment | Madison | ✅ Complete |

### Documentation

| Document | Purpose | Status |
|----------|---------|--------|
| [DAY_12_EXECUTIVE_SUMMARY.md](DAY_12_EXECUTIVE_SUMMARY.md) | Sprint 1 overview | ✅ Complete |
| [DAY_12_SYSTEM_LOCK.md](DAY_12_SYSTEM_LOCK.md) | System boundaries & guarantees | ✅ Complete |
| [DAY_11_OWNERSHIP_GOVERNANCE.md](DAY_11_OWNERSHIP_GOVERNANCE.md) | Team boundaries | ✅ Complete |
| [DAY_12_FLOW_DIAGRAMS.md](DAY_12_FLOW_DIAGRAMS.md) | Visual system flows | ✅ Complete |
| [demo-trip-flow.html](../public/demo-trip-flow.html) | 5 canonical scenarios | ✅ Complete |

---

## 📞 Support & Escalation

### Technical Support Tiers

**Tier 1 - User Support**:
- User-facing issues (login, booking form, status updates)
- Contact: support@wai-tech.com
- SLA: 4 hours

**Tier 2 - Admin Operations**:
- Approval queue issues, admin dashboard problems
- Contact: ops@wai-tech.com
- SLA: 1 hour

**Tier 3 - Engineering**:
- System bugs, integration failures, performance issues
- Contact: #etas-engineering (Slack)
- SLA: 30 minutes (business hours)

**Critical Escalation**:
- Production down, data corruption, security breach
- Contact: On-call engineer (PagerDuty)
- SLA: Immediate response

---

## 🎯 Success Criteria

### Sprint 2 Success Metrics

**Technical Milestones**:
- [ ] All 3 environments operational (Dev, Staging, Production)
- [ ] 100% of Sprint 1 code deployed to staging
- [ ] 5 canonical scenarios pass in staging
- [ ] Frontend integrated with backend APIs
- [ ] Payment gateway live integration complete
- [ ] Admin dashboard functional
- [ ] Monitoring & alerting active

**Business Milestones**:
- [ ] 10 test users complete end-to-end trips
- [ ] Admin team trained and operational
- [ ] Auto-approval rate 70-80%
- [ ] Payment success rate > 98%
- [ ] Admin response time < 15 min (avg)
- [ ] Zero critical bugs in staging

**Readiness Criteria**:
- [ ] All pre-launch checklist items complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Disaster recovery tested
- [ ] Stakeholder sign-off obtained

---

## 📚 Additional Resources

### Wix Platform Documentation
- [Wix Velo Documentation](https://www.wix.com/velo/reference)
- [Wix Data API](https://www.wix.com/velo/reference/wix-data)
- [Wix CLI Guide](https://dev.wix.com/docs/cli)
- [Web Modules Permissions](https://support.wix.com/en/article/velo-about-web-module-permissions)

### Internal Documentation
- Sprint 1 Summary: [DAY_12_EXECUTIVE_SUMMARY.md](DAY_12_EXECUTIVE_SUMMARY.md)
- System Architecture: [DAY_12_FLOW_DIAGRAMS.md](DAY_12_FLOW_DIAGRAMS.md)
- Governance Model: [DAY_11_OWNERSHIP_GOVERNANCE.md](DAY_11_OWNERSHIP_GOVERNANCE.md)
- Testing Guide: [DAY_10_TESTING_ARTIFACTS.md](DAY_10_TESTING_ARTIFACTS.md)

### Contact Information
- **System Owner (Madison)**: madison@wai-tech.com
- **Execution Owner (Lee)**: lee@wai-tech.com
- **UI/UX Team (WAI)**: design@wai-tech.com
- **Product Lead**: product@wai-tech.com
- **DevOps Team**: devops@wai-tech.com
- **Operations Manager**: ops@wai-tech.com

---

**Document Version**: 1.0  
**Last Updated**: January 18, 2026  
**Next Review**: Sprint 2 Kickoff  
**Status**: Ready for Implementation
