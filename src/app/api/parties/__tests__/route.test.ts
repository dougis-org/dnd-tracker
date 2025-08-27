/**
 * @jest-environment node
 */
import { GET, POST } from '../route';
import { Party } from '@/models/Party';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import {
  mockAuth,
  createGetRequest,
  createPostRequest,
  createInvalidJsonRequest,
  createTestParty,
  createSharedParty,
  cleanupParties,
  TEST_USERS,
  expectUnauthorized,
  expectPartyResponse,
  expectCreated,
  expectBadRequest,
  expectEmptyArray,
  testUnauthorizedAccess,
  testSuccessfulGet,
  createTestPartiesForUser,
  standardTestSetup,
} from './_test-utils';
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/parties', () => {
  beforeEach(standardTestSetup.beforeEach);

  it('should return 401 if user is not authenticated', async () => {
    await testUnauthorizedAccess(GET, createGetRequest);
  });

  it('should return an empty array if no parties are found', async () => {
    const response = await testSuccessfulGet(TEST_USERS.USER_123, GET, createGetRequest);
    await expectEmptyArray(response);
  });

  it('should return parties owned by the user', async () => {
    await createTestPartiesForUser(TEST_USERS.USER_123, 2);

    const response = await testSuccessfulGet(TEST_USERS.USER_123, GET, createGetRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.map((p: any) => p.name)).toContain('User Party 1');
    expect(data.map((p: any) => p.name)).toContain('User Party 2');
    expect(data.map((p: any) => p.name)).not.toContain('Other User Party');
  });

  it('should return parties shared with the user', async () => {
    await createSharedParty(TEST_USERS.OWNER_USER, [
      { userId: TEST_USERS.USER_123, role: 'viewer' }
    ]);

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Shared Party');
    expect(data[0].userId).toBe('owner-user');
  });

  it('should return both owned and shared parties', async () => {
    await createTestParty({ name: 'Owned Party', userId: TEST_USERS.USER_123 });
    await createSharedParty(TEST_USERS.OWNER_USER, [
      { userId: TEST_USERS.USER_123, role: 'editor' }
    ]);

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    const partyNames = data.map((p: any) => p.name);
    expect(partyNames).toContain('Owned Party');
    expect(partyNames).toContain('Shared Party');
  });
});

describe('POST /api/parties', () => {
  beforeEach(standardTestSetup.beforeEach);

  it('should create a new party with all fields', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      name: 'New Party',
      description: 'A newly created party',
      campaignName: 'New Campaign',
      maxSize: 5,
    };
    const req = createPostRequest(partyData);

    const response = await POST(req);
    const data = await expectCreated(response, { ...partyData, userId: TEST_USERS.USER_123 });

    expect(data.campaignName).toBe('New Campaign');
    expect(data.maxSize).toBe(5);
  });

  it('should create a party with only required fields', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({ name: 'Minimal Party' });

    const response = await POST(req);
    const data = await expectCreated(response, { name: 'Minimal Party', userId: TEST_USERS.USER_123 });

    expect(data.maxSize).toBe(5); // Default value
  });

  it('should return 401 if user is not authenticated', async () => {
    await testUnauthorizedAccess(POST, () => createPostRequest({ name: 'New Party' }));
  });

  it('should return 400 for invalid JSON', async () => {
    mockAuth(TEST_USERS.USER_123);
    const response = await POST(createInvalidJsonRequest());
    expectBadRequest(response);
  });

  it('should handle missing name gracefully', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      description: 'Party without name',
      campaignName: 'Test Campaign',
    });

    const response = await POST(req);

    // This should fail validation in mongoose due to required name field
    expectBadRequest(response);
  });

  it('should persist party in database', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = { name: 'Persistent Party', description: 'Test persistence' };
    const req = createPostRequest(partyData);

    const response = await POST(req);
    const data = await expectCreated(response, { ...partyData, userId: TEST_USERS.USER_123 });

    // Verify party was saved to database
    const savedParty = await Party.findById(data._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty!.name).toBe('Persistent Party');
    expect(savedParty!.userId).toBe(TEST_USERS.USER_123);
  });
});
