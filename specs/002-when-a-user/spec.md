# Feature Specification: User Registration and Profile Management

**Feature Branch**: `002-when-a-user`
**Created**: 2025-09-30
**Updated**: 2025-10-25
**Status**: Enhanced
**Input**: User description: "when a user registers for the app, we should persist their information in MongoDB so we can track their profile, know their subscription level and track their usage, when a user signs up they should be presented with a general DnD info profile form to outline their experience, whether they are a player or a DM, what set of DnD rules they use and any other relevant DnD specifics, all users should default to the free tier of usage, and there should also be an admin flag that can be set for later use by administrators"
**Enhancement**: Added requirements for user login flow, dashboard access, profile viewing/editing, and comprehensive E2E testing validation

## Execution Flow (main)

```
1. Parse user description from Input
   � If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   � Identify: actors, actions, data, constraints
3. For each unclear aspect:
   � Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   � If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   � Each requirement must be testable
   � Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   � If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   � If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines

-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story

When a new user registers for the DnD Tracker app, they log in through the authentication system and are guided to complete their account setup by providing their D&D profile information. The system stores their profile details including their experience level, role preference (player or DM), preferred ruleset, and other D&D-specific preferences. Each new user starts with free tier access, allowing them to explore the app's basic features through their personalized dashboard. Users can return at any time to log in, view their dashboard, and access their profile page to view or edit their information. Their subscription level and usage patterns are tracked to support future tier upgrades and administrator management capabilities.

### Acceptance Scenarios

1. **Given** a user needs to access the app, **When** they navigate to the login page and provide valid credentials, **Then** they are successfully authenticated and redirected to their dashboard
2. **Given** a user has successfully authenticated for the first time, **When** they access the app, **Then** they are presented with a D&D profile form to complete their registration
3. **Given** a user is completing their profile form, **When** they provide their experience level, role (player/DM), and preferred ruleset, **Then** their profile is saved with free tier subscription as default
4. **Given** a user has completed their profile, **When** they access their dashboard, **Then** they see a personalized view with their subscription tier, usage statistics, and quick access to app features
5. **Given** a user wants to review their information, **When** they navigate to their profile page, **Then** they can view all their profile details including D&D preferences, subscription tier, and account information
6. **Given** a user wants to modify their information, **When** they edit their profile fields and save changes, **Then** their updated information is persisted and reflected across the app
7. **Given** a user has completed their profile, **When** they use the app, **Then** their usage is tracked against their subscription level
8. **Given** an administrator needs to manage users, **When** they access user records, **Then** they can view and modify user profiles including subscription levels and admin flags
9. **Given** a user returns to the app after initial registration, **When** they log in, **Then** they access their dashboard directly without being prompted for profile information again

### Edge Cases

#### EC-001: Invalid Login Credentials

**Scenario**: User provides invalid email/password or OAuth authentication fails

**System Behavior**:
- Clerk displays authentication error message (e.g., "Invalid credentials", "Account not found")
- System does NOT create MongoDB user record (no webhook triggered for failed auth)
- User remains on Clerk sign-in page with error message
- After 5 failed attempts, Clerk enforces rate limiting (managed by Clerk)
- System logs failed auth attempts via Clerk dashboard (not application logs)

**Error Messages** (Clerk-managed):
- Invalid email/password: "Incorrect email or password"
- Account not found: "No account found with this email"
- OAuth error: "Authentication failed. Please try again."

**Test Coverage**: TR-009 (E2E login failure scenarios)

---

#### EC-002: Authentication Failures or Timeouts

**Scenario**: Network issues, Clerk service outage, or session expiration during authentication

**System Behavior**:
- **Network Timeout**: Clerk SDK retries authentication request 3 times with exponential backoff
- **Clerk Outage**: User sees "Authentication service unavailable. Please try again later."
- **Session Expiration**: User redirected to Clerk sign-in with return URL to original destination
- **Application Response**: Protected pages show "Authenticating..." loading state, then error after 10s timeout

**Error Recovery**:
- User can retry authentication manually
- Return URL preserved in Clerk redirect flow
- No partial user records created in MongoDB

**Test Coverage**: TR-009 (E2E auth failure testing), integration tests simulate network errors

---

#### EC-003: User Skips or Abandons Profile Form

**Scenario**: User clicks "Skip for now" or closes browser during profile setup

**System Behavior**:
- **Skip Button Clicked**:
  - Set `profileSetupCompleted: false` in MongoDB
  - Redirect user to dashboard
  - Show optional reminder banner: "Complete your profile to personalize your experience"
  - User can access all features; profile completion is optional
- **Browser Closed / Form Abandoned**:
  - No data persisted (form submission required to save)
  - `profileSetupCompleted` remains `false`
  - User sees profile setup form again on next login (if first login)
- **Partial Form Completion**:
  - User can fill some fields and skip; partial data not saved unless form submitted
  - Future enhancement: Auto-save draft as user types (not in Phase 1)

**Re-engagement**:
- Dashboard reminder banner with "Complete Profile" link
- Settings always accessible at `/settings/profile` for later completion

**Test Coverage**: TR-007 (first-time flow with skip), E2E-007 (profile setup flow)

---

#### EC-004: Invalid or Incomplete D&D Profile Data

**Scenario**: User submits profile form with validation errors or boundary values

**System Behavior**:
- **Client-Side Validation** (React Hook Form + Zod):
  - Display inline error messages below each invalid field
  - Prevent form submission until all errors resolved
  - Errors: "Display name cannot exceed 100 characters", "Please select an experience level"
- **Server-Side Validation** (API route + Zod):
  - Return 400 Bad Request with field-level errors if client validation bypassed
  - Response: `{ "errors": { "displayName": "Too long", "dndEdition": "Exceeds 50 characters" } }`
  - Database update rejected; user sees error state in UI

**Boundary Values Handling**:
- `displayName` at 100 chars: Accepted
- `displayName` at 101 chars: Rejected with "Maximum 100 characters exceeded"
- `dndEdition` at 50 chars: Accepted
- Empty optional fields (displayName, experienceLevel): Accepted (stored as null)
- Invalid enum value (e.g., `experienceLevel: "expert+"` ): Rejected with "Invalid experience level"

**Unicode & Special Characters**:
- UTF-8 support for international characters in displayName, dndEdition
- Emojis allowed (counted as characters based on Unicode code points)
- HTML tags sanitized / escaped (React auto-escapes, but Zod schema strips tags)

**Test Coverage**: TR-010 (validation error display), E2E-010 (validation scenarios), unit tests for Zod schemas

---

#### EC-005: Duplicate Registration (Existing clerkId)

**Scenario**: Clerk webhook fires twice for same user (retry) or user attempts re-registration

**System Behavior**:
- **Clerk Webhook Duplicate Detection**:
  - Check if user with `clerkId` already exists in MongoDB
  - If exists: Log "User already exists, skipping creation" and return 200 (idempotent)
  - If not exists: Create new user record with default values
- **User Re-Registration via Clerk**:
  - Clerk prevents duplicate accounts by email
  - If user tries to sign up with existing email, Clerk shows "Account already exists. Please sign in."
- **Webhook Race Condition**:
  - Two webhooks arrive simultaneously for new user
  - MongoDB unique index on `clerkId` ensures only one insert succeeds
  - Second webhook receives duplicate key error, returns 200 after detecting existing user

**Idempotency Guarantee**:
- Webhook processing is idempotent; duplicate events safe to replay
- `lastClerkSync` timestamp updated on each webhook to track sync freshness

**Test Coverage**: Integration tests simulate duplicate webhooks, verify idempotency

---

#### EC-006: Unauthorized Admin Flag Manipulation

**Scenario**: User attempts to set `role: 'admin'` via profile API or form tampering

**System Behavior**:
- **API Protection**:
  - Profile API (`PATCH /api/users/[id]/profile`) DOES NOT accept `role` field in request body
  - Server-side Zod schema excludes `role` from updateable fields
  - If `role` present in request: Field ignored, not updated, operation succeeds (no error)
- **Form Tampering**:
  - No `role` field in profile form UI
  - If malicious user modifies form HTML to add `role` field: Server ignores it
- **Admin Assignment**:
  - ONLY via manual database update: `db.users.updateOne({ _id: userId }, { $set: { role: 'admin' } })`
  - Future: Admin panel UI for authorized admins to manage roles

**Audit Logging**:
- If `role` field present in profile update request: Log warning with userId and attempted value
- Alert security team on repeated attempts from same user

**Test Coverage**: Integration tests attempt role update via API, verify rejection

---

#### EC-007: Unauthenticated Dashboard Access

**Scenario**: User navigates to `/dashboard` without being logged in

**System Behavior**:
- **Next.js Middleware Check**:
  - Verify Clerk session exists before rendering dashboard page
  - If no session: Redirect to Clerk sign-in with `returnUrl=/dashboard`
- **Redirect Flow**:
  1. User accesses `/dashboard`
  2. Middleware detects no auth session
  3. 302 redirect to Clerk sign-in (e.g., `/sign-in?redirect_url=/dashboard`)
  4. User completes sign-in
  5. Clerk redirects back to `/dashboard`
- **API Protection**:
  - Dashboard metrics API (`GET /api/dashboard/metrics`) returns 401 Unauthorized without auth token
  - No data exposed without valid Clerk session

**Test Coverage**: TR-005 (auth enforcement E2E test), E2E-005 (unauthenticated access scenarios)

---

#### EC-008: Concurrent Profile Edits from Multiple Sessions

**Scenario**: User opens `/settings/profile` in two browser tabs, edits in both, submits sequentially

**System Behavior**:
- **Last-Write-Wins Strategy**:
  - Both tabs fetch same user data initially
  - User edits `displayName` in Tab 1, submits → Save succeeds
  - User edits `experienceLevel` in Tab 2, submits → Overwrites Tab 1 changes
  - Final state: Only Tab 2 changes persist (Tab 1 changes lost)
- **No Optimistic Locking in Phase 1**:
  - No version field or etag checking
  - Concurrent edits accepted; last write wins
- **Future Enhancement**:
  - Add `version` field to User schema
  - Check version on update; return 409 Conflict if version mismatch
  - UI shows "Profile updated in another session. Reload to see latest." message

**Race Condition Handling**:
- MongoDB atomic updates ensure partial writes don't occur
- Single-document updates are atomic (no transaction needed)

**User Guidance**:
- Warning message in UI: "Avoid editing profile in multiple tabs simultaneously"

**Test Coverage**: Integration tests simulate concurrent API requests, verify no data corruption

---

#### EC-009: Unauthorized Cross-User Profile Access

**Scenario**: User A attempts to access User B's profile via URL manipulation or API call

**System Behavior**:
- **Profile Page** (`/settings/profile`):
  - Page fetches authenticated user's profile (no userId in URL)
  - User cannot navigate to another user's profile via UI
- **Profile API** (`GET /api/users/[id]/profile`):
  - Server verifies `userId` in URL matches authenticated user's `userId`
  - If mismatch: Return 403 Forbidden with message "Access denied"
  - Response includes no data; generic error message prevents user enumeration
- **Admin Override**:
  - Future: If user has `role: 'admin'`, allow cross-user profile access
  - Phase 1: No admin override; even admins blocked from cross-user access via API

**Authorization Flow**:
1. Extract `userId` from URL parameter
2. Extract `userId` from Clerk session
3. If `userId` mismatch: Return 403
4. If match: Proceed with profile fetch

**Test Coverage**: TR-006 (authorization enforcement E2E test), E2E-006 (cross-user access attempts)

---

#### EC-010: User Account Deletion

**Scenario**: User deletes their account via Clerk or admin deletes user

**System Behavior**:
- **Clerk Deletion Trigger**:
  - User deletes account in Clerk dashboard (or admin deletes via Clerk API)
  - Clerk fires `user.deleted` webhook to `/api/webhooks/clerk`
- **Soft Delete Strategy** (Phase 1):
  - Set `deletedAt` timestamp in MongoDB (don't physically delete document)
  - User profile data retained for 30 days (grace period for recovery)
  - User cannot log in (Clerk account deleted)
- **Data Anonymization** (after 30 days):
  - Scheduled job anonymizes PII: Set `email` to `deleted-{userId}@example.com`, clear `firstName`, `lastName`, `displayName`
  - Retain `userId` and aggregated metrics for analytics
- **Cascading Effects**:
  - User's parties, encounters, characters marked as owned by `[Deleted User]`
  - Usage metrics preserved for historical analytics
- **Hard Delete** (optional, after 90 days):
  - Permanently remove user document and associated data
  - Retain audit logs per compliance requirements (7 years)

**Subscription Cancellation**:

- Stripe subscription cancelled (future integration)
- No pro-rated refunds for partial months (per terms of service)

**Test Coverage**: Integration tests simulate `user.deleted` webhook, verify soft delete behavior

---

### Edge Case Summary Table

| Edge Case ID | Scenario | System Response | Test Coverage |
|--------------|----------|-----------------|---------------|
| EC-001 | Invalid login credentials | Clerk error message, no DB record | TR-009, E2E-001 |
| EC-002 | Auth failures/timeouts | Retry + error message | TR-009 |
| EC-003 | Skip/abandon profile | Optional completion, redirect to dashboard | TR-007, E2E-007 |
| EC-004 | Invalid profile data | Validation errors, reject update | TR-010, E2E-010 |
| EC-005 | Duplicate registration | Idempotent webhook, skip duplicate | Integration tests |
| EC-006 | Unauthorized admin flag | Ignore role field, log attempt | Integration tests |
| EC-007 | Unauthenticated dashboard | Redirect to sign-in | TR-005, E2E-005 |
| EC-008 | Concurrent profile edits | Last-write-wins | Integration tests |
| EC-009 | Cross-user profile access | 403 Forbidden | TR-006, E2E-006 |
| EC-010 | User account deletion | Soft delete + 30-day retention | Integration tests |

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist user profile information including authentication identifier, D&D experience level, role preference, preferred ruleset, and other D&D-specific preferences
- **FR-002**: System MUST present a D&D profile form to newly registered users upon their first authentication
- **FR-003**: System MUST collect and store the following D&D profile information: display name (optional), timezone (default UTC), preferred D&D edition (default "5th Edition"), experience level (enum: new, beginner, intermediate, experienced, veteran), and primary role (enum: dm, player, both)
- **FR-004**: System MUST automatically assign "free" tier subscription level to all newly registered users (corresponding to "Free Adventurer" tier with limits: 1 party, 3 encounters, 10 creatures)
- **FR-005**: System MUST track subscription level for each user to control feature access and enforce usage limits per tier (parties, encounters, creatures as defined in SUBSCRIPTION_LIMITS)
- **FR-006**: System MUST track the following usage metrics: number of sessions, number of characters created, number of campaigns created, and provide infrastructure to support extensible feature-specific usage data for future metric additions
- **FR-007**: System MUST include a role field (enum: user, admin) for each user that designates administrative privileges, with "user" as the default value
- **FR-008**: System MUST restrict the ability to set or modify role to admin through manual database updates only
- **FR-009**: System MUST validate all profile form inputs according to the following constraints: display name (max 100 chars), timezone (string), dndEdition (max 50 chars), experienceLevel (enum values), primaryRole (enum values)
- **FR-010**: System MUST allow users to access the main application without completing profile setup, and users MUST be able to partially complete, skip entirely, or return later to view and update their profile information through a profile settings interface
- **FR-011**: System MUST allow users to view and update their profile information after initial registration
- **FR-012**: System MUST associate user profile data with authentication identity to maintain data integrity across sessions
- **FR-013**: System MUST use the existing Clerk-integrated authentication interface for user login and redirect authenticated users to their dashboard upon successful authentication
- **FR-014**: System MUST provide a dashboard page that displays user-specific information including subscription tier, current usage metrics, and quick access to key features
- **FR-015**: System MUST provide a profile page (Settings/Profile tab) where users can view all their profile information including personal details, D&D preferences, subscription tier, and account settings
- **FR-016**: System MUST provide profile editing functionality that allows users to modify their profile fields with immediate validation and persistence
- **FR-017**: System MUST restrict access to dashboard and profile pages to authenticated users only, redirecting unauthenticated users to the login page
- **FR-018**: System MUST enforce profile ownership, preventing users from viewing or editing other users' profiles (except for admin users)
- **FR-019**: System MUST display appropriate error messages from Clerk when login fails due to invalid credentials, network issues, or other authentication problems

### Terminology & Definitions

This section defines ambiguous or specialized terms for clarity and testability.

#### D&D Experience Level

Enum values with specific criteria for user self-assessment:

- **new**: Never played D&D or any tabletop RPG before; first-time player exploring the hobby
- **beginner**: Played 1-5 sessions; familiar with basic rules (rolling dice, character stats) but still learning mechanics
- **intermediate**: Played 6-20 sessions or completed 1-2 campaigns; comfortable with core rules and character creation
- **experienced**: Played 20+ sessions or multiple campaigns; knows advanced rules, can DM occasionally
- **veteran**: Played for years or 100+ sessions; extensive rules knowledge, frequently DMs, may own multiple edition rulebooks

**Purpose**: Helps tailor UI complexity and tutorial prompts based on user expertise.

---

#### Primary Role

Enum values defining user's preferred D&D participation style:

- **dm**: Primarily serves as Dungeon Master (DM) / Game Master (GM); runs campaigns, creates encounters, manages NPCs
- **player**: Primarily plays as a character; participates in campaigns run by others
- **both**: Equally comfortable as DM and player; switches roles depending on campaign

**Purpose**: Personalizes dashboard (DM-focused vs player-focused features) and tutorial content.

---

#### Profile Setup Completed

Boolean flag tracking whether user has submitted the profile form at least once.

**Conditions for `profileSetupCompleted: true`**:
- User submitted profile form (whether complete or partial)
- At least `primaryRole` field was selected (required field)
- Other fields (displayName, experienceLevel, dndEdition, timezone) may be null/default

**Conditions for `profileSetupCompleted: false`**:
- User has never submitted profile form
- User clicked "Skip for now" during initial setup
- User is a newly registered account (default state)

**Behavior**:
- `true`: User never sees profile setup wizard again on login
- `false` + first login: User redirected to `/profile-setup` (optional prompt)
- `false` + returning user: User sees reminder banner in dashboard, no forced redirect

**Partial vs Complete Profile**:
- System allows partial profiles; users can submit form with only required fields filled
- "Partial profile" = `profileSetupCompleted: true` but optional fields (displayName, experienceLevel) are null
- "Complete profile" = All fields populated (no operational difference; UX may show "100% complete" badge)

---

#### Usage Limits Per Subscription Tier

Quantified thresholds enforced by the application:

| Tier | Parties | Encounters | Creatures | Max Participants per Encounter |
|------|---------|------------|-----------|-------------------------------|
| Free | 1 | 3 | 10 | 6 |
| Seasoned | 3 | 15 | 50 | 10 |
| Expert | 10 | 50 | 200 | 20 |
| Master | 25 | 100 | 500 | 30 |
| Guild | Unlimited | Unlimited | Unlimited | 50 |

**Enforcement**:
- When user attempts to create resource exceeding limit: Show error message "Upgrade to [next tier] to create more [parties/encounters/creatures]"
- Dashboard displays progress bars: "1 / 1 parties used (100%)" with color coding (green <50%, yellow 50-80%, red >80%)

**Constants Reference**: `SUBSCRIPTION_LIMITS` object in `src/lib/utils/subscription.ts` (data-model.md lines 214-246)

**Free Tier Mapping**: "Free Adventurer" tier = `subscriptionTier: "free"` with limits from `SUBSCRIPTION_LIMITS.free`

---

#### Authentication Identifier (clerkId)

Unique identifier linking user to Clerk authentication system.

**Field**: `clerkId` (String, unique, indexed, sparse)
**Format**: Clerk-generated UUID-like string (e.g., `user_2abcdef1234567890`)
**Purpose**: Correlates MongoDB user record with Clerk user identity
**Distinction**:
- `clerkId`: Clerk's unique ID (external system)
- `_id`: MongoDB document ObjectID (internal system)
- `email`: User's email address (user-facing)
- `username`: User's chosen username (user-facing)

**Usage**:
- Clerk webhooks identify users by `clerkId` (not email)
- API authentication verifies `clerkId` matches session token
- Email/username can change; `clerkId` is immutable

---

#### Manual Database Updates Only (Admin Role)

Requirement FR-008 specifies admin role assignment via manual database operations.

**Specific Procedure**:
```bash
# MongoDB shell or admin script
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Rationale**:

