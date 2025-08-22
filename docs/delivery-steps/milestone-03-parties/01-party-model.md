# Party Model Implementation

[Issue #21](https://github.com/dougis-org/dnd-tracker/issues/21)

**Objective:** Create a robust party schema for grouping characters, managing
campaigns, sharing, and supporting templates, with tier-based limits.

**Schema Definition:**

```typescript
// models/Party.ts
import mongoose from "mongoose";

export interface IParty {
  userId: string; // Owner's Clerk ID
  name: string;
  description?: string;
  campaignName?: string;

  // Character Management
  characters: Array<{
    characterId: mongoose.Types.ObjectId;
    playerName?: string;
    playerEmail?: string;
    isActive: boolean;
    joinedAt: Date;
  }>;

  // Sharing & Collaboration
  sharedWith: Array<{
    userId: string;
    role: "viewer" | "editor";
    sharedAt: Date;
  }>;

  // Template System
  isTemplate: boolean;
  templateCategory?: string;

  // Metadata
  maxSize: number; // Based on subscription tier
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Tasks

- [ ] Create Mongoose schema with all fields above
- [ ] Add character limit validation based on user tier
- [ ] Implement sharing and collaboration logic
- [ ] Add support for party templates and categories
- [ ] Add indexes for performance and search
- [ ] Validate and sanitize all input to the party model
- [ ] Write failing tests for party model before implementation (TDD)
- [ ] Write tests for all model logic (CRUD, validation, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for party model and integration

## Acceptance Criteria

- Party schema supports all required fields (characters, sharing, templates, metadata) and matches the schema definition
- Character and party limits are enforced by subscription tier and tested for all tiers
- Sharing and collaboration are functional and tested for all roles
- Templates can be created, edited, and reused, with correct data
- All input to the party model is validated and sanitized
- Automated tests (unit and integration) cover all model logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
