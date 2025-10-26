# Remediation Checklist: Feature 003 Analysis Findings

**Status**: Analysis Complete  
**Date**: 2025-10-21  
**Next Step**: Apply fixes from chosen remediation path

---

## Quick Reference: Choose Your Path

### 🏃 Path A: Maximum Quality (Recommended) - 75 min total

```
[ ] Fix CRITICAL: D&D 5e Rules (30 min)
[ ] Fix HIGH: Cleanup & Clarity (45 min)
[ ] Re-run /speckit.analyze (optional, 5 min)
[ ] Proceed to /speckit.implement
```

### ⚡ Path B: Balanced (Pragmatic) - 30 min total

```
[ ] Fix CRITICAL: D&D 5e Rules (30 min)
[ ] Create tech debt issues for HIGH/MEDIUM
[ ] Proceed to /speckit.implement
```

### 🚀 Path C: MVP (Fast) - 0 min

```
[ ] Proceed to /speckit.implement as-is
```

---

## CRITICAL Issues (30 minutes) - MUST FIX

### ✅ C1: Define D&D 5e Saving Throws (10 min)

**Location**: `specs/003-character-management/spec.md`

**Action**: Update FR-004 to enumerate all 6 saving throws

**Before**:
```markdown
- **FR-004**: System MUST calculate and display all D&D 5e derived values including ability modifiers, saving throws, AC, initiative, proficiency bonus, and skills based on race/class/ability scores.
```

**After**:
```markdown
- **FR-004**: System MUST calculate and display all D&D 5e derived values including:
  - Ability modifiers (STR, DEX, CON, INT, WIS, CHA): formula = floor((ability_score - 10) / 2)
  - Saving throws (all 6 abilities): formula = ability_modifier + [proficiency bonus if character is proficient]
    - Proficiencies by class: Barbarian (STR), Bard (CHA), Cleric (WIS), Druid (WIS), Fighter (STR/CON), Monk (STR/DEX), Paladin (WIS/CHA), Ranger (STR/DEX), Rogue (DEX), Sorcerer (CHA), Warlock (WIS), Wizard (INT)
  - Skills (18 total, see below)
  - AC, initiative, proficiency bonus
```

**Impact**: ✅ SC-005 can now verify "100% accuracy" on defined values

---

### ✅ C2: Enumerate D&D 5e Skills (10 min)

**Location**: `specs/003-character-management/spec.md`

**Action**: Add complete skills list to FR-004

**After FR-004 ability modifiers section, add**:

```markdown
  - Skills (18 total; each shows: ability_modifier + [proficiency bonus if proficient]):
    1. Acrobatics (DEX)
    2. Animal Handling (WIS)
    3. Arcana (INT)
    4. Athletics (STR)
    5. Deception (CHA)
    6. History (INT)
    7. Insight (WIS)
    8. Intimidation (CHA)
    9. Investigation (INT)
    10. Medicine (WIS)
    11. Nature (INT)
    12. Perception (WIS) - most commonly used
    13. Performance (CHA)
    14. Persuasion (CHA)
    15. Religion (INT)
    16. Sleight of Hand (DEX)
    17. Stealth (DEX)
    18. Survival (WIS)
```

**Also add to spec.md near top**:

```markdown
## References

- **D&D 5e Source**: These specifications conform to D&D 5e SRD (System Reference Document)
- **Saving Throws**: Core Rules (PHB p. 179)
- **Skills**: Core Rules (PHB p. 181-182)
```

**Impact**: ✅ Task T113 now has data source; SC-005 verifiable

---

### ✅ C3: Clarify Version History (10 min)

**Location**: `specs/003-character-management/spec.md`

**Action**: Choose Option A (recommended) - Remove version history from US3

**Before** (spec.md, US3 acceptance scenarios, line 4):
```markdown
4. **Given** a user editing a character, **When** they save changes, **Then** the edit timestamp updates and version history is maintained.
```

**After**:
```markdown
4. **Given** a user editing a character, **When** they save changes, **Then** the edit timestamp updates and character data persists.
```