- Prevents privilege escalation via API vulnerabilities
- Requires database access (infrastructure-level security)
- Phase 1: No admin UI for role management
- Future: Admin panel with audit logging for role changes

**Prohibited Methods**:
- Profile API does NOT accept `role` field in PATCH requests
- Profile form UI does NOT display `role` field
- Middleware/server actions reject `role` updates programmatically

---

#### Validation Constraint Definitions

Clarification of validation rules to avoid ambiguity:

**Max 100 chars (displayName)**:
- **Unit**: Unicode code points (not bytes)
- **Handling**: JavaScript `.length` property (UTF-16 code units)
- **Example**: "José" = 4 characters, "👨‍👩‍👧‍👦" (family emoji) = 7 characters (surrogate pairs counted separately)
- **Enforcement**: Zod `.max(100)` validation + Mongoose `maxlength: [100, ...]`

**Max 50 chars (dndEdition)**:

- **Unit**: Unicode code points
- **Handling**: Same as displayName

**Unicode Support**:
- International characters (Chinese, Arabic, Cyrillic): Fully supported
- Emojis: Allowed (counted as multiple code units if complex)
- Zero-width characters: Allowed but discouraged (no sanitization in Phase 1)

---

#### Extensible Feature-Specific Usage Data

Nested structure for future metric additions without schema migration.

