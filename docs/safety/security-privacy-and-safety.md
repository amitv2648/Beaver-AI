# Security, privacy, and student safety

## Policy position

Beaver AI is intended for students and may serve minors. Safety, privacy, and
security are product requirements and architecture constraints from the first
implemented feature. The project does not currently claim compliance with any
law, framework, or certification.

Applicable obligations—including potentially COPPA, FERPA, GDPR/UK GDPR,
state student-privacy laws, accessibility law, and school contractual
requirements—depend on age band, jurisdiction, institutional relationships,
data use, and launch model. Qualified legal/privacy review is required before
production collection of student data.

## Safety principles

- Design for the best interests, dignity, development, and agency of students.
- Use age-appropriate experiences, explanations, defaults, and safeguards.
- Minimize collection and visibility; privacy-protective defaults should not
  require expert configuration.
- Do not use deceptive design, manipulative engagement, public shaming, or
  exploitative competition.
- Make reporting, blocking, correction, and help paths understandable.
- Treat content and AI safety as ongoing operations, not a one-time filter.
- Use human review and escalation when automation is insufficient.
- Avoid making diagnostic, disciplinary, admissions, or other high-impact
  claims from uncertain learning data.

## Privacy principles

1. **Purpose limitation:** collect and use data for a specific documented
   learning, safety, security, or operational purpose.
2. **Data minimization:** choose the least sensitive data and shortest useful
   retention.
3. **Transparency:** explain what is collected, why, who receives it, and what
   controls exist in language appropriate to the audience.
4. **Choice and consent:** obtain and record learner, guardian, or institutional
   authorization where required; withdrawal must propagate.
5. **Access and correction:** support appropriate review and correction of
   personal and inferred information.
6. **Deletion:** design deletion across primary, derived, backup, and processor
   systems.
7. **No sale or targeted advertising:** student data is not a commodity or an
   advertising profile.
8. **Processor discipline:** contractually and technically constrain external
   providers, including AI providers.

## Identity, authentication, and authorization

Phase 1 defines a Beaver AI account as the private owner and parent/educator
access as an explicitly invited, scoped, revocable relationship. Firebase
Authentication owns credentials and sessions; Beaver AI verifies its ID tokens
server-side and owns authorization. The baseline principles are:

- use established, reviewed authentication mechanisms rather than custom
  cryptography;
- delegate password storage and verification to Firebase Authentication rather
  than handling password material in Beaver AI;
- use secure session handling, rotation, expiration, revocation, CSRF defenses,
  and hardened cookies where applicable;
- provide safe recovery that does not reveal account existence or allow weak
  knowledge-based takeover;
- support stronger authentication for privileged operators;
- enforce authorization on the server for every object and action;
- apply least privilege, deny by default, and separate support/admin duties;
- model guardian, educator, learner, and organization relationships explicitly;
- require recent authentication or step-up controls for sensitive actions; and
- audit privileged access and material account/security changes.

A role alone is rarely enough: authorization may depend on relationship, tenant,
resource, action, consent, and current status.

Phase 1 sharing acceptance requires the invited verified email, stores only a
hash of the invitation token, expires invitations after seven days, and checks
active connection scope for every shared-resource authorization decision.
Revocation changes persisted state immediately. Client-side redirects and
visibility are not security boundaries.

## Security engineering baseline

Future implementation must include:

- threat modeling for each material feature and data flow;
- runtime validation of untrusted input and context-aware output encoding;
- parameterized database access and safe file handling;
- dependency pinning, review, vulnerability scanning, and timely updates;
- secret storage outside source control with rotation and scoped credentials;
- encryption in transit and at rest using maintained platform controls;
- environment separation and tightly controlled production access;
- security headers, abuse/rate controls, and request-size/time limits;
- privacy-aware logs and alerts with no credentials or raw sensitive content by
  default;
- tested backups, restoration, incident response, and rollback; and
- independent security review proportionate to launch risk.

Security controls must be testable. “Handled by the framework/provider” is not
evidence without verified configuration.

## Priority threat areas

| Threat                               | Required direction                                                      |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Cross-learner or cross-tenant access | Object-level authorization, isolation tests, opaque identifiers         |
| Account takeover                     | Secure sessions/recovery, rate limits, stronger admin authentication    |
| Privileged insider access            | Least privilege, approval where warranted, audit, monitoring            |
| Prompt injection and tool abuse      | Untrusted-context separation, allowlisted tools, external authorization |
| Model or provider data leakage       | Minimization, contracts/settings, redaction, retention controls         |
| Harmful or age-inappropriate content | Layered policy, detection, safe response, report/escalation             |
| Academic cheating                    | Pedagogical response modes, assessment controls, transparent boundaries |
| Upload-based attack                  | Type/size validation, malware controls, isolation, safe rendering       |
| Social abuse and grooming            | Restricted contact model, privacy defaults, reporting/moderation        |
| Reward/economy abuse                 | Immutable ledger, idempotency, anomaly detection, no cash value         |
| Inference and labeling harm          | Provenance, uncertainty, correction, limited use, no fixed labels       |

Threat models should identify assets, actors, trust boundaries, misuse cases,
controls, residual risk, and an accountable owner.

## AI safety

The [AI architecture](../architecture/ai-architecture.md) defines the technical
boundary. Safety policy must also cover:

- self-harm, abuse, exploitation, sexual content, violence, illegal/dangerous
  activity, hate, harassment, eating disorders, and other age-sensitive risks;
- clear limits: Beaver AI is not emergency, medical, mental-health, legal, or
  safeguarding authority;
- location-appropriate crisis and trusted-adult guidance without promising
  monitoring the system cannot provide;
- age-appropriate refusal and redirection that does not abandon the student;
- hallucination, bias, stereotyping, emotional dependency, anthropomorphism,
  and over-reliance;
- academic integrity modes that teach rather than simply complete assessed
  work; and
- testing and escalation paths for false positives and false negatives.

Exact policies, response language, human coverage, and escalation obligations
must be approved before the affected AI feature is released.

## Content and social safety

Reviewed educational content needs source/licensing provenance, author/reviewer
history, age/level labeling, accessibility checks, correction paths, and
publication controls. User-generated or shared content adds reporting,
moderation, blocking, appeals, and evidence-retention needs.

Social features for minors must default to the smallest safe audience. Public
discovery, direct messaging, real names, location, school exposure, and
off-platform contact are not assumed capabilities.

## Incident response

Before production launch, define severity levels and an on-call/escalation
process for security, privacy, content, and student-safety events. The process
must cover containment, evidence handling, required notification assessment,
student-facing support, remediation, post-incident review, and tracked
preventive actions. Safety reports must be protected from retaliation and
accessible to users who cannot complete a complex form.

## Pre-production decisions

The following require accountable human/business decisions and, where
appropriate, legal review:

- launch countries/states and supported age bands;
- direct-to-family versus school/institution operating model;
- consent, guardian, and educator authority;
- retention schedules and legal basis by data category;
- terms, privacy notices, acceptable-use and AI disclosures;
- human safety/moderation coverage and emergency limitations;
- accessibility conformance commitment; and
- approved subprocessors and international data-transfer posture.
