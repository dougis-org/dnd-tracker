import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { ClassesStep } from '../classes-step';
import { DND_CLASSES } from '@/lib/validations/character';

// Mock react-hook-form
const mockForm = {
  control: {},
  watch: jest.fn(),
  setValue: jest.fn(),
  trigger: jest.fn(),
  getValues: jest.fn(),
  formState: { errors: {} }
};

jest.mock('react-hook-form', () => ({
  useFormContext: () => mockForm,
  Controller: ({ render }: any) => render({
    field: {
      value: [],
      onChange: jest.fn(),
      onBlur: jest.fn(),
      name: 'classes'
    }
  })
}));

// Mock form components
jest.mock('@/components/ui/form', () => ({
  FormField: ({ render }: any) => render({
    field: { onChange: jest.fn(), value: [] }
  }),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormDescription: ({ children }: any) => <div data-testid="form-description">{children}</div>,
  FormMessage: ({ children }: any) => <div data-testid="form-message">{children}</div>
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value}>
      <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

describe('ClassesStep', () => {
  beforeEach(() => {
    mockForm.watch.mockReturnValue([]);
    mockForm.getValues.mockReturnValue([]);
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<ClassesStep />);
    }).not.toThrow();
  });

  it('should render add class button when no classes exist', () => {
    // This test will fail until we create the component
    mockForm.watch.mockReturnValue([]);
    
    render(<ClassesStep />);
    
    expect(screen.getByRole('button', { name: /add class/i })).toBeInTheDocument();
  });

  it('should display existing classes', () => {
    const existingClasses = [
      { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 },
      { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 1 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    mockForm.getValues.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    // Check that classes are displayed in the form
    expect(screen.getAllByDisplayValue('5')[0]).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('3')[0]).toBeInTheDocument();
    expect(screen.getByText('Total Level: 8')).toBeInTheDocument();
  });

  it('should add a new class when add button is clicked', async () => {
    const user = userEvent.setup();
    mockForm.watch.mockReturnValue([]);
    
    render(<ClassesStep />);
    
    const addButton = screen.getByRole('button', { name: /add class/i });
    await user.click(addButton);
    
    expect(mockForm.setValue).toHaveBeenCalledWith('classes', [{
      className: '',
      level: 1,
      hitDiceSize: 8,
      hitDiceUsed: 0
    }]);
  });

  it('should remove a class when remove button is clicked', async () => {
    const user = userEvent.setup();
    const existingClasses = [
      { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 },
      { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 1 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    mockForm.getValues.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    const removeButtons = screen.getAllByRole('button', { name: /remove class/i });
    await user.click(removeButtons[0]);
    
    expect(mockForm.setValue).toHaveBeenCalledWith('classes', [
      { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 1 }
    ]);
  });

  it('should update class name when selection changes', async () => {
    const user = userEvent.setup();
    const existingClasses = [
      { className: '', level: 1, hitDiceSize: 8, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    const selectElement = screen.getByTestId('select').querySelector('select');
    if (selectElement) {
      await user.selectOptions(selectElement, 'Wizard');
    }
    
    expect(mockForm.setValue).toHaveBeenCalledWith('classes', [{
      className: 'Wizard',
      level: 1,
      hitDiceSize: 6, // Wizard uses d6 hit dice
      hitDiceUsed: 0
    }]);
  });

  it('should show all D&D classes in select dropdown', () => {
    const existingClasses = [
      { className: '', level: 1, hitDiceSize: 8, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    DND_CLASSES.forEach(className => {
      expect(screen.getByText(className)).toBeInTheDocument();
    });
  });

  it('should validate level input between 1-20', async () => {
    const user = userEvent.setup();
    const existingClasses = [
      { className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    const levelInput = screen.getByDisplayValue('1');
    
    // Test valid level
    await user.clear(levelInput);
    await user.type(levelInput, '10');
    expect(mockForm.setValue).toHaveBeenCalledWith('classes.0.level', 10);
    
    // Test invalid level (should not update)
    await user.clear(levelInput);
    await user.type(levelInput, '25');
    expect(mockForm.trigger).toHaveBeenCalledWith('classes');
  });

  it('should show subclass field when class is selected', () => {
    const existingClasses = [
      { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    expect(screen.getByLabelText(/subclass/i)).toBeInTheDocument();
  });

  it('should calculate and display total level', () => {
    const existingClasses = [
      { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 },
      { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 1 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    expect(screen.getByText(/total level: 8/i)).toBeInTheDocument();
  });

  it('should have accessible labels and ARIA attributes', () => {
    const existingClasses = [
      { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    // Check for accessible labels
    expect(screen.getByText('Class Name *')).toBeInTheDocument();
    expect(screen.getByText('Level *')).toBeInTheDocument();
    expect(screen.getByText('Subclass (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove class 1')).toBeInTheDocument();
  });

  it('should support keyboard navigation for class management', async () => {
    const user = userEvent.setup();
    
    render(<ClassesStep />);
    
    // Tab through add button
    const addButton = screen.getByRole('button', { name: /add class/i });
    addButton.focus();
    
    // Press Enter to add class
    await user.keyboard('{Enter}');
    expect(mockForm.setValue).toHaveBeenCalled();
  });

  it('should prevent removing the last class', () => {
    const existingClasses = [
      { className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }
    ];
    
    mockForm.watch.mockReturnValue(existingClasses);
    
    render(<ClassesStep />);
    
    // Remove button should be disabled for single class
    const removeButton = screen.getByRole('button', { name: /remove class/i });
    expect(removeButton).toBeDisabled();
  });
});