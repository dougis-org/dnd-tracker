# Feature Specification: Combat Tracker Page

**Feature Branch**: `feature/009-combat-tracker`  
**Created**: 2025-11-11  
**Status**: Draft  
**Input**: User description: "build the combat interface for the application"

**Maintainer**: @doug  
**Canonical components (UI)**: CombatTracker, InitiativeOrder, HPTracker, StatusEffectsPanel, CombatLog  
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load active combat session and view current state (Priority: P1)

A Game Master (GM) needs to see an active combat session's full state: all participants in initiative order, who has the current turn, what round/turn it is, and relevant status effects. This is the foundation for all combat tracking.

**Why this priority**: Core value — without this, the tracker cannot function. This is the UI foundation that all other combat actions build upon.

**Independent Test**: A user can load the combat tracker page with an active session and see (a) initiative order list, (b) current turn highlighted, (c) round/turn counter, (d) status effects for applicable participants. The UI reflects the session state accurately.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an active combat session, **When** they navigate to `/combat`, **Then** the combat tracker page loads and displays the initiative order, current turn indicator, round/turn counter, and participant status effects.
2. **Given** a participant has status effects applied, **When** the tracker loads, **Then** status effect pills are visible on or near that participant's entry with duration countdown.
3. **Given** the session is in round 3, turn 2 of 5 participants, **When** the page loads, **Then** the current turn is highlighted with a distinct visual indicator (e.g., blue border, background highlight) and the round/turn counter displays "Round 3, Turn 2/5".

---

### User Story 2 - Advance turn and round (Priority: P1)

The GM needs to progress combat by moving to the next participant's turn or ending a round. This is performed frequently and must be fast, with clear visual confirmation.

**Why this priority**: Critical for active gameplay flow. Without turn advancement, combat is static and unplayable.

**Independent Test**: From the tracker page, the GM can click "Next Turn" to advance to the next participant. Repeating until reaching the last participant and clicking "Next Turn" increments the round. The UI updates in place with visual confirmation.

**Acceptance Scenarios**:

1. **Given** a participant has the current turn, **When** the GM clicks the "Next Turn" button, **Then** the next participant in initiative order becomes the current turn and the UI highlights them.
2. **Given** the last participant in initiative order has the current turn, **When** the GM clicks "Next Turn", **Then** the round increments by 1 and the first participant becomes the current turn.
3. **Given** the turn has advanced, **When** the UI updates, **Then** the visual change is immediate (no full page reload) and the round/turn counter is updated in real-time.
4. **Given** the GM clicks "Previous Turn", **When** that button exists, **Then** it reverses the turn order and decrements the round if necessary.

---

### User Story 3 - Apply damage/healing to participants (Priority: P1)

The GM needs to quickly apply damage or healing to any participant. This requires quick access to HP controls and visual feedback of HP changes.

**Why this priority**: Core combat mechanics. Damage/healing is performed multiple times per round and must be fast and intuitive.

**Independent Test**: From the tracker, the GM can select a participant, input damage (or healing) amount, and the participant's HP is updated and displayed immediately. The HP bar or number updates in place.

**Acceptance Scenarios**:

1. **Given** a participant is displayed in the initiative order, **When** the GM clicks on or interacts with a damage/healing input field for that participant, **Then** they can enter a damage amount (positive for damage, negative for healing) and press Enter or click a button to apply.
2. **Given** a participant has 50 HP and 30 max HP, **When** the GM applies 15 damage, **Then** the participant's HP updates to 35 and the HP bar (if present) visually reflects the new percentage (35/30 does not show over 100%).
3. **Given** a participant's HP reaches 0 or below, **When** damage is applied, **Then** a visual indicator (e.g., "Unconscious" or "Dead" label, grayed-out appearance, strikethrough) is displayed.
4. **Given** a participant has temporary HP, **When** damage is applied, **Then** temporary HP is depleted first before reducing actual HP.

---

### User Story 4 - Manage status effects (Priority: P2)

The GM needs to apply, view, and remove status effects (e.g., Prone, Restrained, Poisoned) on participants, with visible duration counts or round indicators.

**Why this priority**: Enhances realism and tracks complex combat states. Important but secondary to core turn/HP mechanics.

