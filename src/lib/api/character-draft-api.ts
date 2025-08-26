import type { CharacterFormInput } from '@/lib/validations/character';

export interface CharacterDraft {
  _id: string;
  userId: string;
  name: string;
  formData: CharacterFormInput;
  createdAt: string;
  updatedAt: string;
}

class CharacterDraftApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CharacterDraftApiError';
  }
}

async function handleResponse<T>(response: Response, defaultError: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: defaultError }));
    throw new CharacterDraftApiError(errorData.error || defaultError, response.status);
  }
  return await response.json();
}

export async function fetchAllDrafts(): Promise<CharacterDraft[]> {
  const response = await fetch('/api/characters/drafts');
  return handleResponse(response, 'Failed to fetch drafts');
}

export async function createDraft(formData: CharacterFormInput, name?: string): Promise<CharacterDraft> {
  const response = await fetch('/api/characters/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      formData, 
      name: name || formData.name || 'Unnamed Character' 
    })
  });
  
  return handleResponse(response, 'Failed to save draft');
}

export async function updateDraft(draftId: string, formData: CharacterFormInput, name?: string): Promise<CharacterDraft> {
  const response = await fetch(`/api/characters/drafts/${draftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      formData, 
      name: name || formData.name || 'Unnamed Character' 
    })
  });
  
  return handleResponse(response, 'Failed to update draft');
}

export async function loadDraft(draftId: string): Promise<CharacterDraft> {
  const response = await fetch(`/api/characters/drafts/${draftId}`);
  return handleResponse(response, 'Failed to load draft');
}

export async function deleteDraft(draftId: string): Promise<void> {
  const response = await fetch(`/api/characters/drafts/${draftId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete draft' }));
    throw new CharacterDraftApiError(errorData.error || 'Failed to delete draft', response.status);
  }
}