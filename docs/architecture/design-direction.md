# Design system and experience direction

## Experience character

Beaver AI should feel friendly, modern, intelligent, calm, and encouraging. The
nature identity—forest, river, wood, sage, and beaver motifs—should provide
warmth and continuity without turning learning into a novelty theme.

The design should communicate:

- **orientation:** where the learner is and what matters now;
- **agency:** why an action is recommended and what alternatives exist;
- **progress:** evidence of growth without overstating mastery;
- **calm focus:** limited competing actions and manageable information density;
- **trust:** visible sources, uncertainty, saved state, and AI boundaries.

## Foundational principles

1. One clear primary task per learning view.
2. Progressive disclosure instead of exposing system complexity at once.
3. Plain, age-appropriate language without condescension.
4. Encouragement tied to effort, strategy, and learning—not fixed intelligence.
5. Mistakes presented as useful evidence, not failure.
6. Consistent interaction patterns across subjects, with specialized
   workspaces only where they improve learning.
7. Accessibility as a definition-of-done requirement.
8. Motion, rewards, and competition remain optional, respectful, and safe.

## Visual direction

The future token system should use semantic names rather than raw visual names:

- surface, elevated surface, text, muted text, border;
- primary action, secondary action, focus, success, caution, and danger;
- learning states such as not assessed, developing, practiced, and strong,
  avoiding color-only distinctions.

Likely visual characteristics:

- light neutral or warm backgrounds with restrained forest and sage accents;
- river blue for informative and interactive moments;
- wood tones used sparingly for warmth, not low-contrast body text;
- rounded but purposeful geometry;
- generous spacing and readable typography;
- subtle illustration and mascot presence, never obstructing the task.

Exact palette, typefaces, illustration style, spacing scale, and icon set should
be selected and contrast-tested during the first implemented UI phase. Do not
encode mastery, safety, or correctness by color alone.

## Accessibility baseline

The launch target should be **WCAG 2.2 AA** unless a recorded decision sets a
stronger applicable standard. Future interfaces must support:

- full keyboard operation and visible focus;
- semantic structure and assistive-technology names;
- text resizing and responsive reflow;
- sufficient text and non-text contrast;
- reduced motion and no essential time pressure;
- captions/transcripts and non-audio alternatives;
- labels and guidance that do not rely only on position, shape, or color;
- accessible validation, status announcements, and recovery;
- touch targets and input methods suitable for supported devices; and
- testing with automated checks plus keyboard and screen-reader review.

Personalization must not infer disability. Approved accommodations are explicit,
private, and controllable.

## Core pattern directions

### Home and next step

Prioritize one explained next learning action, current goal, and a concise
progress view. A dashboard should not become a wall of metrics.

### Learning and practice

Keep content, workspace, prompt, support, feedback, and navigation predictable.
Preserve student work during errors. Scaffolding should be discoverable and
gradual.

### Mastery and progress

Show evidence, recency, and uncertainty. Avoid false precision and punitive red
states. Clearly distinguish course completion from demonstrated mastery.

### AI tutor

Identify the tutor as AI, indicate what context it is using at an understandable
level, make reporting easy, preserve a way to continue without AI, and visually
distinguish reviewed sources from generated explanation.

### Rewards and social

Do not use dark patterns, loss aversion, public shaming, manipulative
notifications, or pay-to-win mechanics. Offer privacy-preserving defaults and
ways to reduce or hide gamification and competition.

## Responsive strategy

Design mobile-first for core reading, practice, and tutoring flows while using
larger screens for richer workspaces. “Web-first” does not mean desktop-only.
Slow networks, intermittent failures, and shared devices need explicit states,
though full offline operation is not currently promised.

## Design-system evolution

When UI implementation begins:

1. establish tokens before duplicating raw values;
2. build accessible primitives before feature-specific composites;
3. document component states, content guidance, and keyboard behavior;
4. test representative real content, long text, localization expansion, and
   error/empty/loading states;
5. use visual regression selectively for stable shared components; and
6. version or migrate breaking component contracts deliberately.

Phase 0 intentionally creates no component library, mock application, or final
brand assets.
