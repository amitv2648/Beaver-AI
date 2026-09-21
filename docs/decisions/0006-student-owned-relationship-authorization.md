# ADR-0006: Model parent and educator access as student-owned relationships

- Status: Accepted
- Date: 2026-09-20
- Owners: Product, security/privacy, and engineering leadership
- Supersedes: None

## Context

Students own their Beaver AI accounts and learning data. A parent or educator
may need selected future learning insights, but a global parent/educator role
does not answer which student, which relationship, or which data may be
accessed. It would also make multi-relationship users and revocation difficult
to represent safely.

An invitation URL alone cannot be durable authorization, particularly when it
may be forwarded or recorded in browser history.

## Decision

- Every Beaver AI account owns a private student account space.
- Parent and educator are relationship types, not global product roles.
- The student creates an invitation for one email, relationship type, and set of
  allowed permission scopes.
- Acceptance requires an authenticated account with the matching verified
  email.
- Acceptance creates an application-owned connection; the token itself never
  authorizes future resource access.
- Shared-resource authorization requires an active connection matching student
  owner, recipient, and exact permission scope.
- The student can revoke pending invitations and active connections. Revocation
  immediately removes authorization.
- Future modules use the Identity and Access module's policy contract rather
  than reading its tables directly.
- Private AI conversations, notes, credentials, settings, and unrelated data
  have no shareable Phase 1 scope.

## Considered options

- **Global student/parent/educator roles:** simple claims but cannot safely
  represent student-specific authority or one account with multiple contexts.
- **URL capability as lasting access:** easy sharing but difficult identity
  binding and revocation, and vulnerable to forwarding.
- **One unrestricted connected role:** simpler UI but violates data
  minimization and prevents future resource-specific policy.
- **Separate recipient records without accounts:** avoids sign-in friction but
  has no strong recipient identity and complicates lifecycle control.

## Consequences

### Positive

- Private-by-default, least-privilege authorization is explicit and testable.
- One person can own an account and also be connected to other students.
- Future relationship types and scopes can be added without redefining account
  identity.
- Revocation is a first-class persisted state with audit history.

### Negative and risks

- Recipients need a Beaver AI account and verified matching email.
- Permission design must be maintained as future learning resources appear.
- Invitation delivery is not included; Phase 1 exposes a link for the student to
  deliver privately.
- Relationship claims such as “parent” are student-selected context, not
  independently verified legal status.

## Revisit when

- Guardian consent authority or institution-managed educator access is defined.
- A future resource cannot be represented safely by existing scopes.
- Product decisions require recipient-initiated disconnection or verified
  relationship credentials.

## Related

- [Identity and access architecture](../architecture/identity-and-access.md)
- [Security, privacy, and student safety](../safety/security-privacy-and-safety.md)
- [Domain model](../architecture/domain-model.md)
