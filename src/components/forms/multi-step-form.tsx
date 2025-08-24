"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormStep {
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: () => void;
  onCancel: () => void;
  validateStep?: (stepIndex: number) => boolean;
  isLoading?: boolean;
  initialStep?: number;
  stepComponentProps?: Record<string, any>;
  className?: string;
}

export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  validateStep,
  isLoading = false,
  initialStep = 0,
  stepComponentProps = {},
  className
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleNext = useCallback(() => {
    // Validate current step if validator is provided
    if (validateStep && !validateStep(currentStep)) {
      return;
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

  const handleComplete = useCallback(() => {
    // Validate final step if validator is provided
    if (validateStep && !validateStep(currentStep)) {
      return;
    }
    onComplete();
  }, [currentStep, validateStep, onComplete]);

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
              disabled={isLoading}
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
            disabled={isLoading}
            aria-label="Cancel form"
          >
            Cancel
          </Button>
          
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleComplete}
              onKeyDown={(e) => handleKeyDown(e, handleComplete)}
              disabled={isLoading}
              aria-label="Complete form submission"
            >
              {isLoading ? 'Completing...' : 'Complete'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              onKeyDown={(e) => handleKeyDown(e, handleNext)}
              disabled={isLoading}
              aria-label="Go to next step"
            >
              {isLoading ? 'Loading...' : 'Next'}
            </Button>
          )}
        </div>
      </div>

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