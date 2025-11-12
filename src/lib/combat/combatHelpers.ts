/**
 * Combat helper utilities - pure functions for combat mechanics
 * Feature 009: Combat Tracker
 */

import { CombatSession, Participant } from '../schemas/combat';

/**
 * Advance to the next participant's turn
 * Increments round if wrapping to first participant
 * Decrements and removes status effect durations when round ends
 */
export function advanceTurn(session: CombatSession): CombatSession {
  const nextTurnIndex = (session.currentTurnIndex + 1) % session.participants.length;
  const roundAdvanced = nextTurnIndex === 0;
  const newRoundNumber = roundAdvanced
    ? session.currentRoundNumber + 1
    : session.currentRoundNumber;

  // Decrement effect durations if round advanced
  let participants = session.participants;
  if (roundAdvanced) {
    participants = decrementEffectDurations(session.participants);
  }

  return {
    ...session,
    currentTurnIndex: nextTurnIndex,
    currentRoundNumber: newRoundNumber,
    participants,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Rewind to the previous participant's turn
 * Decrements round if wrapping to last participant
 * Does not go below round 1
 */
export function rewindTurn(session: CombatSession): CombatSession {
  const prevTurnIndex =
    session.currentTurnIndex === 0
      ? session.participants.length - 1
      : session.currentTurnIndex - 1;

  const roundDecremented = session.currentTurnIndex === 0;
  const newRoundNumber = Math.max(
    1,
    roundDecremented ? session.currentRoundNumber - 1 : session.currentRoundNumber
  );

  return {
    ...session,
    currentTurnIndex: prevTurnIndex,
    currentRoundNumber: newRoundNumber,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Apply damage to a participant
 * Temporary HP absorbs damage first, then current HP
 * Allows negative HP for tracking overkill
 */
export function applyDamage(participant: Participant, damage: number): Participant {
  if (damage <= 0) return participant;

  const tempHPRemaining = Math.max(0, participant.temporaryHP - damage);
  const damageToCurrentHP = Math.max(0, damage - (participant.temporaryHP - tempHPRemaining));
  const newCurrentHP = participant.currentHP - damageToCurrentHP;

  return {
    ...participant,
    temporaryHP: tempHPRemaining,
    currentHP: newCurrentHP,
  };
}

/**
 * Apply healing to a participant
 * Cannot exceed max HP
 * Does not modify temporary HP
 */
export function applyHealing(participant: Participant, healing: number): Participant {
  if (healing <= 0) return participant;

  return {
    ...participant,
    currentHP: Math.min(participant.maxHP, participant.currentHP + healing),
  };
}

/**
 * Decrement status effect durations at end of round
 * Removes effects that reach 0 duration
 * Preserves permanent effects (durationInRounds === null)
 */
export function decrementEffectDurations(participants: Participant[]): Participant[] {
  return participants.map(p => ({
    ...p,
    statusEffects: p.statusEffects
      .map(e =>
        e.durationInRounds !== null
          ? { ...e, durationInRounds: e.durationInRounds - 1 }
          : e
      )
      .filter(e => e.durationInRounds === null || e.durationInRounds > 0),
  }));
}

/**
 * Sort participants by initiative value (highest first)
 * Stable sort maintains insertion order for tied initiatives
 * Does not mutate original array
 */
export function sortParticipantsByInitiative(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => b.initiativeValue - a.initiativeValue);
}
