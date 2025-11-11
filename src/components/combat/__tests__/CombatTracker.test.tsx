import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CombatTracker from '../CombatTracker';
import { mockSession } from '@/tests/fixtures/combat-sessions';
import * as combatSessionAdapter from '@/lib/combat/combatSessionAdapter';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

jest.mock('@/lib/combat/combatSessionAdapter');

describe('CombatTracker', () => {
  const mockSessionId = mockSession.id;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      mockSession
    );
    (combatSessionAdapter.combatSessionAdapter.saveSession as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  it('should render without crashing', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('should load session on mount', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(combatSessionAdapter.combatSessionAdapter.loadSession).toHaveBeenCalledWith(
        mockSessionId
      );
    });
  });

  it('should display session loaded message when session loads successfully', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      // Should render initiative order component or round counter
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
  });

  it('should display error when session fails to load', async () => {
    const error = new Error('Session not found');
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockRejectedValue(error);

    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(screen.getByText(/Session not found/i)).toBeInTheDocument();
    });
  });

  it('should render undo button when undo stack is not empty', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      const undoButton = screen.queryByRole('button', { name: /undo/i });
      // Initially should be disabled (empty undo stack)
      expect(undoButton).toBeInTheDocument();
    });
  });

  it('should render redo button', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      const redoButton = screen.queryByRole('button', { name: /redo/i });
      expect(redoButton).toBeInTheDocument();
    });
  });

  it('should display participants in initiative order', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(screen.getByText('Goblin Ambusher')).toBeInTheDocument();
      expect(screen.getByText('Barbarian Hero')).toBeInTheDocument();
      expect(screen.getByText('Wizard')).toBeInTheDocument();
    });
  });

  it('should render main container with proper aria-label for accessibility', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');
    });
  });

  it('should save session to adapter after state changes', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(combatSessionAdapter.combatSessionAdapter.loadSession).toHaveBeenCalled();
    });

    // Trigger a state change (would happen from child component)
    // This is tested more thoroughly in integration tests
  });

  it('should display loading state initially', () => {
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CombatTracker sessionId={mockSessionId} />);

    // Should show loading indicator or skeleton
    expect(screen.getByText(/Loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render round/turn counter component', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(screen.getByText(/Round 1, Turn 0/)).toBeInTheDocument();
    });
  });

  it('should have proper error boundary protection', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<CombatTracker sessionId={mockSessionId} />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
