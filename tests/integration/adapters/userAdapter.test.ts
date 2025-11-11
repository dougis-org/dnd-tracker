/* eslint-env jest */
/* global localStorage */
import { userAdapter } from '@/lib/adapters/userAdapter';

describe('userAdapter - Mock CRUD Operations', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Profile Operations', () => {
    it('should return default profile on first call', async () => {
      const profile = await userAdapter.getProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile.id).toBe(testUserId);
      expect(profile.name).toBeDefined();
      expect(profile.email).toBeDefined();
    });

    it('should update profile successfully', async () => {
      const newData = { name: 'Updated Name', email: 'updated@example.com' };
      const updated = await userAdapter.updateProfile(testUserId, newData);

      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe('updated@example.com');
    });

    it('should persist profile changes to storage', async () => {
      const newData = { name: 'Persistent Name' };
      await userAdapter.updateProfile(testUserId, newData);

      const retrieved = await userAdapter.getProfile(testUserId);
      expect(retrieved.name).toBe('Persistent Name');
    });

    it('should throw on validation error during update', async () => {
      const invalidData = { email: 'not-an-email' };
      await expect(userAdapter.updateProfile(testUserId, invalidData)).rejects.toThrow();
    });

    it('should handle missing profile gracefully', async () => {
      const profile = await userAdapter.getProfile('non-existent-user');
      // Adapter should return a default or throw - test documents actual behavior
      expect(profile).toBeDefined();
    });
  });

  describe('Preferences Operations', () => {
    it('should return default preferences', async () => {
      const prefs = await userAdapter.getPreferences(testUserId);
      expect(prefs).toBeDefined();
      expect(prefs.userId).toBe(testUserId);
      expect(['Novice', 'Intermediate', 'Advanced']).toContain(prefs.experienceLevel);
    });

    it('should update preferences successfully', async () => {
      const newPrefs = { experienceLevel: 'Advanced', preferredRole: 'DM' };
      const updated = await userAdapter.updatePreferences(testUserId, newPrefs);

      expect(updated.experienceLevel).toBe('Advanced');
      expect(updated.preferredRole).toBe('DM');
    });

    it('should persist preferences changes', async () => {
      const newPrefs = { ruleset: '3.5e' };
      await userAdapter.updatePreferences(testUserId, newPrefs);

      const retrieved = await userAdapter.getPreferences(testUserId);
      expect(retrieved.ruleset).toBe('3.5e');
    });

    it('should validate enum values', async () => {
      const invalidPrefs = { experienceLevel: 'InvalidLevel' };
      await expect(userAdapter.updatePreferences(testUserId, invalidPrefs)).rejects.toThrow();
    });
  });

  describe('Notification Operations', () => {
    it('should return default notifications', async () => {
      const notifs = await userAdapter.getNotifications(testUserId);
      expect(notifs).toBeDefined();
      expect(notifs.userId).toBe(testUserId);
      expect(typeof notifs.emailNotifications).toBe('boolean');
      expect(typeof notifs.partyUpdates).toBe('boolean');
      expect(typeof notifs.encounterReminders).toBe('boolean');
    });

    it('should update notification toggles', async () => {
      const newSettings = {
        emailNotifications: false,
        partyUpdates: true,
      };
      const updated = await userAdapter.updateNotifications(testUserId, newSettings);

      expect(updated.emailNotifications).toBe(false);
      expect(updated.partyUpdates).toBe(true);
    });

    it('should persist notification changes', async () => {
      const newSettings = { encounterReminders: false };
      await userAdapter.updateNotifications(testUserId, newSettings);

      const retrieved = await userAdapter.getNotifications(testUserId);
      expect(retrieved.encounterReminders).toBe(false);
    });

    it('should validate boolean values', async () => {
      const invalidSettings = { emailNotifications: 'yes' };
      await expect(userAdapter.updateNotifications(testUserId, invalidSettings)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid profile email on update', async () => {
      await expect(
        userAdapter.updateProfile(testUserId, { email: 'invalid-email' })
      ).rejects.toThrow();
    });

    it('should reject name exceeding 100 characters', async () => {
      const longName = 'A'.repeat(101);
      await expect(userAdapter.updateProfile(testUserId, { name: longName })).rejects.toThrow();
    });

    it('should reject empty name', async () => {
      await expect(userAdapter.updateProfile(testUserId, { name: '' })).rejects.toThrow();
    });

    it('should reject null/undefined values appropriately', async () => {
      // This tests that the adapter validates input
      await expect(userAdapter.updateProfile(testUserId, { name: null })).rejects.toThrow();
    });
  });

  describe('Multiple Users', () => {
    it('should maintain separate data for different users', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      await userAdapter.updateProfile(user1, { name: 'User One' });
      await userAdapter.updateProfile(user2, { name: 'User Two' });

      const profile1 = await userAdapter.getProfile(user1);
      const profile2 = await userAdapter.getProfile(user2);

      expect(profile1.name).toBe('User One');
      expect(profile2.name).toBe('User Two');
    });

    it('should isolate preferences per user', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      await userAdapter.updatePreferences(user1, { experienceLevel: 'Novice' });
      await userAdapter.updatePreferences(user2, { experienceLevel: 'Advanced' });

      const prefs1 = await userAdapter.getPreferences(user1);
      const prefs2 = await userAdapter.getPreferences(user2);

      expect(prefs1.experienceLevel).toBe('Novice');
      expect(prefs2.experienceLevel).toBe('Advanced');
    });
  });

  describe('localStorage Persistence', () => {
    it('should store profile in localStorage with correct key', async () => {
      await userAdapter.updateProfile(testUserId, { name: 'Test Name' });

      const key = `user:profile:${testUserId}`;
      const stored = localStorage.getItem(key);
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('Test Name');
    });

    it('should read profile from localStorage on subsequent calls', async () => {
      const key = `user:profile:${testUserId}`;
      const storedData = {
        id: testUserId,
        name: 'Stored Name',
        email: 'stored@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(storedData));

      const profile = await userAdapter.getProfile(testUserId);
      expect(profile.name).toBe('Stored Name');
    });
  });

  describe('Network Simulation', () => {
    it('should complete within reasonable time (< 2 seconds)', async () => {
      const start = Date.now();
      await userAdapter.getProfile(testUserId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});
