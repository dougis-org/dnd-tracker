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
  cleanupParties,
  TEST_USERS,
  expectUnauthorized,
  expectBadRequest,
  expectNotFound,
  expectForbidden,
  createAsyncParams,
  testUnauthorizedAccess,
  testNotFoundWithInvalidId,
  standardTestSetup,
  createPostEndpointTestSuite,
  testEditorCanEdit,
  testDatabasePersistence,
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
  const testSuite = createPostEndpointTestSuite(POST, validShareBody, 'share');

  it('should return 401 if user is not authenticated', async () => {
    await testSuite.testUnauthorized();
  });

  it('should return 404 if party does not exist', async () => {
    await testSuite.testNotFound();
  });

  it('should return 403 if user does not have edit permission', async () => {
    await testSuite.testForbidden();
  });

  it('should return 400 for invalid JSON', async () => {
    await testSuite.testInvalidJson();
  });

  it('should return 400 if userId is missing', async () => {
    await testSuite.testMissingFields({ role: 'viewer' });
  });

  it('should return 400 if role is missing', async () => {
    await testSuite.testMissingFields({ userId: TEST_USERS.OTHER_USER });
  });

  it('should return 400 if role is invalid', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.OTHER_USER,
      role: 'invalid-role'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    expectBadRequest(response);
  });

  it('should share party with viewer role as owner', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.OTHER_USER,
      role: 'viewer'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('viewer');
    expect(data.sharedWith[0].sharedAt).toBeDefined();
  });

  it('should share party with editor role as owner', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.OTHER_USER,
      role: 'editor'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('editor');
  });

  it('should share party as editor', async () => {
    const response = await testEditorCanEdit(POST, {
      userId: TEST_USERS.OTHER_USER,
      role: 'viewer'
    }, 200, 'share');
    
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

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.OTHER_USER,
      role: 'editor' // Update to editor
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sharedWith).toHaveLength(1);
    expect(data.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
    expect(data.sharedWith[0].role).toBe('editor');
  });

  it('should not allow owner to share with themselves', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.USER_123, // Same as owner
      role: 'viewer'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    expectBadRequest(response);
  });

  it('should persist share in database', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      userId: TEST_USERS.OTHER_USER,
      role: 'viewer'
    });
    
    await POST(req, createAsyncParams(party._id.toString()));
    
    await testDatabasePersistence(party._id.toString(), (savedParty) => {
      expect(savedParty.sharedWith).toHaveLength(1);
      expect(savedParty.sharedWith[0].userId).toBe(TEST_USERS.OTHER_USER);
      expect(savedParty.sharedWith[0].role).toBe('viewer');
    });
  });
});