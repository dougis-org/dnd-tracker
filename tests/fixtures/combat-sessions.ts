/**
 * Mock combat session fixtures for testing
 * Feature 009: Combat Tracker Page
 */

import { CombatSession, Participant } from '../../src/lib/schemas/combat';

export const mockParticipant1: Participant = {
  id: 'p1',
  name: 'Goblin Ambusher',
  type: 'monster',
  initiativeValue: 14,
  maxHP: 7,
  currentHP: 7,
  temporaryHP: 0,
  acValue: 15,
  statusEffects: [],
};

export const mockParticipant2: Participant = {
  id: 'p2',
  name: 'Barbarian Hero',
  type: 'character',
  initiativeValue: 10,
  maxHP: 60,
  currentHP: 60,
  temporaryHP: 0,
  acValue: 16,
  statusEffects: [],
};

export const mockParticipant3: Participant = {
  id: 'p3',
  name: 'Wizard',
  type: 'character',
  initiativeValue: 8,
  maxHP: 28,
  currentHP: 28,
  temporaryHP: 0,
  acValue: 12,
  statusEffects: [],
};

export const mockSession: CombatSession = {
  id: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
  status: 'active',
  currentRoundNumber: 1,
  currentTurnIndex: 0,
  participants: [mockParticipant1, mockParticipant2, mockParticipant3],
  lairActionInitiative: 20,
  createdAt: '2025-11-11T18:00:00Z',
  updatedAt: '2025-11-11T18:00:00Z',
  owner_id: 'user_123',
};

export const mockSessionRound2: CombatSession = {
  ...mockSession,
  currentRoundNumber: 2,
  currentTurnIndex: 1,
  participants: [
    { ...mockParticipant1, currentHP: 3 }, // Took 4 damage
    mockParticipant2,
    mockParticipant3,
  ],
};

export const mockSessionWithEffects: CombatSession = {
  ...mockSession,
  participants: [
    {
      ...mockParticipant1,
      statusEffects: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Prone',
          durationInRounds: 1,
          appliedAtRound: 1,
          icon: '⬇️',
        },
      ],
    },
    {
      ...mockParticipant2,
      statusEffects: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Blessed',
          durationInRounds: null,
          appliedAtRound: 1,
          description: 'Advantage on saves',
        },
      ],
    },
    mockParticipant3,
  ],
};

export const mockSessionLargeEncounter: CombatSession = {
  ...mockSession,
  participants: Array.from({ length: 50 }, (_, i) => ({
    id: `p${i}`,
    name: `Participant ${i + 1}`,
    type: i % 3 === 0 ? 'monster' : i % 3 === 1 ? 'character' : 'npc',
    initiativeValue: Math.floor(Math.random() * 20) + 1,
    maxHP: Math.floor(Math.random() * 50) + 10,
    currentHP: Math.floor(Math.random() * 50) + 10,
    temporaryHP: Math.random() > 0.7 ? 5 : 0,
    acValue: Math.floor(Math.random() * 15) + 10,
    statusEffects: [],
  })),
};