**Independent Test**: The GM can right-click or click a button on a participant to open a status effect menu, select an effect, set a duration (e.g., number of rounds), and the effect appears as a pill on the participant. Clicking the pill or a remove button removes the effect.

**Acceptance Scenarios**:

1. **Given** a participant in the initiative order, **When** the GM triggers a status effect action (e.g., context menu, button), **Then** a menu or panel appears with common D&D 5e effects (Prone, Restrained, Poisoned, Blinded, Invisible, etc.).
2. **Given** an effect is selected, **When** the GM confirms it, **Then** a duration input appears (or defaults to "until ended"), and the effect is applied to the participant.
3. **Given** a status effect is applied with a duration, **When** the duration is in rounds, **Then** at the end of each round, the duration decrements and displays (e.g., "Prone (2 rounds remaining)").
4. **Given** a status effect pill is displayed on a participant, **When** the GM clicks the X on the pill or removes it via menu, **Then** the effect is immediately removed and the pill disappears.

---

### User Story 5 - Lair action notification (Priority: P2)

When an initiative roll reaches 20 (the point at which lair actions resolve in D&D 5e), the GM should receive a visual prompt or notification to trigger lair actions. This is a turn-order-dependent reminder.

**Why this priority**: Reduces human memory load and ensures lair actions are not forgotten. Important for encounters with legendary creatures.

**Independent Test**: When the current turn reaches a participant with initiative 20, a prominent notification/banner appears prompting the GM to trigger lair actions. Clicking the notification or a button acknowledges it or opens lair action options. The notification dismisses after acknowledgment.

**Acceptance Scenarios**:

1. **Given** an active combat with a participant at initiative 20, **When** the current turn becomes that participant, **Then** a visual notification (e.g., banner, modal, toast) appears with text like "Lair Actions Available" or "Trigger Lair Actions?".
2. **Given** the lair action notification is displayed, **When** the GM clicks a button to trigger or view lair actions, **Then** they are shown a list of available lair actions (if the data is available) or prompted to manually execute one.
3. **Given** a lair action has been triggered or the GM dismisses the notification, **When** the turn advances, **Then** the notification disappears and does not reappear until the next cycle to initiative 20.

---

### User Story 6 - View combat log (Priority: P3)

The GM needs a collapsible or sidebar panel displaying a log of recent combat actions (damage dealt, heals applied, initiative set, status effects added/removed, etc.) for reference and auditing. This is a lower-priority UI component but adds clarity.

**Why this priority**: Useful for reference and debugging, but combat can function without it. Enhances UX but is not blocking.

**Independent Test**: A side panel or collapsible section in the tracker displays a timestamped log of the last 10–20 actions. The log updates as actions are performed. The log can be scrolled and, ideally, filtered by action type or participant.

**Acceptance Scenarios**:

1. **Given** a combat is in progress, **When** damage is applied or a turn advances, **Then** an entry is added to the combat log with timestamp, action type, and details (e.g., "Round 3, Turn 2: Orc Warrior took 12 damage (38/50 HP remaining)").
2. **Given** the combat log panel is visible, **When** the GM scrolls, **Then** older log entries are visible (at least the last 10–20 actions).
3. **Given** the log exists, **When** the GM wants a cleaner UI view, **Then** they can collapse or hide the log panel without affecting the main tracker.

---

### Edge Cases

