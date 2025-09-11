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
  createEndpointTestSuite,
  createComprehensiveTestSuite,
  createOwnerTestPatterns,
  createSharedAccessTestPatterns,
  testFieldValidation,
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

describe('POST /api/parties/[id]/template', () => {
  beforeEach(standardTestSetup.beforeEach);

  const validTemplateBody = { isTemplate: true };
  const testSuite = createEndpointTestSuite('POST', POST, validTemplateBody, 'template');
  const ownerPatterns = createOwnerTestPatterns(POST, validTemplateBody);
  const sharedAccessPatterns = createSharedAccessTestPatterns(POST, validTemplateBody);
  
  // Standard comprehensive test suite
  const standardTests = createComprehensiveTestSuite('POST', POST, validTemplateBody, 'template', {
    'should return 400 if isTemplate is missing': () => testSuite.testMissingFields({}),
    'should return 400 if isTemplate is not boolean': () => testFieldValidation(POST, validTemplateBody, 'isTemplate', 'not-boolean')
  });

  // Execute standard tests
  Object.entries(standardTests).forEach(([testName, testFn]) => {
    it(testName, testFn);
  });

  it('should convert party to template as owner', async () => {
    const templateBody = { isTemplate: true, templateCategory: 'Adventure' };
    const templatePatterns = createOwnerTestPatterns(POST, templateBody);
    await templatePatterns.testOwnerSuccess(200, (response, data) => {
      expect(data.isTemplate).toBe(true);
      expect(data.templateCategory).toBe('Adventure');
    });
  });

  it('should convert template back to regular party as owner', async () => {
    const regularBody = { isTemplate: false };
    const regularPatterns = createOwnerTestPatterns(POST, regularBody);
    await regularPatterns.testOwnerSuccess(200, (response, data) => {
      expect(data.isTemplate).toBe(false);
      expect(data.templateCategory).toBeUndefined();
    });
  });

  it('should convert party to template as editor', async () => {
    const editorBody = { isTemplate: true, templateCategory: 'Campaign' };
    const editorPatterns = createSharedAccessTestPatterns(POST, editorBody);
    const response = await editorPatterns.testEditorCanEdit(200);
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
    const persistenceBody = { isTemplate: true, templateCategory: 'Test Category' };
    const persistencePatterns = createOwnerTestPatterns(POST, persistenceBody);
    await persistencePatterns.testDatabasePersistence((savedParty) => {
      expect(savedParty.isTemplate).toBe(true);
      expect(savedParty.templateCategory).toBe('Test Category');
    });
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