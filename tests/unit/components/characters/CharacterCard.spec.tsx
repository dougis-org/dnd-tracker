import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterCard from '../../../../src/components/characters/CharacterCard';
import { Character } from '../../../../types/character';

describe('CharacterCard', () => {
  const sample: Character = {
    id: 'c1',
    name: 'Test Hero',
    className: 'Paladin',
    race: 'Human',
    level: 2,
    hitPoints: { current: 16, max: 16 },
    armorClass: 17,
    abilities: { str: 14, dex: 10, con: 14, int: 10, wis: 12, cha: 13 },
  };

  it('renders basic fields: name, class, level, HP, AC', () => {
    render(<CharacterCard character={sample} />);

    expect(screen.getByText(/Test Hero/)).toBeInTheDocument();
    expect(screen.getByText(/Paladin/)).toBeInTheDocument();
    expect(screen.getByText(/Level\s*2/)).toBeInTheDocument();
    expect(screen.getByText(/HP\s*16/)).toBeInTheDocument();
    expect(screen.getByText(/AC\s*17/)).toBeInTheDocument();
  });
});
