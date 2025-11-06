# dnd-tracker Development Guidelines

Auto-generated from feature plans. Last updated: 2025-11-02

## Active Technologies

- TypeScript 5.9.2
- Next.js (App Router 16+)
- React 19+
- Tailwind CSS 4.x
- shadcn/ui
- Jest (unit tests)
- Playwright (E2E)

## Project Structure

```
frontend/
src/
  components/
  lib/
app/
specs/
tests/
```

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Unit tests: `npm test`
- E2E (Playwright): `npx playwright test`
- CI full test: `npm run test:ci`

## Code Style

- TypeScript strict mode enabled
- Keep files under 450 lines and functions under 50 lines
- Follow existing ESLint and Prettier configuration

## Recent Changes
- 002-navigation-not-implemented-page: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

- feature/002-navigation-not-implemented-page: Added implementation plan, research, data-model, contracts, and quickstart for navigation skeleton (2025-11-02)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
# DND Tracker Development Guidelines (Legacy)

Auto-generated from feature planning. Last updated: 2025-09-30

## Active Technologies (Legacy)

- TypeScript 5.9.2 with strict mode enabled, Node.js 25.1.0 + Next.js 16.0.1, React 19.2.0, Tailwind CSS 4.x, shadcn/ui, Mongoose 8.19.1 (001-project-setup-design-system)
- MongoDB 8.0+ (via Mongoose ODM) for data persistence, IndexedDB for offline capability (future) (001-project-setup-design-system)

**Core Stack**: Next.js 15.5+ with TypeScript 5.9+, React 19.0+, App Router
**Database**: MongoDB 8.0+ with Mongoose 8.5+ ODM for flexible D&D entity schemas
**Authentication**: Clerk 5.0+ for user management and subscription tier enforcement
**UI Components**: shadcn/ui v3.2+ with Radix UI primitives and Tailwind CSS 4.0+
**State Management**: Zustand 4.5+ (client state) + TanStack Query v5.0+ (server state)
**Testing**: Jest 29.7+ + React Testing Library 16.0+ (unit), Playwright 1.46+ (E2E)
**Validation**: Zod 4+ for runtime type checking and API contract enforcement

## Project Structure (Legacy)

```
src/
├── app/                 # Next.js 15+ App Router
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/      # Main application
│   ├── encounters/     # Encounter management
│   ├── parties/        # Party management
│   ├── api/           # API routes with edge optimization
│   └── globals.css    # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Form components with React Hook Form
│   ├── encounters/    # Encounter-specific components
│   └── parties/       # Party-specific components
├── lib/               # Utilities and configurations
│   ├── db/            # MongoDB connection and Mongoose schemas
│   ├── auth/          # Clerk configuration
│   ├── validations/   # Zod schemas for type safety
│   └── utils/         # Helper functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── constants/         # Application constants

tests/
├── e2e/               # Playwright E2E tests
├── integration/       # API integration tests
└── unit/              # Jest unit tests
```

## Commands (Legacy)

**Development**: `npm run dev` (Next.js with Fast Refresh + Turbopack)
**Testing**: `npm run test` (Jest), `npm run test:e2e` (Playwright)
**Build**: `npm run build` (production build with type checking)
**Linting**: `npm run lint:fix` (ESLint + Prettier)
**Type Check**: `npm run type-check` (TypeScript strict mode)

## Code Style (Legacy)

**TypeScript**: Strict mode enforced, no `any` types without justification
**Components**: Functional components with hooks, maximum 50 lines per function
**API Routes**: Zod validation for all inputs/outputs, proper error handling
**Database**: Mongoose schemas with validation, MongoDB aggregation for complex queries
**Testing**: TDD approach - tests written before implementation

## Recent Changes (Legacy)

- 001-project-setup-design-system: Added TypeScript 5.9.2 with strict mode enabled, Node.js 25.1.0 + Next.js 16.0.1, React 19.2.0, Tailwind CSS 4.x, shadcn/ui, Mongoose 8.19.1

- 002-when-a-user: Added user registration and profile management backend

**2025-09-20**: MVP planning phase completed

- Feature specification for D&D encounter tracker

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
