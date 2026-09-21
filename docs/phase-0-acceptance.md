# Phase 0 acceptance review

- Status: Complete
- Review date: 2026-09-20
- Scope: Documentation, Product Definition & Architecture

## Repository finding

Phase 0 began from a fresh Git repository with no commits or tracked project
files. No previous Beaver AI implementation, dependency, database, API, or
architecture was reused or assumed.

## Acceptance criteria

- [x] Product vision and defining promise are documented.
- [x] Product principles, target users, outcomes, and core experience are
      documented.
- [x] Long-term capabilities, boundaries, and explicit Phase 0 non-goals are
      documented.
- [x] The Phase 0–15 roadmap states the purpose, outcomes, dependencies, and
      boundaries of every phase.
- [x] Current documentation scope and future implementation scope are
      unambiguous.
- [x] System context, major functional modules, integration boundaries, and
      technical architecture direction are documented.
- [x] The conceptual domain model distinguishes curriculum, content, evidence,
      mastery, recommendations, tutoring, and rewards.
- [x] Data ownership, classification, provenance, lifecycle, storage direction,
      and deletion expectations are documented.
- [x] AI orchestration, authority, context, safety, tool, evaluation, and
      failure principles are documented.
- [x] Experience, visual identity, responsive, accessibility, and future design
      system direction are documented.
- [x] Security, privacy, student safety, authentication/authorization, threat,
      incident, and future compliance principles are documented.
- [x] Development setup expectations, organization, coding conventions,
      dependency/configuration practices, workflow, and definition of done are
      documented.
- [x] A risk-based testing strategy covers static, unit, integration,
      end-to-end, specialist, accessibility, AI, security, resilience, and release
      evidence.
- [x] Documentation locations, status language, update triggers, review, and
      ownership conventions are established.
- [x] The ADR process is established and foundational architectural decisions
      are recorded.
- [x] The repository is organized around canonical documentation areas with a
      root entry point and contribution guide.
- [x] No Phase 1+ user-facing functionality, runtime scaffold, dependency, or
      placeholder implementation was created.

## Foundational decisions

1. Documentation evolves with implementation and conflicts are treated as
   defects.
2. The initial target is a web-first, API-backed modular monolith with explicit
   domain boundaries; product/framework selection is deferred to an evaluated
   Phase 1 decision.
3. A relational system of record is the default direction; specialized graph,
   vector, search, stream, or analytics stores require demonstrated needs.
4. Curriculum is a versioned graph with curated hierarchies, not one rigid
   educational tree.
5. Learning evidence is distinct from mastery estimates, and course completion
   is distinct from both.
6. AI works through a governed orchestration boundary and produces
   non-authoritative content or proposals unless an application workflow
   validates and promotes a permitted result.
7. Safety, privacy, accessibility, security, observability, and tests enter
   with each capability rather than being postponed to the production phase.

## Assumptions

- The initial product is web-first but responsive across supported device
  sizes.
- Students may include minors, so the stricter safety and privacy posture is the
  baseline.
- A single repository and modular monolith are appropriate until evidence
  supports additional deployment or repository complexity.
- Phase numbers communicate dependency and maturity, not committed dates.
- Phase 15 may launch a deliberately rebaselined subset, but omitted
  capabilities cannot be represented as shipped.

## Human decisions intentionally unresolved

These choices cannot be responsibly inferred from architecture alone and must
be made by accountable product/business owners before the named work:

- initial learner age band, launch jurisdiction, and direct-to-family versus
  institutional model (before production account/onboarding design);
- guardian, educator, organization, and consent scope (before Phases 1–2);
- first subject, curriculum/framework, and content sourcing/licensing strategy
  (before Phases 3–4);
- legal/privacy basis, retention schedule, required notices, and human safety
  operations (before production data collection and AI release);
- repository/software licensing and distribution posture (before external
  distribution or contribution);
- product technology stack and vendors, selected through documented evaluation
  when implementation requirements exist.

These are sequenced decisions, not gaps requiring Phase 0 placeholder code.

## Result

Phase 0 completion criteria are satisfied. The next authorized implementation
phase is Phase 1, but it should not begin until its launch-audience entry
decisions are resolved and its stack/security decisions are recorded.
