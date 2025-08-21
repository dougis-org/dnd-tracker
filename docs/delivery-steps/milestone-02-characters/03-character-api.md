# Character API Implementation ([#14](https://github.com/dougis-org/dnd-tracker/issues/14))

**Objective:** Build RESTful API endpoints for character CRUD operations.

**API Endpoints:**

**GET /api/characters** – Get all characters for the authenticated user

```typescript
// app/api/characters/route.ts
import { auth } from "@clerk/nextjs";
import { Character } from "@/models/Character";

export async function GET() {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const characters = await Character.find({ userId }).sort("-updatedAt");
  return Response.json(characters);
}
```

**POST /api/characters** – Create a new character

```typescript
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const character = await Character.create({ ...data, userId });

  // Update user's character list
  await User.findOneAndUpdate(
    { clerkId: userId },
    { $push: { characters: character._id } }
  );

  return Response.json(character, { status: 201 });
}
```

## Implementation Tasks

- [ ] Create all CRUD endpoints
- [ ] Add validation middleware (Zod or similar)
- [ ] Implement error handling for all endpoints
- [ ] Add pagination support
- [ ] Create character duplication endpoint
- [ ] Validate and sanitize all input to API endpoints
- [ ] Write failing tests for API before implementation (TDD)
- [ ] Write tests for all API logic (CRUD, validation, error, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update API documentation for all endpoints

## Acceptance Criteria

- All CRUD endpoints are implemented and follow RESTful conventions
- Validation and error handling are present for all endpoints (invalid input returns correct HTTP status and message)
- Pagination and duplication are supported and tested
- All input to API endpoints is validated and sanitized
- Automated tests (unit and integration) cover all API logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new API endpoints are documented in the project API docs
