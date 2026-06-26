README.md

Legacy Engineering Repository

Location: "/legacy/demo-site"

---

Purpose

This directory contains the original engineering implementation of the GÖ.AI prototype developed during the initial MVP effort.

It is preserved as a Legacy Engineering Repository and serves as an engineering knowledge base for future development.

The code, documentation, testing artifacts, engineering decisions, and implementation patterns contained here represent months of engineering work and should be treated as valuable implementation reference material.

This repository is read-only.

It is not the canonical architecture.

---

Canonical Rule

The authoritative architecture for GÖ.AI exists in the root repository.

Always follow:

START_HERE.md

/architecture

/reference

/specifications

If any implementation within this legacy repository conflicts with the canonical architecture, the canonical architecture always takes precedence.

---

Purpose of this Repository

This repository exists to preserve:

- Engineering decisions
- Working implementations
- Validation logic
- State management
- Trip processing
- Testing workflows
- Conversation design
- Administrative tooling
- Audit logging
- API testing
- Human engineering experience

Future engineers should learn from this repository—not copy it blindly.

---

Engineering Philosophy

Think of this repository as an engineering archive.

Its purpose is to answer questions such as:

- How was this originally implemented?
- What edge cases were discovered?
- What validation logic already exists?
- What business rules were previously identified?
- What engineering patterns proved successful?
- What should be modernized for SENTINEL™?

This repository represents institutional knowledge.

---

Primary Engineering References

The following branches contain the most valuable engineering work.

Core Platform

- tripschema-Madison
- validatetrip-Madison
- conversationflow-Madison
- statemachine-Madison
- processtrip-Madison
- executetrip-Madison
- tripvalidation-Madison

These branches contain the original implementation of the trip lifecycle and should be referenced whenever implementing:

- Trip Objects
- Trip validation
- State transitions
- Processing pipelines
- Execution logic

---

Human Workflow

- humanreview-Madison
- rolespermissions-Madison
- adminSurfaces.js
- uxmessaging-Madison

These branches contain engineering work related to:

- Human-in-the-loop
- Administrative interfaces
- Role-based permissions
- User messaging
- Review workflows

Reference these before implementing administrative functionality.

---

Platform Reliability

- failurehandling-Madison
- AuditLogAdditions-Lee

These branches provide implementation ideas for:

- Failure recovery
- Error handling
- Structured logging
- Audit history
- Operational transparency

These concepts should be adapted into the canonical Security Architecture.

---

AI Implementation

- AI-Concierge-Madison

This branch represents the original AI interaction model.

Although the architecture has since evolved into SENTINEL™, useful conversational patterns, prompt handling, and workflow ideas may still be applicable.

Do not reproduce the original architecture.

Reuse only implementation concepts compatible with SENTINEL™.

---

Testing

- rundrytest-Madison
- demotrip-Madison

These branches contain valuable engineering assets including:

- Five demonstration trips
- Validation scenarios
- Workflow testing
- Operational edge cases

Whenever implementing new backend modules, these demonstrations should be used as regression test scenarios whenever practical.

---

API Development

- postmanSetup-Lee

This branch contains:

- Postman collections
- API testing
- Request examples
- Endpoint validation

These resources should be referenced during API implementation and testing.

---

Integration Branch

- Development

This branch represents the most integrated version of the original prototype.

Use it to understand how the individual engineering efforts were combined.

---

Instructions for Engineers

Before implementing a backend module:

1. Read the canonical architecture.
2. Identify the corresponding implementation within this repository.
3. Study the engineering decisions.
4. Reuse proven business logic where appropriate.
5. Adapt the implementation to the canonical architecture.
6. Do not introduce legacy architectural decisions that conflict with SENTINEL™.

---

Instructions for AI Coding Assistants (Codex)

When implementing new functionality:

1. Read "START_HERE.md".
2. Read the canonical architecture documents.
3. Search this repository for similar implementations.
4. Identify reusable:
   - Business logic
   - Validation rules
   - State machines
   - Tests
   - API patterns
   - Error handling
   - Administrative workflows
5. Modernize the implementation for the current architecture.
6. Do not copy legacy code without evaluating its compatibility with the canonical architecture.
7. If conflicts exist, follow the canonical architecture.

Think of this repository as a source of engineering experience—not engineering authority.

---

Engineering Goal

The objective is to preserve the best engineering work produced during the original MVP effort while implementing the next generation of the platform around the SENTINEL™ architecture.

This repository provides:

- Proven implementation ideas
- Engineering knowledge
- Historical context
- Validation scenarios
- Lessons learned

The canonical architecture provides:

- System design
- Long-term direction
- Engineering standards
- Security model
- Operational philosophy

Together they provide everything necessary to build the GÖ.AI MVP.

---

«Study the past.

Build the future.

Reuse wisdom—not limitations.»
