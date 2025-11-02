# D&D Encounter Tracker - Documentation

## Project Overview

The D&D Encounter Tracker is a modern web application designed to help Dungeon Masters efficiently manage combat encounters in Dungeons & Dragons 5th Edition campaigns. Built with Next.js and TypeScript, the platform offers intuitive initiative tracking, HP/AC management, status effects, legendary actions, lair actions, and comprehensive combat logging.

### Core Mission

Enable Dungeon Masters to focus on storytelling and player engagement by streamlining combat management with a reliable, fast, and intuitive digital tool.

### Key Features

- **Combat Management**: Initiative tracking with Dexterity tiebreakers, HP/AC tracking, status effects, and turn-by-turn combat flow
- **Entity Management**: Characters, monsters/NPCs, parties, and encounters with full D&D 5e stat support
- **Offline-First**: Works without internet connection with automatic sync when online
- **Freemium Model**: Free tier with usage limits, premium tiers unlock advanced features and higher limits
- **Mobile-Optimized**: Responsive design for tablets and phones at the gaming table

## Documentation Index

### Getting Started

- **[Contributing Guidelines](../CONTRIBUTING.md)** - Code standards, workflows, and contribution process
- **[Tech Stack](./Tech-Stack.md)** - Technology choices, architecture decisions, and tooling
- **[Feature Roadmap](./Feature-Roadmap.md)** - Development timeline, feature tracking, and progress

### Product & Design

- **[Product Requirements](./Product-Requirements.md)** - Complete product specification and business requirements
- **[Technical Design](./design/dnd-tracker-technical-design.md)** - System architecture and technical specifications
- **[API Design](./design/dnd-tracker-api-design.md)** - REST API endpoints and contracts
- **[Database Design](./design/dnd-tracker-database-design.md)** - MongoDB schema and data models

### Development Workflow

- **[Testing Strategy](../TESTING.md)** - Test approach, tools, and quality standards
- **[Deployment](../DEPLOYMENT.md)** - Deployment process and infrastructure
- **[Slash Commands](./Slash-Commands.md)** - AI agent commands for development workflow

## Project Status

**Current Phase**: Phase 1 - UI Foundation & Site Structure  
**Progress**: 1 of 60 features complete (1.7%)  
**Latest Release**: Feature 001 - Project Setup & Design System ✅  
**Next Up**: Feature 002 - Navigation & Not Implemented Page

See [Feature-Roadmap.md](./Feature-Roadmap.md) for detailed progress tracking.

## Development Principles

1. **Test-Driven Development (TDD)**: Write tests first, implement features second
2. **Incremental Delivery**: Small, deployable features completed in 1-2 days
3. **Quality First**: All code must pass linting, type checking, and tests before merge
4. **Documentation**: Keep docs updated alongside code changes
5. **User-Centered**: Focus on DM experience and ease of use at the gaming table

## Tech Stack Summary

- **Framework**: Next.js 16 (App Router) with TypeScript 5.9
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **Authentication**: Clerk for user management
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Stripe for subscription billing
- **Testing**: Jest (unit/integration) + Playwright (E2E)
- **Deployment**: Fly.io with automated CI/CD
- **Offline**: Service Workers + IndexedDB

## Quick Links

- [GitHub Repository](https://github.com/dougis-org/dnd-tracker)
- [Project Board](https://github.com/orgs/dougis-org/projects/1)
- [Live Application](https://dnd-tracker.fly.dev) _(coming soon)_

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Code standards and style guide
- Git workflow and PR process
- Testing requirements
- Review process and quality gates

All contributors must follow the established patterns in the Tech Stack and align with the Feature Roadmap delivery schedule.

## License

Copyright © 2025 Doug Hubbard. All rights reserved.
