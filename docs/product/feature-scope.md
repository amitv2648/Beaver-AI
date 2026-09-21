# Feature scope and boundaries

## Current implemented scope: Phases 0–1

Phase 0 established the product and architecture source of truth. Phase 1 now
implements:

- email/password registration, sign-in, sign-out, persistence, verification
  request, and password reset through Firebase Authentication;
- Google sign-in and explicit linking guidance;
- an application-owned Beaver AI account synchronized to Firebase identity;
- protected account access, display-name updates, and account deletion;
- private-by-default parent/educator invitations, acceptance, scoped
  connections, revocation, and security audit events;
- a server-side ownership/scope authorization policy for future modules; and
- a responsive Beaver AI landing, authentication, account, and sharing
  experience.

No learner profile, onboarding, educational content/data, AI integration, or
Phase 2+ feature is implemented.

## Long-term capability map

| Capability area         | Intended outcome                                         | Owning phase |
| ----------------------- | -------------------------------------------------------- | ------------ |
| Identity and access     | Secure accounts, sessions, roles, and permissions        | 1            |
| Learner profile         | Goals, preferences, constraints, and onboarding context  | 2            |
| Curriculum graph        | Reviewed educational structure and prerequisites         | 3            |
| Learning content        | Versioned lessons and content workflow                   | 4            |
| Mastery and progress    | Evidence-based knowledge estimates and history           | 5            |
| Practice and assessment | Valid tasks, feedback, scoring, and evidence             | 6            |
| Personalization         | Explainable next-step and review recommendations         | 7            |
| AI tutoring             | Structured, context-aware text tutoring                  | 8            |
| Learning workspace      | Interactive subject-specific tools                       | 9            |
| Work analysis           | Multimodal analysis and annotation                       | 10           |
| Voice tutoring          | Real-time spoken tutoring with equivalent safeguards     | 11           |
| Motivation systems      | XP, levels, BBucks, quests, and cosmetics                | 12           |
| Social learning         | Challenges, leagues, and carefully scoped competition    | 13           |
| Future planning         | Test preparation, college, major, and career exploration | 14           |
| Operations and launch   | Administration, safety operations, scaling, compliance   | 15           |

The roadmap is the authority for phase deliverables and dependencies.

## Product boundaries

### Beaver AI is intended to be

- a learning support and personalization system;
- a source of understandable learning recommendations;
- a workspace grounded in structured, reviewed educational context;
- an evidence-based mastery and practice environment; and
- a complement to students, families, and educators.

### Beaver AI is not intended to be

- an accredited school, official gradebook, or sole source of high-stakes
  decisions unless separately validated and governed in the future;
- a replacement for teachers, guardians, counselors, clinicians, or emergency
  services;
- an unrestricted answer generator or plagiarism tool;
- a surveillance product, advertising network, or marketplace for student data;
- a social network optimized for virality; or
- a financial economy—BBucks are a closed learning incentive with no promised
  cash value.

## Scope rules for future phases

1. A phase may refine earlier models but must update affected documentation and
   decision records.
2. A capability is not complete merely because its UI exists; its safety,
   accessibility, data, authorization, observability, and tests are part of the
   capability.
3. AI output remains advisory unless an explicitly governed workflow validates
   and promotes it into authoritative data.
4. Gamification and social mechanics must be evaluated against learning,
   fairness, privacy, and well-being—not only engagement.
5. High-risk functions require stronger evidence and human oversight than
   low-risk suggestions.
6. Future placeholders may be documented but should not be implemented before
   their phase has a concrete need.

## Explicit Phase 0 non-goals

- Selecting vendors that require accounts, credentials, or paid services
- Building a production infrastructure topology
- Finalizing physical database tables or API payloads
- Creating sample student records or synthetic application screens
- Implementing authentication, onboarding, courses, lessons, mastery, practice,
  recommendations, tutoring, dashboards, gamification, or administration
