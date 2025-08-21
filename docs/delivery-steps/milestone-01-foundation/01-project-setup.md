# Project Setup

## Objective

Initialize Next.js 15 application with TypeScript and core dependencies.

## Tasks

- [ ] Create new Next.js 15 app with TypeScript
- [ ] Configure TypeScript strict mode
- [ ] Set up pnpm as package manager
- [ ] Configure ESLint and Prettier
- [ ] Set up Git repository
- [ ] Create initial folder structure
- [ ] Configure path aliases in tsconfig.json
- [ ] Write failing tests before implementation (TDD)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Validate and sanitize all input (if any user input is present)
- [ ] Update documentation for any new setup steps

## Commands

```bash
pnpm create next-app@latest dnd-tracker --typescript --tailwind --app --use-pnpm
cd dnd-tracker
pnpm add -D @types/node
```

## Configuration Files

### tsconfig.json additions

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/models/*": ["./src/models/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

## Folder Structure

```text
src/
├── app/
├── components/
├── lib/
├── hooks/
├── models/
├── types/
└── styles/
```

## Acceptance Criteria

- Next.js app runs locally with no errors on `pnpm dev`
- TypeScript is enabled and strict mode is on; no `any` types used without justification
- pnpm is used for all package management; `pnpm install` completes with no errors
- ESLint and Prettier are configured and `pnpm run lint` and `pnpm run format` pass on all code
- Git repository is initialized, first commit is pushed, and remote is set up
- Folder structure matches the specification exactly
- Path aliases work as expected in all imports (demonstrated by at least one import per alias)
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All input (if any) is validated and sanitized
- All new setup steps are documented in the project README
- At least one failing test is written before implementation (TDD)
- All initial tests pass after implementation
