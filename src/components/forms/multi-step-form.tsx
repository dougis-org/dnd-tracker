"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormStep {
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validate?: () => boolean | Promise<boolean>;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onComplete?: () => void;
  onSubmit?: (data: any) => void | Promise<void>;
  onCancel: () => void;
  validateStep?: (stepIndex: number) => boolean | Promise<boolean>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  initialStep?: number;
  stepComponentProps?: Record<string, any>;
  className?: string;
  submitLabel?: string;
  submittingLabel?: string;
  error?: string | null;
  form?: any;
}

export function MultiStepForm({
  steps,
  onComplete,
  onSubmit,
  onCancel,
  validateStep,
  isLoading = false,
  isSubmitting = false,
  initialStep = 0,
  stepComponentProps = {},
  className,
  submitLabel = "Complete",
  submittingLabel = "Submitting...",
  error,
  form
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleNext = useCallback(async () => {
    // Validate current step if validator is provided
    if (validateStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        return;
      }
    }

    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, isLastStep, validateStep]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleComplete = useCallback(async () => {
    // Validate final step if validator is provided
    if (validateStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        return;
      }
    }
    
    if (onSubmit && form) {
      // Handle form submission
      const formData = form.getValues();
      await onSubmit(formData);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentStep, validateStep, onComplete, onSubmit, form]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  if (!currentStepData) {
    return null;
  }

  const StepComponent = currentStepData.component;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="text-sm text-muted-foreground"
            aria-label={`Progress: step ${currentStep + 1} of ${steps.length}`}
          >
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-200 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label={`Step ${currentStep + 1} of ${steps.length} completed`}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <main 
            aria-live="polite"
            aria-busy={isLoading}
            role="main"
          >
            <StepComponent 
              {...stepComponentProps}
              stepIndex={currentStep}
              totalSteps={steps.length}
              isActive={true}
            />
          </main>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              onKeyDown={(e) => handleKeyDown(e, handlePrevious)}
              disabled={isLoading || isSubmitting}
              aria-label="Go to previous step"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            onKeyDown={(e) => handleKeyDown(e, onCancel)}
            disabled={isLoading || isSubmitting}
            aria-label="Cancel form"
          >
            Cancel
          </Button>
          
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleComplete}
              onKeyDown={(e) => handleKeyDown(e, handleComplete)}
              disabled={isLoading || isSubmitting}
              aria-label="Complete form submission"
            >
              {(isLoading || isSubmitting) ? submittingLabel : submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              onKeyDown={(e) => handleKeyDown(e, handleNext)}
              disabled={isLoading || isSubmitting}
              aria-label="Go to next step"
            >
              {isLoading ? 'Loading...' : 'Next'}
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-destructive/15 border border-destructive rounded-md" role="alert">
          <p className="text-sm text-destructive font-medium">
            {error}
          </p>
        </div>
      )}

      {/* Screen Reader Navigation Hints */}
      <div className="sr-only" aria-live="polite">
        Currently on {currentStepData.title}: {currentStepData.description}
        {!isFirstStep && '. Press Shift+Tab to go to Previous button'}
        {!isLastStep && '. Press Tab to go to Next button'}
        {isLastStep && '. Press Tab to go to Complete button'}
      </div>
    </div>
  );
}