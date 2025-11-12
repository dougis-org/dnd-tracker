/**
 * Unit tests for combatHelpers utility functions
 * Feature 009: Combat Tracker
 * TDD-first: tests written before implementation
 */

import { describe, it, expect } from '@jest/globals';
import {
  advanceTurn,
  rewindTurn,
  applyDamage,
  applyHealing,
  decrementEffectDurations,
  sortParticipantsByInitiative,
} from '@/lib/combat/combatHelpers';
import {
  mockSession,
  mockParticipant1,
  mockParticipant2,
  mockParticipant3,
} from '@fixtures/combat-sessions';

describe('combatHelpers', () => {
  describe('advanceTurn', () => {
    it('advances to next participant in same round', () => {
      const session = { ...mockSession, currentTurnIndex: 0 };
      const result = advanceTurn(session);

      expect(result.currentTurnIndex).toBe(1);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('increments round when wrapping to first participant', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: mockSession.participants.length - 1,
      };
      const result = advanceTurn(session);

      expect(result.currentTurnIndex).toBe(0);
      expect(result.currentRoundNumber).toBe(2);
    });

    it('decrements effect durations when round advances', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: mockSession.participants.length - 1,
        participants: [
          {
            ...mockParticipant1,
            statusEffects: [
              {
                id: 'e1',
                name: 'Prone',
                durationInRounds: 2,
                appliedAtRound: 1,
              },
            ],
          },
          mockParticipant2,
          mockParticipant3,
        ],
      };
      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects[0].durationInRounds).toBe(1);
    });

    it('removes effects when duration reaches 0', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: mockSession.participants.length - 1,
        participants: [
          {
            ...mockParticipant1,
            statusEffects: [
              {
                id: 'e1',
                name: 'Prone',
                durationInRounds: 1,
                appliedAtRound: 1,
              },
            ],
          },
          mockParticipant2,
          mockParticipant3,
        ],
      };
      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects).toHaveLength(0);
    });

    it('preserves permanent effects (durationInRounds === null)', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: mockSession.participants.length - 1,
        participants: [
          {
            ...mockParticipant1,
            statusEffects: [
              {
                id: 'e1',
                name: 'Blessed',
                durationInRounds: null,
                appliedAtRound: 1,
              },
            ],
          },
          mockParticipant2,
          mockParticipant3,
        ],
      };
      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects).toHaveLength(1);
      expect(result.participants[0].statusEffects[0].durationInRounds).toBeNull();
    });

    it('updates timestamp', () => {
      const session = mockSession;
      const result = advanceTurn(session);

      expect(result.updatedAt).not.toBe(session.updatedAt);
    });
  });

  describe('rewindTurn', () => {
    it('rewinds to previous participant in same round', () => {
      const session = { ...mockSession, currentTurnIndex: 1 };
      const result = rewindTurn(session);

      expect(result.currentTurnIndex).toBe(0);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('wraps to last participant and decrements round', () => {
      const session = { ...mockSession, currentTurnIndex: 0, currentRoundNumber: 2 };
      const result = rewindTurn(session);

      expect(result.currentTurnIndex).toBe(mockSession.participants.length - 1);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('does not go below round 1', () => {
      const session = { ...mockSession, currentTurnIndex: 0, currentRoundNumber: 1 };
      const result = rewindTurn(session);

      expect(result.currentRoundNumber).toBe(1);
      expect(result.currentTurnIndex).toBe(mockSession.participants.length - 1);
    });
  });

  describe('applyDamage', () => {
    it('applies damage to current HP when no temp HP', () => {
      const participant = { ...mockParticipant1, currentHP: 10 };
      const result = applyDamage(participant, 3);

      expect(result.currentHP).toBe(7);
      expect(result.temporaryHP).toBe(0);
    });

    it('absorbs damage with temp HP first', () => {
      const participant = { ...mockParticipant1, currentHP: 10, temporaryHP: 5 };
      const result = applyDamage(participant, 8);

      expect(result.temporaryHP).toBe(0);
      expect(result.currentHP).toBe(7); // 10 - (8 - 5)
    });

    it('applies full damage to current HP when temp HP insufficient', () => {
      const participant = { ...mockParticipant2, currentHP: 30, temporaryHP: 3 };
      const result = applyDamage(participant, 10);

      expect(result.temporaryHP).toBe(0);
      expect(result.currentHP).toBe(23); // 30 - (10 - 3)
    });

    it('allows negative HP', () => {
      const participant = { ...mockParticipant1, currentHP: 5 };
      const result = applyDamage(participant, 10);

      expect(result.currentHP).toBe(-5);
    });

    it('handles zero damage', () => {
      const participant = { ...mockParticipant1, currentHP: 10 };
      const result = applyDamage(participant, 0);

      expect(result.currentHP).toBe(10);
    });
  });

  describe('applyHealing', () => {
    it('increases current HP', () => {
      const participant = { ...mockParticipant1, currentHP: 3, maxHP: 10 };
      const result = applyHealing(participant, 5);

      expect(result.currentHP).toBe(8);
    });

    it('cannot exceed max HP', () => {
      const participant = { ...mockParticipant1, currentHP: 5, maxHP: 7 };
      const result = applyHealing(participant, 10);

      expect(result.currentHP).toBe(7);
    });

    it('heals unconscious participant', () => {
      const participant = { ...mockParticipant1, currentHP: -2, maxHP: 7 };
      const result = applyHealing(participant, 5);

      expect(result.currentHP).toBe(3);
    });

    it('does not modify temp HP', () => {
      const participant = { ...mockParticipant1, currentHP: 3, temporaryHP: 5 };
      const result = applyHealing(participant, 2);

      expect(result.temporaryHP).toBe(5);
    });
  });

  describe('decrementEffectDurations', () => {
    it('decrements all effect durations by 1', () => {
      const participants = [
        {
          ...mockParticipant1,
          statusEffects: [
            { id: 'e1', name: 'Prone', durationInRounds: 3, appliedAtRound: 1 },
          ],
        },
        {
          ...mockParticipant2,
          statusEffects: [
            { id: 'e2', name: 'Restrained', durationInRounds: 2, appliedAtRound: 1 },
          ],
        },
      ];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects[0].durationInRounds).toBe(2);
      expect(result[1].statusEffects[0].durationInRounds).toBe(1);
    });

    it('removes effects that expire', () => {
      const participants = [
        {
          ...mockParticipant1,
          statusEffects: [
            { id: 'e1', name: 'Prone', durationInRounds: 1, appliedAtRound: 1 },
          ],
        },
      ];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects).toHaveLength(0);
    });

    it('preserves permanent effects', () => {
      const participants = [
        {
          ...mockParticipant1,
          statusEffects: [
            { id: 'e1', name: 'Blessed', durationInRounds: null, appliedAtRound: 1 },
          ],
        },
      ];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects).toHaveLength(1);
      expect(result[0].statusEffects[0].durationInRounds).toBeNull();
    });

    it('handles participants with no effects', () => {
      const participants = [mockParticipant1, mockParticipant2];
      const result = decrementEffectDurations(participants);

      expect(result).toHaveLength(2);
      expect(result[0].statusEffects).toHaveLength(0);
    });
  });

  describe('sortParticipantsByInitiative', () => {
    it('sorts participants by initiative descending', () => {
      const unsorted = [mockParticipant2, mockParticipant3, mockParticipant1];
      const result = sortParticipantsByInitiative(unsorted);

      expect(result[0].initiativeValue).toBe(14); // Goblin
      expect(result[1].initiativeValue).toBe(10); // Barbarian
      expect(result[2].initiativeValue).toBe(8); // Wizard
    });

    it('does not mutate original array', () => {
      const original = [...mockSession.participants];
      sortParticipantsByInitiative(original);

      expect(original).toEqual(mockSession.participants);
    });

    it('maintains order for tied initiatives (stable sort)', () => {
      const participants = [
        { ...mockParticipant1, initiativeValue: 10 },
        { ...mockParticipant2, initiativeValue: 10 },
        { ...mockParticipant3, initiativeValue: 8 },
      ];
      const result = sortParticipantsByInitiative(participants);

      // Stable sort should maintain order for ties
      expect(result[0].id).toBe('p1');
      expect(result[1].id).toBe('p2');
    });
  });
});
