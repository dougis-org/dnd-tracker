import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import EncounterSchema, {
  ParticipantSchema,
} from '../../../src/lib/schemas/encounter';

// T013: Unit tests for Encounter Zod schemas
describe('Encounter Zod schema (T013)', () => {
  it('should export a Zod schema for Encounter validation', () => {
    expect(EncounterSchema).toBeDefined();
    expect(typeof EncounterSchema.parse).toBe('function');
  });

  it('should export a Zod schema for Participant validation', () => {
    expect(ParticipantSchema).toBeDefined();
    expect(typeof ParticipantSchema.parse).toBe('function');
  });

  it('should validate a valid encounter', () => {
    const data = {
      name: 'Test Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 2 },
      ],
    };
    const result = EncounterSchema.parse(data);
    expect(result.name).toBe('Test Encounter');
    expect(result.participants).toHaveLength(1);
  });

  it('should reject encounter without name', () => {
    const data = {
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 2 },
      ],
    };
    expect(() => EncounterSchema.parse(data)).toThrow(z.ZodError);
  });

  it('should reject encounter with empty participants', () => {
    const data = {
      name: 'Empty',
      participants: [],
    };
    expect(() => EncounterSchema.parse(data)).toThrow(z.ZodError);
  });

  it('should reject name exceeding max length (200)', () => {
    const longName = 'a'.repeat(201);
    const data = {
      name: longName,
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 2 },
      ],
    };
    expect(() => EncounterSchema.parse(data)).toThrow(z.ZodError);
  });

  it('should validate participant with valid type', () => {
    const participant = {
      type: 'party_member' as const,
      displayName: 'Fighter',
      quantity: 1,
    };
    const result = ParticipantSchema.parse(participant);
    expect(result.type).toBe('party_member');
  });

  it('should reject participant with invalid type', () => {
    const participant = {
      type: 'invalid' as unknown as 'monster',
      displayName: 'Fighter',
      quantity: 1,
    };
    expect(() => ParticipantSchema.parse(participant)).toThrow(z.ZodError);
  });

  it('should reject participant with zero quantity', () => {
    const participant = {
      type: 'monster' as const,
      displayName: 'Goblin',
      quantity: 0,
    };
    expect(() => ParticipantSchema.parse(participant)).toThrow(z.ZodError);
  });

  it('should allow optional encounter fields', () => {
    const data = {
      name: 'Optional Fields',
      participants: [
        { type: 'monster' as const, displayName: 'Ogre', quantity: 1 },
      ],
      description: 'A test encounter',
      tags: ['outdoor'],
      template_flag: true,
      owner_id: 'user456',
    };
    const result = EncounterSchema.parse(data);
    expect(result.description).toBe('A test encounter');
    expect(result.tags).toEqual(['outdoor']);
    expect(result.template_flag).toBe(true);
  });
});
