/**
 * @jest-environment node
 */
import { getUserTier, getUserWithTier, canEditParty, canViewParty } from '../user-context';
import { UserModel as User } from '@/models/User';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('getUserTier', () => {
  it('should return free tier for non-existent user', async () => {
    const tier = await getUserTier('non-existent-user');
    expect(tier).toBe('free');
  });

  it('should return user tier from database', async () => {
    const user = new User({
      clerkId: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
      subscription: {
        tier: 'expert',
        status: 'active',
      },
    });
    await user.save();

    const tier = await getUserTier('test-user-123');
    expect(tier).toBe('expert');
  });

  it('should return free tier if subscription not set', async () => {
    const user = new User({
      clerkId: 'test-user-456',
      email: 'test2@example.com',
      username: 'testuser2',
    });
    await user.save();

    const tier = await getUserTier('test-user-456');
    expect(tier).toBe('free');
  });

  it('should handle database errors gracefully', async () => {
    // Test with invalid user ID that would cause a database error
    const tier = await getUserTier('invalid-clerk-id-that-causes-error');
    expect(tier).toBe('free');
  });
});

describe('getUserWithTier', () => {
  it('should return null user and free tier for non-existent user', async () => {
    const result = await getUserWithTier('non-existent-user');
    expect(result.user).toBeNull();
    expect(result.tier).toBe('free');
  });

  it('should return user data with tier', async () => {
    const user = new User({
      clerkId: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
      subscription: {
        tier: 'master',
        status: 'active',
      },
    });
    await user.save();

    const result = await getUserWithTier('test-user-123');
    expect(result.user).toBeTruthy();
    expect(result.user?.clerkId).toBe('test-user-123');
    expect(result.tier).toBe('master');
  });

  it('should handle database errors gracefully', async () => {
    // Test with invalid user ID that would cause a database error
    const result = await getUserWithTier('invalid-clerk-id-that-causes-error');
    expect(result.user).toBeNull();
    expect(result.tier).toBe('free');
  });
});

describe('canEditParty', () => {
  const testUserId = 'test-user-123';
  const ownerUserId = 'owner-user-456';

  it('should allow owner to edit party', () => {
    const party = {
      userId: testUserId,
      sharedWith: [],
    };

    expect(canEditParty(party, testUserId)).toBe(true);
  });

  it('should allow editor to edit party', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: testUserId,
          role: 'editor',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canEditParty(party, testUserId)).toBe(true);
  });

  it('should not allow viewer to edit party', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: testUserId,
          role: 'viewer',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canEditParty(party, testUserId)).toBe(false);
  });

  it('should not allow non-shared user to edit party', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: 'other-user',
          role: 'editor',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canEditParty(party, testUserId)).toBe(false);
  });

  it('should handle party without sharedWith array', () => {
    const party = {
      userId: ownerUserId,
    };

    expect(canEditParty(party, testUserId)).toBe(false);
    expect(canEditParty(party, ownerUserId)).toBe(true);
  });
});

describe('canViewParty', () => {
  const testUserId = 'test-user-123';
  const ownerUserId = 'owner-user-456';

  it('should allow owner to view party', () => {
    const party = {
      userId: testUserId,
      sharedWith: [],
    };

    expect(canViewParty(party, testUserId)).toBe(true);
  });

  it('should allow shared user to view party (viewer role)', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: testUserId,
          role: 'viewer',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canViewParty(party, testUserId)).toBe(true);
  });

  it('should allow shared user to view party (editor role)', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: testUserId,
          role: 'editor',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canViewParty(party, testUserId)).toBe(true);
  });

  it('should not allow non-shared user to view party', () => {
    const party = {
      userId: ownerUserId,
      sharedWith: [
        {
          userId: 'other-user',
          role: 'viewer',
          sharedAt: new Date(),
        },
      ],
    };

    expect(canViewParty(party, testUserId)).toBe(false);
  });

  it('should handle party without sharedWith array', () => {
    const party = {
      userId: ownerUserId,
    };

    expect(canViewParty(party, testUserId)).toBe(false);
    expect(canViewParty(party, ownerUserId)).toBe(true);
  });
});