# Data architecture

## Goals

Beaver AI's data architecture must make educational state trustworthy,
traceable, private, and deletable without adding specialized infrastructure
before it is needed.

## Data categories

| Category          | Examples                                                                                             | Treatment                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Public/reference  | Published public curriculum metadata                                                                 | Integrity and versioning                                   |
| Internal          | Content drafts, configuration, aggregate operations metrics                                          | Authorized access                                          |
| Personal          | Name, account contact, goals, learning history                                                       | Purpose limitation and least privilege                     |
| Sensitive student | Age/birth context, accommodations, minor/guardian relationships, tutor transcripts, work submissions | Strong minimization, restricted access, explicit retention |
| Security secrets  | Password verifiers, session tokens, keys                                                             | Never logged; dedicated secret/credential handling         |

Legal classifications vary by jurisdiction. Before collecting a field, record
its purpose, owner, sensitivity, retention, processors, and deletion behavior.
“Useful later” is not a valid collection purpose.

## Systems of record and derived data

### Authoritative data

Authoritative state is accepted through validated application use cases:
identity and grants, reviewed curriculum/content versions, submitted responses,
learning evidence, consent records, and reward ledger entries.

### Derived data

Mastery estimates, recommendations, review timing, misconception hypotheses,
embeddings, search indexes, caches, analytics projections, and model summaries
are derived. They must retain provenance and be reproducible, invalidatable, or
clearly marked as non-reproducible when a provider/model no longer exists.

AI output is non-authoritative until an explicit workflow validates and
promotes a permitted result.

## Storage direction

- Use a relational database as the initial transactional system of record. It
  supports constraints, transactions, version references, and the graph
  relationships known so far.
- Store uploaded files and large media in private object storage with metadata
  and authorization in the application.
- Model curriculum graph edges relationally first. Adopt a graph store only
  after representative traversal profiling demonstrates a material need.
- Add search, vector retrieval, caching, warehouse, or streaming systems only
  for defined use cases. Each remains a projection or index, not an accidental
  source of truth.

PostgreSQL is now selected as the system of record and Drizzle owns versioned
SQL migrations (ADR-0005). Phase 1 creates only `accounts`,
`auth_identities`, `sharing_invitations`, `sharing_connections`, and
`account_audit_events`; future educational schemas remain unimplemented.

## Identity and isolation

- Use opaque, non-semantic identifiers; do not encode names, ages, or roles.
- Separate authentication credentials from learner-domain records.
- Parent and educator relationships are explicit, student-owned sharing
  connections. Authority is never inferred from shared contact information or
  a global role.
- Every student-scoped query and mutation requires server-side authorization
  and an explicit scope. The current authorization service checks owner,
  recipient, active connection state, and required permission.
- If organizations are introduced, tenant isolation must be designed and tested
  rather than assumed from an organization ID column.
- Use anonymized or generated fixtures outside production. Production student
  records must not be copied into local development or routine tests.

## Versioning and provenance

Published curriculum definitions, content resources, assessment items, scoring
logic, safety policies, and inference algorithms need stable versions when
their interpretation affects history.

A derived educational decision should be able to answer:

- what input evidence and definition versions were used;
- which deterministic rule, algorithm, prompt, model, or policy version ran;
- when it ran and under which relevant conditions;
- what confidence or uncertainty was represented; and
- whether a human or automated workflow accepted, rejected, or superseded it.

Do not store hidden chain-of-thought. Store concise rationale, cited evidence,
decision factors, and observable execution metadata.

## Write and event patterns

- Use transactions for invariants within one system of record.
- Prefer append-oriented evidence, consent, audit, and ledger histories over
  destructive in-place rewriting.
- If publishing domain events outside a transaction boundary, use an outbox or
  equivalent atomic delivery pattern.
- Consumers must be idempotent when delivery can repeat.
- Events carry stable identifiers, event time, schema version, and minimum
  necessary data; they do not broadcast sensitive records by default.
- Corrections should preserve an audit trail while ensuring inaccurate data is
  no longer treated as current.

## Lifecycle and deletion

Before launch, each data category needs a retention schedule tied to product,
security, legal, and student-safety requirements. The system must support:

- access and correction workflows;
- account closure and deletion requests;
- deletion or de-identification across transactional data, files, derived
  indexes, backups, analytics, and processors;
- legally required holds where applicable and transparently governed;
- short-lived logs with redaction; and
- age/consent transitions without silently expanding use.

Exact durations are deliberately deferred until launch jurisdictions, age band,
and legal basis are chosen. They must be set before the relevant data is
collected in production.

## Analytics and experimentation

- Prefer aggregated or de-identified measures.
- Separate product analytics identity from direct student identity where
  feasible.
- Prohibit advertising profiles and sale of student data.
- Review experiments for educational validity, fairness, consent, and risk.
- Do not optimize only for engagement; learning, safety, accessibility, and
  well-being are guardrail metrics.
- Limit analyst access and audit sensitive queries.

## Backup and recovery

The implementation phase must define recovery-point and recovery-time
objectives from product impact, encrypt backups, restrict restore access, test
restores, and include backups in retention/deletion analysis. A backup that
cannot be restored is not a recovery control.

## Data-model review checklist

For every new persisted field or event:

1. Who owns it, and is it authoritative or derived?
2. Why is it required and for whom?
3. What is its classification and authorization scope?
4. What source and version explain it?
5. How is it corrected, expired, exported, and deleted?
6. Does an external processor receive it?
7. Could a less sensitive or aggregated value meet the need?
