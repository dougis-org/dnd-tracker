/**
 * Unit tests for Party Member Helpers
 */

import {
  createFullMember,
  updateOrAddMember,
  removeMember,
  findMemberById,
} from '@/lib/utils/partyMemberHelpers';
import { PartyMember } from '@/types/party';

describe('partyMemberHelpers', () => {
  const mockMember: Partial<PartyMember> = {
    id: 'member-1',
    characterName: 'Aragorn',
    class: 'Ranger',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 45,
    role: 'Striker',
    position: 0,
  };

  describe('createFullMember', () => {
    it('should create a full member with provided data', () => {
      const member = createFullMember(mockMember);
      expect(member.characterName).toBe('Aragorn');
      expect(member.class).toBe('Ranger');
      expect(member.level).toBe(5);
    });

    it('should use defaults for missing fields', () => {
      const member = createFullMember({});
      expect(member.characterName).toBe('');
      expect(member.class).toBe('Fighter');
      expect(member.race).toBe('Human');
      expect(member.level).toBe(1);
      expect(member.ac).toBe(10);
      expect(member.hp).toBe(10);
      expect(member.position).toBe(0);
    });

    it('should generate ID when not provided', () => {
      const member = createFullMember({ characterName: 'Test' });
      expect(member.id).toBeDefined();
      expect(typeof member.id).toBe('string');
      expect(member.id.length).toBeGreaterThan(0);
    });

    it('should use provided ID', () => {
      const member = createFullMember({ id: 'custom-id' });
      expect(member.id).toBe('custom-id');
    });

    it('should preserve role when provided', () => {
      const member = createFullMember({ role: 'Tank' });
      expect(member.role).toBe('Tank');
    });

    it('should have undefined role when not provided', () => {
      const member = createFullMember({ characterName: 'Test' });
      expect(member.role).toBeUndefined();
    });

    it('should merge all member properties correctly', () => {
      const member = createFullMember(mockMember);
      expect(member).toMatchObject({
        id: 'member-1',
        characterName: 'Aragorn',
        class: 'Ranger',
        race: 'Human',
        level: 5,
        ac: 15,
        hp: 45,
        role: 'Striker',
        position: 0,
      });
    });

    it('should use default values for some fields and provided values for others', () => {
      const member = createFullMember({
        characterName: 'Legolas',
        level: 8,
      });
      expect(member.characterName).toBe('Legolas');
      expect(member.level).toBe(8);
      expect(member.class).toBe('Fighter'); // Default
      expect(member.ac).toBe(10); // Default
    });
  });

  describe('updateOrAddMember', () => {
    it('should add a new member when no editingMemberId', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];
      const newMember: Partial<PartyMember> = {
        characterName: 'Sam',
      };

      const result = updateOrAddMember(members, newMember, null);

      expect(result).toHaveLength(2);
      expect(result[0].characterName).toBe('Frodo');
      expect(result[1].characterName).toBe('Sam');
    });

    it('should update existing member when editingMemberId is provided', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo', level: 1 }),
      ];
      const updatedData: Partial<PartyMember> = {
        id: 'member-1',
        characterName: 'Frodo Updated',
        level: 5,
      };

      const result = updateOrAddMember(members, updatedData, 'member-1');

      expect(result).toHaveLength(1);
      expect(result[0].characterName).toBe('Frodo Updated');
      expect(result[0].level).toBe(5);
    });

    it('should preserve other members when updating', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
        createFullMember({ id: 'member-2', characterName: 'Sam' }),
        createFullMember({ id: 'member-3', characterName: 'Merry' }),
      ];
      const updatedData: Partial<PartyMember> = {
        id: 'member-2',
        characterName: 'Samwise',
      };

      const result = updateOrAddMember(members, updatedData, 'member-2');

      expect(result).toHaveLength(3);
      expect(result[0].characterName).toBe('Frodo');
      expect(result[1].characterName).toBe('Samwise');
      expect(result[2].characterName).toBe('Merry');
    });

    it('should only update if editingMemberId matches existing member', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];
      const newMember: Partial<PartyMember> = {
        characterName: 'Sam',
      };

      // When editingMemberId doesn't match any existing member, still attempts to map
      // but only replaces if ID matches - in this case, creates new member without ID match
      const result = updateOrAddMember(members, newMember, 'non-existent-id');

      // Since 'non-existent-id' doesn't match 'member-1', the map won't replace it
      // It will just return the unchanged member list
      expect(result).toHaveLength(1);
      expect(result[0].characterName).toBe('Frodo');
    });

    it('should generate new ID for added members', () => {
      const members: PartyMember[] = [];
      const newMember: Partial<PartyMember> = {
        characterName: 'Gandalf',
      };

      const result = updateOrAddMember(members, newMember, null);

      expect(result[0].id).toBeDefined();
      expect(result[0].id).not.toBe('');
    });
  });

  describe('removeMember', () => {
    it('should remove member by ID', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
        createFullMember({ id: 'member-2', characterName: 'Sam' }),
      ];

      const result = removeMember(members, 'member-1');

      expect(result).toHaveLength(1);
      expect(result[0].characterName).toBe('Sam');
    });

    it('should return all members if ID not found', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
        createFullMember({ id: 'member-2', characterName: 'Sam' }),
      ];

      const result = removeMember(members, 'non-existent');

      expect(result).toHaveLength(2);
    });

    it('should remove only matching member when multiple exist', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
        createFullMember({ id: 'member-2', characterName: 'Sam' }),
        createFullMember({ id: 'member-3', characterName: 'Merry' }),
      ];

      const result = removeMember(members, 'member-2');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('member-1');
      expect(result[1].id).toBe('member-3');
    });

    it('should handle empty members list', () => {
      const members: PartyMember[] = [];

      const result = removeMember(members, 'any-id');

      expect(result).toHaveLength(0);
    });

    it('should handle removing from single-member list', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];

      const result = removeMember(members, 'member-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('findMemberById', () => {
    it('should find member by ID', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
        createFullMember({ id: 'member-2', characterName: 'Sam' }),
      ];

      const result = findMemberById(members, 'member-1');

      expect(result).toBeDefined();
      expect(result?.characterName).toBe('Frodo');
    });

    it('should return undefined if member not found', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];

      const result = findMemberById(members, 'non-existent');

      expect(result).toBeUndefined();
    });

    it('should return undefined for null memberId', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];

      const result = findMemberById(members, null);

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string memberId', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'Frodo' }),
      ];

      const result = findMemberById(members, '');

      expect(result).toBeUndefined();
    });

    it('should find correct member in large list', () => {
      const members: PartyMember[] = Array.from({ length: 10 }, (_, i) =>
        createFullMember({
          id: `member-${i}`,
          characterName: `Character ${i}`,
        })
      );

      const result = findMemberById(members, 'member-7');

      expect(result).toBeDefined();
      expect(result?.characterName).toBe('Character 7');
    });

    it('should find first matching member', () => {
      const members: PartyMember[] = [
        createFullMember({ id: 'member-1', characterName: 'First' }),
        createFullMember({ id: 'member-2', characterName: 'Second' }),
      ];

      const result = findMemberById(members, 'member-1');

      expect(result?.characterName).toBe('First');
    });
  });
});
