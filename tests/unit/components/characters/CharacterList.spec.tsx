import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterList from '../../../../src/components/characters/CharacterList';
import { CharacterProvider } from '../../../../src/lib/characterStore';

describe('CharacterList', () => {
  it('renders the list and shows at least 5 characters from seed', () => {
    render(
      <CharacterProvider>
        <CharacterList />
      </CharacterProvider>
    );

    // We expect seed data to include at least 5 items; assert by checking for one known name
    expect(screen.getByText(/Aelith Swiftwind/)).toBeInTheDocument();
  });

  it('filters results when typing in search box', async () => {
    const user = userEvent.setup();
    render(
      <CharacterProvider>
        <CharacterList />
      </CharacterProvider>
    );

    const input = screen.getByLabelText('Search characters');
    await user.type(input, 'Wizard');

    // Lirael Moonwhisper is the seeded Wizard
    expect(screen.getByText(/Lirael Moonwhisper/)).toBeInTheDocument();
    // Other class names should not be visible if filtering worked
    expect(screen.queryByText(/Borin Stonehelm/)).not.toBeInTheDocument();
  });
});
