# Architecture decision records

Architecture decision records (ADRs) preserve the context and consequences of
durable project choices. They are immutable history: amend minor errors, but
supersede a decision with a new ADR when direction changes.

## When to write an ADR

Create one for a choice that is cross-cutting, security/privacy relevant,
expensive to reverse, establishes a long-lived dependency, changes module/data
ownership, or is likely to be revisited without its original context.

Do not use ADRs for routine local code choices or speculative options with no
decision.

## Statuses

- **Proposed:** under review and not binding.
- **Accepted:** governs current work.
- **Deprecated:** still present but should not be used for new work.
- **Superseded by ADR-NNNN:** replaced; retained for history.
- **Rejected:** considered but not adopted.

## Process

1. Copy the template below into the next zero-padded number and descriptive
   lowercase filename.
2. Describe the problem, constraints, considered options, decision, and
   consequences.
3. Link related decisions and documentation.
4. Review with affected product, engineering, security/privacy, design, or
   education owners as appropriate.
5. Mark accepted only when accountable owners agree.
6. Update architecture and development docs to reflect the accepted outcome.

## Template

```markdown
# ADR-NNNN: Decision title

- Status: Proposed
- Date: YYYY-MM-DD
- Owners: Role(s), until named people exist
- Supersedes: None

## Context

What problem, evidence, constraints, and forces require a decision?

## Decision

What is being chosen? State boundaries and exceptions.

## Considered options

- Option and key trade-offs

## Consequences

### Positive

- Resulting benefit

### Negative and risks

- Cost or risk and mitigation

## Revisit when

- Evidence that should trigger reconsideration

## Related

- Links to decisions and documentation
```

## Decision log

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-documentation-as-source-of-truth.md) | Accepted | Documentation evolves with implementation |
| [0002](0002-evolutionary-modular-monolith.md) | Accepted | Begin with an evolutionary modular monolith |
| [0003](0003-authoritative-data-and-ai-proposals.md) | Accepted | Separate authoritative data from AI proposals |
| [0004](0004-versioned-curriculum-graph.md) | Accepted | Model curriculum as a versioned graph with curated hierarchies |

Technology products and application frameworks have deliberately not been
selected. The Phase 1 stack choice requires its own ADR after an evidence-based
evaluation.
