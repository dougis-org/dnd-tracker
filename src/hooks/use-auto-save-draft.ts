import { useCallback, useRef } from 'react';
import type { CharacterFormInput } from '@/lib/validations/character';
import { updateDraft, createDraft } from '@/lib/api/character-draft-api';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

export function useAutoSaveDraft() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSaveDraft = useCallback((
    formData: CharacterFormInput, 
    currentDraftId?: string, 
    name?: string
  ) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        if (currentDraftId) {
          await updateDraft(currentDraftId, formData, name);
        } else {
          await createDraft(formData, name);
        }
        // Auto-save successful - could emit an event or callback here if needed
      } catch (error) {
        // Silent auto-save failure - don't show errors for auto-save
        console.warn('Auto-save failed:', error);
      }
    }, AUTO_SAVE_DELAY);

    // Return cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { autoSaveDraft, cleanup };
}