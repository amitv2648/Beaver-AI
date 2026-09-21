# Phase 1 threat model

## Scope

Authentication, Firebase identity, Beaver AI accounts, protected API requests,
sharing invitations, connections, permission scopes, audit events, and account
deletion.

## Assets

- Firebase credentials, sessions, ID tokens, and Admin credentials
- Beaver AI account identifiers, email, and display name
- Sharing recipient emails, invitation tokens, relationships, and scopes
- Authorization decisions and account audit history
- PostgreSQL integrity and migration history

## Trust boundaries

1. Browser to Firebase Authentication
2. Browser to Beaver AI API over HTTPS
3. Beaver AI API to Firebase Admin token verification
4. Application service to PostgreSQL
5. Student-to-recipient delivery of an invitation URL

The browser, URL parameters, request bodies, Firebase profile fields, and
invitation recipients are untrusted. Verified Firebase token claims prove an
external identity; they do not by themselves grant Beaver AI resource access.

## Threats and controls

| Threat                          | Primary controls                                                                                                                          | Residual concern                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Stolen/replayed ID token        | HTTPS, short-lived Firebase token, revocation verification on protected requests, no token logging                                        | A stolen valid token can act until revoked/expired            |
| Cross-student object access     | Opaque account IDs, server-side current-account derivation, owner/recipient/scope policy, repository ownership predicates, negative tests | Future modules must call the policy correctly                 |
| Duplicate account takeover      | Unique normalized email and Firebase subject, no automatic cross-subject email merge, explicit linking                                    | Firebase project must retain one-account-per-email behavior   |
| Forwarded invitation URL        | 256-bit token, only hash persisted, seven-day expiry, one-time state, authenticated matching verified email required                      | Recipient controls their own mailbox/security                 |
| Scope escalation                | Server-validated enum and relationship allowlist, persisted explicit scopes, exact-scope authorization                                    | New scopes require design and tests                           |
| Access after revocation         | Connection status checked on each authorization; no permission claim cached in Firebase token                                             | Future caches must preserve revocation guarantees             |
| CSRF/cross-origin mutation      | Bearer token in explicit header, default same-origin API behavior, no cookie authentication, JSON content                                 | Deployment must not add permissive CORS                       |
| Injection/oversized input       | Zod schemas, parameterized Drizzle queries, 16 KiB JSON limit, output rendered by React                                                   | Rate limiting needs deployment-aware implementation           |
| Email/account enumeration       | Firebase protections and generic password-reset success UI                                                                                | Provider responses and timing still require production review |
| Secret exposure                 | `.env*` ignored, example values empty, Admin credentials server-only, safe API errors                                                     | Deployment secret access and rotation are external controls   |
| Partial account deletion        | Recent-auth requirement, `deleting` fail-closed state, transactional relationship revocation, external deletion before purge              | Failed deletion requires operational retry tooling            |
| Database race/integrity failure | Transactions, row lock on invitation acceptance, unique/foreign-key/enum constraints                                                      | Live PostgreSQL concurrency smoke test remains required       |
| Audit privacy leakage           | Structured event names and minimal metadata; no token or message logging                                                                  | Audit retention/access policy remains pre-production work     |
| UI-only protection bypass       | All account and sharing APIs authenticate and authorize independently                                                                     | Future routes must follow the same boundary                   |

## Abuse and availability

Firebase provides authentication abuse controls. Phase 1 bounds request bodies,
invitation lifetime, and supported scopes, but does not implement a
process-local limiter that would provide false confidence in a multi-instance
deployment. Before public deployment, select infrastructure-aware rate limits
for account synchronization, invitation creation/acceptance, and deletion, and
monitor safe event counts without logging tokens or sensitive payloads.

## Required deployment review

- Confirm HTTPS, restrictive CORS, security headers, and Firebase authorized
  domains.
- Scope Firebase Admin/workload credentials and PostgreSQL credentials.
- Enable database encryption/backups and test restore/deletion handling.
- Add alerts for authentication failures, invitation abuse, and stuck
  `deleting` accounts using non-sensitive identifiers.
- Run isolation, revocation, concurrency, and deletion smoke tests against the
  deployed environment.
- Define who can retry or investigate failed deletion without introducing an
  administrator product role.