**Also add note to spec.md assumptions**:
```markdown
- **Version History**: Feature 003 does not implement character version history. Edit timestamps track changes; full version history will be considered in future phases (Feature 007).
```

**Impact**: ✅ Removes conflict with plan; clarifies MVP scope; eliminates C3 issue

---

## HIGH Priority Issues (45 minutes) - STRONGLY RECOMMENDED

### ⚠️ H1: Schedule Soft Delete Cleanup (15 min)

**Location 1**: `specs/003-character-management/plan.md`

**Action**: Clarify cleanup job timeline

**Before** (plan.md, pg 5):
```markdown
- Set `deletedAt` timestamp on delete (don't remove from DB)
- All queries filter `WHERE deletedAt IS NULL`
- Hard-delete cleanup job scheduled for future phase (after Feature 003)
```

**After**:
```markdown
- Set `deletedAt` timestamp on delete (don't remove from DB)
- All queries filter `WHERE deletedAt IS NULL`
- Hard-delete cleanup job: Deferred to Feature 004 (post-Feature-003-launch). Feature 003 implements soft delete marking only; cleanup scheduling is out of scope.
```

**Location 2**: `specs/003-character-management/tasks.md`

**Action**: Add clarification task to Phase 1

**Add after T009**:
```markdown
- [ ] T009.5 Document soft delete grace period: Add to code comments and README: "Deleted characters soft-deleted for 30 days, then hard-deleted by cleanup job (Feature 004). 30-day grace period allows potential restoration during transitions."
```

**Location 3**: Create GitHub issue (separate task)

**Action**: Create tracking issue for Feature 004 cleanup job
- Title: `Feature 004 Task: Implement 30-day soft delete cleanup job`
- Description: "After Feature 003 launches, implement scheduled cleanup job to hard-delete characters with deletedAt > 30 days old. Ensures data doesn't accumulate indefinitely."

**Impact**: ✅ Removes H1 ambiguity; clarifies Feature 003 scope; documents timeline

---

### ⚠️ H2: Clarify Level Filter Semantics (10 min)

**Location**: `specs/003-character-management/spec.md`

**Action**: Update FR-008 to clarify "total level" meaning

**Before**:
```markdown
- **FR-008**: System MUST support filtering by class, race, and level range.
```

**After**:
```markdown
- **FR-008**: System MUST support filtering by class, race, and **total character level** (sum of all class levels for multiclass characters). Example: Fighter 5/Wizard 3 has total level 8 and appears in filter "level 6-10".
```

**Location 2**: Update `specs/003-character-management/tasks.md`

**Action**: Add acceptance criteria clarity to T055

**Before T055**:
```markdown
- [ ] T055 [US2] Write failing integration test for "Filter characters by level range"
```

**After**:
```markdown
- [ ] T055 [US2] Write failing integration test for "Filter characters by level range" - Verify that Fighter 5/Wizard 3 (total level 8) appears in filter for "level 6-10"
```

**Impact**: ✅ Removes H2 ambiguity; clarifies multiclass filtering; enables correct test

---

### ⚠️ H3: Constitution File (5 min)

**Location**: `specs/003-character-management/plan.md`

**Action**: Add note acknowledging template status

**Add to "Constitution Check" section in plan.md**:

```markdown
**Status**: ⚠️ Constitution Template
The project constitution file (`.specify/memory/constitution.md`) is a template awaiting completion. For Feature 003, assume adherence to `CONTRIBUTING.md` project standards:
- ✅ TDD: Tests written before implementation (mandatory)
- ✅ Code quality: 80%+ coverage, no `any` types, 450-line file limit
- ✅ Testing: Unit, integration, E2E tests
- ✅ Documentation: JSDoc, clear commits, updated README
- ✅ Style: ESLint, Prettier, conventional commits

Note: Actual constitution.md should be filled in as separate governance task.
```

**Impact**: ✅ Acknowledges template status; unblocks Feature 003; notes governance task

---

### ⚠️ H4: Standardize Terminology (15 min)

