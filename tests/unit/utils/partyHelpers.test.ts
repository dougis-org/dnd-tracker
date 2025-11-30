import {
  getPartyComposition,
  getAverageLevel,
  getLevelRange,
} from '../../../src/lib/utils/partyHelpers';
import { Party, PartyMember } from '../../../src/types/party';

describe('partyHelpers', () => {
  const createPartyMember = (overrides: Partial<PartyMember> = {}): PartyMember => ({
    id: '1',
    partyId: 'party-1',
    characterName: 'Test Character',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 50,
    position: 0,
    ...overrides,
  });

  const createParty = (members: PartyMember[]): Party => ({
    id: 'party-1',
    name: 'Test Party',
    description: '',
    members,
    created_at: new Date(),
    updated_at: new Date(),
  });

  describe('getPartyComposition', () => {
    it('should count all role types correctly', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Tank', level: 5, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
        createPartyMember({ id: '2', characterName: 'Healer', level: 5, class: 'Cleric', role: 'Healer', ac: 12, hp: 30, position: 1 }),
        createPartyMember({ id: '3', characterName: 'DPS', level: 5, class: 'Rogue', role: 'DPS', ac: 14, hp: 25, position: 2 }),
        createPartyMember({ id: '4', characterName: 'Support', level: 5, class: 'Bard', role: 'Support', ac: 12, hp: 28, position: 3 }),
      ]);

      const composition = getPartyComposition(party);

      expect(composition.tanks).toBe(1);
      expect(composition.healers).toBe(1);
      expect(composition.dps).toBe(1);
      expect(composition.support).toBe(1);
      expect(composition.unassigned).toBe(0);
    });

    it('should count unassigned members', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Tank', level: 5, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
        createPartyMember({ id: '2', characterName: 'Unknown', level: 5, class: 'Wizard', role: undefined, ac: 10, hp: 20, position: 1 }),
      ]);

      const composition = getPartyComposition(party);

      expect(composition.tanks).toBe(1);
      expect(composition.unassigned).toBe(1);
    });

    it('should handle empty party', () => {
      const party = createParty([]);

      const composition = getPartyComposition(party);

      expect(composition.tanks).toBe(0);
      expect(composition.healers).toBe(0);
      expect(composition.dps).toBe(0);
      expect(composition.support).toBe(0);
      expect(composition.unassigned).toBe(0);
    });
  });

  describe('getAverageLevel', () => {
    it('should calculate average level correctly', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Char1', level: 5, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
        createPartyMember({ id: '2', characterName: 'Char2', level: 7, class: 'Cleric', role: 'Healer', ac: 12, hp: 30, position: 1 }),
        createPartyMember({ id: '3', characterName: 'Char3', level: 6, class: 'Rogue', role: 'DPS', ac: 14, hp: 25, position: 2 }),
      ]);

      const avgLevel = getAverageLevel(party);

      expect(avgLevel).toBe(6);
    });

    it('should return 0 for empty party', () => {
      const party = createParty([]);

      const avgLevel = getAverageLevel(party);

      expect(avgLevel).toBe(0);
    });

    it('should round average level', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Char1', level: 5, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
        createPartyMember({ id: '2', characterName: 'Char2', level: 6, class: 'Cleric', role: 'Healer', ac: 12, hp: 30, position: 1 }),
      ]);

      const avgLevel = getAverageLevel(party);

      expect(avgLevel).toBe(6); // (5 + 6) / 2 = 5.5, rounded to 6
    });
  });

  describe('getLevelRange', () => {
    it('should return formatted level range', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Lowlevel', level: 3, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
        createPartyMember({ id: '2', characterName: 'Midlevel', level: 6, class: 'Cleric', role: 'Healer', ac: 12, hp: 30, position: 1 }),
        createPartyMember({ id: '3', characterName: 'Highlevel', level: 9, class: 'Rogue', role: 'DPS', ac: 14, hp: 25, position: 2 }),
      ]);

      const range = getLevelRange(party);

      expect(range).toContain('3');
      expect(range).toContain('9');
    });

    it('should handle single character party', () => {
      const party = createParty([
        createPartyMember({ id: '1', characterName: 'Solo', level: 5, class: 'Fighter', role: 'Tank', ac: 15, hp: 50, position: 0 }),
      ]);

      const range = getLevelRange(party);

      expect(range).toContain('5');
    });

    it('should return N/A for empty party', () => {
      const party = createParty([]);

      const range = getLevelRange(party);

      expect(range).toBe('N/A');
    });
  });
});
