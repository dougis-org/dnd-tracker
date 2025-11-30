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
  // Test data builders
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

  const roles = [
    { name: 'Tank', class: 'Fighter', colorKey: 'blue', bgColor: '#2563eb' },
    { name: 'Healer', class: 'Cleric', colorKey: 'green', bgColor: '#16a34a' },
    { name: 'DPS', class: 'Rogue', colorKey: 'red', bgColor: '#dc2626' },
    { name: 'Support', class: 'Bard', colorKey: 'purple', bgColor: '#7c3aed' },
  ] as const;

  it('counts party composition by role', () => {
    const members = roles.map((role, i) =>
      createPartyMember({
        id: String(i + 1),
        characterName: role.name,
        class: role.class,
        role: role.name,
        position: i,
      })
    );
    const party = createParty(members);
    const comp = getPartyComposition(party);
    expect(comp.tanks).toBe(1);
    expect(comp.healers).toBe(1);
    expect(comp.dps).toBe(1);
    expect(comp.support).toBe(1);
    expect(comp.unassigned).toBe(0);
  });

  it('counts unassigned members and handles empty party', () => {
    const partyWithUnassigned = createParty([
      createPartyMember({ id: '1', role: 'Tank' }),
      createPartyMember({ id: '2', role: undefined }),
    ]);
    expect(getPartyComposition(partyWithUnassigned).unassigned).toBe(1);

    const emptyParty = createParty([]);
    const emptyComp = getPartyComposition(emptyParty);
    expect(emptyComp.tanks).toBe(0);
    expect(emptyComp.unassigned).toBe(0);
  });

  it('calculates average level correctly', () => {
    const levelTests = [
      { levels: [5, 7, 6], expected: 6 },
      { levels: [5, 6], expected: 6 },
      { levels: [], expected: 0 },
    ];

    levelTests.forEach(({ levels, expected }) => {
      const members = levels.map((level, i) =>
        createPartyMember({ id: String(i + 1), level })
      );
      const party = createParty(members);
      expect(getAverageLevel(party)).toBe(expected);
    });
  });

  it('returns formatted level range', () => {
    const party = createParty([
      createPartyMember({ id: '1', level: 3 }),
      createPartyMember({ id: '2', level: 9 }),
    ]);
    const range = getLevelRange(party);
    expect(range).toContain('3');
    expect(range).toContain('9');

    expect(getLevelRange(createParty([]))).toBe('N/A');
  });

  it('determines party tier by average level', () => {
    const tierTests = [
      { levels: [3, 4], expected: 'Beginner' },
      { levels: [5, 10], expected: 'Intermediate' },
      { levels: [11, 16], expected: 'Advanced' },
      { levels: [17, 20], expected: 'Expert' },
    ];

    tierTests.forEach(({ levels, expected }) => {
      const members = levels.map((level, i) =>
        createPartyMember({ id: String(i + 1), level })
      );
      expect(getPartyTier(createParty(members))).toBe(expected);
    });

    expect(getPartyTier(createParty([]))).toBe('Beginner');
  });

  it('returns correct member counts', () => {
    expect(getPartyMemberCount(createParty([]))).toBe(0);
    expect(getPartyMemberCount(createParty([createPartyMember()]))).toBe(1);
    expect(
      getPartyMemberCount(
        createParty([
          createPartyMember({ id: '1' }),
          createPartyMember({ id: '2' }),
          createPartyMember({ id: '3' }),
        ])
      )
    ).toBe(3);
  });

  it('sorts members by position without modifying original', () => {
    const members = [
      createPartyMember({ id: '1', position: 2 }),
      createPartyMember({ id: '2', position: 0 }),
      createPartyMember({ id: '3', position: 1 }),
    ];
    const sorted = sortMembersByPosition(members);
    expect(sorted.map((m) => m.id)).toEqual(['2', '3', '1']);
    expect(members[0].position).toBe(2); // Original unchanged
  });

  it('assigns role colors correctly', () => {
    roles.forEach((role) => {
      expect(getRoleColor(role.name)).toContain(role.colorKey);
    });
    expect(getRoleColor(undefined)).toContain('gray');
    expect(getRoleColor('Unknown')).toContain('gray');
  });

  it('assigns role background colors correctly', () => {
    roles.forEach((role) => {
      expect(getRoleBgColor(role.name)).toBe(role.bgColor);
    });
    expect(getRoleBgColor(undefined)).toBe('#6b7280');
    expect(getRoleBgColor('Unknown')).toBe('#6b7280');
  });
});
