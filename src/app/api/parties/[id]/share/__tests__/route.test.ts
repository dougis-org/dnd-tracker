/**
 * @jest-environment node
 */
import { POST } from '../route';
import { Party } from '@/models/Party';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import {
  mockAuth,
  createPostRequest,
  createTestParty,
  TEST_USERS,
  expectBadRequest,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
  createAsyncParams,
  standardTestSetup,
  testUnauthorized,
  testNotFound,
  testForbiddenAccess,
  testInvalidJson,
  testMissingFields,
} from '@/app/api/parties/__tests__/_test-utils';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('POST /api/parties/[id]/share', () => {
  beforeEach(standardTestSetup.beforeEach);

  const validShareBody = { userId: TEST_USERS.OTHER_USER, role: 'viewer' };

  // Helper function to call share API
  async function callShareApi(partyId: string, body: any, userId: string = TEST_USERS.USER_123) {
    mockAuth(userId);
    const req = createPostRequest(body);
    return await POST(req, createAsyncParams(partyId));
  }

  // Helper to verify share response
  function verifyShareResponse(data: any, expectedUserId: string, expectedRole: string) {
    expect(data.sharedWith.some((share: any) => 
      share.userId === expectedUserId && share.role === expectedRole
    )).toBe(true);
  }

  it('should return 401 if user is not authenticated', async () => {
    const response = await callShareApi('607d2f0b0a1b2c3d4e5f6789', validShareBody, null);
    expectUnauthorized(response);
  });

  it('should return 404 if party does not exist', async () => {
    await testNotFound(TEST_USERS.USER_123, POST, () => createPostRequest(validShareBody));
  });

  it('should return 403 if user does not have required permission', async () => {
    await testForbiddenAccess(POST, validShareBody);
  });

  it('should return 400 for invalid JSON', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    await testInvalidJson(POST, party._id.toString());
  });

  it('should return 400 if userId is missing', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    await testMissingFields(POST, party._id.toString(), { role: 'viewer' });
  });

  it('should return 400 if role is missing', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    await testMissingFields(POST, party._id.toString(), { userId: TEST_USERS.OTHER_USER });
  });

  it('should return 400 if role is invalid', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    const response = await callShareApi(party._id.toString(), {
      userId: TEST_USERS.OTHER_USER,
      role: 'invalid-role'
    });
    expectBadRequest(response);
  });

  it('should share party with viewer role as owner', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    const response = await callShareApi(party._id.toString(), validShareBody);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('viewer');
    expect(data.sharedWith[0].sharedAt).toBeDefined();
  });

  it('should share party with editor role as owner', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    const editorBody = { userId: TEST_USERS.OTHER_USER, role: 'editor' };

    const response = await callShareApi(party._id.toString(), editorBody);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('editor');
  });

  it('should share party as editor', async () => {
    const party = await createTestParty({ userId: TEST_USERS.OWNER_USER });
    party.sharedWith.push({
      userId: TEST_USERS.USER_123,
      role: 'editor',
      sharedAt: new Date()
    });
    await party.save();

    const response = await callShareApi(party._id.toString(), validShareBody);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(2); // Original editor + new viewer
    expect(data.sharedWith.some((share: any) => share.userId === TEST_USERS.OTHER_USER)).toBe(true);
  });

  it('should update existing share role', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    
    // Add initial share
    party.sharedWith.push({
      userId: TEST_USERS.OTHER_USER,
      role: 'viewer',
      sharedAt: new Date()
    });
    await party.save();

    const response = await callShareApi(party._id.toString(), {
      userId: TEST_USERS.OTHER_USER,
      role: 'editor' // Update to editor
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('editor');
  });

  it('should not allow owner to share with themselves', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    const response = await callShareApi(party._id.toString(), {
      userId: TEST_USERS.USER_123, // Same as owner
      role: 'viewer'
    });

    expectBadRequest(response);
  });

  it('should persist share in database', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    await callShareApi(party._id.toString(), validShareBody);
    
    const savedParty = await Party.findById(party._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty.sharedWith).toHaveLength(1);
    expect(savedParty.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(savedParty.sharedWith[0].role).toBe('viewer');
  });
});