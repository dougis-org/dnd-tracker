# MongoDB Atlas Setup

**GitHub Issue:** [#5](https://github.com/dougis-org/dnd-tracker/issues/5)

## Objective

Configure MongoDB connection and basic schemas

## Tasks

- [ ] Create MongoDB Atlas account
- [ ] Set up cluster
- [ ] Configure network access (whitelist IPs)
- [ ] Create database user
- [ ] Install Mongoose
- [ ] Create database connection utility
- [ ] Set up connection pooling
- [ ] Create base schemas
- [ ] Write failing tests for connection and schema validation before implementation (TDD)
- [ ] Validate and sanitize all input to database
- [ ] Document all new environment variables in `.env.example`
- [ ] Update documentation for database setup and usage

## Acceptance Criteria

- MongoDB Atlas cluster is created and accessible
- Network access is restricted to required IPs only
- Database user is created with least privilege required
- Mongoose and types are installed and imported with no errors
- Database connection utility is implemented and throws clear errors if misconfigured
- Connection pooling is enabled and tested under load
- Base schemas are created, validated, and tested (including edge cases)
- All input to database is validated and sanitized
- All new environment variables are loaded from `.env` and documented in `.env.example`
- Automated tests (unit and integration) cover connection, schema validation, and error handling (80%+ coverage)
- Manual testing confirms connection, CRUD, and error scenarios
- All setup and usage steps are documented in the project README

## Dependencies

```bash
pnpm add mongoose mongodb
pnpm add -D @types/mongoose
```

## Environment Variables

```env
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/dnd-tracker?retryWrites=true&w=majority
```

## Connection Utility (lib/mongodb.ts)

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}
```
