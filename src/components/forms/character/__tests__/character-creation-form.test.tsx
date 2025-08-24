/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterCreationForm } from '../character-creation-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock API calls
const mockCreateCharacter = jest.fn();
global.fetch = jest.fn();

describe('CharacterCreationForm', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'mock-character-id' })
    });
  });

  it('should render multi-step form with first step', () => {
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Character Information')).toBeInTheDocument();
    expect(screen.getByText('Character Name *')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('should show progress through steps', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Fill in basic info
    const nameInput = screen.getByRole('textbox', { name: /character name/i });
    await user.type(nameInput, 'Test Character');

    // Navigate to next step
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should be on step 2
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Ability Scores')).toBeInTheDocument();
  });

  it('should validate required fields before advancing', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Try to advance without filling required fields
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should still be on first step
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/character name is required/i)).toBeInTheDocument();
    });
  });

  it('should allow navigation back to previous steps', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields and advance
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test');
    await user.click(screen.getByText('Next'));

    // Should be on step 2
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    // Go back
    const backButton = screen.getByText('Previous');
    await user.click(backButton);

    // Should be back on step 1
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument(); // Data preserved
  });

  it('should show complete button on final step', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Navigate through all steps
    // Step 1
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test');
    await user.click(screen.getByText('Next'));

    // Step 2
    await user.click(screen.getByText('Next'));

    // Step 3 - should show Complete button
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('should submit form when complete is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Fill out form and navigate to final step
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test Character');
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));

    // Complete the form
    const completeButton = screen.getByText('Complete');
    await user.click(completeButton);

    // Should call API and onComplete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Character')
      });
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        id: 'mock-character-id'
      }));
    });
  });

  it('should call onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock slow API response
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to final step and submit
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test');
    
    // Fill required fields to pass validation
    const raceSelect = screen.getByRole('combobox', { name: /^race \*$/i });
    await user.click(raceSelect);
    await user.click(screen.getByText('Human'));
    
    const backgroundSelect = screen.getByRole('combobox', { name: /background/i });
    await user.click(backgroundSelect);
    await user.click(screen.getByText('Acolyte'));
    
    const alignmentSelect = screen.getByRole('combobox', { name: /alignment/i });
    await user.click(alignmentSelect);
    await user.click(screen.getByText('Lawful Good'));
    
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    
    const completeButton = screen.getByText('Complete');
    await user.click(completeButton);

    // Should show loading state
    expect(screen.getByText('Completing...')).toBeInTheDocument();
    
    // Buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Validation failed' })
    });
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to final step and submit
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test');
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Complete'));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
    });

    // Should not call onComplete
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should preserve form data across steps', async () => {
    const user = userEvent.setup();
    
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Fill step 1
    await user.type(screen.getByRole('textbox', { name: /character name/i }), 'Test Character');
    
    // Go to step 2 and back to step 1
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Previous'));

    // Data should be preserved
    expect(screen.getByDisplayValue('Test Character')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <CharacterCreationForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Check for accessibility attributes
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('aria-live', 'polite');

    const progressIndicator = screen.getByText('Step 1 of 3');
    expect(progressIndicator).toHaveAttribute('aria-label');
  });
});