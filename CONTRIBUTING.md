# Contributing to Beaver AI

Beaver AI has completed Phases 0–1. Contributions may maintain the identity,
account, authorization, and sharing foundation or prepare an explicitly
authorized next phase. Do not introduce Phase 2+ product behavior incidentally.

## Workflow

1. Read the [documentation index](docs/README.md) and relevant decision records.
2. Keep each change focused and identify affected documentation before editing.
3. Record a new architecture decision when a durable, cross-cutting choice is
   introduced or an accepted choice is reversed.
4. Run `npm run check`. Database or Firebase boundary changes also require
   migration review and an appropriate emulator/integration smoke test.
5. Review the final diff for contradictions, accidental secrets, and
   out-of-scope implementation.

## Change expectations

- Describe current reality, not an aspirational implementation as though it
  exists.
- Label recommendations and unresolved decisions clearly.
- Prefer plain language, stable relative links, and one canonical home for each
  decision.
- Update related diagrams, examples, tests, configuration, and docs in the same
  change once those artifacts exist.
- Never commit credentials, student data, production data, or generated secrets.

Detailed conventions are in the
[engineering handbook](docs/development/engineering-handbook.md), and the
documentation maintenance policy is in
[documentation conventions](docs/development/documentation-conventions.md).