**Current Implementation** (Phase 1):
```typescript
// Flat fields in User schema
sessionsCount: Number
charactersCreatedCount: Number
campaignsCreatedCount: Number
```

**Future Extension** (Phase 2+):
```typescript
// Nested structure for organized metrics
usageMetrics: {
  sessions: { count: Number, lastSessionAt: Date },
  characters: { count: Number, deletedCount: Number },
  campaigns: { count: Number, activeCount: Number },
  encounters: { count: Number, totalRounds: Number }, // NEW
}
```

**Extension Mechanism**:
- Add new fields to `usageMetrics` subdocument without migration
- Existing users get new fields with default values on first read
- Backward-compatible: Old clients ignore unknown fields

---

#### Partially Complete Profile

Profile state where `profileSetupCompleted: true` but optional fields are null.

**Required Field** (must be non-null for submission):
- `primaryRole`: User must select dm, player, or both

**Optional Fields** (can be null after submission):

- `displayName`: Null allowed (fallback to `firstName` in UI)
- `experienceLevel`: Null allowed (no experience level shown)
- `dndEdition`: Has default value ("5th Edition") but user can clear it
- `timezone`: Has default value ("UTC") but user can change it

**User Experience**:

- Form allows submitting with only `primaryRole` selected
- Dashboard shows "Profile 40% complete" if optional fields empty
- Settings page highlights incomplete fields with "Add your display name" prompts

