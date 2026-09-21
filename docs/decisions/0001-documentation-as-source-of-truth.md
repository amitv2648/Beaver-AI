# ADR-0001: Documentation evolves with implementation

- Status: Accepted
- Date: 2026-09-20
- Owners: Product and engineering leadership
- Supersedes: None

## Context

Beaver AI will span educational content, learner data, inference, AI, safety,
and many delivery phases. If design documents remain frozen while
implementation changes, future decisions will rely on false assumptions.
Conversely, code alone cannot preserve product intent, safety boundaries, or the
reason behind architectural choices.

## Decision

Treat maintained documentation as part of every relevant product and
engineering change.

- Architecture and development documents describe accepted direction and
  verified current behavior.
- Roadmap documents describe intent and never imply a feature exists.
- Durable decisions are captured in ADRs.
- A change to behavior, data, architecture, dependencies, workflow, security,
  safety, or material assumptions updates related documentation in the same
  change.
- A discovered conflict between documentation and implementation is a defect;
  the team resolves both to one verified truth.

## Considered options

- **Phase-only documentation:** fast initially, but becomes misleading after the
  first implementation change.
- **Code and tests only:** strong for mechanics, inadequate for product intent,
  risk decisions, and deferred constraints.
- **Separate later documentation project:** creates lag and unclear ownership.

## Consequences

### Positive

- Future phases can understand current reality and decision history.
- Reviews include product, safety, and operational effects.
- Outdated assumptions are easier to identify and retire.

### Negative and risks

- Each material change carries documentation work.
- Duplicate explanations can drift; canonical locations and links are required.
- Documentation can still be wrong, so tests and verified behavior remain
  necessary evidence.

## Revisit when

- Repository scale or multiple teams require generated references, ownership
  automation, or a dedicated documentation platform.

## Related

- [Documentation conventions](../development/documentation-conventions.md)
- [Documentation index](../README.md)
