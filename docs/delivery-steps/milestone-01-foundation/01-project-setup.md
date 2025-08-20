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

## Commands

````bash
pnpm create next-app@latest dnd-tracker --typescript --tailwind --app --use-pnpm
cd dnd-tracker
pnpm add -D @types/node
```bash

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
````

## Folder Structure

```
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

- Next.js app runs locally with no errors
- TypeScript is enabled and strict mode is on
- pnpm is used for all package management
- ESLint and Prettier are configured and pass on initial code
- Git repository is initialized with first commit
- Folder structure matches the specification
- Path aliases work as expected in imports
