# Research - Combat Tracker Page (Feature 009)

## Overview

This document captures research, best practices, and design patterns relevant to the Combat Tracker UI, informed by D&D 5e rules, existing tools, and the dnd-tracker roadmap.

## D&D 5e Combat Rules

### Initiative & Turn Order

- Initiative is determined by rolling 1d20 + Dexterity modifier.
- Ties are broken by comparing Dexterity modifier; if still tied, DM decides order.
- Initiative order remains constant throughout combat (no re-rolling mid-combat).
- One complete round consists of every participant taking one turn.
- A turn includes movement, action, bonus action, reaction (some creatures have legendary actions/reactions).

### Hit Points & Damage

- HP is the sum of hit die rolls per level plus CON modifier.
- Damage reduces HP by the stated amount; exceeding max damage is ignored.
- Temporary HP acts as a buffer and is lost first; when temporary HP is exhausted, damage continues to reduce actual HP.
- At 0 HP or lower: creature falls unconscious and begins making death saves.
- At 0 HP and taking additional damage equal to max HP: creature dies instantly (in most editions).

### Status Effects (Conditions)

Common 5e conditions:

- **Blinded**: Can't see; attack rolls have disadvantage; attack rolls against blinded creature have advantage.
- **Charmed**: Can't harm charmer or target charmer; gains advantage on saves against charmer's spells/abilities.
- **Deafened**: Can't hear; automatic failure on Perception checks requiring hearing.
- **Exhaustion**: Levels 1–6; each level imposes cumulative penalties.
- **Frightened**: Disadvantage on ability checks and attack rolls while source is in line of sight; must use movement away from source if possible.
- **Grappled**: Can't move; speed becomes 0; condition ends if grappler is incapacitated or moved away.
- **Invisible**: Can't be seen without special sense/magic; attack rolls against invisible creature have disadvantage; invisible creature's attacks have advantage.
- **Paralyzed**: Can't move or speak; automatic failure on STR/DEX saves; attack rolls against paralyzed have advantage; any attack that hits is critical if attacker within 5 feet.
- **Petrified**: Turned to nonmagical stone; incapacitated; can't move/speak; unaware of surroundings; resistance to all damage; immune to poison/disease.
- **Poisoned**: Disadvantage on attack rolls and ability checks.
- **Prone**: Disadvantage on melee attack rolls from distance > 5 feet; standing up costs half movement.
- **Restrained**: Speed becomes 0; attack rolls have disadvantage; attack rolls against restrained have advantage.
- **Stunned**: Incapacitated; can't move; only action is to attempt a save at end of turn.
- **Unconscious**: Incapacitated; can't move/speak; unaware of surroundings; falls prone; critical hit on any melee attack; ranged attacks within 5 feet are critical.

### Legendary Actions & Lair Actions

- **Legendary actions**: Taken by certain creatures (usually bosses) outside their turn; resolved at initiative count 20 (lowest order).
- **Lair actions**: Similar to legendary actions but triggered by environmental effects (e.g., castle lair). Initiative count 20 is when lair actions resolve.

## Existing Combat Tools & Patterns

### Tools Reviewed

1. **Roll20.net**: Web-based VTT with real-time chat, tokens on grid, character sheets.
   - Strengths: Real-time sync, tokens, fog of war, integration with D&D Beyond.
   - Weaknesses: Can be complex, expensive, overkill for simple tracking.

2. **Beyond20 (D&D Beyond companion)**: Browser extension for automated dice rolling and damage application.
   - Strengths: Lightweight, integrates with D&D Beyond character sheets, simple.
   - Weaknesses: Requires D&D Beyond account; limited to tracking, no UI overhaul.

3. **Initiative Tracker apps**: Mobile-first apps like "5e Combat Tracker" (iOS/Android).
   - Strengths: Mobile optimized, simple, offline-capable.
   - Weaknesses: Limited to basic HP/initiative; often closed-source.

4. **Foundry VTT**: Self-hosted or server-based VTT; highly moddable.
   - Strengths: Powerful, moddable, full combat automation.
   - Weaknesses: Steep learning curve, requires hosting, not free.

### Key Design Insights

