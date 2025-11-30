import {
  createFullMember,
  updateOrAddMember,
  removeMember,
  findMemberById,
} from '../../../src/lib/utils/partyMemberHelpers';
import { PartyMember } from '../../../src/types/party';

describe('partyMemberHelpers', () => {
  const createMemberData = (
    overrides: Partial<PartyMember> = {}
  ): Partial<PartyMember> => ({
    characterName: 'Test Member',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 50,
    position: 0,
    ...overrides,
  });

  describe('createFullMember', () => {
    it('should generate an ID if not provided', () => {
      const memberData = createMemberData({ id: undefined });
      const member = createFullMember(memberData);

      expect(member.id).toBeDefined();
      expect(typeof member.id).toBe('string');
      expect(member.id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs for multiple calls', () => {
      const memberData1 = createMemberData({ id: undefined });
      const memberData2 = createMemberData({ id: undefined });
      const member1 = createFullMember(memberData1);
      const member2 = createFullMember(memberData2);

      expect(member1.id).not.toBe(member2.id);
    });

    it('should handle null ID explicitly', () => {
      const memberData = createMemberData({ id: null as unknown as string });
      const member = createFullMember(memberData);

      expect(member.id).toBeDefined();
      expect(typeof member.id).toBe('string');
    });

    it('should use provided ID if given', () => {
      const memberData = createMemberData({ id: 'custom-id-123' });
      const member = createFullMember(memberData);

      expect(member.id).toBe('custom-id-123');
    });

    it('should create complete member with all fields', () => {
      const memberData = createMemberData({
        id: 'member-1',
        characterName: 'Aragorn',
        class: 'Ranger',
        race: 'Human',
        level: 10,
        ac: 16,
        hp: 60,
        role: 'DPS',
        position: 2,
      });

      const member = createFullMember(memberData);

      expect(member.id).toBe('member-1');
      expect(member.characterName).toBe('Aragorn');
      expect(member.class).toBe('Ranger');
      expect(member.race).toBe('Human');
      expect(member.level).toBe(10);
      expect(member.ac).toBe(16);
      expect(member.hp).toBe(60);
      expect(member.role).toBe('DPS');
      expect(member.position).toBe(2);
    });

    it('should use default partyId', () => {
      const memberData = createMemberData();
      const member = createFullMember(memberData);

      expect(member.partyId).toBe('');
    });

    it('should use defaults for missing fields', () => {
      const memberData: Partial<PartyMember> = {
        id: 'member-1',
        characterName: 'Test',
      };

      const member = createFullMember(memberData);

      expect(member.id).toBe('member-1');
      expect(member.characterName).toBe('Test');
      expect(member.class).toBe('Fighter');
      expect(member.race).toBe('Human');
      expect(member.level).toBe(1);
      expect(member.ac).toBe(10);
      expect(member.hp).toBe(10);
      expect(member.role).toBeUndefined();
      expect(member.position).toBe(0);
    });

    it('should handle empty object input', () => {
      const member = createFullMember({});

      expect(member.id).toBeDefined();
      expect(member.characterName).toBe('');
      expect(member.class).toBe('Fighter');
      expect(member.race).toBe('Human');
      expect(member.level).toBe(1);
      expect(member.ac).toBe(10);
      expect(member.hp).toBe(10);
      expect(member.position).toBe(0);
    });
  });

  describe('updateOrAddMember', () => {
    const member1 = createFullMember(
      createMemberData({ id: 'member-1', characterName: 'Frodo' })
    );
    const member2 = createFullMember(
      createMemberData({ id: 'member-2', characterName: 'Sam' })
    );
    const member3 = createFullMember(
      createMemberData({ id: 'member-3', characterName: 'Merry' })
    );

    it('should add a new member when no editing ID provided', () => {
      const members = [member1, member2];
      const newMemberData = createMemberData({ characterName: 'Pippin' });

      const updated = updateOrAddMember(members, newMemberData, null);

      expect(updated).toHaveLength(3);
      expect(updated[2].characterName).toBe('Pippin');
      expect(updated[0]).toEqual(member1);
      expect(updated[1]).toEqual(member2);
    });

    it('should update existing member when editing ID provided', () => {
      const members = [member1, member2, member3];
      const updatedData = createMemberData({
        id: 'member-2',
        characterName: 'Sam Updated',
        level: 8,
      });

      const updated = updateOrAddMember(members, updatedData, 'member-2');

      expect(updated).toHaveLength(3);
      expect(updated[1].characterName).toBe('Sam Updated');
      expect(updated[1].level).toBe(8);
      expect(updated[0].characterName).toBe('Frodo');
      expect(updated[2].characterName).toBe('Merry');
    });

    it('should preserve other members when updating', () => {
      const members = [member1, member2, member3];
      const updatedData = createMemberData({
        id: 'member-1',
        characterName: 'Frodo Jr.',
      });

      const updated = updateOrAddMember(members, updatedData, 'member-1');

      expect(updated[0].characterName).toBe('Frodo Jr.');
      expect(updated[1]).toEqual(member2);
      expect(updated[2]).toEqual(member3);
    });

    it('should add to empty member list', () => {
      const members: PartyMember[] = [];
      const newMemberData = createMemberData({ characterName: 'New Member' });

      const updated = updateOrAddMember(members, newMemberData, null);

      expect(updated).toHaveLength(1);
      expect(updated[0].characterName).toBe('New Member');
    });

    it('should not modify original members array on add', () => {
      const members = [member1, member2];
      const newMemberData = createMemberData({ characterName: 'Pippin' });

      const updated = updateOrAddMember(members, newMemberData, null);

      expect(members).toHaveLength(2);
      expect(updated).toHaveLength(3);
    });

    it('should not modify original members array on update', () => {
      const members = [member1, member2];
      const updatedData = createMemberData({
        id: 'member-1',
        characterName: 'Modified',
      });

      const updated = updateOrAddMember(members, updatedData, 'member-1');

      expect(members[0].characterName).toBe('Frodo');
      expect(updated[0].characterName).toBe('Modified');
    });
  });

  describe('removeMember', () => {
    const member1 = createFullMember(
      createMemberData({ id: 'member-1', characterName: 'Frodo' })
    );
    const member2 = createFullMember(
      createMemberData({ id: 'member-2', characterName: 'Sam' })
    );
    const member3 = createFullMember(
      createMemberData({ id: 'member-3', characterName: 'Merry' })
    );

    it('should remove member by ID', () => {
      const members = [member1, member2, member3];

      const updated = removeMember(members, 'member-2');

      expect(updated).toHaveLength(2);
      expect(updated[0].characterName).toBe('Frodo');
      expect(updated[1].characterName).toBe('Merry');
    });

    it('should remove first member', () => {
      const members = [member1, member2, member3];

      const updated = removeMember(members, 'member-1');

      expect(updated).toHaveLength(2);
      expect(updated[0].characterName).toBe('Sam');
      expect(updated[1].characterName).toBe('Merry');
    });

    it('should remove last member', () => {
      const members = [member1, member2, member3];

      const updated = removeMember(members, 'member-3');

      expect(updated).toHaveLength(2);
      expect(updated[0].characterName).toBe('Frodo');
      expect(updated[1].characterName).toBe('Sam');
    });

    it('should return empty array when removing from single member list', () => {
      const members = [member1];

      const updated = removeMember(members, 'member-1');

      expect(updated).toHaveLength(0);
    });

    it('should not remove if ID not found', () => {
      const members = [member1, member2, member3];

      const updated = removeMember(members, 'nonexistent-id');

      expect(updated).toHaveLength(3);
      expect(updated).toEqual(members);
    });

    it('should not modify original array', () => {
      const members = [member1, member2, member3];

      const updated = removeMember(members, 'member-2');

      expect(members).toHaveLength(3);
      expect(updated).toHaveLength(2);
    });
  });

  describe('findMemberById', () => {
    const member1 = createFullMember(
      createMemberData({ id: 'member-1', characterName: 'Frodo' })
    );
    const member2 = createFullMember(
      createMemberData({ id: 'member-2', characterName: 'Sam' })
    );
    const member3 = createFullMember(
      createMemberData({ id: 'member-3', characterName: 'Merry' })
    );

    it('should find member by ID', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, 'member-2');

      expect(found).toEqual(member2);
      expect(found?.characterName).toBe('Sam');
    });

    it('should find first member', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, 'member-1');

      expect(found).toEqual(member1);
    });

    it('should find last member', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, 'member-3');

      expect(found).toEqual(member3);
    });

    it('should return undefined if member not found', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, 'nonexistent-id');

      expect(found).toBeUndefined();
    });

    it('should return undefined if ID is null', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, null);

      expect(found).toBeUndefined();
    });

    it('should return undefined if ID is empty string', () => {
      const members = [member1, member2, member3];

      const found = findMemberById(members, '');

      expect(found).toBeUndefined();
    });

    it('should handle empty members array', () => {
      const members: PartyMember[] = [];

      const found = findMemberById(members, 'member-1');

      expect(found).toBeUndefined();
    });
  });
});