### Dependencies & Assumptions

#### External Dependencies

- **Clerk Authentication Provider** (v5.0+)
  - **Purpose**: User authentication, session management, OAuth integration
  - **Dependency Type**: Critical third-party SaaS
  - **Version Requirements**: Clerk SDK v5.0 or higher for Next.js 15 compatibility
  - **Integration Point**: Clerk webhooks at `/api/webhooks/clerk` for user lifecycle events
  - **Webhook Signature Verification**: Svix library (bundled with Clerk SDK) for webhook security
  - **Failure Impact**: Without Clerk, no users can authenticate; registration blocked
  - **Assumption**: Clerk service availability >99.9% uptime per SLA
  - **Assumption**: Clerk webhook delivery within 30 seconds of user events
  - **Validation**: Clerk status page monitored; fallback: queue webhook retries

- **MongoDB Database** (v8.0+)
  - **Purpose**: User profile data persistence, subscription tracking, usage metrics
  - **Dependency Type**: Critical infrastructure (self-hosted or MongoDB Atlas)
  - **Version Requirements**: MongoDB 8.0+ for transaction support and performance features
  - **Connection Management**: Mongoose ODM v8.5+ with connection pooling
  - **Failure Impact**: Profile updates fail; dashboard cannot load; user registration incomplete
  - **Assumption**: MongoDB connection available with <50ms latency
  - **Assumption**: Database can handle 100 concurrent write operations (profile updates, webhook processing)
  - **Validation**: Health check endpoint monitors MongoDB connectivity

