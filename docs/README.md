# Beaver AI documentation

This documentation is the project's source of truth. It must evolve with the
implemented system; roadmap documents describe intent, while architecture and
development documents describe accepted direction and current reality.

## Product

- [Product definition](product/product-definition.md) — vision, principles,
  users, outcomes, and core experience.
- [Feature scope](product/feature-scope.md) — capability boundaries,
  non-goals, and release guardrails.

## Architecture

- [System architecture](architecture/system-architecture.md) — system context,
  modules, boundaries, and technical direction.
- [Domain model](architecture/domain-model.md) — shared language, entities, and
  educational relationships.
- [Data architecture](architecture/data-architecture.md) — ownership,
  lifecycle, provenance, and consistency.
- [AI architecture](architecture/ai-architecture.md) — AI boundaries,
  orchestration, evaluation, and safety.
- [Design direction](architecture/design-direction.md) — experience and visual
  system foundations.
- [Identity and access](architecture/identity-and-access.md) — implemented
  authentication, account, sharing, and authorization boundaries.

## Delivery and development

- [Roadmap](roadmap/roadmap.md) — all phases, purposes, deliverables, and
  dependencies.
- [Engineering handbook](development/engineering-handbook.md) — setup
  expectations, organization, coding conventions, and workflow.
- [Testing strategy](development/testing-strategy.md) — risk-based quality
  strategy and test layers.
- [Documentation conventions](development/documentation-conventions.md) —
  ownership, status language, and update requirements.

## Safety and decisions

- [Security, privacy, and student safety](safety/security-privacy-and-safety.md)
- [Phase 1 threat model](safety/phase-1-threat-model.md)
- [Architecture decision records](decisions/README.md)
- [Phase 0 acceptance review](phase-0-acceptance.md)
- [Phase 1 acceptance review](phase-1-acceptance.md)

## Reading order for a new contributor

1. Product definition
2. Feature scope
3. Roadmap
4. System and identity/access architecture
5. Domain model and data architecture
6. AI architecture and safety
7. Engineering and testing practices
8. Accepted architecture decision records

## Document authority

When documents conflict, current implemented behavior and verified tests reveal
what exists, but the conflict is a defect and must be resolved. Accepted
architecture decision records explain why durable decisions were made. The
newest accepted decision supersedes older conflicting decisions and should link
to them explicitly.
