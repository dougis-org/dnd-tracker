# D&D Tracker - Technical Stack

**Last Updated**: 2025-11-01
**Status**: Design Phase

## Overview

This document outlines the technical requirements, dependencies, and infrastructure for the D&D Tracker application. All feature implementations must comply with the versions and standards specified here.

## Runtime & Framework

### Node.js

- **Minimum Version**: 25.1.0 (LTS not required until latest feature available)
- **Usage**: Backend runtime and build tooling

### Next.js

- **Minimum Version**: 16.0+ (16.0.1 as of 2025-11-01)
- **Usage**: Full-stack React framework for frontend and API routes
- **Configuration**: TypeScript enabled, App Router as default

### TypeScript

- **Version**: 5.9.2 (latest stable)
- **Usage**: Type-safe development across frontend and backend
- **Requirement**: Strict mode enabled, 80%+ type coverage

## Frontend Technologies

### React

- **Version**: 19.2.0 (latest, with React 19 stable features)
- **Via**: Next.js 16.0+
- **Usage**: Component-based UI framework
- **Features**: React Server Components, Hooks, concurrent features

### Tailwind CSS

- **Version**: 4.x (latest, with improved performance and DX)
- **Integration**: shadcn/ui uses Tailwind for styling
- **Usage**: Utility-first CSS framework
- **Features**: Container queries, improved bundle size optimization

### shadcn/ui

- **Purpose**: Component library for rapid UI development
- **Configuration**: Pre-configured with Tailwind CSS
- **Usage**: All user interface components

### Jest

- **Version**: 30.2.0+ (latest stable)
- **Purpose**: Unit and integration testing framework
- **Usage**: Component testing, utility function testing, and snapshot testing
- **Coverage Target**: 80%+ on touched code

### Playwright

- **Version**: 1.56.1+ (latest stable)
- **Purpose**: End-to-end testing framework
- **Usage**: E2E test scenarios for critical user flows
- **Coverage Target**: All user-facing workflows

## Backend & Data

### MongoDB

- **Minimum Version**: 8.0+
- **Usage**: NoSQL document database for data persistence
- **Connection**: Cloud Atlas or local instance

### Mongoose

- **Version**: 8.19.1+ (latest stable with improved performance)
- **Purpose**: MongoDB ODM (Object Data Modeling)
- **Usage**: Schema validation, data models, and database interactions
- **Requirement**: Used for all database operations

## Authentication & Third-Party Services

### Clerk

- **Purpose**: Authentication and user management
- **Integration**: Webhook handlers for user lifecycle events
- **Usage**: User registration, login, profile management
- **Features**: Multi-factor authentication, user metadata

### Stripe

- **Purpose**: Payment processing and subscription management
- **Integration**: Checkout sessions, webhook handlers for billing events
- **Usage**: Subscription tiers, billing portal, invoice management
- **Feature Gate**: Monetization for paid features

## Browser APIs & Offline Support

### IndexedDB

- **Purpose**: Client-side storage for offline capability
- **Usage**: Local combat session persistence, caching
- **Feature**: Feature 012 - Offline Combat Capability

### Service Workers

- **Purpose**: Background sync and offline functionality
- **Usage**: Enable offline-first architecture
- **Feature**: Feature 012 - Offline Combat Capability

## Code Quality & Standards

### Testing

- **Framework**: Playwright (E2E), Jest (unit tests)
- **Coverage Target**: 80%+ on touched code
- **Approach**: Test-driven development (TDD)

### Linting & Analysis

- **Tool**: Codacy for code analysis
- **Standards Enforced**:
  - Max file size: 450 lines (uncommented)
  - Max function size: 50 lines
  - No code duplication
  - TypeScript strict mode

### CI/CD

- **Platform**: GitHub Actions
- **Checks**: Linting, type checking, testing, Codacy analysis
- **Requirement**: All checks must pass before merge

## Deployment & Infrastructure

### Hosting

- **Platform**: Fly.io (configured in `fly.toml`)
- **Application**: Next.js full-stack deployment

### Database Hosting

- **Options**: MongoDB Atlas (Cloud), local Docker instance

### Environment

- **Node Environment**: Production, Development, Testing
- **Configuration**: `.env.local` for local secrets

## Browser Support

### Minimum Versions

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile**: iOS Safari 14+, Chrome Android 90+

## Build & Package Manager

### npm

- **Version**: 9.0+ (included with Node 18+)
- **Usage**: Package management and dependency installation
- **Lock File**: `package-lock.json` for reproducible builds

## Architecture Standards

### File Organization

- **Max Lines**: 450 per file (uncommented code)
- **Max Function Size**: 50 lines
- **Code Duplication**: Extract reusable utilities

### API Design

- **Architecture**: RESTful API routes via Next.js
- **Contracts**: Defined in spec documents for each feature
- **Response Format**: JSON with standardized error responses

### Database Schema

- **ODM**: Mongoose for schema definition
- **Validation**: Schema-level and service-level validation
- **Migrations**: Backward-compatible schema updates

## Compliance

All code must adhere to:

- TypeScript strict mode
- Codacy quality standards
- CI/CD checks (no manual overrides)
- 80%+ test coverage on new code
- No code duplication (DRY principle)
- File and function size limits

## Resources

- See `Feature-Roadmap.md` for feature-specific technical requirements
- See `CONTRIBUTING.md` for development workflow and standards
- See individual feature specs in `specs/` directory for detailed requirements
