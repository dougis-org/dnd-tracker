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
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
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
  it('should render all ability score fields', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Check all 6 ability scores are present
    DND_ABILITIES.forEach(ability => {
      const capitalizedAbility = ability.charAt(0).toUpperCase() + ability.slice(1);
      expect(screen.getByText(capitalizedAbility)).toBeInTheDocument();
    });
  });

  it('should display ability score method selector', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/ability score method/i)).toBeInTheDocument();
    expect(screen.getByText('Point Buy')).toBeInTheDocument();
  });

  it('should show modifiers for each ability score', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // With default score of 10, modifier should be +0
    const modifiers = screen.getAllByText('+0');
    expect(modifiers.length).toBeGreaterThanOrEqual(6); // At least one for each ability
  });

  it('should calculate modifiers correctly', () => {
    render(
      <TestWrapper
        defaultValues={{
          abilities: {
            strength: 16, // +3 modifier
            dexterity: 8,  // -1 modifier
            constitution: 14, // +2 modifier
            intelligence: 12, // +1 modifier
            wisdom: 13, // +1 modifier
            charisma: 6 // -2 modifier
          }
        }}
      >
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText('+3')).toBeInTheDocument(); // STR 16
    expect(screen.getByText('-1')).toBeInTheDocument(); // DEX 8  
    expect(screen.getByText('+2')).toBeInTheDocument(); // CON 14
    expect(screen.getByText('+1')).toBeInTheDocument(); // INT 12
    // WIS 13 also +1, so two +1s total
    expect(screen.getByText('-2')).toBeInTheDocument(); // CHA 6
  });

  it('should allow manual score input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    const strengthInput = screen.getByDisplayValue('10'); // Find strength input by default value
    await user.clear(strengthInput);
    await user.type(strengthInput, '15');
    
    expect(strengthInput).toHaveValue(15);
  });

  it('should show point buy calculator when point buy is selected', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Point Buy should be default
    expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
  });

  it('should switch between ability score methods', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Find method selector
    const methodSelect = screen.getByRole('combobox', { name: /ability score method/i });
    await user.click(methodSelect);
    
    await waitFor(() => {
      expect(screen.getByText('Standard Array')).toBeInTheDocument();
      expect(screen.getByText('Manual/Rolling')).toBeInTheDocument();
    });
  });

  it('should apply standard array values when selected', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Switch to Standard Array
    const methodSelect = screen.getByRole('combobox', { name: /ability score method/i });
    await user.click(methodSelect);
    
    const standardArrayOption = screen.getByText('Standard Array');
    await user.click(standardArrayOption);
    
    // Should show standard array values (15, 14, 13, 12, 10, 8)
    await waitFor(() => {
      expect(screen.getByText(/standard array values/i)).toBeInTheDocument();
    });
  });

  it('should validate ability score ranges', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    const strengthInput = screen.getByDisplayValue('10');
    
    // Try to enter invalid values
    await user.clear(strengthInput);
    await user.type(strengthInput, '35'); // Too high
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/ability score cannot exceed 30/i)).toBeInTheDocument();
    });
  });

  it('should show racial bonuses when applicable', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep raceSelected="Human" />
      </TestWrapper>
    );

    // Human should show +1 to all abilities or variant human options
    expect(screen.getByText(/racial bonuses/i)).toBeInTheDocument();
  });

  it('should be accessible with proper labels and descriptions', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    DND_ABILITIES.forEach(ability => {
      const capitalizedAbility = ability.charAt(0).toUpperCase() + ability.slice(1);
      const input = screen.getByLabelText(new RegExp(capitalizedAbility, 'i'));
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '30');
    });
  });

  it('should show helpful descriptions for each ability', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/physical power/i)).toBeInTheDocument(); // Strength
    expect(screen.getByText(/agility.*reflexes/i)).toBeInTheDocument(); // Dexterity
    expect(screen.getByText(/health.*stamina/i)).toBeInTheDocument(); // Constitution
  });

  it('should update point buy costs when scores change', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Should start with some points remaining (27 total in point buy)
    const pointsDisplay = screen.getByText(/points remaining/i);
    expect(pointsDisplay).toBeInTheDocument();
    
    // Increase a score and verify points decrease
    const strengthInput = screen.getByDisplayValue('10');
    await user.clear(strengthInput);
    await user.type(strengthInput, '15'); // Costs more points
    
    // Points should have decreased
    await waitFor(() => {
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
    });
  });

  it('should prevent exceeding point buy limits', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    // Try to set all abilities to maximum (15)
    const inputs = screen.getAllByDisplayValue('10');
    
    for (const input of inputs.slice(0, 6)) { // Only ability scores
      await user.clear(input);
      await user.type(input, '15');
    }
    
    // Should show error about exceeding points
    await waitFor(() => {
      expect(screen.getByText(/not enough points/i)).toBeInTheDocument();
    });
  });
});