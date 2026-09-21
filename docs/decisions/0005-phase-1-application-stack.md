# ADR-0005: Select the Phase 1 application stack

- Status: Accepted
- Date: 2026-09-20
- Owners: Engineering leadership
- Supersedes: None

## Context

Phase 1 requires a responsive web client, protected server API, external
identity verification, transactional application data, migrations, runtime
validation, and meaningful automated tests. Phase 0 recommended a TypeScript
workspace, modular monolith, and relational system of record but deliberately
deferred products.

The initial team and hosting constraints are not yet fixed, so the stack must
provide a productive local foundation without selecting unnecessary managed
services.

## Decision

Use:

- strict TypeScript on Node.js 22 or newer;
- Next.js App Router and React as the web and server API runtime;
- PostgreSQL as the Beaver AI transactional system of record;
- Drizzle ORM and versioned SQL migrations;
- Firebase Authentication Web SDK for browser authentication;
- Firebase Admin SDK behind a server adapter for token verification and
  identity deletion;
- Zod for untrusted runtime input validation;
- Vitest for unit and boundary tests; and
- ESLint and Prettier for automated conventions.

Keep one deployable modular application and one relational database. Firebase
does not own Beaver AI account or authorization meaning. Hosting remains
unselected.

## Considered options

- **Separate SPA and API repositories:** clearer deployment split but duplicated
  contracts and more setup with no current team or scaling need.
- **Firebase plus Firestore:** convenient identity/data integration but
  contradicts the accepted relational direction and does not improve the
  transactional sharing model.
- **Custom Node API plus separate React build:** viable, but Next.js provides a
  maintained server/client boundary and accessible routing with fewer initial
  tools.
- **Custom password/session implementation:** unnecessary security risk because
  Firebase Authentication is a product requirement.

## Consequences

### Positive

- One type-safe language and repository across UI, API, domain, and tests.
- Server-side authorization and relational constraints remain application-owned.
- Provider-specific code is isolated and testable.
- No Firebase product beyond Authentication is introduced.

### Negative and risks

- Next.js server and client module boundaries require discipline.
- Firebase Admin credentials and PostgreSQL are both required in production.
- The modular monolith needs dependency review to avoid framework leakage.
- Drizzle's development CLI transitive dependency security must remain pinned
  through reviewed overrides until upstream removes the vulnerable dependency.

## Revisit when

- Deployment requirements are known and conflict with the chosen runtime.
- Measured application needs justify independently deployed services.
- The selected libraries lose maintenance/security support.
- A native client or additional runtime creates a demonstrated contract-sharing
  need.

## Related

- [System architecture](../architecture/system-architecture.md)
- [Identity and access architecture](../architecture/identity-and-access.md)
- [ADR-0002](0002-evolutionary-modular-monolith.md)
