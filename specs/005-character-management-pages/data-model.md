# Data Model: Character (canonical)

This document defines the canonical data model for the Character Management Pages feature.
Use this as the authoritative mapping between spec language and code-level types.

## Field naming

- The spec uses the term `class` to describe a character's D&D class. In code we use `className` as the canonical property name to avoid ambiguity with the `class` keyword in some contexts and to align with prior plan examples.

## Type (TypeScript)

```ts
export type Character = {
  id: string;
  name: string;
  className: string; // maps from spec's "class"
  race: string;
  level: number; // 1-20
  hitPoints: { current: number; max: number };
  armorClass: number;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  equipment?: string[];
  notes?: string;
};
```

## Notes

- Keep `types/character.ts` in sync with this file. The implementation file is the runtime type; this document is the canonical spec for reviewers and designers.
- If you prefer to rename `className` to `class`, update this file and the implementation artifacts together and document the change in the feature's spec.
