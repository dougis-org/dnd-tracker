# Implementation Plan: User Registration and Profile Management

**Branch**: `002-when-a-user` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/doug/ai-dev-1/dnd-tracker/specs/002-when-a-user/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature implements user registration and profile management for the D&D Tracker application. When users register through Clerk authentication, the system persists their information in MongoDB, creates a user profile with D&D-specific preferences, assigns the free subscription tier by default, and tracks usage metrics. Users can optionally complete a profile form with their D&D experience level, role (DM/player/both), preferred ruleset, and other preferences. The profile can be skipped or partially completed and updated later through settings.

## Technical Context

**Language/Version**: TypeScript 5.9+ with strict mode
**Primary Dependencies**: Next.js 15.5+, React 19.0+, Mongoose 8.5+, Clerk 5.0+, Zod 4+
**Storage**: MongoDB 8.0+ with Mongoose ODM
**Testing**: Jest 29.7+ with React Testing Library 16.0+ (unit), Playwright 1.46+ (E2E)
**Target Platform**: Web application (Next.js App Router with server/client components)
**Project Type**: web (Next.js full-stack with App Router)
**Performance Goals**: <1.5s dashboard load for authenticated users, <500ms profile form interactions
**Constraints**: 80%+ test coverage, max 450 lines per file, max 50 lines per function
**Scale/Scope**: User profile data model, Clerk webhook integration, profile form UI components, usage tracking infrastructure

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Over Speed ✅
- TDD approach required: Profile validation tests before implementation
- All tests must pass before PR merge
- Full responsibility for quality and correctness

### Test-First Development ✅
- Write Zod validation tests before schemas
- Write Mongoose model tests before model implementation
- Write API route tests before endpoint implementation
- Write component tests before UI implementation
- Red-Green-Refactor cycle enforced

### Remote Authority ✅
- Remote Codacy scans authoritative
- All findings addressed including pre-existing
- CI checks must pass before merge

### Complexity Reduction ✅
- Leverage existing User model from reference project
- Reuse validation patterns from `/home/doug/ai-dev-2/dnd-tracker-next-js`
- Maximum 450 lines per file (uncommented)
- Maximum 50 lines per function
- Extract shared utilities for common operations

### Security & Standards ✅
- No sensitive data committed
- Clerk integration for secure authentication
- Input validation via Zod schemas
- TypeScript strict mode enforced
- 80%+ test coverage on touched code

**Initial Assessment**: No constitutional violations identified. Standard Next.js App Router pattern with Mongoose models aligns with constitution requirements.

## Project Structure

### Documentation (this feature)
```
specs/002-when-a-user/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── clerk-webhook.yaml
│   └── profile-api.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── clerk/
│   │   │       └── route.ts        # Clerk webhook handler
│   │   └── users/
│   │       └── [id]/
│   │           └── profile/
│   │               └── route.ts    # Profile update API
│   ├── (auth)/
│   │   └── profile-setup/
│   │       └── page.tsx            # Initial profile form
│   └── settings/
│       └── profile/
│           └── page.tsx            # Profile management page
├── components/
│   └── profile/
│       ├── ProfileForm.tsx         # Reusable profile form
│       └── ProfileSetupWizard.tsx  # First-time setup flow
├── lib/
│   ├── models/
│   │   └── User.ts                 # User Mongoose model (extend existing)
│   ├── validations/
│   │   └── user.ts                 # Zod schemas (extend existing)
│   └── services/
│       └── userService.ts          # User operations
└── types/
    └── user.ts                     # TypeScript interfaces

tests/
├── unit/
│   ├── lib/
│   │   ├── validations/
│   │   │   └── user.test.ts
│   │   ├── models/
│   │   │   └── User.test.ts
│   │   └── services/
│   │       └── userService.test.ts
│   └── components/
│       └── profile/
│           ├── ProfileForm.test.tsx
│           └── ProfileSetupWizard.test.tsx
├── integration/
│   └── api/
│       ├── webhooks/
│       │   └── clerk.test.ts
│       └── users/
│           └── profile.test.ts
└── e2e/
    └── profile-setup.spec.ts
```

**Structure Decision**: Next.js App Router full-stack (web application with server and client components)

## Phase 0: Outline & Research
*Execute research and resolve NEEDS CLARIFICATION items*

### Research Tasks

