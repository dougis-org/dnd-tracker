# Implementation Plan: MVP D&D Encounter Tracker

**Branch**: `001-read-the-prd` | **Date**: 2025-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/doug/dev/dnd-tracker/specs/001-read-the-prd/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ COMPLETE: Feature spec loaded and analyzed
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ COMPLETE: All technical context filled from PRD
3. Fill the Constitution Check section based on constitution document
   → ✅ COMPLETE: Constitution requirements documented
4. Evaluate Constitution Check section below
   → ✅ PASS: No violations requiring justification
5. Execute Phase 0 → research.md
   → ✅ COMPLETE: Research phase completed
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ COMPLETE: Design artifacts generated
7. Re-evaluate Constitution Check section
   → ✅ PASS: Design complies with constitution
8. Plan Phase 2 → Describe task generation approach
   → ✅ COMPLETE: Task planning strategy defined
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Primary requirement: Build an MVP D&D Encounter Tracker that enables Dungeon Masters to efficiently manage combat encounters with initiative tracking, HP management, status effects, and lair actions while enforcing Free Adventurer tier limits and providing user authentication.

Technical approach: Next.js 15.5+ full-stack web application with TypeScript, MongoDB for data persistence, Clerk for authentication, and local storage for offline capability. Focus on responsive design with shadcn/ui components and comprehensive testing coverage.

## Technical Context

**Language/Version**: TypeScript 5.9+ with Next.js 15.5+ App Router
**Primary Dependencies**: React 19.0+, Next.js 15.5+, shadcn/ui v3.2+, Tailwind CSS 4.0+, MongoDB 8.0+, Mongoose 8.5+, Clerk 5.0+, Zod 4+
**Storage**: MongoDB 8.0+ with Atlas cloud hosting for user data, IndexedDB for local storage/offline capability
**Testing**: Jest 29.7+ + React Testing Library 16.0+ for unit tests, Playwright 1.46+ for E2E testing
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), mobile-responsive design
**Project Type**: web (Next.js full-stack application with frontend and backend)
**Performance Goals**: <3s page load, <100ms UI interactions, <200ms API response times
**Constraints**: Free tier limits (1 party, 3 encounters, 10 creatures, 6 participants), offline-capable core features
**Scale/Scope**: MVP supporting 100+ concurrent users, 8 core entities, 15 functional requirements

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Quality Over Speed**: ✅ PASS
- Comprehensive testing strategy with Jest, RTL, and Playwright
- TDD approach with failing tests before implementation
- Code review process with constitutional compliance checks

**II. Test-First Development**: ✅ PASS
- Contract tests for all API endpoints before implementation
- Integration tests for user scenarios before UI development
- Unit tests for all data models and business logic

**III. Remote Authority**: ✅ PASS
- GitHub Actions CI/CD with automated quality checks
- Codacy integration for security and code quality analysis
- PR-based workflow with auto-merge after all checks pass

**IV. Complexity Reduction**: ✅ PASS
- Component-based architecture with single responsibility
- Maximum 450 lines per file, 50 lines per function
- Shared utilities for common functionality (validation, formatting)

**V. Security & Standards**: ✅ PASS
- Clerk integration for secure authentication
- Zod validation for all inputs
- Environment variables for sensitive configuration
- TypeScript strict mode enforced

## Project Structure

### Documentation (this feature)
```
specs/001-read-the-prd/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (Next.js full-stack)
src/
├── app/                 # Next.js 15+ App Router
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/      # Main application
│   ├── encounters/     # Encounter management
│   ├── parties/        # Party management
│   ├── api/           # API routes
│   └── globals.css    # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Form components
│   ├── encounters/    # Encounter-specific components
│   └── parties/       # Party-specific components
├── lib/               # Utilities and configurations
│   ├── db/           # Database connection and models
│   ├── auth/         # Clerk configuration
│   ├── validations/  # Zod schemas
│   └── utils/        # Helper functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── constants/         # Application constants

tests/
├── e2e/               # Playwright E2E tests
├── integration/       # API integration tests
└── unit/             # Jest unit tests
```

**Structure Decision**: Option 2 (Web application) - Next.js full-stack application with App Router

## Phase 0: Outline & Research

### Weekly Milestone Planning Research

**Week 1-2: Foundation & Authentication**

- Research Clerk integration patterns for Next.js 15+
- Investigate MongoDB schema design for D&D entities
- Study shadcn/ui component architecture and theming
- Research offline-first patterns with IndexedDB

**Week 3-4: Core Combat Features**
- Research initiative calculation algorithms and tie-breaking
- Study HP tracking patterns with undo functionality
- Investigate status effect duration management
- Research lair action automation patterns

