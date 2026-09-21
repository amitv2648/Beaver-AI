# ADR-0003: Separate authoritative data from AI proposals

- Status: Accepted
- Date: 2026-09-20
- Owners: Product, education, safety, and engineering leadership
- Supersedes: None

## Context

Beaver AI will use probabilistic AI for tutoring, explanation, extraction, and
recommendation. Model output can be incorrect, inconsistent, manipulated by
untrusted content, or changed by a provider update. Treating it like validated
application data could corrupt curriculum, learner profiles, mastery,
permissions, scores, or rewards and obscure who or what made a decision.

## Decision

AI-generated output is conversational content, an extraction with provenance,
or a proposal. It is not authoritative application state by default.

- Models operate through an application-owned orchestration and policy
  boundary.
- Authoritative writes use application workflows with authorization, validation,
  invariants, and provenance.
- Each allowed promotion from proposal to authoritative data defines its
  deterministic checks and human-review threshold.
- Permissions, consent, published curriculum, final high-stakes scores,
  mastery truth, and reward balances are prohibited direct model writes.
- Derived AI information records source, model/prompt/policy version,
  confidence or limitations, and disposition where relevant.
- Model tool requests receive an explicit allowlist and independent
  authorization.

## Considered options

- **Allow model writes with prompt instructions:** low implementation friction,
  but prompts are not an authorization or integrity boundary.
- **Never persist AI-derived information:** reduces corruption risk but prevents
  useful reviewed recommendations, feedback, and extraction workflows.
- **Treat provider moderation as the whole boundary:** delegates product policy
  and does not protect domain invariants or educational validity.

## Consequences

### Positive

- Clear accountability, correction, audit, and rollback.
- Provider/model changes do not silently redefine educational truth.
- AI can add value without bypassing domain and safety controls.

### Negative and risks

- Promotion workflows and provenance add implementation effort.
- Product language must communicate uncertainty without overwhelming students.
- Human review can become a bottleneck; thresholds must match risk.

## Revisit when

- A narrowly scoped AI operation has evidence strong enough to change its review
  requirements. Even then, authorization and application invariants remain
  outside the model.

## Related

- [AI architecture](../architecture/ai-architecture.md)
- [Data architecture](../architecture/data-architecture.md)
- [Domain model](../architecture/domain-model.md)