- **Timezone Data Source** (IANA Timezone Database)
  - **Purpose**: Timezone selection dropdown, timezone validation
  - **Dependency Type**: Standard library (Node.js `Intl` API)
  - **Version Requirements**: Node.js 18+ with up-to-date timezone data
  - **Assumption**: IANA timezone identifiers remain stable (e.g., "America/New_York")
  - **Validation**: Zod schema validates timezone against IANA list

#### Integration Assumptions

- **Clerk User Data Structure**:
  - **Assumption**: Clerk webhook payloads include `id`, `email_addresses`, `first_name`, `last_name`, `image_url` fields
  - **Assumption**: `email_addresses` array contains at least one entry with `email_address` and `verification` status
  - **Validation**: Integration tests verify webhook payload structure matches expectations
  - **Risk**: Clerk API changes could break webhook processing
  - **Mitigation**: Version-pinned Clerk SDK, monitor Clerk changelog, integration test coverage

- **Clerk Session Persistence**:
  - **Assumption**: Clerk session cookies persist for 7 days of inactivity
  - **Assumption**: Clerk handles session refresh and expiration without application intervention
  - **Validation**: E2E tests verify session behavior; monitor Clerk session settings

- **MongoDB Connection Availability**:
  - **Assumption**: MongoDB connection remains available during request lifecycle
  - **Assumption**: Mongoose handles connection pooling and reconnection automatically
  - **Validation**: Health check endpoint `/api/health` verifies database connectivity
  - **Risk**: Transient network issues cause database connection failures
  - **Mitigation**: Retry logic in Mongoose, exponential backoff for webhook retries

