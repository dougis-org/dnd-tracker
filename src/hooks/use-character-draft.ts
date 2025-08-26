import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { CharacterFormInput } from '@/lib/validations/character';
import { useAutoSaveDraft } from './use-auto-save-draft';
import { 
  fetchAllDrafts, 
  createDraft, 
  updateDraft, 
  loadDraft, 
  deleteDraft,
  type CharacterDraft
} from '@/lib/api/character-draft-api';

export { type CharacterDraft } from '@/lib/api/character-draft-api';

export function useCharacterDraft() {
  const [drafts, setDrafts] = useState<CharacterDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { autoSaveDraft } = useAutoSaveDraft();

  const handleError = useCallback((error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : `Failed to ${context}`;
    setError(message);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, []);

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllDrafts();
      setDrafts(data);
    } catch (error) {
      handleError(error, 'fetch drafts');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const saveDraft = useCallback(async (
    formData: CharacterFormInput, 
    name?: string
  ): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newDraft = await createDraft(formData, name);
      setDrafts(prev => [newDraft, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Draft saved successfully',
      });
      
      return newDraft;
    } catch (error) {
      handleError(error, 'save draft');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateExistingDraft = useCallback(async (
    draftId: string, 
    formData: CharacterFormInput, 
    name?: string
  ): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedDraft = await updateDraft(draftId, formData, name);
      setDrafts(prev => prev.map(d => d._id === draftId ? updatedDraft : d));
      
      toast({
        title: 'Success',
        description: 'Draft updated successfully',
      });
      
      return updatedDraft;
    } catch (error) {
      handleError(error, 'update draft');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const loadExistingDraft = useCallback(async (draftId: string): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await loadDraft(draftId);
    } catch (error) {
      handleError(error, 'load draft');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const removeExistingDraft = useCallback(async (draftId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d._id !== draftId));
      
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      
      return true;
    } catch (error) {
      handleError(error, 'delete draft');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    drafts,
    isLoading,
    error,
    fetchDrafts,
    saveDraft,
    updateDraft: updateExistingDraft,
    loadDraft: loadExistingDraft,
    deleteDraft: removeExistingDraft,
    autoSaveDraft
  };
}