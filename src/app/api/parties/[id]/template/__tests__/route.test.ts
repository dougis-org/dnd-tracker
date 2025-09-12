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
  createAsyncParams,
  standardTestSetup,
  testUnauthorized,
  testNotFound,
  testForbiddenAccess,
  testInvalidJson,
  testMissingFields,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
  expectBadRequest,
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

  const validTemplateBody = { isTemplate: true };

  // Helper function to call template API
  async function callTemplateApi(partyId: string, body: any, userId: string = TEST_USERS.USER_123) {
    mockAuth(userId);
    const req = createPostRequest(body);
    return await POST(req, createAsyncParams(partyId));
  }

  // Helper to verify template response
  function verifyTemplateResponse(data: any, expectedTemplate: boolean, expectedCategory?: string) {
    expect(data.isTemplate).toBe(expectedTemplate);
    if (expectedTemplate && expectedCategory) {
      expect(data.templateCategory).toBe(expectedCategory);
    } else if (!expectedTemplate) {
      expect(data.templateCategory).toBeUndefined();
    }
  }

  it('should return 401 if user is not authenticated', async () => {
    const response = await callTemplateApi('607d2f0b0a1b2c3d4e5f6789', validTemplateBody, null);
    expectUnauthorized(response);
  });

  it('should return 404 if party does not exist', async () => {
    await testNotFound(TEST_USERS.USER_123, POST, () => createPostRequest(validTemplateBody));
  });

  it('should return 403 if user does not have required permission', async () => {
    await testForbiddenAccess(POST, validTemplateBody);
  });

  it('should return 400 for invalid JSON', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    await testInvalidJson(POST, party._id.toString());
  });

  it('should return 400 if isTemplate is missing', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    await testMissingFields(POST, party._id.toString(), {});
  });

  it('should return 400 if isTemplate is not boolean', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    const response = await callTemplateApi(party._id.toString(), { isTemplate: 'not-boolean' });
    expectBadRequest(response);
  });

  it('should convert party to template as owner', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });
    const templateBody = { isTemplate: true, templateCategory: 'Adventure' };

    const response = await callTemplateApi(party._id.toString(), templateBody);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, true, 'Adventure');
  });

  it('should convert template back to regular party as owner', async () => {
    const party = await createTestParty({ 
      userId: TEST_USERS.USER_123,
      isTemplate: true,
      templateCategory: 'Adventure'
    });

    const response = await callTemplateApi(party._id.toString(), { isTemplate: false });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, false);
  });

  it('should convert party to template as editor', async () => {
    const party = await createTestParty({ userId: TEST_USERS.OWNER_USER });
    party.sharedWith.push({
      userId: TEST_USERS.USER_123,
      role: 'editor',
      sharedAt: new Date()
    });
    await party.save();

    const response = await callTemplateApi(party._id.toString(), {
      isTemplate: true,
      templateCategory: 'Campaign'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, true, 'Campaign');
  });

  it('should set template category when converting to template', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    const response = await callTemplateApi(party._id.toString(), {
      isTemplate: true,
      templateCategory: 'Dungeon Crawl'
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, true, 'Dungeon Crawl');
  });

  it('should clear template category when converting from template', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: true,
      templateCategory: 'Adventure'
    });

    const response = await callTemplateApi(party._id.toString(), { isTemplate: false });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, false);
  });

  it('should persist template changes in database', async () => {
    const party = await createTestParty({ userId: TEST_USERS.USER_123 });

    await callTemplateApi(party._id.toString(), {
      isTemplate: true,
      templateCategory: 'Test Category'
    });
    
    const savedParty = await Party.findById(party._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty.isTemplate).toBe(true);
    expect(savedParty.templateCategory).toBe('Test Category');
  });

  it('should handle template conversion without category', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      isTemplate: false
    });

    const response = await callTemplateApi(party._id.toString(), { isTemplate: true });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    verifyTemplateResponse(data, true);
    expect(data.templateCategory).toBeUndefined();
  });
});