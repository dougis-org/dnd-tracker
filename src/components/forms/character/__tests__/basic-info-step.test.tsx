/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BasicInfoStep } from '../basic-info-step';
import { basicInfoSchema, type BasicInfoFormData } from '@/lib/validations/character';

// Test wrapper component that provides form context
function TestWrapper({ children, defaultValues = {} }: { 
  children: React.ReactNode; 
  defaultValues?: Partial<BasicInfoFormData>;
}) {
  const methods = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      race: '',
      background: '',
      alignment: '',
      experiencePoints: 0,
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

describe('BasicInfoStep', () => {
  it('should render all form fields', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Character Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Race *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subrace')).toBeInTheDocument();
    expect(screen.getByLabelText('Background *')).toBeInTheDocument();
    expect(screen.getByLabelText('Alignment *')).toBeInTheDocument();
    expect(screen.getByLabelText('Experience Points')).toBeInTheDocument();
  });

  it('should display field labels with proper accessibility', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/character name/i);
    const raceSelect = screen.getByLabelText(/race/i);
    
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(raceSelect).toHaveAttribute('aria-required', 'true');
  });

  it('should accept text input for character name', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/character name/i);
    await user.type(nameInput, 'Aragorn');
    
    expect(nameInput).toHaveValue('Aragorn');
  });

  it('should provide race dropdown options', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    // Find the race select by its trigger
    const raceSelectTrigger = screen.getByRole('combobox');
    expect(raceSelectTrigger).toHaveAttribute('aria-required', 'true');
    
    // Click to open dropdown
    await user.click(raceSelectTrigger);
    
    // Should show common D&D races in the options
    await waitFor(() => {
      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.getByText('Elf')).toBeInTheDocument();
      expect(screen.getByText('Dwarf')).toBeInTheDocument();
    });
  });

  it('should provide alignment dropdown options', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const alignmentSelect = screen.getByRole('combobox', { name: /alignment/i });
    await user.click(alignmentSelect);
    
    // Should show all 9 D&D alignments
    expect(screen.getByText('Lawful Good')).toBeInTheDocument();
    expect(screen.getByText('True Neutral')).toBeInTheDocument();
    expect(screen.getByText('Chaotic Evil')).toBeInTheDocument();
  });

  it('should make subrace optional', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const subraceSelect = screen.getByRole('combobox', { name: /subrace/i });
    expect(subraceSelect).not.toHaveAttribute('aria-required', 'true');
  });

  it('should accept numeric input for experience points', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByLabelText(/experience points/i);
    await user.type(xpInput, '1000');
    
    expect(xpInput).toHaveValue(1000);
  });

  it('should show validation errors for required fields', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/character name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/race is required/i)).toBeInTheDocument();
      expect(screen.getByText(/background is required/i)).toBeInTheDocument();
      expect(screen.getByText(/alignment is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/character name/i);
    await user.type(nameInput, 'test');
    await user.clear(nameInput);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/character name is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for name too long', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/character name/i);
    await user.type(nameInput, 'a'.repeat(51)); // Over 50 character limit
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/character name too long/i)).toBeInTheDocument();
    });
  });

  it('should prevent negative experience points', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByLabelText(/experience points/i);
    await user.type(xpInput, '-100');
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/experience points cannot be negative/i)).toBeInTheDocument();
    });
  });

  it('should populate form with existing data', () => {
    const existingData: BasicInfoFormData = {
      name: 'Legolas',
      race: 'Elf',
      subrace: 'Wood Elf',
      background: 'Outlander',
      alignment: 'Chaotic Good',
      experiencePoints: 500
    };

    render(
      <TestWrapper defaultValues={existingData}>
        <BasicInfoStep />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Legolas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    // Note: Select components would need additional testing for selected values
  });

  it('should have proper keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/character name/i);
    
    // Tab navigation should work
    await user.tab();
    expect(nameInput).toHaveFocus();
    
    await user.tab();
    const raceSelect = screen.getByRole('combobox', { name: /race/i });
    expect(raceSelect).toHaveFocus();
  });

  it('should show field descriptions for accessibility', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    expect(screen.getByText(/the name of your character/i)).toBeInTheDocument();
    expect(screen.getByText(/your character's race/i)).toBeInTheDocument();
    expect(screen.getByText(/your character's background/i)).toBeInTheDocument();
  });

  it('should format experience points input correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByLabelText(/experience points/i);
    await user.type(xpInput, '1.5'); // Should handle decimal input
    
    // Should convert to integer
    expect(xpInput).toHaveValue(1);
  });
});