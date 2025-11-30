/**
 * Webhook Schema Tests
 * Tests for schema validation helpers and formatValidationErrors logic branches
 */

import {
  createUserSchema,
  webhookEventSchema,
  validateCreateUser,
  validateUpdateUser,
  validateWebhookEvent,
  formatValidationErrors,
  type WebhookEventRequest,
} from '../../../src/lib/schemas/webhook.schema';

// Test data builders to reduce complexity
const validUserData = {
  userId: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const validEventData = (): WebhookEventRequest => ({
  eventType: 'created',
  timestamp: new Date().toISOString(),
  user: { userId: 'user-123' },
});

describe('Webhook Schemas', () => {
  describe('Create User Schema', () => {
    it('validates correct user data', () => {
      const result = validateCreateUser(validUserData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(validUserData);
      }
    });

    const invalidUserCases = [
      { name: 'missing required fields', data: { userId: 'user-123' } },
      { name: 'invalid email', data: { ...validUserData, email: 'invalid' } },
      { name: 'empty userId', data: { ...validUserData, userId: '' } },
      { name: 'empty displayName', data: { ...validUserData, displayName: '' } },
      { name: 'userId too long', data: { ...validUserData, userId: 'a'.repeat(256) } },
    ];

    invalidUserCases.forEach(({ name, data }) => {
      it(`rejects ${name}`, () => {
        expect(validateCreateUser(data).success).toBe(false);
      });
    });

    it('lowercases email addresses', () => {
      const result = validateCreateUser({ ...validUserData, email: 'Test@EXAMPLE.COM' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.email).toBe('test@example.com');
    });

    it('accepts optional metadata', () => {
      expect(validateCreateUser({ ...validUserData, metadata: { key: 'value' } }).success).toBe(true);
    });
  });

  describe('Update User Schema', () => {
    const updateCases = [
      { name: 'with displayName', data: { displayName: 'New Name' } },
      { name: 'with empty object', data: {} },
      { name: 'with metadata', data: { metadata: { key: 'value' } } },
      { name: 'with both fields', data: { displayName: 'New', metadata: { k: 'v' } } },
    ];

    updateCases.forEach(({ name, data }) => {
      it(`validates update ${name}`, () => {
        expect(validateUpdateUser(data).success).toBe(true);
      });
    });

    it('rejects empty displayName', () => {
      expect(validateUpdateUser({ displayName: '' }).success).toBe(false);
    });
  });

  describe('Webhook Event Schema', () => {
    const eventTypes = ['created', 'updated', 'deleted'] as const;

    it('validates event with ISO timestamp', () => {
      expect(validateWebhookEvent(validEventData()).success).toBe(true);
    });

    it('validates event with numeric timestamp', () => {
      const event = { ...validEventData(), timestamp: Date.now() };
      expect(validateWebhookEvent(event).success).toBe(true);
    });

    eventTypes.forEach((type) => {
      it(`accepts ${type} event type`, () => {
        const event = { ...validEventData(), eventType: type };
        expect(validateWebhookEvent(event).success).toBe(true);
      });
    });

    const optionalFieldCases = [
      { name: 'eventId', event: { ...validEventData(), eventId: 'evt-456' } },
      { name: 'email in user', event: { ...validEventData(), user: { userId: 'user-123', email: 'test@example.com' } } },
      { name: 'displayName in user', event: { ...validEventData(), user: { userId: 'user-123', displayName: 'Test' } } },
      { name: 'metadata in user', event: { ...validEventData(), user: { userId: 'user-123', metadata: { k: 'v' } } } },
    ];

    optionalFieldCases.forEach(({ name, event }) => {
      it(`accepts optional ${name}`, () => {
        expect(validateWebhookEvent(event).success).toBe(true);
      });
    });

    const invalidEventCases = [
      { name: 'missing userId', event: { ...validEventData(), user: {} } },
      { name: 'empty userId', event: { ...validEventData(), user: { userId: '' } } },
      { name: 'invalid event type', event: { ...validEventData(), eventType: 'invalid' } },
      { name: 'invalid timestamp', event: { ...validEventData(), timestamp: 'not-a-datetime' } },
    ];

    invalidEventCases.forEach(({ name, event }) => {
      it(`rejects ${name}`, () => {
        expect(validateWebhookEvent(event).success).toBe(false);
      });
    });
  });

  describe('formatValidationErrors', () => {
    it('groups errors by field path', () => {
      const data = { userId: '', email: 'invalid', displayName: '' };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(Object.keys(formatted).length).toBeGreaterThan(0);
        ['userId', 'email', 'displayName'].forEach((field) => {
          expect(Array.isArray(formatted[field])).toBe(true);
        });
      }
    });

    it('handles single and multiple errors per field', () => {
      const testCases = [
        { data: { userId: 'valid', email: 'invalid-email', displayName: 'Valid' }, invalidField: 'email' },
        { data: { userId: 'x'.repeat(300), email: 'test@example.com', displayName: 'Valid' }, invalidField: 'userId' },
      ];

      testCases.forEach(({ data, invalidField }) => {
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const formatted = formatValidationErrors(result.error);
          expect(formatted[invalidField]).toBeDefined();
          expect(Array.isArray(formatted[invalidField])).toBe(true);
          expect(formatted[invalidField].length).toBeGreaterThan(0);
        }
      });
    });

    it('handles nested field errors correctly', () => {
      const invalidCases = [
        { eventType: 'invalid', timestamp: new Date().toISOString(), user: { userId: '' } },
        { eventType: 'created', timestamp: new Date().toISOString(), user: { userId: '', email: 'not-an-email' } },
      ];

      invalidCases.forEach((data) => {
        const result = webhookEventSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const formatted = formatValidationErrors(result.error);
          expect(Object.keys(formatted).length).toBeGreaterThan(0);
        }
      });
    });

    it('preserves error message text', () => {
      const data = { userId: 'a'.repeat(300), email: 'test@example.com', displayName: 'Test' };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted['userId']).toBeDefined();
        expect(formatted['userId'].some((msg: string) => typeof msg === 'string' && msg.length > 0)).toBe(true);
      }
    });
  });
});
