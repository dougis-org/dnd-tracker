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
  testUnauthorized,
  testNotFound,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
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

  // Helper function to call export API
  async function callExportApi(partyId: string, userId: string | null = TEST_USERS.USER_123) {
    mockAuth(userId);
    const req = createGetRequest();
    return await GET(req, createAsyncParams(partyId));
  }

  // Helper to verify standard export response structure
  function verifyExportResponse(data: any, expectedName: string) {
    expect(data.party).toBeDefined();
    expect(data.party.name).toBe(expectedName);
    expect(data.party.userId).toBeUndefined(); // Should not export sensitive data
    expect(data.party.sharedWith).toBeUndefined();
    expect(data.party._id).toBeUndefined();
    expect(data.party.createdAt).toBeUndefined();
    expect(data.party.updatedAt).toBeUndefined();
  }

  // Helper to verify standard HTTP response headers
  function verifyExportHeaders(response: Response, expectedFilename: string) {
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain(expectedFilename);
  }

  it('should return 401 if user is not authenticated', async () => {
    const response = await callExportApi('607d2f0b0a1b2c3d4e5f6789', null);
    expectUnauthorized(response);
  });

  it('should return 404 if party does not exist', async () => {
    await testNotFound(TEST_USERS.USER_123, GET, () => createGetRequest());
  });

  it('should return 403 if user does not have access to party', async () => {
    const privateParty = await createTestParty({
      userId: TEST_USERS.OWNER_USER,
      name: 'Private Party'
    });

    const response = await callExportApi(privateParty._id.toString(), TEST_USERS.USER_123);
    expectForbidden(response);
  });

  it('should export minimal party successfully as owner', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Export Test Party'
    });

    const response = await callExportApi(party._id.toString());
    
    verifyExportHeaders(response, 'export-test-party.json');
    const data = await response.json();
    verifyExportResponse(data, 'Export Test Party');
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

    const response = await callExportApi(party._id.toString());
    
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
    const party = await createTestParty({
      userId: TEST_USERS.OWNER_USER,
      name: 'Shared Export Party'
    });

    party.sharedWith.push({
      userId: TEST_USERS.USER_123,
      role: 'viewer',
      sharedAt: new Date()
    });
    await party.save();

    const response = await callExportApi(party._id.toString());
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Shared Export Party');
  });

  it('should export party as editor with shared access', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.OWNER_USER,
      name: 'Editor Export Party'
    });

    party.sharedWith.push({
      userId: TEST_USERS.USER_123,
      role: 'editor',
      sharedAt: new Date()
    });
    await party.save();

    const response = await callExportApi(party._id.toString());
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Editor Export Party');
  });

  it('should generate proper filename from party name', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Party with Spaces & Special Characters!'
    });

    const response = await callExportApi(party._id.toString());
    
    expect(response.status).toBe(200);
    const contentDisposition = response.headers.get('Content-Disposition');
    expect(contentDisposition).toContain('party-with-spaces-special-characters.json');
  });

  it('should include export metadata', async () => {
    const party = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Metadata Test Party'
    });

    const response = await callExportApi(party._id.toString());
    
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

    const response = await callExportApi(party._id.toString());
    
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

    const response = await callExportApi(party._id.toString());
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.party.name).toBe('Minimal Party');
    expect(data.party.description).toBeUndefined();
    expect(data.party.campaignName).toBeUndefined();
    expect(data.party.templateCategory).toBeUndefined();
  });
});