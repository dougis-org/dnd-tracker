/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharacterDraft } from '../use-character-draft';
import type { CharacterFormInput } from '@/lib/validations/character';

// Mock fetch
global.fetch = jest.fn();

// Mock console.log to avoid noise in tests
console.log = jest.fn();

describe('useCharacterDraft', () => {
  const mockFormData: CharacterFormInput = {
    name: 'Test Character',
    race: 'Human',
    background: 'Acolyte',
    alignment: 'Neutral Good',
    classes: [
      {
        className: 'Fighter',
        level: 1,
        hitDiceSize: 10,
        hitDiceUsed: 0
      }
    ],
    abilities: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    },
    skillProficiencies: ['Athletics', 'Intimidation'],
    savingThrowProficiencies: ['Strength', 'Constitution'],
    hitPoints: { maximum: 11, current: 11, temporary: 0 },
    armorClass: 16,
    speed: 30,
    initiative: 2,
    passivePerception: 10,
    spellcasting: {
      ability: undefined,
      spellAttackBonus: 0,
      spellSaveDC: 8
    },
    notes: 'Test character for draft functionality'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useCharacterDraft());

    expect(result.current.drafts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should save a new draft', async () => {
    const mockDraft = {
      _id: 'draft-123',
      userId: 'user-123',
      name: 'Test Character',
      formData: mockFormData,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDraft)
    });

    const { result } = renderHook(() => useCharacterDraft());

    let savedDraft: any;
    await act(async () => {
      savedDraft = await result.current.saveDraft(mockFormData);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/characters/drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: mockFormData,
        name: 'Test Character',
      }),
    });

    expect(savedDraft).toEqual(mockDraft);
    expect(result.current.drafts).toContainEqual(mockDraft);
  });

  it('should update an existing draft', async () => {
    const draftId = 'draft-123';
    const updatedMockData = { ...mockFormData, name: 'Updated Character' };
    const mockUpdatedDraft = {
      _id: draftId,
      userId: 'user-123',
      name: 'Updated Character',
      formData: updatedMockData,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T01:00:00Z'
    };

    // First add a draft to the list
    const initialDraft = {
      _id: draftId,
      userId: 'user-123',
      name: 'Test Character',
      formData: mockFormData,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const { result } = renderHook(() => useCharacterDraft());
    
    // Add initial draft
    act(() => {
      result.current.drafts.push(initialDraft);
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUpdatedDraft)
    });

    let updatedDraft: any;
    await act(async () => {
      updatedDraft = await result.current.updateDraft(draftId, updatedMockData, 'Updated Character');
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/characters/drafts/${draftId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: updatedMockData,
        name: 'Updated Character',
      }),
    });

    expect(updatedDraft).toEqual(mockUpdatedDraft);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    });

    const { result } = renderHook(() => useCharacterDraft());

    let savedDraft: any;
    await act(async () => {
      savedDraft = await result.current.saveDraft(mockFormData);
    });

    expect(savedDraft).toBeNull();
    expect(result.current.error).toBe('Internal server error');
  });

  it('should create auto-save cleanup function', () => {
    const { result } = renderHook(() => useCharacterDraft());

    const cleanup = result.current.autoSaveDraft(mockFormData);
    
    expect(typeof cleanup).toBe('function');
    
    // Calling cleanup should not throw
    expect(() => cleanup()).not.toThrow();
  });

  it('should fetch all drafts', async () => {
    const mockDrafts = [
      {
        _id: 'draft-1',
        userId: 'user-123',
        name: 'Character 1',
        formData: mockFormData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: 'draft-2',
        userId: 'user-123',
        name: 'Character 2',
        formData: mockFormData,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDrafts)
    });

    const { result } = renderHook(() => useCharacterDraft());

    await act(async () => {
      await result.current.fetchDrafts();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/characters/drafts');
    expect(result.current.drafts).toEqual(mockDrafts);
  });

  it('should delete a draft via API', async () => {
    const draftId = 'draft-123';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Draft deleted successfully' })
    });

    const { result } = renderHook(() => useCharacterDraft());

    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteDraft(draftId);
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/characters/drafts/${draftId}`, {
      method: 'DELETE'
    });

    expect(deleteResult).toBe(true);
  });
});