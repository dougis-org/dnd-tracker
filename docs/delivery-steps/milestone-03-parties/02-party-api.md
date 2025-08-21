# Party API Implementation

[Issue #22](https://github.com/dougis-org/dnd-tracker/issues/22)

**Objective:** Build robust API endpoints for party management, including CRUD, sharing, templates, tier enforcement, and error handling.

## API Endpoints

- **GET /api/parties** – List all parties owned by or shared with the user (with character and template info)
- **POST /api/parties** – Create a new party (enforces tier limits)
- **PUT /api/parties/:id** – Update party details, members, or template status
- **DELETE /api/parties/:id** – Delete a party (removes from user usage count)
- **POST /api/parties/:id/share** – Share a party with another user (role-based)
- **POST /api/parties/:id/template** – Convert a party to/from a template
- **POST /api/parties/import** – Import party from JSON
- **GET /api/parties/export/:id** – Export party to JSON

### Example: GET all parties for user

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

## Implementation Tasks

- [ ] Create all CRUD endpoints
- [ ] Add character assignment and removal endpoints
- [ ] Implement sharing and role management
- [ ] Add template conversion endpoints
- [ ] Enforce party and character limits by tier
- [ ] Implement import/export endpoints
- [ ] Add error handling and validation for all endpoints
- [ ] Validate and sanitize all input to API endpoints
- [ ] Write failing tests for API before implementation (TDD)
- [ ] Write tests for all API logic (CRUD, validation, error, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update API documentation for all endpoints

## Acceptance Criteria

- All endpoints are implemented, follow RESTful conventions, and are documented
- Tier and sharing rules are enforced and tested for all scenarios
- Templates and import/export work as expected, with correct data and error handling
- API returns clear, actionable errors for all invalid actions and edge cases
- All input to API endpoints is validated and sanitized
- Automated tests (unit and integration) cover all API logic, validation, and error handling (80%+ coverage)
- Manual testing confirms all API flows, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new API endpoints are documented in the project API docs
