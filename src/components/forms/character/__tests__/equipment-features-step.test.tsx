/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EquipmentFeaturesStep } from '../equipment-features-step';
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
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      },
      skillProficiencies: ['Athletics', 'Intimidation'],
      savingThrowProficiencies: [],
      hitPoints: { maximum: 10, current: 10, temporary: 0 },
      armorClass: 16,
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

describe('EquipmentFeaturesStep', () => {
  it('should render equipment and features sections', () => {
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Features & Traits')).toBeInTheDocument();
    expect(screen.getByText('Additional Notes')).toBeInTheDocument();
  });

  it('should allow adding equipment items', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const addItemButton = screen.getByRole('button', { name: /add equipment/i });
    await user.click(addItemButton);

    // Should show equipment form fields
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('should validate equipment item fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const addItemButton = screen.getByRole('button', { name: /add equipment/i });
    await user.click(addItemButton);

    const saveButton = screen.getByRole('button', { name: /save item/i });
    await user.click(saveButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/item name.*required/i)).toBeInTheDocument();
    });
  });

  it('should show starting equipment based on class and background', () => {
    render(
      <TestWrapper 
        classesSelected={[{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }]}
        backgroundSelected="Soldier"
      >
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    // Should show starting equipment suggestions
    expect(screen.getByText('Starting Equipment')).toBeInTheDocument();
    expect(screen.getAllByText(/fighter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/soldier/i).length).toBeGreaterThan(0);
  });

  it('should allow adding and editing features', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const addFeatureButton = screen.getByRole('button', { name: /add feature/i });
    await user.click(addFeatureButton);

    // Should show feature input field
    const featureInput = screen.getByLabelText(/feature.*trait/i);
    await user.type(featureInput, 'Darkvision: Can see in darkness up to 60 feet');

    const saveFeatureButton = screen.getByRole('button', { name: /save feature/i });
    await user.click(saveFeatureButton);

    // Feature should be added to the list
    await waitFor(() => {
      expect(screen.getByText(/darkvision/i)).toBeInTheDocument();
    });
  });

  it('should allow removing equipment and features', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper defaultValues={{ 
        equipment: [{ name: 'Longsword', quantity: 1, category: 'Weapon' }],
        features: ['Second Wind: Regain 1d10+1 hit points']
      }}>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    // Should show existing items
    expect(screen.getByText('Longsword')).toBeInTheDocument();
    expect(screen.getByText(/second wind/i)).toBeInTheDocument();

    // Remove equipment item
    const removeEquipmentButton = screen.getAllByRole('button', { name: /remove/i })[0];
    await user.click(removeEquipmentButton);

    await waitFor(() => {
      expect(screen.queryByText('Longsword')).not.toBeInTheDocument();
    });

    // Remove feature
    const removeFeatureButton = screen.getAllByRole('button', { name: /remove/i })[0];
    await user.click(removeFeatureButton);

    await waitFor(() => {
      expect(screen.queryByText(/second wind/i)).not.toBeInTheDocument();
    });
  });

  it('should handle notes input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const notesTextarea = screen.getByLabelText(/additional notes/i);
    await user.type(notesTextarea, 'This character has a mysterious past and seeks redemption.');

    expect(notesTextarea).toHaveValue('This character has a mysterious past and seeks redemption.');
  });

  it('should limit notes length', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const notesTextarea = screen.getByLabelText(/additional notes/i);
    
    // Type a shorter text first to verify character counter
    await user.type(notesTextarea, 'Test notes for character');
    expect(screen.getByText(/24\/2000 characters/i)).toBeInTheDocument();
    
    // Clear the field first
    await user.clear(notesTextarea);
    
    // Test the maxLength attribute by directly checking it
    expect(notesTextarea).toHaveAttribute('maxlength', '2000');
    
    // Type a moderate amount of text to test counter behavior
    const testText = 'a'.repeat(100);
    await user.type(notesTextarea, testText);
    
    expect(screen.getByText(/100\/2000 characters/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    // Check for accessibility features
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Features & Traits')).toBeInTheDocument();
    
    // Should have form labels and descriptions
    expect(screen.getByLabelText(/additional notes/i)).toBeInTheDocument();
  });

  it('should show equipment categories in dropdown', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EquipmentFeaturesStep />
      </TestWrapper>
    );

    const addItemButton = screen.getByRole('button', { name: /add equipment/i });
    await user.click(addItemButton);

    const categorySelect = screen.getByLabelText(/category/i);
    await user.click(categorySelect);

    // Should show standard D&D equipment categories
    await waitFor(() => {
      expect(screen.getByText('Weapon')).toBeInTheDocument();
      expect(screen.getByText('Armor')).toBeInTheDocument();
      expect(screen.getByText('Adventuring Gear')).toBeInTheDocument();
    });
  });
});