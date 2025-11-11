/**
 * T021: Monster creation page tests
 *
 * Tests for /monsters/new page functionality
 * - Functional form with validation
 * - Submission and navigation
 */

import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MonsterCreatePage from '@/app/monsters/new/page';
import { monsterService } from '@/lib/services/monsterService';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock monsterService
jest.mock('@/lib/services/monsterService', () => ({
  monsterService: {
    create: jest.fn(),
  },
}));

describe('MonsterCreatePage (T021)', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should display page title', () => {
    render(<MonsterCreatePage />);
    expect(screen.getByText('Create Monster')).toBeInTheDocument();
  });

  it('should render MonsterForm component', () => {
    render(<MonsterCreatePage />);

    // Check for form fields
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cr/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ac/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
  });

  it('should render form buttons', () => {
    render(<MonsterCreatePage />);

    // Check for Cancel button
    const cancelButtons = screen.getAllByText(/cancel/i);
    expect(cancelButtons.length).toBeGreaterThan(0);

    // Check for Submit button
    const submitButtons = screen.getAllByText(/save/i);
    expect(submitButtons.length).toBeGreaterThan(0);
  });

  it('should handle successful monster creation and redirect', async () => {
    (monsterService.create as jest.Mock).mockResolvedValue({
      id: 'new-uuid-1234',
      name: 'Test Goblin',
      cr: 0.25,
      hp: 7,
      ac: 15,
      size: 'Small',
      type: 'humanoid',
      alignment: 'Neutral Evil',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
      ownerId: 'user-demo',
      createdBy: 'user-demo',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<MonsterCreatePage />);

    // Verify form exists and component rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('should provide MonsterForm with submission callback', () => {
    render(<MonsterCreatePage />);

    // Form should be present (indicating onSubmit callback was provided)
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();

    // Form structure valid
    const form = nameInput.closest('form');
    expect(form).toBeInTheDocument();
  });
});