**Location 1**: `specs/003-character-management/spec.md`

**Action**: Replace "creatures" with "characters" for consistency

**Find+Replace**:
- Search for: `creature` (case-insensitive)
- Replace with: `character`
- Locations: FR-012, FR-014, SC-006, SC-008

**Before** (example from SC-006):
```markdown
- **SC-006**: Users reach 80% of tier limit receive clear warning, and creation is blocked at limit with contextual upgrade option (Free: 8 of 10 creatures used).
```

**After**:
```markdown
- **SC-006**: Users reach 80% of tier limit receive clear warning, and creation is blocked at limit with contextual upgrade option (Free: 8 of 10 characters used).
```

**Location 2**: `specs/003-character-management/plan.md`

**Action**: Add terminology note

**Add to "Technical Context" section**:

```markdown
**Terminology**: Feature 003 manages "characters" (player characters and NPCs). Tier limits measure character count, not "creatures" (the D&D game term for all entities). Use "character" consistently in code, docs, and PR descriptions.
```

**Impact**: ✅ Standardizes terminology; reduces review noise; improves documentation clarity

---

## MEDIUM Priority (Optional) - 90+ minutes

- **M1** (10 min): Clarify 10k performance requirement or mark as stretch goal
- **M2** (30 min): Create seed data verification checklist against D&D 5e SRD
- **M4** (20 min): Add race/class combination validation to FR-002/tasks
- **M5** (10 min): Clarify cleanup job Feature 004 reference
- **M6** (10 min): Add validation details to task T006

**Recommendation**: Defer to post-launch. Not blockers. Create GitHub issues.

---

## LOW Priority (Polish) - 20 minutes

- **L1** (5 min): Standardize duplicate naming to "Copy of [Original]"
- **L2** (5 min): Document duplicate name behavior in edge cases
- **L3** (5 min): Reorder Phase 9 tasks by priority
- **L4** (5 min): Standardize acceptance criteria to BDD format

**Recommendation**: Defer as editorial pass. Not critical.

---

## Quick Apply Steps

### If Path A (Recommended):

```bash
# 1. Apply CRITICAL fixes (30 min)
# - Edit spec.md: Add saving throws (C1), skills (C2), version history note (C3)
# Done: CRITICAL issues fixed

# 2. Apply HIGH fixes (45 min)
# - Edit plan.md: Clarify cleanup job (H1)
# - Edit spec.md: Update FR-008 (H2)
# - Edit plan.md: Add constitution note (H3)
# - Edit spec.md: Replace "creatures" → "characters" (H4)
# - Create GitHub issue for cleanup job
# Done: All major issues addressed

# 3. Optional: Re-run analysis to verify (5 min)
# /speckit.analyze

# 4. Proceed to implementation
# /speckit.implement
```

### If Path B (Pragmatic):

```bash
# 1. Apply CRITICAL fixes only (30 min)
# - Edit spec.md: Add saving throws (C1), skills (C2), version history note (C3)
# Done: Blockers removed

# 2. Create tech debt issues
# - GitHub issue for H1-H4 (combine into 1-2 issues)
# - Assign to post-launch backlog

# 3. Proceed to implementation
# /speckit.implement
```

---

## Validation Steps

After applying fixes:

```bash
# 1. Verify spec.md compiles (markdown check)
npm run lint:markdown specs/003-character-management/spec.md

# 2. Verify no conflicts
# - Open spec.md and visually scan for consistency
# - Verify all FR-001-015 are still complete

# 3. Optional: Re-run analysis
# /speckit.analyze

# 4. Proceed to implementation
# /speckit.implement
```

---

## Feedback

**If you have questions about any fixes**, see:
- **Detailed analysis**: `ANALYSIS-REPORT-FINAL.md`
- **Executive summary**: `ANALYSIS-EXECUTIVE-SUMMARY.md`

**To proceed with implementation**, run:
```bash
/speckit.implement
```

---

**Checklist Status**: ✅ Ready to Execute  
**Next Step**: Choose Path A/B/C and apply fixes

