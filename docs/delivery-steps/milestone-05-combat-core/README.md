# Milestone 5: Combat Tracker Core

## Overview
Implement the core combat tracking functionality with initiative, turn order, and HP management.

## Goals
- Build initiative rolling and tracking system
- Implement turn and round management
- Create HP tracking with damage/healing
- Add DEX-based tiebreaking for initiative
- Build combat state management
- Create undo/redo functionality

## Dependencies
- Milestone 4 completed (Encounters and creatures ready)

## Timeline
- Duration: 2 weeks
- Start Date: [Week 5.5]

## Deliverable Files
1. **01-initiative-system.md** - Initiative rolling, sorting, and DEX tiebreaking
2. **02-turn-tracker.md** - Turn and round management system
3. **03-hp-tracking.md** - Damage and healing system with validation
4. **04-combat-ui.md** - Main combat tracker interface
5. **05-combat-state.md** - State management with Zustand
6. **06-undo-system.md** - Undo/redo functionality for actions
7. **07-combat-controls.md** - Combat control panel and shortcuts

## Success Criteria
- [ ] Initiative tracking with proper sorting (Initiative > DEX > manual)
- [ ] Turn order advances correctly
- [ ] HP tracking with damage/healing works
- [ ] Rounds increment properly
- [ ] Combat state persists during session
- [ ] Undo/redo functions work for recent actions
- [ ] UI is responsive and intuitive