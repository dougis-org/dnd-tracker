
import { GET, POST } from '../route';
import { Party } from '../../../models/Party';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/parties', () => {
  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it('should return an empty array if no parties are found', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost'));
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});

describe('POST /api/parties', () => {
  beforeEach(async () => {
    await Party.deleteMany({});
  });

  it('should create a new party', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    const req = new NextRequest(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Party',
        description: 'A newly created party',
        campaignName: 'New Campaign',
        maxSize: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('New Party');
    expect(data.userId).toBe('user123');
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });
    const req = new NextRequest(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Party',
      }),
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await POST(req);

    expect(response.status).toBe(401);
  });
});
