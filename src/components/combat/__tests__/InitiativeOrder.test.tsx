import React from 'react';
import { render, screen } from '@testing-library/react';
import InitiativeOrder from '../InitiativeOrder';
import { mockSession } from '@/tests/fixtures/combat-sessions';
import { sortParticipantsByInitiative } from '@/lib/combat/combatHelpers';

describe('InitiativeOrder', () => {
  const mockOnParticipantSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render participants sorted by initiative (descending)', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);

    // Verify order: Goblin Ambusher (14), Barbarian Hero (10), Wizard (8)
    expect(listItems[0]).toHaveTextContent('Goblin Ambusher');
    expect(listItems[1]).toHaveTextContent('Barbarian Hero');
    expect(listItems[2]).toHaveTextContent('Wizard');
  });

  it('should highlight current turn participant', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={0}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    const firstItem = screen.getAllByRole('listitem')[0];
    expect(firstItem).toHaveAttribute('aria-current', 'true');
  });

  it('should display participant HP percentage', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    // Barbarian Hero: 60/60 HP = 100%
    expect(screen.getByText(/100%/)).toBeInTheDocument();

    // Wizard: 28/28 HP = 100%
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('should display participant type (creature type)', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    expect(screen.getByText(/Humanoid/)).toBeInTheDocument();
  });

  it('should call onParticipantSelect when a participant is clicked', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    const firstItem = screen.getAllByRole('listitem')[0];
    firstItem.click();

    expect(mockOnParticipantSelect).toHaveBeenCalledWith(sortedParticipants[0].id);
  });

  it('should handle unconscious state (HP <= 0)', () => {
    const unconsciousParticipant = {
      ...mockSession.participants[0],
      currentHP: 0,
    };

    render(
      <InitiativeOrder
        participants={[unconsciousParticipant]}
        currentTurnIndex={0}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    expect(screen.getByText(/Unconscious/)).toBeInTheDocument();
  });

  it('should render empty list when no participants', () => {
    const { container } = render(
      <InitiativeOrder
        participants={[]}
        currentTurnIndex={0}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    const list = container.querySelector('ul');
    expect(list).toBeEmptyDOMElement();
  });

  it('should include aria-label for accessibility', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label');
  });

  it('should mark initiative value visible for clarity', () => {
    const sortedParticipants = sortParticipantsByInitiative(mockSession.participants);

    render(
      <InitiativeOrder
        participants={sortedParticipants}
        currentTurnIndex={mockSession.currentTurnIndex}
        onParticipantSelect={mockOnParticipantSelect}
      />
    );

    expect(screen.getByText(/Initiative 14/)).toBeInTheDocument();
    expect(screen.getByText(/Initiative 10/)).toBeInTheDocument();
    expect(screen.getByText(/Initiative 8/)).toBeInTheDocument();
  });
});
