import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCharacterDraft } from '@/hooks/use-character-draft';
import { characterFormSchema, type CharacterFormInput } from '@/lib/validations/character';

interface UseCharacterFormProps {
  draftId?: string;
  onComplete?: (character: { id: string }) => void;
  onCancel?: () => void;
}

export function useCharacterForm({ draftId, onComplete, onCancel }: UseCharacterFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const { loadDraft, saveDraft, updateDraft, autoSaveDraft } = useCharacterDraft();

  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: '',
      race: '',
      background: '',
      alignment: '',
      experiencePoints: 0,
      classes: [{ 
        className: '', 
        level: 1, 
        hitDiceSize: 8, 
        hitDiceUsed: 0 
      }],
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
      spellcasting: {
        ability: 'intelligence' as const,
        spellSaveDC: 8,
        spellAttackBonus: 0,
        spellsKnown: [],
        spellsPrepared: [],
        spellSlots: {}
      },
      equipment: [],
      features: [],
      notes: ''
    }
  });

  const loadExistingDraft = useCallback(async () => {
    if (draftId) {
      try {
        const draft = await loadDraft(draftId);
        if (draft) {
          form.reset(draft.formData);
          setCurrentDraftId(draft._id);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        setError('Failed to load draft');
      }
    }
  }, [draftId, loadDraft, form]);

  useEffect(() => {
    loadExistingDraft();
  }, [loadExistingDraft]);

  // Auto-save functionality
  useEffect(() => {
    const formData = form.watch();
    
    if (autoSaveEnabled && formData.name && formData.name.trim()) {
      const cleanup = autoSaveDraft(formData, currentDraftId, formData.name);
      return cleanup;
    }
  }, [form, autoSaveDraft, currentDraftId, autoSaveEnabled]);

  const handleSaveDraft = useCallback(async () => {
    const currentFormData = form.getValues();
    if (!currentFormData.name || !currentFormData.name.trim()) {
      setError('Character name is required to save draft');
      return;
    }

    try {
      setError(null);
      let result;
      
      if (currentDraftId) {
        result = await updateDraft(currentDraftId, currentFormData, currentFormData.name);
      } else {
        result = await saveDraft(currentFormData, currentFormData.name);
      }
      
      if (result && !currentDraftId) {
        setCurrentDraftId(result._id);
      }
    } catch (error) {
      setError('Failed to save draft');
      console.error('Save draft error:', error);
    }
  }, [form, currentDraftId, updateDraft, saveDraft]);

  const handleSubmit = useCallback(async (data: CharacterFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create character' }));
        throw new Error(errorData.error || 'Failed to create character');
      }

      const character = await response.json();
      
      if (onComplete) {
        onComplete(character);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  return {
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
  };
}