**Week 5-6: Data Management & Persistence**
- Research MongoDB aggregation for encounter queries
- Study real-time data synchronization patterns
- Investigate backup and restore strategies
- Research tier limit enforcement patterns

**Week 7-8: Testing & Polish**
- Research comprehensive testing strategies for D&D rules
- Study performance optimization for combat calculations
- Investigate accessibility patterns for gaming interfaces
- Research deployment strategies with Fly.io

### Technical Research Decisions

**Authentication Strategy**: Clerk 5.0+ with Next.js App Router integration
- **Decision**: Use Clerk for authentication, session management, and user profiles
- **Rationale**: Provides comprehensive auth solution with subscription tier support
- **Alternatives considered**: NextAuth.js (more complex for subscription management), Auth0 (higher cost)

**Database Design**: MongoDB with Mongoose ODM
- **Decision**: Document-based storage for flexible D&D entity schemas
- **Rationale**: Natural fit for character stat blocks and encounter configurations
- **Alternatives considered**: PostgreSQL (less flexible for varying schemas), Prisma (less mature MongoDB support)

**State Management**: Zustand + TanStack Query
- **Decision**: Lightweight client state with server state caching
- **Rationale**: Minimal boilerplate, excellent TypeScript support, optimistic updates
- **Alternatives considered**: Redux Toolkit (overengineered for scope), Context API (performance concerns)

**Component Architecture**: shadcn/ui + Radix UI primitives
- **Decision**: Accessible, customizable component library with design system
- **Rationale**: Built-in accessibility, TypeScript support, Tailwind integration
- **Alternatives considered**: Material-UI (not gaming-focused), Chakra UI (larger bundle)

## Phase 1: Design & Contracts

### Data Model Design

**Core Entities** (detailed in data-model.md):
- User: Authentication and subscription management
- Character: Player character stats and information
- Monster: NPC/monster stat blocks with special abilities
- Party: Groups of characters with template support
- Encounter: Combat scenarios with participant management
- CombatSession: Active encounter state with turn tracking
- StatusEffect: Temporary conditions with duration tracking
- LairAction: Environmental effects for encounters

### API Contract Design

**REST API Endpoints** (detailed in contracts/):
- `POST /api/auth/session` - Session management
- `GET /api/users/profile` - User profile and tier information
- `POST /api/characters` - Character creation and management
- `POST /api/parties` - Party management and templates
- `POST /api/encounters` - Encounter creation and configuration
- `POST /api/combat/start` - Combat session initiation
- `PUT /api/combat/initiative` - Initiative order management
- `PUT /api/combat/hp` - HP modification with undo
- `POST /api/combat/status-effects` - Status effect management
- `POST /api/combat/lair-actions` - Lair action triggers

### Integration Test Scenarios

**User Story Validation** (detailed in quickstart.md):
1. **New User Onboarding**: Account creation → tier explanation → first party setup
2. **Party Creation**: Character entry → stat validation → template saving
3. **Encounter Setup**: Monster selection → participant arrangement → initiative rolling
4. **Combat Flow**: Turn progression → HP tracking → status effects → lair actions
5. **Data Persistence**: Session saving → app restart → data recovery

### Agent Context Update

Updated CLAUDE.md with current technology stack and project patterns for efficient AI assistance during implementation.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Weekly Milestone Task Generation Strategy**:

**Week 1-2 Tasks (Foundation)**:
- Setup: Next.js project initialization, dependencies, linting configuration
- Authentication: Clerk integration, user profile models, session management
- Database: MongoDB connection, Mongoose schemas, basic CRUD operations
- UI Foundation: shadcn/ui setup, base layout components, theming

**Week 3-4 Tasks (Core Features)**:
- Character Management: CRUD operations, validation, templates
- Party Management: Group creation, member assignment, template system
- Encounter Setup: Monster management, participant selection, configuration
- Initiative System: Calculation logic, tie-breaking, manual overrides

**Week 5-6 Tasks (Combat Engine)**:
- Combat Sessions: State management, turn progression, round tracking
- HP Management: Damage/healing with undo, visual indicators
- Status Effects: Application, duration tracking, automatic removal
- Lair Actions: Automation, initiative 20 triggers, customization

**Week 7-8 Tasks (Polish & Testing)**:
- Tier Enforcement: Usage limits, upgrade prompts, validation
- Offline Support: IndexedDB integration, sync strategies
- Testing: Comprehensive test suite, E2E scenarios
- Performance: Optimization, monitoring, deployment

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → Implementation
- Dependency order: Models → Services → API → UI → Features
- Mark [P] for parallel execution within each week milestone
- Weekly acceptance criteria validation before milestone completion

**Estimated Output**: 35-40 numbered, ordered tasks across 8-week timeline in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md with weekly milestones)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitution violations requiring justification*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*