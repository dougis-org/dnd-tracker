# Quickstart Guide: MVP D&D Encounter Tracker

## User Story Validation Scenarios

### Scenario 1: New User Onboarding Flow

**Objective**: Verify complete user registration and tier explanation
**Prerequisites**: Clean browser state, no existing account

**Steps**:
1. Navigate to landing page (`/`)
2. Click "Start Free Trial" button
3. Complete Clerk registration flow
4. Set user profile:
   - Display name: "Test DM"
   - D&D Ruleset: "5e"
   - Experience level: "intermediate"
   - Role: "dm"
5. Review tier limits explanation
6. Navigate to dashboard

**Expected Results**:
- User account created with Free Adventurer tier
- Usage metrics show 0/1 parties, 0/3 encounters, 0/10 creatures
- Dashboard displays onboarding checklist
- Upgrade prompts visible but not intrusive

**Acceptance Criteria**:
- [ ] Registration completes without errors
- [ ] Profile settings save correctly
- [ ] Tier limits displayed accurately
- [ ] Dashboard loads within 3 seconds

### Scenario 2: First Party Creation

**Objective**: Create party with characters and save as template
**Prerequisites**: Authenticated user with Free Adventurer tier

**Steps**:
1. From dashboard, click "Create New Party"
2. Enter party details:
   - Name: "The Crimson Blades"
   - Description: "Level 5 adventuring party"
3. Add first character:
   - Name: "Thorin Ironbeard"
   - Race: "Dwarf"
   - Classes: [{"name": "Fighter", "level": 5}]
   - AC: 18, HP Max: 45, HP Current: 45, Dex: 12, Initiative Mod: +1
   - Player name: "Alex"
4. Add second character with validation testing:
   - Try invalid AC (0) - should show error
   - Try HP current > max - should auto-adjust
   - Complete valid character entry
5. Save party as template
6. Verify party appears in dashboard

**Expected Results**:
- Party created successfully with 2 characters
- Validation prevents invalid stat entries
- Usage metrics update to 1/1 parties
- Template saving creates reusable party

**Acceptance Criteria**:
- [ ] Character validation works correctly
- [ ] Party saves within 1 second
- [ ] Usage counters update immediately
- [ ] Template appears in party templates list

### Scenario 3: Encounter Setup and Combat Initialization

**Objective**: Create encounter with monsters and start combat session
**Prerequisites**: Existing party "The Crimson Blades"

**Steps**:
1. Navigate to "Create Encounter"
2. Set encounter details:
   - Name: "Goblin Ambush"
   - Difficulty: "medium"
   - Environment: {"name": "Forest Road", "hasLairActions": false}
3. Select existing party "The Crimson Blades"
4. Add monsters:
   - Create "Goblin Warrior": AC 15, HP 7, Dex 14, Init Mod +2
   - Add 2 instances of Goblin Warrior
   - Create "Goblin Boss": AC 17, HP 21, Dex 12, Init Mod +1
5. Start combat session
6. Roll initiative for all participants:
   - Thorin: 15 + 1 = 16
   - Character 2: 12 + 3 = 15
   - Goblin 1: 8 + 2 = 10
   - Goblin 2: 18 + 2 = 20
   - Boss: 6 + 1 = 7

**Expected Results**:
- Initiative order: Goblin 2 (20), Thorin (16), Character 2 (15), Goblin 1 (10), Boss (7)
- Combat session shows current turn indicator
- All participant HP bars visible
- Turn advancement controls active

**Acceptance Criteria**:
- [ ] Initiative calculation correct with tie-breaking
- [ ] Combat UI updates in real-time
- [ ] Participant limit (6) enforced for Free tier
- [ ] Combat session persists on page refresh

### Scenario 4: Combat Management Flow

**Objective**: Execute full combat round with HP changes and status effects
**Prerequisites**: Active combat session from Scenario 3

**Steps**:
1. Current turn: Goblin 2 (Initiative 20)
   - Apply 8 damage to Thorin
   - Verify HP changes from 45 to 37
   - Add combat log entry
2. Advance to Thorin's turn
   - Apply "Blessed" status effect for 10 rounds
   - End turn
3. Advance to Character 2's turn
   - Apply 6 damage to Goblin 1
   - Verify Goblin 1 HP: 7 → 1
   - End turn
4. Advance to Goblin 1's turn
   - Apply "Poisoned" condition for 5 rounds
   - End turn
5. Advance to Boss turn, then complete round
6. Test undo functionality:
   - Undo last damage to Goblin 1
   - Verify HP restored to 7

