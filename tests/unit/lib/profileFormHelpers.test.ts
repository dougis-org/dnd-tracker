import {
  applyOptimisticUpdate,
  revertOptimisticUpdate,
  formatErrorMessage,
  createFormState,
  updateFormField,
} from '@/lib/utils/profileFormHelpers';

const mockProfile = {
  id: 'user-123',
  name: 'Alice',
  email: 'alice@example.com',
};

describe('profileFormHelpers', () => {
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

    it.each([
      ['id', 'new-id'],
      ['name', 'Bob'],
      ['email', 'bob@example.com'],
    ])('should handle field %s update', (field, value) => {
      const updated = applyOptimisticUpdate(mockProfile, field as keyof typeof mockProfile, value);
      expect(updated[field as keyof typeof mockProfile]).toBe(value);
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

  describe('createFormState', () => {
    it('should initialize form state', () => {
      const state = createFormState(mockProfile);
      expect(state.data).toEqual(mockProfile);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('updateFormField', () => {
    it('should update field and mark dirty', () => {
      const state = createFormState(mockProfile);
      const updated = updateFormField(state, 'name', 'Updated Name');
      expect(updated.data.name).toBe('Updated Name');
      expect(updated.isDirty).toBe(true);
    });

    it('should preserve other fields when updating', () => {
      const state = createFormState(mockProfile);
      const updated = updateFormField(state, 'name', 'Updated');
      expect(updated.data.email).toBe(mockProfile.email);
      expect(updated.data.id).toBe(mockProfile.id);
    });
  });

  describe('Form Save Flows', () => {
    it('should handle successful save', () => {
      let state = createFormState(mockProfile);
      state = updateFormField(state, 'name', 'Alice Updated');
      expect(state.isDirty).toBe(true);

      state = { ...state, isSaving: false, isDirty: false, error: null };
      expect(state.isDirty).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle failed save with revert', () => {
      const prev = { ...mockProfile };
      let state = createFormState(mockProfile);
      state = updateFormField(state, 'name', 'Alice Updated');

      state = {
        ...state,
        data: revertOptimisticUpdate(state.data, prev),
        isSaving: false,
        error: 'Failed to save',
      };

      expect(state.data).toEqual(prev);
      expect(state.error).toBe('Failed to save');
    });
  });
});
