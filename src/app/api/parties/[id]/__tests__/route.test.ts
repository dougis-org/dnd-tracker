/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '../route';
import { Party } from '@/models/Party';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

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
  let testParty: any;

  beforeEach(async () => {
    await Party.deleteMany({});
    testParty = await Party.create({
      userId: 'user123',
      name: 'Test Party',
      description: 'Test Description',
      campaignName: 'Test Campaign',
      maxSize: 5,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(401);
  });

  it('should return party if user owns it', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req, { params: Promise.resolve({ id: testParty._id.toString() }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Test Party');
    expect(data.userId).toBe('user123');
  });

  it('should return 404 if party not found', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await GET(req, { params: Promise.resolve({ id: nonExistentId }) });

    expect(response.status).toBe(404);
  });

  it('should return 403 if user does not have access', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'other-user' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(403);
  });
});

describe('PUT /api/parties/[id]', () => {
  let testParty: any;

  beforeEach(async () => {
    await Party.deleteMany({});
    testParty = await Party.create({
      userId: 'user123',
      name: 'Test Party',
      description: 'Test Description',
      campaignName: 'Test Campaign',
      maxSize: 5,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Party' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const response = await PUT(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(401);
  });

  it('should update party if user owns it', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Party',
          description: 'Updated Description',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const response = await PUT(req, { params: Promise.resolve({ id: testParty._id.toString() }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Updated Party');
    expect(data.description).toBe('Updated Description');
  });

  it('should return 404 if party not found', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Party' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await PUT(req, { params: Promise.resolve({ id: nonExistentId }) });

    expect(response.status).toBe(404);
  });

  it('should return 403 if user does not have edit permission', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'other-user' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Party' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const response = await PUT(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(403);
  });

  it('should allow editor role to update party', async () => {
    // Add shared user with editor role
    testParty.sharedWith.push({
      userId: 'editor-user',
      role: 'editor',
      sharedAt: new Date(),
    });
    await testParty.save();

    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'editor-user' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Editor Updated Party' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const response = await PUT(req, { params: Promise.resolve({ id: testParty._id.toString() }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Editor Updated Party');
  });

  it('should return 400 for invalid data', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }), // Empty name should be invalid
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const response = await PUT(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(400);
  });
});

describe('DELETE /api/parties/[id]', () => {
  let testParty: any;

  beforeEach(async () => {
    await Party.deleteMany({});
    testParty = await Party.create({
      userId: 'user123',
      name: 'Test Party',
      description: 'Test Description',
      campaignName: 'Test Campaign',
      maxSize: 5,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(new Request('http://localhost', { method: 'DELETE' }));
    const response = await DELETE(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(401);
  });

  it('should delete party if user owns it', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost', { method: 'DELETE' }));
    const response = await DELETE(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(204);
    
    // Verify party was deleted
    const deletedParty = await Party.findById(testParty._id);
    expect(deletedParty).toBeNull();
  });

  it('should return 404 if party not found', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost', { method: 'DELETE' }));
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await DELETE(req, { params: Promise.resolve({ id: nonExistentId }) });

    expect(response.status).toBe(404);
  });

  it('should return 403 if user does not have permission', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'other-user' });
    const req = new NextRequest(new Request('http://localhost', { method: 'DELETE' }));
    const response = await DELETE(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(403);
  });

  it('should not allow editor role to delete party', async () => {
    // Add shared user with editor role
    testParty.sharedWith.push({
      userId: 'editor-user',
      role: 'editor',
      sharedAt: new Date(),
    });
    await testParty.save();

    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'editor-user' });
    const req = new NextRequest(new Request('http://localhost', { method: 'DELETE' }));
    const response = await DELETE(req, { params: Promise.resolve({ id: testParty._id.toString() }) });

    expect(response.status).toBe(403);
  });
});