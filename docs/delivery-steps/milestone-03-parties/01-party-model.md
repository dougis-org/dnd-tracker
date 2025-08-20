# Party Model Implementation

**Objective:** Create a robust party schema for grouping characters, managing campaigns, sharing, and supporting templates, with tier-based limits.

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

**Implementation Tasks:**

- [ ] Create Mongoose schema with all fields above
- [ ] Add character limit validation based on user tier
- [ ] Implement sharing and collaboration logic
- [ ] Add support for party templates and categories
- [ ] Add indexes for performance and search
- [ ] Write tests for all model logic

**Acceptance Criteria:**

- Party schema supports all required fields (characters, sharing, templates, metadata)
- Character and party limits are enforced by subscription tier
- Sharing and collaboration are functional
- Templates can be created and reused
- Model passes all tests and validation
