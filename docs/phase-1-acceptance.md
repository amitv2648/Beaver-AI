# Phase 1 acceptance review

- Status: Automated verification passed; manual/environment completion blocked
- Review date: 2026-10-01
- Scope: Authentication, Accounts & Permissions

## Delivered

- Firebase email/password registration, sign-in, local session persistence,
  sign-out, verification request, and password reset
- Google sign-in, existing-email conflict protection, and explicit Google
  linking from account settings
- Beaver AI application accounts separate from Firebase identities
- Server-verified protected account API, account update, and fail-closed
  identity/application deletion
- Student-owned parent/educator invitations with hashed, expiring, single-use
  tokens and matching verified-email acceptance
- Scoped active/revoked connections and reusable server authorization policy
- Account/sharing lifecycle audit events and PostgreSQL constraints
- Responsive landing, authentication, invitation, and account experiences
- Strict TypeScript, formatting, linting, tests, build, migrations, environment
  examples, security headers, and maintained architecture documentation

## Acceptance criteria

- [x] Email/password account creation and sign-in are implemented.
- [x] Google authentication and explicit provider linking are implemented.
- [x] Sign-out and browser-local Firebase session persistence are implemented.
- [x] Password recovery provides a safe generic success state.
- [x] Authentication errors are mapped to useful, non-sensitive UI states.
- [x] Firebase infrastructure failures are not misreported as invalid user
      sessions.
- [x] Firebase ID tokens are verified server-side with revocation checking.
- [x] Beaver AI maintains its own account and external identity association.
- [x] A normalized email and Firebase subject cannot create duplicate
      application accounts.
- [x] Students can access and update only their protected account.
- [x] Parent and educator are relationship types rather than global roles.
- [x] Sharing is private by default, explicitly invited, scope-limited, and
      revocable.
- [x] Invitation possession alone does not grant ongoing access.
- [x] Invitation acceptance requires the matching verified account email.
- [x] Revoked connections fail the reusable authorization policy.
- [x] No permission scope exposes AI conversations, notes, account settings, or
      unrelated information.
- [x] Account deletion disables access, revokes relationships, deletes the
      Firebase identity, and purges application-owned account data.
- [x] No secret or local environment file is committed.
- [x] Firebase-specific logic is isolated behind infrastructure adapters.
- [x] PostgreSQL remains the relational application system of record; no other
      Firebase service was introduced.
- [x] Automated tests cover browser auth operations, session persistence,
      invalid protected requests, account create/sync/conflict/update/delete,
      ownership, invitations, acceptance, scope enforcement, and revocation.
- [x] The visual experience is responsive, keyboard-focused, reduced-motion
      aware, and aligned with the Beaver AI design direction.
- [x] Documentation, setup, architecture, roadmap, safety model, test strategy,
      and ADRs reflect implementation.
- [x] No Phase 2 onboarding, learning profile, course, tutor, analytics,
      dashboard, or other future functionality was introduced.

## Validation evidence

The repository quality gate runs:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
npm run db:generate
npm run verify:phase1:emulator
```

The final verification pass confirmed:

- formatting, ESLint, strict TypeScript, 48 automated tests, and the Next.js
  production build pass;
- `npm audit --audit-level=moderate` reports zero vulnerabilities;
- the migration applies successfully and schema generation reports no drift;
- all four application pages load from the documented development server and
  protected APIs reject missing and invalid credentials safely;
- PostgreSQL contains all five Phase 1 tables, both migrations apply, schema
  generation reports no drift, and database checks enforce valid relationship
  scopes and distinct connection accounts;
- live Firebase Web APIs verified email/password registration, repeated
  sign-in, token refresh, password-recovery request, and cleanup of the
  synthetic test identity; and
- the isolated Auth emulator and real PostgreSQL passed 62 end-to-end checks
  covering Firebase Admin verification/deletion, email/password, synthetic
  Google creation/repeat sign-in/linking, Beaver account synchronization,
  updates, sharing, authorization, revocation, expiry, and deletion.

The verification passes corrected seven bounded Phase 1 defects:

- Firebase Admin configuration/service failures no longer appear as invalid
  user sessions;
- streamed request bodies cannot bypass the 16 KiB JSON limit;
- malformed sharing resource IDs are rejected before reaching PostgreSQL;
- invitation return paths accept only valid token-shaped `/share/...` paths;
- concurrent account-creation uniqueness races return a safe account conflict
  instead of an internal error; and
- sharing overview expiry processing uses a typed timestamp comparison instead
  of a raw `Date` SQL parameter that caused live 500 responses; and
- account, sharing, invitation-token, and API error responses consistently
  declare `Cache-Control: no-store`.

The unused `NEXT_PUBLIC_APP_URL` example variable was also removed because
invitation links intentionally use the current browser origin. A second
migration now mirrors permission-scope and distinct-account invariants in
PostgreSQL.

## Environment release gate

The local environment has a working PostgreSQL connection and Firebase Web App
configuration. It intentionally does not commit those values. The repository
now configures an isolated `demo-beaver-ai` Auth emulator and automatically
verifies Firebase Admin, protected HTTP account/sharing operations, and the
full application-managed deletion sequence without production credentials.
Production still requires an authorized Firebase Admin credential or workload
identity, whose real permissions cannot be tested without external
authorization.

The interactive Google popup, inbox receipt of verification/reset messages,
and browser-level keyboard/responsive review were not automated in this
terminal-only verification pass. Their implementation and deterministic tests
pass, but they still require an authorized browser smoke test.

A plaintext copy of the local PostgreSQL role password was discovered in an
untracked local SQL file and removed. The local application role password was
then cryptographically rotated without printing it, `.env.local` was updated,
and the new connection was verified. The localhost-only
`db:rotate-local-password` command remains available for future local rotation.

Before deployment, an authorized operator must:

1. configure and least-privilege test production Firebase Admin credentials or
   workload identity;
2. confirm Email/Password and Google providers, authorized domains, and
   one-account-per-email behavior in Firebase;
3. apply `npm run db:migrate`;
4. run browser smoke tests for Google sign-in/linking, message receipt,
   persistence, invitation acceptance/revocation, and deletion; and
5. confirm production credentials have only the permissions required.

This is an external environment validation gate, not missing application
functionality.

## Result

The Phase 1 code, schema, automated checks, Firebase Auth emulator integration,
and available live integrations pass. Final environment readiness is blocked
on production Firebase Admin authorization and the browser-only smoke tests
above. The architecture provides the Phase 2 boundary: onboarding may extend
the Beaver account with a learner profile without coupling profile meaning to
Firebase or weakening the sharing policy.
