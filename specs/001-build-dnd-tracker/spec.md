# Feature Specification: MVP D&D Encounter Tracker

**Feature Branch**: `001-read-the-prd`
**Created**: 2025-09-20
**Status**: Draft
**Input**: User description: "read the prd document in the docs folder to learn what we are trying to build, the goal is to deliver iterative versions of the product until we build up to the full fledged item"

## User Scenarios & Testing

### Primary User Story

As a Dungeon Master, I want to track combat encounters efficiently during D&D sessions so that I can focus on storytelling while maintaining accurate initiative order, HP tracking, and status effects for all participants in combat.

### Acceptance Scenarios

1. **Given** I have a party of 4 player characters and 3 monsters, **When** I start a combat encounter, **Then** I can input initiative values and see all participants sorted by initiative order with Dexterity tiebreakers
2. **Given** combat is in progress, **When** a character takes damage or healing, **Then** I can update their HP and see the change reflected immediately with visual indicators
3. **Given** it's initiative count 20 in a lair encounter, **When** the round advances, **Then** I am prompted to trigger lair actions with predefined options
4. **Given** I'm managing multiple status effects, **When** a turn ends, **Then** status effect durations automatically decrement and expired effects are removed
5. **Given** I have created party and encounter data, **When** I close and reopen the application, **Then** all my data persists locally and I can resume where I left off

### Edge Cases

- What happens when two characters have identical initiative and Dexterity scores?
- How does the system handle HP going below 0 or above maximum?
- What occurs when lair actions are configured but the encounter doesn't have a lair?
- How does the system respond when attempting to add more participants than the tier limit allows?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to create and manage character entries with name, race, class, AC, HP (max/current), and Dexterity score
- **FR-002**: System MUST allow users to create and manage monster/NPC entries with name, AC, HP, Dexterity, initiative modifier, and special abilities
- **FR-003**: System MUST automatically sort initiative order by initiative value, then Dexterity score as tiebreaker, then allow manual override
- **FR-004**: System MUST track current turn with clear visual indication and provide next/previous turn controls
- **FR-005**: System MUST allow HP modification through damage and healing with undo functionality
- **FR-006**: System MUST support status effect application with automatic duration tracking and round-based decrements
- **FR-007**: System MUST support lair actions with automatic prompts on initiative count 20
- **FR-008**: System MUST provide round tracking with automatic advancement
- **FR-009**: System MUST persist all encounter data locally using browser storage
- **FR-010**: System MUST enforce Free Adventurer tier limits (1 party, 3 encounters, 10 creatures, 6 max participants)
- **FR-011**: System MUST provide user authentication through Clerk integration
- **FR-012**: System MUST display user's current subscription tier and usage metrics
- **FR-013**: Users MUST be able to save party compositions as reusable templates
- **FR-014**: Users MUST be able to save encounter configurations for reuse
- **FR-015**: System MUST provide clear upgrade prompts when users approach tier limits

### Key Entities

- **Character**: Represents player characters with core D&D attributes including combat stats and player assignment information
- **Monster/NPC**: Represents non-player combatants with stat blocks, special abilities, and initiative modifiers
- **Party**: Collection of characters that represent a gaming group, with reusable templates
- **Encounter**: Combat scenario containing selected participants, initiative order, and environmental settings
- **Status Effect**: Temporary conditions applied to participants with duration tracking and automated removal
- **Lair Action**: Special environmental effects triggered automatically on initiative count 20
- **User**: Account holder with subscription tier, usage tracking, and personalized settings
- **Combat Session**: Active encounter instance with real-time state management and turn progression

## Review & Acceptance Checklist

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

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
