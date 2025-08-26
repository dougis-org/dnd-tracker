/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClassSpecificStep } from '../class-specific-step';
import { characterFormSchema, type CharacterFormInput } from '@/lib/validations/character';

// Mock console.log to avoid noise in tests
console.log = jest.fn();

// Form wrapper for testing
function TestFormWrapper({ children, defaultValues }: { 
  children: React.ReactNode;
  defaultValues?: Partial<CharacterFormInput>;
}) {
  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: 'Test Character',
      race: 'Human',
      background: 'Acolyte',
      alignment: 'Neutral Good',
      classes: [
        {
          className: 'Fighter',
          level: 1,
          hitDiceSize: 10,
          hitDiceUsed: 0
        }
      ],
      abilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      },
      skillProficiencies: ['Athletics', 'Intimidation'],
      savingThrowProficiencies: ['Strength', 'Constitution'],
      hitPoints: { maximum: 11, current: 11, temporary: 0 },
      armorClass: 16,
      speed: 30,
      initiative: 2,
      passivePerception: 10,
      spellcasting: {
        ability: undefined,
        spellAttackBonus: 0,
        spellSaveDC: 8
      },
      notes: '',
      ...defaultValues
    },
    mode: 'onChange'
  });

  return (
    <FormProvider {...form}>
      {children}
    </FormProvider>
  );
}

describe('ClassSpecificStep', () => {
  const fighterClass = {
    className: 'Fighter',
    level: 3,
    hitDiceSize: 10,
    hitDiceUsed: 0
  };

  const wizardClass = {
    className: 'Wizard',
    level: 1,
    hitDiceSize: 6,
    hitDiceUsed: 0
  };

  it('should render with class overview for Fighter', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    expect(screen.getAllByText('Class Features')).toHaveLength(2);
    expect(screen.getByText(/Configure your.*specific abilities and features/)).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('Master combatants skilled with various weapons and tactics')).toBeInTheDocument();
    
    // Key features - these appear multiple times (as badges and as checkboxes)
    expect(screen.getAllByText('Fighting Style')).toHaveLength(3); // Badge + Card Title + Checkbox
    expect(screen.getAllByText('Second Wind')).toHaveLength(2); // Badge + Checkbox
    expect(screen.getAllByText('Action Surge')).toHaveLength(2); // Badge + Checkbox
    
    // Saving throws
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Constitution')).toBeInTheDocument();
  });

  it('should show subclass selection for level 3+ character', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    expect(screen.getByLabelText(/Fighter Subclass/)).toBeInTheDocument();
    
    // Should show subclass selection since character is level 3
    expect(screen.queryByText('Available at level 3')).not.toBeInTheDocument();
  });

  it('should disable subclass selection for character below level 3', () => {
    const lowLevelFighter = { ...fighterClass, level: 1 };
    
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[lowLevelFighter]} />
      </TestFormWrapper>
    );

    const subclassSelect = screen.getByLabelText(/Fighter Subclass/);
    expect(subclassSelect).toBeDisabled();
    expect(screen.getByText('Available at level 3')).toBeInTheDocument();
  });

  it('should show fighting style selection for Fighter', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    expect(screen.getAllByText('Fighting Style')).toHaveLength(3);
    expect(screen.getByText(/Choose Fighting Style/)).toBeInTheDocument();
  });

  it('should not show fighting style for non-fighter classes', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[wizardClass]} />
      </TestFormWrapper>
    );

    expect(screen.queryByText('Fighting Style')).not.toBeInTheDocument();
    expect(screen.queryByText(/Choose Fighting Style/)).not.toBeInTheDocument();
  });

  it('should allow selection of class features', async () => {
    const user = userEvent.setup();
    
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    // Find checkboxes for class features
    const fightingStyleCheckbox = screen.getByRole('checkbox', { name: /Fighting Style/ });
    const secondWindCheckbox = screen.getByRole('checkbox', { name: /Second Wind/ });
    
    expect(fightingStyleCheckbox).not.toBeChecked();
    expect(secondWindCheckbox).not.toBeChecked();

    // Select some features
    await user.click(fightingStyleCheckbox);
    await user.click(secondWindCheckbox);

    expect(fightingStyleCheckbox).toBeChecked();
    expect(secondWindCheckbox).toBeChecked();
  });

  it('should show multiclass warning for multiple classes', () => {
    const multiclassCharacter = [
      fighterClass,
      { className: 'Rogue', level: 2, hitDiceSize: 8, hitDiceUsed: 0 }
    ];

    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={multiclassCharacter} />
      </TestFormWrapper>
    );

    expect(screen.getByText('Multiclass Character')).toBeInTheDocument();
    expect(screen.getByText(/You have multiple classes/)).toBeInTheDocument();
    expect(screen.getAllByText('Fighter')).toHaveLength(2);
    expect(screen.getByText('Rogue')).toBeInTheDocument();
    expect(screen.getAllByText(/Level \d+/)).toHaveLength(3); // Fighter level appears twice + Rogue level once
  });

  it('should show no class selected message when no classes provided', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[]} />
      </TestFormWrapper>
    );

    expect(screen.getByText('No Class Selected')).toBeInTheDocument();
    expect(screen.getByText(/Please go back to the previous step/)).toBeInTheDocument();
  });

  it('should show unknown class message for unsupported classes', () => {
    const unknownClass = {
      className: 'Blood Hunter',
      level: 1,
      hitDiceSize: 10,
      hitDiceUsed: 0
    };

    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[unknownClass]} />
      </TestFormWrapper>
    );

    expect(screen.getByText('Unknown Class')).toBeInTheDocument();
    expect(screen.getByText(/Class-specific features for.*are not yet available/)).toBeInTheDocument();
  });

  it('should handle subclass selection', async () => {
    const user = userEvent.setup();
    
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    const subclassSelect = screen.getByLabelText(/Fighter Subclass/);
    
    await user.click(subclassSelect);
    
    // Should show subclass options
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Champion' })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('option', { name: 'Champion' }));
    
    // Value should be updated
    expect(subclassSelect).toHaveAttribute('data-state', 'closed');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TestFormWrapper>
        <ClassSpecificStep classesSelected={[fighterClass]} />
      </TestFormWrapper>
    );

    // Check main headings exist
    expect(screen.getAllByText('Class Features')).toHaveLength(2);
    
    // Check form controls have proper labels
    expect(screen.getByLabelText(/Fighter Subclass/)).toBeInTheDocument();
    expect(screen.getByText(/Choose Fighting Style/)).toBeInTheDocument();
    
    // Check checkboxes have labels
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAccessibleName();
    });
  });
});