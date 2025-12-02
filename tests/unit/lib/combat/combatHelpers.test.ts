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
      expect(
        result.participants[0].statusEffects[0].durationInRounds
      ).toBeNull();
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
      const session = {
        ...mockSession,
        currentTurnIndex: 0,
        currentRoundNumber: 2,
      };
      const result = rewindTurn(session);

      expect(result.currentTurnIndex).toBe(mockSession.participants.length - 1);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('does not go below round 1', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: 0,
        currentRoundNumber: 1,
      };
      const result = rewindTurn(session);

      expect(result.currentRoundNumber).toBe(1);
      expect(result.currentTurnIndex).toBe(mockSession.participants.length - 1);
    });
  });

  describe('applyDamage', () => {
    const damageTests = [
      { setup: { currentHP: 10, temporaryHP: 0 }, damage: 3, expectedHP: 7, expectedTemp: 0, desc: 'applies damage to current HP when no temp HP' },
      { setup: { currentHP: 10, temporaryHP: 5 }, damage: 8, expectedHP: 7, expectedTemp: 0, desc: 'absorbs damage with temp HP first' },
      { setup: { currentHP: 30, temporaryHP: 3 }, damage: 10, expectedHP: 23, expectedTemp: 0, desc: 'applies full damage to current HP when temp HP insufficient' },
      { setup: { currentHP: 5, temporaryHP: 0 }, damage: 10, expectedHP: -5, expectedTemp: 0, desc: 'allows negative HP' },
      { setup: { currentHP: 10, temporaryHP: 0 }, damage: 0, expectedHP: 10, expectedTemp: 0, desc: 'handles zero damage' },
      { setup: { currentHP: 10, temporaryHP: 0 }, damage: -5, expectedHP: 10, expectedTemp: 0, desc: 'handles negative damage' },
    ];

    damageTests.forEach(({ setup, damage, expectedHP, expectedTemp, desc }) => {
      it(desc, () => {
        const participant = { ...mockParticipant1, ...setup };
        const result = applyDamage(participant, damage);
        expect(result.currentHP).toBe(expectedHP);
        expect(result.temporaryHP).toBe(expectedTemp);
      });
    });
  });

  describe('applyHealing', () => {
    const healingTests = [
      { setup: { currentHP: 3, maxHP: 10 }, healing: 5, expectedHP: 8, desc: 'increases current HP' },
      { setup: { currentHP: 5, maxHP: 7 }, healing: 10, expectedHP: 7, desc: 'cannot exceed max HP' },
      { setup: { currentHP: -2, maxHP: 7 }, healing: 5, expectedHP: 3, desc: 'heals unconscious participant' },
      { setup: { currentHP: 3, maxHP: 10 }, healing: 0, expectedHP: 3, desc: 'handles zero healing' },
      { setup: { currentHP: 5, maxHP: 10 }, healing: -3, expectedHP: 5, desc: 'handles negative healing' },
    ];

    healingTests.forEach(({ setup, healing, expectedHP, desc }) => {
      it(desc, () => {
        const participant = { ...mockParticipant1, ...setup };
        const result = applyHealing(participant, healing);
        expect(result.currentHP).toBe(expectedHP);
      });
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
            {
              id: 'e2',
              name: 'Restrained',
              durationInRounds: 2,
              appliedAtRound: 1,
            },
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
            {
              id: 'e1',
              name: 'Blessed',
              durationInRounds: null,
              appliedAtRound: 1,
            },
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
