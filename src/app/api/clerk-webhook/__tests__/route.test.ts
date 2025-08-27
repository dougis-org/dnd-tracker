/**
 * @jest-environment node
 */
import { POST } from '../route';
import { Webhook } from 'svix';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/schemas';

jest.mock('svix');
jest.mock('@/lib/mongodb');
jest.mock('@/models/schemas', () => ({
  UserModel: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  })),
}));

describe('Clerk Webhook API', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, CLERK_WEBHOOK_SECRET: 'test_secret' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return 400 if svix headers are missing', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {},
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Error occured -- no svix headers');
  });

  it('should return 400 if webhook verification fails', async () => {
    (Webhook.prototype.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Verification failed');
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test_id',
        'svix-timestamp': 'test_timestamp',
        'svix-signature': 'test_signature',
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Error occured');
  });

  it('should create a new user on user.created event', async () => {
    const mockUser = {
      id: 'user_123',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'http://example.com/image.png',
    };

    (Webhook.prototype.verify as jest.Mock).mockReturnValue({
      type: 'user.created',
      data: mockUser,
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test_id',
        'svix-timestamp': 'test_timestamp',
        'svix-signature': 'test_signature',
      },
      body: JSON.stringify({ type: 'user.created', data: mockUser }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(await res.text()).toBe('User created successfully');
    expect(connectToDatabase).toHaveBeenCalled();
    expect(UserModel).toHaveBeenCalledWith({
      clerkId: 'user_123',
      email: 'test@example.com',
      username: 'Test User',
      imageUrl: 'http://example.com/image.png',
    });
  });

  it('should return 500 if user creation fails', async () => {
    const mockUser = {
      id: 'user_123',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'http://example.com/image.png',
    };

    (Webhook.prototype.verify as jest.Mock).mockReturnValue({
      type: 'user.created',
      data: mockUser,
    });

    (UserModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Database error')),
    }));

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test_id',
        'svix-timestamp': 'test_timestamp',
        'svix-signature': 'test_signature',
      },
      body: JSON.stringify({ type: 'user.created', data: mockUser }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe('Error occured while creating user');
  });

  it('should return 200 for other event types', async () => {
    (Webhook.prototype.verify as jest.Mock).mockReturnValue({
      type: 'user.updated',
      data: {},
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test_id',
        'svix-timestamp': 'test_timestamp',
        'svix-signature': 'test_signature',
      },
      body: JSON.stringify({ type: 'user.updated', data: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
