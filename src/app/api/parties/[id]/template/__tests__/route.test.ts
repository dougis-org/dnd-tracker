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

describe('POST /api/parties/[id]/template', () => {
  beforeEach(standardTestSetup.beforeEach);

  it('should return 401 if user is not authenticated', async () => {
    await testUnauthorizedAccess(
      POST,
      () => createPostRequest({ isTemplate: true }),
      createAsyncParams('607d2f0b0a1b2c3d4e5f6789')
    );
  });

  it('should return 404 if party does not exist', async () => {
    await testNotFoundWithInvalidId(
      TEST_USERS.USER_123,
      POST,
      () => createPostRequest({ isTemplate: true })
    );
  });

  it('should return 403 if user does not have edit permission', async () => {
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
    const req = createPostRequest({ isTemplate: true });
    
    const response = await POST(req, createAsyncParams(sharedParty._id.toString()));
    expectForbidden(response);
  });

  it('should return 400 for invalid JSON', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = new (require('next/server')).NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    expectBadRequest(response);
  });

  it('should return 400 if isTemplate is missing', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({}); // Missing isTemplate
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    expectBadRequest(response);
  });

  it('should return 400 if isTemplate is not boolean', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({ isTemplate: 'not-boolean' });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    expectBadRequest(response);
  });

  it('should convert party to template as owner', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: true,
      templateCategory: 'Adventure'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBe('Adventure');
  });

  it('should convert template back to regular party as owner', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: true,
      templateCategory: 'Adventure'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: false
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(false);
    expect(data.templateCategory).toBeUndefined();
  });

  it('should convert party to template as editor', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.OWNER_USER,
      name: 'Shared Party',
      isTemplate: false
    });

    // Add USER_123 as editor
    party.sharedWith.push({
      userId: TEST_USERS.USER_123,
      role: 'editor',
      sharedAt: new Date()
    });
    await party.save();

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: true,
      templateCategory: 'Campaign'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBe('Campaign');
  });

  it('should set template category when converting to template', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: true,
      templateCategory: 'Dungeon Crawl'
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBe('Dungeon Crawl');
  });

  it('should clear template category when converting from template', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: true,
      templateCategory: 'Adventure'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: false
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(false);
    expect(data.templateCategory).toBeUndefined();
  });

  it('should persist template changes in database', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: true,
      templateCategory: 'Test Category'
    });
    
    await POST(req, createAsyncParams(party._id.toString()));
    
    // Verify changes were saved to database
    const savedParty = await Party.findById(party._id);
    expect(savedParty!.isTemplate).toBe(true);
    expect(savedParty!.templateCategory).toBe('Test Category');
  });

  it('should handle template conversion without category', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      isTemplate: true
      // No templateCategory provided
    });
    
    const response = await POST(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBeUndefined();
  });
});