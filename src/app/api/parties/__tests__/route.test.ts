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
  beforeEach(async () => {
    await cleanupParties();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth(null);
    const req = createGetRequest();
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it('should return an empty array if no parties are found', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return parties owned by the user', async () => {
    // Create test parties
    await createTestParty({ name: 'User Party 1', userId: TEST_USERS.USER_123 });
    await createTestParty({ name: 'User Party 2', userId: TEST_USERS.USER_123 });
    await createTestParty({ name: 'Other User Party', userId: TEST_USERS.OTHER_USER });

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const response = await GET(req);
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
  beforeEach(async () => {
    await cleanupParties();
  });

  it('should create a new party with all fields', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      name: 'New Party',
      description: 'A newly created party',
      campaignName: 'New Campaign',
      maxSize: 5,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('New Party');
    expect(data.description).toBe('A newly created party');
    expect(data.campaignName).toBe('New Campaign');
    expect(data.maxSize).toBe(5);
    expect(data.userId).toBe(TEST_USERS.USER_123);
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
  });

  it('should create a party with only required fields', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({ name: 'Minimal Party' });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Minimal Party');
    expect(data.userId).toBe(TEST_USERS.USER_123);
    expect(data.maxSize).toBe(5); // Default value
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth(null);
    const req = createPostRequest({ name: 'New Party' });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid JSON', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createInvalidJsonRequest();

    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('should handle missing name gracefully', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      description: 'Party without name',
      campaignName: 'Test Campaign',
    });

    const response = await POST(req);

    // This should fail validation in mongoose due to required name field
    expect(response.status).toBe(400);
  });

  it('should persist party in database', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      name: 'Persistent Party',
      description: 'Test persistence',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);

    // Verify party was saved to database
    const savedParty = await Party.findById(data._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty!.name).toBe('Persistent Party');
    expect(savedParty!.userId).toBe(TEST_USERS.USER_123);
  });
});
