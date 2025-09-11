/**
 * @jest-environment node
 */
import { GET } from '../route';
import { Party } from '@/models/Party';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import {
  mockAuth,
  createGetRequest,
  createTestParty,
  TEST_USERS,
  createAsyncParams,
  standardTestSetup,
  createEndpointTestSuite,
  createComprehensiveTestSuite,
  createSharedTestParty,
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

describe('GET /api/parties/export/[id]', () => {
  beforeEach(standardTestSetup.beforeEach);

  // Standard comprehensive test suite for GET endpoint
  const standardTests = createComprehensiveTestSuite('GET', GET, undefined, 'export');

  // Execute standard tests
  Object.entries(standardTests).forEach(([testName, testFn]) => {
    it(testName, testFn);
  });

  it('should export minimal party successfully as owner', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Export Test Party'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('export-test-party.json');
    
    const data = await response.json();
    expect(data.party).toBeDefined();
    expect(data.party.name).toBe('Export Test Party');
    expect(data.party.userId).toBeUndefined(); // Should not export sensitive data
    expect(data.party.sharedWith).toBeUndefined(); // Should not export sharing data
    expect(data.party._id).toBeUndefined(); // Should not export internal IDs
    expect(data.party.createdAt).toBeUndefined();
    expect(data.party.updatedAt).toBeUndefined();
  });

  it('should export complete party successfully', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Complete Export Party',
      description: 'A complete party for export',
      campaignName: 'Export Campaign',
      maxSize: 8,
      isTemplate: true,
      templateCategory: 'Export Template'
    });

    // Add some characters
    party.characters.push(
      {
        playerName: 'Alice',
        playerEmail: 'alice@example.com',
        isActive: true,
        joinedAt: new Date(),
        characterId: new (require('mongoose')).Types.ObjectId()
      },
      {
        playerName: 'Bob',
        playerEmail: 'bob@example.com',
        isActive: false,
        joinedAt: new Date(),
        characterId: new (require('mongoose')).Types.ObjectId()
      }
    );
    await party.save();

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.party.name).toBe('Complete Export Party');
    expect(data.party.description).toBe('A complete party for export');
    expect(data.party.campaignName).toBe('Export Campaign');
    expect(data.party.maxSize).toBe(8);
    expect(data.party.isTemplate).toBe(true);
    expect(data.party.templateCategory).toBe('Export Template');
    
    expect(data.party.characters).toHaveLength(2);
    expect(data.party.characters[0].playerName).toBe('Alice');
    expect(data.party.characters[0].playerEmail).toBe('alice@example.com');
    expect(data.party.characters[0].isActive).toBe(true);
    expect(data.party.characters[0].characterId).toBeUndefined(); // Should not export character IDs
    expect(data.party.characters[0].joinedAt).toBeUndefined(); // Should not export timestamps
    
    expect(data.party.characters[1].playerName).toBe('Bob');
    expect(data.party.characters[1].isActive).toBe(false);
  });

  it('should export party as viewer with shared access', async () => {
    const sharedParty = await createSharedTestParty(
      TEST_USERS.OWNER_USER,
      TEST_USERS.USER_123,
      'viewer',
      'Shared Export Party'
    );

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(sharedParty._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Shared Export Party');
  });

  it('should export party as editor with shared access', async () => {
    const sharedParty = await createSharedTestParty(
      TEST_USERS.OWNER_USER,
      TEST_USERS.USER_123,
      'editor',
      'Editor Export Party'
    );

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(sharedParty._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Editor Export Party');
  });

  it('should generate proper filename from party name', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Party with Spaces & Special Characters!'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const contentDisposition = response.headers.get('Content-Disposition');
    expect(contentDisposition).toContain('party-with-spaces-special-characters.json');
  });

  it('should include export metadata', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Metadata Test Party'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.metadata).toBeDefined();
    expect(data.metadata.exportedAt).toBeDefined();
    expect(data.metadata.exportedBy).toBe(TEST_USERS.USER_123);
    expect(data.metadata.version).toBe('1.0');
    expect(new Date(data.metadata.exportedAt)).toBeInstanceOf(Date);
  });

  it('should handle party with no characters', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Empty Characters Party'
    });

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.characters).toEqual([]);
  });

  it('should handle party with no optional fields', async () => {
    const party = new Party({
      userId: TEST_USERS.USER_123,
      name: 'Minimal Party'
    });
    await party.save();

    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    
    const response = await GET(req, createAsyncParams(party._id.toString()));
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Minimal Party');
    expect(data.party.description).toBeUndefined();
    expect(data.party.campaignName).toBeUndefined();
    expect(data.party.templateCategory).toBeUndefined();
  });
});