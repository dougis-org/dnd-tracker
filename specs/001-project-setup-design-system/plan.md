# Implementation Plan: F001 — Project Setup & Design System

**Branch**: `001-project-setup-design-system` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-setup-design-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Establish the foundational Next.js 16.0.1 application with TypeScript 5.9.2, integrate shadcn/ui design system with Tailwind CSS 4.x, configure comprehensive testing infrastructure (Jest + Playwright), and deploy a CI/CD pipeline to Fly.io. This enables rapid, consistent feature development for all subsequent roadmap features.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode enabled, Node.js 25.1.0  
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS 4.x, shadcn/ui, Mongoose 8.19.1  
**Storage**: MongoDB 8.0+ (via Mongoose ODM) for data persistence, IndexedDB for offline capability (future)  
**Testing**: Jest 30.2.0+ (unit/integration), Playwright 1.56.1+ (E2E), 80%+ coverage target  
**Target Platform**: Web (Chrome/Edge 90+, Firefox 88+, Safari 14+), Node.js server runtime via Fly.io  
**Project Type**: Web application (Next.js App Router with frontend + API routes)  
**Performance Goals**: <200ms p95 API latency, <3s initial page load, 60fps UI interactions  
**Constraints**: Max 450 lines/file, max 50 lines/function, no code duplication, TypeScript strict mode  
**Scale/Scope**: Foundation for 60-feature roadmap, designed for 10k+ users, supports offline-first architecture

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution detected (not yet customized for D&D Tracker)

### Phase 0 Pre-Research Gate Assessment

Since the constitution file is currently a template placeholder, we proceed with general best practices:

✅ **Test-First Approach**: Spec includes explicit test plan with TDD workflow  
✅ **Code Quality Standards**: All CONTRIBUTING.md constraints documented (450 lines/file, 50 lines/function, 80%+ coverage)  
✅ **No Unnecessary Complexity**: Setup feature focuses on essential tooling only  
✅ **Technology Alignment**: All versions match Tech-Stack.md specifications  
✅ **No Violations**: This is a foundational setup feature with no architectural debt

### Known Technical Decisions Requiring Documentation

1. **Choice of Next.js 16.0.1 (canary)**: Latest version with React 19 support
   - Rationale: Access to latest performance improvements and React Server Components
   - Risk: Canary version may have undocumented edge cases
   - Mitigation: Comprehensive testing suite, can downgrade to stable if needed

2. **Tailwind CSS 4.x**: Latest major version
   - Rationale: Improved performance, better DX, required by shadcn/ui
   - Alternative considered: Tailwind 3.x (more stable)
   - Decision: Accept 4.x for future-proofing, extensive community support

3. **shadcn/ui Component Strategy**: Copy-paste over npm package
   - Rationale: Full customization control, no version lock-in
   - Trade-off: Manual updates vs automatic via package manager
   - Decision: PRD requires deep customization (theme toggle, custom styling)

### Phase 1 Post-Design Re-check

✅ **Constitution Alignment Verified**

**Design Artifacts Generated**:

- ✅ `research.md`: All technology decisions documented with rationale
- ✅ `data-model.md`: Foundation patterns established (no violations, infrastructure only)
- ✅ `quickstart.md`: Developer onboarding guide complete
- ✅ Agent context updated: CLAUDE.md includes new technology stack

**Post-Design Assessment**:

- ✅ **No Additional Complexity**: Infrastructure setup remains straightforward
- ✅ **Standards Maintained**: All decisions align with Tech-Stack.md and CONTRIBUTING.md
- ✅ **Test Strategy Defined**: TDD approach documented in research.md
- ✅ **Code Organization**: Next.js App Router structure follows best practices
- ✅ **No Scope Creep**: Deliverables match spec exactly

**Technical Decisions Validated**:

1. **Next.js 16.0.1**: Justified by React 19 support and performance gains
2. **Tailwind CSS 4.x**: Justified by shadcn/ui requirement and 40% bundle size reduction
3. **shadcn/ui Copy-Paste**: Justified by customization requirements in PRD
4. **Jest + Playwright**: Industry standard, comprehensive coverage

**Roadmap Governance Check**:

- ✅ Aligns with Feature-Roadmap.md Phase 1 expectations
- ✅ PRD §§5.1-5.4, 8.1-8.3 requirements will be satisfied
- ✅ Tech-Stack.md specifications followed exactly
- ✅ No deviations requiring stakeholder approval

**Gate Status**: ✅ **PASSED** - Proceed to implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-project-setup-design-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (design decisions, best practices)
├── data-model.md        # Phase 1 output (N/A for infrastructure setup)
├── quickstart.md        # Phase 1 output (developer onboarding guide)
└── contracts/           # Phase 1 output (N/A for infrastructure setup)
```

### Source Code (repository root)

```text
# Web Application Structure (Next.js 16 App Router)

