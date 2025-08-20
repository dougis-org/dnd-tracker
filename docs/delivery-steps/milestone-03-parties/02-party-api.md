# Party API Implementation

**Objective:** Build robust API endpoints for party management, including CRUD, sharing, templates, tier enforcement, and error handling.

**API Endpoints:**

- **GET /api/parties** – List all parties owned by or shared with the user (with character and template info)
- **POST /api/parties** – Create a new party (enforces tier limits)
- **PUT /api/parties/:id** – Update party details, members, or template status
- **DELETE /api/parties/:id** – Delete a party (removes from user usage count)
- **POST /api/parties/:id/share** – Share a party with another user (role-based)
- **POST /api/parties/:id/template** – Convert a party to/from a template
- **POST /api/parties/import** – Import party from JSON
- **GET /api/parties/export/:id** – Export party to JSON

**Example: GET all parties for user**

```typescript
// app/api/parties/route.ts
import { auth } from "@clerk/nextjs";
import { Party } from "@/models/Party";

export async function GET() {
  const { userId } = auth();
  const parties = await Party.find({
    $or: [{ userId }, { "sharedWith.userId": userId }],
  }).populate("characters.characterId");
  return Response.json(parties);
}
```

**Implementation Tasks:**

- [ ] Create all CRUD endpoints
- [ ] Add character assignment and removal endpoints
- [ ] Implement sharing and role management
- [ ] Add template conversion endpoints
- [ ] Enforce party and character limits by tier
- [ ] Implement import/export endpoints
- [ ] Add error handling and validation
- [ ] Write tests for all endpoints

**Acceptance Criteria:**

- All endpoints are implemented and documented
- Tier and sharing rules are enforced
- Templates and import/export work as expected
- API returns clear errors for invalid actions
- All endpoints are covered by tests
