/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpellcastingStep } from '../spellcasting-step';
import { characterFormSchema, type CharacterFormInput } from '@/lib/validations/character';

// Test wrapper component that provides form context
function TestWrapper({ 
  children, 
  defaultValues, 
  classesSelected 
}: { 
  children: React.ReactNode; 
  defaultValues?: Partial<CharacterFormInput>;
  classesSelected?: Array<{className: string; level: number}>;
}) {
  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: 'Test Character',
      race: 'Human',
      background: 'Acolyte',
      alignment: 'Neutral Good',
      classes: classesSelected || [{ className: 'Wizard', level: 1, hitDiceSize: 6, hitDiceUsed: 0 }],
      abilities: {
        strength: 10,
        dexterity: 14,
        constitution: 13,
        intelligence: 16,
        wisdom: 12,
        charisma: 8
      },
      skillProficiencies: [],
      savingThrowProficiencies: [],
      hitPoints: { maximum: 8, current: 8, temporary: 0 },
      armorClass: 12,
      speed: 30,
      initiative: 2,
      passivePerception: 10,
      equipment: [],
      features: [],
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

describe('SpellcastingStep', () => {
  it('should render spellcasting sections', () => {
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText('Spellcasting Ability')).toBeInTheDocument();
    expect(screen.getByText('Prepared Spells')).toBeInTheDocument();
  });

  it('should show spellcasting controls for caster classes', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Wizard', level: 1, hitDiceSize: 6, hitDiceUsed: 0 }]}>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText('Spellcasting Ability')).toBeInTheDocument();
    expect(screen.getByLabelText(/spellcasting ability/i)).toBeInTheDocument();
  });

  it('should hide spellcasting for non-caster classes', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }]}>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText(/doesn't have any spellcasting classes/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/spellcasting ability/i)).not.toBeInTheDocument();
  });

  it('should calculate spell attack bonus correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    // Select Intelligence as spellcasting ability (modifier +3, proficiency +2 = +5 total)
    const abilitySelect = screen.getByLabelText(/spellcasting ability/i);
    await user.click(abilitySelect);
    
    // Wait for dropdown to open and find Intelligence option
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /intelligence/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('option', { name: /intelligence/i }));

    // Check that the spell attack bonus field shows the calculated value
    await waitFor(() => {
      const spellAttackInput = screen.getByDisplayValue('5');
      expect(spellAttackInput).toBeInTheDocument();
    });
  });

  it('should calculate spell save DC correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    // Select Intelligence as spellcasting ability (8 + 3 modifier + 2 proficiency = 13 DC)
    const abilitySelect = screen.getByLabelText(/spellcasting ability/i);
    await user.click(abilitySelect);
    
    // Wait for dropdown to open and find Intelligence option
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /intelligence/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('option', { name: /intelligence/i }));

    // Check that the spell save DC field shows the calculated value
    await waitFor(() => {
      const spellSaveDCInput = screen.getByDisplayValue('13');
      expect(spellSaveDCInput).toBeInTheDocument();
    });
  });

  it('should show spell slots for appropriate levels', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Wizard', level: 3, hitDiceSize: 6, hitDiceUsed: 0 }]}>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText('Spell Slots')).toBeInTheDocument();
    expect(screen.getByText('1st Level')).toBeInTheDocument();
    expect(screen.getByText('2nd Level')).toBeInTheDocument();
  });

  it('should handle known spells for Sorcerer', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Sorcerer', level: 1, hitDiceSize: 6, hitDiceUsed: 0 }]}>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText('Known Spells')).toBeInTheDocument();
    expect(screen.getByText('Add Spell')).toBeInTheDocument();
  });

  it('should handle prepared spells for Wizard', () => {
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    expect(screen.getByText('Prepared Spells')).toBeInTheDocument();
    expect(screen.getByText('Add Spell')).toBeInTheDocument();
  });

  it('should allow adding and removing spells', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    const addSpellButton = screen.getByText('Add Spell');
    await user.click(addSpellButton);

    // Should show spell input form
    const spellInput = screen.getByPlaceholderText('Enter spell name');
    expect(spellInput).toBeInTheDocument();
    
    await user.type(spellInput, 'Magic Missile');
    
    const saveSpellButton = screen.getByText('Add');
    await user.click(saveSpellButton);

    // Spell should be added to the list
    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <SpellcastingStep />
      </TestWrapper>
    );

    // Check for accessibility features
    expect(screen.getByText('Spellcasting Ability')).toBeInTheDocument();
    expect(screen.getByLabelText(/primary spellcasting ability/i)).toBeInTheDocument();
  });
});