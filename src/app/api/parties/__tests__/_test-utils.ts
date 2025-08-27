import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Party, IParty } from '@/models/Party';

/**
 * Mock authentication for tests
 */
export function mockAuth(userId: string | null) {
  (auth as unknown as jest.Mock).mockReturnValue({ userId });
}

/**
 * Create a simple GET NextRequest
 */
export function createGetRequest(url = 'http://localhost') {
  return new NextRequest(new Request(url));
}

/**
 * Create a POST NextRequest with JSON body
 */
export function createPostRequest(body: any, url = 'http://localhost') {
  return new NextRequest(
    new Request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Create a PUT NextRequest with JSON body
 */
export function createPutRequest(body: any, url = 'http://localhost') {
  return new NextRequest(
    new Request(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Create a DELETE NextRequest
 */
export function createDeleteRequest(url = 'http://localhost') {
  return new NextRequest(new Request(url, { method: 'DELETE' }));
}

/**
 * Create a POST NextRequest with invalid JSON body
 */
export function createInvalidJsonRequest(body = 'invalid json', url = 'http://localhost') {
  return new NextRequest(
    new Request(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Create test party data
 */
export function createTestPartyData(overrides: Partial<IParty> = {}) {
  return {
    userId: 'user123',
    name: 'Test Party',
    description: 'Test Description',
    campaignName: 'Test Campaign',
    maxSize: 5,
    ...overrides,
  };
}

/**
 * Create a party in the database for testing
 */
export async function createTestParty(overrides: Partial<IParty> = {}): Promise<IParty> {
  return await Party.create(createTestPartyData(overrides));
}

/**
 * Create a party with shared users
 */
export async function createSharedParty(
  ownerId: string,
  sharedWith: { userId: string; role: 'viewer' | 'editor' }[]
): Promise<IParty> {
  return await Party.create({
    userId: ownerId,
    name: 'Shared Party',
    description: 'Shared Description',
    campaignName: 'Shared Campaign',
    maxSize: 5,
    sharedWith: sharedWith.map(share => ({
      ...share,
      sharedAt: new Date(),
    })),
  });
}

/**
 * Clean up parties between tests
 */
export async function cleanupParties() {
  await Party.deleteMany({});
}

/**
 * Common test user IDs
 */
export const TEST_USERS = {
  USER_123: 'user123',
  OTHER_USER: 'other-user',
  OWNER_USER: 'owner-user',
  EDITOR_USER: 'editor-user',
} as const;

/**
 * Create async params for dynamic routes
 */
export function createAsyncParams(id: string) {
  return { params: Promise.resolve({ id }) };
}