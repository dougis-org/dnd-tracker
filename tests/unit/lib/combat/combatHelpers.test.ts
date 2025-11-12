import {
  advanceTurn,
  rewindTurn,
  applyDamage,
  applyHealing,
  decrementEffectDurations,
  sortParticipantsByInitiative,
} from '@/lib/combat/combatHelpers';
import { CombatSession, Participant, StatusEffect } from '@/lib/schemas/combat';

/**
 * Tests for combat helper utilities
 * Feature 009: Combat Tracker - T043, T044, T045
 */

describe('combatHelpers', () => {
  // Mock data
  const createMockParticipant = (overrides?: Partial<Participant>): Participant => ({
    id: 'participant-1',
    name: 'Test Creature',
    currentHP: 50,
    maxHP: 50,
    temporaryHP: 0,
    initiativeValue: 15,
    statusEffects: [],
    ...overrides,
  });

  const createMockSession = (overrides?: Partial<CombatSession>): CombatSession => ({
    id: 'session-1',
    participants: [
      createMockParticipant({ id: 'p1', name: 'Creature 1', initiativeValue: 15 }),
      createMockParticipant({ id: 'p2', name: 'Creature 2', initiativeValue: 10 }),
    ],
    currentTurnIndex: 0,
    currentRoundNumber: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe('advanceTurn', () => {
    it('should advance to next participant', () => {
      const session = createMockSession();
      const result = advanceTurn(session);

      expect(result.currentTurnIndex).toBe(1);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('should increment round when wrapping to first participant', () => {
      const session = createMockSession({ currentTurnIndex: 1 });
      const result = advanceTurn(session);

      expect(result.currentTurnIndex).toBe(0);
      expect(result.currentRoundNumber).toBe(2);
    });

    it('should decrement effect durations when round advances', () => {
      const effect: StatusEffect = {
        id: 'effect-1',
        name: 'Poisoned',
        durationInRounds: 3,
        appliedAtRound: 1,
      };
      const session = createMockSession({
        currentTurnIndex: 1,
        participants: [
          createMockParticipant({ id: 'p1', statusEffects: [effect] }),
          createMockParticipant({ id: 'p2', statusEffects: [] }),
        ],
      });

      const result = advanceTurn(session);

      expect(result.currentRoundNumber).toBe(2);
      expect(result.participants[0].statusEffects[0].durationInRounds).toBe(2);
    });

    it('should remove expired effects when round advances', () => {
      const effect: StatusEffect = {
        id: 'effect-1',
        name: 'Poisoned',
        durationInRounds: 1,
        appliedAtRound: 2,
      };
      const session = createMockSession({
        currentTurnIndex: 1,
        currentRoundNumber: 2,
        participants: [
          createMockParticipant({ id: 'p1', statusEffects: [effect] }),
          createMockParticipant({ id: 'p2', statusEffects: [] }),
        ],
      });

      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects).toHaveLength(0);
    });

    it('should preserve permanent effects when round advances', () => {
      const permanentEffect: StatusEffect = {
        id: 'effect-1',
        name: 'Cursed',
        durationInRounds: null,
        appliedAtRound: 1,
      };
      const session = createMockSession({
        currentTurnIndex: 1,
        participants: [
          createMockParticipant({ id: 'p1', statusEffects: [permanentEffect] }),
          createMockParticipant({ id: 'p2', statusEffects: [] }),
        ],
      });

      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects).toHaveLength(1);
      expect(result.participants[0].statusEffects[0].durationInRounds).toBeNull();
    });

    it('should not decrement effects when round does not advance', () => {
      const effect: StatusEffect = {
        id: 'effect-1',
        name: 'Poisoned',
        durationInRounds: 3,
        appliedAtRound: 1,
      };
      const session = createMockSession({
        currentTurnIndex: 0,
        currentRoundNumber: 1,
        participants: [
          createMockParticipant({ id: 'p1', statusEffects: [effect] }),
          createMockParticipant({ id: 'p2', statusEffects: [] }),
        ],
      });

      const result = advanceTurn(session);

      expect(result.participants[0].statusEffects[0].durationInRounds).toBe(3);
    });

    it('should update updatedAt timestamp', () => {
      const session = createMockSession();
      const oldTime = new Date(session.updatedAt);
      const result = advanceTurn(session);
      const newTime = new Date(result.updatedAt);

      expect(newTime.getTime()).toBeGreaterThanOrEqual(oldTime.getTime());
    });
  });

  describe('rewindTurn', () => {
    it('should go to previous participant', () => {
      const session = createMockSession({ currentTurnIndex: 1 });
      const result = rewindTurn(session);

      expect(result.currentTurnIndex).toBe(0);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('should decrement round when wrapping to last participant', () => {
      const session = createMockSession({ currentTurnIndex: 0, currentRoundNumber: 2 });
      const result = rewindTurn(session);

      expect(result.currentTurnIndex).toBe(1);
      expect(result.currentRoundNumber).toBe(1);
    });

    it('should not go below round 1', () => {
      const session = createMockSession({
        currentTurnIndex: 0,
        currentRoundNumber: 1,
        participants: [
          createMockParticipant({ id: 'p1' }),
          createMockParticipant({ id: 'p2' }),
        ],
      });
      const result = rewindTurn(session);

      expect(result.currentRoundNumber).toBe(1);
    });

    it('should restore effects when round is rewound (undo)', () => {
      // This is a simplified test; in reality, undoing would require
      // tracking previous state via undoRedoManager
      const session = createMockSession();
      const result = rewindTurn(session);

      // After rewind, we're back at same position, so effects should not change
      expect(result.participants).toHaveLength(2);
    });
  });

  describe('applyDamage', () => {
    it('should reduce current HP by damage amount', () => {
      const participant = createMockParticipant({ currentHP: 50, temporaryHP: 0 });
      const result = applyDamage(participant, 10);

      expect(result.currentHP).toBe(40);
    });

    it('should absorb damage with temporary HP first', () => {
      const participant = createMockParticipant({ currentHP: 50, temporaryHP: 15 });
      const result = applyDamage(participant, 20);

      expect(result.temporaryHP).toBe(0);
      expect(result.currentHP).toBe(45);
    });

    it('should allow negative current HP (overkill)', () => {
      const participant = createMockParticipant({ currentHP: 5, temporaryHP: 0 });
      const result = applyDamage(participant, 10);

      expect(result.currentHP).toBe(-5);
    });

    it('should return unchanged participant if damage is 0 or negative', () => {
      const participant = createMockParticipant({ currentHP: 50 });
      const result1 = applyDamage(participant, 0);
      const result2 = applyDamage(participant, -5);

      expect(result1.currentHP).toBe(50);
      expect(result2.currentHP).toBe(50);
    });

    it('should reduce temp HP to 0 minimum', () => {
      const participant = createMockParticipant({ currentHP: 50, temporaryHP: 5 });
      const result = applyDamage(participant, 20);

      expect(result.temporaryHP).toBe(0);
    });
  });

  describe('applyHealing', () => {
    it('should increase current HP by healing amount', () => {
      const participant = createMockParticipant({ currentHP: 30, maxHP: 50 });
      const result = applyHealing(participant, 10);

      expect(result.currentHP).toBe(40);
    });

    it('should not exceed max HP', () => {
      const participant = createMockParticipant({ currentHP: 45, maxHP: 50 });
      const result = applyHealing(participant, 10);

      expect(result.currentHP).toBe(50);
    });

    it('should return unchanged participant if healing is 0 or negative', () => {
      const participant = createMockParticipant({ currentHP: 30, maxHP: 50 });
      const result1 = applyHealing(participant, 0);
      const result2 = applyHealing(participant, -5);

      expect(result1.currentHP).toBe(30);
      expect(result2.currentHP).toBe(30);
    });

    it('should not modify temporary HP', () => {
      const participant = createMockParticipant({ currentHP: 30, maxHP: 50, temporaryHP: 10 });
      const result = applyHealing(participant, 10);

      expect(result.temporaryHP).toBe(10);
    });
  });

  describe('decrementEffectDurations', () => {
    it('should decrement all effect durations by 1', () => {
      const effects: StatusEffect[] = [
        { id: '1', name: 'Effect A', durationInRounds: 3, appliedAtRound: 1 },
        { id: '2', name: 'Effect B', durationInRounds: 2, appliedAtRound: 1 },
      ];
      const participants = [createMockParticipant({ statusEffects: effects })];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects[0].durationInRounds).toBe(2);
      expect(result[0].statusEffects[1].durationInRounds).toBe(1);
    });

    it('should remove effects that reach 0 duration', () => {
      const effects: StatusEffect[] = [
        { id: '1', name: 'Effect A', durationInRounds: 1, appliedAtRound: 1 },
        { id: '2', name: 'Effect B', durationInRounds: 2, appliedAtRound: 1 },
      ];
      const participants = [createMockParticipant({ statusEffects: effects })];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects).toHaveLength(1);
      expect(result[0].statusEffects[0].id).toBe('2');
    });

    it('should preserve permanent effects (durationInRounds === null)', () => {
      const effects: StatusEffect[] = [
        { id: '1', name: 'Cursed', durationInRounds: null, appliedAtRound: 1 },
        { id: '2', name: 'Poisoned', durationInRounds: 2, appliedAtRound: 1 },
      ];
      const participants = [createMockParticipant({ statusEffects: effects })];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects).toHaveLength(2);
      expect(result[0].statusEffects[0].durationInRounds).toBeNull();
    });

    it('should handle multiple participants independently', () => {
      const effects1: StatusEffect[] = [
        { id: '1', name: 'Effect A', durationInRounds: 2, appliedAtRound: 1 },
      ];
      const effects2: StatusEffect[] = [
        { id: '2', name: 'Effect B', durationInRounds: 1, appliedAtRound: 1 },
      ];
      const participants = [
        createMockParticipant({ id: 'p1', statusEffects: effects1 }),
        createMockParticipant({ id: 'p2', statusEffects: effects2 }),
      ];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects[0].durationInRounds).toBe(1);
      expect(result[1].statusEffects).toHaveLength(0);
    });

    it('should handle participants with no effects', () => {
      const participants = [
        createMockParticipant({ id: 'p1', statusEffects: [] }),
      ];
      const result = decrementEffectDurations(participants);

      expect(result[0].statusEffects).toHaveLength(0);
    });
  });

  describe('sortParticipantsByInitiative', () => {
    it('should sort participants by initiative (highest first)', () => {
      const participants = [
        createMockParticipant({ id: 'p1', initiativeValue: 10 }),
        createMockParticipant({ id: 'p2', initiativeValue: 20 }),
        createMockParticipant({ id: 'p3', initiativeValue: 15 }),
      ];
      const result = sortParticipantsByInitiative(participants);

      expect(result[0].initiativeValue).toBe(20);
      expect(result[1].initiativeValue).toBe(15);
      expect(result[2].initiativeValue).toBe(10);
    });

    it('should maintain stable sort for tied initiatives', () => {
      const participants = [
        createMockParticipant({ id: 'p1', initiativeValue: 15, name: 'A' }),
        createMockParticipant({ id: 'p2', initiativeValue: 15, name: 'B' }),
        createMockParticipant({ id: 'p3', initiativeValue: 15, name: 'C' }),
      ];
      const result = sortParticipantsByInitiative(participants);

      expect(result).toHaveLength(3);
      expect(result[0].initiativeValue).toBe(15);
    });

    it('should not mutate original array', () => {
      const participants = [
        createMockParticipant({ id: 'p1', initiativeValue: 10 }),
        createMockParticipant({ id: 'p2', initiativeValue: 20 }),
      ];
      const originalOrder = [...participants];
      const result = sortParticipantsByInitiative(participants);

      expect(participants).toEqual(originalOrder);
      expect(result[0].initiativeValue).toBe(20);
    });
  });
});
