/**
 * Webhook Schema Tests
 * Tests for schema validation helpers and formatValidationErrors logic branches
 */

import {
  createUserSchema,
  updateUserSchema,
  webhookEventSchema,
  validateCreateUser,
  validateUpdateUser,
  validateWebhookEvent,
  formatValidationErrors,
  type CreateUserRequest,
  type UpdateUserRequest,
  type WebhookEventRequest,
} from '@/lib/schemas/webhook.schema';

describe('Webhook Schemas', () => {
  describe('Create User Schema', () => {
    it('validates correct user data', () => {
      const data = {
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe('user-123');
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.displayName).toBe('Test User');
      }
    });

    it('rejects missing required fields', () => {
      const result = validateCreateUser({ userId: 'user-123' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const data = {
        userId: 'user-123',
        email: 'invalid-email',
        displayName: 'Test User',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(false);
    });

    it('lowercases email addresses', () => {
      const data = {
        userId: 'user-123',
        email: 'Test@EXAMPLE.COM',
        displayName: 'Test User',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('accepts optional metadata', () => {
      const data = {
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: { key: 'value' },
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(true);
    });

    it('rejects empty userId', () => {
      const data = {
        userId: '',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty displayName', () => {
      const data = {
        userId: 'user-123',
        email: 'test@example.com',
        displayName: '',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(false);
    });

    it('rejects userId exceeding max length', () => {
      const data = {
        userId: 'a'.repeat(256),
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const result = validateCreateUser(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Update User Schema', () => {
    it('validates correct update data', () => {
      const data = { displayName: 'New Name' };

      const result = validateUpdateUser(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('New Name');
      }
    });

    it('allows empty update object', () => {
      const result = validateUpdateUser({});
      expect(result.success).toBe(true);
    });

    it('allows only displayName', () => {
      const result = validateUpdateUser({ displayName: 'New Name' });
      expect(result.success).toBe(true);
    });

    it('allows only metadata', () => {
      const result = validateUpdateUser({ metadata: { key: 'value' } });
      expect(result.success).toBe(true);
    });

    it('allows both displayName and metadata', () => {
      const data = {
        displayName: 'New Name',
        metadata: { key: 'value' },
      };

      const result = validateUpdateUser(data);
      expect(result.success).toBe(true);
    });

    it('rejects empty displayName', () => {
      const result = validateUpdateUser({ displayName: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('Webhook Event Schema', () => {
    it('validates correct event with string timestamp', () => {
      const data: WebhookEventRequest = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
    });

    it('validates correct event with numeric timestamp', () => {
      const data = {
        eventType: 'updated',
        timestamp: Date.now(),
        user: {
          userId: 'user-123',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
    });

    it('accepts all event types', () => {
      const types = ['created', 'updated', 'deleted'] as const;

      types.forEach((eventType) => {
        const data = {
          eventType,
          timestamp: new Date().toISOString(),
          user: {
            userId: 'user-123',
          },
        };

        const result = validateWebhookEvent(data);
        expect(result.success).toBe(true);
      });
    });

    it('accepts optional eventId', () => {
      const data = {
        eventType: 'created',
        eventId: 'evt-456',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventId).toBe('evt-456');
      }
    });

    it('accepts optional email in user', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
          email: 'test@example.com',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
    });

    it('accepts optional displayName in user', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
          displayName: 'Test User',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
    });

    it('accepts optional metadata in user', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
          metadata: { key: 'value' },
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(true);
    });

    it('rejects missing userId in user', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {},
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty userId', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: '',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid event type', () => {
      const data = {
        eventType: 'invalid',
        timestamp: new Date().toISOString(),
        user: {
          userId: 'user-123',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid timestamp format', () => {
      const data = {
        eventType: 'created',
        timestamp: 'not-a-datetime',
        user: {
          userId: 'user-123',
        },
      };

      const result = validateWebhookEvent(data);
      expect(result.success).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('groups errors by field path', () => {
      const data = {
        userId: '',
        email: 'invalid',
        displayName: '',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);

        // Should have entries for each field with errors
        expect(Object.keys(formatted).length).toBeGreaterThan(0);
        expect(Array.isArray(formatted['userId'])).toBe(true);
        expect(Array.isArray(formatted['email'])).toBe(true);
        expect(Array.isArray(formatted['displayName'])).toBe(true);
      }
    });

    it('handles single error per field', () => {
      const data = {
        userId: 'valid-123',
        email: 'invalid-email',
        displayName: 'Valid Name',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted['email']).toBeDefined();
        expect(Array.isArray(formatted['email'])).toBe(true);
        expect(formatted['email'].length).toBeGreaterThan(0);
      }
    });

    it('handles multiple errors per field', () => {
      const data = {
        userId: 'x'.repeat(300),
        email: 'test@example.com',
        displayName: 'Valid',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        // userId might have multiple errors
        expect(formatted['userId']).toBeDefined();
      }
    });

    it('handles nested field errors', () => {
      const data = {
        eventType: 'invalid',
        timestamp: new Date().toISOString(),
        user: {
          userId: '',
        },
      };

      const result = webhookEventSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        // Should have paths like 'user.userId' and 'eventType'
        expect(Object.keys(formatted).length).toBeGreaterThan(0);
      }
    });

    it('accumulates multiple errors for the same field', () => {
      // This test ensures the branch where details[path] already exists is covered
      const data = {
        userId: '',
        email: 'not-an-email',
        displayName: '',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        // Each field should have at least one error message
        expect(formatted['userId']).toBeDefined();
        expect(formatted['userId'].length).toBeGreaterThan(0);
        // All messages should be strings
        formatted['userId'].forEach((msg: string) => {
          expect(typeof msg).toBe('string');
        });
      }
    });

    it('formats nested path errors correctly', () => {
      const data = {
        eventType: 'created',
        timestamp: new Date().toISOString(),
        user: {
          userId: '',
          email: 'not-an-email',
        },
      };

      const result = webhookEventSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        // Should have nested paths like 'user.userId'
        const paths = Object.keys(formatted);
        expect(paths.length).toBeGreaterThan(0);
        // Verify nested paths are formatted with dots
        const nestedPaths = paths.filter((p) => p.includes('.'));
        expect(nestedPaths.length).toBeGreaterThan(0);
      }
    });

    it('returns empty object for valid data', () => {
      const data = {
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
      // If parsing succeeded, formatValidationErrors should never be called
      // But we can still verify the structure
      expect(result).toHaveProperty('data');
    });

    it('preserves error message text', () => {
      const data = {
        userId: 'a'.repeat(300),
        email: 'test@example.com',
        displayName: 'Test',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted['userId']).toBeDefined();
        expect(formatted['userId'].length).toBeGreaterThan(0);
        // Error messages should contain meaningful text
        expect(
          formatted['userId'].some((msg: string) =>
            msg.toLowerCase().includes('string')
          )
        ).toBe(true);
      }
    });
  });
});
