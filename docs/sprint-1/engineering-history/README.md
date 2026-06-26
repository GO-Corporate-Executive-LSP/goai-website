GÖ.AI Engineering Handbook

Welcome

Welcome to the engineering repository for GÖ.AI.

This repository contains the complete architectural, technical, operational, and historical knowledge required to build the GÖ.AI platform.

Every engineer, technical contributor, and AI coding assistant should read this handbook before contributing to the project.

---

Engineering Philosophy

GÖ.AI is built using an Architecture First methodology.

Architecture defines the platform.

Implementation follows the architecture.

Engineering history provides context.

Production code implements the architecture.

The objective is to preserve engineering intent while continuously improving implementation.

---

Repository Reading Order

Every engineer should read the repository in the following order.

1. START_HERE.md

Read first.

Defines:

- project philosophy
- repository rules
- engineering workflow
- AI coding instructions
- repository conventions

---

2. Architecture

/architecture

Contains the canonical system architecture.

Topics include:

- SENTINEL™
- ETAS™
- Movement Graph™
- Canonical Objects
- Organization Architecture
- Security
- Intelligence Layer
- Provider Architecture
- Backend Architecture

This directory is the primary source of truth.

---

3. Specifications

/specifications

Contains functional specifications.

Defines:

- feature behavior
- expected outputs
- business rules
- implementation requirements

---

4. Reference

/reference

Contains engineering references including:

- terminology
- naming conventions
- object definitions
- engineering standards
- implementation guidance

---

5. Sprint Documentation

/docs/sprint-1

Sprint documentation explains how the backend was designed.

Topics include:

- validation
- state transitions
- tier logic
- human review
- permissions
- failure recovery
- UX messaging
- administration

These documents define backend behavior.

---

6. Engineering History

/docs/sprint-1/engineering-history

Historical engineering artifacts.

These preserve:

- original design discussions
- engineering evolution
- implementation notes
- architectural reasoning

Historical documentation should inform future engineering but never override the canonical architecture.

---

7. Provider Documentation

/docs/providers

Provider documentation explains every external integration.

Examples include:

- Duffel
- Lyft
- Stripe
- Weather
- Flight Intelligence
- Calendar
- Mapping
- Event Intelligence
- Infrastructure Intelligence
- Safety & Security

Each provider should contain:

- purpose
- authentication
- API contract
- request examples
- response examples
- implementation notes

---

8. API Registry

The API Registry serves as the master catalog of every external dependency.

Each provider should document:

- owner
- authentication
- pricing
- environment
- implementation status
- backend module
- documentation location
- related provider adapter

The API Registry is the authoritative inventory of external services.

---

9. Postman Collections

Legacy Postman collections preserve previous engineering work.

They include:

- Stripe
- Lyft
- Duffel
- ETAS
- request examples
- authentication flows
- payload structures
- endpoint testing

These collections should be referenced before implementing new provider adapters.

---

10. Legacy Engineering Repository

/legacy/demo-site

This directory preserves the original MVP engineering work.

Study:

- validation
- workflows
- state machines
- API integrations
- testing
- demo trips
- audit logging
- retry logic
- conversation flows

Reuse engineering knowledge.

Do not reproduce obsolete implementation.

---

Canonical Development Flow

Every feature should follow the same engineering workflow.

Architecture

↓

Specification

↓

Sprint Documentation

↓

Provider Documentation

↓

API Registry

↓

Legacy Engineering

↓

Implementation

↓

Testing

↓

Documentation

↓

Deployment

Architecture always precedes implementation.

---

Technology Stack

Current production platform includes:

Frontend

- HTML
- CSS
- JavaScript

Backend

- Node.js
- Netlify Functions

Database

- PostgreSQL
- PostGIS

Vector Search

- Pinecone

AI

- OpenAI

External Providers

- Duffel
- Lyft
- Stripe
- Weather
- Mapping
- Calendar
- Flight Intelligence
- Infrastructure Intelligence
- Event Intelligence
- Safety & Security

---

Deprecated Platforms

The repository contains historical engineering work using:

- Wix
- Velo
- Wix Data Collections
- Calendly

These platforms are retained only for historical engineering reference.

Do not introduce new dependencies on deprecated platforms.

Extract engineering knowledge only.

---

AI Coding Assistants

AI coding assistants should:

- read the architecture
- read specifications
- read sprint documentation
- search legacy implementations
- reuse proven business logic
- modernize implementation
- follow repository conventions
- preserve folder structure
- produce production-quality code

Never invent competing architecture.

---

Engineering Decision Reports

Every major implementation should conclude with an Engineering Decision Report.

The report should describe:

- architecture referenced
- documentation consulted
- legacy implementations reviewed
- logic reused
- logic discarded
- assumptions made
- architectural adaptations
- recommendations

Engineering decisions should always be traceable.

---

Repository Organization

This repository is organized into four knowledge layers.

Layer 1 — Canonical Architecture

Defines what the platform should become.

Layer 2 — Engineering Specifications

Defines how the architecture behaves.

Layer 3 — Institutional Knowledge

Preserves historical engineering work and implementation experience.

Layer 4 — Production Code

Implements the architecture.

---

Engineering Principle

The purpose of this repository is not merely to store code.

Its purpose is to preserve engineering knowledge.

Every contribution should leave the repository more understandable, more maintainable, and more valuable than it was before.

Build deliberately.

Document thoroughly.

Preserve institutional knowledge.

Architecture first.

Implementation second.
