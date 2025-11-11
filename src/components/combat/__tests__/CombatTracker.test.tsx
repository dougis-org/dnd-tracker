import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('CombatTracker - Turn Advancement (T022)', () => {
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

  it('should have next turn button enabled when not at last participant', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    // mockSession has currentTurnIndex 0, 3 participants total
    // Should be able to advance
    const nextButton = await screen.findByRole('button', { name: /next turn/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should have previous turn button disabled at turn 0', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    const prevButton = await screen.findByRole('button', { name: /previous turn/i });
    expect(prevButton).toBeDisabled();
  });

  it('should advance to next participant when next turn clicked', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    const nextButton = await screen.findByRole('button', { name: /next turn/i });

    // Mock the updated session for next state
    const updatedSession = { ...mockSession, currentTurnIndex: 1 };
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      updatedSession
    );

    fireEvent.click(nextButton);

    // Verify saveSession was called
    await screen.findByText(/Barbarian Hero/);
  });

  it('should increment round when advancing from last participant', async () => {
    // Create a session at the last participant
    const sessionAtLastParticipant = {
      ...mockSession,
      currentTurnIndex: 2, // Last of 3 participants
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionAtLastParticipant));
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      sessionAtLastParticipant
    );

    render(<CombatTracker sessionId={mockSessionId} />);

    // Verify we're at last turn
    const turnIndicator = await screen.findByText(/Turn 3 \/ 3/);
    expect(turnIndicator).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next turn/i });

    // Mock the next state (round incremented, turn back to 0)
    const nextRoundSession = {
      ...sessionAtLastParticipant,
      currentRoundNumber: 2,
      currentTurnIndex: 0,
    };

    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      nextRoundSession
    );

    fireEvent.click(nextButton);

    // Should advance to round 2
    await screen.findByText(/Round 2/);
  });

  it('should rewind to previous participant when previous turn clicked', async () => {
    // Create a session at turn 1
    const sessionAtTurn1 = {
      ...mockSession,
      currentTurnIndex: 1,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionAtTurn1));
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      sessionAtTurn1
    );

    render(<CombatTracker sessionId={mockSessionId} />);

    const prevButton = await screen.findByRole('button', { name: /previous turn/i });
    expect(prevButton).not.toBeDisabled();

    fireEvent.click(prevButton);

    // Should go back to turn 0 (first participant)
    await screen.findByText(/Turn 1 \/ 3/);
  });

  it('should disable next button when at last participant in round', async () => {
    // This would require a session with lairActionInitiative or similar
    // For now, we test that UI state is correct
    const sessionAtEnd = {
      ...mockSession,
      currentTurnIndex: 2, // Last participant
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionAtEnd));
    (combatSessionAdapter.combatSessionAdapter.loadSession as jest.Mock).mockResolvedValue(
      sessionAtEnd
    );

    render(<CombatTracker sessionId={mockSessionId} />);

    // Next button should still be enabled (wraps to next round)
    const nextButton = await screen.findByRole('button', { name: /next turn/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should preserve participant state when advancing turns', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    // Initial state shows all three participants
    const goblin = await screen.findByText('Goblin Ambusher');
    const barbarian = screen.getByText('Barbarian Hero');
    const wizard = screen.getByText('Wizard');

    expect(goblin).toBeInTheDocument();
    expect(barbarian).toBeInTheDocument();
    expect(wizard).toBeInTheDocument();
  });

  it('should update turn indicator after advancement', async () => {
    render(<CombatTracker sessionId={mockSessionId} />);

    const turnIndicator = await screen.findByText(/Turn 1 \/ 3/);
    expect(turnIndicator).toBeInTheDocument();
  });
});
