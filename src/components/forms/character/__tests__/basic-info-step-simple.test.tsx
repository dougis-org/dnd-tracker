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
  it('should render basic form structure', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    // Check that essential labels are present
    expect(screen.getByText('Character Name *')).toBeInTheDocument();
    expect(screen.getByText('Race *')).toBeInTheDocument();
    expect(screen.getByText('Subrace')).toBeInTheDocument();
    expect(screen.getByText('Background *')).toBeInTheDocument();
    expect(screen.getByText('Alignment *')).toBeInTheDocument();
    expect(screen.getByText('Experience Points')).toBeInTheDocument();
  });

  it('should accept character name input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByRole('textbox', { name: /character name/i });
    await user.type(nameInput, 'Aragorn');
    
    expect(nameInput).toHaveValue('Aragorn');
  });

  it('should accept experience points input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByRole('spinbutton', { name: /experience points/i });
    await user.type(xpInput, '1000');
    
    expect(xpInput).toHaveValue(1000);
  });

  it('should show field descriptions', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    expect(screen.getByText(/the name of your character/i)).toBeInTheDocument();
    expect(screen.getByText(/your character's race/i)).toBeInTheDocument();
    expect(screen.getByText(/your character's background/i)).toBeInTheDocument();
  });

  it('should show form completion hints', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    expect(screen.getByText(/getting started/i)).toBeInTheDocument();
    expect(screen.getByText(/required fields are marked/i)).toBeInTheDocument();
  });

  it('should populate form with existing data', () => {
    const existingData: BasicInfoFormData = {
      name: 'Legolas',
      race: 'Elf',
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
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByRole('textbox', { name: /character name/i });
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(nameInput).toHaveAttribute('maxlength', '50');

    const xpInput = screen.getByRole('spinbutton', { name: /experience points/i });
    expect(xpInput).toHaveAttribute('min', '0');
  });

  it('should enforce character name length limit', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const nameInput = screen.getByRole('textbox', { name: /character name/i });
    
    // Try to type more than 50 characters
    const longName = 'a'.repeat(60);
    await user.type(nameInput, longName);
    
    // Should be limited to 50 characters
    expect(nameInput.value.length).toBeLessThanOrEqual(50);
  });

  it('should handle non-negative experience points', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByRole('spinbutton', { name: /experience points/i });
    
    // Start fresh - ensure the input starts at 0
    expect(xpInput).toHaveValue(0);
    
    // Test direct input change with negative value
    fireEvent.change(xpInput, { target: { value: '-100' } });
    
    // The onChange handler should have converted negative to 0
    await waitFor(() => {
      expect(xpInput).toHaveValue(0);
    });
    
    // Test onBlur with invalid negative input
    fireEvent.change(xpInput, { target: { value: '50' } }); // Set to positive first
    expect(xpInput).toHaveValue(50);
    
    fireEvent.change(xpInput, { target: { value: '-25' } }); // Then set negative
    fireEvent.blur(xpInput); // Trigger onBlur
    
    await waitFor(() => {
      expect(xpInput).toHaveValue(0);
    });
    
    // Test positive values work normally
    fireEvent.change(xpInput, { target: { value: '500' } });
    expect(xpInput).toHaveValue(500);
  });

  it('should convert decimal experience points to integers', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>
    );

    const xpInput = screen.getByRole('spinbutton', { name: /experience points/i });
    await user.clear(xpInput);
    await user.type(xpInput, '1.7');
    fireEvent.blur(xpInput);
    
    await waitFor(() => {
      expect(xpInput).toHaveValue(1);
    });
  });
});