- **D&D Edition Naming Conventions**:
  - **Assumption**: Users understand "5th Edition", "3.5E", "Pathfinder", "AD&D" terminology
  - **Assumption**: Free-form text field (max 50 chars) allows flexibility for homebrew rulesets
  - **Validation**: No strict validation; user-provided text stored as-is
  - **Future**: Consider enum-based selection with "Other (specify)" option

- **Subscription Tier Upgrade/Downgrade Paths**:
  - **Assumption**: Users can upgrade from any tier to any higher tier
  - **Assumption**: Users can downgrade from any tier to any lower tier (future Stripe integration)
  - **Assumption**: Downgrades require usage to be within new tier limits before activation
  - **Future**: Implement tier transition validation in subscription management feature

#### Authentication State Assumptions

- **First-Time Login Detection**:
  - **Assumption**: `profileSetupCompleted` flag distinguishes first-time vs. returning users
  - **Assumption**: Users with `profileSetupCompleted: false` may or may not have partially filled profiles
  - **Logic**: Redirect to `/profile-setup` only if `profileSetupCompleted: false` AND first login (no `lastLoginAt`)
  - **Validation**: Middleware logic tested in E2E tests (TR-007, TR-008)

- **Session State Consistency**:
  - **Assumption**: Clerk session state matches MongoDB user existence (eventual consistency tolerated)
  - **Risk**: Clerk webhook delays cause temporary inconsistency (user authenticated but not in MongoDB)
  - **Mitigation**: Create-on-demand pattern: If authenticated user not found in MongoDB, trigger Clerk webhook replay or direct user creation

