/* eslint-disable no-undef, @typescript-eslint/no-explicit-any */
/**
 * Unit tests for combatSessionAdapter (localStorage persistence layer)
 * Feature 009: Combat Tracker
 * TDD-first: tests written before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CombatSessionAdapter } from '../combatSessionAdapter';
import { mockSession, mockSessionWithEffects } from '../../../tests/fixtures/combat-sessions';

// Setup localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('CombatSessionAdapter', () => {
  let adapter: CombatSessionAdapter;

  beforeEach(() => {
    adapter = new CombatSessionAdapter();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSession', () => {
    it('saves session to localStorage', async () => {
      await adapter.saveSession(mockSession);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        `combatSession-${mockSession.id}`,
        JSON.stringify(mockSession)
      );
    });

    it('handles save errors gracefully', async () => {
      (localStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      await expect(adapter.saveSession(mockSession)).rejects.toThrow();
    });
  });

  describe('loadSession', () => {
    it('loads session from localStorage', async () => {
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockSession));

      const result = await adapter.loadSession(mockSession.id);

      expect(result.id).toBe(mockSession.id);
      expect(result.currentRoundNumber).toBe(mockSession.currentRoundNumber);
    });

    it('validates session with Zod schema', async () => {
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockSession));

      const result = await adapter.loadSession(mockSession.id);

      // Should not throw if valid
      expect(result).toBeDefined();
    });

    it('throws error if session not found', async () => {
      (localStorage.getItem as any).mockReturnValue(null);

      await expect(adapter.loadSession('nonexistent')).rejects.toThrow('Session not found');
    });

    it('throws error if stored data is invalid JSON', async () => {
      (localStorage.getItem as any).mockReturnValue('invalid json {');

      await expect(adapter.loadSession(mockSession.id)).rejects.toThrow();
    });

    it('throws error if session fails Zod validation', async () => {
      const invalidSession = { id: 'not-a-uuid', status: 'invalid' };
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(invalidSession));

      await expect(adapter.loadSession(mockSession.id)).rejects.toThrow();
    });
  });

  describe('updateParticipant', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockSession));
    });

    it('updates a participant in session', async () => {
      const updates = { currentHP: 5 };
      const result = await adapter.updateParticipant(mockSession.id, 'p1', updates);

      expect(result.participants[0].currentHP).toBe(5);
      expect(result.participants[0].id).toBe('p1');
    });

    it('preserves other participants', async () => {
      const updates = { currentHP: 2 };
      const result = await adapter.updateParticipant(mockSession.id, 'p1', updates);

      expect(result.participants[1]).toEqual(mockSession.participants[1]);
      expect(result.participants[2]).toEqual(mockSession.participants[2]);
    });

    it('throws error if participant not found', async () => {
      const updates = { currentHP: 5 };

      await expect(
        adapter.updateParticipant(mockSession.id, 'nonexistent', updates)
      ).rejects.toThrow();
    });

    it('saves updated session to localStorage', async () => {
      const updates = { currentHP: 5 };
      await adapter.updateParticipant(mockSession.id, 'p1', updates);

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('preserves status effects when updating HP', async () => {
      (localStorage.getItem as any).mockReturnValue(
        JSON.stringify(mockSessionWithEffects)
      );

      const updates = { currentHP: 5 };
      const result = await adapter.updateParticipant(
        mockSessionWithEffects.id,
        'p1',
        updates
      );

      expect(result.participants[0].statusEffects).toHaveLength(1);
      expect(result.participants[0].statusEffects[0].name).toBe('Prone');
    });
  });

  describe('deleteSession', () => {
    it('removes session from localStorage', async () => {
      await adapter.deleteSession(mockSession.id);

      expect(localStorage.removeItem).toHaveBeenCalledWith(`combatSession-${mockSession.id}`);
    });
  });

  describe('listSessions', () => {
    it('returns list of session IDs from localStorage keys', async () => {
      const mockKeys = [
        'combatSession-123',
        'combatSession-456',
        'otherData-789',
      ];

      localStorageMock.length = mockKeys.length;
      (localStorage.key as any).mockImplementation((i: number) => mockKeys[i]);

      const result = await adapter.listSessions();

      expect(result).toContain('123');
      expect(result).toContain('456');
      expect(result).not.toContain('otherData-789');
    });

    it('returns empty array if no sessions', async () => {
      localStorageMock.length = 0;

      const result = await adapter.listSessions();

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('handles localStorage quota exceeded error', async () => {
      (localStorage.setItem as any).mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        (error as any).name = 'QuotaExceededError';
        throw error;
      });

      await expect(adapter.saveSession(mockSession)).rejects.toThrow();
    });

    it('provides fallback for corrupted session', async () => {
      (localStorage.getItem as any).mockReturnValue('{"incomplete": "data"}');

      await expect(adapter.loadSession(mockSession.id)).rejects.toThrow();
    });
  });
});
