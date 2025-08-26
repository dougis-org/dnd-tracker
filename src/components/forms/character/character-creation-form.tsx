"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { MultiStepForm } from '../multi-step-form';
import { useCharacterForm } from './use-character-form';
import { useCharacterFormSteps } from './use-character-form-steps';

interface CharacterCreationFormProps {
  onComplete?: (character: { id: string }) => void;
  onCancel?: () => void;
  draftId?: string; // If editing an existing draft
}

export function CharacterCreationForm({ onComplete, onCancel, draftId }: CharacterCreationFormProps) {
  const router = useRouter();
  
  const {
    form,
    isSubmitting,
    error,
    currentDraftId,
    autoSaveEnabled,
    setAutoSaveEnabled,
    handleSaveDraft,
    handleSubmit,
    handleCancel,
    setError
  } = useCharacterForm({ draftId, onComplete, onCancel });

  const steps = useCharacterFormSteps(form);

  const validateStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.validate) {
      return await step.validate();
    }
    return true;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {currentDraftId && (
              <div className="text-sm text-gray-500">
                Draft saved
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-save drafts
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>

        <MultiStepForm
          steps={steps}
          validateStep={validateStep}
          onSubmit={form.handleSubmit(handleSubmit as any)}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}