# User Model Implementation

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

**Implementation Tasks:**

- [ ] Create Mongoose schema
- [ ] Integrate Clerk user sync
- [ ] Add subscription and usage tracking fields
- [ ] Write tests for user model

**Acceptance Criteria:**

- User schema supports Clerk integration
- Subscription and usage fields are present
- Model passes all tests

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
