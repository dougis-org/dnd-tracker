# Feature 016: User Dashboard with Real Data

## Summary

Connect the existing Dashboard Page (Feature 004) to real MongoDB user data. Display authenticated user's subscription tier, real-time resource usage metrics (characters, parties, encounters), personalized welcome, and empty states for new users.

## Scope

- Implement `/api/v1/dashboard/usage` endpoint to fetch user data
- Update Dashboard components to load and display real data
- Add progress bars with color-coding (green/yellow/red)
- Handle errors gracefully
- Support all subscription tiers (free_adventurer, seasoned_adventurer, expert_dungeon_master, master_of_dungeons, guild_master)

## User Stories

### P1: Core Dashboard Data Display

**US-001**: As a user, I want to see my current subscription tier and resource limits so I understand my DM capabilities

**US-002**: As a user, I want to see my current resource usage with visual progress indicators so I know how close I am to my limits

### P2: Empty State & Navigation

**US-003**: As a new user, I want to see guidance on how to get started

**US-004**: As a user, I want quick navigation to create new resources

## Key Decisions

- **Tier Limits**: Centralized constant in `src/types/subscription.ts`
- **Cache Strategy**: No caching on API response (`Cache-Control: no-store`) and SWR with `revalidateOnFocus: false`
- **Error Handling**: User-friendly messages with retry button (max 3 attempts)
- **Loading State**: Animated skeleton screen
- **Dependency Fallback**: Default counts to 0 if resource APIs not available
- **Activity Feed (P3)**: Deferred to Feature 017
