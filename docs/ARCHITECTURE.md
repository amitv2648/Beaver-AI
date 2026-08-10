# Beaver AI Architecture

## Initial Technology Stack

- **React:** Component-based user interface layer for Beaver AI's web application.
- **Vite:** Local development and production build tooling.
- **TypeScript:** Statically typed application code for safer change and clearer contracts.
- **Tailwind CSS:** Utility-based styling for consistent, maintainable interface development.
- **Firebase:** Initial authentication and backend infrastructure.
- **React Router:** Client-side route configuration and navigation.

## Architecture Direction

Application code will depend on explicit service boundaries rather than direct Firebase coupling throughout the product. Firebase-specific integration will be isolated so individual backend services can be replaced later without redesigning unrelated application layers.

## Current Application Foundation

- Vite provides the development and production build pipeline.
- React and TypeScript provide the application entry point and root component.
- Tailwind CSS is integrated through its Vite plugin and global stylesheet.
- Application source currently lives in `src/`.
- Route configuration lives in `src/routes/`, route-level pages live in `src/pages/`, and reusable layout components live in `src/components/layout/`.
- Public routes use a shared route layout. This structure allows future authenticated routes to be added separately without changing the public route foundation.
- Generic UI primitives live in `src/components/ui/` and are exported through a shared module entry point.
- Shared components accept native element props where appropriate and provide reusable accessibility, responsive layout, and styling behavior.

## Design Foundation

- Tailwind theme tokens and semantic application colors are defined in `src/styles.css`.
- The design system uses a green-teal primary palette, neutral surfaces, and high-contrast text to support a friendly, trustworthy educational product.
- Semantic color tokens provide light defaults and class-based dark-theme values without coupling components to raw palette colors.
- Typography uses a system font stack and a responsive heading scale.
- Spacing follows a 4-pixel base scale with a small set of border radii, soft shadows, and mobile-first breakpoints.
- Shared UI components consume semantic tokens so themes can evolve without rewriting component styles.

## Error Handling

- A React application-level error boundary prevents unexpected render failures from leaving a blank interface.
- Unexpected failures display a generic, accessible fallback without exposing technical details.
- The shared `ErrorState` component provides a consistent pattern for not-found and future feature-level error states.
- Unexpected error details are logged to the developer console only in development.
- The boundary can be tested safely on the development server with `?simulateAppError=true`; this trigger is inactive in production builds.

The current router provides the home route and a fallback route. Authentication, protected routes, Firebase, data models, APIs, automated tests, and deployment configuration have not been implemented.

## Still Undecided

- AI model providers, orchestration, memory, and evaluation approach
- Voice capture, transcription, synthesis, and real-time transport
- Curriculum and mastery representation
- Hosting, observability, CI/CD, and environment strategy
- Testing, security, privacy, and accessibility implementation
- Firebase service selection beyond its initial authentication and backend responsibility
