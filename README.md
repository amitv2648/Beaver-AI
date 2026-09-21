# Beaver AI

Beaver AI is an AI-powered personalized learning platform being built around
each student's knowledge, goals, progress, and needs.

**Phase 1: Authentication, Accounts & Permissions** is implemented. The current
application provides Firebase email/password and Google authentication, a
Beaver-owned account, private protected account settings, account deletion, and
student-controlled parent/educator sharing foundations. Phase 2 onboarding and
all learning features remain out of scope.

## Product promise

Beaver AI personalizes learning around each student's knowledge, goals,
progress, and needs instead of placing every student on the same path.

## Technology

- Next.js and React with strict TypeScript
- Firebase Authentication behind client/server adapters
- PostgreSQL and Drizzle ORM for Beaver AI account and sharing data
- Zod validation, Vitest, ESLint, and Prettier

Firestore, Firebase Storage, Cloud Functions, and Firebase Hosting are not used.

## Local setup

Prerequisites: Node.js 22+, npm, a PostgreSQL database, and access to the
existing Beaver AI Firebase project.

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env.local` and enter the registered Firebase Web
   App's public configuration, `DATABASE_URL`, and `FIREBASE_PROJECT_ID`.
3. For Firebase Admin locally, use Application Default Credentials through
   `GOOGLE_APPLICATION_CREDENTIALS`, or configure both Firebase Auth emulator
   variables from `.env.example`.
4. Apply the database migration:

   ```powershell
   npm run db:migrate
   ```

5. Start the application:

   ```powershell
   npm run dev
   ```

In Firebase Authentication, enable Email/Password and Google, keep
one-account-per-email behavior enabled, and configure the application's
authorized domains. Never commit service-account files or `.env.local`.

## Validation

```powershell
npm run check
```

Individual commands are `format:check`, `lint`, `typecheck`, `test`, `build`,
and `db:generate`.

## Documentation

Start with the [documentation index](docs/README.md). The
[identity and access architecture](docs/architecture/identity-and-access.md)
describes the implemented security boundary. Phase reviews record
[Phase 0](docs/phase-0-acceptance.md) and
[Phase 1](docs/phase-1-acceptance.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Documentation is a maintained part of
the product: changes to behavior, architecture, dependencies, data, or
development practices must update the corresponding documentation in the same
change.
