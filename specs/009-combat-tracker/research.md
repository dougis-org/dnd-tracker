# Research: Combat Tracker Feature (F009)

**Date**: 2025-11-11  
**Feature**: Feature 009 — Combat Tracker Page  
**Input**: Clarifications from spec.md + Constitution requirements  
**Status**: ✅ Complete

---

## Overview

This document captures research and design decisions for the Combat Tracker MVP. It resolves all "NEEDS CLARIFICATION" items from the technical planning process and documents best practices adopted from industry standards (D&D 5e rules, gaming UI/UX, React patterns).

---

## 1. D&D 5e Lair Action Rules & Integration

### Research Question

How should lair action notifications be triggered? What is the standard D&D 5e rule?

### Finding

**D&D 5e Official Rule (Xanathar's Guide)**: Lair actions occur on initiative count 20 (losing ties). They are not participant turns but occur at a fixed point in the initiative order.

**In-Game Practice**: GMs often track lair actions separately:

- Before the first round, the GM announces "Lair actions on initiative 20"
- Each round, when the 20 count is reached, the GM resolves lair actions
- Lair actions are NOT tied to any creature's turn

### Decision

✅ **Use initiative 20 as default trigger** with configurable override.

**Implementation**:

- CombatSession includes `lairActionInitiative: number` field (default 20)
- When `currentTurnIndex` advances to a participant with `initiativeValue === lairActionInitiative`, trigger notification
- Notification displays: "Lair Actions Available" with "Trigger" / "Dismiss" buttons
- User cannot dismiss permanently; re-appears each cycle (e.g., next round at initiative 20)

**Why This Design**:

- Stays true to D&D 5e rules
- Configurable for homebrew rules (e.g., initiative 25, or custom threshold)
- Notification is non-blocking (doesn't halt turn flow)
- GMs can quickly dismiss and resume turn order

### Code Impact

- `LairActionNotification` component checks `currentTurnIndex` and compares next/current participant's `initiativeValue`
- Logic in `CombatTracker` or helper: `shouldShowLairActionNotification(session) → boolean`
- Storage: `CombatSession.lairActionInitiative` (Zod schema)

### Testing

- Unit test: `advanceTurn()` with participant at initiative 20 → notification flag set
- E2E test: Navigate to round with initiative 20, verify banner appears

**References**:

- Xanathar's Guide to Everything, p. 6–7 (Lair Actions)
- Roll20 implementation (reference): Lair action prompts on turn 20

---

## 2. Status Effect Duration & Round Tracking

### Research Question

When a status effect has "3 rounds" duration, when does it countdown? At the start of a round, end of a round, or at the end of each participant's turn?

### Finding

**D&D 5e Official Rule**: Duration is tied to the **end of the affected creature's turn** or **end of their next turn(s)**. Examples:

- "Ends on a successful save" (immediate, creature's turn)
- "Lasts until the end of your next turn" (condition ends after the affected creature's turn)
- "Lasts for X minutes" (real-world time, not combat rounds)

**In-Game Practice**: Most digital tools (Roll20, Foundry) track duration as:

- **Duration in rounds**: Decrements when each round ends (after the last participant acts)
- **Visual display**: "Prone (2 rounds remaining)" → next round becomes "1 round remaining"

### Decision

✅ **Decrement effect duration at end of each round** (not per-turn).

**Implementation**:

- `StatusEffect.durationInRounds`: number of rounds remaining (not total)
- When `currentTurnIndex` wraps to 0 (round advances), decrement all effect durations by 1
- Remove effects with `durationInRounds <= 0`
- Log: "Round X ended, X status effects decremented"

**Why This Design**:

- Simpler UI (no per-turn countdown noise)
- Matches Roll20/Foundry UX
- Easier to test and reason about
- Allows future granularity per creature's turn (Feature X)

### Code Impact

- `combatHelpers.ts` → `decrementEffectDurations(participants, roundsToDecrement = 1)`
- Called in `advanceTurn()` when wrapping to next round
- `CombatLog` entry created: "Round ended, effect durations decremented"
- Component: `StatusEffectsPanel` displays "X rounds" or "Permanent"

### Testing

- Unit test: After 3 rounds with 3-round effect, effect removed
- E2E test: Apply 2-round effect, advance turns, verify duration display updates

---

## 3. Temporary HP Handling & Damage Application

### Research Question

How should temporary HP interact with damage? Which pool is depleted first?

### Finding

**D&D 5e Official Rule (PHB, p. 198)**:
> "When you take damage, temporary hit points are lost first, and any leftover damage carries over to your normal hit points."

**Example**:

- Creature has 30 HP, 10 temp HP
- Takes 15 damage
- Result: 0 temp HP, 25 HP (30 - 5 remaining damage)

**Healing & Temp HP**:

- Healing never restores temp HP (temp HP only from spells/abilities)
- Damage applies to temp HP first, then current HP
- Temp HP can exceed max HP (e.g., cast "Temporary Hit Points (20)" on 50/50 HP creature → 50/50 + 20 temp)

### Decision

✅ **Implement standard D&D 5e damage order: temp HP first, then current HP.**

**Implementation**:

- `applyDamage(participant, damage: number) → Participant`
  1. Damage temp HP first: `newTempHP = max(0, currentTempHP - damage)`
  2. Remaining damage: `remaining = damage - (currentTempHP - newTempHP)`
  3. Apply remaining to current HP: `newCurrentHP = currentHP - remaining`
  4. Clamp current HP: `newCurrentHP = max(currentHP, newCurrentHP)` (can go negative for tracking overkill)
  5. Return updated participant
- `applyHealing(participant, healing: number) → Participant`
  1. Healing only restores current HP, not temp HP
  2. `newCurrentHP = min(maxHP, currentHP + healing)`
  3. Return updated participant

**UI Display**:

- Show temp HP separately (tooltip, separate bar, or "10 temp" badge)
- When damage input applied, show temp HP → current HP transition

**Why This Design**:

- Matches D&D 5e canon
- Clear UI (two separate pools)
- Simple logic, easy to test

### Code Impact

- `combatHelpers.ts` → `applyDamage()`, `applyHealing()` (pure functions)
- `HPTracker.tsx` → Display temp HP separately; input form specifies "damage" vs "healing"
- Schema: `ParticipantSchema` already includes `temporaryHP` field

### Testing

- Unit test: Damage with temp HP, without temp HP, overkill
- Unit test: Healing never affects temp HP
- E2E test: Apply damage, verify temp HP depleted first

---

## 4. Undo/Redo Scope & State Stack Depth

### Research Question

Should undo/redo be unlimited or capped? What's the practical limit?

### Finding

**Industry Standard**:

- **Microsoft Office**: Unlimited undo/redo (but memory-limited)
- **Roll20**: Capped at last ~50 actions
- **Foundry VTT**: Capped at last 100 actions
- **Video Games**: Capped at last 10–20 states (performance/memory trade-off)

**Memory Analysis (for MVP)**:

- Each CombatSession state: ~2–5 KB (rough estimate)
- 50 states: ~100–250 KB
- 100 states: ~200–500 KB
- 1000 states: ~2–5 MB (approaching localStorage limits)

### Decision

✅ **Unlimited undo/redo depth for MVP** (no hard cap), with practical limit of ~1000 actions.

**Implementation**:

- `undoRedoManager.ts` → `UndoRedoStack`
  - `undoStack: CombatSession[]`
  - `redoStack: CombatSession[]`
  - `pushState(action: Action, newSession: CombatSession)`
  - `undo()`, `redo()`, `canUndo()`, `canRedo()`
- No hard cap in MVP; warn user if stack size exceeds 500 MB (future optimization)
- State lost on page reload (localStorage limitation; Feature 036 persists to backend)

**Why This Design**:

- Matches user expectations (GMs expect "undo all the way to start")
- Simple implementation (no cap logic)
- Memory footprint acceptable for MVP (~5 MB worst case)
- Easy to cap later if needed (Feature X: performance optimization)

### Code Impact

- `undoRedoManager.ts` → Full implementation
- `CombatTracker.tsx` → "Undo" / "Redo" buttons (disabled if stack empty)
- `CombatLog` → Log entry on each action: "Damage applied" → undo → "Undo: damage removed"

### Testing

- Unit test: Push 100 states, undo/redo cycle
- Unit test: Empty stack edge cases (undo on empty, redo on empty)
- E2E test: Undo multiple actions, verify state correct

**Future Optimization**:

- Feature X: Implement state compression (delta encoding) to reduce memory
- Feature X: Cap stack at 500 actions with user warning

---

## 5. Unconsciousness Handling (Death Saves Deferred)

### Research Question

Should the MVP include death save tracking (3 successes vs. 3 failures per PHB rules)?

### Finding

**D&D 5e Death Save Rules** (PHB, p. 197):

- At 0 HP, creature makes death saving throws
- 3 successes = stabilize (still unconscious)
- 3 failures = death
- Success/failure determined by d20 roll (DC 10)

**Complexity**: Death saves require rolling UI, tracking across multiple turns, special rules (nat 20 = 1 success, crit heals, auto-fail on nat 1).

### Decision

✅ **Deferred to post-MVP**. MVP includes basic unconsciousness indicator only.

**Implementation**:

- When `currentHP <= 0`, display label "Unconscious" (red/grayed text)
- No death save tracking
- User can manually restore HP (healing) to bring participant above 0

**Why This Design**:

- Reduces complexity for MVP launch
- Death saves are secondary to core combat mechanics (turn order, damage)
- Can be added as Feature X without restructuring existing code
- Allows GMs to manage death saves manually (track on paper or external tool)

### Code Impact

- `HPTracker.tsx` → Show "Unconscious" label when `currentHP <= 0`
- `CombatLog` → Log entry: "Participant became unconscious"
- No schema changes needed (optional `deathSaveSuccesses`, `deathSaveFailures` fields for future)

### Testing

- Unit test: `currentHP <= 0` → unconscious state
- E2E test: Reduce HP to 0, verify label appears, healing restores

**Linked Future Issue**:

- GitHub issue: "F009-enhancement: Implement death save tracking (Feature X)"
- Reference in PR description & spec.md

---

## 6. Session Loading & Error Handling Strategy

### Research Question

What should happen if session loading fails (offline, corrupted data, network error)?

### Finding

**Common Scenarios**:

1. Session not found in localStorage (first visit, data cleared)
2. Corrupted JSON in localStorage (invalid CombatSession schema)
3. Offline (no API response, feature not ready for F036)
4. localStorage quota exceeded (rare but possible with large logs)

**Best Practice** (UX):

- Show loading spinner while fetching
- If error, display error toast + fallback UI option (new session, retry, go home)
- Never crash; always offer recovery path

### Decision

✅ **Implement error boundary + fallback UI with toast notifications.**

**Implementation**:

1. **Error Boundary** (React component):
   - Wrap `CombatTracker` in error boundary
   - On error: catch render errors, display "Something went wrong" + "Try Again" button

2. **Session Load Error**:
   - Try load from localStorage
   - If not found: Show fallback message "No active session. Create a new one or refresh."
   - If corrupted: Show toast "Session data corrupted. Starting fresh." → load mock empty session
   - If quota exceeded: Show toast "Storage limit reached. Clearing old log entries..."

3. **Mock Fallback Session**:

   ```typescript
   const mockSession: CombatSession = {
     id: 'mock-' + Date.now(),
     status: 'active',
     currentRoundNumber: 1,
     currentTurnIndex: 0,
     participants: [
       { id: '1', name: 'Goblin 1', type: 'monster', initiativeValue: 10, maxHP: 7, currentHP: 7, temporaryHP: 0, acValue: 15, statusEffects: [] },
       { id: '2', name: 'Party Leader', type: 'character', initiativeValue: 8, maxHP: 35, currentHP: 35, temporaryHP: 0, acValue: 16, statusEffects: [] },
     ],
     lairActionInitiative: 20,
     owner_id: 'anonymous',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   ```

4. **localStorage Quota Management**:
   - If quota exceeded, trim old log entries (keep last 100)
   - Show warning: "Session storage full. Old log entries cleared."

### Code Impact

- `combatSessionAdapter.ts` → Error handling in `loadSession()`, `saveSession()`
- `CombatTracker.tsx` → Error boundary + fallback UI
- `src/app/combat/error.tsx` → Next.js error boundary component
- Toast library (shadcn/ui or existing) → Error/warning messages

### Testing

- Unit test: Mock corrupted localStorage, verify fallback
- Unit test: Quota exceeded, verify trim + warning
- E2E test: Navigate to empty session page, verify fallback rendered

---

## 7. Mobile & Responsive UI Considerations

### Research Question

What are the key mobile considerations for touch-based combat tracking?

### Finding

**Gaming Setup**: GMs often play at a table with laptop/tablet. Key concerns:

- Small screen (3.5–5.5 inches for phones, 7–10 inches for tablets)
- Touch-friendly buttons (min 44×44 px per iOS HIG)
- No horizontal scroll (annoying in landscape)
- Large text for readability in low light

**Best Practice**:

- Full-width layout on mobile
- Stack components vertically
- Large touch targets
- Avoid tiny text (min 16px for body)

### Decision

✅ **Mobile-first responsive design** with touch-friendly controls.

**Implementation**:

1. **Layout** (Tailwind breakpoints):
   - Mobile (< 640px): Full-width, vertical stack, no sidebar
   - Tablet (640–1024px): 2-column layout if needed, larger buttons
   - Desktop (> 1024px): Multi-column, optional sidebar for log

2. **Touch Targets**:
   - All buttons: min 44×44 px (Tailwind `h-11 w-11` or larger)
   - Inputs: min 44px height
   - Initiative list items: min 48px height (tap-friendly)

3. **Input Handling**:
   - HP input: `type="number"` with up/down spinners
   - Mobile keyboard: Appears automatically on focus
   - Damage buttons: "+1", "+5", "+10" quick shortcuts (optional feature for later)

4. **Hidden Complexity**:
   - Combat log: Collapsible on mobile (save vertical space)
   - Status effects: Wrap as pills (flow to next line if needed)
   - No horizontal scrolling (ever)

### Code Impact

- Tailwind CSS utility classes: `sm:`, `md:`, `lg:` breakpoints
- Component: `CombatTracker` → Responsive grid layout
- Component: `InitiativeOrder` → Large list items on mobile
- Component: `HPTracker` → Full-width input

### Testing

- Playwright: Test viewport 375×667 (iPhone SE), 768×1024 (iPad)
- E2E: Verify no horizontal scroll, all buttons clickable
- E2E: Verify touch events work (tap, swipe if applicable)

---

## 8. Component Architecture & Composition

### Research Question

How should components be structured to follow composition principles (< 450 lines, < 50 lines per function)?

### Finding

**React Best Practice**:

- Each component has one primary responsibility
- Composition over inheritance
- Props → State → Render (clear data flow)
- Extract helper hooks for reusable logic

**dnd-tracker Project Standards** (from CONTRIBUTING.md):

- Max 450 lines per file
- Max 50 lines per function
- Functional components + hooks
- Use TypeScript interfaces for props

### Decision

✅ **Strict composition: 6 focused components + 3 supporting modules.**

**Components**:

1. **CombatTracker** (main container)
   - Responsibility: Load session, manage state, coordinate sub-components
   - Props: `sessionId?: string` (optional, fallback to mock)
   - State: `session`, `undoStack`, `redoStack`, `isLoading`, `error`
   - Renders: `InitiativeOrder`, `HPTracker`, `StatusEffectsPanel`, `CombatLog`, `LairActionNotification`

2. **InitiativeOrder** (display-focused)
   - Responsibility: Render participants sorted by initiative, highlight current turn
   - Props: `participants[]`, `currentTurnIndex`, `onTurnClick?` (optional)
   - State: None (presentational)

3. **HPTracker** (input-focused)
   - Responsibility: Show HP bar + input, apply damage/healing
   - Props: `participant`, `onDamageApply(amount)`, `onHealingApply(amount)`
   - State: `inputValue` (temp, form state)

4. **StatusEffectsPanel** (management-focused)
   - Responsibility: Add effects, display pills, remove effects
   - Props: `participant`, `onEffectAdd(effect)`, `onEffectRemove(effectId)`
   - State: `showAddForm`, `effectsList`

5. **CombatLog** (display-focused)
   - Responsibility: Show timestamped log entries, collapse toggle
   - Props: `entries[]`, `isCollapsed`, `onToggleCollapse()`
   - State: None (presentational)

6. **LairActionNotification** (conditional-focused)
   - Responsibility: Detect initiative 20, show/hide notification
   - Props: `currentTurnParticipant`, `onTriggerLairActions()`, `onDismiss()`
   - State: `isDismissed` (local, resets per round)

**Supporting Modules**:

- `combatHelpers.ts` → Pure functions (advanceTurn, applyDamage, etc.)
- `combatSessionAdapter.ts` → Data layer (load/save session)
- `undoRedoManager.ts` → State management (undo/redo stack)

### Code Impact

- File structure: 1 component per file (`CombatTracker.tsx`, not `CombatTracker.tsx` + `useLogic.ts`)
- Props passed down, events bubbled up (unidirectional data flow)
- No complex prop drilling (max 2 levels deep)

### Testing

- Each component independently testable with mock props
- Integration test: CombatTracker with all sub-components

---

## 9. State Management Strategy (useState vs. Zustand)

### Research Question

For MVP, should we use React hooks (useState) or Zustand (state library)?

### Finding

**Option A: React Hooks (useState)**

- ✅ No extra dependency
- ✅ Simpler for MVP scope
- ✅ Built into React 19
- ❌ Prop drilling if state shared deeply

**Option B: Zustand**

- ✅ Centralized state, easy to share
- ✅ Devtools support (debug time-travel)
- ❌ Extra dependency
- ❌ Overkill for single feature

### Decision

✅ **Use React Hooks (useState) for MVP**. Refactor to Zustand in Feature X if state complexity grows.

**Implementation**:

- `CombatTracker` → Main state holder: `const [session, setSession] = useState<CombatSession>()`
- Pass session + setters as props to sub-components
- Sub-components: Local state for form inputs, dropdowns (e.g., HPTracker's input value)
- Adapter methods called on user action: `adapter.saveSession(updatedSession)` → setSession

**Why This Design**:

- Keep dependencies minimal for MVP
- Easy to test (props deterministic)
- Simple mental model
- Zustand can be adopted later without restructuring

### Code Impact

- No new dependency
- Prop passing: `<HPTracker participant={participant} onDamageApply={handleDamage} />`
- Callback pattern: `const handleDamage = (amount) => { const updated = applyDamage(...); setSession(...); }`

### Testing

- Unit test: Pass different props, verify render output
- Integration test: Simulate user action, verify setSession called with correct payload

---

## 10. Persistence: localStorage vs. Backend API

### Research Question

Should session data persist to a backend API or use localStorage for MVP?

### Finding

**Feature Roadmap**:

- Feature 036 (Phase 5): Backend session model + API
- Feature 009 (Phase 4): UI-first, no backend dependency

**localStorage Pros**:

- ✅ Works offline
- ✅ No backend needed
- ✅ Instant write (no network latency)
- ✅ Survives page reload
- ❌ Lost on browser clear cache
- ❌ ~5–10 MB limit per origin
- ❌ No cross-device sync

**Backend API Pros**:

- ✅ Cross-device sync
- ✅ Persistent beyond browser
- ✅ Shared multiplayer sessions (future)
- ❌ Requires Feature 036 (dependent)
- ❌ Network latency

### Decision

✅ **Use localStorage for MVP**. Feature 036 will replace with backend API.

**Implementation**:

- Session saved to localStorage on every state change: `localStorage.setItem('combatSession-' + sessionId, JSON.stringify(session))`
- Load on page init: `const session = JSON.parse(localStorage.getItem('combatSession-' + sessionId))`
- Adapter handles serialization/validation (Zod)
- Feature 036: Replace adapter implementation with HTTP fetch, no component changes needed

**Why This Design**:

- Aligns with feature roadmap (Phase 4 → Phase 5)
- MVP fully functional without backend
- Adapter pattern allows seamless migration
- No blocking dependencies

### Code Impact

- `combatSessionAdapter.ts` → `saveSession()` uses `localStorage.setItem()`
- `combatSessionAdapter.ts` → `loadSession()` uses `localStorage.getItem()`
- Feature 036 changes only adapter implementation, not components

### Testing

- Unit test: Mock localStorage, verify save/load
- Integration test: Save → page reload → verify state persisted

---

## Summary & Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Lair Action Trigger | Initiative 20 (configurable) | Matches D&D 5e canon; flexible for homebrew |
| Effect Duration | Decrement at round end | Simpler UI; matches Roll20/Foundry |
| Damage Order | Temp HP first, then current | D&D 5e rule; clear UI |
| Undo/Redo | Unlimited depth (MVP) | Matches user expectations; memory acceptable |
| Death Saves | Deferred | Reduces complexity; can be added later |
| Error Handling | Error boundary + fallback | Graceful degradation; always offers recovery |
| Mobile | Full-width, touch-friendly (44×44 px buttons) | Tabletop gaming use case |
| Architecture | 6 focused components + 3 modules | Composition principles; testable |
| State Management | React hooks (useState) | Keep MVP simple; Zustand later |
| Persistence | localStorage (MVP) → Backend API (F036) | Aligns with roadmap; adapter pattern |

---

## References & Resources

1. **D&D 5e Official**
   - Player's Handbook (PHB), p. 197–198 (Death Saves)
   - Xanathar's Guide to Everything, p. 6–7 (Lair Actions)

2. **VTT Implementations**
   - Roll20 (reference): Lair action UI, status effect tracking
   - Foundry VTT (reference): Initiative 20 mechanics, duration countdown
   - Fantasy Grounds (reference): Undo/redo depth capping

3. **React Best Practices**
   - React 19 docs: Hooks, error boundaries, composition
   - TypeScript Handbook: Strict mode, type safety

4. **Mobile & Accessibility**
   - iOS Human Interface Guidelines (HIG): Touch target sizes (44×44 px)
   - WCAG 2.1: Accessibility standards (ARIA labels, keyboard nav)

5. **Project Standards**
   - `CONTRIBUTING.md` (code style, testing, TDD)
   - `Tech-Stack.md` (dependencies, versions)
   - Constitution v1.0.0 (governance, quality gates)

---

**Research Status**: ✅ Complete  
**Next Phase**: Phase 1 (Data Model, Contracts, Quickstart)
