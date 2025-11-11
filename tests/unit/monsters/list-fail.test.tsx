/**
 * T013: Failing tests for monster list UI
 * Red phase - these tests are expected to fail initially
 * Green phase will implement the UI to pass them
 *
 * Spec: specs/007-monster-management/spec.md
 * User Story: US1 - Add and reuse monsters in combat
 */

import { render, screen, waitFor } from '@testing-library/react';
import MonstersPage from '@/app/monsters/page';
import { monsterService } from '@/lib/services/monsterService';
import type { Monster } from '@/types/monster';

// Mock the service
jest.mock('@/lib/services/monsterService');

const mockMonsterService = monsterService as jest.Mocked<typeof monsterService>;

const createMockMonster = (overrides: Partial<Monster> = {}): Monster => ({
  id: 'test-1',
  name: 'Test Monster',
  cr: 1,
  size: 'Medium',
  type: 'humanoid',
  hp: 20,
  ac: 12,
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  ownerId: 'system',
  createdBy: 'system',
  scope: 'global',
  isPublic: true,
  createdAt: '2025-11-08T00:00:00Z',
  updatedAt: '2025-11-08T00:00:00Z',
  ...overrides,
});

describe('Monsters List UI (T013)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the monsters page title', async () => {
    (mockMonsterService.list as jest.Mock).mockResolvedValue([]);

    render(<MonstersPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Monsters/i })).toBeInTheDocument();
    });
  });

  it('should display a list of monsters', async () => {
    const mockMonsters: Monster[] = [
      createMockMonster({
        id: 'goblin-1',
        name: 'Goblin',
        cr: 0.25,
        size: 'Small',
        hp: 7,
        ac: 15,
      }),
      createMockMonster({
        id: 'orc-1',
        name: 'Orc',
        cr: 0.5,
        size: 'Medium',
        hp: 15,
        ac: 12,
      }),
    ];

    (mockMonsterService.list as jest.Mock).mockResolvedValue(mockMonsters);

    render(<MonstersPage />);

    await waitFor(() => {
      expect(screen.getByText('Goblin')).toBeInTheDocument();
      expect(screen.getByText('Orc')).toBeInTheDocument();
    });
  });

  it('should display monster CR, HP, and AC on each card', async () => {
    const mockMonsters: Monster[] = [
      createMockMonster({
        id: 'goblin-1',
        name: 'Goblin',
        cr: 0.25,
        size: 'Small',
        hp: 7,
        ac: 15,
      }),
    ];

    (mockMonsterService.list as jest.Mock).mockResolvedValue(mockMonsters);

    render(<MonstersPage />);

    await waitFor(() => {
      expect(screen.getByText(/CR 0.25/)).toBeInTheDocument();
      expect(screen.getByText(/7 HP/)).toBeInTheDocument();
      expect(screen.getByText(/AC 15/)).toBeInTheDocument();
    });
  });

  it('should show a loading state initially', () => {
    (mockMonsterService.list as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<MonstersPage />);

    expect(screen.getByText(/Loading monsters/i)).toBeInTheDocument();
  });

  it('should display an error message if loading fails', async () => {
    (mockMonsterService.list as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(<MonstersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });

  it('should show an "Add Monster" button linking to /monsters/new', async () => {
    (mockMonsterService.list as jest.Mock).mockResolvedValue([]);

    render(<MonstersPage />);

    await waitFor(() => {
      const addButton = screen.getByRole('link', { name: /Add Monster/ });
      expect(addButton).toHaveAttribute('href', '/monsters/new');
    });
  });

  it('should display empty state message when no monsters exist', async () => {
    (mockMonsterService.list as jest.Mock).mockResolvedValue([]);

    render(<MonstersPage />);

    await waitFor(() => {
      expect(screen.getByText(/No monsters found/)).toBeInTheDocument();
    });
  });

  it('should call monsterService.list on mount', async () => {
    (mockMonsterService.list as jest.Mock).mockResolvedValue([]);

    render(<MonstersPage />);

    await waitFor(() => {
      expect(mockMonsterService.list).toHaveBeenCalled();
    });
  });
});
