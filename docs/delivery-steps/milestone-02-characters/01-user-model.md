# User Model Implementation ([#12](https://github.com/dougis-org/dnd-tracker/issues/12))

**Objective:** Create User schema with Clerk integration and subscription tracking.

**Schema Definition:**

```typescript
// models/User.ts
import mongoose from "mongoose";

export interface IUser {
  // Clerk Integration
  clerkId: string; // Primary identifier from Clerk
  email: string;
  username: string;
  imageUrl?: string;

  // Role Management
  role: "player" | "dm" | "admin";

  // Subscription Information
  subscription: {
    tier: "free" | "seasoned" | "expert" | "master" | "guild";
    status: "active" | "canceled" | "past_due" | "trialing";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    trialEndsAt?: Date;
  };

  // Usage Tracking (for tier limits)
  usage: {
    parties: number;
    encounters: number;
    creatures: number;
    lastResetDate: Date;
  };
}
```

## Implementation Tasks

- [ ] Create Mongoose schema for user
- [ ] Integrate Clerk user sync logic
- [ ] Add subscription and usage tracking fields
- [ ] Validate and sanitize all input to the user model
- [ ] Write failing tests for user model before implementation (TDD)
- [ ] Write tests for all model logic (CRUD, validation, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for user model and integration

## Acceptance Criteria

- User schema supports Clerk integration and all required fields (see schema)
- Subscription and usage fields are present and correctly typed
- All input to the user model is validated and sanitized
- Automated tests (unit and integration) cover all model logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README

```typescript
const userSchema = new mongoose.Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // ... rest of schema
  },
  {
    timestamps: true,
  }
);
```
