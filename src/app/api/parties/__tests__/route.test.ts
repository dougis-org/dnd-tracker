/**
 * @jest-environment node
 */
import { GET, POST } from '../route';
import { Party } from '@/models/Party';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Node.js v24 has built-in fetch support - no polyfill needed
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/parties', () => {
  beforeEach(async () => {
    await Party.deleteMany({});
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it('should return an empty array if no parties are found', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return parties owned by the user', async () => {
    // Create test parties
    const party1 = await Party.create({
      userId: 'user123',
      name: 'User Party 1',
      description: 'Test Description 1',
      campaignName: 'Test Campaign 1',
      maxSize: 5,
    });

    const party2 = await Party.create({
      userId: 'user123',
      name: 'User Party 2',
      description: 'Test Description 2',
      campaignName: 'Test Campaign 2',
      maxSize: 6,
    });

    // Create party for different user (should not be returned)
    await Party.create({
      userId: 'other-user',
      name: 'Other User Party',
      description: 'Other Description',
      campaignName: 'Other Campaign',
      maxSize: 4,
    });

    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.map((p: any) => p.name)).toContain('User Party 1');
    expect(data.map((p: any) => p.name)).toContain('User Party 2');
    expect(data.map((p: any) => p.name)).not.toContain('Other User Party');
  });

  it('should return parties shared with the user', async () => {
    // Create party shared with user
    const sharedParty = await Party.create({
      userId: 'owner-user',
      name: 'Shared Party',
      description: 'Shared Description',
      campaignName: 'Shared Campaign',
      maxSize: 5,
      sharedWith: [
        {
          userId: 'user123',
          role: 'viewer',
          sharedAt: new Date(),
        },
      ],
    });

    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Shared Party');
    expect(data[0].userId).toBe('owner-user');
  });

  it('should return both owned and shared parties', async () => {
    // Create owned party
    await Party.create({
      userId: 'user123',
      name: 'Owned Party',
      description: 'Owned Description',
      campaignName: 'Owned Campaign',
      maxSize: 5,
    });

    // Create shared party
    await Party.create({
      userId: 'owner-user',
      name: 'Shared Party',
      description: 'Shared Description',
      campaignName: 'Shared Campaign',
      maxSize: 4,
      sharedWith: [
        {
          userId: 'user123',
          role: 'editor',
          sharedAt: new Date(),
        },
      ],
    });

    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    const partyNames = data.map((p: any) => p.name);
    expect(partyNames).toContain('Owned Party');
    expect(partyNames).toContain('Shared Party');
  });
});

describe('POST /api/parties', () => {
  beforeEach(async () => {
    await Party.deleteMany({});
  });

  it('should create a new party with all fields', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Party',
          description: 'A newly created party',
          campaignName: 'New Campaign',
          maxSize: 5,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('New Party');
    expect(data.description).toBe('A newly created party');
    expect(data.campaignName).toBe('New Campaign');
    expect(data.maxSize).toBe(5);
    expect(data.userId).toBe('user123');
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
  });

  it('should create a party with only required fields', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Minimal Party',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Minimal Party');
    expect(data.userId).toBe('user123');
    expect(data.maxSize).toBe(5); // Default value
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Party',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should return 500 for invalid JSON', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);

    expect(response.status).toBe(500);
  });

  it('should handle missing name gracefully', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Party without name',
          campaignName: 'Test Campaign',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);

    // This should fail validation in mongoose due to required name field
    expect(response.status).toBe(500);
  });

  it('should persist party in database', async () => {
    (auth as unknown as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Persistent Party',
          description: 'Test persistence',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);

    // Verify party was saved to database
    const savedParty = await Party.findById(data._id);
    expect(savedParty).toBeTruthy();
    expect(savedParty!.name).toBe('Persistent Party');
    expect(savedParty!.userId).toBe('user123');
  });
});
