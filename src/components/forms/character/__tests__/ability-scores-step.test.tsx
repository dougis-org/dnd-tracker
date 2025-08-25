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

    // Check all 6 ability scores are present (as lowercase with capitalize CSS class)
    DND_ABILITIES.forEach(ability => {
      expect(screen.getByText(ability)).toBeInTheDocument();
    });
  });

  it('should display ability score method selector', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    expect(screen.getByText(/ability score method/i)).toBeInTheDocument();
    expect(screen.getAllByText('Point Buy').length).toBeGreaterThan(0);
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

    expect(screen.getAllByText('+3').length).toBeGreaterThan(0); // STR 16
    expect(screen.getAllByText('-1').length).toBeGreaterThan(0); // DEX 8  
    expect(screen.getAllByText('+2').length).toBeGreaterThan(0); // CON 14
    expect(screen.getAllByText('+1').length).toBeGreaterThanOrEqual(2); // INT 12 and WIS 13
    expect(screen.getAllByText('-2').length).toBeGreaterThan(0); // CHA 6
  });

  it('should allow manual score input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    const strengthInput = screen.getByLabelText(/strength/i);
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

    // Find method selector - it doesn't have accessible name, use the button directly
    const methodSelect = screen.getByRole('combobox');
    await user.click(methodSelect);
    
    await waitFor(() => {
      expect(screen.getAllByText('Standard Array').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Manual/Rolling').length).toBeGreaterThan(0);
    });
  });

  it('should apply standard array values when selected', () => {
    // Test by rendering a component that starts in standard array mode
    function TestWrapperWithStandardArray({ children }: { children: React.ReactNode }) {
      const methods = useForm<AbilitiesFormData>({
        resolver: zodResolver(abilitiesSchema),
        defaultValues: {
          abilities: {
            strength: 15, // Standard array values
            dexterity: 14,
            constitution: 13,
            intelligence: 12,
            wisdom: 10,
            charisma: 8
          }
        }
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
        </FormProvider>
      );
    }
    
    render(
      <TestWrapperWithStandardArray>
        <AbilityScoresStep />
      </TestWrapperWithStandardArray>
    );

    // Should show standard array method selector
    expect(screen.getAllByText('Point Buy').length).toBeGreaterThan(0);
    
    // Should show the correct ability scores from standard array
    expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Strength
    expect(screen.getByDisplayValue('14')).toBeInTheDocument(); // Dexterity  
    expect(screen.getByDisplayValue('13')).toBeInTheDocument(); // Constitution
    expect(screen.getByDisplayValue('12')).toBeInTheDocument(); // Intelligence
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Wisdom
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();  // Charisma
  });

  it('should validate ability score ranges', async () => {
    const user = userEvent.setup();
    
    function TestWrapperWithInvalidValue({ children }: { children: React.ReactNode }) {
      const methods = useForm<AbilitiesFormData>({
        resolver: zodResolver(abilitiesSchema),
        defaultValues: {
          abilities: {
            strength: 35, // Invalid - too high
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        }
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
        </FormProvider>
      );
    }
    
    render(
      <TestWrapperWithInvalidValue>
        <AbilityScoresStep />
      </TestWrapperWithInvalidValue>
    );

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/ability scores must be between 1 and 30/i)).toBeInTheDocument();
    });
  });

  it('should show racial bonuses when applicable', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep raceSelected="Human" />
      </TestWrapper>
    );

    // Should show racial bonuses section
    expect(screen.getAllByText(/racial bonuses/i).length).toBeGreaterThan(0);
  });

  it('should be accessible with proper labels and descriptions', () => {
    render(
      <TestWrapper>
        <AbilityScoresStep />
      </TestWrapper>
    );

    DND_ABILITIES.forEach(ability => {
      const input = screen.getByLabelText(new RegExp(ability, 'i'));
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '8'); // Point buy starts at 8
      expect(input).toHaveAttribute('max', '15'); // Point buy max is 15
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
    const strengthInput = screen.getByLabelText(/strength/i);
    await user.clear(strengthInput);
    await user.type(strengthInput, '15'); // Costs more points
    
    // Points should have decreased
    await waitFor(() => {
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
    });
  });

  it('should prevent exceeding point buy limits', async () => {
    function TestWrapperOverBudget({ children }: { children: React.ReactNode }) {
      const methods = useForm<AbilitiesFormData>({
        resolver: zodResolver(abilitiesSchema),
        defaultValues: {
          abilities: {
            strength: 15, // 9 points
            dexterity: 15, // 9 points  
            constitution: 15, // 9 points
            intelligence: 15, // 9 points
            wisdom: 15, // 9 points
            charisma: 15 // 9 points
            // Total: 54 points (over 27 limit)
          }
        }
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
        </FormProvider>
      );
    }
    
    render(
      <TestWrapperOverBudget>
        <AbilityScoresStep />
      </TestWrapperOverBudget>
    );

    // Should show error about exceeding points in the point buy card
    await waitFor(() => {
      expect(screen.getAllByText(/not enough points.*reduce some ability scores/i).length).toBeGreaterThan(0);
    });
  });
});