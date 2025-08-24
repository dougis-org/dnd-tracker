/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiStepForm } from '../multi-step-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

describe('MultiStepForm', () => {
  const mockSteps = [
    {
      title: 'Basic Info',
      description: 'Character name and background',
      component: () => <div data-testid="step-1">Step 1 Content</div>
    },
    {
      title: 'Abilities',
      description: 'Character ability scores',
      component: () => <div data-testid="step-2">Step 2 Content</div>
    },
    {
      title: 'Equipment',
      description: 'Character equipment and items',
      component: () => <div data-testid="step-3">Step 3 Content</div>
    }
  ];

  const defaultProps = {
    steps: mockSteps,
    onComplete: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the first step by default', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.queryByTestId('step-2')).not.toBeInTheDocument();
  });

  it('should display step progress indicator', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('should show step navigation buttons', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    // First step should not have previous button
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should navigate to next step when Next is clicked', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Abilities')).toBeInTheDocument();
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('should navigate to previous step when Previous is clicked', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    // Go to second step first
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    
    // Then go back
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('should show Complete button on last step', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    // Navigate to last step
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    
    expect(screen.getByTestId('step-3')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('should call onComplete when Complete button is clicked', () => {
    const onComplete = jest.fn();
    render(<MultiStepForm {...defaultProps} onComplete={onComplete} />);
    
    // Navigate to last step and click Complete
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Complete'));
    
    expect(onComplete).toHaveBeenCalled();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<MultiStepForm {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(onCancel).toHaveBeenCalled();
  });

  it('should display step descriptions', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    expect(screen.getByText('Character name and background')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Character ability scores')).toBeInTheDocument();
  });

  it('should render accessibility attributes', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    const stepContainer = screen.getByRole('main');
    expect(stepContainer).toHaveAttribute('aria-live', 'polite');
    
    const progressIndicator = screen.getByText('Step 1 of 3');
    expect(progressIndicator).toHaveAttribute('aria-label', 'Progress: step 1 of 3');
  });

  it('should handle keyboard navigation', () => {
    render(<MultiStepForm {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    
    // Focus and press Enter
    nextButton.focus();
    fireEvent.keyDown(nextButton, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
  });

  it('should validate step transitions when validator is provided', () => {
    const validator = jest.fn().mockReturnValue(false);
    const propsWithValidator = {
      ...defaultProps,
      validateStep: validator
    };
    
    render(<MultiStepForm {...propsWithValidator} />);
    
    fireEvent.click(screen.getByText('Next'));
    
    // Should not advance if validation fails
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(validator).toHaveBeenCalledWith(0);
  });

  it('should advance when validation passes', () => {
    const validator = jest.fn().mockReturnValue(true);
    const propsWithValidator = {
      ...defaultProps,
      validateStep: validator
    };
    
    render(<MultiStepForm {...propsWithValidator} />);
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    expect(validator).toHaveBeenCalledWith(0);
  });

  it('should handle custom step component props', () => {
    const stepWithProps = {
      title: 'Custom Step',
      description: 'A custom step',
      component: ({ customProp }: { customProp: string }) => (
        <div data-testid="custom-step">{customProp}</div>
      )
    };

    const propsWithCustomStep = {
      ...defaultProps,
      steps: [stepWithProps],
      stepComponentProps: { customProp: 'Custom Value' }
    };
    
    render(<MultiStepForm {...propsWithCustomStep} />);
    
    expect(screen.getByText('Custom Value')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<MultiStepForm {...defaultProps} isLoading={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should allow starting from a specific step', () => {
    render(<MultiStepForm {...defaultProps} initialStep={1} />);
    
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });
});