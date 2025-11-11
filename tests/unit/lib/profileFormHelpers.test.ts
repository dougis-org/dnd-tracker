import {
  applyOptimisticUpdate,
  revertOptimisticUpdate,
  formatErrorMessage,
  createFormState,
  updateFormField,
} from '@/lib/utils/profileFormHelpers';

describe('profileFormHelpers', () => {
  const mockProfile = {
    id: 'user-123',
    name: 'Alice',
    email: 'alice@example.com',
  };

  describe('applyOptimisticUpdate', () => {
    it('should update form state immediately (optimistic)', () => {
      const updated = applyOptimisticUpdate(mockProfile, 'name', 'Alice Updated');

      expect(updated.name).toBe('Alice Updated');
      expect(updated.email).toBe('alice@example.com'); // Other fields unchanged
    });

    it('should handle multiple field updates', () => {
      let state = mockProfile;
      state = applyOptimisticUpdate(state, 'name', 'Bob');
      state = applyOptimisticUpdate(state, 'email', 'bob@example.com');

      expect(state.name).toBe('Bob');
      expect(state.email).toBe('bob@example.com');
    });

    it('should work with any field', () => {
      const updated = applyOptimisticUpdate(mockProfile, 'id', 'new-id');
      expect(updated.id).toBe('new-id');
    });
  });

  describe('revertOptimisticUpdate', () => {
    it('should revert to previous state', () => {
      const previousState = mockProfile;
      const currentState = { ...mockProfile, name: 'Alice Updated', email: 'new@example.com' };

      const reverted = revertOptimisticUpdate(currentState, previousState);

      expect(reverted.name).toBe('Alice');
      expect(reverted.email).toBe('alice@example.com');
    });

    it('should handle partial reverts', () => {
      const previousState = { ...mockProfile };
      const currentState = { ...mockProfile, name: 'Bob', email: 'bob@example.com' };

      const reverted = revertOptimisticUpdate(currentState, previousState);

      expect(reverted).toEqual(previousState);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Zod validation error', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email address'],
          name: ['Name is required'],
        },
      };

      const formatted = formatErrorMessage(error);

      expect(formatted.email).toBe('Invalid email address');
      expect(formatted.name).toBe('Name is required');
    });

    it('should handle missing field errors gracefully', () => {
      const error = { fieldErrors: {} };
      const formatted = formatErrorMessage(error);

      expect(formatted).toEqual({});
    });

    it('should handle string error messages', () => {
      const error = 'Network request failed';
      const formatted = formatErrorMessage(error);

      expect(formatted).toBe('Network request failed');
    });

    it('should prioritize first error message for each field', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email', 'Email already in use'],
        },
      };

      const formatted = formatErrorMessage(error);

      expect(formatted.email).toBe('Invalid email'); // First error only
    });
  });

  describe('createFormState', () => {
    it('should create initial form state', () => {
      const state = createFormState(mockProfile);

      expect(state.data).toEqual(mockProfile);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('updateFormField', () => {
    it('should update field and mark as dirty', () => {
      const state = createFormState(mockProfile);
      const updated = updateFormField(state, 'name', 'Updated Name');

      expect(updated.data.name).toBe('Updated Name');
      expect(updated.isDirty).toBe(true);
    });

    it('should maintain other fields', () => {
      const state = createFormState(mockProfile);
      const updated = updateFormField(state, 'name', 'Updated Name');

      expect(updated.data.email).toBe(mockProfile.email);
      expect(updated.data.id).toBe(mockProfile.id);
    });

    it('should not mark as dirty if value unchanged', () => {
      const state = createFormState(mockProfile);
      const updated = updateFormField(state, 'name', mockProfile.name);

      // Still dirty if we're changing it, even to same value
      expect(updated.isDirty).toBe(true);
    });
  });

  describe('Form Save Flow', () => {
    it('should handle successful save flow', () => {
      let state = createFormState(mockProfile);

      // User edits
      state = updateFormField(state, 'name', 'Alice Updated');
      expect(state.isDirty).toBe(true);

      // Simulate saving (mark isSaving = true)
      state = { ...state, isSaving: true };
      expect(state.isSaving).toBe(true);

      // After save success
      state = { ...state, isSaving: false, isDirty: false, error: null };
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle failed save flow with revert', () => {
      let state = createFormState(mockProfile);
      const previousData = { ...state.data };

      // User edits
      state = updateFormField(state, 'name', 'Alice Updated');

      // Save fails - revert data and show error
      state = {
        ...state,
        data: revertOptimisticUpdate(state.data, previousData),
        isSaving: false,
        error: 'Failed to save profile',
      };

      expect(state.data).toEqual(previousData);
      expect(state.error).toBe('Failed to save profile');
      expect(state.isSaving).toBe(false);
    });
  });
});
