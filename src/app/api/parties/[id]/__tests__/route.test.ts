/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '../route';
import { Party, IParty } from '@/models/Party';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import {
  mockAuth,
  createGetRequest,
  createPutRequest,
  createDeleteRequest,
  createTestParty,
  createAsyncParams,
  cleanupParties,
  TEST_USERS,
  expectUnauthorized,
  expectPartyResponse,
  expectNotFound,
  expectForbidden,
  expectBadRequest,
  expectDeleted,
} from '../../__tests__/_test-utils';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/parties/[id]', () => {
  let testParty: IParty;

  beforeEach(async () => {
    await cleanupParties();
    testParty = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Test Party',
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth(null);
    const req = createGetRequest();
    const response = await GET(req, createAsyncParams(testParty._id.toString()));

    expectUnauthorized(response);
  });

  it('should return party if user owns it', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const response = await GET(req, createAsyncParams(testParty._id.toString()));

    await expectPartyResponse(response, { name: 'Test Party', userId: TEST_USERS.USER_123 });
  });

  it('should return 404 if party not found', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createGetRequest();
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await GET(req, createAsyncParams(nonExistentId));

    expectNotFound(response);
  });

  it('should return 403 if user does not have access', async () => {
    mockAuth(TEST_USERS.OTHER_USER);
    const req = createGetRequest();
    const response = await GET(req, createAsyncParams(testParty._id.toString()));

    expectForbidden(response);
  });
});

describe('PUT /api/parties/[id]', () => {
  let testParty: IParty;

  beforeEach(async () => {
    await cleanupParties();
    testParty = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Test Party',
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth(null);
    const req = createPutRequest({ name: 'Updated Party' });
    const response = await PUT(req, createAsyncParams(testParty._id.toString()));

    expectUnauthorized(response);
  });

  it('should update party if user owns it', async () => {
    mockAuth(TEST_USERS.USER_123);
    const updateData = { name: 'Updated Party', description: 'Updated Description' };
    const req = createPutRequest(updateData);
    const response = await PUT(req, createAsyncParams(testParty._id.toString()));

    await expectPartyResponse(response, updateData);
  });

  it('should return 404 if party not found', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPutRequest({ name: 'Updated Party' });
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await PUT(req, createAsyncParams(nonExistentId));

    expectNotFound(response);
  });

  it('should return 403 if user does not have edit permission', async () => {
    mockAuth(TEST_USERS.OTHER_USER);
    const req = createPutRequest({ name: 'Updated Party' });
    const response = await PUT(req, createAsyncParams(testParty._id.toString()));

    expectForbidden(response);
  });

  it('should allow editor role to update party', async () => {
    // Add shared user with editor role
    testParty.sharedWith.push({
      userId: TEST_USERS.EDITOR_USER,
      role: 'editor',
      sharedAt: new Date(),
    });
    await testParty.save();

    mockAuth(TEST_USERS.EDITOR_USER);
    const req = createPutRequest({ name: 'Editor Updated Party' });
    const response = await PUT(req, createAsyncParams(testParty._id.toString()));

    await expectPartyResponse(response, { name: 'Editor Updated Party' });
  });

  it('should return 400 for invalid data', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createPutRequest({ name: '' }); // Empty name should be invalid
    const response = await PUT(req, createAsyncParams(testParty._id.toString()));

    expectBadRequest(response);
  });
});

describe('DELETE /api/parties/[id]', () => {
  let testParty: IParty;

  beforeEach(async () => {
    await cleanupParties();
    testParty = await createTestParty({
      userId: TEST_USERS.USER_123,
      name: 'Test Party',
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth(null);
    const req = createDeleteRequest();
    const response = await DELETE(req, createAsyncParams(testParty._id.toString()));

    expectUnauthorized(response);
  });

  it('should delete party if user owns it', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createDeleteRequest();
    const response = await DELETE(req, createAsyncParams(testParty._id.toString()));

    expectDeleted(response);
    
    // Verify party was deleted
    const deletedParty = await Party.findById(testParty._id);
    expect(deletedParty).toBeNull();
  });

  it('should return 404 if party not found', async () => {
    mockAuth(TEST_USERS.USER_123);
    const req = createDeleteRequest();
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await DELETE(req, createAsyncParams(nonExistentId));

    expectNotFound(response);
  });

  it('should return 403 if user does not have permission', async () => {
    mockAuth(TEST_USERS.OTHER_USER);
    const req = createDeleteRequest();
    const response = await DELETE(req, createAsyncParams(testParty._id.toString()));

    expectForbidden(response);
  });

  it('should not allow editor role to delete party', async () => {
    // Add shared user with editor role
    testParty.sharedWith.push({
      userId: TEST_USERS.EDITOR_USER,
      role: 'editor',
      sharedAt: new Date(),
    });
    await testParty.save();

    mockAuth(TEST_USERS.EDITOR_USER);
    const req = createDeleteRequest();
    const response = await DELETE(req, createAsyncParams(testParty._id.toString()));

    expectForbidden(response);
  });
});