import {
  createFullMember,
  updateOrAddMember,
  removeMember,
  findMemberById,
} from '../../../src/lib/utils/partyMemberHelpers';
import { PartyMember } from '../../../src/types/party';

describe('partyMemberHelpers', () => {
  const createMemberData = (overrides: Partial<PartyMember> = {}): Partial<PartyMember> => ({
    characterName: 'Test Member',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 50,
    position: 0,
    ...overrides,
  });

  const member1 = createFullMember(createMemberData({ id: 'member-1', characterName: 'Frodo' }));
  const member2 = createFullMember(createMemberData({ id: 'member-2', characterName: 'Sam' }));
  const member3 = createFullMember(createMemberData({ id: 'member-3', characterName: 'Merry' }));

  describe('createFullMember', () => {
    const idTests = [
      { input: undefined, desc: 'generates ID if undefined' },
      { input: null, desc: 'generates ID if null' },
      { input: 'custom-id-123', desc: 'uses provided ID' },
    ];

    idTests.forEach(({ input, desc }) => {
      it(desc, () => {
        const memberData = createMemberData({ id: input as any });
        const member = createFullMember(memberData);
        if (input) expect(member.id).toBe(input);
        else expect(member.id).toBeDefined();
      });
    });

    it('generates unique IDs for multiple calls', () => {
      const m1 = createFullMember(createMemberData({ id: undefined }));
      const m2 = createFullMember(createMemberData({ id: undefined }));
      expect(m1.id).not.toBe(m2.id);
    });

    it('creates complete member with all fields', () => {
      const data = createMemberData({
        id: 'member-1',
        characterName: 'Aragorn',
        class: 'Ranger',
        level: 10,
        ac: 16,
        hp: 60,
        role: 'DPS',
        position: 2,
      });
      const member = createFullMember(data);
      expect(member.characterName).toBe('Aragorn');
      expect(member.level).toBe(10);
      expect(member.hp).toBe(60);
      expect(member.role).toBe('DPS');
    });

    it('handles empty object with defaults', () => {
      const member = createFullMember({});
      expect(member.id).toBeDefined();
      expect(member.characterName).toBe('');
      expect(member.class).toBe('Fighter');
      expect(member.level).toBe(1);
      expect(member.ac).toBe(10);
      expect(member.hp).toBe(10);
    });

    it('uses default partyId and defaults for missing fields', () => {
      const member = createFullMember({ id: 'test', characterName: 'Test' });
      expect(member.partyId).toBe('');
      expect(member.class).toBe('Fighter');
      expect(member.role).toBeUndefined();
      expect(member.position).toBe(0);
    });
  });

  describe('updateOrAddMember', () => {
    it('adds new member when no editing ID provided', () => {
      const members = [member1, member2];
      const newData = createMemberData({ characterName: 'Pippin' });
      const updated = updateOrAddMember(members, newData, null);
      expect(updated).toHaveLength(3);
      expect(updated[2].characterName).toBe('Pippin');
      expect(updated[0]).toEqual(member1);
    });

    it('updates existing member when editing ID provided', () => {
      const members = [member1, member2, member3];
      const updated = updateOrAddMember(
        members,
        createMemberData({ id: 'member-2', characterName: 'Sam Updated', level: 8 }),
        'member-2'
      );
      expect(updated).toHaveLength(3);
      expect(updated[1].characterName).toBe('Sam Updated');
      expect(updated[1].level).toBe(8);
      expect(updated[0]).toEqual(member1);
    });

    const operationTests = [
      { members: [], desc: 'adds to empty list', expectLen: 1 },
      { members: [member1, member2], desc: 'adds new member to existing list', expectLen: 3 },
    ];

    operationTests.forEach(({ members, desc, expectLen }) => {
      it(desc, () => {
        const newData = createMemberData({ characterName: 'New' });
        const result = updateOrAddMember(members, newData, null);
        expect(result).toHaveLength(expectLen);
        expect(members).toHaveLength(expectLen - 1); // original unchanged
      });
    });

    it('preserves immutability on update', () => {
      const members = [member1, member2];
      const updated = updateOrAddMember(
        members,
        createMemberData({ id: 'member-1', characterName: 'Modified' }),
        'member-1'
      );
      expect(members[0].characterName).toBe('Frodo');
      expect(updated[0].characterName).toBe('Modified');
    });
  });

  describe('removeMember', () => {
    const removeTests = [
      { id: 'member-1', desc: 'removes first member' },
      { id: 'member-2', desc: 'removes middle member' },
      { id: 'member-3', desc: 'removes last member' },
    ];

    removeTests.forEach(({ id, desc }) => {
      it(desc, () => {
        const members = [member1, member2, member3];
        const updated = removeMember(members, id);
        expect(updated).toHaveLength(2);
        expect(updated.find((m) => m.id === id)).toBeUndefined();
      });
    });

    it('returns empty array when removing from single member list', () => {
      expect(removeMember([member1], 'member-1')).toHaveLength(0);
    });

    it('does not remove if ID not found', () => {
      const members = [member1, member2, member3];
      const updated = removeMember(members, 'nonexistent');
      expect(updated).toHaveLength(3);
      expect(updated).toEqual(members);
    });

    it('preserves immutability', () => {
      const members = [member1, member2, member3];
      const updated = removeMember(members, 'member-2');
      expect(members).toHaveLength(3);
      expect(updated).toHaveLength(2);
    });
  });

  describe('findMemberById', () => {
    it('finds member by ID', () => {
      const members = [member1, member2, member3];
      expect(findMemberById(members, 'member-2')).toEqual(member2);
    });

    const findTests = [
      { id: 'member-1', desc: 'finds first member' },
      { id: 'member-3', desc: 'finds last member' },
    ];

    findTests.forEach(({ id, desc }) => {
      it(desc, () => {
        const members = [member1, member2, member3];
        expect(findMemberById(members, id)).toBeDefined();
      });
    });

    const notFoundTests = [
      { id: 'nonexistent-id', desc: 'returns undefined if member not found' },
      { id: null, desc: 'returns undefined if ID is null' },
      { id: '', desc: 'returns undefined if ID is empty string' },
    ];

    notFoundTests.forEach(({ id, desc }) => {
      it(desc, () => {
        const members = [member1, member2, member3];
        expect(findMemberById(members, id as any)).toBeUndefined();
      });
    });

    it('handles empty members array', () => {
      expect(findMemberById([], 'member-1')).toBeUndefined();
    });
  });
});
