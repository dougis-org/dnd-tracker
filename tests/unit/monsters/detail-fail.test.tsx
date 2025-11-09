/**
 * T015: Failing tests for monster detail page rendering
 * Red phase - these tests will validate the detail view
 *
 * Spec: specs/007-monster-management/spec.md
 * User Story: US1 - Add and reuse monsters in combat
 */

import { render, screen, waitFor } from '@testing-library/react';
import MonsterDetailPage from '@/app/monsters/[id]/page';
import { monsterService } from '@/lib/services/monsterService';
import type { Monster } from '@/types/monster';

jest.mock('@/lib/services/monsterService');
jest.mock('next/navigation');

const mockMonsterService = monsterService as jest.Mocked<typeof monsterService>;

const createMockMonster = (overrides: Partial<Monster> = {}): Monster => ({
  id: 'goblin-1',
  name: 'Goblin',
  cr: 0.25,
  size: 'Small',
  type: 'humanoid',
  alignment: 'Chaotic Evil',
  hp: 7,
  ac: 15,
  speed: '30 ft.',
  abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  savingThrows: {},
  skills: { stealth: 4 },
  resistances: [],
  immunities: [],
  conditionImmunities: [],
  senses: ['darkvision 60 ft.'],
  languages: ['Goblin'],
  tags: ['humanoid'],
  actions: [
    {
      id: 'scimitar',
      name: 'Scimitar',
      description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 2) slashing damage.',
      attackBonus: 4,
      damage: '1d6 + 2',
    },
  ],
  ownerId: 'system',
  createdBy: 'system',
  scope: 'global',
  isPublic: true,
  createdAt: '2025-11-08T00:00:00Z',
  updatedAt: '2025-11-08T00:00:00Z',
  ...overrides,
});

describe('Monster Detail Page (T015)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock useParams
    const { useParams } = require('next/navigation');
    useParams.mockReturnValue({ id: 'goblin-1' });
  });

  it('should display the monster name as a heading', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Goblin' })).toBeInTheDocument();
    });
  });

  it('should display basic monster statistics (CR, HP, AC)', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    // Stats are split across elements with formatting, check for the values
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // AC
    });
    expect(screen.getByText('7')).toBeInTheDocument(); // HP
    expect(screen.getByText(/0\.25/)).toBeInTheDocument(); // CR
  });

  it('should display ability scores', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/str/i)).toBeInTheDocument();
      expect(screen.getByText(/dex/i)).toBeInTheDocument();
      expect(screen.getByText(/con/i)).toBeInTheDocument();
    });
  });

  it('should display size and type', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Small/)).toBeInTheDocument();
      expect(screen.getByText(/humanoid/)).toBeInTheDocument();
    });
  });

  it('should display senses and languages', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    // Senses and languages are in the component
    await waitFor(() => {
      expect(screen.getByText('darkvision 60 ft.')).toBeInTheDocument();
    });
    // Check for languages section with Goblin
    expect(screen.getByText(/Languages:/)).toBeInTheDocument();
  });

  it('should display actions section', async () => {
    const mockMonster = createMockMonster({
      actions: [
        {
          id: 'scimitar',
          name: 'Scimitar',
          description: 'Melee Weapon Attack: +4 to hit',
          attackBonus: 4,
          damage: '1d6 + 2',
        },
      ],
    });
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Actions/)).toBeInTheDocument();
      expect(screen.getByText(/Scimitar/)).toBeInTheDocument();
    });
  });

  it('should show Edit and Delete buttons', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
    });
  });

  it('should show a "Back to Monsters" link', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Back to Monsters/)).toBeInTheDocument();
    });
  });

  it('should show a loading state initially', () => {
    (mockMonsterService.getById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<MonsterDetailPage />);

    expect(screen.getByText(/Loading monster/i)).toBeInTheDocument();
  });

  it('should display an error when monster not found', async () => {
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(null);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Monster not found/)).toBeInTheDocument();
    });
  });

  it('should call monsterService.getById with the monster ID from params', async () => {
    const mockMonster = createMockMonster();
    (mockMonsterService.getById as jest.Mock).mockResolvedValue(mockMonster);

    render(<MonsterDetailPage />);

    await waitFor(() => {
      expect(mockMonsterService.getById).toHaveBeenCalledWith('goblin-1');
    });
  });
});
