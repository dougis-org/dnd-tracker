import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterDetail from '../../../../src/components/characters/CharacterDetail';
import { CharacterProvider } from '../../../../src/lib/characterStore';

describe('CharacterDetail', () => {
  it('renders character details for a valid id', () => {
    render(
      <CharacterProvider>
        <CharacterDetail id="char-1" />
      </CharacterProvider>
    );

    expect(screen.getByText(/Aelith Swiftwind/)).toBeInTheDocument();
    expect(screen.getByText(/Rogue/)).toBeInTheDocument();
  });

  it('shows empty state for invalid id', () => {
    render(
      <CharacterProvider>
        <CharacterDetail id="no-such-id" />
      </CharacterProvider>
    );

    expect(screen.getByText(/Character not found/)).toBeInTheDocument();
  });
});