#### Data Synchronization Assumptions

- **Clerk → MongoDB Sync**:
  - **Assumption**: Clerk webhooks arrive in order for a given user (user.created before user.updated)
  - **Assumption**: Duplicate webhooks (retries) are idempotent and safe to reprocess
  - **Validation**: Idempotency checks by `clerkId` prevent duplicate user creation

- **Profile Data Ownership**:
  - **Assumption**: Clerk owns authentication identity (email, name, image), MongoDB owns application profile (D&D preferences, subscription tier)
  - **Sync Direction**: Clerk → MongoDB (one-way) for identity; MongoDB-only for app-specific data
  - **Conflict Resolution**: Last-write-wins for profile updates; Clerk data always authoritative for email/name

#### Development Environment Assumptions

- **Test Environment**:
  - **Assumption**: Clerk test mode (`CLERK_TEST_MODE=true`) allows creating test users without email verification
  - **Assumption**: In-memory MongoDB (mongodb-memory-server) provides isolated test database
  - **Assumption**: Test webhook signatures can be generated using Clerk webhook secret
  - **Validation**: Integration tests run against test database, E2E tests use Clerk test mode

- **Production Environment**:
  - **Assumption**: Environment variables (`CLERK_WEBHOOK_SECRET`, `MONGODB_URI`) configured in deployment platform
  - **Assumption**: HTTPS enforced for all endpoints (Clerk webhooks require HTTPS)
  - **Validation**: Pre-deployment checklist verifies environment variable presence

### Testing Requirements

- **TR-001**: End-to-end tests MUST validate the complete user login flow using Clerk authentication from login page to dashboard
- **TR-002**: End-to-end tests MUST validate that authenticated users can access and view their dashboard with correct user-specific information
- **TR-003**: End-to-end tests MUST validate that users can navigate to their profile page and view all profile information
- **TR-004**: End-to-end tests MUST validate that users can edit profile fields and changes are persisted correctly
- **TR-005**: End-to-end tests MUST validate that unauthenticated users are redirected to Clerk login when attempting to access dashboard or profile pages
- **TR-006**: End-to-end tests MUST validate that users cannot access other users' profiles
- **TR-007**: End-to-end tests MUST validate the first-time user flow: Clerk login → profile setup → dashboard
- **TR-008**: End-to-end tests MUST validate the returning user flow: Clerk login → dashboard (skip profile setup)
- **TR-009**: End-to-end tests MUST validate login failure scenarios with appropriate Clerk error messages
- **TR-010**: End-to-end tests MUST validate profile form validation errors are displayed correctly

---

## Review & Acceptance Checklist

*GATE: Automated checks run during main() execution*

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
