import {
  applyOptimisticUpdate,
  revertOptimisticUpdate,
  formatErrorMessage,
  createFormState,
  updateFormField,
  markSaving,
  markSaveSuccess,
  markSaveError,
  resetForm,
  getFieldError,
  isFormValid,
  getValidationSummary,
} from '@/lib/utils/profileFormHelpers';

// Test fixtures and helper functions
const mockProfile = {
  id: 'user-123',
  name: 'Alice',
  email: 'alice@example.com',
};

const createTestState = (profile = mockProfile) => createFormState(profile);

const createUpdatedState = (profile = mockProfile, field: keyof typeof profile, value: string) => {
  const state = createFormState(profile);
  return updateFormField(state, field, value);
};

describe('profileFormHelpers - Optimistic Updates', () => {
  describe('applyOptimisticUpdate', () => {
    it('should update specified field', () => {
      const updated = applyOptimisticUpdate(mockProfile, 'name', 'Alice Updated');
      expect(updated.name).toBe('Alice Updated');
    });

    it('should preserve other fields', () => {
      const updated = applyOptimisticUpdate(mockProfile, 'name', 'Bob');
      expect(updated.email).toBe('alice@example.com');
      expect(updated.id).toBe('user-123');
    });

    it.each(['id', 'name', 'email'])('should handle field %s update', (field) => {
      const testValue = field === 'id' ? 'new-id' : field === 'name' ? 'Bob' : 'bob@example.com';
      const updated = applyOptimisticUpdate(mockProfile, field as keyof typeof mockProfile, testValue);
      expect(updated[field as keyof typeof mockProfile]).toBe(testValue);
    });
  });

  describe('revertOptimisticUpdate', () => {
    it('should restore previous state', () => {
      const prev = mockProfile;
      const current = { ...mockProfile, name: 'Alice Updated' };
      const reverted = revertOptimisticUpdate(current, prev);
      expect(reverted).toEqual(prev);
    });
  });
});

describe('profileFormHelpers - Error Formatting', () => {
  describe('formatErrorMessage', () => {
    it('should format Zod validation errors', () => {
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

    it('should handle string errors', () => {
      const error = 'Network failed';
      const formatted = formatErrorMessage(error);
      expect(formatted).toBe('Network failed');
    });

    it('should handle empty field errors', () => {
      const error = { fieldErrors: {} };
      const formatted = formatErrorMessage(error);
      expect(formatted).toEqual({});
    });

    it('should use first error message per field', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email', 'Email exists'],
        },
      };
      const formatted = formatErrorMessage(error);
      expect(formatted.email).toBe('Invalid email');
    });
  });
});

describe('profileFormHelpers - Form State Creation', () => {
  describe('createFormState', () => {
    it('should initialize form state with defaults', () => {
      const state = createFormState(mockProfile);
      expect(state.data).toEqual(mockProfile);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('updateFormField', () => {
    it('should update field and mark dirty', () => {
      const state = createTestState();
      const updated = updateFormField(state, 'name', 'Updated Name');
      expect(updated.data.name).toBe('Updated Name');
      expect(updated.isDirty).toBe(true);
    });

    it('should preserve other fields when updating', () => {
      const state = createTestState();
      const updated = updateFormField(state, 'name', 'Updated');
      expect(updated.data.email).toBe(mockProfile.email);
      expect(updated.data.id).toBe(mockProfile.id);
    });
  });
});

describe('profileFormHelpers - Save State Transitions', () => {
  describe('markSaving', () => {
    it('should set isSaving to true and clear error', () => {
      const state = createUpdatedState();
      state.error = 'Previous error';
      const savingState = markSaving(state);
      expect(savingState.isSaving).toBe(true);
      expect(savingState.error).toBeNull();
      expect(savingState.data).toEqual(state.data);
    });
  });

  describe('markSaveSuccess', () => {
    it('should clear dirty flag and set new data', () => {
      const newData = { ...mockProfile, name: 'Alice Updated' };
      const state = createUpdatedState(mockProfile, 'name', 'Alice Updated');
      const successState = markSaveSuccess(state, newData);
      expect(successState.data).toEqual(newData);
      expect(successState.isDirty).toBe(false);
      expect(successState.isSaving).toBe(false);
      expect(successState.error).toBeNull();
    });
  });

  describe('markSaveError', () => {
    it('should set error message and clear isSaving', () => {
      let state = createUpdatedState();
      state = { ...state, isSaving: true };
      const errorState = markSaveError(state, 'Network error');
      expect(errorState.error).toBe('Network error');
      expect(errorState.isSaving).toBe(false);
      expect(errorState.data).toEqual(state.data);
    });

    it('should revert data when provided', () => {
      const prev = { ...mockProfile };
      const state = createUpdatedState();
      const errorState = markSaveError(state, 'Save failed', prev);
      expect(errorState.data).toEqual(prev);
      expect(errorState.error).toBe('Save failed');
    });
  });

  describe('resetForm', () => {
    it('should reset form to original state', () => {
      const originalData = { ...mockProfile };
      const state = createUpdatedState();
      state.error = 'Some error';
      state.isSaving = true;
      const resetState = resetForm(state, originalData);
      expect(resetState.data).toEqual(originalData);
      expect(resetState.isDirty).toBe(false);
      expect(resetState.isSaving).toBe(false);
      expect(resetState.error).toBeNull();
    });
  });
});

describe('profileFormHelpers - Field Error Handling', () => {
  describe('getFieldError', () => {
    it('should return error for specific field', () => {
      const errors = { name: 'Name is required', email: 'Invalid email' };
      const error = getFieldError(errors, 'name');
      expect(error).toBe('Name is required');
    });

    it('should return null if field has no error', () => {
      const errors = { email: 'Invalid email' };
      const error = getFieldError(errors, 'name');
      expect(error).toBeNull();
    });

    it('should return null if errors is null', () => {
      const error = getFieldError(null, 'name');
      expect(error).toBeNull();
    });

    it('should return null if errors is a string', () => {
      const error = getFieldError('Network error', 'name');
      expect(error).toBeNull();
    });
  });
});

describe('profileFormHelpers - Form Validation', () => {
  describe('isFormValid', () => {
    it('should return false if form is saving', () => {
      let state = createTestState();
      state = { ...state, isDirty: true, isSaving: true };
      expect(isFormValid(state, {})).toBe(false);
    });

    it('should return false if form is not dirty', () => {
      const state = createTestState();
      expect(isFormValid(state, {})).toBe(false);
    });

    it('should return false if there are errors', () => {
      let state = createTestState();
      state = { ...state, isDirty: true };
      const errors = { name: 'Name is required' };
      expect(isFormValid(state, errors)).toBe(false);
    });

    it('should return true if form is dirty with no errors', () => {
      let state = createTestState();
      state = { ...state, isDirty: true };
      expect(isFormValid(state, {})).toBe(true);
    });
  });

  describe('getValidationSummary', () => {
    it('should return string error as-is', () => {
      const summary = getValidationSummary('Network error');
      expect(summary).toBe('Network error');
    });

    it('should return first error from field errors', () => {
      const errors = { name: 'Name is required', email: 'Invalid email' };
      const summary = getValidationSummary(errors);
      expect(summary).toBe('Name is required');
    });

    it('should return default message when no errors', () => {
      const summary = getValidationSummary({});
      expect(summary).toBe('Please fix the errors above');
    });
  });
});
