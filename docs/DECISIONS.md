# Beaver AI Decisions

This log records accepted product and technical decisions.

## Product Decisions

### D-001 — Build a broad educational platform

**Status:** Accepted  
**Reasoning:** Beaver should support multiple learning domains over time. Coding is important, but the product is not coding-only or a single-subject tutor.

### D-002 — Make the experience voice-first, not voice-only

**Status:** Accepted  
**Reasoning:** Voice is a major interaction method, while visual, written, structured, and domain-specific interfaces remain necessary for effective learning.

### D-003 — Optimize tutoring for understanding

**Status:** Accepted  
**Reasoning:** The tutor should teach with explanations, questions, hints, practice, and feedback instead of simply supplying answers.

### D-004 — Combine AI tutoring with a structured learning system

**Status:** Accepted  
**Reasoning:** Curricula, mastery, progress, and recommendations provide educational continuity that an unstructured chatbot cannot.

### D-005 — Treat gamification as a core product system

**Status:** Accepted  
**Reasoning:** Motivation and sustained engagement are central to the vision, but game mechanics must reinforce genuine learning.

### D-006 — Protect student privacy in guardian experiences

**Status:** Accepted  
**Reasoning:** Parent or guardian functionality should provide useful insight only with appropriate permissions and boundaries.

### D-007 — Develop incrementally to startup-grade standards

**Status:** Accepted  
**Reasoning:** Small phases reduce delivery risk, while maintainability, safety, and quality remain long-term requirements.

## Technical Decisions

### D-008 — Use React for the web interface

**Status:** Accepted  
**Reasoning:** React provides a component-based foundation for building Beaver AI's interactive user experience.

### D-009 — Use Vite for development and builds

**Status:** Accepted  
**Reasoning:** Vite provides focused tooling for developing and building the React application.

### D-010 — Use TypeScript for application code

**Status:** Accepted  
**Reasoning:** Static typing improves maintainability, makes service contracts explicit, and reduces errors as the product grows.

### D-011 — Use Tailwind CSS for styling

**Status:** Accepted  
**Reasoning:** Tailwind CSS supports consistent, maintainable interface development through reusable styling constraints.

### D-012 — Use Firebase for initial authentication and backend infrastructure

**Status:** Accepted  
**Reasoning:** Firebase will provide the initial account and backend foundation while Beaver AI is established.

### D-013 — Isolate replaceable services behind modular boundaries

**Status:** Accepted  
**Reasoning:** Application layers should not depend directly on Firebase throughout the codebase, allowing individual services to be replaced later without broad rewrites.
