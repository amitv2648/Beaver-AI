# Testing strategy

## Quality objective

Testing provides evidence that Beaver AI supports learning reliably and safely.
The strategy is risk-based: the highest confidence is required for access
control, student data, educational evidence, safety policy, scoring, mastery,
rewards, and AI actions.

Phase 1 uses Vitest for deterministic domain and integration-boundary tests.
Current suites cover Firebase browser operations and persistence configuration,
protected request rejection, Beaver account synchronization and duplicate
prevention, updates/deletion, invitation acceptance, scoped authorization, and
revocation. Firebase and PostgreSQL are represented by controlled test
boundaries; live environment smoke tests remain required before deployment.

## Test layers

### Static checks

Formatting, strict type checking, linting, dependency/license checks, secret
scanning, documentation links, and schema/contract validation provide fast
feedback. They do not replace runtime tests.

### Unit and property tests

Use for domain rules, state transitions, parsers, scoring, prerequisite logic,
mastery calculations, ledgers, and policy predicates. Property-based tests are
valuable for invariants such as “a balance equals valid ledger entries” or
“unauthorized relationships never grant access.”

### Integration and contract tests

Exercise real database constraints/migrations, module contracts, jobs, object
storage, model adapters, and external-provider boundaries. Provider simulations
must model timeouts, malformed responses, retries, rate limits, and partial
failure—not only happy responses.

### End-to-end tests

Cover a small set of critical user journeys across deployed boundaries:
account security, data controls, learning work preservation, assessment
submission, and safety/reporting flows. Avoid duplicating every UI variation at
this expensive layer.

### Exploratory and specialist review

Use human review for usability, educational validity, accessibility, safety,
content quality, and adversarial behavior. Automated checks cannot establish
these properties alone.

## Domain-specific testing

### Authorization and privacy

- Deny-by-default and object-level checks for every role/relationship.
- Cross-learner and cross-tenant isolation tests.
- Recovery, revocation, consent change, deletion, and export flows.
- Log/telemetry assertions that sensitive values are absent or redacted.
- Migration and backup/restore behavior for protected records.

### Curriculum, content, and assessment

- Graph integrity, cycle policy, orphan detection, and version references.
- Publication state and reviewer permission transitions.
- Accessibility and source/licensing metadata requirements.
- Item scoring against reviewed examples and edge cases.
- Historical evidence remains bound to exact published versions.

### Mastery and personalization

- Golden cases and invariants for estimates, uncertainty, recency, and review.
- Deterministic replay by algorithm/policy version where promised.
- Cold-start, sparse, conflicting, stale, and corrected evidence.
- Explanation fidelity: displayed rationale matches actual factors.
- Fairness and outcome analysis across supported populations.
- Safe baseline and opt-out behavior.

### AI features

Follow the [AI evaluation strategy](../architecture/ai-architecture.md):
versioned representative and adversarial suites, groundedness, educational
quality, safety, privacy leakage, prompt injection, tool authorization, schema
failure, model/provider change, latency, cost, and fallback. AI outputs are
probabilistic; flaky assertions should be replaced with bounded evaluations and
release thresholds, not ignored.

### Rewards and social

- Ledger conservation, idempotency, concurrency, and anti-abuse rules.
- No reward for failed/replayed learning events.
- Privacy defaults, audience boundaries, block/report/moderation workflows.
- Ranking fairness, tie behavior, season transitions, and safe display.

## Accessibility and compatibility

Each supported UI needs automated accessibility checks plus keyboard,
screen-reader, zoom/reflow, contrast, reduced-motion, and error-recovery review.
Define and maintain a supported browser/device matrix when the client stack is
selected. Test slow networks, interrupted requests, and preserved user work.

## Performance, resilience, and security

Set measurable service objectives before load testing. Test representative
critical paths, not arbitrary request counts. Include concurrency, queue
backlog, provider degradation, timeout/retry behavior, circuit breaking,
resource limits, and recovery.

Security assurance combines automated scanning with threat-model-derived tests,
code review, dependency hygiene, configuration review, and independent testing
before material launches. Scanners alone are not a security program.

## Test data

- Use factories/builders with generated identities and explicit scenario data.
- Never use production student data in routine development or CI.
- Keep sensitive edge cases synthetic and clearly labeled.
- Make time, random seeds, model stubs, and external responses controllable.
- Clean up or isolate state so tests can run independently and in parallel.

## Continuous integration expectations

When code begins, every change should run the fastest relevant checks first and
gate merging on required checks. A mature pipeline should include formatting,
types, lint, unit, integration, migration, contract, selected end-to-end,
dependency/security, secret, and documentation checks. Quarantined tests need
an owner, reason, and removal deadline.

## Release evidence

A phase release records:

- tests and evaluation suites run, environment, and versions;
- pass/fail thresholds and known limitations;
- unresolved defects and accepted risk owners;
- accessibility, privacy, security, safety, and educational reviews;
- rollout monitoring and rollback criteria.

Coverage percentages may expose gaps but are not release goals by themselves.
