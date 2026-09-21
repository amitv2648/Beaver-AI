# ADR-0004: Model curriculum as a versioned graph with curated hierarchies

- Status: Accepted
- Date: 2026-09-20
- Owners: Product, education, and engineering leadership
- Supersedes: None

## Context

A simple Education Level → Subject → Course → Unit → Lesson → Topic → Concept →
Skill → Objective → Assessment hierarchy mixes classification, navigation,
instructional packaging, learning meaning, and evidence. Real curricula reuse
concepts and skills, map objectives to multiple standards, and contain
prerequisites that cross course/unit boundaries.

A completely unstructured graph, however, would make authoring, navigation,
validation, and coherent course sequencing unnecessarily difficult.

## Decision

Represent the curriculum conceptually as a versioned directed graph with
curated hierarchies:

- frameworks and subjects contextualize courses;
- courses may organize modules for navigation and intended sequence;
- learning objectives connect to concepts and observable skills;
- qualified directed edges represent prerequisites and other educational
  relationships;
- content resources and assessment items map many-to-many to objectives;
- grade/education level, topic, difficulty, audience, and framework are
  classifications where appropriate, not mandatory tree levels;
- published definitions are versioned, and historical evidence points to the
  exact versions used.

Use relational storage initially. Graph-specific infrastructure requires
measured traversal or operational evidence and a separate decision.

## Considered options

- **One fixed hierarchy:** easy navigation but distorts reuse and prerequisite
  relationships and ties mastery to content packaging.
- **Pure property graph with no curated hierarchy:** flexible but makes initial
  governance, course navigation, and validation harder.
- **Separate duplicate trees per curriculum:** simple imports but fragments
  shared concepts and cross-framework mapping.

## Consequences

### Positive

- Mastery can attach to stable learning meaning rather than lesson completion.
- Multiple courses and frameworks can reuse and map concepts/objectives.
- Prerequisite reasoning and historical interpretation remain possible.
- Course navigation stays intentional.

### Negative and risks

- Authoring and graph validation require clear relation semantics.
- Versioning and mappings add complexity.
- Cross-framework equivalence can be overstated; mappings need provenance and
  review.

## Revisit when

- Phase 3 representative curricula expose missing core concepts or relation
  types.
- Traversal profiling shows relational storage cannot meet defined needs.
- Versioning requirements conflict with authoring usability and need refinement.

## Related

- [Domain model](../architecture/domain-model.md)
- [Data architecture](../architecture/data-architecture.md)
- [Roadmap](../roadmap/roadmap.md)
