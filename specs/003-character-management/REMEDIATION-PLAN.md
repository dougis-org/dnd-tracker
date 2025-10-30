# Remediation Plan: Address Analysis Findings

**Analysis Date**: 2025-10-21  
**Status**: Ready for Fixes  
**Estimated Time**: 2-2.5 hours  

---

## Quick Summary

✅ **Good News**: No constitution violations. Core design is sound.  
⚠️ **Issues Found**: 4 HIGH, 6 MEDIUM, 4 LOW (14 total)  
🚫 **Blocker**: tasks.md missing (needed for complete analysis)

---

## Remediation Checklist

### CRITICAL (Do First)

- [ ] **Run `/speckit.tasks`** to generate tasks.md
  - Required for: Complete coverage analysis
  - Time: 30 minutes
  - Blocks: Full implementation readiness

### HIGH PRIORITY (Fix Before Implement)

- [ ] **Fix U1: Define Saving Throws**
  - What: Add all 6 D&D 5e saves (STR, DEX, CON, INT, WIS, CHA)
  - Where: spec.md FR-004 requirement
  - How: Add formula and class proficiency mapping table
  - Time: 20 minutes
  - Example:

    ```
    FR-X: System MUST calculate six D&D 5e saving throws:
      Saving Throw = [Ability Modifier] + [+2 Proficiency Bonus if proficient]
      
      Class Proficiencies:
      - Barbarian: STR, CON saves
      - Bard: DEX, CHA saves
      ... [complete list for all 12 classes]
    ```

- [ ] **Fix A1: Complete API Contract (UsageMetrics Schema)**
  - What: Add missing schema component referenced by API responses
  - Where: contracts/characters-api.yaml components section
  - How: Add schema definition for usage tracking
  - Time: 15 minutes
  - Schema:

    ```yaml
    UsageMetrics:
      type: object
      properties:
        current: {type: integer, minimum: 0, maximum: 250}
        limit: {type: integer, enum: [10, 50, 250]}
        tierName: {type: string, enum: ['free', 'seasoned', 'expert']}
        percentageUsed: {type: number, format: float, minimum: 0, maximum: 100}
      required: [current, limit, tierName, percentageUsed]
    ```

- [ ] **Fix D1: Resolve Version History Feature**
  - What: Remove unspecified requirement from User Story 3
  - Where: spec.md User Story 3, Acceptance Scenario 4
  - How: Remove "version history is maintained" phrase
  - Time: 10 minutes
  - Change:

    ```diff
    - When they save changes, then the edit timestamp updates and version history is maintained.
    + When they save changes, then the edit timestamp updates.
    ```

  - Alternative: If version history needed, create FR-016 requirement

### MEDIUM PRIORITY (Should Fix Before Implement)

- [ ] **Fix U3: Enumerate Skills List**
  - What: Add D&D 5e skills reference table
  - Where: data-model.md or spec.md reference section
  - How: Add skill → ability mapping
  - Time: 20 minutes
  - Reference:

    ```
    18 D&D 5e Skills:
    - Acrobatics (DEX)
    - Animal Handling (WIS)
    - Arcana (INT)
    - Athletics (STR)
    - Deception (CHA)
    - History (INT)
    - Insight (WIS)
    - Intimidation (CHA)
    - Investigation (INT)
    - Medicine (WIS)
    - Perception (WIS)
    - Performance (CHA)
    - Persuasion (CHA)
    - Religion (INT)
    - Sleight of Hand (DEX)
    - Stealth (DEX)
    - Survival (WIS)
    ```

- [ ] **Fix U4: Clarify Level Filter Semantics**
  - What: Specify if minLevel/maxLevel = total or class level
  - Where: contracts/characters-api.yaml parameter documentation
  - How: Update parameter description to clarify
  - Time: 10 minutes
  - Change:

    ```yaml
    - name: minLevel
      description: |
        Minimum total character level (sum of all class levels).
        Example: Fighter 5/Wizard 3 = total level 8.
        Minimum value 1, maximum 20.
    ```

- [ ] **Fix U5: Align Story 3 Scope to FR**
  - What: Align User Story 3 to FR-009 scope
  - Where: spec.md User Story 3 acceptance scenarios
  - How: Change "any attribute" to specific list
  - Time: 10 minutes
  - Change:

    ```diff
    - When they click "Edit" and modify any character attribute
    + When they click "Edit" and modify name, race, class, levels, or ability scores
    ```

- [ ] **Fix C1: Schedule Cleanup Job**
  - What: Add hard-delete maintenance task
  - Where: plan.md Phase 5 or Phase 6 section
  - How: Document cleanup job requirements
  - Time: 15 minutes
  - Content:

    ```
    ### Hard-Delete Cleanup Job
    - Runs daily to remove soft-deleted characters after 30-day grace period
    - Query: deletedAt < now - 30 days
    - Action: Delete from database (GDPR compliance)
    - Logging: Record hard-delete event for audit trail
    - Error handling: Retry on failure, alert on repeated failures
    ```

