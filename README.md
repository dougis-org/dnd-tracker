# D&D Encounter Tracker

The D&D Encounter Tracker is a web application designed to help Dungeon Masters (DMs) manage combat encounters in their Dungeons & Dragons games. It provides a comprehensive set of tools for tracking initiative, hit points, status effects, and more, allowing DMs to focus on storytelling and creating immersive experiences for their players.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6fddc67727784840a00ac69db4978e5d)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/6fddc67727784840a00ac69db4978e5d)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

## Features

- 🎲 **Initiative Tracking**: Manage turn order with Dexterity-based tiebreakers
- ❤️ **HP & AC Management**: Track hit points and armor class for all participants
- 🎭 **Character Management**: Support for class, race, and level tracking
- ⚡ **Legendary & Lair Actions**: Full support for complex creature abilities
- 🌓 **Dark/Light Theme**: Comfortable interface for any lighting condition
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 25.x or higher
- npm 9.x or higher
- MongoDB 8.0+ (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dougis-org/dnd-tracker.git
   cd dnd-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration values (see `.env.example` for details).

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

### Core Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Run Markdown linting
npm run lint:markdown

# Run Markdown linting with auto-fix
npm run lint:markdown:fix
```

### Testing

```bash
# Run unit tests (watch mode)
npm test

# Run tests once with coverage
npm run test:ci

# Run tests in parallel
npm run test:ci:parallel

# Run coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Deployment

```bash
# Deploy to Fly.io
npm run deploy

# Or use flyctl directly
flyctl deploy
```

## Tech Stack

- **Framework**: Next.js 16.0.1 (React 19.0.0)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.x, shadcn/ui
- **Database**: MongoDB 8.0+ (Mongoose 8.19.1)
- **Testing**: Jest 30.2.0, Playwright 1.56.1
- **Deployment**: Fly.io
- **Authentication**: Clerk (planned)
- **Payments**: Stripe (planned)

For complete technical specifications, see [docs/Tech-Stack.md](docs/Tech-Stack.md).

## Project Structure

```text
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── theme/       # Theme provider and toggle
│   │   └── layouts/     # Layout components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/            # End-to-end tests
├── docs/                # Documentation
└── specs/               # Feature specifications
```

## Environment Variables

Key environment variables required for development:

- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key (optional for initial setup)
- `CLERK_SECRET_KEY`: Clerk secret key (optional for initial setup)
- `NEXT_PUBLIC_APP_URL`: Application URL

See `.env.example` for complete list and descriptions.

## Table of Contents

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information on how to contribute to this project.

## Developer setup: local pre-commit checks

This repository includes a Husky pre-commit hook that runs the following checks before allowing a commit:

- `npm run lint` (ESLint)
- `npm run lint:markdown` (markdownlint)
- `npm run build` (Next.js build — ensures TypeScript/Next compile)

These checks are also enforced in CI, but running them locally at commit-time prevents waiting for CI feedback and keeps the main branch healthier.

To enable the Git hooks on your machine, run:

```bash
# install dependencies (this runs the `prepare` script which installs husky hooks)
npm install

# OR, if you prefer to install husky manually:
npx husky install

# Make sure the hook file is executable (Unix/macOS)
chmod +x .husky/pre-commit
```

Notes:

- The `prepare` script in `package.json` runs `husky install` automatically on `npm install`.
- The first time you run `npm install` after pulling these changes, Husky will create the necessary Git hook shims under `.git/hooks` so the `.husky/pre-commit` script will run on commit.
- If you ever need to skip hooks for a single commit, use `git commit --no-verify` (use sparingly).

Repo policy: because adding dev dependencies changed `package.json`, this project requires a security scan after dependency changes. If you have the Codacy CLI available, run:

```bash
codacy_cli_analyze --rootPath /home/doug/ai-dev-2/dnd-tracker --tool trivy
```

If the Codacy CLI is not installed, follow your usual org process for running the scan, or ask me and I can attempt to run it (I may need permission or the CLI available in this environment).
