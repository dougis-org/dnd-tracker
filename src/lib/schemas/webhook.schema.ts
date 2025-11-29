import { z } from 'zod';

/**
 * Schema for creating a new user via internal CRUD endpoint
 */
export const createUserSchema = z.object({
  userId: z.string().min(1).max(255),
  email: z.string().email().toLowerCase(),
  displayName: z.string().min(1).max(255),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

/**
 * Schema for updating a user via internal CRUD endpoint
 * Only displayName and metadata can be updated (userId and email are immutable)
 */
export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

/**
 * Schema for webhook events received from external systems
 * Validates structure: eventType, optional eventId, timestamp, and user payload
 */
export const webhookEventSchema = z.object({
  eventType: z.enum(['created', 'updated', 'deleted']),
  eventId: z.string().optional(),
  timestamp: z.union([z.string().datetime(), z.number()]),
  user: z.object({
    userId: z.string().min(1),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type WebhookEventRequest = z.infer<typeof webhookEventSchema>;

/**
 * Helper to validate incoming data and return typed result or Zod errors
 */
export function validateCreateUser(data: unknown) {
  return createUserSchema.safeParse(data);
}

export function validateUpdateUser(data: unknown) {
  return updateUserSchema.safeParse(data);
}

export function validateWebhookEvent(data: unknown) {
  return webhookEventSchema.safeParse(data);
}

/**
 * Helper to format Zod validation errors into a more readable structure
 */
export function formatValidationErrors(error: z.ZodError) {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }
  return details;
}
