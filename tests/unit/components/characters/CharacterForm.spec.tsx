import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterForm from '../../../../src/components/characters/CharacterForm';
import { CharacterProvider } from '../../../../src/lib/characterStore';

describe('CharacterForm', () => {
  it('shows validation errors when required fields are missing and creates a character when valid', async () => {
    const user = userEvent.setup();

    render(
      <CharacterProvider>
        <CharacterForm />
      </CharacterProvider>
    );

    // Submit with empty form
    const submit = screen.getByRole('button', { name: /create character/i });
    await user.click(submit);

    // Expect validation error for name
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();

    // Fill required fields
    await user.type(screen.getByLabelText(/Name/), 'Test Hero');
    await user.type(screen.getByLabelText(/Class/), 'Fighter');
    await user.type(screen.getByLabelText(/Race/), 'Human');
    await user.type(screen.getByLabelText(/Level/), '3');
    await user.type(screen.getByLabelText(/HP/), '24');
    await user.type(screen.getByLabelText(/AC/), '16');

    await user.click(submit);

    // After successful submit the component shows a simple success message
    expect(await screen.findByText(/character created/i)).toBeInTheDocument();
  });
});
