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

The current router provides the home route and a fallback route. Authentication, protected routes, Firebase, data models, APIs, automated tests, and deployment configuration have not been implemented.

## Still Undecided

- AI model providers, orchestration, memory, and evaluation approach
- Voice capture, transcription, synthesis, and real-time transport
- Curriculum and mastery representation
- Hosting, observability, CI/CD, and environment strategy
- Testing, security, privacy, and accessibility implementation
- Firebase service selection beyond its initial authentication and backend responsibility