- **Initiative ties**: If two participants have the same initiative, display them with a clear sub-order (e.g., "Initiative 15a", "Initiative 15b") or sort by Dexterity modifier. The current turn indicator should unambiguously point to one.
- **Zero or negative HP**: Display unconscious/dead state; do not allow HP to go below the minimum that affects death saves (if required).
- **Status effects with no duration**: If an effect has no expiration, display it clearly (e.g., "Prone (permanent)" or just "Prone") and allow the GM to manually remove.
- **Large encounters (50+ participants)**: Ensure the initiative list scrolls smoothly, is not truncated, and remains performant. Consider a vertical list with scroll.
- **Mobile/tablet view**: Ensure HP input and turn controls are touch-friendly; consider larger buttons and full-width layouts.
- **Offline state**: If the app supports offline combat, the tracker should display a notification (e.g., "Offline mode - changes will sync when online").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST load an active combat session from a provided session ID and display all participants in initiative order with their current HP, AC, name, type (monster/character/NPC), and any applied status effects.
- **FR-002**: The system MUST display a clear indicator of the current turn (which participant is acting now) and the current round and turn count (e.g., "Round 3, Turn 2 of 5").
- **FR-003**: The system MUST provide "Next Turn" and "Previous Turn" buttons to advance or rewind the turn order, with automatic round increment/decrement at turn boundaries.
- **FR-004**: The system MUST provide a damage/healing input control for each participant that allows the GM to apply numeric changes to HP, with validation ensuring HP does not exceed max HP or go below a minimum (e.g., 0 or critical threshold).
- **FR-005**: The system MUST display participant HP as a combination of numeric display (e.g., "35/50 HP") and, optionally, a visual bar indicating the remaining health as a percentage.
- **FR-006**: The system MUST provide a status effect management UI (add, view, remove) for each participant, displaying applied effects as pills or tags with optional duration/round counters.
- **FR-007**: The system MUST display a prominent notification or prompt when the current turn reaches initiative 20 (or a configurable lair action trigger), prompting the GM to trigger lair actions.
- **FR-008**: The system MUST provide a collapsible combat log panel or sidebar displaying timestamped entries of recent actions (damage, heals, initiative changes, status effects, turns advanced, etc.), with the ability to scroll and view at least the last 10 actions.
- **FR-009**: The system MUST clearly indicate when a participant is unconscious or dead (HP ≤ 0 or meets D&D unconsciousness criteria) with a visual label and/or distinct styling (e.g., grayed out, strikethrough name).
- **FR-010**: The system MUST display the initiative order as a vertical or horizontal list, sorted by initiative value (highest first), with the current turn visually highlighted and distinct from others.
- **FR-011**: The system MUST support undo/redo of the last action (e.g., damage applied, turn advanced) if the session model provides this capability; if not, a simple "undo last action" button may suffice for MVP.
- **FR-012**: The system MUST be fully responsive and usable on mobile devices (phones and tablets) with touch-friendly controls, appropriately sized buttons, and a layout that does not overflow or become cramped.
- **FR-013**: The system MUST persist any changes (damage, status effects, turn order) to the backend session or local storage, so that a page reload reflects the current state.

### Key Entities

- **CombatSession**: Represents an active combat instance. Attributes: id, encounterId, status (active|paused|ended), currentRoundNumber, currentTurnIndex, participants[], createdAt, updatedAt, owner_id, org_id (nullable).
- **Participant**: Represents an entity participating in combat. Attributes: id, name, displayName, type (monster|character|npc), initiativeValue, maxHP, currentHP, temporaryHP, acValue, statusEffects[] (array of effect objects), notes, metadata (e.g., size, alignment, tags).
- **StatusEffect**: Represents a condition applied to a participant. Attributes: id, name (e.g., "Prone", "Restrained"), durationInRounds (number or null for permanent), appliedAtRound, iconOrCategory (optional), description.
- **CombatLogEntry**: Represents a single action recorded in the combat log. Attributes: id, timestamp, roundNumber, turnIndex, actionType (damage|heal|effect_applied|effect_removed|initiative_set|turn_advanced|round_started), actor (participant ID), target (participant ID, optional), details (object with action-specific data), description (human-readable summary).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of GMs can load a combat session and identify the current turn, round, and all participant HP values without help in under 10 seconds on a modern desktop browser.
- **SC-002**: Applying damage or healing to a participant takes under 2 seconds total (click/tap input, enter value, confirm) and updates the UI immediately without a full page reload.
- **SC-003**: The UI remains responsive (no freezes or frame drops) when managing up to 50 participants in a single combat session on a modern desktop browser; frame rate does not drop below 30 FPS during user interactions.
- **SC-004**: The tracker correctly displays initiative order at least 99% of the time in automated tests; edge cases (ties, same initiative values) are handled with deterministic ordering.
- **SC-005**: Status effects are applied and removed correctly 98% of the time in automated tests; duration countdowns decrement at round transitions.
- **SC-006**: The lair action notification appears within 100 ms of the turn reaching initiative 20 and dismisses immediately upon GM acknowledgment.
- **SC-007**: Mobile touch interactions (clicking buttons, entering HP values) work smoothly on iOS Safari and Android Chrome without requiring zoom or horizontal scroll on a standard phone viewport (375px width).
- **SC-008**: Combat log entries are recorded for at least 95% of tracked actions; filtering or viewing the log responds in under 500 ms.
- **SC-009**: Session state persists after a page reload; reloading the page shows the same round, turn, participant HP, and status effects as before the reload.

