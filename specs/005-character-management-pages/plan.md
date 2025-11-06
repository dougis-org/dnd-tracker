# Implementation Plan: Character Management Pages

Based on `specs/005-character-management-pages/spec.md` (feature/005-character-management-pages).
# Implementation Plan: Character Management Pages

Based on `specs/005-character-management-pages/spec.md` (feature/005-character-management-pages).

## Purpose
Provide a TDD-first, UI-only implementation for characters: list, detail, create/edit forms, delete modal with Undo, and search/filters. All behavior is client-side with mock data.

## Contract
- Inputs: client-side mock character store (array of Character objects).
- Outputs: UI pages and components that read/write the mock store; forms update the store in-memory; delete removes from store but Undo restores it.
- Error modes: invalid id → friendly empty state linking back to `/characters`; invalid form input → inline validation blocks submission.
- Success criteria: UI passes unit tests and e2e flows defined in the spec.

## Data Shape (TypeScript)
```ts
type Character = {
  id: string;
  name: string;
  className: string;
  race: string;
  level: number;
  hitPoints: { current: number; max: number };
  armorClass: number;
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  # Implementation Plan: Character Management Pages

  Based on `specs/005-character-management-pages/spec.md` (feature/005-character-management-pages).

  ## Purpose

  Provide a TDD-first, UI-only implementation for characters: list, detail, create/edit forms, delete modal with Undo, and search/filters. All behavior is client-side with mock data.

  ## Contract

  - Inputs: a client-side mock character store (an array of Character objects).

  - Outputs: UI pages and components that read and write the mock store in-memory.

  - Error modes: invalid id → friendly empty state linking back to `/characters`; invalid form input → inline validation blocks submission.

  - Success criteria: pages render, tests pass, and flows match the acceptance criteria in the spec.

  ## Data Shape (TypeScript)

  ```ts
  type Character = {
    id: string;
    name: string;
    className: string;
    race: string;
    level: number;
    hitPoints: { current: number; max: number };
    armorClass: number;
    abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
    # Implementation Plan: Character Management Pages

    Based on `specs/005-character-management-pages/spec.md` (feature/005-character-management-pages).

    ## Purpose

    Provide a TDD-first, UI-only implementation for characters: list, detail, create/edit forms, delete modal with Undo, and search/filters. All behavior is client-side with mock data.

    ## Contract

    - Inputs: a client-side mock character store (an array of Character objects).

    - Outputs: UI pages and components that read and write the mock store in-memory.

    - Error modes: invalid id → friendly empty state linking back to `/characters`; invalid form input → inline validation blocks submission.

    - Success criteria: pages render, tests pass, and flows match the acceptance criteria in the spec.

    ## Data Shape (TypeScript)

    ```ts
    type Character = {
      id: string;
      name: string;
      className: string;
      race: string;
      level: number;
      hitPoints: { current: number; max: number };
      armorClass: number;
      abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
      equipment?: string[];
      notes?: string;
    };
    ```

    ## Files to Add

    - `src/lib/mock/characters.ts` — seed data (≥5 characters).

    - `src/lib/characterStore.ts` — React context + reducer + hooks for in-memory CRUD and undo.

    - `src/components/characters/CharacterCard.tsx` — card UI showing name, class, level, HP, AC.

    - `src/components/characters/CharacterList.tsx` — list with search and filters.

    - `src/components/characters/CharacterDetail.tsx` — full stat block and actions (Edit/Delete).

    - `src/components/characters/CharacterForm.tsx` — create/edit form with validation.

    - `src/components/characters/DeleteCharacterModal.tsx` — confirm delete modal.

    - Page wiring:

      - `src/app/characters/page.tsx`

      - `src/app/characters/[id]/page.tsx`

      - `src/app/characters/new/page.tsx`

    ## Tests to Add

    - Unit (Jest) for store and components under `unit/`:

      - `characterStore.spec.ts`

      - `CharacterCard.spec.tsx`

      - `CharacterList.spec.tsx` (search/filter behavior)

      - `CharacterForm.spec.tsx` (validation rules)

      - `DeleteCharacterModal.spec.tsx`

    - Integration: page flows (list → detail → edit; create → list; delete → list).

    - E2E (Playwright): basic navigation to `/characters`, `/characters/new`, and `/characters/:id`.

    ## Implementation Phases (TDD-first)

    1. Tests for `characterStore` behaviors (list, getById, create, update, delete, undo).

    2. Implement `characterStore` to satisfy tests.

    3. Tests and implementation for `CharacterCard` and `CharacterList` (search/filter).

    4. Tests and implementation for `CharacterDetail` and `CharacterForm` (edit prefilling).

    5. Tests and implementation for the Create page using `CharacterForm`.

    6. Tests and implementation for `DeleteCharacterModal` + Undo toast.

    7. Integration and E2E tests and polish.

    ## UX Notes

    - Search: partial, case-insensitive substring match.

    - Filters: class dropdown and level range input; combinable.

    - Empty state: CTA linking to `/characters/new`.

    - Undo: show transient toast for ~5s with "Undo"; restore removed item if clicked.

    ## Acceptance Criteria (mapped)

    - List renders ≥5 mock characters.

    - Search filters in under ~1s perceived (client-side filter).

    - Create/Edit validate required fields: name, class, race, level (1–20), HP >= 0, AC numeric.

    - Delete requires confirm modal and offers Undo.

    ## Next Steps (I can take now)

    1. Create `src/lib/mock/characters.ts` and `src/lib/characterStore.ts` (TDD: tests + implementation).

    2. Implement `CharacterCard` and `CharacterList` and their tests.

    3. Wire pages and implement `CharacterDetail` + `CharacterForm`.

    If you want, I can start by creating the mock data and the store file and add the first unit tests now. Reply with whether to proceed (I'll create files and run analyses), or tell me a different next step.
