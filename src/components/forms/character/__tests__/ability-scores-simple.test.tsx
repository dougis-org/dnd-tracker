/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AbilityScoresStep } from '../ability-scores-step';
import { abilitiesSchema, type AbilitiesFormData, DND_ABILITIES } from '@/lib/validations/character';

// Test wrapper component
function TestWrapper({ children, defaultValues = {} }: { 
  children: React.ReactNode; 
  defaultValues?: Partial<AbilitiesFormData>;
}) {
  const methods = useForm<AbilitiesFormData>({
    resolver: zodResolver(abilitiesSchema),
    defaultValues: {
      abilities: {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8
      },
      ...defaultValues
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        {children}
      </form>
    </FormProvider>
  );
}

describe('AbilityScoresStep', () => {
  it('should render basic structure', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText('Ability Score Method')).toBeInTheDocument();
    expect(screen.getByText('Point Buy System')).toBeInTheDocument();
  });

  it('should show all ability score labels', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Check for ability labels (they're capitalized in the component)
    expect(screen.getByText('strength')).toBeInTheDocument();
    expect(screen.getByText('dexterity')).toBeInTheDocument();
    expect(screen.getByText('constitution')).toBeInTheDocument();
    expect(screen.getByText('intelligence')).toBeInTheDocument();
    expect(screen.getByText('wisdom')).toBeInTheDocument();
    expect(screen.getByText('charisma')).toBeInTheDocument();
  });

  it('should display ability modifiers', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Should show modifiers (with default scores of 8, modifier is -1)
    const modifiers = screen.getAllByText('-1');
    expect(modifiers.length).toBeGreaterThanOrEqual(1);
  });

  it('should show method selector with options', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Check that the select shows Point Buy as current value
    const pointBuyElements = screen.getAllByText('Point Buy');
    expect(pointBuyElements.length).toBeGreaterThan(0);
  });

  it('should display point buy information', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/Points Used:/)).toBeInTheDocument();
    expect(screen.getByText(/Points Remaining:/)).toBeInTheDocument();
    expect(screen.getByText(/All abilities start at 8/)).toBeInTheDocument();
  });

  it('should have number inputs for abilities', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBe(6); // One for each ability
    
    numberInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '8'); // Point buy minimum
      expect(input).toHaveAttribute('max', '15'); // Point buy maximum
    });
  });

  it('should allow changing ability scores', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // First, switch to "roll" method to avoid point-buy constraints
    const methodSelect = screen.getByRole('combobox');
    await user.click(methodSelect);
    
    // Wait for dropdown and click the Manual/Rolling option
    const rollOptions = await screen.findAllByText('Manual/Rolling');
    // Click the one that's in the dropdown (the span element, not the hidden option)
    await user.click(rollOptions[1]); // Second occurrence is the visible dropdown item

    // Wait for the method to change before proceeding
    await waitFor(() => {
      expect(screen.queryByText('Point Buy System')).not.toBeInTheDocument();
    });

    // Find the strength input and change its value
    const strengthInput = screen.getAllByRole('spinbutton')[0]; // First ability input
    
    // Use fireEvent.change for more direct control
    fireEvent.change(strengthInput, { target: { value: '12' } });
    
    await waitFor(() => {
      expect(strengthInput).toHaveValue(12);
    });
  });

  it('should show ability descriptions', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/Physical power/)).toBeInTheDocument();
    expect(screen.getByText(/Agility.*reflexes/)).toBeInTheDocument();
    expect(screen.getByText(/Health.*stamina/)).toBeInTheDocument();
    expect(screen.getByText(/Reasoning ability/)).toBeInTheDocument();
    expect(screen.getByText(/Awareness.*insight/)).toBeInTheDocument();
    expect(screen.getByText(/Force of personality/)).toBeInTheDocument();
  });

  it('should show quick action buttons', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText('Reset All to 8')).toBeInTheDocument();
    expect(screen.getByText('Balanced Build')).toBeInTheDocument();
  });

  it('should reset abilities when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    const resetButton = screen.getByText('Reset All to 8');
    await user.click(resetButton);

    // All inputs should now show 8
    const numberInputs = screen.getAllByRole('spinbutton');
    numberInputs.forEach(input => {
      expect(input).toHaveValue(8);
    });
  });

  it('should show form completion hint', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/determine your character's basic capabilities/)).toBeInTheDocument();
    expect(screen.getByText(/Higher scores provide better bonuses/)).toBeInTheDocument();
  });

  it('should show racial bonuses when race is provided', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep raceSelected="Human" />
      </TestWrapper>
    );

    expect(screen.getByText('Racial Bonuses')).toBeInTheDocument();
    expect(screen.getByText(/Your selected race \(Human\)/)).toBeInTheDocument();
  });
});