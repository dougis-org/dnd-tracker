# Implementation Plan: Character Management Pages

Based on `specs/005-character-management-pages/spec.md` (feature/005-character-management-pages).

## Purpose

Provide a TDD-first, UI-only implementation for characters: list, detail, create/edit forms, delete modal with Undo, and search/filters. All behavior is client-side with mock data.

## Contract

- Inputs: a client-side mock character store (an array of Character objects).
- Outputs: UI pages and components that read and write the mock store in-memory.
- Error modes: invalid id → friendly empty state linking back to `/characters`; invalid form input → inline validation blocks submission.
- Success criteria: pages render, tests pass, and flows match the acceptance criteria in the spec.

## Canonical Data Shape (TypeScript)

The canonical shape for the feature is defined in `specs/005-character-management-pages/data-model.md` and implemented in `types/character.ts` (see tasks). The primary property name for a character's D&D class is `className` in code (this file maps the spec term "class" → `className`).

Example TypeScript shape (for reference):

```ts
export type Character = {
  id: string;
  name: string;
  className: string; // canonical field name (maps from spec's "class")
  race: string;
  level: number;
  hitPoints: { current: number; max: number };
  armorClass: number;
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  equipment?: string[];
  notes?: string;
};
```

## Files to Add (summary)

- `src/lib/mock/characters.ts` — seed data (≥5 characters).
- `types/character.ts` — TypeScript type implementing the canonical shape.
- `specs/005-character-management-pages/data-model.md` — canonical data model documentation.
- `src/lib/characterStore.ts` — React context + reducer + hooks for in-memory CRUD and undo.
- UI components under `src/components/characters/` (Card, List, Detail, Form, Delete modal).
- Page wiring under `src/app/characters` (`page.tsx`, `[id]/page.tsx`, `new/page.tsx`).

## Tests to Add

- Unit tests for store and components (Jest/React Testing Library): store, CharacterCard, CharacterList (search/filter), CharacterForm (validation), DeleteCharacterModal.
- Integration tests for page flows (list→detail→edit; create→list; delete→list).
- E2E (Playwright) for basic navigation and flows.

## Implementation Phases (TDD-first)

1. Write failing tests for `characterStore` (list, getById, create, update, delete, undo).
2. Implement `characterStore` to satisfy tests.
3. Write tests for `CharacterCard` and `CharacterList` (search/filter) and implement components.
4. Write tests and implement `CharacterDetail` and `CharacterForm` (edit prefilling).
5. Implement create page and wire to the store.
6. Implement Delete modal + Undo toast and tests.
7. Integration and E2E tests and polish.

## UX Notes

- Search: partial, case-insensitive substring match.
- Filters: class dropdown and level range input; combinable.
- Empty state: CTA linking to `/characters/new`.
- Undo: show transient toast for ~5s with "Undo"; restore removed item if clicked.

## Acceptance Criteria (mapped)

- List renders ≥5 mock characters.
- Search behaves as partial, case-insensitive filter (perceived instant — use a small smoke perf check if exact numbers matter).
- Create/Edit validate required fields: name, className, race, level (1–20), HP >= 0, AC numeric.
- Delete requires confirm modal and offers Undo.

## Next Steps

1. Create `specs/005-character-management-pages/data-model.md` and `types/character.ts` (canonical data).
2. Create `src/lib/mock/characters.ts` and `src/lib/characterStore.ts` (TDD: tests + implementation).
3. Implement `CharacterCard`, `CharacterList`, `CharacterDetail`, `CharacterForm`, `DeleteCharacterModal`, and pages.
