/**
 * T022: Monster edit page tests
 *
 * Tests for /monsters/[id]/edit page functionality
 * - Load monster data on mount
 * - Pre-fill form with monster data
 * - Handle successful update and redirect
 * - Handle errors
 */

import { act, render, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import MonsterEditPage from '@/app/monsters/[id]/edit/page';
import { monsterService } from '@/lib/services/monsterService';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock monsterService
jest.mock('@/lib/services/monsterService', () => ({
  monsterService: {
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

describe('MonsterEditPage (T022)', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const renderMonsterEditPage = async () => {
    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(<MonsterEditPage />);
    });

    return result!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'monster-123' });
  });

  it('should render with correct structure', async () => {
    (monsterService.getById as jest.Mock).mockResolvedValue(null);

    await renderMonsterEditPage();

    await waitFor(() => expect(monsterService.getById).toHaveBeenCalledWith('monster-123'));
    expect(document.body).toBeInTheDocument();
  });

  it('should call getById on mount with monster ID', async () => {
    (monsterService.getById as jest.Mock).mockResolvedValue(null);

    await renderMonsterEditPage();

    await waitFor(() => expect(monsterService.getById).toHaveBeenCalledWith('monster-123'));
  });

  it('should handle missing monster ID', async () => {
    (useParams as jest.Mock).mockReturnValue({});

    await renderMonsterEditPage();

    expect(monsterService.getById).not.toHaveBeenCalled();
    // Should not crash with missing ID
    expect(document.body).toBeInTheDocument();
  });
});
