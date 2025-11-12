/**
 * Shared test utilities for combat components
 * Reduces duplication across test files
 */

import { mockParticipant1 } from '@fixtures/combat-sessions';

/**
 * Reusable default props for HPTracker component tests
 */
export const createHPTrackerDefaultProps = () => ({
  participant: mockParticipant1,
  onApplyDamage: jest.fn(),
  onApplyHealing: jest.fn(),
});

/**
 * Create participant variant with custom HP
 */
export const createParticipantWithHP = (currentHP: number, maxHP = mockParticipant1.maxHP) => ({
  ...mockParticipant1,
  currentHP,
  maxHP,
});

/**
 * Create participant variant with temporary HP
 */
export const createParticipantWithTempHP = (temporaryHP: number) => ({
  ...mockParticipant1,
  temporaryHP,
});

/**
 * Create unconscious participant (HP <= 0)
 */
export const createUnconsciousParticipant = (hp = 0) => ({
  ...mockParticipant1,
  currentHP: hp,
});

/**
 * Validation test helper: test error for invalid input
 * @param label - Label for test case
 * @param inputValue - Value to type in input
 * @param expectedError - Expected error message regex
 */
export const validateInputErrorHelper = (
  label: string,
  inputValue: string,
  expectedError: RegExp,
) => ({
  label,
  inputValue,
  expectedError,
});

/**
 * Common StatusEffect test data
 */
export const testStatusEffects = {
  prone: { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Prone', durationRounds: 2 },
  stunned: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Stunned', durationRounds: 1 },
  poisoned: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Poisoned', durationRounds: 3 },
};

/**
 * Create default props for StatusEffectPill tests
 */
export const createStatusEffectPillDefaultProps = () => ({
  effect: testStatusEffects.prone,
  _participantId: mockParticipant1.id,
  onRemove: jest.fn(),
});

/**
 * Create default props for StatusEffectMenu tests
 */
export const createStatusEffectMenuDefaultProps = () => ({
  _participantId: mockParticipant1.id,
  onAddEffect: jest.fn(),
});

/**
 * Create default props for StatusEffectsPanel tests
 */
export const createStatusEffectsPanelDefaultProps = () => ({
  participantId: mockParticipant1.id,
  effects: [testStatusEffects.prone],
  onAddEffect: jest.fn(),
  onRemoveEffect: jest.fn(),
});
