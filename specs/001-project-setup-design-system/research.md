# Research Document: F001 — Project Setup & Design System

**Date**: 2025-11-01  
**Feature**: Project Setup & Design System  
**Status**: Complete

## Overview

This document consolidates research findings for establishing the D&D Tracker foundation: Next.js 16.0.1 with TypeScript, shadcn/ui design system, testing infrastructure, and deployment pipeline.

## Research Topics

### 1. Next.js 16.0.1 Setup & Best Practices

**Decision**: Use Next.js 16.0.1 with App Router

**Rationale**:

- Latest stable features including React 19.2.0 support
- App Router provides better performance with Server Components
- Built-in optimization for images, fonts, and scripts
- Native TypeScript support with zero configuration
- Integrated API routes for backend functionality

**Installation Command**:

```bash
npx create-next-app@16.0.1 dnd-tracker --typescript --app --tailwind --eslint --src-dir --import-alias "@/*"
```

**Key Configuration Decisions**:

- `--app`: Use App Router (required for modern Next.js)
- `--src-dir`: Organize code in `src/` directory
- `--import-alias "@/*"`: Enable absolute imports from `src/`
- Skip Turbopack (still experimental, stick with webpack for stability)

**References**:

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

### 2. Tailwind CSS 4.x Integration

**Decision**: Use Tailwind CSS 4.x with PostCSS

**Rationale**:

- 40% smaller bundle size vs Tailwind 3.x
- Native CSS cascade layers support
- Better IDE integration and autocomplete
- Required by shadcn/ui for component styling
- JIT (Just-In-Time) mode by default

**Configuration Approach**:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom D&D themed colors
        dungeon: {...},
        adventure: {...},
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

**Alternatives Considered**:

- Tailwind 3.x: More stable, larger ecosystem
- **Rejected**: 4.x offers significant performance gains and is production-ready

**References**:

- [Tailwind CSS 4.0 Release Notes](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)

### 3. shadcn/ui Setup & Component Library

**Decision**: Use shadcn/ui with copy-paste installation

**Rationale**:

- Components are owned, not imported from node_modules
- Full customization without fighting framework abstractions
- Built on Radix UI (accessibility compliant)
- Tailwind CSS styling (consistent with design system)
- No runtime dependencies for UI components

**Installation Process**:

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Install required components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add switch
npx shadcn@latest add tabs
```

**Configuration**:

```typescript
// components.json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Theme Strategy**:

- CSS variables for color theming
- Dark/light mode toggle using `next-themes`
- Store preference in localStorage

**Alternatives Considered**:

- Material UI: Too opinionated, heavy bundle
- Chakra UI: Good but less customizable
- Ant Design: Enterprise focus, not gaming aesthetic
- **Rejected**: shadcn/ui offers perfect balance of flexibility and completeness

**References**:

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

### 4. TypeScript 5.9.2 Strict Mode Configuration

**Decision**: Enable TypeScript strict mode with project-specific rules

**Rationale**:

- Catch errors at compile time, not runtime
- Better IDE autocomplete and intellisense
- Enforces type safety across 60-feature roadmap
- Required by CONTRIBUTING.md standards

**Configuration**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom", "dom.iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Key Strict Checks**:

- `noImplicitAny`: Must explicitly type parameters
- `strictNullChecks`: Explicit null/undefined handling
- `strictFunctionTypes`: Type-safe function parameters
- `strictPropertyInitialization`: Class properties must be initialized

**References**:

- [TypeScript 5.9 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)
- [TypeScript Strict Mode Guide](https://www.typescriptlang.org/tsconfig#strict)

### 5. Jest 30.2.0 Setup for Unit/Integration Tests

**Decision**: Use Jest with React Testing Library and TypeScript support

**Rationale**:

- Industry standard for React testing
- Fast test execution with parallel workers
- Built-in mocking capabilities
- Snapshot testing for component regression
- Coverage reports out of the box

**Installation**:

```bash
npm install -D jest @jest/globals @types/jest ts-jest jest-environment-jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration**:

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Test Organization**:

- `tests/unit/`: Pure function and component tests
- `tests/integration/`: API route and service tests
- Naming: `*.spec.tsx` for test files

**Alternatives Considered**:

- Vitest: Faster but less ecosystem support
- **Rejected**: Jest's maturity and Next.js integration is superior

**References**:

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing/jest)

### 6. Playwright 1.56.1 for E2E Tests

**Decision**: Use Playwright for end-to-end testing

**Rationale**:

- Multi-browser support (Chromium, Firefox, WebKit)
- Auto-wait eliminates flaky tests
- Built-in test fixtures and page object model
- Network interception for API mocking
- Visual comparison testing
- Trace viewer for debugging

**Installation**:

```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration**:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Test Strategy**:

- Focus on critical user paths
- Test theme toggle functionality
- Test navigation flows
- Test responsive layouts

**Alternatives Considered**:

- Cypress: Great DX but slower, single-browser
- Selenium: Legacy tooling, poor developer experience
- **Rejected**: Playwright offers best balance of speed, reliability, and features

**References**:

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

### 7. ESLint & Prettier Integration

**Decision**: Use existing ESLint config with additional Next.js and TypeScript rules

**Current Configuration**:

- `.eslintrc.js` already exists in repository
- Includes TypeScript, React, and custom rules
- Integrated with VSCode for real-time feedback

**Enhancements Needed**:

```javascript
// .eslintrc.js additions
module.exports = {
  extends: [
    'next/core-web-vitals',
    // ... existing extends
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
```

**Prettier Configuration**:

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**References**:

- [ESLint Next.js Plugin](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [TypeScript ESLint](https://typescript-eslint.io/)

### 8. Markdown Linting with markdownlint

**Decision**: Use existing markdownlint configuration

**Current Setup**:

- `.markdownlint.json` already exists
- Enforces consistent markdown formatting
- Integrated with npm scripts

**Required npm Scripts**:

```json
{
  "scripts": {
    "lint:markdown": "markdownlint '**/*.md' --ignore node_modules",
    "lint:markdown:fix": "npm run lint:markdown -- --fix"
  }
}
```

**References**:

- [markdownlint Documentation](https://github.com/DavidAnson/markdownlint)

### 9. Fly.io Deployment Configuration

**Decision**: Deploy to Fly.io with automatic GitHub Actions integration

**Rationale**:

- Global edge network (low latency)
- Automatic SSL certificates
- Zero-downtime deployments
- Integrated with MongoDB Atlas
- Cost-effective for early stage

**Configuration**:

```toml
# fly.toml
app = "dnd-tracker"
primary_region = "ord"

[build]
  builder = "heroku/buildpacks:20"
  buildpacks = ["heroku/nodejs"]

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[checks]
  [checks.alive]
    type = "tcp"
    interval = "15s"
    timeout = "10s"
```

**Deployment Script**:

```bash
# Deploy to production
fly deploy

# Deploy with specific version
fly deploy --image registry.fly.io/dnd-tracker:v1.0.0
```

**Environment Variables**:

```bash
# Set secrets
fly secrets set MONGODB_URI="mongodb+srv://..."
fly secrets set CLERK_SECRET_KEY="sk_..."
fly secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
```

**Alternatives Considered**:

- Vercel: Great DX but expensive at scale
- Netlify: Good for static, less for full-stack
- AWS/GCP: Too complex for MVP stage
- **Rejected**: Fly.io offers best balance of simplicity and scalability

**References**:

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js on Fly.io Guide](https://fly.io/docs/js/frameworks/nextjs/)

### 10. MongoDB Connection Setup (Basic)

**Decision**: Use Mongoose 8.19.1 with connection pooling

**Rationale**:

- Schema validation with TypeScript support
- Middleware hooks for business logic
- Built-in connection pooling
- Query builder with type safety

**Basic Setup** (detailed models in future features):

```typescript
// src/lib/db/mongoose.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
```

**References**:

- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Next.js MongoDB Example](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose)

### 11. Theme Toggle Implementation Strategy

**Decision**: Use `next-themes` package with CSS variables

**Rationale**:

- No flash of unstyled content
- Respects system preferences
- localStorage persistence
- SSR compatible

**Implementation**:

```typescript
// src/components/theme/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Theme Provider Setup**:

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**References**:

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)

### 12. CI/CD Pipeline with GitHub Actions

**Decision**: Use GitHub Actions for automated testing and deployment

**Rationale**:

- Free for public repositories
- Integrated with GitHub
- Matrix builds for multiple environments
- Secrets management built-in

**Workflow Configuration**:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '25.1.0'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run lint:markdown
      - run: npm run type-check
      - run: npm run test:ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

**Deployment Workflow**:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**References**:

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Fly.io GitHub Actions](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Framework | Next.js 16.0.1 | Latest stable, React 19 support, App Router |
| Styling | Tailwind CSS 4.x | Performance, required by shadcn/ui |
| Components | shadcn/ui | Full customization, accessibility, no runtime deps |
| Testing (Unit) | Jest 30.2.0 | Industry standard, excellent React support |
| Testing (E2E) | Playwright 1.56.1 | Multi-browser, reliable, great DX |
| Database | MongoDB + Mongoose | Flexibility, TypeScript support, PRD requirement |
| Deployment | Fly.io | Simple, scalable, cost-effective |
| CI/CD | GitHub Actions | Integrated, free, powerful |
| Theme | next-themes + CSS vars | SSR compatible, no flash, system preference |

## Roadmap Governance Notes

From Feature-Roadmap.md Phase 1:

✅ All design decisions documented  
✅ Stakeholder design review captured (spec includes acceptance criteria)  
✅ Technology choices align with Tech-Stack.md  
✅ No deviations from PRD §§5.1-5.4, 8.1-8.3 requirements  

## Next Steps

Proceed to Phase 1: Design & Contracts

- Generate quickstart.md (developer onboarding guide)
- Document component usage patterns
- Create environment setup guide
- Update agent context with new technology decisions