**Expected Results**:
- HP modifications reflect immediately in UI
- Status effects display with duration counters
- Round counter advances properly
- Undo restores exact previous state
- Combat log tracks all actions with timestamps

**Acceptance Criteria**:
- [ ] HP changes process within 100ms
- [ ] Status effects auto-decrement each turn
- [ ] Undo functionality works for last 5 actions
- [ ] Visual indicators clearly show current turn
- [ ] Combat log remains accurate throughout

### Scenario 5: Data Persistence and Session Recovery

**Objective**: Verify combat session survives browser restart
**Prerequisites**: Active combat session with modified HP and status effects

**Steps**:
1. Note current combat state:
   - Round number
   - Current turn participant
   - All HP values
   - Active status effects with remaining durations
2. Close browser completely
3. Reopen browser and navigate to app
4. Authenticate if needed
5. Navigate to combat sessions or dashboard
6. Resume combat session

**Expected Results**:
- Combat session appears in "Active Sessions" list
- All combat state restored exactly:
  - Same round number and turn
  - All HP values unchanged
  - Status effects with correct remaining durations
- Turn progression continues normally
- Combat log history preserved

**Acceptance Criteria**:
- [ ] Session recovery within 2 seconds
- [ ] All participant data identical to pre-restart
- [ ] Status effect timers accurate
- [ ] Turn progression resumes correctly
- [ ] No data loss in combat log

### Scenario 6: Tier Limit Enforcement Testing

**Objective**: Verify Free Adventurer limitations are properly enforced
**Prerequisites**: User with existing party from previous scenarios

**Steps**:
1. Attempt to create second party
   - Should be blocked with upgrade prompt
2. Attempt to add 7th participant to encounter
   - Should be blocked at 6 participants
3. Create encounters until reaching limit (3 total)
4. Attempt to create 4th encounter
   - Should show tier limit reached message
5. Try to create 11th creature (monster/character combined)
   - Should display upgrade prompt
6. Navigate to billing/upgrade page from prompts

**Expected Results**:
- Clear error messages when limits reached
- Upgrade prompts provide specific benefit explanations
- Existing data remains functional at limits
- No degradation of performance at tier boundaries

**Acceptance Criteria**:
- [ ] Limits enforced consistently across all features
- [ ] Error messages are user-friendly and helpful
- [ ] Upgrade paths clearly explained
- [ ] No functionality breaks when at limits
- [ ] Usage counters always accurate

## Performance Validation

### Load Time Requirements
- [ ] Landing page loads within 2 seconds on 3G connection
- [ ] Dashboard loads within 1.5 seconds for authenticated users
- [ ] Combat session loads within 1 second
- [ ] Character/encounter creation forms appear within 500ms

### Interaction Responsiveness
- [ ] HP modification updates within 100ms
- [ ] Initiative order changes update within 200ms
- [ ] Status effect application within 150ms
- [ ] Turn advancement within 100ms

### Offline Capability Testing
- [ ] Combat session continues during network interruption
- [ ] HP changes saved to local storage immediately
- [ ] Status effects managed locally during offline period
- [ ] Sync resumes automatically when connection restored

## Security Validation

### Authentication Tests
- [ ] Unauthenticated users redirected to login
- [ ] Session tokens expire appropriately
- [ ] User data isolated between accounts

### Input Validation
- [ ] Negative HP values handled gracefully
- [ ] XSS protection on character names and descriptions
- [ ] Initiative values within acceptable ranges
- [ ] File upload size limits enforced (if applicable)

### Data Privacy
- [ ] User data not visible to other users
- [ ] Sharing permissions work correctly
- [ ] Account deletion removes all associated data

## Browser Compatibility

### Desktop Testing
- [ ] Chrome 100+ (primary target)
- [ ] Firefox 100+ (secondary target)
- [ ] Safari 15+ (macOS users)
- [ ] Edge 100+ (Windows users)

### Mobile Testing
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Responsive design adapts correctly
- [ ] Touch interactions work smoothly

## Integration Points

### Clerk Authentication
- [ ] User registration flow complete
- [ ] Session management working
- [ ] Profile updates sync correctly

### MongoDB Data Persistence
- [ ] CRUD operations on all entities
- [ ] Relationship integrity maintained
- [ ] Query performance acceptable (<200ms)

### IndexedDB Offline Storage
- [ ] Combat sessions stored locally
- [ ] Sync queue manages offline actions
- [ ] Conflict resolution handles edge cases

This quickstart guide serves as both user acceptance testing and integration test scenarios, ensuring all core functionality works end-to-end before considering the MVP complete.