- **Mobile-first is critical**: GMs often run combat from a phone or tablet at the table.
- **Simplicity > features**: One of the most complained-about VTTs is feature bloat. Keep the UI minimal.
- **Real-time feedback**: Damage should apply instantly with visual confirmation (no waiting for API calls).
- **Dark mode**: Gaming tables are often dark; high-contrast light UI is essential.
- **Keyboard shortcuts**: Power users (experienced GMs) want keyboard shortcuts for fast turn advancement and damage application.
- **Offline capability**: Tables often have spotty WiFi; local-first caching is valuable.

## Design Patterns & Best Practices

### Turn Order Display

- **Vertical list, top-to-bottom**: Initiative order flows top to bottom; current turn is in a prominent position (e.g., top or center-highlighted).
- **Horizontal carousel (mobile)**: Alternative for mobile: horizontal scroll with current turn centered.
- **Icons for creature type**: Small icon (character, monster, NPC) helps quick visual identification.
- **Initiative value label**: Display initiative value next to name (e.g., "Legolas (18)").

### HP Tracking

- **Color-coded HP bars**: Green for full, yellow for 50–75%, orange for 25–50%, red for < 25%.
- **Numeric + bar combo**: Show both exact numbers ("38/50 HP") and a visual bar.
- **Quick damage buttons**: Common damage values (5, 10, 20) as quick-tap buttons for mobile.
- **Input field for custom damage**: Allow text input for any value.
- **Clear visual feedback**: Damage should animate or flash; healing should use a different color (blue/green).

### Status Effects

- **Pills or tags**: Status effects as small, clickable chips with the effect name and duration.
- **Icons**: Small icon to represent effect type (e.g., downward arrow for Prone, chain for Restrained).
- **Contextual menu**: Right-click or long-press on participant to add status effects.
- **Effect descriptions**: Hovering over a status effect shows a tooltip with D&D 5e rules text.

### Combat Log

- **Collapsible panel**: Log can be shown/hidden to maximize tracker space.
- **Scrollable list**: Shows last 10–20 actions; older entries scroll off-screen.
- **Timestamp per entry**: "Round 3, Turn 2: Legolas takes 12 damage".
- **Filter by action type**: Optional filter to show only damage, heals, etc.
- **Copy to clipboard**: GM can copy log text to share with players.

### Lair Action Notification

- **Modal or banner**: Eye-catching but not disruptive.
- **Contextual button**: "Trigger Lair Action" or "View Lair Actions".
- **Dismissable**: Can be closed; reappears only if turn returns to initiative 20.

## Mobile Optimization

### Touch-Friendly Sizes

- **Button minimum size**: 44×44 px (iOS recommendation).
- **Touch target spacing**: 8–16 px between interactive elements to prevent accidental taps.
- **Large text**: Minimum 16 px for body text; 18–20 px for labels.

### Layout Considerations

- **Portrait vs. landscape**: Support both; landscape is often preferred at the table.
- **Simplified mobile layout**: Reduce clutter on small screens; collapse log by default.
- **Avoid horizontal scroll**: Use vertical stacking or accordions instead.
- **Full-width elements**: Buttons and inputs should stretch to fill width on mobile.

## Accessibility

### WCAG 2.1 Level AA Compliance

- **Color contrast**: Use color + patterns/icons (not color alone) to convey state.
- **Keyboard navigation**: Tab through buttons and controls; Enter to activate.
- **ARIA labels**: Buttons should have descriptive labels (e.g., "Next Turn", not "→").
- **Semantic HTML**: Use `<button>`, `<input>`, `<label>` elements correctly.
- **Focus indicators**: Visible focus ring on keyboard navigation.
- **Alt text for icons**: If icons are the only label, provide hidden text via aria-label or title.

## Performance Considerations

### Large Combat Sessions (50+ Participants)

- **Virtual scrolling**: Render only visible participants in the initiative list.
- **Memoization**: Prevent unnecessary re-renders of participant cards.
- **Debounce input**: If HP input is tied to real-time updates, debounce to avoid hammering the backend.
- **Lazy-load log**: Don't render all log entries; fetch/render as user scrolls.

## Reference Documents

- **D&D 5e SRD**: <https://www.dndbeyond.com/sources/basic-rules>
- **Initiative rules**: D&D 5e Basic Rules, §9 (Combat).
- **Conditions**: D&D 5e Basic Rules, Appendix A.
- **Legendary/Lair Actions**: Various monster stat blocks; D&D 5e Dungeon Master's Guide, Chapter 9.