# Frontend & API
src/
├── app/                         # Next.js app router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page (/)
│   ├── globals.css              # Global styles
│   ├── (auth)/                  # Auth route group
│   │   ├── layout.tsx           # Auth layout
│   │   └── sign-in/             # Sign-in page
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── dashboard/           # Dashboard pages
│   └── api/                     # API routes
│       └── v1/                  # API v1
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── theme/                   # Theme components
│   │   └── theme-toggle.tsx
│   └── layouts/                 # Layout components
│       ├── MainLayout.tsx
│       ├── AuthLayout.tsx
│       └── DashboardLayout.tsx
├── lib/
│   ├── db/                      # Database utilities
│   │   ├── mongoose.ts          # Mongoose connection
│   │   └── models/              # Mongoose models
│   ├── utils/                   # Utility functions
│   ├── validations/             # Zod schemas
│   └── hooks/                   # Custom React hooks
└── types/                       # TypeScript types

# Tests
tests/
├── unit/                        # Jest unit tests
│   └── components/
│       └── theme-toggle.spec.tsx
├── integration/                 # Jest integration tests
│   └── api/
└── e2e/                        # Playwright E2E tests
    ├── landing.spec.ts
    └── theme-toggle.spec.ts

# Configuration
├── .env.example                 # Environment variable template
├── .env.local                   # Local environment (gitignored)
├── tailwind.config.ts           # Tailwind CSS 4.x config
├── jest.config.js               # Jest configuration
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── .eslintrc.js                 # ESLint configuration (existing)
├── .markdownlint.json           # Markdown lint (existing)
└── fly.toml                     # Fly.io deployment config
```

**Structure Decision**: Web application structure chosen based on Next.js 16 App Router conventions. This aligns with PRD §2 (Technical Architecture) and Tech-Stack.md specifications. The app router pattern supports:

- Server Components for performance
- Colocation of routes with layouts
- API routes under `/api/v1` for versioning
- Separation of concerns (components, lib, types)
- Test organization matching source structure

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. This foundational feature follows all established best practices and constraints documented in CONTRIBUTING.md and Tech-Stack.md.

*This section will be populated in future features if architectural complexity requires justification.*

---

## Planning Phase Summary

**Phase 0: Outline & Research** ✅ COMPLETE

- All technology unknowns researched and documented in `research.md`
- Best practices identified for Next.js 16, Tailwind CSS 4.x, shadcn/ui
- Testing strategy defined (Jest + Playwright)
- Deployment approach finalized (Fly.io)

**Phase 1: Design & Contracts** ✅ COMPLETE

- Foundation patterns established in `data-model.md`
- Developer onboarding guide created in `quickstart.md`
- Agent context updated with new technology stack
- No API contracts needed (infrastructure feature)

**Constitution Gates** ✅ PASSED

- Pre-research gate: No violations, clean start
- Post-design gate: All decisions justified and aligned

**Artifacts Generated**:

1. `plan.md` - This implementation plan
2. `research.md` - Technology research and decisions (668 lines)
3. `data-model.md` - Foundation patterns for future models (244 lines)
4. `quickstart.md` - Developer onboarding guide (439 lines)

**Ready for Next Phase**: `/speckit.tasks` command to generate implementation tasks

**Branch**: `001-project-setup-design-system`  
**Next Command**: `cd /home/doug/ai-dev-1/dnd-tracker && /speckit.tasks`

---

## Report

✅ **Implementation Planning Complete for Feature 001**

**Branch**: `001-project-setup-design-system`

**Artifacts Generated**:

- **Plan**: `/home/doug/ai-dev-1/dnd-tracker/specs/001-project-setup-design-system/plan.md` (184 lines)
- **Research**: `/home/doug/ai-dev-1/dnd-tracker/specs/001-project-setup-design-system/research.md` (668 lines)
- **Data Model**: `/home/doug/ai-dev-1/dnd-tracker/specs/001-project-setup-design-system/data-model.md` (244 lines)
- **Quickstart**: `/home/doug/ai-dev-1/dnd-tracker/specs/001-project-setup-design-system/quickstart.md` (439 lines)

**Key Decisions Documented**:

- Next.js 16.0.1 with App Router (React 19 support)
- Tailwind CSS 4.x (40% smaller bundles)
- shadcn/ui copy-paste strategy (full customization)
- Jest 30.2.0 + Playwright 1.56.1 (comprehensive testing)
- MongoDB 8.0+ via Mongoose 8.19.1 (data persistence)
- Fly.io deployment (scalability + simplicity)

**Roadmap Alignment**:

✅ All decisions align with Tech-Stack.md specifications  
✅ PRD requirements §§5.1-5.4, 8.1-8.3 will be satisfied  
✅ Feature-Roadmap.md Phase 1 governance notes reviewed  
✅ No deviations requiring stakeholder approval

**Next Steps**:

1. Run `/speckit.tasks` to generate implementation tasks (remember Tech-Stack.md framework versions)
2. Run `/speckit.analyze` to validate alignment with spec/plan/roadmap governance
3. Run `/speckit.implement` to execute with quality gates
4. When PR merges, run `/feature-complete` to update roadmap status

**Constitution Status**: ✅ All gates passed, no violations
