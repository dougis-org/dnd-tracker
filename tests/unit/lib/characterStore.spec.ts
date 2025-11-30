import seedCharacters from '../../../src/lib/mock/characters';
import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import {
  CharacterProvider,
  useCharacterStore,
} from '../../../src/lib/characterStore';
import type { PartialCharacter, Character } from '../../../types/character';

describe('characterStore - scaffold tests', () => {
  it('seed data contains at least 5 characters', () => {
    expect(Array.isArray(seedCharacters)).toBe(true);
    expect(seedCharacters.length).toBeGreaterThanOrEqual(5);
  });

  describe('reducer logic', () => {
    it('initializes store with seed data on init()', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      expect(result.current.state.characters.length).toBeGreaterThanOrEqual(5);
    });

    it('adds a character to the store', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      const initialCount = result.current.state.characters.length;

      const newChar: PartialCharacter = {
        name: 'Test Wizard',
        className: 'Wizard',
        race: 'Elf',
        level: 5,
        hitPoints: { current: 20, max: 20 },
        armorClass: 12,
        abilities: { str: 8, dex: 14, con: 10, int: 16, wis: 12, cha: 11 },
      };

      act(() => {
        result.current.add(newChar);
      });

      expect(result.current.state.characters.length).toBe(initialCount + 1);
      expect(result.current.state.characters[initialCount].name).toBe(
        'Test Wizard'
      );
    });

    it('updates a character in the store', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      const firstChar = result.current.state.characters[0];
      const updated: Character = { ...firstChar, name: 'Updated Name' };

      act(() => {
        result.current.update(updated);
      });

      const foundChar = result.current.state.characters.find(
        (c) => c.id === firstChar.id
      );
      expect(foundChar?.name).toBe('Updated Name');
    });

    it('removes a character from the store', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      const firstChar = result.current.state.characters[0];
      const initialCount = result.current.state.characters.length;

      act(() => {
        result.current.remove(firstChar.id);
      });

      expect(result.current.state.characters.length).toBe(initialCount - 1);
      expect(
        result.current.state.characters.find((c) => c.id === firstChar.id)
      ).toBeUndefined();
    });

    it('undoes a deletion', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      const firstChar = result.current.state.characters[0];

      act(() => {
        result.current.remove(firstChar.id);
      });

      expect(
        result.current.state.characters.find((c) => c.id === firstChar.id)
      ).toBeUndefined();

      act(() => {
        result.current.undo();
      });

      expect(
        result.current.state.characters.find((c) => c.id === firstChar.id)
      ).toBeDefined();
    });

    it('throws error when adding character with missing required fields', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      const invalidChar: PartialCharacter = {
        name: '', // missing required field
        className: 'Fighter',
        race: 'Human',
        level: 3,
        hitPoints: { current: 10, max: 10 },
        armorClass: 15,
        abilities: { str: 16, dex: 10, con: 14, int: 8, wis: 11, cha: 12 },
      };

      expect(() => {
        act(() => {
          result.current.add(invalidChar);
        });
      }).toThrow();
    });

    it('clears all characters from the store', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      act(() => {
        result.current.init();
      });

      expect(result.current.state.characters.length).toBeGreaterThan(0);

      act(() => {
        result.current.clear();
      });

      expect(result.current.state.characters.length).toBe(0);
      expect(result.current.state.history.length).toBe(0);
    });

    it('returns to initial state when undo called with no history', () => {
      const { result } = renderHook(() => useCharacterStore(), {
        wrapper: CharacterProvider,
      });

      const initialCharCount = result.current.state.characters.length;

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.characters.length).toBe(initialCharCount);
    });
  });
});