- [ ] **Fix C2: Schedule Race/Class Seed Task**
  - What: Add initialization task for Race/Class data
  - Where: plan.md Phase 1 section
  - How: Document seed data requirements
  - Time: 15 minutes
  - Content:

    ```
    ### Seed Race and Class System Entities
    - Create 9 D&D 5e Races (Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling)
    - Create 12 D&D 5e Classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)
    - Populate ability bonuses, hit dice, proficiencies per PHB
    - Validate all proficiency mappings
    ```

- [ ] **Fix C3: Detail Performance Optimization**
  - What: Break out query optimization tasks
  - Where: plan.md Phase 2 or new Phase section
  - How: Document optimization strategy
  - Time: 20 minutes
  - Content:

    ```
    ### Database Query Optimization
    - Create MongoDB indexes for fast queries:
      * {userId: 1, deletedAt: 1} - user-scoped queries
      * {userId: 1, name: 'text'} - full-text search
      * {userId: 1, createdAt: -1} - recent characters
    - Implement pagination (20 items/page default)
    - Load-test: Verify list < 1s, search < 500ms at 200+ records/user
    - Cache derived stats (optional if performance needs it)
    ```

- [ ] **Fix U6: Clarify Configurability**
  - What: Specify how Race/Class entities are configured
  - Where: spec.md FR-015 requirement
  - How: Add implementation approach details
  - Time: 15 minutes
  - Change:

    ```diff
    FR-015: System MUST support race and class data as configurable system entities (D&D 5e standard races and classes).
    
    + Implementation: Race and Class are seeded at startup from code
    + (Admin UI for race/class management added in Feature NNN)
    + Configurability for now means: easy to add new races/classes via database records
    ```

### LOW PRIORITY (Nice to Have)

- [ ] **Fix I1: Standardize "Creatures" Terminology**
  - What: Use consistent terminology throughout
  - Where: spec.md FR-012, FR-013, FR-014 (and plan.md)
  - Time: 20 minutes
  - Change: Replace "creatures" with "characters" or "usage slots"

- [ ] **Fix S1: Add Saving Throw Formula Example**
  - What: Add example formula (like AC example)
  - Where: data-model.md derived calculations section
  - Time: 10 minutes

---

## Execution Path

### Step 1: Generate tasks.md (BLOCKING)

```bash
# Run in VSCode or terminal
/speckit.tasks
# Expected output: tasks.md with TDD-first breakdown
```

### Step 2: Fix HIGH Priority Issues (45 minutes total)

1. Add saving throws definition to spec.md
2. Add UsageMetrics schema to API contract
3. Remove version history from Story 3 (or create FR-016)

### Step 3: Fix MEDIUM Priority Issues (90 minutes total)

1. Add skills enumeration table
2. Clarify level filter semantics
3. Align User Story 3 scope
4. Add cleanup job documentation
5. Add seed task documentation
6. Detail performance optimization
7. Clarify configurability

### Step 4: Re-Run Analysis

```bash
/speckit.analyze
# Expected: 100% coverage report, no HIGH issues
```

### Step 5: Proceed to Implementation

```bash
/speckit.implement
# Begin TDD-first implementation
```

---

## Estimated Timeline

| Phase | Duration | Blocker |
|-------|----------|---------|
| Generate tasks.md | 30 min | YES |
| Fix HIGH priority | 45 min | YES (for implementation) |
| Fix MEDIUM priority | 90 min | NO (can defer) |
| Re-run analysis | 10 min | No |
| Begin implementation | 6-7 days | Depends on task execution |

**Total Pre-Implementation**: 1.5-2.5 hours (including HIGH fixes)

---

## Questions for User

Before proceeding, confirm:

1. **Version History**: Remove from Story 3 (Option A) or add FR-016 (Option B)?
   - Recommended: **Option A** (keep scope focused on MVP)

2. **Caching**: Is caching required for performance targets, or should we implement and then optimize if needed?
   - Recommended: **Implement first, optimize if tests fail**

3. **Race/Class Configurability**: Code-only seeding now, admin UI later?
   - Recommended: **Code-only now (Feature 003), admin UI in Feature NNN**

---

## Document Reference

- Full analysis: `ANALYSIS-REPORT.md`
- Specification: `spec.md`
- Data model: `data-model.md`
- API contract: `contracts/characters-api.yaml`
- Plan: `plan.md`

---

**Next Action**: Run `/speckit.tasks` to generate tasks.md and unblock complete analysis.
