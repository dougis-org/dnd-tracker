import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { CharacterFormInput } from '@/lib/validations/character';
import type { CharacterDraftType } from '@/models/schemas';

export interface CharacterDraft {
  _id: string;
  userId: string;
  name: string;
  formData: CharacterFormInput;
  createdAt: string;
  updatedAt: string;
}

export function useCharacterDraft() {
  const [drafts, setDrafts] = useState<CharacterDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user's drafts
  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/characters/drafts');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch drafts' }));
        throw new Error(errorData.error || 'Failed to fetch drafts');
      }
      
      const data = await response.json();
      setDrafts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch drafts';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a new draft
  const saveDraft = useCallback(async (formData: CharacterFormInput, name?: string): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/characters/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          name: name || formData.name || 'Unnamed Character',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save draft' }));
        throw new Error(errorData.error || 'Failed to save draft');
      }
      
      const newDraft = await response.json();
      setDrafts(prev => [newDraft, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Character draft saved successfully',
      });
      
      return newDraft;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing draft
  const updateDraft = useCallback(async (draftId: string, formData: CharacterFormInput, name?: string): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/characters/drafts/${draftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          name: name || formData.name || 'Unnamed Character',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update draft' }));
        throw new Error(errorData.error || 'Failed to update draft');
      }
      
      const updatedDraft = await response.json();
      setDrafts(prev => prev.map(draft => draft._id === draftId ? updatedDraft : draft));
      
      toast({
        title: 'Success',
        description: 'Character draft updated successfully',
      });
      
      return updatedDraft;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update draft';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a specific draft
  const loadDraft = useCallback(async (draftId: string): Promise<CharacterDraft | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/characters/drafts/${draftId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load draft' }));
        throw new Error(errorData.error || 'Failed to load draft');
      }
      
      const draft = await response.json();
      return draft;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load draft';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a draft
  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/characters/drafts/${draftId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete draft' }));
        throw new Error(errorData.error || 'Failed to delete draft');
      }
      
      setDrafts(prev => prev.filter(draft => draft._id !== draftId));
      
      toast({
        title: 'Success',
        description: 'Character draft deleted successfully',
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete draft';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save draft with debouncing
  const autoSaveDraft = useCallback((formData: CharacterFormInput, currentDraftId?: string, name?: string) => {
    const timeoutId = setTimeout(async () => {
      try {
        if (currentDraftId) {
          await updateDraft(currentDraftId, formData, name);
        } else {
          await saveDraft(formData, name);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    // Return cleanup function
    return () => clearTimeout(timeoutId);
  }, [updateDraft, saveDraft]);

  return {
    drafts,
    isLoading,
    error,
    fetchDrafts,
    saveDraft,
    updateDraft,
    loadDraft,
    deleteDraft,
    autoSaveDraft,
  };
}