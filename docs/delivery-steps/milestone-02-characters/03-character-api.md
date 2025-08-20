# Character API Implementation

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

**Implementation Tasks:**

- [ ] Create all CRUD endpoints
- [ ] Add validation middleware
- [ ] Implement error handling
- [ ] Add pagination support
- [ ] Create character duplication endpoint

**Acceptance Criteria:**

- All CRUD endpoints are implemented
- Validation and error handling are present
- Pagination and duplication are supported
- API passes all tests
