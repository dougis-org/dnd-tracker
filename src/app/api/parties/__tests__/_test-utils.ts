import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Party, IParty } from '@/models/Party';
import mongoose from 'mongoose';

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

/**
 * Standard test expectations for unauthorized access (401 status)
 */
export function expectUnauthorized(response: Response) {
  expect(response.status).toBe(401);
}

/**
 * Standard test expectations for successful responses with party data
 */
export async function expectPartyResponse(response: Response, expectedData?: Partial<IParty>) {
  expect(response.status).toBe(200);
  if (expectedData) {
    const data = await response.json();
    if (expectedData.name) expect(data.name).toBe(expectedData.name);
    if (expectedData.userId) expect(data.userId).toBe(expectedData.userId);
    if (expectedData.description) expect(data.description).toBe(expectedData.description);
    return data;
  }
}

/**
 * Standard test expectations for not found responses (404 status)
 */
export function expectNotFound(response: Response) {
  expect(response.status).toBe(404);
}

/**
 * Standard test expectations for forbidden responses (403 status)
 */
export function expectForbidden(response: Response) {
  expect(response.status).toBe(403);
}

/**
 * Standard test expectations for bad request responses (400 status)
 */
export function expectBadRequest(response: Response) {
  expect(response.status).toBe(400);
}

/**
 * Standard test expectations for created responses (201 status)
 */
export async function expectCreated(response: Response, expectedData?: Partial<IParty>) {
  expect(response.status).toBe(201);
  if (expectedData) {
    const data = await response.json();
    if (expectedData.name) expect(data.name).toBe(expectedData.name);
    if (expectedData.userId) expect(data.userId).toBe(expectedData.userId);
    if (expectedData.description) expect(data.description).toBe(expectedData.description);
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
    return data;
  }
}

/**
 * Standard test expectations for successful deletion (204 status)
 */
export function expectDeleted(response: Response) {
  expect(response.status).toBe(204);
}

/**
 * Test unauthorized access pattern
 */
export async function testUnauthorized(apiCall: any, requestFactory: () => any, params?: any) {
  mockAuth(null);
  const req = requestFactory();
  const response = await apiCall(req, params);
  expectUnauthorized(response);
}

/**
 * Test not found with non-existent ID
 */
export async function testNotFound(userId: string, apiCall: any, requestFactory: () => any) {
  mockAuth(userId);
  const req = requestFactory();
  const nonExistentId = new mongoose.Types.ObjectId().toString();
  const response = await apiCall(req, createAsyncParams(nonExistentId));
  expectNotFound(response);
}

/**
 * Test forbidden access (no edit permission)
 */
export async function testForbiddenAccess(apiCall: any, requestBody: any) {
  const sharedParty = await createTestParty({
    userId: TEST_USERS.OWNER_USER,
    name: 'Shared Party'
  });

  // Add USER_123 as viewer (no edit permission)
  sharedParty.sharedWith.push({
    userId: TEST_USERS.USER_123,
    role: 'viewer',
    sharedAt: new Date()
  });
  await sharedParty.save();

  mockAuth(TEST_USERS.USER_123);
  const req = createPostRequest(requestBody);
  
  const response = await apiCall(req, createAsyncParams(sharedParty._id.toString()));
  expectForbidden(response);
}

/**
 * Test invalid JSON body
 */
export async function testInvalidJson(apiCall: any, partyId: string, userId: string = TEST_USERS.USER_123) {
  mockAuth(userId);
  const req = createInvalidJsonRequest();
  const response = await apiCall(req, createAsyncParams(partyId));
  expectBadRequest(response);
}

/**
 * Test missing required fields
 */
export async function testMissingFields(apiCall: any, partyId: string, body: any, userId: string = TEST_USERS.USER_123) {
  mockAuth(userId);
  const req = createPostRequest(body);
  const response = await apiCall(req, createAsyncParams(partyId));
  expectBadRequest(response);
}

/**
 * Create multiple test parties with different users for testing access control
 */
export async function createTestPartiesForUser(userId: string, count: number = 2, otherUserId: string = TEST_USERS.OTHER_USER) {
  const ownedParties = [];
  for (let i = 1; i <= count; i++) {
    ownedParties.push(await createTestParty({ 
      name: `User Party ${i}`, 
      userId 
    }));
  }
  
  // Create one party for other user to test access control
  await createTestParty({ 
    name: 'Other User Party', 
    userId: otherUserId 
  });
  
  return ownedParties;
}

/**
 * Setup describe block with standard test party creation
 */
export async function setupTestPartyScenario(userId: string = TEST_USERS.USER_123, partyName: string = 'Test Party') {
  await standardTestSetup.beforeEach();
  return await createTestParty({
    userId,
    name: partyName,
  });
}

/**
 * Common test pattern: mock auth, create request, call API, expect unauthorized
 */
export async function testUnauthorizedAccess(apiCall: (req: any, params?: any) => Promise<Response>, requestFactory: () => any, params?: any) {
  mockAuth(null);
  const req = requestFactory();
  const response = await apiCall(req, params);
  expectUnauthorized(response);
}

/**
 * Common test pattern: create test data, test API call, verify response
 */
export async function testSuccessfulGet(userId: string, apiCall: (req: any, params?: any) => Promise<Response>, requestFactory: () => any, params?: any) {
  mockAuth(userId);
  const req = requestFactory();
  const response = await apiCall(req, params);
  return response;
}

/**
 * Standard test expectations for empty array responses
 */
export async function expectEmptyArray(response: Response) {
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toEqual([]);
}

/**
 * Standard test setup for beforeEach blocks
 */
export const standardTestSetup = {
  beforeEach: async () => {
    await cleanupParties();
  }
};