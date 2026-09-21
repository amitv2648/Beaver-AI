# ADR-0002: Begin with an evolutionary modular monolith

- Status: Accepted
- Date: 2026-09-20
- Owners: Engineering leadership
- Supersedes: None

## Context

Beaver AI has many future capabilities, but no application, measured load,
operational team, or independently scaling workload exists yet. Premature
microservices would introduce network failure, distributed transactions,
contract deployment, local-environment, observability, and infrastructure costs
before those costs solve a demonstrated problem.

A feature-layered monolith without internal boundaries would be simpler at
first but risks coupling identity, curriculum, mastery, tutoring, and rewards
through shared tables and business logic.

## Decision

Begin with a web-first, API-backed modular monolith in one repository.

- Organize server behavior by business capability with explicit ownership and
  public module contracts.
- Keep domain logic, application use cases, interfaces, and infrastructure
  concerns directionally separated where useful.
- Prevent modules from mutating each other's persistence directly.
- Keep external providers behind adapters.
- Deploy the fewest units consistent with security and reliability; workers may
  deploy separately while sharing the codebase.
- Extract a service only when measured scaling, isolation, reliability, data,
  regulatory, or team-ownership pressure outweighs distributed-system cost.

This decision selects an architectural posture, not a programming language,
framework, database product, or hosting vendor.

## Considered options

- **Microservices from the start:** strongest independent deployment, but high
  coordination and operational cost with no current evidence.
- **Unstructured monolith:** fastest initial file creation, but weak ownership
  and expensive coupling as domains grow.
- **Serverless functions per endpoint:** convenient deployment in some stacks,
  but endpoint decomposition does not establish domain boundaries and may add
  provider/runtime constraints.

## Consequences

### Positive

- Simple transactions, development, deployment, testing, and debugging.
- Domain boundaries can evolve before network contracts harden.
- Modules can later be extracted along observed seams.

### Negative and risks

- Boundaries rely on engineering discipline and preferably automated dependency
  rules.
- One deployment may couple release cadence and some failure modes.
- Poorly designed cross-module queries can create hidden coupling; contracts
  and ownership reviews are required.

## Revisit when

- A module requires independently measured scaling or availability.
- Security/regulatory isolation cannot be met safely in-process.
- Teams need independent ownership and deployment enough to justify the cost.
- Technology requirements are incompatible with the main runtime.

## Related

- [System architecture](../architecture/system-architecture.md)
- [Engineering handbook](../development/engineering-handbook.md)
