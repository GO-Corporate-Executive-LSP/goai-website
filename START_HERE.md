START_HERE.md

GÖ.AI Engineering Initialization Guide

Read this document before writing, modifying, refactoring, or reviewing any code.

---

Welcome

Welcome to the GÖ.AI engineering repository.

This repository contains the canonical architecture, engineering specifications, backend modules, research, and implementation roadmap for the GÖ.AI Movement Intelligence Platform.

Before making any changes, you are expected to understand how the system is designed.

Do not begin coding immediately.

Read first.

Implement second.

---

Project Mission

GÖ.AI is building a new category of software centered on Movement Intelligence.

The platform is designed to preserve mission continuity rather than simply automate travel bookings.

The core architectural philosophy is:

«Travel is a chain of dependencies.

SENTINEL™ understands the chain.

ETAS™ executes the plan.»

Every engineering decision should reinforce this philosophy.

---

Repository Structure

Before writing code, read and understand the contents of the following directories.

/architecture
/reference
/data_model
/functions
/providers
/api_specifications
/security
/handoff
/research
/specifications
/sprint-1
/trip-intake

These directories collectively define the platform.

No single document should be interpreted in isolation.

---

Canonical Documents

The following architecture documents are considered the primary source of truth.

- System_Architecture.md
- Data_Model.md
- Security_Architecture.md
- SENTINEL_Architecture.md
- ETAS_Architecture.md
- Movement_Graph.md
- Identity_Access.md
- Organization_Model.md
- Engineering_Reference_Manual.md

If implementation differs from these documents, the architecture should be treated as authoritative unless otherwise directed.

---

Engineering Philosophy

The platform is built upon the following principles:

- Canonical Objects are the source of truth.
- The Movement Graph™ models operational reality.
- SENTINEL™ performs operational reasoning.
- ETAS™ performs commercial execution.
- Commercial providers remain replaceable.
- Intelligence always precedes execution.
- Mission continuity is the primary optimization objective.
- Security is built into every component.
- Organization boundaries must always be respected.

---

Do Not Change Without Approval

Do not:

- Rename folders.
- Rename files.
- Create duplicate systems.
- Introduce competing architectures.
- Replace Canonical Objects.
- Bypass the Movement Graph™.
- Merge ETAS™ and SENTINEL™ responsibilities.
- Hard-code provider-specific business logic.
- Introduce new terminology without approval.

If architectural changes appear necessary:

1. Stop.
2. Explain the reason.
3. Request approval before proceeding.

---

Backend Implementation Standards

When implementing backend modules:

- Follow the documented module responsibilities.
- Keep modules focused on a single responsibility.
- Respect existing folder organization.
- Write production-quality code.
- Add meaningful comments where appropriate.
- Avoid placeholder implementations unless requested.
- Build reusable components.
- Preserve provider independence.

---

Code Quality Standards

Every contribution should be:

- Modular
- Readable
- Testable
- Secure
- Explainable
- Organization-aware
- Maintainable
- Well documented

Prefer simplicity over cleverness.

---

Implementation Workflow

Every feature should follow this sequence:

Read Architecture

↓

Understand Canonical Objects

↓

Review Backend Module

↓

Implement Code

↓

Write Tests

↓

Validate Against Specification

↓

Commit Changes

Implementation should always follow architecture—not the other way around.

---

AI Coding Assistant Responsibilities

If you are an AI coding assistant (including Codex):

- Read the repository before generating code.
- Treat the Markdown architecture documents as canonical specifications.
- Implement features according to the documented architecture.
- Do not redesign the system.
- Do not invent missing architecture.
- Ask for clarification when specifications conflict.
- Preserve existing terminology, folder structure, and backend module organization.

Your role is to implement the platform—not reinterpret it.

---

Long-Term Vision

The architecture has been intentionally designed to support future expansion into:

- Enterprise Mobility
- Executive Protection
- Government Operations
- Humanitarian Logistics
- Crisis Response
- Autonomous Transportation
- Advanced Geospatial Intelligence

New capabilities should extend the architecture rather than replace it.

---

Success Criteria

Success is not measured by:

- Lines of code written
- Features added
- APIs integrated

Success is measured by one question:

«Does this implementation improve the platform's ability to preserve mission continuity?»

If the answer is yes, it aligns with the architecture.

---

Final Instruction

Before making any change to this repository:

1. Read.
2. Understand.
3. Preserve the architecture.
4. Implement with discipline.

The architecture already exists.

Your responsibility is to build it faithfully.

---

«Mission before reservations.

Repository Documentation Standard
All documentation must be written in GitHub Flavored Markdown (GFM). Diagrams must use fenced text code blocks. Code examples must use language-specific fenced code blocks (e.g., js, json, bash). Documentation should require no formatting changes before being committed to the repository.

Intelligence before execution.

Architecture before implementation.

Movement Intelligence before everything else.»
