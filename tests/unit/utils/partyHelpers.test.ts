import {
  getPartyComposition,
  getAverageLevel,
  getLevelRange,
  getPartyTier,
  getPartyMemberCount,
  sortMembersByPosition,
  getRoleColor,
  getRoleBgColor,
} from '../../../src/lib/utils/partyHelpers';
import { Party, PartyMember } from '../../../src/types/party';

describe('partyHelpers', () => {
  const createPartyMember = (
    overrides: Partial<PartyMember> = {}
  ): PartyMember => ({
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
        createPartyMember({
          id: '1',
          characterName: 'Tank',
          level: 5,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
        createPartyMember({
          id: '2',
          characterName: 'Healer',
          level: 5,
          class: 'Cleric',
          role: 'Healer',
          ac: 12,
          hp: 30,
          position: 1,
        }),
        createPartyMember({
          id: '3',
          characterName: 'DPS',
          level: 5,
          class: 'Rogue',
          role: 'DPS',
          ac: 14,
          hp: 25,
          position: 2,
        }),
        createPartyMember({
          id: '4',
          characterName: 'Support',
          level: 5,
          class: 'Bard',
          role: 'Support',
          ac: 12,
          hp: 28,
          position: 3,
        }),
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
        createPartyMember({
          id: '1',
          characterName: 'Tank',
          level: 5,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
        createPartyMember({
          id: '2',
          characterName: 'Unknown',
          level: 5,
          class: 'Wizard',
          role: undefined,
          ac: 10,
          hp: 20,
          position: 1,
        }),
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
        createPartyMember({
          id: '1',
          characterName: 'Char1',
          level: 5,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
        createPartyMember({
          id: '2',
          characterName: 'Char2',
          level: 7,
          class: 'Cleric',
          role: 'Healer',
          ac: 12,
          hp: 30,
          position: 1,
        }),
        createPartyMember({
          id: '3',
          characterName: 'Char3',
          level: 6,
          class: 'Rogue',
          role: 'DPS',
          ac: 14,
          hp: 25,
          position: 2,
        }),
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
        createPartyMember({
          id: '1',
          characterName: 'Char1',
          level: 5,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
        createPartyMember({
          id: '2',
          characterName: 'Char2',
          level: 6,
          class: 'Cleric',
          role: 'Healer',
          ac: 12,
          hp: 30,
          position: 1,
        }),
      ]);

      const avgLevel = getAverageLevel(party);

      expect(avgLevel).toBe(6); // (5 + 6) / 2 = 5.5, rounded to 6
    });
  });

  describe('getLevelRange', () => {
    it('should return formatted level range', () => {
      const party = createParty([
        createPartyMember({
          id: '1',
          characterName: 'Lowlevel',
          level: 3,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
        createPartyMember({
          id: '2',
          characterName: 'Midlevel',
          level: 6,
          class: 'Cleric',
          role: 'Healer',
          ac: 12,
          hp: 30,
          position: 1,
        }),
        createPartyMember({
          id: '3',
          characterName: 'Highlevel',
          level: 9,
          class: 'Rogue',
          role: 'DPS',
          ac: 14,
          hp: 25,
          position: 2,
        }),
      ]);

      const range = getLevelRange(party);

      expect(range).toContain('3');
      expect(range).toContain('9');
    });

    it('should handle single character party', () => {
      const party = createParty([
        createPartyMember({
          id: '1',
          characterName: 'Solo',
          level: 5,
          class: 'Fighter',
          role: 'Tank',
          ac: 15,
          hp: 50,
          position: 0,
        }),
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

  describe('getPartyTier', () => {
    it('should return Beginner for average level < 5', () => {
      const party = createParty([
        createPartyMember({ id: '1', level: 3 }),
        createPartyMember({ id: '2', level: 4 }),
      ]);

      expect(getPartyTier(party)).toBe('Beginner');
    });

    it('should return Intermediate for average level 5-10', () => {
      const party = createParty([
        createPartyMember({ id: '1', level: 5 }),
        createPartyMember({ id: '2', level: 10 }),
      ]);

      expect(getPartyTier(party)).toBe('Intermediate');
    });

    it('should return Advanced for average level 11-16', () => {
      const party = createParty([
        createPartyMember({ id: '1', level: 11 }),
        createPartyMember({ id: '2', level: 16 }),
      ]);

      expect(getPartyTier(party)).toBe('Advanced');
    });

    it('should return Expert for average level >= 17', () => {
      const party = createParty([
        createPartyMember({ id: '1', level: 17 }),
        createPartyMember({ id: '2', level: 20 }),
      ]);

      expect(getPartyTier(party)).toBe('Expert');
    });

    it('should return Beginner for empty party', () => {
      const party = createParty([]);

      expect(getPartyTier(party)).toBe('Beginner');
    });
  });

  describe('getPartyMemberCount', () => {
    it('should return correct member count', () => {
      const party = createParty([
        createPartyMember({ id: '1' }),
        createPartyMember({ id: '2' }),
        createPartyMember({ id: '3' }),
      ]);

      expect(getPartyMemberCount(party)).toBe(3);
    });

    it('should return 0 for empty party', () => {
      const party = createParty([]);

      expect(getPartyMemberCount(party)).toBe(0);
    });

    it('should return 1 for single member', () => {
      const party = createParty([createPartyMember({ id: '1' })]);

      expect(getPartyMemberCount(party)).toBe(1);
    });
  });

  describe('sortMembersByPosition', () => {
    it('should sort members by position', () => {
      const members = [
        createPartyMember({ id: '1', position: 2 }),
        createPartyMember({ id: '2', position: 0 }),
        createPartyMember({ id: '3', position: 1 }),
      ];

      const sorted = sortMembersByPosition(members);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should not modify original array', () => {
      const members = [
        createPartyMember({ id: '1', position: 2 }),
        createPartyMember({ id: '2', position: 0 }),
      ];

      sortMembersByPosition(members);

      expect(members[0].position).toBe(2);
      expect(members[1].position).toBe(0);
    });

    it('should handle already sorted members', () => {
      const members = [
        createPartyMember({ id: '1', position: 0 }),
        createPartyMember({ id: '2', position: 1 }),
        createPartyMember({ id: '3', position: 2 }),
      ];

      const sorted = sortMembersByPosition(members);

      expect(sorted.map((m) => m.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('getRoleColor', () => {
    it('should return Tank color for Tank role', () => {
      expect(getRoleColor('Tank')).toContain('blue');
    });

    it('should return Healer color for Healer role', () => {
      expect(getRoleColor('Healer')).toContain('green');
    });

    it('should return DPS color for DPS role', () => {
      expect(getRoleColor('DPS')).toContain('red');
    });

    it('should return Support color for Support role', () => {
      expect(getRoleColor('Support')).toContain('purple');
    });

    it('should return gray color for undefined role', () => {
      expect(getRoleColor(undefined)).toContain('gray');
    });

    it('should return gray color for unknown role', () => {
      expect(getRoleColor('Unknown')).toContain('gray');
    });
  });

  describe('getRoleBgColor', () => {
    it('should return Tank hex color', () => {
      expect(getRoleBgColor('Tank')).toBe('#2563eb');
    });

    it('should return Healer hex color', () => {
      expect(getRoleBgColor('Healer')).toBe('#16a34a');
    });

    it('should return DPS hex color', () => {
      expect(getRoleBgColor('DPS')).toBe('#dc2626');
    });

    it('should return Support hex color', () => {
      expect(getRoleBgColor('Support')).toBe('#7c3aed');
    });

    it('should return gray hex color for undefined role', () => {
      expect(getRoleBgColor(undefined)).toBe('#6b7280');
    });

    it('should return gray hex color for unknown role', () => {
      expect(getRoleBgColor('Unknown')).toBe('#6b7280');
    });
  });
});
