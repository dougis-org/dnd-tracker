import React, { useState, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import CharacterDetail from '../../../../src/components/characters/CharacterDetail';
import { CharacterProvider, useCharacterStore } from '../../../../src/lib/characterStore';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Initialize store in useEffect to avoid render-time state updates
const TestHarness = ({ id }: { id: string }) => {
  const store = useCharacterStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (store.state.characters.length === 0) {
      store.init();
    }
    setInitialized(true);
  }, [store]);

  if (!initialized) return null;
  return <CharacterDetail id={id} />;
};

describe('CharacterDetail', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  it('renders character details for a valid id', () => {
    render(
      <CharacterProvider>
        <TestHarness id="char-1" />
      </CharacterProvider>
    );

    expect(screen.getByText(/Aelith Swiftwind/)).toBeInTheDocument();
    expect(screen.getByText(/Rogue/)).toBeInTheDocument();
  });

  it('shows empty state for invalid id', () => {
    render(
      <CharacterProvider>
        <TestHarness id="no-such-id" />
      </CharacterProvider>
    );

    expect(screen.getByText(/Character not found/)).toBeInTheDocument();
  });
});
