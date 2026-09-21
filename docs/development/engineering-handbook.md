# Engineering handbook

## Current repository state

Phase 1 implements a strict TypeScript Next.js modular monolith. Firebase
Authentication proves identity; PostgreSQL stores Beaver AI accounts, identity
links, sharing relationships, and audit events. Drizzle manages migrations,
Zod validates API input, and Vitest, ESLint, Prettier, and TypeScript provide
quality gates.

## Development setup

Use Node.js 22 or newer and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run dev
```

Fill `.env.local` with PostgreSQL, Firebase Web App, and Firebase Admin
configuration before migration/runtime use. Use Application Default Credentials
or the Firebase Auth emulator; never place a service-account JSON file in this
repository.

Available commands:

- `npm run dev`, `build`, and `start` operate the Next.js application.
- `npm run db:generate`, `db:migrate`, and `db:studio` manage PostgreSQL.
- `npm run format:check`, `lint`, `typecheck`, `test`, and `test:coverage`
  provide focused checks.
- `npm run check` runs the complete local quality gate.

## Engineering values

- Correctness, safety, privacy, and accessibility over delivery theater.
- Simple designs for known use cases over speculative infrastructure.
- Explicit module ownership and contracts over shared mutable internals.
- Evidence and measurement over assumed scaling needs.
- Small, reviewable, reversible changes over large hidden rewrites.
- Documentation and tests updated with behavior.

## Intended project organization

The single application is organized as:

- `src/app`: Next.js pages and protected API interfaces;
- `src/components`: client presentation and interaction;
- `src/modules`: framework-independent business models, ports, and services;
- `src/infrastructure`: PostgreSQL and Firebase adapters;
- `src/server`: request authentication and HTTP mapping;
- `drizzle`: reviewed SQL migration history; and
- `docs`: maintained product and architecture source of truth.

Identity and Access is the first business-capability module. Future modules use
its public authorization service rather than its tables. Avoid a global `utils`
dumping ground, cross-module database access, and packages that only re-export
unrelated code.

## Coding conventions

Formatting and lint rules are automated. The following conventions apply:

- Use domain language defined in the
  [domain model](../architecture/domain-model.md).
- Prefer clear, intention-revealing names and small cohesive units.
- Keep domain logic free of transport, provider, and UI framework details where
  practical.
- Make illegal or ambiguous states harder to represent through types,
  constraints, and explicit state transitions.
- Validate at trust boundaries; static types do not validate network, file,
  database, or model input.
- Treat errors as part of contracts. Preserve useful internal diagnostics while
  returning safe user-facing messages.
- Pass time, randomness, and external effects through controllable boundaries
  when behavior must be deterministic in tests.
- Avoid logging secrets, direct identifiers, student work, tutor messages, or
  sensitive payloads by default.
- Comment why a non-obvious decision exists, not what clear code already says.
- Remove dead code rather than leaving commented-out implementation.

TypeScript strict checking is enabled. Avoid unbounded `any`, use schema
validation at runtime boundaries, and separate wire contracts from internal
domain types when their evolution differs.

## API and contract conventions

- Design use cases and error semantics before transport routes.
- Version externally consumed contracts deliberately; do not expose persistence
  records by accident.
- Use consistent identifiers, timestamps with explicit timezone semantics, and
  machine-readable error codes.
- Make mutating retry behavior explicit; use idempotency controls where client
  or job retries can duplicate an action.
- Paginate unbounded collections and authorize both collection and item access.
- Do not include sensitive fields merely because they are available.
- Maintain compatibility or provide an explicit migration plan.

## Database and migration conventions

Once persistence exists:

- apply schema changes through reviewed, ordered migrations;
- use database constraints for durable invariants in addition to application
  validation;
- make destructive or long-running migrations staged and reversible where
  practical;
- test migrations against representative schema/data shapes;
- avoid editing an already-applied migration;
- document backfills, deployment ordering, monitoring, and rollback; and
- preserve historical version/provenance references.

## Configuration and dependencies

- Commit safe defaults and examples, never secrets.
- Validate required configuration at startup with actionable errors.
- Keep development, test, staging, and production behavior aligned; differences
  must be intentional and documented.
- Add a dependency only when its maintenance, security, licensing, bundle,
  privacy, and operational costs are justified.
- Pin through the chosen lockfile and use automated update/security checks.
- Prefer well-supported platform capabilities to custom security primitives.

## Change workflow

1. Define the user or operational outcome and non-goals.
2. Inspect affected modules, decisions, data flows, and documentation.
3. Write or update a decision record for a durable cross-cutting choice.
4. Implement the smallest coherent vertical change.
5. Add risk-proportionate tests and observability.
6. Run formatting, static checks, tests, build, and relevant security checks.
7. Review authorization, privacy, accessibility, migration, and failure modes.
8. Update documentation and remove obsolete guidance.
9. Review the final diff as a whole.

Use short-lived branches and focused reviews. Commit and pull-request conventions
can be selected with the hosting workflow; no release automation exists yet.

## Definition of done

A future implementation change is done when:

- acceptance behavior and explicit non-goals are satisfied;
- tests cover the changed risks and pass;
- formatting, type, lint, build, and dependency checks pass;
- authorization and data handling have been reviewed;
- accessibility and safe failure states are addressed for affected UI;
- telemetry is useful without leaking sensitive data;
- migrations and rollbacks are understood;
- affected docs and decisions match reality; and
- no unrelated placeholder architecture or feature was added.

## Decision threshold

Create an architecture decision record when a choice is durable, cross-cutting,
costly to reverse, security/privacy relevant, or likely to be questioned later.
Routine local implementation choices belong in code and review, not an ADR.
