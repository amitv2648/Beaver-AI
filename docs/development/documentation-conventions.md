# Documentation conventions

## Principle

Documentation is a maintained product artifact. It must describe what the
project actually does and clearly distinguish current reality, accepted
direction, recommendations, and future intent.

## Canonical locations

- `README.md`: project entry point and current phase.
- `CONTRIBUTING.md`: contributor entry point and workflow.
- `docs/product/`: vision, users, outcomes, principles, and scope.
- `docs/architecture/`: current/target system, domain, data, AI, integration,
  and design direction.
- `docs/roadmap/`: planned delivery sequence and dependencies.
- `docs/development/`: setup, engineering, testing, and documentation practice.
- `docs/safety/`: security, privacy, compliance, and student safety.
- `docs/decisions/`: durable architecture decision records.

When user/operator guides become necessary, create a clearly owned section
rather than mixing them into architecture documents.

## Status language

Use these meanings consistently:

- **Implemented/current:** verified behavior exists in the repository/system.
- **Accepted:** a decision governs implementation, even if work is upcoming.
- **Recommended:** leading option still requiring a decision.
- **Proposed:** open for review and not binding.
- **Deferred:** intentionally postponed until named evidence or a phase exists.
- **Future/intended:** product vision, not a current capability.
- **Deprecated/superseded:** retained for history but no longer governs.

Never use present tense for an unimplemented capability without a clear target
or future qualifier.

## Writing standards

- Start with purpose, status, and audience when ambiguity is possible.
- Prefer concrete language, short sections, and terms from the domain model.
- Define acronyms and avoid unnecessary jargon.
- Use relative links for repository documents and stable headings.
- Diagrams clarify boundaries or flows; nearby prose remains authoritative.
- Examples must not include real personal data, credentials, or unsafe defaults.
- Record assumptions and unresolved decisions rather than hiding uncertainty.
- Link to a canonical explanation instead of copying text that will drift.

## Update triggers

The same change must update relevant documentation when it alters:

- product behavior, scope, user roles, terminology, or phase boundaries;
- module ownership, APIs, integrations, or deployment topology;
- domain entities, data classification, retention, or migrations;
- AI provider/model behavior, prompts, tools, policy, or evaluation;
- security, privacy, safety, consent, or authorization behavior;
- setup commands, dependencies, supported versions, or workflow;
- tests, quality gates, operations, or incident handling; or
- an assumption governed by an accepted decision.

If no documentation changes are needed for a material change, the review should
be able to explain why.

## Decision records

Use the process and template in [the ADR index](../decisions/README.md). An ADR
captures why a durable decision was made; architecture documents summarize the
resulting current direction. When an ADR changes direction, update both.

## Review checklist

- Does the document match repository behavior and accepted decisions?
- Are current and future capabilities unmistakable?
- Do terms and phase numbers agree across documents?
- Are security, privacy, accessibility, and failure implications covered?
- Do links resolve and diagrams match their explanatory text?
- Is copied or stale guidance removed?
- Are owner, trigger, or phase named for unresolved work?

## Maintenance ownership

The author of a behavioral or architectural change owns its documentation in
that change. Product and engineering leadership jointly own periodic
cross-document review. Assign named owners and review cadence when a team and
delivery process exist; Phase 0 does not invent people or dates.
