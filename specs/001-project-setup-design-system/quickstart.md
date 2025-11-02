# Developer Quickstart Guide: D&D Tracker

**Last Updated**: 2025-11-01
**Target Audience**: New developers joining the D&D Tracker project

## Prerequisites

### Required Software

- **Node.js**: Version 25.1.0 (use nvm for version management)
- **npm**: Version 9.0+ (included with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with extensions below)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "orta.vscode-jest",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Accounts Needed

- **GitHub**: For repository access
- **MongoDB Atlas**: Free tier for development database
- **Clerk**: Free tier for authentication (dev environment)
- **Fly.io**: Account for deployment (optional for local dev)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/dougis-org/dnd-tracker.git
cd dnd-tracker
```

### 2. Install Node.js 25.1.0

Using nvm (recommended):

```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 25.1.0
nvm install 25.1.0
nvm use 25.1.0

# Verify installation
node --version  # Should show v25.1.0
npm --version   # Should show 9.x+
```

### 3. Install Dependencies

```bash
npm install
```

This will install:

- Next.js 16.0.1
- React 19.2.0
- TypeScript 5.9.2
- Tailwind CSS 4.x
- shadcn/ui components
- Testing libraries (Jest, Playwright)
- All other dependencies from package.json

### 4. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local credentials:

```bash
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dnd-tracker?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Stripe (for billing features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Getting MongoDB URI

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (M0 Free tier)
3. Create database user (username + password)
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string from "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster>` in URI

#### Getting Clerk Keys

1. Create free account at [Clerk](https://clerk.com/)
2. Create new application
3. Go to "API Keys" in dashboard
4. Copy "Publishable Key" and "Secret Key"
5. For webhooks: Go to "Webhooks" → Add Endpoint → Use ngrok URL

### 5. Database Setup

The application will automatically connect to MongoDB on first run. To verify:

```bash
# Start development server
npm run dev

# If connection successful, you'll see:
# ✓ MongoDB connected successfully
```

## Development Workflow

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Open browser to http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run all tests (CI mode)
npm run test:ci
```

### Code Quality Checks

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run TypeScript compiler check
npm run type-check

# Run markdown linting
npm run lint:markdown

# Fix markdown issues
npm run lint:markdown:fix

# Run all checks (what CI runs)
npm run validate
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run start
```

## Project Structure

```text
dnd-tracker/
├── src/                      # Source code
│   ├── app/                  # Next.js app router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Global styles
│   │   ├── (auth)/           # Auth pages route group
│   │   ├── (dashboard)/      # Dashboard pages route group
│   │   └── api/              # API routes
│   │       └── v1/           # API version 1
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── theme/            # Theme components
│   │   └── layouts/          # Layout components
│   ├── lib/                  # Utilities and libraries
│   │   ├── db/               # Database utilities
│   │   ├── utils/            # Helper functions
│   │   ├── validations/      # Zod schemas
│   │   └── hooks/            # Custom React hooks
│   └── types/                # TypeScript type definitions
├── tests/                    # Test files
│   ├── unit/                 # Jest unit tests
│   ├── integration/          # Jest integration tests
│   └── e2e/                  # Playwright E2E tests
├── public/                   # Static assets
├── docs/                     # Documentation
│   ├── Product-Requirements.md
│   ├── Feature-Roadmap.md
│   ├── Tech-Stack.md
│   └── design/               # Design documents
├── specs/                    # Feature specifications
│   └── 001-project-setup-design-system/
├── .github/                  # GitHub configuration
│   ├── workflows/            # CI/CD pipelines
│   └── instructions/         # AI agent instructions
└── Configuration files...    # Root config files
```

## Common Development Tasks

### Adding a New Page

```bash
# Create new page in app router
touch src/app/my-page/page.tsx

# Example: src/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>
}

# Page automatically available at /my-page
```

### Adding a New API Route

```bash
# Create API route file
touch src/app/api/v1/my-endpoint/route.ts

# Example: src/app/api/v1/my-endpoint/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}

# API available at /api/v1/my-endpoint
```

### Adding a New Component

```bash
# Create component file
touch src/components/MyComponent.tsx

# Example with shadcn/ui Button
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button>Click Me</Button>
}
```

### Installing shadcn/ui Components

```bash
# List available components
npx shadcn@latest add --help

# Add a specific component
npx shadcn@latest add button

# Component installed to src/components/ui/button.tsx
```

### Creating a Database Model

```bash
# Create model file
touch src/lib/db/models/MyModel.ts

# Example Mongoose model
import mongoose from 'mongoose'

const mySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

export const MyModel = mongoose.models.MyModel || 
  mongoose.model('MyModel', mySchema)
```

### Writing Tests

#### Unit Test Example

```typescript
// tests/unit/components/MyComponent.spec.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders button with text', () => {
    render(<MyComponent />)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})
```

#### E2E Test Example

```typescript
// tests/e2e/my-flow.spec.ts
import { test, expect } from '@playwright/test'

test('user can navigate to page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=My Page')
  await expect(page).toHaveURL('/my-page')
})
```

## Git Workflow

### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/123-feature-name

# Bug fix branches
git checkout -b fix/456-bug-description

# Hotfix branches
git checkout -b hotfix/789-critical-fix
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>: <description>

# Examples:
git commit -m "feat: add user profile page"
git commit -m "fix: resolve theme toggle bug"
git commit -m "test: add character creation tests"
git commit -m "docs: update quickstart guide"
git commit -m "refactor: extract validation logic"
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following code standards
3. **Run all checks**: `npm run validate`
4. **Commit changes** with conventional commits
5. **Push branch**: `git push origin feature/123-feature-name`
6. **Create PR** on GitHub
7. **Wait for CI** to pass (tests, linting, type-check)
8. **Address review** feedback if any
9. **Auto-merge** activates when approved and checks pass

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:

- Verify MongoDB URI in `.env.local`
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Clerk Authentication Issues

**Error**: `Clerk: Missing publishable key`

**Solution**:

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
- Ensure `.env.local` is not in `.gitignore`
- Restart development server after env changes

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors

**Error**: `Cannot find module '@/components/...'`

**Solution**:

- Check `tsconfig.json` has path mapping configured
- Verify file exists at expected path
- Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

### Test Failures

**Error**: Tests fail locally but pass in CI

**Solution**:

- Clear Jest cache: `npm test -- --clearCache`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version matches: `node --version`

## Code Standards

### File Size Limits

- **Max 450 lines per file** (excluding comments)
- **Max 50 lines per function**
- If exceeded, refactor into multiple files/functions

### Type Safety

- **TypeScript strict mode** enabled
- **No `any` types** without explicit justification
- **Zod validation** for all API inputs

### Test Coverage

- **80%+ coverage** on all new code
- **Unit tests** for business logic
- **Integration tests** for API routes
- **E2E tests** for critical user flows

### Code Style

- **Functional components** with hooks (React)
- **Consistent naming**: kebab-case for files, camelCase for variables
- **DRY principle**: Extract repeated code
- **Clear function names**: Descriptive, not abbreviated

## Resources

### Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guidelines
- [Product Requirements](../docs/Product-Requirements.md) - Product specifications
- [Tech Stack](../docs/Tech-Stack.md) - Technology decisions
- [Feature Roadmap](../docs/Feature-Roadmap.md) - Development plan

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Jest](https://jestjs.io/docs/getting-started)
- [Playwright](https://playwright.dev/docs/intro)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/docs/)

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Q&A and community support
- **Pull Request Comments**: Code-specific questions

### Before Asking for Help

1. Check this quickstart guide
2. Search existing GitHub issues
3. Review CONTRIBUTING.md
4. Try troubleshooting steps above

### When Asking for Help

Include:

- Error message (full stack trace)
- Steps to reproduce
- Your environment (OS, Node version, etc.)
- What you've already tried

## Next Steps

Once setup is complete:

1. **Read CONTRIBUTING.md** for full development guidelines
2. **Review Feature-Roadmap.md** to understand project scope
3. **Look at open issues** to find tasks to work on
4. **Run the test suite** to verify everything works
5. **Make a small change** to familiarize yourself with the workflow

Welcome to the D&D Tracker project! 🎲
