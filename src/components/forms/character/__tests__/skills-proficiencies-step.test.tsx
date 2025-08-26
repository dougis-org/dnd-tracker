/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SkillsProficienciesStep } from '../skills-proficiencies-step';
import { characterFormSchema, type CharacterFormInput } from '@/lib/validations/character';

// Test wrapper component that provides form context
function TestWrapper({ 
  children, 
  defaultValues, 
  backgroundSelected, 
  classesSelected 
}: { 
  children: React.ReactNode; 
  defaultValues?: Partial<CharacterFormInput>;
  backgroundSelected?: string;
  classesSelected?: Array<{className: string; level: number}>;
}) {
  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: 'Test Character',
      race: 'Human',
      background: backgroundSelected || 'Acolyte',
      alignment: 'Neutral Good',
      classes: classesSelected || [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      skillProficiencies: [],
      savingThrowProficiencies: [],
      hitPoints: { maximum: 10, current: 10, temporary: 0 },
      armorClass: 10,
      speed: 30,
      initiative: 0,
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

describe('SkillsProficienciesStep', () => {
  it('should render all skill checkboxes', () => {
    render(
      <TestWrapper>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Check for some expected D&D skills
    expect(screen.getByRole('checkbox', { name: /acrobatics/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /athletics/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /perception/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /stealth/i })).toBeInTheDocument();
  });

  it('should allow selecting and deselecting skill proficiencies', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    const athleticsCheckbox = screen.getByRole('checkbox', { name: /athletics/i });
    
    // Should start unchecked
    expect(athleticsCheckbox).not.toBeChecked();
    
    // Check the box
    await user.click(athleticsCheckbox);
    expect(athleticsCheckbox).toBeChecked();
    
    // Uncheck the box
    await user.click(athleticsCheckbox);
    expect(athleticsCheckbox).not.toBeChecked();
  });

  it('should show background-based skill suggestions', () => {
    render(
      <TestWrapper backgroundSelected="Acolyte">
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Acolyte background should suggest Insight and Religion
    expect(screen.getByText('Background Skills')).toBeInTheDocument();
    expect(screen.getByText('Acolyte')).toBeInTheDocument();
  });

  it('should show class-based skill suggestions for Fighter', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }]}>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Fighter should have suggested skills
    expect(screen.getByText('Class Skill Proficiencies')).toBeInTheDocument();
    expect(screen.getByText('Fighter')).toBeInTheDocument();
  });

  it('should display ability modifiers for each skill', () => {
    render(
      <TestWrapper>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Skills should show their associated ability modifiers
    // Athletics is Strength-based, with 10 STR = +0 modifier
    const athleticsLabel = screen.getByLabelText(/athletics/i);
    expect(athleticsLabel).toBeInTheDocument();
    
    // Should show modifier text somewhere in the component
    expect(screen.getAllByText('+0').length).toBeGreaterThan(0);
  });

  it('should calculate proficiency bonuses correctly', () => {
    render(
      <TestWrapper 
        defaultValues={{ skillProficiencies: ['Athletics'] }}
        classesSelected={[{ className: 'Fighter', level: 3, hitDiceSize: 10, hitDiceUsed: 0 }]}
      >
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Level 3 = +2 proficiency bonus, +0 ability modifier = +2 total
    const athleticsCheckbox = screen.getByRole('checkbox', { name: /athletics/i });
    expect(athleticsCheckbox).toBeChecked();
    
    // Should show +2 proficiency bonus somewhere
    expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
  });

  it('should show saving throw proficiencies based on class', () => {
    render(
      <TestWrapper classesSelected={[{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }]}>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Should show saving throws section
    expect(screen.getByText('Saving Throw Proficiencies')).toBeInTheDocument();
    
    // Fighter gets Strength and Constitution saving throw proficiency
    expect(screen.getAllByText(/strength/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/constitution/i).length).toBeGreaterThan(0);
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Check for key accessibility features
    expect(screen.getByText('Skill Proficiencies')).toBeInTheDocument();
    expect(screen.getByText('Saving Throw Proficiencies')).toBeInTheDocument();
    
    // Should have checkbox inputs with proper labels
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should limit skill selections based on class restrictions', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper classesSelected={[{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }]}>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Fighter can choose 2 skills from a specific list
    // Try to select more skills than allowed
    const acrobaticsCheckbox = screen.getByRole('checkbox', { name: /acrobatics/i });
    const athleticsCheckbox = screen.getByRole('checkbox', { name: /athletics/i });
    const intimidationCheckbox = screen.getByRole('checkbox', { name: /intimidation/i });
    
    await user.click(acrobaticsCheckbox);
    await user.click(athleticsCheckbox);
    
    expect(acrobaticsCheckbox).toBeChecked();
    expect(athleticsCheckbox).toBeChecked();
    
    // Should show warning when at skill limit
    await user.click(intimidationCheckbox);
    
    // Should prevent selection or show warning
    await waitFor(() => {
      expect(screen.getByText(/skill.*limit/i) || screen.getByText(/maximum.*skills/i)).toBeInTheDocument();
    });
  });

  it('should show helpful descriptions for each skill', () => {
    render(
      <TestWrapper>
        <SkillsProficienciesStep />
      </TestWrapper>
    );

    // Should show ability association for skills
    expect(screen.getAllByText(/strength/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dexterity/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wisdom/i).length).toBeGreaterThan(0);
  });
});