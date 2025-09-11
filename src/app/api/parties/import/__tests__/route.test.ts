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
  expectCreated,
  standardTestSetup,
  createInvalidJsonRequest,
  createComprehensiveTestSuite,
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

describe('POST /api/parties/import', () => {
  beforeEach(standardTestSetup.beforeEach);

  const validImportBody = { party: { name: 'Imported Party' } };
  
  // Standard comprehensive test suite (modified for import endpoint which doesn't have dynamic params)
  const standardTests = {
    'should return 401 if user is not authenticated': async () => {
      const req = createPostRequest(validImportBody);
      const response = await POST(req);
      expect(response.status).toBe(401);
    },
    'should return 400 for invalid JSON': async () => {
      mockAuth(TEST_USERS.USER_123);
      const req = createInvalidJsonRequest();
      const response = await POST(req);
      expectBadRequest(response);
    }
  };

  // Execute standard tests
  Object.entries(standardTests).forEach(([testName, testFn]) => {
    it(testName, testFn);
  });

  it('should return 400 if party data is missing', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({}); // Missing party
    
    const response = await POST(req);
    expectBadRequest(response);
  });

  it('should return 400 if party name is missing', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPostRequest({
      party: {
        description: 'Imported party without name'
      }
    });
    
    const response = await POST(req);
    expectBadRequest(response);
  });

  it('should import a minimal party successfully', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: 'Imported Minimal Party'
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    const data = await expectCreated(response, { 
      name: 'Imported Minimal Party',
      userId: TEST_USERS.USER_123 
    });
    
    expect(data.description).toBeUndefined();
    expect(data.campaignName).toBeUndefined();
    expect(data.characters).toEqual([]);
    expect(data.sharedWith).toEqual([]);
    expect(data.isTemplate).toBe(false);
    expect(data.maxSize).toBe(5); // Default value
  });

  it('should import a complete party successfully', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: 'Imported Complete Party',
        description: 'A complete imported party',
        campaignName: 'Imported Campaign',
        maxSize: 6,
        isTemplate: true,
        templateCategory: 'Imported Template',
        characters: [
          {
            playerName: 'John Doe',
            playerEmail: 'john@example.com',
            isActive: true
          },
          {
            playerName: 'Jane Smith',
            playerEmail: 'jane@example.com',
            isActive: false
          }
        ]
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    const data = await expectCreated(response, { 
      name: 'Imported Complete Party',
      userId: TEST_USERS.USER_123 
    });
    
    expect(data.description).toBe('A complete imported party');
    expect(data.campaignName).toBe('Imported Campaign');
    expect(data.maxSize).toBe(6);
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBe('Imported Template');
    expect(data.characters).toHaveLength(2);
    expect(data.characters[0].playerName).toBe('John Doe');
    expect(data.characters[0].playerEmail).toBe('john@example.com');
    expect(data.characters[0].isActive).toBe(true);
    expect(data.characters[1].playerName).toBe('Jane Smith');
    expect(data.characters[1].isActive).toBe(false);
  });

  it('should sanitize imported party data', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: '  Imported Party With Spaces  ',
        description: '  Description with spaces  ',
        campaignName: '  Campaign with spaces  ',
        userId: 'malicious-user-id', // Should be ignored
        _id: 'malicious-id', // Should be ignored
        createdAt: '2023-01-01', // Should be ignored
        updatedAt: '2023-01-01', // Should be ignored
        characters: [
          {
            characterId: 'malicious-character-id', // Should be ignored
            playerName: '  Player Name  ',
            playerEmail: '  PLAYER@EXAMPLE.COM  ', // Should be normalized
            isActive: true,
            joinedAt: '2023-01-01' // Should be ignored
          }
        ],
        sharedWith: [
          {
            userId: 'shared-user',
            role: 'viewer'
          }
        ]
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    const data = await expectCreated(response, { 
      name: 'Imported Party With Spaces',
      userId: TEST_USERS.USER_123 
    });
    
    expect(data.name).toBe('Imported Party With Spaces');
    expect(data.description).toBe('Description with spaces');
    expect(data.campaignName).toBe('Campaign with spaces');
    expect(data.userId).toBe(TEST_USERS.USER_123); // Should be set to authenticated user
    expect(data.characters[0].playerName).toBe('Player Name');
    expect(data.characters[0].playerEmail).toBe('player@example.com');
    expect(data.characters[0].characterId).toBeUndefined(); // Should not be set
    expect(data.sharedWith).toEqual([]); // Should not import shared data
  });

  it('should validate character email format during import', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: 'Party with Invalid Email',
        characters: [
          {
            playerName: 'Invalid Player',
            playerEmail: 'invalid-email-format',
            isActive: true
          }
        ]
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    expectBadRequest(response);
  });

  it('should enforce maxSize validation during import', async () => {
    mockAuth(TEST_USERS.USER_123);
    const characters = Array.from({ length: 6 }, (_, i) => ({
      playerName: `Player ${i + 1}`,
      playerEmail: `player${i + 1}@example.com`,
      isActive: true
    }));
    
    const partyData = {
      party: {
        name: 'Party with Too Many Characters',
        maxSize: 5, // Limit is 5
        characters // But we have 6 characters
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    expectBadRequest(response);
  });

  it('should persist imported party in database', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: 'Database Persistence Test',
        description: 'Testing database persistence'
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    const data = await expectCreated(response, { 
      name: 'Database Persistence Test',
      userId: TEST_USERS.USER_123 
    });
    
    // Verify party was saved to database
    const savedParty = await Party.findById(data._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty!.name).toBe('Database Persistence Test');
    expect(savedParty!.description).toBe('Testing database persistence');
    expect(savedParty!.userId).toBe(TEST_USERS.USER_123);
  });

  it('should handle invalid template category gracefully', async () => {
    mockAuth(TEST_USERS.USER_123);
    const partyData = {
      party: {
        name: 'Party with Invalid Template',
        isTemplate: true,
        templateCategory: 123 // Invalid type
      }
    };
    const req = createPostRequest(partyData);
    
    const response = await POST(req);
    const data = await expectCreated(response, { 
      name: 'Party with Invalid Template',
      userId: TEST_USERS.USER_123 
    });
    
    expect(data.isTemplate).toBe(true);
    expect(data.templateCategory).toBeUndefined(); // Should be filtered out
  });
});