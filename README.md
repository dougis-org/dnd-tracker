# D&D Encounter Tracker

The D&D Encounter Tracker is a web application designed to help Dungeon Masters (DMs) manage combat encounters in their Dungeons & Dragons games. It provides a comprehensive set of tools for tracking initiative, hit points, status effects, and more, allowing DMs to focus on storytelling and creating immersive experiences for their players.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6fddc67727784840a00ac69db4978e5d)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/6fddc67727784840a00ac69db4978e5d)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Best Practices](#best-practices)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

## Features

This application offers a range of features to streamline combat management, including:

- **Party and Encounter Management:** Create and manage parties of characters and design challenging encounters with various creatures.
- **Initiative Tracking:** Easily track the turn order of all combatants, with automatic sorting based on initiative rolls and Dexterity scores.
- **HP and Status Effect Management:** Keep track of character and monster hit points, as well as any status effects or conditions that may affect them.
- **Lair and Legendary Actions:** Support for special actions and environmental effects to create more dynamic and challenging boss battles.
- **Subscription Tiers:** A freemium model that offers additional features and resources for subscribers, such as cloud storage, advanced analytics, and collaborative tools.

## Tech Stack

The D&D Encounter Tracker is built on a modern, robust technology stack to ensure a high-quality user experience and maintainable codebase.

### Frontend

- **Framework:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for components
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) and [TanStack Query](https://tanstack.com/query/v5)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation

### Backend

- **Runtime:** [Node.js](https://nodejs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **API:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Testing and Quality

- **Unit Testing:** [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **End-to-End Testing:** [Playwright](https://playwright.dev/)
- **Code Quality:** [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)

## Best Practices

This project adheres to a strict set of best practices to ensure code quality, maintainability, and collaboration.

- **Test-Driven Development (TDD):** All new features and bug fixes must be accompanied by a comprehensive suite of tests.
- **Conventional Commits:** Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to ensure a clear and consistent commit history.
- **Code Style:** The codebase is formatted using [Prettier](https://prettier.io/) and linted with [ESLint](https://eslint.org/) to maintain a consistent style.
- **Static Analysis:** [Codacy](https://www.codacy.com/) is used to perform static analysis and ensure code quality.

## Getting Started

To get started with the D&D Encounter Tracker, you will need to have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed on your machine.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/dnd-tracker.git
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add the necessary environment variables. You can use the `.env.example` file as a template.

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. **Open your browser:**

   Navigate to `http://localhost:3000` to see the application in action.

## Database Migrations

This project uses `migrate-mongoose` to manage database schema changes. Migrations are stored in the `migrations` directory.

### Creating a Migration

To create a new migration file, run the following command:

```bash
npm run migrate:create <migration-name>
```

Replace `<migration-name>` with a descriptive name for your migration (e.g., `add-new-field-to-character`).

### Running Migrations

To apply all pending migrations, run the following command:

```bash
npm run migrate:up
```

This will run all migrations that have not yet been applied to the database.

### Rolling Back Migrations

To roll back the most recent migration, run the following command:

```bash
npm run migrate:down
```

## Party Model

The Party model allows grouping characters for campaigns, sharing with other users, and creating reusable templates. Key features:

- **Fields:**
  - `userId`: Owner's Clerk ID
  - `name`, `description`, `campaignName`: Party details
  - `characters`: Array of character objects (with player info, active status, join date)
  - `sharedWith`: Array of users with roles (`viewer` or `editor`)
  - `isTemplate`, `templateCategory`: Template support
  - `maxSize`: Character limit (enforced by subscription tier)
  - `createdAt`, `updatedAt`: Timestamps

- **Validation:**
  - Character count is validated against `maxSize` (tier limit)
  - All input is sanitized by Mongoose schema

- **Usage:**
  - Use the Party model for campaign management, sharing, and template creation
  - See `src/models/Party.ts` and `src/models/__tests__/Party.test.ts` for implementation and tests

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information on how to contribute to this project.