1. **Clerk Webhook Integration Best Practices**
   - Research Clerk webhook event types for user lifecycle
   - Identify required webhook events: user.created, user.updated, user.deleted
   - Research webhook signature verification patterns
   - Find best practices for idempotent webhook processing

2. **Mongoose Schema Extension Patterns**
   - Research how to extend existing User model with new fields
   - Identify migration approach for adding D&D profile fields
   - Research Mongoose schema versioning if needed
   - Find patterns for optional vs required profile fields

3. **Usage Metrics Infrastructure**
   - Research storage approach for usage metrics (embedded vs separate collection)
   - Identify patterns for extensible metric tracking
   - Find best practices for incrementing counters efficiently
   - Research aggregation preparation strategies

4. **Profile Form UX Patterns**
   - Research progressive disclosure for optional profile setup
   - Identify Next.js App Router patterns for multi-step forms
   - Find best practices for form state management with React Hook Form
   - Research skip/save-for-later patterns

**Output**: research.md with consolidated findings

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### 1. Data Model (`data-model.md`)

Extract from feature spec entities:

**User Model Extensions**:
- displayName: string (optional, max 100)
- timezone: string (default "UTC")
- dndEdition: string (default "5th Edition", max 50)
- experienceLevel: enum (new, beginner, intermediate, experienced, veteran)
- primaryRole: enum (dm, player, both)
- profileSetupCompleted: boolean (default false)
- role: enum (user, admin) - existing field
- subscriptionTier: enum (free, seasoned, expert, master, guild) - existing field

**Usage Metrics** (embedded in User model for Phase 1):
- sessionsCount: number (default 0)
- charactersCreatedCount: number (default 0)
- campaignsCreatedCount: number (default 0)
- metricsLastUpdated: Date

**Validation Rules**:
- displayName: optional, max 100 chars, alphanumeric with spaces
- timezone: string, non-empty
- dndEdition: string, max 50 chars
- experienceLevel: must be one of enum values
- primaryRole: must be one of enum values

### 2. API Contracts (`contracts/`)

**Clerk Webhook Contract** (`contracts/clerk-webhook.yaml`):
```yaml
POST /api/webhooks/clerk
Request:
  - svix headers for signature verification
  - body: Clerk webhook event payload
Response:
  - 200: Event processed
  - 400: Invalid signature or payload
  - 500: Processing error
```

**Profile Update Contract** (`contracts/profile-api.yaml`):
```yaml
PATCH /api/users/[id]/profile
Request:
  - Authentication: Clerk session
  - body: Partial profile update (Zod validated)
Response:
  - 200: Updated user profile
  - 401: Unauthorized
  - 400: Validation errors
  - 404: User not found
```

### 3. Contract Tests

Generate failing tests for:
- `tests/integration/api/webhooks/clerk.test.ts` - Clerk webhook handling
- `tests/integration/api/users/profile.test.ts` - Profile update API
- `tests/unit/lib/validations/user.test.ts` - Zod schema validation
- `tests/unit/lib/models/User.test.ts` - Mongoose model operations

### 4. Integration Test Scenarios (`quickstart.md`)

From user stories:
1. New user authenticates via Clerk → webhook creates MongoDB user with defaults
2. User completes profile form → profile data persisted with validation
3. User skips profile → can access app and complete later
4. User updates profile in settings → changes saved and validated
5. Usage metrics tracked when user creates resources

### 5. Update CLAUDE.md

Run `.specify/scripts/bash/update-agent-context.sh claude` to add:
- User profile field additions
- Clerk webhook integration
- Profile form components
- Usage tracking infrastructure

**Output**: data-model.md, contracts/*, failing tests, quickstart.md, CLAUDE.md updated

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `.specify/templates/tasks-template.md` as base
2. Generate tasks from Phase 1 artifacts:
   - Zod validation schema extensions
   - Mongoose User model updates
   - Clerk webhook handler implementation
   - Profile API route implementation
   - Profile form components
   - Usage tracking service
   - Integration tests
   - E2E tests

**Ordering Strategy** (TDD + dependency order):
1. Validation schemas (tests first) [P]
2. Mongoose model extensions (tests first) [P]
3. User service methods (tests first) [P]
4. Clerk webhook handler (tests first)
5. Profile API routes (tests first)
6. Profile form components (tests first) [P]
7. Profile setup wizard component (tests first)
8. Integration tests
9. E2E tests

**Estimated Output**: 20-25 numbered, dependency-ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations requiring justification*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