---

## Non-functional Considerations (short)

- **Performance**: Prioritize instant visual feedback for user actions (damage, turn advance). Use optimistic UI updates if backend is async.
- **Accessibility**: All buttons and controls must have keyboard access, ARIA labels, and focus indicators. Status effect pills and HP bars should have text alternatives or tooltips.
- **Responsiveness**: Primary concern is a tablet/phone at the gaming table. Ensure buttons are 44×44 px or larger, text is readable in low light, and key controls do not require horizontal scroll.
- **Visual hierarchy**: Highlight the current turn participant prominently; use color (not just size/shape) to convey state (current, ready, unconscious, etc.).

## Clarifications

### Session 2025-11-11

**Q1: Data Persistence Strategy for MVP**

- **Answer**: A (localStorage)
- **Rationale**: Survives page reloads, works offline, no backend required, fully testable. Feature 036 (backend) will integrate later for persistent cross-session storage.

**Q2: Undo/Redo Scope**

- **Answer**: A (Include in Feature 009)
- **Rationale**: Improves UX immediately for combat actions. GMs expect undo/redo in professional tools (Roll20, Foundry). ~2–3 hours added work justified by user experience.

**Q3: Loading & Error States UI**

- **Answer**: A (Loading spinner + error toast)
- **Rationale**: Show loading spinner during session fetch; display error toast if fetch fails. Professional UX, ~1–2 hours work. Graceful degradation deferred to Feature 046.

**Q4: Unconsciousness Handling**

- **Answer**: A (Basic unconsciousness only; death saves deferred)
- **Rationale**: Display HP ≤ 0 and mark as "Unconscious" (visual indicator only). Full death save tracking (3 successes vs. 3 failures) deferred to post-MVP enhancement issue (created as GitHub issue linked to this feature).

## Assumptions

- This feature is UI-first and does NOT implement the CombatSession model or initiative system; those are Features 036 and 037 (Phase 5). For this feature, mock or adapter-backed session data will be used.
- **Persistence**: MVP uses localStorage for session state (survives page reload). Feature 036 (backend) will add cross-session persistence later.
- **Undo/Redo**: Feature 009 includes basic undo/redo for combat actions (turn advance, damage/healing, status effect addition/removal). State stack maintained in component.
- **Error Handling**: Loading spinner during async session fetch; error toast displayed if fetch fails. Session degrades to mock data if unavailable.
- **Unconsciousness**: When HP ≤ 0, participant is marked "Unconscious" with visual indicator. Death save tracking (D&D 5e rules: 3 successes vs. 3 failures) is deferred to post-MVP enhancement (see linked GitHub issue).
- Backend API endpoints (if needed) will be provided or stubbed; frontend will consume them via adapters (in-memory or fetch-based).
- Users are authenticated and have permission to view/edit the current session.
- D&D 5e rules (e.g., initiative ties, unconsciousness at HP ≤ 0) are assumed for basic functionality; custom rules are out of scope.
- No real-time multiplayer synchronization is assumed for this feature (each GM owns their view); collaborative combat is a future feature (Feature 058).

## Out of Scope

- Initiative rolling or automated initiative calculation (Feature 037).
- CombatSession model or backend persistence logic (Feature 036).
- Advanced combat logging or statistics (Feature 046).
- Lair action definitions or execution (defined by encounter/creature data, not this feature).
- Legendary actions or reactions (out of scope for UI; data structures may be passed to the UI but not defined here).
- Custom themes or UI customization (Feature 057).
- Collaborative/shared combat sessions (Feature 058).
- Offline-first reconciliation (Feature 032).

## Next Steps

1. Implement main Combat Tracker page component: `/app/combat/page.tsx` with layout structure.
2. Implement sub-components: InitiativeOrder, HPTracker, StatusEffectsPanel, CombatLog.
3. Create mock/adapter for CombatSession data; use localStorage or in-memory store for MVP.
4. Add unit tests for each component; integration tests for user flows.
5. Add E2E tests for user stories using Playwright.
6. Ensure 80%+ test coverage and ESLint passes.
7. Ready for Phase 5 integration (Features 036–040) when backend models and APIs are ready.
